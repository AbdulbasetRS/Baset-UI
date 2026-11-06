/*
 * Baset UI docs — tiny dependency-free syntax highlighter (docs-only).
 *
 * BUIDocs.highlight(source, language) -> HTML string
 *
 * The output is always built from escaped text: every character of the source
 * is passed through escapeHtml() before it reaches markup, so the result is
 * safe to assign to innerHTML. Languages: html, css, js, bash. Anything else
 * is returned escaped and unhighlighted.
 *
 * This is a presentation helper for documentation, not a parser. It does not
 * attempt to handle every edge case of each language.
 */
(function () {
  var D = (window.BUIDocs = window.BUIDocs || {});

  function escapeHtml(s) {
    return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  function span(cls, text) {
    return '<span class="tok-' + cls + '">' + escapeHtml(text) + '</span>';
  }

  /**
   * Generic scanner. rules: [{ cls, re (sticky), when?(state), after?(match, state), render?(match) }]
   * The first rule that matches at the current index wins.
   */
  function scan(src, rules, state) {
    var out = '';
    var plain = '';
    var i = 0;
    state = state || {};

    function flush() {
      if (plain) { out += escapeHtml(plain); plain = ''; }
    }

    while (i < src.length) {
      var hit = null;
      for (var r = 0; r < rules.length; r++) {
        var rule = rules[r];
        if (rule.when && !rule.when(state)) { continue; }
        rule.re.lastIndex = i;
        var m = rule.re.exec(src);
        if (m && m.index === i && m[0].length > 0) { hit = { rule: rule, match: m[0] }; break; }
      }
      if (hit) {
        flush();
        if (hit.rule.render) {
          out += hit.rule.render(hit.match);
        } else if (hit.rule.cls) {
          out += span(hit.rule.cls, hit.match);
        } else {
          out += escapeHtml(hit.match);
        }
        if (hit.rule.after) { hit.rule.after(hit.match, state); }
        i += hit.match.length;
      } else {
        plain += src.charAt(i);
        i += 1;
      }
    }
    flush();
    return out;
  }

  /* ---------------------------------------------------------------- HTML */
  var TAG_RE = /<\/?[A-Za-z][\w:-]*(?:\s+[^\s"'<>\/=]+(?:\s*=\s*(?:"[^"]*"|'[^']*'|[^\s"'<>]+))?)*\s*\/?>/y;

  function renderTag(tag) {
    var inner = scan(tag, [
      { cls: 'string', re: /"[^"]*"|'[^']*'/y },
      { cls: 'tag', re: /<\/?[A-Za-z][\w:-]*/y },
      { cls: 'punct', re: /\/?>|=/y },
      { cls: 'attr', re: /[^\s"'<>\/=]+/y }
    ]);
    return inner;
  }

  var HTML_RULES = [
    { cls: 'comment', re: /<!--[\s\S]*?-->/y },
    { cls: 'comment', re: /<!doctype[^>]*>/iy },
    { re: TAG_RE, render: renderTag }
  ];

  /* ----------------------------------------------------------------- CSS */
  var CSS_RULES = [
    { cls: 'comment', re: /\/\*[\s\S]*?\*\//y },
    { cls: 'string', re: /"(?:[^"\\\n]|\\.)*"|'(?:[^'\\\n]|\\.)*'/y },
    { cls: 'keyword', re: /@[\w-]+/y },
    { cls: 'var', re: /--[\w-]+/y },
    {
      cls: 'prop',
      re: /[a-zA-Z-]+(?=\s*:)/y,
      when: function (s) { return (s.depth || 0) > 0; }
    },
    { cls: 'number', re: /#[0-9a-fA-F]{3,8}\b/y },
    { cls: 'selector', re: /[.#][A-Za-z_][\w-]*/y },
    { cls: 'func', re: /[a-z-]+(?=\()/y },
    { cls: null, re: /-?[A-Za-z_][\w-]*/y },
    { cls: 'number', re: /-?(?:\d+\.?\d*|\.\d+)(?:%|[a-z]+)?/y },
    {
      cls: 'punct',
      re: /[{}]/y,
      after: function (m, s) { s.depth = Math.max(0, (s.depth || 0) + (m === '{' ? 1 : -1)); }
    }
  ];

  /* ------------------------------------------------------------------ JS */
  var JS_KEYWORDS = 'const let var function return if else for while do new class extends import export from default async await try catch finally throw typeof instanceof in of switch case break continue this null undefined true false void delete';
  var JS_KEYWORD_RE = new RegExp('(?:' + JS_KEYWORDS.split(' ').join('|') + ')\\b', 'y');

  var JS_RULES = [
    { cls: 'comment', re: /\/\/[^\n]*|\/\*[\s\S]*?\*\//y },
    { cls: 'string', re: /"(?:[^"\\\n]|\\.)*"|'(?:[^'\\\n]|\\.)*'|`(?:[^`\\]|\\[\s\S])*`/y },
    { cls: 'keyword', re: JS_KEYWORD_RE },
    { cls: 'func', re: /[A-Za-z_$][\w$]*(?=\()/y },
    { cls: null, re: /[A-Za-z_$][\w$]*/y },
    { cls: 'number', re: /\b\d+(?:\.\d+)?\b/y },
    { cls: 'punct', re: /[{}()[\];,.=<>+\-*\/!&|?:]/y }
  ];

  function highlightJs(src) {
    return scan(src, JS_RULES);
  }

  /* ---------------------------------------------------------------- Bash */
  var BASH_COMMANDS = 'git npm npx cd cp mv mkdir ls cat curl unzip python3 python node open';
  var BASH_COMMAND_RE = new RegExp('(?:' + BASH_COMMANDS.split(' ').join('|') + ')(?![\\w-])', 'y');
  var BASH_RULES = [
    { cls: 'comment', re: /#[^\n]*/y },
    { cls: 'string', re: /"(?:[^"\\\n]|\\.)*"|'[^'\n]*'/y },
    { cls: 'attr', re: /--?[A-Za-z][\w-]*/y },
    { cls: 'keyword', re: BASH_COMMAND_RE },
    { cls: null, re: /[\w.\/:@~-]+/y }
  ];

  /* ----------------------------------------------------------- Public API */
  var LANGS = {
    html: function (s) { return scan(s, HTML_RULES); },
    vue: function (s) { return scan(s, HTML_RULES); },
    blade: function (s) { return scan(s, HTML_RULES); },
    css: function (s) { return scan(s, CSS_RULES, { depth: 0 }); },
    js: highlightJs,
    jsx: highlightJs,
    bash: function (s) { return scan(s, BASH_RULES); }
  };

  D.highlight = function (source, language) {
    var fn = LANGS[String(language || '').toLowerCase()];
    var text = String(source == null ? '' : source);
    return fn ? fn(text) : escapeHtml(text);
  };
  D.escapeHtml = escapeHtml;
})();
