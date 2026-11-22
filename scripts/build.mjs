#!/usr/bin/env node
/*
 * Builds the site into dist/:
 *   - copies the site files
 *   - if card.json exists, also creates:
 *       contact.vcf    the file behind "Add to Contacts" (works in every phone browser)
 *       og-image.*     the picture shown in link previews
 *     and adds your name, title and picture to index.html so shared links
 *     show a proper preview in iMessage, WhatsApp, LinkedIn, Slack, etc.
 *
 * Usage: node scripts/build.mjs [--site-url https://you.github.io/card/]
 * The site URL is also read from Netlify (URL) or Cloudflare Pages (CF_PAGES_URL).
 * No dependencies; needs Node 18+.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const DIST = path.join(ROOT, "dist");
const core = createRequire(import.meta.url)(path.join(ROOT, "card-core.js"));

// Files and folders that are part of the repository but not the website.
const SKIP = new Set([".git", ".github", ".gitignore", ".gitattributes", "scripts", "dist", "node_modules",
  "README.md", "LICENSE", "netlify.toml", "requirements.md.txt"]);

/* ---------- options ---------- */
const argv = process.argv.slice(2);
const argUrl = argv.includes("--site-url") ? argv[argv.indexOf("--site-url") + 1] : "";
let siteUrl = argUrl || process.env.SITE_URL || process.env.URL || process.env.CF_PAGES_URL || "";
if (siteUrl && !siteUrl.endsWith("/")) siteUrl += "/";

/* ---------- copy site ---------- */
fs.rmSync(DIST, { recursive: true, force: true });
fs.mkdirSync(DIST);
for (const name of fs.readdirSync(ROOT)) {
  if (SKIP.has(name) || name.endsWith(".md")) continue;
  fs.cpSync(path.join(ROOT, name), path.join(DIST, name), { recursive: true });
}

/* ---------- card ---------- */
// Browsers rename repeat downloads ("card (1).json", "card-2.json"); accept those too.
let cardPath = path.join(ROOT, "card.json");
if (!fs.existsSync(cardPath)) {
  const renamed = fs.readdirSync(ROOT).filter(n => /^card[\s_-]*(\(\d+\)|\d+)?\.json$/i.test(n));
  if (renamed.length > 1) {
    console.error(`Found several card files (${renamed.join(", ")}). Keep one and name it card.json.`);
    process.exit(1);
  }
  if (!renamed.length) {
    console.log("No card.json yet: built the site without a card (visitors see the builder).");
    process.exit(0);
  }
  cardPath = path.join(ROOT, renamed[0]);
  console.log(`Using ${renamed[0]} as card.json.`);
  fs.rmSync(path.join(DIST, renamed[0]), { force: true });
  fs.copyFileSync(cardPath, path.join(DIST, "card.json"));
}
let card;
try {
  card = core.clean(JSON.parse(fs.readFileSync(cardPath, "utf8")));
} catch (e) {
  console.error(`card.json isn't valid JSON: ${e.message}`);
  process.exit(1);
}
if (!card.firstName && !card.company) {
  console.error("card.json needs at least a firstName or company.");
  process.exit(1);
}

// Read an image from card.json: a data URL or a file in the repository.
function readImage(src) {
  if (!src) return null;
  const m = src.match(/^data:image\/(jpeg|png|webp|gif|svg\+xml);base64,(.+)$/);
  if (m) return { type: m[1], bytes: Buffer.from(m[2], "base64") };
  if (/^https?:\/\//i.test(src)) return { url: src };
  const file = path.join(ROOT, src.replace(/^\.?\//, ""));
  if (!file.startsWith(ROOT) || !fs.existsSync(file)) { console.warn(`Image not found: ${src}`); return null; }
  const ext = path.extname(file).slice(1).toLowerCase().replace("jpg", "jpeg").replace("svg", "svg+xml");
  return { type: ext, bytes: fs.readFileSync(file), path: src.replace(/^\.?\//, "") };
}
const photo = readImage(card.photo);
const logo = readImage(card.logo);

// contact.vcf (JPEG photos only: that's what the vCard format supports everywhere)
const jpegPhoto = photo && photo.type === "jpeg" && photo.bytes ? "data:image/jpeg;base64," + photo.bytes.toString("base64") : null;
fs.writeFileSync(path.join(DIST, "contact.vcf"), core.buildVcf(card, jpegPhoto));

// Link-preview image: photo first, then logo. Previews don't support SVG.
let ogImage = null;
for (const img of [photo, logo]) {
  if (!img || img.type === "svg+xml") continue;
  if (img.url) { ogImage = img.url; break; }
  if (img.path) { ogImage = siteUrl + img.path; break; }
  const name = "og-image." + (img.type === "jpeg" ? "jpg" : img.type);
  fs.writeFileSync(path.join(DIST, name), img.bytes);
  ogImage = siteUrl + name;
  break;
}

/* ---------- link-preview tags ---------- */
const esc = s => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const name = core.fullName(card) || card.company;
const role = [card.jobTitle, card.company && core.fullName(card) ? card.company : ""].filter(Boolean).join(" at ");
const title = role ? `${name} · ${role}` : name;
const description = `${role ? role + ". " : ""}Tap to view my digital business card and save my contact.`;

const tags = [
  `<meta property="og:type" content="profile">`,
  `<meta property="og:title" content="${esc(title)}">`,
  `<meta property="og:description" content="${esc(description)}">`,
  siteUrl && `<meta property="og:url" content="${esc(siteUrl)}">`,
  siteUrl && `<link rel="canonical" href="${esc(siteUrl)}">`,
  ogImage && `<meta property="og:image" content="${esc(ogImage)}">`,
  `<meta name="twitter:card" content="summary">`,
  `<meta name="twitter:title" content="${esc(title)}">`,
  `<meta name="twitter:description" content="${esc(description)}">`,
  ogImage && `<meta name="twitter:image" content="${esc(ogImage)}">`
].filter(Boolean).join("\n");

const indexPath = path.join(DIST, "index.html");
let html = fs.readFileSync(indexPath, "utf8");
html = html
  .replace(/<title>[\s\S]*?<\/title>/, `<title>${esc(title)}</title>`)
  .replace(/<meta name="description" content="[^"]*">/, `<meta name="description" content="${esc(description)}">`)
  .replace("</head>", `<!-- link previews: generated by scripts/build.mjs from card.json -->\n${tags}\n</head>`);
fs.writeFileSync(indexPath, html);

console.log(`Built card for ${name}`);
console.log(`  contact.vcf   ${jpegPhoto ? "with photo" : "no photo"}`);
console.log(`  preview       "${title}"${ogImage ? ` + image ${ogImage}` : " (no image)"}`);
if (!siteUrl) console.log("  note: no site URL given, so preview links are relative. Pass --site-url for best results.");
