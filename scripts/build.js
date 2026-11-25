#!/usr/bin/env node
/**
 * Generates one static, fully translated HTML page per language:
 *   /index.html (en), /ru/index.html, /lv/index.html
 * Each page has its own <title>, meta description, canonical, hreflang links,
 * Open Graph tags and JSON-LD, so search engines can index every language.
 *
 * No dependencies. Run after editing src/template.html or src/i18n.js:
 *   node scripts/build.js
 */
'use strict';
const fs = require('fs');
const path = require('path');

/* ---- Site settings: change these before going live ---- */
const SITE_URL = 'https://example.com'; // no trailing slash
const BRAND = 'AVerDemTech';
const EMAIL = 'averdemtech@gmail.com';
const LANGS = ['lv', 'en', 'ru'];
const DEFAULT_LANG = 'lv';
/* ------------------------------------------------------- */

const ROOT = path.join(__dirname, '..');
const I18N = require(path.join(ROOT, 'src/i18n.js'));
const template = fs.readFileSync(path.join(ROOT, 'src/template.html'), 'utf8');

const dir = (lang) => (lang === DEFAULT_LANG ? '' : lang + '/');
const url = (lang) => `${SITE_URL}/${dir(lang)}`;
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const plain = (html) => String(html).replace(/<[^>]+>/g, '').replace(/&amp;/g, '&');

function build(lang) {
  const t = (key) => {
    const v = (I18N[lang] && I18N[lang][key]) ?? I18N[DEFAULT_LANG][key];
    if (v === undefined) throw new Error(`Missing translation key "${key}"`);
    return v;
  };
  const base = lang === DEFAULT_LANG ? '' : '../';

  let html = template;

  // 1. Element content: <tag ... data-i18n="key" ...>content</tag>
  //    (content must not contain another element with the same tag name)
  html = html.replace(/<(\w+)(\s[^>]*?)data-i18n="([^"]+)"([^>]*)>([\s\S]*?)<\/\1>/g,
    (m, tag, before, key, after) => `<${tag}${before}${after.trim() ? '' : ''}${after}>${t(key)}</${tag}>`.replace(/\s+>/, '>'));

  // 2. Attributes
  html = html.replace(/data-i18n-placeholder="([^"]+)"(\s*)placeholder="[^"]*"/g,
    (m, key, sp) => `placeholder="${esc(plain(t(key)))}"`);
  html = html.replace(/data-i18n-aria="([^"]+)"(\s*)aria-label="[^"]*"/g,
    (m, key) => `aria-label="${esc(plain(t(key)))}"`);
  html = html.replace(/\{\{t:([\w.]+)\}\}/g, (m, key) => esc(plain(t(key))));

  // 3. SEO head
  const title = t('meta.title');
  const desc = t('meta.description');
  const alternates = LANGS.map((l) => `  <link rel="alternate" hreflang="${l}" href="${url(l)}">`).join('\n') +
    `\n  <link rel="alternate" hreflang="x-default" href="${url(DEFAULT_LANG)}">`;
  const ogAlt = LANGS.filter((l) => l !== lang).map((l) => `  <meta property="og:locale:alternate" content="${I18N[l]['og.locale']}">`).join('\n');
  const seo = `  <title>${esc(title)}</title>
  <meta name="description" content="${esc(desc)}">
  <meta name="robots" content="index, follow, max-image-preview:large">
  <link rel="canonical" href="${url(lang)}">
${alternates}
  <meta name="theme-color" content="#0b0d12">
  <meta property="og:type" content="website">
  <meta property="og:site_name" content="${BRAND}">
  <meta property="og:url" content="${url(lang)}">
  <meta property="og:title" content="${esc(title)}">
  <meta property="og:description" content="${esc(desc)}">
  <meta property="og:image" content="${SITE_URL}/og-image.png">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  <meta property="og:locale" content="${t('og.locale')}">
${ogAlt}
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${esc(title)}">
  <meta name="twitter:description" content="${esc(desc)}">
  <meta name="twitter:image" content="${SITE_URL}/og-image.png">`;

  // 4. Structured data: the business, its services, and the FAQ
  const services = ['s1', 's2', 's3', 's4', 's5', 's6'].map((k) => ({
    '@type': 'Offer',
    itemOffered: { '@type': 'Service', name: plain(t(k + '.title')), description: plain(t(k + '.text')) },
  }));
  const jsonld = [
    {
      '@context': 'https://schema.org',
      '@type': 'ProfessionalService',
      '@id': `${SITE_URL}/#organization`,
      name: BRAND,
      url: url(lang),
      logo: `${SITE_URL}/apple-touch-icon.png`,
      image: `${SITE_URL}/og-image.png`,
      description: plain(desc),
      email: EMAIL,
      areaServed: ['LV', 'EU'],
      availableLanguage: ['English', 'Russian', 'Latvian'],
      knowsAbout: ['Web development', 'Next.js', 'AdonisJS', 'PostgreSQL', 'Business process automation', 'Web performance optimization'],
      hasOfferCatalog: { '@type': 'OfferCatalog', name: plain(t('jsonld.service')), itemListElement: services },
    },
    {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      inLanguage: lang,
      mainEntity: ['f1', 'f2', 'f3', 'f4'].map((k) => ({
        '@type': 'Question',
        name: plain(t(k + '.q')),
        acceptedAnswer: { '@type': 'Answer', text: plain(t(k + '.a')) },
      })),
    },
  ];
  const jsonldTag = `  <script type="application/ld+json">\n${JSON.stringify(jsonld, null, 2).replace(/</g, '\\u003c')}\n  </script>`;

  // 5. Language links (real links, so crawlers can follow them)
  const langLinks = LANGS.map((l) =>
    `            <li><a href="${base}${dir(l)}" hreflang="${l}" lang="${l}"${l === lang ? ' aria-current="page"' : ''} data-lang="${l}">${I18N[l]['lang.name']} <span>${l.toUpperCase()}</span></a></li>`
  ).join('\n');

  html = html
    .replace('{{seo}}', seo)
    .replace('{{jsonld}}', jsonldTag)
    .replace('{{langLinks}}', langLinks)
    .replace(/\{\{lang\}\}/g, lang)
    .replace(/\{\{LANG\}\}/g, lang.toUpperCase())
    .replace(/\{\{base\}\}/g, base)
    .replace(/\{\{home\}\}/g, '#top');

  // Strip translation markers from the output
  html = html.replace(/\sdata-i18n(-placeholder|-aria)?="[^"]*"/g, '');

  const left = html.match(/\{\{[^}]+\}\}/);
  if (left) throw new Error(`Unreplaced placeholder ${left[0]} in ${lang}`);

  const out = path.join(ROOT, dir(lang), 'index.html');
  fs.mkdirSync(path.dirname(out), { recursive: true });
  fs.writeFileSync(out, `<!-- Generated by scripts/build.js from src/template.html. Do not edit directly. -->\n${html}`);
  console.log('✓', path.relative(ROOT, out));
}

LANGS.forEach(build);

// sitemap.xml with hreflang alternates
const today = new Date().toISOString().slice(0, 10);
const links = LANGS.map((l) => `    <xhtml:link rel="alternate" hreflang="${l}" href="${url(l)}"/>`).join('\n') +
  `\n    <xhtml:link rel="alternate" hreflang="x-default" href="${url(DEFAULT_LANG)}"/>`;
const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${LANGS.map((l) => `  <url>\n    <loc>${url(l)}</loc>\n    <lastmod>${today}</lastmod>\n${links}\n  </url>`).join('\n')}
</urlset>
`;
fs.writeFileSync(path.join(ROOT, 'sitemap.xml'), sitemap);
fs.writeFileSync(path.join(ROOT, 'robots.txt'), `User-agent: *\nAllow: /\n\nSitemap: ${SITE_URL}/sitemap.xml\n`);
console.log('✓ sitemap.xml, robots.txt');
