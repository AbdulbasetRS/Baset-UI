#!/usr/bin/env node
/*
 * Baset-UI icons generator. No dependencies (Node standard library only).
 *
 *   node tools/build-icons.js           writes the two generated files below
 *   node tools/build-icons.js --check   validates the sources and fails when a generated file is out of date
 *
 * Inputs
 *   assets/icons/icons.json                     the manifest: the list of icons (name, directional, categories, tags)
 *   assets/icons/{weight}/{name}.svg            one SVG per icon and weight (weights: thin light regular solid bold duotone)
 * Outputs (generated, never edit by hand)
 *   assets/css/extensions/baset-ui-icons.css    the library stylesheet (SVG masks inlined as data: URIs)
 *   documentation/assets/js/icons-data.js       the catalog data for documentation/advanced/icons.html (docs only)
 *
 * Procedure and rules: instructions/ICONS_SYSTEM.md, section "Adding an icon".
 */
'use strict';

const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

const ROOT = path.join(__dirname, '..');
const MANIFEST = path.join(ROOT, 'assets', 'icons', 'icons.json');
const CSS_OUT = path.join(ROOT, 'assets', 'css', 'extensions', 'baset-ui-icons.css');
const DATA_OUT = path.join(ROOT, 'documentation', 'assets', 'js', 'icons-data.js');

const WEIGHTS = ['thin', 'light', 'regular', 'solid', 'bold', 'duotone'];
const DEFAULT_WEIGHT = 'light';
const SIZES = [['sm', 'space-3'], ['md', 'space-4'], ['lg', 'space-5'], ['xl', 'space-6']];
/* Class names after "bui-icon-" that an icon name must never use. */
const RESERVED = new Set(WEIGHTS.concat(SIZES.map((s) => s[0]), ['flip-rtl']));
const NAME_RE = /^[a-z][a-z0-9]*(?:-[a-z0-9]+)*$/;

const checkOnly = process.argv.includes('--check');
const errors = [];
const fail = (message) => errors.push(message);

function readVersion() {
    const core = fs.readFileSync(path.join(ROOT, 'assets', 'js', 'baset-ui.js'), 'utf8');
    const match = /version:\s*'([^']+)'/.exec(core);
    return match ? match[1] : 'unknown';
}

function loadManifest() {
    let data;
    try {
        data = JSON.parse(fs.readFileSync(MANIFEST, 'utf8'));
    } catch (e) {
        fail(`icons.json: ${e.message}`);
        return null;
    }
    if (!data || !Array.isArray(data.icons) || typeof data.source !== 'string') {
        fail('icons.json: needs "source" (string) and "icons" (array).');
        return null;
    }
    const seen = new Set();
    data.icons.forEach((icon, i) => {
        const where = `icons.json icons[${i}]`;
        if (!icon || typeof icon.name !== 'string' || !NAME_RE.test(icon.name)) { fail(`${where}: "name" must be kebab-case.`); return; }
        if (RESERVED.has(icon.name)) fail(`${where}: "${icon.name}" is reserved (weight, size or helper class).`);
        if (seen.has(icon.name)) fail(`${where}: duplicate name "${icon.name}".`);
        seen.add(icon.name);
        if (typeof icon.directional !== 'boolean') fail(`${where}: "directional" must be true or false.`);
        if (icon.categories !== undefined && !Array.isArray(icon.categories)) fail(`${where}: "categories" must be an array.`);
        if (icon.tags !== undefined && !Array.isArray(icon.tags)) fail(`${where}: "tags" must be an array.`);
    });
    return data;
}

function readSvg(weight, name) {
    const file = path.join(ROOT, 'assets', 'icons', weight, name + '.svg');
    if (!fs.existsSync(file)) { fail(`missing file assets/icons/${weight}/${name}.svg`); return null; }
    const svg = fs.readFileSync(file, 'utf8').trim();
    const rel = `assets/icons/${weight}/${name}.svg`;
    if (!/^<svg\b[^>]*\bxmlns="http:\/\/www\.w3\.org\/2000\/svg"/.test(svg) || !/\bviewBox="/.test(svg)) { fail(`${rel}: needs xmlns and viewBox on <svg>.`); return null; }
    /* The SVG ends up inside a stylesheet as an image: no scripts, external references or event handlers. */
    if (/<script|<foreignObject|<image|<use\b|\son[a-z]+\s*=|href\s*=|javascript:/i.test(svg)) { fail(`${rel}: contains a forbidden element or attribute.`); return null; }
    if (svg.indexOf('"') !== svg.lastIndexOf('"') && /[^=]"[^ >/]/.test(svg.replace(/="[^"]*"/g, '=""')) ) { fail(`${rel}: unexpected quote characters.`); return null; }
    return svg;
}

/* A mask only uses the alpha channel, so the fill is irrelevant. Duotone keeps its opacity="0.2" layer: alpha gives the two tones. */
function toDataUri(svg) {
    const compact = svg
        .replace(/\sfill="currentColor"/, '')
        .replace(/"/g, "'")
        .replace(/%/g, '%25')
        .replace(/</g, '%3C')
        .replace(/>/g, '%3E')
        .replace(/#/g, '%23');
    return 'url("data:image/svg+xml,' + compact + '")';
}

function build(manifest, version) {
    const names = manifest.icons.map((icon) => icon.name);
    const nameSel = names.map((n) => '.bui-icon-' + n);
    const weightSel = WEIGHTS.map((w) => '.bui-icon-' + w);
    const baseSel = weightSel.concat(nameSel).join(',\n');
    const fallback = 'linear-gradient(transparent, transparent)';
    const out = [];

    out.push(`/*!
 * Baset-UI - Extension: Icons
 * Version: ${version}
 *
 * GENERATED by tools/build-icons.js from assets/icons/. Do not edit by hand.
 * CSS only: there is no JavaScript and nothing is registered with BUI.register.
 * Icon artwork: ${manifest.source}, MIT License. See THIRD_PARTY.md.
 *
 * Usage:  <i class="bui-icon-light bui-icon-x" aria-hidden="true"></i>
 *   bui-icon-{weight}   thin | light | regular | solid | bold | duotone  (default light when omitted)
 *   bui-icon-{name}     one class per icon (${names.length} icons)
 *   bui-icon-{size}     sm | md | lg | xl (default: 1em, the size of the surrounding text)
 *   bui-icon-flip-rtl   mirrors a directional icon when the direction is RTL
 * Color is the text color (currentColor). Load this file after baset-ui.css.
 * Rules: instructions/ICONS_SYSTEM.md.
 */

/* Component tokens (Layer 3: var() only, re-declared on every scope, see instructions/RTL_LTR_AND_THEMES.md) */
:root,
[data-bui-mode],
[data-bui-theme] {
${SIZES.map((s) => `    --bui-icon-size-${s[0]}: var(--bui-${s[1]});`).join('\n')}
}

/* Internal properties: registered so they never inherit into child elements. Not public API. */
${WEIGHTS.map((w) => `@property --bui-icon-${w}-src { syntax: "*"; inherits: false; }`).join('\n')}
@property --bui-icon-size { syntax: "*"; inherits: false; }

/* Base: weights, names and sizes share one box. A name alone renders the default weight (${DEFAULT_WEIGHT}). */
${baseSel} {
    display: inline-block;
    flex-shrink: 0;
    width: var(--bui-icon-size, 1em);
    height: var(--bui-icon-size, 1em);
    vertical-align: -0.125em;
    background-color: currentColor;
    -webkit-mask-image: var(--bui-icon-${DEFAULT_WEIGHT}-src, ${fallback});
    mask-image: var(--bui-icon-${DEFAULT_WEIGHT}-src, ${fallback});
    -webkit-mask-repeat: no-repeat;
    mask-repeat: no-repeat;
    -webkit-mask-position: center;
    mask-position: center;
    -webkit-mask-size: contain;
    mask-size: contain;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
}

/* Weights (declared after the base so they win at equal specificity) */
${WEIGHTS.map((w) => `.bui-icon-${w} {
    -webkit-mask-image: var(--bui-icon-${w}-src, ${fallback});
    mask-image: var(--bui-icon-${w}-src, ${fallback});
}`).join('\n')}

/* Sizes */
${SIZES.map((s) => `.bui-icon-${s[0]} { --bui-icon-size: var(--bui-icon-size-${s[0]}); }`).join('\n')}

/* Mirror directional icons in RTL. transform has no logical form, so :dir(rtl) is used (as in Position utilities). */
.bui-icon-flip-rtl:dir(rtl) { transform: scaleX(-1); }

/* Forced colors: backgrounds are replaced by the browser, so the mask color is set explicitly. */
@media (forced-colors: active) {
${baseSel.split('\n').map((l) => '    ' + l).join('\n')} {
        forced-color-adjust: none;
        background-color: CanvasText;
    }
}

/* Icons (one rule per icon: ${WEIGHTS.length} weights as internal properties) */
`);

    let missing = false;
    manifest.icons.forEach((icon) => {
        const props = [];
        WEIGHTS.forEach((w) => {
            const svg = readSvg(w, icon.name);
            if (svg === null) { missing = true; return; }
            props.push(`    --bui-icon-${w}-src: ${toDataUri(svg)};`);
        });
        out.push(`.bui-icon-${icon.name} {\n${props.join('\n')}\n}\n`);
    });
    if (missing) return null;

    const css = out.join('\n');
    const data = '/*\n * Catalog data for documentation/advanced/icons.html. GENERATED by tools/build-icons.js from assets/icons/icons.json.\n * Docs only: not part of the library. Do not edit by hand.\n */\nwindow.BUI_DOCS_ICONS = ' +
        JSON.stringify({
            source: manifest.source,
            weights: WEIGHTS,
            defaultWeight: DEFAULT_WEIGHT,
            sizes: SIZES.map((s) => s[0]),
            icons: manifest.icons.map((icon) => ({
                name: icon.name,
                directional: icon.directional,
                categories: icon.categories || [],
                tags: icon.tags || []
            }))
        }) + ';\n';
    return { css, data };
}

const manifest = loadManifest();
let result = null;
if (manifest) result = build(manifest, readVersion());

if (!errors.length && result) {
    if (checkOnly) {
        [[CSS_OUT, result.css], [DATA_OUT, result.data]].forEach(([file, text]) => {
            const current = fs.existsSync(file) ? fs.readFileSync(file, 'utf8') : null;
            if (current !== text) fail(`${path.relative(ROOT, file)} is out of date. Run: node tools/build-icons.js`);
        });
    } else {
        fs.mkdirSync(path.dirname(CSS_OUT), { recursive: true });
        fs.writeFileSync(CSS_OUT, result.css);
        fs.writeFileSync(DATA_OUT, result.data);
    }
}

if (errors.length) {
    errors.forEach((e) => console.error('FAIL ' + e));
    console.error(`${errors.length} problem(s).`);
    process.exit(1);
}
const bytes = Buffer.byteLength(result.css);
const gz = zlib.gzipSync(result.css).length;
console.log(`${checkOnly ? 'PASS (up to date)' : 'Wrote'}: ${manifest.icons.length} icons x ${WEIGHTS.length} weights. baset-ui-icons.css = ${bytes} bytes raw, ${gz} bytes gzip.`);
