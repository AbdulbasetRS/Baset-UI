#!/usr/bin/env node
/*
 * Baset-UI i18n consistency test. No dependencies: run with `node tests/i18n-keys.js`.
 * Rules checked (instructions/INTERNATIONALIZATION.md):
 *   - every assets/i18n/*.json is valid JSON and has meta.code (= file name), meta.name, meta.direction (ltr|rtl)
 *   - all files have exactly the same message keys (plural objects count as ONE key, see below)
 *   - keys are camelCase and nest at most 3 levels
 *   - every message is a non-empty string, or a plural object with at least "other"
 *   - the {param} names of each message are the same in every language
 * Plural objects: an object whose keys are all CLDR plural categories (zero, one, two, few, many, other).
 * Languages need different categories (Arabic has six, English two), so the categories are not compared.
 * Exit code: 0 = pass, 1 = at least one failure.
 */
'use strict';

const fs = require('fs');
const path = require('path');

const DIR = path.join(__dirname, '..', 'assets', 'i18n');
const CATEGORIES = ['zero', 'one', 'two', 'few', 'many', 'other'];
const CAMEL = /^[a-z][a-zA-Z0-9]*$/;
const PARAM = /\{([A-Za-z0-9_]+)\}/g;

const errors = [];
const fail = (message) => errors.push(message);

function isPlural(value) {
    const keys = Object.keys(value);
    return keys.length > 0 && keys.every((k) => CATEGORIES.includes(k));
}

function params(text) {
    const set = new Set();
    let m;
    PARAM.lastIndex = 0;
    while ((m = PARAM.exec(text)) !== null) set.add(m[1]);
    return [...set].sort().join(',');
}

/* Returns Map(keyPath -> params signature). Plural objects use the union of their categories' params. */
function flatten(file, node, prefix, depth, out) {
    Object.keys(node).forEach((key) => {
        const id = prefix ? prefix + '.' + key : key;
        const value = node[key];
        if (!CAMEL.test(key)) fail(`${file}: "${id}" is not camelCase.`);
        if (depth > 3) fail(`${file}: "${id}" nests deeper than 3 levels.`);
        if (typeof value === 'string') {
            if (!value.trim()) fail(`${file}: "${id}" is empty.`);
            out.set(id, params(value));
        } else if (value && typeof value === 'object' && !Array.isArray(value)) {
            if (isPlural(value)) {
                if (typeof value.other !== 'string') fail(`${file}: plural "${id}" needs an "other" form.`);
                const all = new Set();
                Object.keys(value).forEach((cat) => {
                    if (typeof value[cat] !== 'string' || !value[cat].trim()) fail(`${file}: "${id}.${cat}" must be a non-empty string.`);
                    else params(value[cat]).split(',').filter(Boolean).forEach((p) => all.add(p));
                });
                out.set(id, [...all].sort().join(','));
            } else {
                flatten(file, value, id, depth + 1, out);
            }
        } else {
            fail(`${file}: "${id}" must be a string or an object.`);
        }
    });
    return out;
}

const files = fs.readdirSync(DIR).filter((f) => f.endsWith('.json')).sort();
if (files.length < 2) fail('At least two language files are needed to compare.');

const loaded = {};
files.forEach((file) => {
    let data;
    try {
        data = JSON.parse(fs.readFileSync(path.join(DIR, file), 'utf8'));
    } catch (e) {
        fail(`${file}: invalid JSON (${e.message}).`);
        return;
    }
    const code = path.basename(file, '.json');
    const meta = data && data.meta;
    if (!meta || typeof meta !== 'object') { fail(`${file}: "meta" is missing.`); return; }
    if (meta.code !== code) fail(`${file}: meta.code is "${meta.code}", expected "${code}".`);
    if (typeof meta.name !== 'string' || !meta.name.trim()) fail(`${file}: meta.name is missing.`);
    if (meta.direction !== 'ltr' && meta.direction !== 'rtl') fail(`${file}: meta.direction must be "ltr" or "rtl".`);
    const messages = {};
    Object.keys(data).forEach((k) => { if (k !== 'meta') messages[k] = data[k]; });
    loaded[file] = flatten(file, messages, '', 1, new Map());
});

const names = Object.keys(loaded);
if (names.length) {
    const reference = names[0];
    const union = new Set();
    names.forEach((n) => loaded[n].forEach((_, k) => union.add(k)));
    names.forEach((n) => {
        union.forEach((k) => {
            if (!loaded[n].has(k)) fail(`${n}: missing key "${k}" (present in another language).`);
            else if (loaded[reference].has(k) && loaded[n].get(k) !== loaded[reference].get(k)) {
                fail(`${n}: "${k}" uses params {${loaded[n].get(k)}} but ${reference} uses {${loaded[reference].get(k)}}.`);
            }
        });
    });
    console.log(`Checked ${names.length} files (${names.join(', ')}), ${union.size} keys.`);
}

if (errors.length) {
    errors.forEach((e) => console.error('FAIL ' + e));
    console.error(`${errors.length} problem(s).`);
    process.exit(1);
}
console.log('PASS: key parity, structure and params are consistent.');
