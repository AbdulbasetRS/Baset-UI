/* Baset UI v1.0.0 — tiny optional interactions (prefix changed to "bui-") */
(() => {
  const themeButton = document.getElementById('themeToggle');
  if (themeButton) themeButton.addEventListener('click', () => {
    document.body.classList.toggle('bui-dark');
    themeButton.textContent = document.body.classList.contains('bui-dark') ? '☾' : '☼';
  });

  document.querySelectorAll('.bui-dismiss').forEach(button => {
    button.addEventListener('click', () => button.closest('.bui-alert')?.remove());
  });

  document.querySelectorAll('[data-copy]').forEach(button => {
    button.addEventListener('click', async () => {
      const value = button.getAttribute('data-copy').replaceAll('&lt;', '<').replaceAll('&gt;', '>').replaceAll('&quot;', '"');
      try {
        await navigator.clipboard.writeText(value);
        const old = button.textContent; button.textContent = 'Copied!';
        setTimeout(() => button.textContent = old, 1300);
      } catch {
        button.textContent = 'Select code to copy';
      }
    });
  });

  document.querySelectorAll('.bui-nav').forEach(link => link.addEventListener('click', () => {
    document.querySelectorAll('.bui-nav').forEach(item => item.classList.remove('active'));
    link.classList.add('active');
  }));
})();
