# landing

Single-page landing for a web development studio. Plain HTML, CSS and vanilla JS: no frameworks, no build step.

## Run

Open `index.html` in a browser, or serve the folder:

```bash
npx serve .        # or: python3 -m http.server
```

## Files

- `index.html` – page markup (hero, services, process, about, FAQ, contact)
- `styles.css` – all styles, dark/light themes, responsive breakpoints
- `i18n.js` – translations for English, Russian and Latvian
- `script.js` – language switcher, theme toggle, mobile menu, scroll reveal, contact form

## Languages

Text is marked with `data-i18n="key"` (plus `data-i18n-placeholder` / `data-i18n-aria`).
Add or edit strings in `i18n.js`. The language is picked from `?lang=ru`, then the saved choice,
then the browser language, falling back to English.

## Before going live

- Brand name **Brightcode** is a placeholder: search and replace it in `index.html` and `i18n.js`.
- Set your email in `CONTACT_EMAIL` at the top of `script.js`.
- The contact form opens the visitor's mail app (`mailto:`). To receive submissions directly,
  replace that block in `script.js` with a `fetch()` POST to your API or a form service.
- Hero stats (40+ projects, Lighthouse 98, etc.) are sample numbers: adjust to your real ones.
