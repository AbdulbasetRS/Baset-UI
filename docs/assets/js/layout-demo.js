/*
 * Baset UI docs — Layout page demos (docs-only, not part of the library).
 * Wires the flex, grid and display controls and the viewport readout.
 * It only sets style properties from fixed option lists and writes text with
 * textContent; no HTML is ever built from values.
 */
(function () {
  function $(id) { return document.getElementById(id); }

  function bindStage(stageId, codeId, selectors, base) {
    var stage = $(stageId);
    if (!stage) { return; }
    var code = $(codeId);
    function update() {
      var lines = base.slice();
      selectors.forEach(function (s) {
        var sel = $(s.id);
        if (!sel) { return; }
        stage.style.setProperty(s.prop, sel.value);
        lines.push('  ' + s.prop + ': ' + sel.value + ';');
      });
      if (code) {
        var text = '.stage {\n' + lines.join('\n') + '\n}';
        var node = code.querySelector('code') || code;
        node.textContent = text;
        if (window.BUIDocs && window.BUIDocs.highlight) {
          node.innerHTML = window.BUIDocs.highlight(text, 'css');
        }
      }
    }
    selectors.forEach(function (s) {
      var sel = $(s.id);
      if (sel) { sel.addEventListener('change', update); }
    });
    update();
  }

  function init() {
    bindStage('flex-stage', 'flex-code', [
      { id: 'fx-direction', prop: 'flex-direction' },
      { id: 'fx-justify', prop: 'justify-content' },
      { id: 'fx-align', prop: 'align-items' },
      { id: 'fx-wrap', prop: 'flex-wrap' },
      { id: 'fx-gap', prop: 'gap' }
    ], ['  display: flex;']);

    bindStage('grid-stage', 'grid-code', [
      { id: 'gr-columns', prop: 'grid-template-columns' },
      { id: 'gr-gap', prop: 'gap' }
    ], ['  display: grid;']);

    bindStage('display-stage', 'display-code', [
      { id: 'dp-display', prop: 'display' }
    ], []);

    var out = $('viewport-readout');
    if (out) {
      var paint = function () { out.textContent = String(window.innerWidth) + 'px (' + (window.innerWidth / 16).toFixed(1) + 'rem)'; };
      paint();
      window.addEventListener('resize', paint);
    }
  }

  if (document.readyState === 'loading') { document.addEventListener('DOMContentLoaded', init); }
  else { init(); }
})();
