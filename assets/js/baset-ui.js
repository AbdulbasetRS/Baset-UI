/* Baset UI v1.0.0 — tiny optional interactions (no dependencies) */
(() => {
  const root = document.documentElement;
  const THEME_KEY = 'bui-theme';

  /* ---------- Theme toggle (persisted) ---------- */
  const themeButton = document.getElementById('themeToggle');
  const isDark = () => root.classList.contains('bui-dark');
  const syncIcon = () => { if (themeButton) themeButton.textContent = isDark() ? '☾' : '☼'; };

  try { if (localStorage.getItem(THEME_KEY) === 'dark') root.classList.add('bui-dark'); } catch { /* storage blocked */ }
  syncIcon();

  themeButton?.addEventListener('click', () => {
    root.classList.toggle('bui-dark');
    try { localStorage.setItem(THEME_KEY, isDark() ? 'dark' : 'light'); } catch { /* storage blocked */ }
    syncIcon();
  });

  /* ---------- Direction (RTL / LTR, persisted) ---------- */
  const DIR_KEY = 'bui-dir';
  const syncDirButtons = () => {
    document.querySelectorAll('[data-bui-dir]').forEach((btn) => {
      btn.setAttribute('aria-pressed', String(btn.dataset.buiDir === root.dir));
    });
  };
  const setDir = (dir) => {
    root.dir = dir === 'rtl' ? 'rtl' : 'ltr';
    try { localStorage.setItem(DIR_KEY, root.dir); } catch { /* storage blocked */ }
    syncDirButtons();
  };

  try { const saved = localStorage.getItem(DIR_KEY); if (saved === 'rtl' || saved === 'ltr') root.dir = saved; } catch { /* storage blocked */ }
  syncDirButtons();

  document.addEventListener('click', (event) => {
    const btn = event.target.closest('[data-bui-dir]');
    if (btn) setDir(btn.dataset.buiDir);
  });

  /* ---------- Clipboard helper (with fallback) ---------- */
  async function copyText(text) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      const area = document.createElement('textarea');
      area.value = text;
      area.style.cssText = 'position:fixed;opacity:0';
      document.body.appendChild(area);
      area.select();
      let ok = false;
      try { ok = document.execCommand('copy'); } catch { /* ignore */ }
      area.remove();
      return ok;
    }
  }

  /* ---------- Delegated clicks: alert dismiss + copy code ---------- */
  document.addEventListener('click', async (event) => {
    const dismiss = event.target.closest('.bui-dismiss');
    if (dismiss) {
      dismiss.closest('.bui-alert')?.remove();
      return;
    }

    const replay = event.target.closest('.bui-replay');
    if (replay) { // restart CSS animations of the success icons in this demo card
      replay.closest('.bui-demo-card')?.querySelectorAll('.bui-success-icon').forEach((el) => el.replaceWith(el.cloneNode(true)));
      return;
    }

    const copy = event.target.closest('.bui-copy');
    if (!copy) return;

    // Priority: data-copy attribute, otherwise the text of the sibling <code> block
    const text = copy.dataset.copy ?? copy.closest('.bui-code-card')?.querySelector('code')?.textContent ?? '';
    const original = copy.dataset.label ?? (copy.dataset.label = copy.textContent);
    const ok = await copyText(text);
    copy.textContent = ok ? 'Copied!' : 'Select code to copy';
    clearTimeout(copy._t);
    copy._t = setTimeout(() => { copy.textContent = original; }, 1300);
  });

  /* ---------- Scroll-spy for in-page sidebar links (#section) ---------- */
  const spyLinks = [...document.querySelectorAll('.bui-nav[href^="#"]')];
  if (spyLinks.length && 'IntersectionObserver' in window) {
    const byId = new Map(spyLinks.map((link) => [link.getAttribute('href').slice(1), link]));
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        spyLinks.forEach((link) => link.classList.remove('active'));
        byId.get(entry.target.id)?.classList.add('active');
      });
    }, { rootMargin: '-30% 0px -60% 0px' });
    byId.forEach((_, id) => { const el = document.getElementById(id); if (el) observer.observe(el); });
  }
})();
