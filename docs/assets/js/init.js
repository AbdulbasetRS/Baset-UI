/*
 * Baset UI docs — early preference bootstrap (docs-only, not part of the library).
 * Loaded synchronously in <head> so theme, language and direction are applied
 * before first paint and the page does not flash the wrong theme.
 *
 * Storage keys
 *   bui-theme      "light" | "dark"   (absent = follow the operating system)
 *   bui-docs-lang  "en" | "ar"        (absent = browser language, else "en")
 *   bui-docs-dir   "ltr" | "rtl"      (absent = default direction of the language)
 */
(function () {
  var root = document.documentElement;

  function read(key) {
    try { return window.localStorage.getItem(key); } catch (e) { return null; }
  }

  var theme = read('bui-theme');
  var prefersDark = false;
  try {
    prefersDark = !!(window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches);
  } catch (e) { /* matchMedia unavailable */ }
  root.classList.toggle('bui-dark', theme === 'dark' || (theme !== 'light' && prefersDark));

  var lang = read('bui-docs-lang');
  if (lang !== 'en' && lang !== 'ar') {
    lang = /^ar\b/i.test(navigator.language || '') ? 'ar' : 'en';
  }
  root.setAttribute('lang', lang);

  var dir = read('bui-docs-dir');
  if (dir !== 'ltr' && dir !== 'rtl') {
    dir = lang === 'ar' ? 'rtl' : 'ltr';
  }
  root.setAttribute('dir', dir);
})();
