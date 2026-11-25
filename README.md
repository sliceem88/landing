# landing

Single-page landing for a web development company. Plain HTML, CSS and vanilla JS: no frameworks, no runtime dependencies.

## Run

Serve the folder (language links use folder URLs like `/ru/`, so a server works better than opening the file):

```bash
npx serve .        # or: python3 -m http.server
```

## Structure

| Path | What it is |
| --- | --- |
| `src/template.html` | Page markup. Translatable text is marked with `data-i18n="key"` |
| `src/i18n.js` | All page text in English, Russian and Latvian |
| `scripts/build.js` | Generates the static pages, `sitemap.xml` and `robots.txt` (Node, zero dependencies) |
| `index.html`, `ru/index.html`, `lv/index.html` | Generated pages. Don't edit these directly |
| `styles.css`, `script.js` | Styles and behaviour shared by all pages |
| `favicon.svg`, `apple-touch-icon.png`, `og-image.png` | Icons and social preview image |

After changing text or markup, regenerate:

```bash
node scripts/build.js
```

## Why one page per language

Search engines index one language per URL. Each language therefore has its own fully translated static page
(`/`, `/ru/`, `/lv/`) with its own title, description, canonical link, `hreflang` alternates, Open Graph tags
and JSON-LD (`ProfessionalService` + `FAQPage`). The language switcher is a set of normal links.

## Before going live

1. Set `SITE_URL`, `BRAND` and `EMAIL` at the top of `scripts/build.js`, and `CONTACT_EMAIL` in `script.js`, then rebuild.
2. Replace the placeholder brand "AVerDemTech" in `src/i18n.js`, `src/template.html` and `og-image.png`.
3. Adjust the sample hero numbers (40+ projects, Lighthouse 98, −12h/week) to real ones.
4. Submit `https://your-domain/sitemap.xml` in Google Search Console (and Bing Webmaster Tools).
5. The contact form opens the visitor's mail app (`mailto:`). To receive submissions directly,
   replace that block in `script.js` with a `fetch()` POST to your API.
