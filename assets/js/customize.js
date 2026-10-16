/* Baset UI — Customize playground (documentation only) */
(() => {
  const picker = document.getElementById('pgColor');
  if (!picker) return;
  const root = document.documentElement;
  const hexInput = document.getElementById('pgHex');
  const radius = document.getElementById('pgRadius');
  const radiusOut = document.getElementById('pgRadiusOut');
  const codeEl = document.getElementById('pgCode');
  const DEFAULT = (getComputedStyle(root).getPropertyValue('--bui-primary').trim() || '#6658e8').toLowerCase();
  const DEFAULT_RADIUS = parseInt(getComputedStyle(root).getPropertyValue('--bui-radius'), 10) || 16;
  const VARS = ['--bui-primary', '--bui-primary-dark', '--bui-primary-soft', '--bui-primary-text', '--bui-radius'];
  let touched = false;

  const rgb = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
  const hex = (r) => '#' + r.map((v) => Math.round(Math.max(0, Math.min(255, v))).toString(16).padStart(2, '0')).join('');
  const mix = (a, b, t) => { const A = rgb(a), B = rgb(b); return hex(A.map((v, i) => v + (B[i] - v) * t)); };
  const isDark = () => root.classList.contains('bui-dark');

  function palette(c) {
    return {
      light: { primary: c, dark: mix(c, '#000000', .16), soft: mix(c, '#ffffff', .9), text: mix(c, '#000000', .22) },
      dark: { soft: mix(c, '#25263d', .78), text: mix(c, '#ffffff', .6) },
    };
  }

  function paintCode(c, r) {
    const p = palette(c);
    const lines = [
      ['sel', ':root {'],
      ['var', `  --bui-primary: ${p.light.primary};`], ['var', `  --bui-primary-dark: ${p.light.dark};`],
      ['var', `  --bui-primary-soft: ${p.light.soft};`], ['var', `  --bui-primary-text: ${p.light.text};`],
      ['var', `  --bui-radius: ${r}px;`], ['sel', '}'], ['', ''],
      ['com', '/* Dark mode */'], ['sel', ':root.bui-dark {'],
      ['var', `  --bui-primary-soft: ${p.dark.soft};`], ['var', `  --bui-primary-text: ${p.dark.text};`], ['sel', '}'],
    ];
    codeEl.innerHTML = lines.map(([k, t]) => {
      const e = t.replace(/&/g, '&amp;').replace(/</g, '&lt;');
      if (k === 'sel') return `<span class="bui-code-pink">${e}</span>`;
      if (k === 'com') return `<span class="bui-code-muted">${e}</span>`;
      if (k === 'var') return e.replace(/^(\s*)([\w-]+)(:\s*)(.*?)(;)$/, '$1<span class="bui-code-blue">$2</span>$3<span class="bui-code-green">$4</span>$5');
      return e;
    }).join('\n');
  }

  function apply() {
    const c = picker.value.toLowerCase(), r = +radius.value, p = palette(c), d = isDark();
    root.style.setProperty('--bui-primary', c);
    root.style.setProperty('--bui-primary-dark', p.light.dark);
    root.style.setProperty('--bui-primary-soft', d ? p.dark.soft : p.light.soft);
    root.style.setProperty('--bui-primary-text', d ? p.dark.text : p.light.text);
    root.style.setProperty('--bui-radius', r + 'px');
    radiusOut.textContent = r + 'px';
    hexInput.value = c;
    paintCode(c, r);
    touched = true;
  }

  picker.addEventListener('input', apply);
  radius.addEventListener('input', apply);
  hexInput.addEventListener('input', () => {
    const v = hexInput.value.trim();
    if (/^#[0-9a-f]{6}$/i.test(v)) { picker.value = v.toLowerCase(); apply(); }
  });
  document.getElementById('pgReset').addEventListener('click', () => {
    VARS.forEach((v) => root.style.removeProperty(v));
    picker.value = DEFAULT; hexInput.value = DEFAULT; radius.value = DEFAULT_RADIUS; radiusOut.textContent = DEFAULT_RADIUS + 'px';
    paintCode(DEFAULT, DEFAULT_RADIUS);
    touched = false;
  });
  // keep derived soft/text colors right when the theme is toggled
  new MutationObserver(() => { if (touched) apply(); }).observe(root, { attributes: true, attributeFilter: ['class'] });

  picker.value = DEFAULT; hexInput.value = DEFAULT; radius.value = DEFAULT_RADIUS;
  paintCode(DEFAULT, DEFAULT_RADIUS);
})();
