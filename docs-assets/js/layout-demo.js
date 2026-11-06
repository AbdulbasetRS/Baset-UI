/*
 * Baset UI docs — Layout page demos (docs-only, not part of the library).
 *  1. [data-classplay]  selects that toggle real bui- utility classes on a stage
 *  2. [data-viewport]   a resizable iframe preview: the code block next to it is
 *                       the exact markup rendered, so media queries react to the
 *                       iframe width instead of the window width
 *  3. #viewport-readout current window width and Baset UI breakpoint
 * Text is written with textContent or the escaping highlighter; values come
 * from fixed option lists, never from user input.
 */
(function () {
  var D = window.BUIDocs = window.BUIDocs || {};
  var BPS = [['xs', 480], ['sm', 576], ['md', 768], ['lg', 992], ['xl', 1200], ['xxl', 1600], ['xxxl', 1920]];

  function bpName(w) {
    var name = '—';
    for (var i = 0; i < BPS.length; i++) { if (w >= BPS[i][1]) { name = BPS[i][0]; } }
    return name;
  }

  /* -------------------------------------------------------- 1. class playground */
  function initClassPlay(box) {
    var stage = document.getElementById(box.getAttribute('data-stage'));
    var pre = document.getElementById(box.getAttribute('data-code'));
    if (!stage) { return; }
    var base = (box.getAttribute('data-base') || '').split(/\s+/).filter(Boolean);
    var keep = (box.getAttribute('data-keep') || '').split(/\s+/).filter(Boolean);
    var selects = box.querySelectorAll('select');
    function update() {
      var cls = base.slice();
      for (var i = 0; i < selects.length; i++) { if (selects[i].value) { cls.push(selects[i].value); } }
      stage.className = keep.concat(cls).join(' ');
      if (pre) {
        var kids = stage.children, inner = '';
        for (var k = 0; k < kids.length; k++) { inner += '  <div>' + kids[k].textContent + '</div>\n'; }
        var text = '<div class="' + cls.join(' ') + '">\n' + inner + '</div>';
        var node = pre.querySelector('code') || pre;
        node.innerHTML = D.highlight ? D.highlight(text, 'html') : '';
        if (!D.highlight) { node.textContent = text; }
      }
    }
    for (var s = 0; s < selects.length; s++) { selects[s].addEventListener('change', update); }
    update();
  }

  /* ------------------------------------------------------ 2. viewport previews */
  var frames = [];

  function cssUrl(root, file) { return new URL(root + file, location.href).href; }

  function applyPrefs(doc) {
    var r = document.documentElement, t = doc.documentElement;
    t.className = r.classList.contains('bui-dark') ? 'bui-dark' : '';
    t.setAttribute('lang', r.getAttribute('lang') || 'en');
    t.setAttribute('dir', r.getAttribute('dir') || 'ltr');
  }

  function initViewport(box) {
    var pre = document.getElementById(box.getAttribute('data-source'));
    var frame = box.querySelector('iframe');
    var buttons = box.querySelectorAll('button[data-w]');
    var wrap = box.getAttribute('data-wrap') !== 'none';
    var info = box.querySelector('.docs-viewport__info');
    if (!pre || !frame) { return; }
    var root = document.documentElement.getAttribute('data-docs-root') || '';
    var markup = (pre.querySelector('code') || pre).textContent;
    var body = wrap ? '<div class="bui-container">\n' + markup + '\n</div>' : markup;
    frame.srcdoc = '<!doctype html><html><head><meta charset="utf-8">' +
      '<meta name="viewport" content="width=device-width, initial-scale=1">' +
      '<link rel="stylesheet" href="' + cssUrl(root, 'assets/css/baset-ui.css') + '">' +
      '<link rel="stylesheet" href="' + cssUrl(root, 'assets/css/baset-ui-layout.css') + '">' +
      '<link rel="stylesheet" href="' + cssUrl(root, 'docs-assets/css/docs.css') + '">' +
      '</head><body class="docs-gridlive docs-viewport__body">' + body + '</body></html>';
    frame.addEventListener('load', function () {
      try { applyPrefs(frame.contentDocument); } catch (e) { /* cross-origin: ignore */ }
    });
    frames.push(frame);

    function show(w) {
      frame.style.inlineSize = w ? w + 'px' : '100%';
      for (var i = 0; i < buttons.length; i++) {
        buttons[i].setAttribute('aria-pressed', String(Number(buttons[i].getAttribute('data-w')) === w));
      }
      if (info) {
        var shown = w || Math.round(frame.getBoundingClientRect().width);
        var a = info.querySelectorAll('[data-info-w]'), b = info.querySelectorAll('[data-info-bp]');
        for (var x = 0; x < a.length; x++) { a[x].textContent = shown + 'px'; }
        for (var y = 0; y < b.length; y++) { b[y].textContent = bpName(shown); }
      }
    }
    for (var i = 0; i < buttons.length; i++) {
      buttons[i].addEventListener('click', function (ev) { show(Number(ev.currentTarget.getAttribute('data-w'))); });
    }
    window.addEventListener('resize', function () {
      var pressed = box.querySelector('button[aria-pressed="true"]');
      if (!pressed || Number(pressed.getAttribute('data-w')) === 0) { show(0); }
    });
    show(0);
  }

  document.addEventListener('buidocs:prefchange', function () {
    frames.forEach(function (f) { try { applyPrefs(f.contentDocument); } catch (e) { /* ignore */ } });
  });

  /* ------------------------------------------------------- 3. window readout */
  function initReadout() {
    var out = document.getElementById('viewport-readout');
    if (!out) { return; }
    function paint() { out.textContent = window.innerWidth + 'px · ' + bpName(window.innerWidth); }
    paint();
    window.addEventListener('resize', paint);
  }

  function init() {
    var a = document.querySelectorAll('[data-classplay]'), b = document.querySelectorAll('[data-viewport]'), i;
    for (i = 0; i < a.length; i++) { initClassPlay(a[i]); }
    for (i = 0; i < b.length; i++) { initViewport(b[i]); }
    initReadout();
  }
  if (document.readyState === 'loading') { document.addEventListener('DOMContentLoaded', init); } else { init(); }
})();
