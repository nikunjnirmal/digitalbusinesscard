# Digital Business Card

A free digital business card you host yourself. You get a page with your details, a QR code that never changes (safe to print on paper cards), and an **Add to Contacts** button that works on iPhone and Android.

There's no app, no account and no monthly fee. It runs on free GitHub Pages hosting, and you don't need to know how to code.

## What you get

- **A card page** showing only the details you fill in: name, job title, company and logo, profile photo, phone, email, office address, web address, LinkedIn, and your business's X, Instagram and Facebook.
- **Add to Contacts**: one tap saves you to the visitor's phone, including your photo.
- **A permanent QR code** to print. When your details change, the QR code stays the same.
- **Share and show**: share your link, or tap **QR code** on your card to show it full screen for someone to scan.
- **Link previews**: when you send your link in iMessage, WhatsApp or LinkedIn, it shows your name, title and photo.
- **Privacy**: the form runs in your browser. Nothing is sent anywhere until you publish your card.

## Set up your own card (about 10 minutes)

You need a free [GitHub](https://github.com/signup) account.

### 1. Copy this project

On this project's GitHub page, click the green **Use this template** button, then **Create a new repository**.
- **Repository name:** choose a short name such as `card`. It becomes part of your link.
- Leave it **Public**, since free GitHub Pages requires that.
- Click **Create repository**.

### 2. Turn on your website

In your new repository, go to **Settings → Pages**. Under **Build and deployment → Source**, choose **GitHub Actions**.

From now on, every change you make to the repository (like uploading `card.json` in step 3) publishes your site automatically. You never need to run anything by hand.

To publish the site for the first time before you've uploaded anything:
1. Open the **Actions** tab.
2. Click **Publish card** in the list of workflows on the left. On a phone, open the **All workflows** menu at the top to find it.
3. Click the **Run workflow** button on the right, then the green **Run workflow** button.

Your site is live at `https://<your-username>.github.io/<repository-name>/` about a minute later.

### 3. Create your card

1. Open your site. You'll see the card builder.
2. Fill in your details, add your photo and logo, and pick a color.
3. Click **Create my card**.
4. Under **Want a QR code that never changes?**, click **Download card.json**.
5. Click **Open GitHub upload page**, drag `card.json` onto the page, and click **Commit changes**.

About a minute later, your site's main address shows your card instead of the builder.

### 4. Print your QR code

In the builder, click **Permanent QR (SVG)** for print shops, or **(PNG)** for anything else.

**Before ordering prints:**
- Print the QR code at least **2 cm (0.8 in)** wide, and keep the white border around it.
- Print one proof and scan it with an iPhone and an Android phone.

### Updating your card later

Go to `https://<your-username>.github.io/<repository-name>/#edit`. The builder opens with your current details filled in. Change what you need, download the new `card.json`, and upload it again in the same way. Your printed QR code keeps working.

## Good to know

- **Your details are public.** Anyone can read your card, and because the repository is public, anyone can also read `card.json` on GitHub. Only include what you'd print on a paper card. A work phone and email are a good idea.
- **Keep your web address.** The QR code points to your site's address. If you rename the repository or delete it, printed QR codes stop working. For the longest-lasting address, add your own domain under **Settings → Pages → Custom domain**.
- **Share links vs your permanent link.** The builder also gives you a share link containing all your details, with no upload needed. It's handy for trying things out. But it changes whenever your details change, and it can't include your photo or logo. Use your site's main address for anything printed.

## Other free hosts

- **Netlify:** click [![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=https://github.com/nikunjnirmal/digitalbusinesscard). Netlify copies the project into your GitHub account and publishes it. Add `card.json` to that repository as in step 3.
- **Cloudflare Pages:** connect your repository and set the build command to `node scripts/build.mjs`, with `dist` as the output folder.
- **Any static host, or Netlify Drop:** these don't run the build step. Upload `index.html`, `card-core.js`, `qrcode.min.js` and `card.json`. Also upload `contact.vcf`, which you can download from the link under the permanent-QR steps in the builder. Without the build step, link previews show a generic title.

## How it works (for developers)

| File | Purpose |
|---|---|
| `index.html` | The whole app: card page and builder |
| `card-core.js` | Shared logic: field cleanup, link handling and contact-file (vCard) generation. Used by both the page and the build script. |
| `qrcode.min.js` | QR code library ([qrcode-generator](https://github.com/kazuhikoarase/qrcode-generator), MIT), stored locally |
| `scripts/build.mjs` | Copies the site to `dist/`. From `card.json` it creates `contact.vcf` and `og-image.*`, and adds link-preview tags to `index.html`. Needs Node 18 or later and has no dependencies. |
| `.github/workflows/deploy.yml` | Runs the build and publishes to GitHub Pages on every change |
| `netlify.toml` | Build settings for Netlify |

**Pages and links:**

| URL | Shows |
|---|---|
| `/` | Your card if `card.json` exists, otherwise the builder |
| `/#edit` | The builder, filled in from `card.json` |
| `/#c=<data>` | A card stored entirely in the link |

**Add to Contacts** uses the hosted `contact.vcf` when it matches the card, which works in every browser, including in-app browsers like LinkedIn and Instagram. Without it, iPhone Safari opens the contact directly from the page, and other browsers download a generated `.vcf` file.

**Run it locally:**

```bash
node scripts/build.mjs --site-url http://localhost:8000/
cd dist && python -m http.server 8000
```

### `card.json` format

Every field is optional except `firstName` (or `company`). `theme` is one of `indigo`, `ocean`, `emerald`, `sunset`, `gold` or `slate`. `photo` and `logo` hold either embedded image data, which the builder fills in, or a path to an image in the repository, such as `"photo.jpg"`.

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
  "twitter": "@acme",
  "instagram": "@acme",
  "facebook": "facebook.com/acme",
  "theme": "indigo",
  "photo": "photo.jpg",
  "logo": "logo.png"
}
```

## License

MIT. See [LICENSE](LICENSE). You're free to use, change and share it.
