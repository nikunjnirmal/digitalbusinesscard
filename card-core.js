/*
 * Shared card logic used by the web page (index.html) and the build script
 * (scripts/build.mjs), so the contact file the page makes and the one the
 * build makes are always identical.
 */
(function (root) {
  "use strict";

  // [long name used in card.json, short key used in share links]
  const FIELDS = [
    ["firstName", "f"], ["lastName", "l"], ["jobTitle", "j"], ["company", "c"],
    ["phone", "p"], ["email", "e"], ["address", "a"], ["website", "w"],
    ["linkedin", "li"], ["twitter", "x"], ["instagram", "ig"], ["facebook", "fb"],
    ["theme", "t"]
  ];

  const THEMES = {
    indigo:  ["#4f46e5", "#7c3aed"],
    ocean:   ["#0369a1", "#0891b2"],
    emerald: ["#047857", "#0d9488"],
    sunset:  ["#e11d48", "#f97316"],
    gold:    ["#b45309", "#d97706"],
    slate:   ["#1f2937", "#475569"]
  };

  // Keep only known, non-empty fields; drop anything unsafe.
  function clean(d) {
    const out = {};
    if (!d || typeof d !== "object") return out;
    for (const [k] of FIELDS) {
      const v = d[k];
      if (typeof v === "string" && v.trim()) out[k] = v.trim().slice(0, 500);
    }
    if (out.theme && !THEMES[out.theme]) delete out.theme;
    for (const k of ["photo", "logo"]) if (validImage(d[k])) out[k] = d[k].trim();
    return out;
  }

  // Photo/logo: an embedded image data URL (from upload) or an http(s)/relative image path.
  function validImage(p) {
    if (typeof p !== "string") return false;
    p = p.trim();
    if (p.startsWith("data:")) return p.length < 1500000 && /^data:image\/(jpeg|png|webp|gif|svg\+xml);base64,[A-Za-z0-9+/=]+$/.test(p);
    if (p.length > 2000 || /[\s"'<>]/.test(p)) return false;
    return /^https?:\/\//i.test(p) || !/^[a-z][a-z0-9+.-]*:/i.test(p);
  }

  function safeUrl(v) {
    v = (v || "").trim();
    if (!v) return null;
    if (/^[a-z][a-z0-9+.-]*:/i.test(v) && !/^https?:\/\//i.test(v)) return null; // block javascript: etc.
    if (!/^https?:\/\//i.test(v)) v = "https://" + v.replace(/^\/+/, "");
    try { return new URL(v).href; } catch { return null; }
  }

  function socialUrl(v, domainRe, base) {
    v = (v || "").trim();
    if (!v) return null;
    if (domainRe.test(v)) return safeUrl(v);
    const handle = v.replace(/^@/, "").replace(/^\/+|\/+$/g, "");
    if (!/^[\w.\-\/]+$/.test(handle)) return safeUrl(v);
    return base + handle;
  }

  const links = {
    website:   v => safeUrl(v),
    linkedin:  v => socialUrl(v, /linkedin\.com/i, "https://www.linkedin.com/in/"),
    twitter:   v => socialUrl(v, /(twitter|x)\.com/i, "https://x.com/"),
    instagram: v => socialUrl(v, /instagram\.com/i, "https://www.instagram.com/"),
    facebook:  v => socialUrl(v, /(facebook|fb)\.com/i, "https://www.facebook.com/")
  };

  function fullName(d) { return [d.firstName, d.lastName].filter(Boolean).join(" "); }

  function fileSlug(d) {
    return (fullName(d) || d.company || "contact").replace(/[^\p{L}\p{N} _-]+/gu, "").trim().replace(/\s+/g, "_") || "contact";
  }

  /* ---------- vCard ---------- */
  function vEsc(s) { return String(s).replace(/\\/g, "\\\\").replace(/\n/g, "\\n").replace(/,/g, "\\,").replace(/;/g, "\\;"); }

  // vCard lines must be folded at 75 chars; continuation lines start with a space.
  function fold(line) {
    if (line.length <= 75) return line;
    const parts = [line.slice(0, 75)];
    for (let i = 75; i < line.length; i += 74) parts.push(" " + line.slice(i, i + 74));
    return parts.join("\r\n");
  }

  // photoJpeg: optional "data:image/jpeg;base64,..." string.
  function buildVcf(d, photoJpeg) {
    const L = ["BEGIN:VCARD", "VERSION:3.0"];
    L.push(`N:${vEsc(d.lastName || "")};${vEsc(d.firstName || "")};;;`);
    L.push(`FN:${vEsc(fullName(d) || d.company || "Contact")}`);
    if (d.company) L.push(`ORG:${vEsc(d.company)}`);
    if (d.jobTitle) L.push(`TITLE:${vEsc(d.jobTitle)}`);
    if (d.phone) L.push(`TEL;TYPE=CELL,VOICE:${vEsc(d.phone)}`);
    if (d.email) L.push(`EMAIL;TYPE=INTERNET,WORK:${vEsc(d.email)}`);
    if (d.address) L.push(`ADR;TYPE=WORK:;;${vEsc(d.address.replace(/\s*\n\s*/g, ", "))};;;;`);
    const web = links.website(d.website);
    if (web) L.push(`URL;TYPE=WORK:${web}`);
    let n = 1;
    for (const [k, label] of [["linkedin", "LinkedIn"], ["twitter", "X"], ["instagram", "Instagram"], ["facebook", "Facebook"]]) {
      const u = links[k](d[k]);
      if (!u) continue;
      L.push(`item${n}.URL:${u}`, `item${n}.X-ABLabel:${label}`);
      L.push(`X-SOCIALPROFILE;TYPE=${label.toLowerCase()}:${u}`);
      n++;
    }
    if (photoJpeg) L.push(fold("PHOTO;ENCODING=b;TYPE=JPEG:" + photoJpeg.split(",")[1]));
    L.push("END:VCARD");
    return L.join("\r\n") + "\r\n";
  }

  const api = { FIELDS, THEMES, clean, validImage, safeUrl, socialUrl, links, fullName, fileSlug, vEsc, fold, buildVcf };
  if (typeof module === "object" && module.exports) module.exports = api;
  else root.CardCore = api;
})(typeof globalThis !== "undefined" ? globalThis : this);
