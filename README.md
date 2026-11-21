# Digital Business Card

A single-page web app for making a digital business card. It runs as a static site, so free hosts such as GitHub Pages, Netlify or Cloudflare Pages can serve it. It has no server, database or build step.

## Features

- **Profile photo upload**: the photo is cropped to a square and resized in the browser. It's stored in `card.json`, so it appears on the permanent link and on the saved contact. Share links (`#c=`) can't hold pictures, so they show initials instead.
- **Company logo upload**: the logo keeps its shape and transparency and is resized in the browser. It's shown on a white badge at the top of the card and stored in `card.json`, just like the photo. Share links show the company name instead.
- **Builder form** with fields for first and last name, job title, company, phone, email, office address, company website, LinkedIn, X/Twitter, Instagram and Facebook. A live preview updates as you type, and you can choose from six color themes.
- **The card shows only the fields you fill in.**
- **Share it** with a link (the native share sheet on phones) or a QR code, and use the **QR code** button on the card to show it full screen to someone.
- **One-tap Add to Contacts**: the page builds a vCard (`.vcf`) with all the details and social profiles.
  - iOS (Safari or Chrome) opens the "Create New Contact" sheet directly.
  - Android downloads the `.vcf` file. Tap the download notification to open it in Contacts.
- **Permanent QR code** for printing (see below). You can download it as PNG, or as SVG for sharp print output.
- Everything happens in the browser and nothing gets uploaded.

## Files

| File | Purpose |
|---|---|
| `index.html` | The whole app (builder and card view) |
| `qrcode.min.js` | QR code library ([qrcode-generator](https://github.com/kazuhikoarase/qrcode-generator), MIT). It's stored locally so the site doesn't depend on a CDN. |
| `card.json` | *(you add this)* Your card details for the permanent link |

## Two ways to share

1. **Self-contained link** (`https://your-site/#c=...`): your details are encoded in the link, so anyone can make a card without touching the hosting. Editing your details gives you a new link and a new QR code.
2. **Permanent link** (`https://your-site/`), which is **the option to use for printed cards**. Put a `card.json` next to `index.html`, and the site's main address then always shows your card. When your details change, replace `card.json`. The printed QR code points to the main address, so it never changes.

## Host it for free on GitHub Pages (about 5 minutes)

1. Create a free account at <https://github.com> if you don't have one.
2. Create a **new public repository**, for example `card`.
3. Upload `index.html` and `qrcode.min.js` (**Add file → Upload files → Commit**).
4. Go to **Settings → Pages**. Under "Build and deployment", set **Source: Deploy from a branch**, choose **Branch: `main` / `(root)`**, and click **Save**.
5. After about a minute your site is live at `https://<your-username>.github.io/card/`.
6. Open that address. The builder appears because no `card.json` exists yet. Fill in your details and click **Create my card**.
7. For a permanent QR code:
   - Click **Download card.json** and upload it to the same repository.
   - Click **Permanent QR (SVG)** or **(PNG)** and give that file to your printer.
   - Your address `https://<your-username>.github.io/card/` now shows your card. To change your details later, open `…/card/#edit`, update the form, download a new `card.json`, and upload it over the old one. The printed QR keeps working.

**Other free hosts:** [Netlify Drop](https://app.netlify.com/drop) (drag the folder onto the page) or [Cloudflare Pages](https://pages.cloudflare.com/) work the same way.

**Note on permanence:** the QR code stays valid as long as the site address does. If you have a custom domain, use it for maximum durability, since it survives a move to a different host.

## Useful URLs

| URL | What it shows |
|---|---|
| `/` | Your card if `card.json` exists, otherwise the builder |
| `/#edit` | The builder, pre-filled from `card.json` if it exists |
| `/#c=<data>` | A card encoded in the link |

## Run locally

Opening `index.html` directly works for trying the builder. `card.json` loading needs a web server, though:

```bash
python -m http.server 8000
# then open http://localhost:8000
```

Links and QR codes made from a local copy point to your own computer, so create the real ones from the published site.

## `card.json` format

Every field is optional except `firstName`. `theme` can be `indigo`, `ocean`, `emerald`, `sunset`, `gold` or `slate`.

`photo` holds the uploaded picture as embedded image data (`"data:image/jpeg;base64,..."`), which the builder fills in for you. It can also be a path to an image file in the repository, such as `"photo.jpg"`. `logo` works the same way, for example `"logo.png"` or `"logo.svg"`.

```json
{
  "firstName": "Jane",
  "lastName": "Doe",
  "jobTitle": "Head of Product",
  "company": "Acme Inc.",
  "phone": "+1 555 123 4567",
  "email": "jane@acme.com",
  "address": "123 Market St, Suite 400, San Francisco, CA 94105",
  "website": "acme.com",
  "linkedin": "linkedin.com/in/janedoe",
  "twitter": "@janedoe",
  "instagram": "@janedoe",
  "facebook": "facebook.com/janedoe",
  "theme": "indigo",
  "photo": "photo.jpg",
  "logo": "logo.png"
}
```
