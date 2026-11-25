(function () {
  'use strict';

  var CONTACT_EMAIL = 'hello@example.com'; // TODO: replace with your real address
  var SUPPORTED = ['en', 'ru', 'lv'];
  var root = document.documentElement;

  function store(key, value) {
    try {
      if (value === undefined) return localStorage.getItem(key);
      localStorage.setItem(key, value);
    } catch (e) { return null; }
  }

  /* ---------------- i18n ---------------- */
  var dict = window.I18N || {};
  var lang = 'en';

  function t(key) {
    return (dict[lang] && dict[lang][key]) || (dict.en && dict.en[key]) || '';
  }

  function detectLang() {
    var fromUrl = new URLSearchParams(location.search).get('lang');
    if (SUPPORTED.indexOf(fromUrl) > -1) return fromUrl;
    var saved = store('lang');
    if (SUPPORTED.indexOf(saved) > -1) return saved;
    var nav = (navigator.languages || [navigator.language || 'en']);
    for (var i = 0; i < nav.length; i++) {
      var code = String(nav[i]).slice(0, 2).toLowerCase();
      if (SUPPORTED.indexOf(code) > -1) return code;
    }
    return 'en';
  }

  function applyLang(next) {
    lang = SUPPORTED.indexOf(next) > -1 ? next : 'en';
    root.lang = lang;

    document.querySelectorAll('[data-i18n]').forEach(function (el) {
      var v = t(el.getAttribute('data-i18n'));
      if (v) el.innerHTML = v;
    });
    document.querySelectorAll('[data-i18n-placeholder]').forEach(function (el) {
      el.setAttribute('placeholder', t(el.getAttribute('data-i18n-placeholder')));
    });
    document.querySelectorAll('[data-i18n-aria]').forEach(function (el) {
      el.setAttribute('aria-label', t(el.getAttribute('data-i18n-aria')));
    });

    document.title = t('meta.title');
    var desc = document.querySelector('meta[name="description"]');
    if (desc) desc.setAttribute('content', t('meta.description'));

    document.getElementById('langCurrent').textContent = lang.toUpperCase();
    document.querySelectorAll('[data-lang]').forEach(function (b) {
      b.setAttribute('aria-selected', String(b.getAttribute('data-lang') === lang));
    });

    // Clear stale validation messages in the old language
    document.querySelectorAll('.field.is-invalid').forEach(function (f) { f.classList.remove('is-invalid'); });
    var status = document.getElementById('formStatus');
    if (status) status.textContent = '';

    store('lang', lang);
  }

  var langWrap = document.getElementById('lang');
  var langBtn = document.getElementById('langBtn');

  function setLangMenu(open) {
    langWrap.classList.toggle('is-open', open);
    langBtn.setAttribute('aria-expanded', String(open));
  }

  langBtn.addEventListener('click', function (e) {
    e.stopPropagation();
    setLangMenu(!langWrap.classList.contains('is-open'));
  });
  document.querySelectorAll('[data-lang]').forEach(function (b) {
    b.addEventListener('click', function () {
      applyLang(b.getAttribute('data-lang'));
      setLangMenu(false);
      langBtn.focus();
    });
  });
  document.addEventListener('click', function (e) {
    if (!langWrap.contains(e.target)) setLangMenu(false);
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') { setLangMenu(false); setNav(false); }
  });

  applyLang(detectLang());

  /* ---------------- Theme ---------------- */
  document.getElementById('themeToggle').addEventListener('click', function () {
    var current = root.getAttribute('data-theme') ||
      (matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark');
    var next = current === 'dark' ? 'light' : 'dark';
    root.setAttribute('data-theme', next);
    store('theme', next);
  });

  /* ---------------- Mobile nav ---------------- */
  var burger = document.getElementById('burger');
  var nav = document.getElementById('nav');

  function setNav(open) {
    nav.classList.toggle('is-open', open);
    burger.classList.toggle('is-open', open);
    burger.setAttribute('aria-expanded', String(open));
    document.body.classList.toggle('no-scroll', open);
  }
  burger.addEventListener('click', function () { setNav(!nav.classList.contains('is-open')); });
  nav.querySelectorAll('a').forEach(function (a) {
    a.addEventListener('click', function () { setNav(false); });
  });
  matchMedia('(min-width: 900px)').addEventListener('change', function (e) { if (e.matches) setNav(false); });

  /* ---------------- Header state ---------------- */
  var header = document.getElementById('header');
  function onScroll() { header.classList.toggle('is-scrolled', window.scrollY > 8); }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---------------- Active nav link ---------------- */
  var links = document.querySelectorAll('.nav__link');
  if ('IntersectionObserver' in window) {
    var sectionObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        links.forEach(function (l) {
          l.classList.toggle('is-active', l.getAttribute('href') === '#' + entry.target.id);
        });
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    document.querySelectorAll('main section[id]').forEach(function (s) { sectionObs.observe(s); });

    /* ---------------- Reveal on scroll ---------------- */
    var revealObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          revealObs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

    // Stagger siblings inside grids
    document.querySelectorAll('.services, .process, .faq').forEach(function (group) {
      Array.prototype.forEach.call(group.children, function (child, i) {
        child.style.transitionDelay = (i * 70) + 'ms';
      });
    });
    document.querySelectorAll('.reveal').forEach(function (el) { revealObs.observe(el); });
  } else {
    document.querySelectorAll('.reveal').forEach(function (el) { el.classList.add('is-visible'); });
  }

  /* ---------------- Service card spotlight ---------------- */
  document.querySelectorAll('.service-card').forEach(function (card) {
    card.addEventListener('pointermove', function (e) {
      var r = card.getBoundingClientRect();
      card.style.setProperty('--mx', (e.clientX - r.left) + 'px');
      card.style.setProperty('--my', (e.clientY - r.top) + 'px');
    });
  });

  /* ---------------- FAQ: one open at a time ---------------- */
  var faqItems = document.querySelectorAll('.faq__item');
  faqItems.forEach(function (item) {
    item.addEventListener('toggle', function () {
      if (!item.open) return;
      faqItems.forEach(function (other) { if (other !== item) other.open = false; });
    });
  });

  /* ---------------- Contact form ---------------- */
  document.getElementById('contactEmail').href = 'mailto:' + CONTACT_EMAIL;
  document.getElementById('contactEmail').textContent = CONTACT_EMAIL;

  var form = document.getElementById('contactForm');
  var statusEl = document.getElementById('formStatus');
  var emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

  function setError(input, msg) {
    var field = input.closest('.field');
    field.classList.toggle('is-invalid', !!msg);
    field.querySelector('.field__error').textContent = msg || '';
    return !msg;
  }

  function validate() {
    var ok = true;
    ok = setError(form.name, form.name.value.trim() ? '' : t('form.errName')) && ok;
    ok = setError(form.email, emailRe.test(form.email.value.trim()) ? '' : t('form.errEmail')) && ok;
    ok = setError(form.message, form.message.value.trim().length >= 10 ? '' : t('form.errMessage')) && ok;
    return ok;
  }

  ['name', 'email', 'message'].forEach(function (n) {
    form[n].addEventListener('input', function () {
      if (form[n].closest('.field').classList.contains('is-invalid')) validate();
    });
  });

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    statusEl.textContent = '';
    if (!validate()) {
      var firstBad = form.querySelector('.is-invalid input, .is-invalid textarea');
      if (firstBad) firstBad.focus();
      return;
    }
    var serviceKey = form.querySelector('input[name="service"]:checked').value;
    var serviceLabel = t('pill.' + serviceKey).replace(/&amp;/g, '&');
    var subject = t('form.subject') + ': ' + serviceLabel;
    var body =
      form.message.value.trim() + '\n\n— ' +
      form.name.value.trim() + ' <' + form.email.value.trim() + '>';

    // No backend: hand the message to the visitor's mail client.
    // To use a form service (Formspree, your own API), replace this with a fetch() POST.
    window.location.href = 'mailto:' + CONTACT_EMAIL +
      '?subject=' + encodeURIComponent(subject) +
      '&body=' + encodeURIComponent(body);

    statusEl.textContent = t('form.ok');
    form.reset();
  });

  /* ---------------- Footer year ---------------- */
  document.getElementById('year').textContent = new Date().getFullYear();
})();
