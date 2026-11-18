/*!
 * Baset-UI - Core Script
 * Version: 0.0.0-foundation
 *
 * Task 05: the BUI namespace, component registry, init, instances, events, DOM helpers,
 * utilities, options parser, logger and the optional observer.
 * Task 06: BUI.theme (theme and mode manager) and BUI.locale (translations, direction, HTML binding).
 * No component ships with the core. Rules: instructions/JAVASCRIPT_API.md,
 * instructions/COMPONENT_DEVELOPMENT.md and instructions/CORE_ASSETS.md.
 * The only global this file creates is window.BUI.
 */
(function (window, document) {
    'use strict';

    if (window.BUI) {
        if (window.console) console.warn('[BUI] Core: baset-ui.js was loaded twice; the second copy was ignored.');
        return;
    }

    /* Captured now: document.currentScript is only available while the script runs. Used to find assets/i18n/. */
    var scriptSrc = (document.currentScript && document.currentScript.src) || '';

    /* ------------------------------------------------------------------ */
    /* Logger                                                              */
    /* ------------------------------------------------------------------ */

    var LEVELS = { silent: 0, error: 1, warn: 2, info: 3, debug: 4 };
    var logLevel = 'warn';

    function write(kind, component, message, extra) {
        if (LEVELS[logLevel] < LEVELS[kind]) return;
        var c = window.console;
        if (!c || typeof c[kind] !== 'function') return;
        var text = '[BUI] ' + component + ': ' + message;
        if (extra === undefined) c[kind](text); else c[kind](text, extra);
    }

    var log = {
        error: function (component, message, extra) { write('error', component, message, extra); },
        warn: function (component, message, extra) { write('warn', component, message, extra); },
        info: function (component, message, extra) { write('info', component, message, extra); },
        debug: function (component, message, extra) { write('debug', component, message, extra); },
        getLevel: function () { return logLevel; },
        setLevel: function (level) {
            if (typeof level !== 'string' || !Object.prototype.hasOwnProperty.call(LEVELS, level)) {
                write('warn', 'Logger', 'Invalid log level "' + level + '". Use one of: silent, error, warn, info, debug.');
                return false;
            }
            logLevel = level;
            return true;
        }
    };

    /* ------------------------------------------------------------------ */
    /* Utilities                                                           */
    /* ------------------------------------------------------------------ */

    var uidCounter = 0;

    function isPlainObject(value) {
        if (value === null || typeof value !== 'object') return false;
        var proto = Object.getPrototypeOf(value);
        return proto === Object.prototype || proto === null;
    }

    function kebabToCamel(str) {
        return String(str).replace(/-([a-z0-9])/g, function (m, ch) { return ch.toUpperCase(); });
    }

    function camelToKebab(str) {
        return String(str).replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase();
    }

    function cloneValue(value) {
        if (Array.isArray(value)) return value.slice();
        if (isPlainObject(value)) return mergeInto({}, value);
        return value;
    }

    function mergeInto(target, source) {
        Object.keys(source).forEach(function (key) {
            if (key === '__proto__' || key === 'constructor' || key === 'prototype') return; /* prototype pollution guard */
            var value = source[key];
            if (value === undefined) return;
            if (isPlainObject(value)) {
                target[key] = mergeInto(isPlainObject(target[key]) ? target[key] : {}, value);
            } else {
                target[key] = cloneValue(value);
            }
        });
        return target;
    }

    /* Returns a NEW object. Plain objects merge recursively, arrays and other values replace. */
    function deepMerge() {
        var result = {};
        for (var i = 0; i < arguments.length; i++) {
            if (isPlainObject(arguments[i])) mergeInto(result, arguments[i]);
        }
        return result;
    }

    function now() {
        return (window.performance && typeof window.performance.now === 'function') ? window.performance.now() : Date.now();
    }

    function debounce(fn, wait) {
        if (typeof fn !== 'function') throw new TypeError('[BUI] Utils: debounce() needs a function.');
        wait = Math.max(0, Number(wait) || 0);
        var timer = null;
        function debounced() {
            var self = this;
            var args = arguments;
            if (timer !== null) window.clearTimeout(timer);
            timer = window.setTimeout(function () {
                timer = null;
                fn.apply(self, args);
            }, wait);
        }
        debounced.cancel = function () {
            if (timer !== null) window.clearTimeout(timer);
            timer = null;
        };
        return debounced;
    }

    /* Runs on the leading edge, then at most once per `wait` ms with the latest arguments (trailing edge). */
    function throttle(fn, wait) {
        if (typeof fn !== 'function') throw new TypeError('[BUI] Utils: throttle() needs a function.');
        wait = Math.max(0, Number(wait) || 0);
        var last = -Infinity;
        var timer = null;
        var lastArgs = null;
        var lastThis = null;
        function invoke() {
            last = now();
            timer = null;
            var args = lastArgs;
            var self = lastThis;
            lastArgs = lastThis = null;
            fn.apply(self, args);
        }
        function throttled() {
            lastArgs = arguments;
            lastThis = this;
            var remaining = wait - (now() - last);
            if (remaining <= 0) {
                if (timer !== null) { window.clearTimeout(timer); timer = null; }
                invoke();
            } else if (timer === null) {
                timer = window.setTimeout(invoke, remaining);
            }
        }
        throttled.cancel = function () {
            if (timer !== null) window.clearTimeout(timer);
            timer = null;
            lastArgs = lastThis = null;
            last = -Infinity;
        };
        return throttled;
    }

    function uid(prefix) {
        var base = (typeof prefix === 'string' && prefix) ? prefix : 'bui';
        var id;
        do {
            uidCounter += 1;
            id = base + '-' + uidCounter;
        } while (document.getElementById(id));
        return id;
    }

    var utils = {
        isPlainObject: isPlainObject,
        kebabToCamel: kebabToCamel,
        camelToKebab: camelToKebab,
        deepMerge: deepMerge,
        debounce: debounce,
        throttle: throttle,
        uid: uid
    };

    /* ------------------------------------------------------------------ */
    /* DOM helpers                                                         */
    /* ------------------------------------------------------------------ */

    function isElement(node) { return !!node && node.nodeType === 1; }

    function safeQuery(selector, root) {
        try { return (root || document).querySelector(selector); } catch (e) {
            log.warn('DOM', 'Invalid selector "' + selector + '".');
            return null;
        }
    }

    function resolveRootNode(root) {
        if (root === undefined || root === null) return document;
        if (typeof root === 'string') return safeQuery(root, document);
        if (root.nodeType === 1 || root.nodeType === 9 || root.nodeType === 11) return root;
        return null;
    }

    function resolveElement(target) {
        if (isElement(target)) return target;
        if (typeof target === 'string') return safeQuery(target, document);
        return null;
    }

    function classList(el) { return isElement(el) ? el.classList : null; }

    var dom = {
        select: function (selector, root) {
            var scope = (root === undefined || root === null) ? document : root;
            if (!scope.querySelector) return null;
            return safeQuery(selector, scope);
        },
        selectAll: function (selector, root) {
            var scope = (root === undefined || root === null) ? document : root;
            if (!scope.querySelectorAll) return [];
            try { return Array.prototype.slice.call(scope.querySelectorAll(selector)); } catch (e) {
                log.warn('DOM', 'Invalid selector "' + selector + '".');
                return [];
            }
        },
        closest: function (el, selector) {
            if (!isElement(el)) return null;
            try { return el.closest(selector); } catch (e) {
                log.warn('DOM', 'Invalid selector "' + selector + '".');
                return null;
            }
        },
        matches: function (el, selector) {
            if (!isElement(el)) return false;
            try { return el.matches(selector); } catch (e) {
                log.warn('DOM', 'Invalid selector "' + selector + '".');
                return false;
            }
        },
        /* data-bui-{name} attributes. `name` is kebab-case. */
        getData: function (el, name) {
            return isElement(el) ? el.getAttribute('data-bui-' + name) : null;
        },
        hasData: function (el, name) {
            return isElement(el) && el.hasAttribute('data-bui-' + name);
        },
        setData: function (el, name, value) {
            if (isElement(el)) el.setAttribute('data-bui-' + name, String(value));
            return el;
        },
        removeData: function (el, name) {
            if (isElement(el)) el.removeAttribute('data-bui-' + name);
            return el;
        },
        hasClass: function (el, name) {
            var cl = classList(el);
            return cl ? cl.contains(name) : false;
        },
        addClass: function (el) {
            var cl = classList(el);
            if (cl) for (var i = 1; i < arguments.length; i++) if (arguments[i]) cl.add(arguments[i]);
            return el;
        },
        removeClass: function (el) {
            var cl = classList(el);
            if (cl) for (var i = 1; i < arguments.length; i++) if (arguments[i]) cl.remove(arguments[i]);
            return el;
        },
        toggleClass: function (el, name, force) {
            var cl = classList(el);
            if (!cl || !name) return false;
            return force === undefined ? cl.toggle(name) : cl.toggle(name, !!force);
        },
        /* Computed direction. A detached element has no computed direction (returns false). */
        isRTL: function (el) {
            var target = isElement(el) ? el : document.documentElement;
            return window.getComputedStyle(target).direction === 'rtl';
        }
    };

    /* ------------------------------------------------------------------ */
    /* Options parser                                                      */
    /* ------------------------------------------------------------------ */

    /* data-bui-* attributes that belong to other systems. They can never be component options. */
    var RESERVED_ATTRS = { 'theme': 1, 'mode': 1, 'i18n': 1, 'i18n-attr': 1 };
    var NUMBER_RE = /^-?(?:\d+|\d*\.\d+)(?:[eE][+-]?\d+)?$/;

    /*
     * Converts a string read from an attribute using the type of the default value.
     * Returns { ok: true, value } or { ok: false, reason }.
     */
    function coerce(raw, sample) {
        var type = sample === null || sample === undefined ? 'any' : (Array.isArray(sample) ? 'array' : typeof sample);
        var parsed;
        if (type === 'boolean') {
            if (raw === '' || raw === 'true') return { ok: true, value: true };
            if (raw === 'false') return { ok: true, value: false };
            return { ok: false, reason: 'expected a boolean (empty, "true" or "false")' };
        }
        if (type === 'number') {
            var n = Number(raw);
            if (raw.trim() === '' || !isFinite(n)) return { ok: false, reason: 'expected a number' };
            return { ok: true, value: n };
        }
        if (type === 'string') return { ok: true, value: raw };
        if (type === 'array' || type === 'object') {
            try { parsed = JSON.parse(raw); } catch (e) { return { ok: false, reason: 'expected valid JSON' }; }
            if (type === 'array' ? !Array.isArray(parsed) : !isPlainObject(parsed)) {
                return { ok: false, reason: 'expected a JSON ' + (type === 'array' ? 'array' : 'object') };
            }
            return { ok: true, value: parsed };
        }
        if (type === 'function') return { ok: false, reason: 'a function cannot be set from an HTML attribute' };
        /* No type information (default is null/undefined): infer. */
        if (raw === 'true') return { ok: true, value: true };
        if (raw === 'false') return { ok: true, value: false };
        if (NUMBER_RE.test(raw)) return { ok: true, value: Number(raw) };
        if (/^\s*[\[{]/.test(raw)) {
            try { return { ok: true, value: JSON.parse(raw) }; } catch (e) { /* keep as a string */ }
        }
        return { ok: true, value: raw };
    }

    function typeMatches(value, sample) {
        if (sample === null || sample === undefined) return true;
        if (typeof sample === 'number') return typeof value === 'number' && isFinite(value);
        if (Array.isArray(sample)) return Array.isArray(value);
        if (isPlainObject(sample)) return isPlainObject(value);
        if (typeof sample === 'function') return typeof value === 'function';
        return typeof value === typeof sample;
    }

    function describeType(sample) {
        if (Array.isArray(sample)) return 'an array';
        if (isPlainObject(sample)) return 'an object';
        return 'a ' + typeof sample;
    }

    function optionsFromElement(el, defaults, component) {
        var label = component || 'Options';
        var out = {};
        if (!isElement(el) || !isPlainObject(defaults)) return out;
        Object.keys(defaults).forEach(function (key) {
            var attr = 'data-bui-' + camelToKebab(key);
            if (!el.hasAttribute(attr)) return;
            var result = coerce(el.getAttribute(attr), defaults[key]);
            if (result.ok) {
                out[key] = result.value;
            } else {
                log.warn(label, 'Invalid value "' + el.getAttribute(attr) + '" for ' + attr + ' (' + result.reason + '). The default is used.');
            }
        });
        return out;
    }

    /* Defaults < HTML attributes < JS options. Invalid JS values are dropped with a warning. */
    function resolveOptions(el, defaults, jsOptions, component) {
        var label = component || 'Options';
        var base = isPlainObject(defaults) ? defaults : {};
        var fromJs = {};
        if (jsOptions !== undefined && jsOptions !== null) {
            if (!isPlainObject(jsOptions)) {
                log.warn(label, 'Options must be a plain object. They were ignored.');
            } else {
                Object.keys(jsOptions).forEach(function (key) {
                    var value = jsOptions[key];
                    if (value === undefined) return;
                    if (!Object.prototype.hasOwnProperty.call(base, key)) {
                        log.warn(label, 'Unknown option "' + key + '".');
                        fromJs[key] = value;
                    } else if (typeMatches(value, base[key])) {
                        fromJs[key] = value;
                    } else {
                        log.warn(label, 'Invalid value for option "' + key + '" (expected ' + describeType(base[key]) + '). The default is used.');
                    }
                });
            }
        }
        return deepMerge(base, optionsFromElement(el, base, label), fromJs);
    }

    var options = { fromElement: optionsFromElement, resolve: resolveOptions };

    /* ------------------------------------------------------------------ */
    /* Global event bus and DOM events                                     */
    /* ------------------------------------------------------------------ */

    var busListeners = new Map();
    var NAME_RE = /^[a-z][a-z0-9]*(?:-[a-z0-9]+)*$/;

    /* off(name, handler) removes one handler; off(name) removes every handler of that event. */
    function off(name, handler) {
        var list = busListeners.get(name);
        if (!list) return;
        if (handler === undefined) {
            busListeners.delete(name);
            return;
        }
        var index = list.indexOf(handler);
        if (index > -1) list.splice(index, 1);
        if (!list.length) busListeners.delete(name);
    }

    function on(name, handler) {
        if (typeof name !== 'string' || !name || typeof handler !== 'function') {
            log.warn('Events', 'on(name, handler) needs a non-empty string and a function.');
            return function () {};
        }
        var list = busListeners.get(name);
        if (!list) { list = []; busListeners.set(name, list); }
        if (list.indexOf(handler) === -1) list.push(handler);
        return function () { off(name, handler); };
    }

    /* Calls handlers synchronously with (detail, name). A throwing handler is logged and does not stop the others. */
    function emit(name, detail) {
        var list = busListeners.get(name);
        if (!list) return 0;
        var copy = list.slice();
        copy.forEach(function (handler) {
            try { handler(detail, name); } catch (e) {
                log.error('Events', 'A handler of "' + name + '" threw: ' + (e && e.message ? e.message : e), e);
            }
        });
        return copy.length;
    }

    /* Dispatches bui:{component}:{event} on an element. Returns false when canceled or when the call is invalid. */
    function trigger(el, component, event, detail, opts) {
        if (!isElement(el)) {
            log.warn('Events', 'trigger() needs an element.');
            return false;
        }
        if (typeof component !== 'string' || !NAME_RE.test(component) || typeof event !== 'string' || !NAME_RE.test(event)) {
            log.warn('Events', 'trigger() needs kebab-case component and event names, got "' + component + '" and "' + event + '".');
            return false;
        }
        var settings = isPlainObject(opts) ? opts : {};
        var customEvent = new window.CustomEvent('bui:' + component + ':' + event, {
            bubbles: settings.bubbles !== false,
            cancelable: settings.cancelable === true,
            detail: detail === undefined ? null : detail
        });
        return el.dispatchEvent(customEvent);
    }

    /* ------------------------------------------------------------------ */
    /* Config                                                              */
    /* ------------------------------------------------------------------ */

    var config = { autoInit: true, observe: false, logLevel: 'warn' };
    var domReady = false;
    var observer = null;

    function setConfig(opts) {
        if (opts === undefined) return deepMerge(config);
        if (!isPlainObject(opts)) {
            log.warn('Core', 'config() needs a plain object.');
            return deepMerge(config);
        }
        Object.keys(opts).forEach(function (key) {
            var value = opts[key];
            if (!Object.prototype.hasOwnProperty.call(config, key)) {
                log.warn('Core', 'Unknown config option "' + key + '". It was ignored.');
            } else if (key === 'logLevel') {
                if (log.setLevel(value)) config.logLevel = value;
            } else if (typeof value !== 'boolean') {
                log.warn('Core', 'Config option "' + key + '" must be a boolean. The current value is kept.');
            } else {
                config[key] = value;
            }
        });
        applyObserver();
        return deepMerge(config);
    }

    /* ------------------------------------------------------------------ */
    /* Registry and instances                                              */
    /* ------------------------------------------------------------------ */

    var definitions = new Map();   /* kebab name -> normalized definition */
    var order = [];                /* registration order, drives init order */
    var instances = new WeakMap(); /* element -> Map(name -> instance) */
    var refOf = new WeakMap();     /* element -> WeakRef, so destroyAll can enumerate without strong refs */
    var tracked = new Set();       /* Set<WeakRef<element>> */

    function makeRef(el) {
        if (typeof window.WeakRef === 'function') return new window.WeakRef(el);
        return { deref: function () { return el; } }; /* fallback keeps a strong reference */
    }

    function track(el) {
        if (refOf.has(el)) return;
        var ref = makeRef(el);
        refOf.set(el, ref);
        tracked.add(ref);
    }

    function untrack(el) {
        var ref = refOf.get(el);
        if (ref) tracked.delete(ref);
        refOf.delete(el);
    }

    function prune() {
        tracked.forEach(function (ref) {
            var el = ref.deref();
            if (!el || !instances.has(el)) tracked.delete(ref);
        });
    }

    function liveElements() {
        prune();
        var list = [];
        tracked.forEach(function (ref) {
            var el = ref.deref();
            if (el) list.push(el);
        });
        return list;
    }

    function componentLogger(name) {
        return {
            error: function (message, extra) { log.error(name, message, extra); },
            warn: function (message, extra) { log.warn(name, message, extra); },
            info: function (message, extra) { log.info(name, message, extra); },
            debug: function (message, extra) { log.debug(name, message, extra); }
        };
    }

    function removeInstance(el, name) {
        var map = instances.get(el);
        if (!map) return;
        map.delete(name);
        if (!map.size) {
            instances.delete(el);
            untrack(el);
        }
    }

    /* instance.destroy() also removes the instance from the registry, so getInstance() and a new init stay correct. */
    function wrapDestroy(instance, el, name) {
        var original = instance.destroy;
        var done = false;
        function destroy() {
            if (done) return undefined;
            done = true;
            removeInstance(el, name);
            try {
                return original.apply(instance, arguments);
            } catch (e) {
                log.error(name, 'destroy() threw: ' + (e && e.message ? e.message : e), e);
                return undefined;
            }
        }
        try {
            instance.destroy = destroy;
        } catch (e) {
            log.warn(name, 'The instance is frozen, so its destroy() could not be wrapped. Use BUI.destroy(element) instead.');
        }
    }

    function createInstance(name, el, jsOptions, variant) {
        var map = instances.get(el);
        if (map && map.has(name)) {
            if (jsOptions !== undefined) log.debug(name, 'The element is already initialized. The new options were ignored.');
            return map.get(name);
        }
        var def = definitions.get(name);
        var opts = resolveOptions(el, def.defaults, jsOptions, name);
        var ctx = {
            name: name,
            variant: variant || null,
            log: componentLogger(name),
            trigger: function (event, detail, triggerOptions) { return trigger(el, name, event, detail, triggerOptions); }
        };
        var instance;
        try {
            instance = def.create(el, opts, ctx);
        } catch (e) {
            log.error(name, 'Initialization failed: ' + (e && e.message ? e.message : e), e);
            return null;
        }
        if (!instance || (typeof instance !== 'object' && typeof instance !== 'function') || typeof instance.destroy !== 'function') {
            log.error(name, 'create() must return an instance that has a destroy() method. The element was not initialized.');
            return null;
        }
        wrapDestroy(instance, el, name);
        map = instances.get(el);
        if (!map) { map = new Map(); instances.set(el, map); }
        map.set(name, instance);
        track(el);
        return instance;
    }

    function resolveTarget(name, target) {
        var el = resolveElement(target);
        if (!el) {
            log.warn(name, 'Target not found: ' + (typeof target === 'string' ? '"' + target + '"' : 'not an element') + '.');
        }
        return el;
    }

    function register(name, definition) {
        if (typeof name !== 'string' || !NAME_RE.test(name)) {
            log.error('Core', 'register(): the component name must be kebab-case (letters, digits and hyphens, starting with a letter), got "' + name + '".');
            return null;
        }
        var camel = kebabToCamel(name);
        if (definitions.has(name) || camel in BUI) {
            log.error('Core', 'register(): "' + name + '" is already registered or is a reserved BUI name.');
            return null;
        }
        if (!isPlainObject(definition) || typeof definition.create !== 'function') {
            log.error(name, 'register(): the definition must be an object with a create(element, options, context) function.');
            return null;
        }
        var defaults = definition.defaults === undefined ? {} : definition.defaults;
        if (!isPlainObject(defaults)) {
            log.error(name, 'register(): "defaults" must be a plain object.');
            return null;
        }
        var badOption = Object.keys(defaults).filter(function (key) {
            var attr = camelToKebab(key);
            return attr === name || RESERVED_ATTRS[attr] === 1;
        })[0];
        if (badOption) {
            log.error(name, 'register(): the option "' + badOption + '" would use the attribute data-bui-' + camelToKebab(badOption) + ', which is reserved.');
            return null;
        }
        var variants = definition.variants === undefined ? [] : definition.variants;
        if (!Array.isArray(variants) || variants.some(function (v) { return typeof v !== 'string' || !NAME_RE.test(v); })) {
            log.error(name, 'register(): "variants" must be an array of kebab-case strings.');
            return null;
        }

        var factory = function (target, jsOptions) {
            var el = resolveTarget(name, target);
            return el ? createInstance(name, el, jsOptions, null) : null;
        };
        var variantFns = {};
        for (var i = 0; i < variants.length; i++) {
            var variantKey = kebabToCamel(variants[i]);
            if (variantKey in factory || variantFns[variantKey]) {
                log.error(name, 'register(): the variant "' + variants[i] + '" collides with a function property or another variant.');
                return null;
            }
            variantFns[variantKey] = (function (variantName) {
                return function (target, jsOptions) {
                    var el = resolveTarget(name, target);
                    return el ? createInstance(name, el, jsOptions, variantName) : null;
                };
            })(variants[i]);
        }
        Object.keys(variantFns).forEach(function (key) { factory[key] = variantFns[key]; });

        definitions.set(name, {
            create: definition.create,
            defaults: deepMerge(defaults),
            variants: variants.slice()
        });
        order.push(name);
        BUI[camel] = factory;
        emit('register', { name: name });
        return factory;
    }

    /* ------------------------------------------------------------------ */
    /* Init, getInstance, destroy                                          */
    /* ------------------------------------------------------------------ */

    function initElement(name, el) {
        var def = definitions.get(name);
        var value = el.getAttribute('data-bui-' + name);
        var variant = null;
        if (value) {
            if (def.variants.indexOf(value) > -1) {
                variant = value;
            } else if (def.variants.length) {
                log.warn(name, 'Unknown variant "' + value + '" in data-bui-' + name + '. Allowed: ' + def.variants.join(', ') + '. No variant is used.');
            }
        }
        var existing = instances.get(el);
        var isNew = !(existing && existing.has(name));
        var instance = createInstance(name, el, undefined, variant);
        return instance && isNew ? instance : null;
    }

    /* Initializes every [data-bui-{name}] element inside root (and root itself). Returns the NEW instances. */
    function init(root) {
        var scope = resolveRootNode(root);
        if (!scope) {
            log.warn('Core', 'init(): root not found or not a node.');
            return [];
        }
        prune();
        var created = [];
        order.forEach(function (name) {
            var selector = '[data-bui-' + name + ']';
            var elements = [];
            if (scope.nodeType === 1 && scope.matches(selector)) elements.push(scope);
            Array.prototype.forEach.call(scope.querySelectorAll(selector), function (el) { elements.push(el); });
            elements.forEach(function (el) {
                var instance = initElement(name, el);
                if (instance) created.push(instance);
            });
        });
        if (created.length) emit('init', { root: scope, count: created.length });
        return created;
    }

    function getInstance(target, name) {
        if (typeof name !== 'string' || !definitions.has(name)) {
            log.warn('Core', 'getInstance(): "' + name + '" is not a registered component.');
            return null;
        }
        var el = resolveElement(target);
        if (!el) {
            log.warn(name, 'getInstance(): element not found.');
            return null;
        }
        var map = instances.get(el);
        return map && map.has(name) ? map.get(name) : null;
    }

    function destroyWhere(test) {
        var count = 0;
        liveElements().forEach(function (el) {
            if (!test(el)) return;
            var map = instances.get(el);
            if (!map) return;
            Array.from(map.entries()).forEach(function (entry) {
                try { entry[1].destroy(); } catch (e) {
                    log.error(entry[0], 'destroy() threw: ' + (e && e.message ? e.message : e), e);
                }
                removeInstance(el, entry[0]); /* also covers frozen instances whose destroy() was not wrapped */
                count += 1;
            });
        });
        return count;
    }

    /* Destroys the instances on root (default: document) and its descendants that are in the document. */
    function destroy(root) {
        var scope = resolveRootNode(root);
        if (!scope) {
            log.warn('Core', 'destroy(): root not found or not a node.');
            return 0;
        }
        var count = destroyWhere(function (el) {
            return scope === document ? document.contains(el) : (scope === el || scope.contains(el));
        });
        if (count) emit('destroy', { root: scope, count: count });
        return count;
    }

    /* Destroys every instance, including those on detached elements. */
    function destroyAll() {
        var count = destroyWhere(function () { return true; });
        if (count) emit('destroy', { root: null, count: count });
        return count;
    }

    /* ------------------------------------------------------------------ */
    /* Observer (optional, off by default)                                 */
    /* ------------------------------------------------------------------ */

    function applyObserver() {
        if (!domReady || typeof window.MutationObserver !== 'function') return;
        if (config.observe && !observer) {
            observer = new window.MutationObserver(function (records) {
                records.forEach(function (record) {
                    Array.prototype.forEach.call(record.addedNodes, function (node) {
                        if (node.nodeType === 1) init(node);
                    });
                });
            });
            observer.observe(document.documentElement, { childList: true, subtree: true });
        } else if (!config.observe && observer) {
            observer.disconnect();
            observer = null;
        }
    }

    /* ------------------------------------------------------------------ */
    /* Theme manager                                                       */
    /* ------------------------------------------------------------------ */

    var THEME_KEY = 'bui-theme';
    var MODE_KEY = 'bui-mode';
    var DEFAULT_THEME = 'default';
    var htmlEl = document.documentElement;
    var darkQuery = typeof window.matchMedia === 'function' ? window.matchMedia('(prefers-color-scheme: dark)') : null;
    var themeState = { theme: DEFAULT_THEME, mode: 'light', modeChosen: false };
    var themeLoads = {}; /* theme name -> { url, promise } */

    function isMode(value) { return value === 'light' || value === 'dark'; }
    function isThemeName(value) { return typeof value === 'string' && NAME_RE.test(value); }

    /* Every storage access is guarded: it can throw (blocked cookies, private mode, sandboxed frames). */
    function readStored(key) {
        try { return window.localStorage.getItem(key); } catch (e) { return null; }
    }

    function writeStored(key, value) {
        try {
            window.localStorage.setItem(key, value);
            return true;
        } catch (e) {
            log.debug('Theme', 'localStorage is not available, "' + key + '" was not saved.');
            return false;
        }
    }

    function systemMode() { return darkQuery && darkQuery.matches ? 'dark' : 'light'; }

    function applyThemeState(source, previous) {
        htmlEl.setAttribute('data-bui-theme', themeState.theme);
        htmlEl.setAttribute('data-bui-mode', themeState.mode);
        if (previous && (previous.theme !== themeState.theme || previous.mode !== themeState.mode)) {
            trigger(htmlEl, 'theme', 'change', {
                theme: themeState.theme,
                mode: themeState.mode,
                previousTheme: previous.theme,
                previousMode: previous.mode,
                source: source
            });
        }
    }

    function snapshotTheme() { return { theme: themeState.theme, mode: themeState.mode }; }

    function setTheme(name) {
        if (!isThemeName(name)) {
            log.warn('Theme', 'set(): the theme name must be kebab-case (letters, digits and hyphens), got "' + name + '".');
            return null;
        }
        var previous = snapshotTheme();
        themeState.theme = name;
        writeStored(THEME_KEY, name);
        applyThemeState('api', previous);
        return name;
    }

    function setMode(mode) {
        if (!isMode(mode)) {
            log.warn('Theme', 'setMode(): the mode must be "light" or "dark", got "' + mode + '".');
            return null;
        }
        var previous = snapshotTheme();
        themeState.mode = mode;
        themeState.modeChosen = true; /* an explicit choice stops following the system, even when it could not be saved */
        writeStored(MODE_KEY, mode);
        applyThemeState('api', previous);
        return mode;
    }

    function absoluteUrl(url) {
        try { return new window.URL(url, document.baseURI).href; } catch (e) { return null; }
    }

    /* Adds a theme stylesheet. It does NOT activate the theme: call set(name) after the promise resolves. */
    function loadTheme(name, url) {
        if (!isThemeName(name)) {
            log.warn('Theme', 'load(): the theme name must be kebab-case, got "' + name + '".');
            return Promise.reject(new TypeError('[BUI] Theme: invalid theme name "' + name + '".'));
        }
        var href = typeof url === 'string' && url ? absoluteUrl(url) : null;
        if (!href) {
            log.warn('Theme', 'load(): "' + name + '" needs a valid stylesheet URL.');
            return Promise.reject(new TypeError('[BUI] Theme: invalid URL for theme "' + name + '".'));
        }
        if (Object.prototype.hasOwnProperty.call(themeLoads, name)) {
            if (themeLoads[name].url !== href) log.warn('Theme', 'load(): "' + name + '" is already loaded from ' + themeLoads[name].url + '. The new URL was ignored.');
            return themeLoads[name].promise;
        }
        var promise = new Promise(function (resolve, reject) {
            var existing = null;
            Array.prototype.forEach.call(document.querySelectorAll('link[rel~="stylesheet"]'), function (link) {
                if (!existing && link.href === href) existing = link;
            });
            var link = existing || document.createElement('link');
            if (existing && existing.sheet) { resolve(name); return; }
            link.addEventListener('load', function () { resolve(name); }, { once: true });
            link.addEventListener('error', function () {
                if (!existing && link.parentNode) link.parentNode.removeChild(link);
                delete themeLoads[name];
                log.error('Theme', 'load(): could not load the stylesheet ' + href + '.');
                reject(new Error('[BUI] Theme: could not load ' + href));
            }, { once: true });
            if (!existing) {
                link.rel = 'stylesheet';
                link.href = href;
                link.setAttribute('data-bui-theme-css', name);
                document.head.appendChild(link);
            }
        });
        themeLoads[name] = { url: href, promise: promise };
        return promise;
    }

    function initTheme() {
        var storedTheme = readStored(THEME_KEY);
        var attrTheme = htmlEl.getAttribute('data-bui-theme');
        themeState.theme = isThemeName(storedTheme) ? storedTheme : (isThemeName(attrTheme) ? attrTheme : DEFAULT_THEME);
        var storedMode = readStored(MODE_KEY);
        if (isMode(storedMode)) {
            themeState.mode = storedMode;
            themeState.modeChosen = true;
        } else if (darkQuery) {
            themeState.mode = systemMode();
        } else {
            var attrMode = htmlEl.getAttribute('data-bui-mode');
            themeState.mode = isMode(attrMode) ? attrMode : 'light';
        }
        applyThemeState('init', null);
        /* Follows the system only while the user has not chosen a mode. */
        if (darkQuery) {
            var onSystemChange = function () {
                if (themeState.modeChosen) return;
                var previous = snapshotTheme();
                themeState.mode = systemMode();
                applyThemeState('system', previous);
            };
            if (typeof darkQuery.addEventListener === 'function') darkQuery.addEventListener('change', onSystemChange);
            else if (typeof darkQuery.addListener === 'function') darkQuery.addListener(onSystemChange);
        }
    }

    var theme = {
        set: setTheme,
        setMode: setMode,
        toggleMode: function () { return setMode(themeState.mode === 'dark' ? 'light' : 'dark'); },
        get: function () { return themeState.theme; },
        getMode: function () { return themeState.mode; },
        load: loadTheme
    };

    initTheme();

    /* ------------------------------------------------------------------ */
    /* Locale manager                                                      */
    /* ------------------------------------------------------------------ */

    var DEFAULT_LOCALE = 'en';
    var CODE_RE = /^[a-z]{2,3}(?:-[a-z0-9]{2,8})*$/i;
    var PARAM_RE = /\{([A-Za-z0-9_]+)\}/g;
    var localeCache = new Map();   /* code -> { code, direction, messages } */
    var localePending = new Map(); /* code -> Promise, so concurrent use() calls share one request */
    var pluralRules = {};
    var warnedKeys = new Set();
    var useToken = 0;
    var activeLocale = null;       /* { code, direction, messages, fallback } */

    function hasOwn(obj, key) { return Object.prototype.hasOwnProperty.call(obj, key); }
    function isLocaleCode(code) { return typeof code === 'string' && CODE_RE.test(code); }

    function errorMessage(e) { return e && e.message ? e.message : String(e); }

    /* Returns a cache entry, or null when the file does not follow instructions/INTERNATIONALIZATION.md. */
    function normalizeLocale(code, data) {
        if (!isPlainObject(data) || !isPlainObject(data.meta)) return null;
        if (data.meta.direction !== 'ltr' && data.meta.direction !== 'rtl') return null;
        if (typeof data.meta.code === 'string' && data.meta.code.toLowerCase() !== code) {
            log.warn('Locale', 'The file for "' + code + '" declares meta.code "' + data.meta.code + '".');
        }
        return { code: code, direction: data.meta.direction, messages: deepMerge(data) };
    }

    function defaultUrl(code) {
        if (!scriptSrc) return null;
        try { return new window.URL('../i18n/' + code + '.json', scriptSrc).href; } catch (e) { return null; }
    }

    function loadLocale(code, url) {
        if (localeCache.has(code)) return Promise.resolve(localeCache.get(code));
        if (localePending.has(code)) return localePending.get(code);
        var target = (typeof url === 'string' && url) ? url : defaultUrl(code);
        if (!target) {
            var missing = new Error('[BUI] Locale: no URL for "' + code + '". Pass options.url or call BUI.locale.register().');
            log.error('Locale', 'No URL for "' + code + '". Pass options.url or call BUI.locale.register().');
            return Promise.reject(missing);
        }
        var promise = window.fetch(target, { credentials: 'same-origin' }).then(function (res) {
            if (!res.ok) throw new Error('HTTP ' + res.status + ' for ' + target);
            return res.json();
        }).then(function (data) {
            var entry = normalizeLocale(code, data);
            if (!entry) throw new Error(target + ' is not a valid locale file (an object with meta.direction "ltr" or "rtl" is required).');
            localeCache.set(code, entry);
            localePending.delete(code);
            return entry;
        }).catch(function (e) {
            localePending.delete(code);
            log.error('Locale', 'Could not load "' + code + '": ' + errorMessage(e));
            throw e;
        });
        localePending.set(code, promise);
        return promise;
    }

    function queryAll(scope, selector) {
        var list = Array.prototype.slice.call(scope.querySelectorAll(selector));
        if (scope.nodeType === 1 && scope.matches(selector)) list.unshift(scope);
        return list;
    }

    /* "aria-label:common.close; placeholder:common.search" -> [{ attr, key }] */
    function parseAttrBindings(value) {
        var pairs = [];
        String(value).split(';').forEach(function (part) {
            var index = part.indexOf(':');
            if (index < 1) return;
            var attr = part.slice(0, index).trim();
            var key = part.slice(index + 1).trim();
            if (!attr || !key) return;
            if (!/^[a-z][a-z0-9-]*$/i.test(attr) || /^on/i.test(attr)) {
                log.warn('Locale', 'data-bui-i18n-attr: the attribute "' + attr + '" is not allowed.');
                return;
            }
            pairs.push({ attr: attr, key: key });
        });
        return pairs;
    }

    /* Translates [data-bui-i18n] (text) and [data-bui-i18n-attr] (attributes) inside root. Returns the number of elements updated. */
    function applyBindings(root) {
        var scope = resolveRootNode(root);
        if (!scope || !scope.querySelectorAll) {
            log.warn('Locale', 'apply(): root not found or not a node.');
            return 0;
        }
        var count = 0;
        queryAll(scope, '[data-bui-i18n]').forEach(function (el) {
            var key = (el.getAttribute('data-bui-i18n') || '').trim();
            if (!key) return;
            el.textContent = translate(key);
            count += 1;
        });
        queryAll(scope, '[data-bui-i18n-attr]').forEach(function (el) {
            var pairs = parseAttrBindings(el.getAttribute('data-bui-i18n-attr'));
            pairs.forEach(function (pair) { el.setAttribute(pair.attr, translate(pair.key)); });
            if (pairs.length) count += 1;
        });
        return count;
    }

    function lookupKey(entry, key) {
        if (!entry) return undefined;
        var node = entry.messages;
        var parts = key.split('.');
        for (var i = 0; i < parts.length; i++) {
            if (!isPlainObject(node) || !hasOwn(node, parts[i])) return undefined;
            node = node[parts[i]];
        }
        return node;
    }

    function pluralCategory(code, count) {
        try {
            if (!pluralRules[code]) pluralRules[code] = new window.Intl.PluralRules(code);
            return pluralRules[code].select(count);
        } catch (e) {
            return count === 1 ? 'one' : 'other';
        }
    }

    /* A string, or a plural object ({ one, other, ... }) chosen with params.count. Anything else is "not found". */
    function messageText(value, params, code) {
        if (typeof value === 'string') return value;
        if (isPlainObject(value) && params && typeof params.count === 'number' && isFinite(params.count)) {
            var category = pluralCategory(code, params.count);
            if (typeof value[category] === 'string') return value[category];
            if (typeof value.other === 'string') return value.other;
        }
        return undefined;
    }

    function interpolate(text, params) {
        if (!isPlainObject(params)) return text;
        return text.replace(PARAM_RE, function (match, name) {
            return hasOwn(params, name) && params[name] !== undefined && params[name] !== null ? String(params[name]) : match;
        });
    }

    function translate(key, params) {
        if (typeof key !== 'string' || !key) {
            log.warn('Locale', 't(): the key must be a non-empty string.');
            return typeof key === 'string' ? key : '';
        }
        var sources = activeLocale ? [activeLocale, activeLocale.fallback] : [];
        for (var i = 0; i < sources.length; i++) {
            if (!sources[i]) continue;
            var text = messageText(lookupKey(sources[i], key), params, sources[i].code);
            if (text !== undefined) return interpolate(text, params);
        }
        var id = (activeLocale ? activeLocale.code : '-') + '|' + key;
        if (!warnedKeys.has(id)) {
            warnedKeys.add(id);
            log.warn('Locale', 'Missing key "' + key + '"' + (activeLocale ? ' (locale "' + activeLocale.code + '"' + (activeLocale.fallback ? ', fallback "' + activeLocale.fallback.code + '"' : '') + ')' : ' (no locale is active)') + '. The key is returned.');
        }
        return key;
    }

    function activate(entry, fallbackEntry, announce) {
        var previous = activeLocale ? activeLocale.code : null;
        activeLocale = { code: entry.code, direction: entry.direction, messages: entry.messages, fallback: fallbackEntry };
        warnedKeys.clear();
        htmlEl.setAttribute('lang', entry.code);
        htmlEl.setAttribute('dir', entry.direction);
        applyBindings(document);
        if (announce && previous !== entry.code) {
            trigger(htmlEl, 'locale', 'change', {
                locale: entry.code,
                previousLocale: previous,
                direction: entry.direction,
                fallback: fallbackEntry ? fallbackEntry.code : null
            });
        }
    }

    function useLocale(code, opts) {
        var token = ++useToken;
        if (!isLocaleCode(code)) {
            log.warn('Locale', 'use(): invalid locale code "' + code + '".');
            return Promise.reject(new TypeError('[BUI] Locale: invalid locale code "' + code + '".'));
        }
        var settings = isPlainObject(opts) ? opts : {};
        var main = code.toLowerCase();
        var fallback = settings.fallback === undefined ? DEFAULT_LOCALE : settings.fallback;
        var fallbackCode = null;
        if (fallback !== false && fallback !== null) {
            if (isLocaleCode(fallback)) fallbackCode = fallback.toLowerCase();
            else log.warn('Locale', 'use(): invalid fallback "' + fallback + '". No fallback is used.');
        }
        if (fallbackCode === main) fallbackCode = null;
        return loadLocale(main, settings.url).then(function (entry) {
            if (!fallbackCode) return [entry, null];
            return loadLocale(fallbackCode, settings.fallbackUrl).then(function (fallbackEntry) {
                return [entry, fallbackEntry];
            }, function () {
                log.warn('Locale', 'The fallback "' + fallbackCode + '" could not be loaded. Missing keys will be returned as they are.');
                return [entry, null];
            });
        }).then(function (pair) {
            /* Only the last use() call is applied; an older one still caches its files. */
            if (token === useToken) activate(pair[0], pair[1], true);
            return main;
        });
    }

    function registerLocale(code, messages) {
        if (!isLocaleCode(code)) {
            log.warn('Locale', 'register(): invalid locale code "' + code + '".');
            return false;
        }
        var key = code.toLowerCase();
        var entry = normalizeLocale(key, messages);
        if (!entry) {
            log.error('Locale', 'register(): "' + code + '" needs an object with meta.direction "ltr" or "rtl".');
            return false;
        }
        localeCache.set(key, entry);
        if (activeLocale && activeLocale.code === key) activate(entry, activeLocale.fallback, false);
        else if (activeLocale && activeLocale.fallback && activeLocale.fallback.code === key) activeLocale.fallback = entry;
        return true;
    }

    var locale = {
        use: useLocale,
        t: translate,
        get: function () { return activeLocale ? activeLocale.code : null; },
        getDirection: function () {
            if (activeLocale) return activeLocale.direction;
            return htmlEl.getAttribute('dir') === 'rtl' ? 'rtl' : 'ltr';
        },
        register: registerLocale,
        apply: applyBindings
    };

    /* ------------------------------------------------------------------ */
    /* Public namespace                                                    */
    /* ------------------------------------------------------------------ */

    var BUI = {
        version: '0.0.0-foundation',
        config: setConfig,
        register: register,
        init: init,
        getInstance: getInstance,
        destroy: destroy,
        destroyAll: destroyAll,
        on: on,
        off: off,
        emit: emit,
        trigger: trigger,
        options: options,
        dom: dom,
        utils: utils,
        log: log,
        theme: theme,
        locale: locale
    };

    window.BUI = BUI;

    /*
     * Automatic init. While the document is loading it runs on DOMContentLoaded. If the script was
     * loaded later, it runs in the next task so a BUI.config({ autoInit: false }) written right after
     * the script tag still applies. The observer starts only after this first step.
     */
    function onReady() {
        domReady = true;
        if (config.autoInit) init(document);
        applyObserver();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', onReady, { once: true });
    } else {
        window.setTimeout(onReady, 0);
    }
})(window, document);
