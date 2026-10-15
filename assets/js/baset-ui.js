/* Baset UI v1.0.0 — tiny optional interactions */
(() => {
  const themeButton = document.getElementById('themeToggle');
  if (themeButton) themeButton.addEventListener('click', () => {
    document.body.classList.toggle('bu-dark');
    themeButton.textContent = document.body.classList.contains('bu-dark') ? '☾' : '☼';
  });
  document.querySelectorAll('.bu-dismiss').forEach(button => {
    button.addEventListener('click', () => button.closest('.bu-alert')?.remove());
  });
  document.querySelectorAll('[data-copy]').forEach(button => {
    button.addEventListener('click', async () => {
      const value = button.getAttribute('data-copy').replaceAll('&lt;', '<').replaceAll('&gt;', '>').replaceAll('&quot;', '"');
      try {
        await navigator.clipboard.writeText(value);
        const old = button.textContent; button.textContent = 'Copied!';
        setTimeout(() => button.textContent = old, 1300);
      } catch { button.textContent = 'Select code to copy'; }
    });
  });
  document.querySelectorAll('.bu-nav').forEach(link => link.addEventListener('click', () => {
    document.querySelectorAll('.bu-nav').forEach(item => item.classList.remove('active'));
    link.classList.add('active');
  }));
})();
