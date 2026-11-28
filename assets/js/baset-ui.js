/*!
 * Baset-UI - Core Script
 * Version: 0.0.0-foundation
 *
 * Task 05: the BUI namespace, component registry, init, instances, events, DOM helpers,
 * utilities, options parser, logger and the optional observer.
 * Task 06: BUI.theme (theme and mode manager) and BUI.locale (translations, direction, HTML binding).
 * Task 10: the first two components that need a little JavaScript, registered at the end of this file
 * through the public register(): avatar (image fallback) and progress (set the value). The other components are CSS only.
 * Rules: instructions/JAVASCRIPT_API.md, instructions/COMPONENT_DEVELOPMENT.md and instructions/CORE_ASSETS.md.
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

    var TOAST_POSITIONS = ['top-start', 'top-center', 'top-end', 'bottom-start', 'bottom-center', 'bottom-end'];
    var config = { autoInit: true, observe: false, logLevel: 'warn', toast: { position: 'top-end', duration: 5000, max: 5, closable: true } };
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
            } else if (key === 'toast') {
                setToastConfig(value);
            } else if (typeof value !== 'boolean') {
                log.warn('Core', 'Config option "' + key + '" must be a boolean. The current value is kept.');
            } else {
                config[key] = value;
            }
        });
        applyObserver();
        return deepMerge(config);
    }

    /* BUI.config({ toast: { position, duration, max, closable } }): the defaults of BUI.toast.show(). Invalid values keep the current one. */
    function setToastConfig(value) {
        if (!isPlainObject(value)) { log.warn('Core', 'config.toast must be a plain object. The current value is kept.'); return; }
        Object.keys(value).forEach(function (key) {
            if (!Object.prototype.hasOwnProperty.call(config.toast, key)) {
                log.warn('Core', 'Unknown toast option \"' + key + '\" in config. It was ignored.');
                return;
            }
            var v = value[key];
            var ok = key === 'position' ? TOAST_POSITIONS.indexOf(v) !== -1
                : key === 'duration' ? (typeof v === 'number' && isFinite(v) && v >= 0)
                : key === 'max' ? (typeof v === 'number' && isFinite(v) && v >= 1 && Math.floor(v) === v)
                : typeof v === 'boolean';
            if (ok) config.toast[key] = v;
            else log.warn('Core', 'Invalid value for config.toast.' + key + '. The current value is kept.');
        });
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
    /* Overlay manager (Task 13)                                           */
    /* ------------------------------------------------------------------ */

    /*
     * Keeps the stack of open overlays (Dialog and Drawer) and the one page scroll lock they share. The native <dialog> opened with
     * showModal() already supplies the top layer, the inert page behind it and Esc on the top overlay only; this manager adds what it
     * does not: the lock without layout shift, the order of the stack and cleanup when an open overlay is removed from the page.
     * Entries are { el, type, instance, release }, bottom first.
     */
    var overlayStack = [];
    var overlaySaved = null;     /* inline styles of <html> to restore while the scroll lock is on */
    var overlayObserver = null;
    var overlayHooks = [];       /* internal listeners (Task 15 Toast, Task 16 Popover and Menu), called after the stack changes so a floating layer can follow the top overlay */

    /*
     * overflow:hidden removes the page scrollbar, which would widen the page. When a scrollbar exists (innerWidth - clientWidth > 0)
     * scrollbar-gutter:stable keeps its space reserved, so neither the content nor fixed elements move. Where scrollbar-gutter is not
     * supported the same width is added as padding (fixed elements still move there). Overlay scrollbars (gap 0) need nothing.
     */
    function lockScroll() {
        if (overlaySaved) return;
        var root = document.documentElement;
        var gap = Math.max(0, window.innerWidth - root.clientWidth);
        overlaySaved = { overflow: root.style.overflow, gutter: root.style.scrollbarGutter, padding: root.style.paddingInlineEnd };
        if (gap > 0) {
            if (window.CSS && typeof window.CSS.supports === 'function' && window.CSS.supports('scrollbar-gutter', 'stable')) {
                root.style.scrollbarGutter = 'stable';
            } else {
                root.style.paddingInlineEnd = ((parseFloat(window.getComputedStyle(root).paddingInlineEnd) || 0) + gap) + 'px';
            }
        }
        root.style.overflow = 'hidden';
        root.style.setProperty('--bui-scroll-lock-gap', gap + 'px');
    }

    function unlockScroll() {
        if (!overlaySaved) return;
        var root = document.documentElement;
        root.style.overflow = overlaySaved.overflow;
        root.style.scrollbarGutter = overlaySaved.gutter;
        root.style.paddingInlineEnd = overlaySaved.padding;
        root.style.removeProperty('--bui-scroll-lock-gap');
        overlaySaved = null;
    }

    function overlayNotify() {
        overlayHooks.slice().forEach(function (hook) { hook(); });
    }

    function overlayRemove(entry) {
        var index = overlayStack.indexOf(entry);
        if (index === -1) return;
        overlayStack.splice(index, 1);
        if (!overlayStack.length) {
            unlockScroll();
            if (overlayObserver) { overlayObserver.disconnect(); overlayObserver = null; }
        }
        overlayNotify();
    }

    /* An open overlay that was removed from the document is dropped from the stack, so the scroll lock cannot leak. */
    function pruneOverlays() {
        overlayStack.slice().forEach(function (entry) {
            if (entry.el.isConnected) return;
            overlayRemove(entry);
            entry.release();
        });
    }

    function overlayPush(entry) {
        if (overlayStack.indexOf(entry) !== -1) return;
        if (!overlayStack.length) lockScroll();
        overlayStack.push(entry);
        if (!overlayObserver && typeof window.MutationObserver === 'function') {
            overlayObserver = new window.MutationObserver(pruneOverlays);
            overlayObserver.observe(document.documentElement, { childList: true, subtree: true });
        }
        overlayNotify();
    }

    var overlay = {
        /* The open overlay elements, bottom first. */
        getStack: function () { return overlayStack.map(function (entry) { return entry.el; }); },
        getTop: function () { return overlayStack.length ? overlayStack[overlayStack.length - 1].el : null; },
        /* Asks every open overlay to close (top first). Returns how many accepted; a canceled beforeclose does not count. */
        closeAll: function () {
            var count = 0;
            overlayStack.slice().reverse().forEach(function (entry) { if (entry.instance.close()) count += 1; });
            return count;
        }
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
        locale: locale,
        overlay: overlay
    };

    window.BUI = BUI;

    /* ------------------------------------------------------------------ */
    /* Components shipped with the Core (Task 10)                          */
    /* ------------------------------------------------------------------ */

    /*
     * Avatar. CSS cannot tell that an image failed to load, so this component listens to the image and, when it fails
     * (or has no src), adds .is-fallback to the avatar. The CSS then hides the image and the initials underneath show.
     * Markup: <span class="bui-avatar" data-bui-avatar><img class="bui-avatar__img" src alt="Name"><span class="bui-avatar__text" aria-hidden="true">AB</span></span>
     * Accessibility: when the fallback is on, the text takes over the name that was in the image alt (role="img" + aria-label).
     * Event: bui:avatar:fallback.
     */
    register('avatar', {
        defaults: {},
        create: function (el, options, ctx) {
            var img = el.querySelector('.bui-avatar__img');
            var text = el.querySelector('.bui-avatar__text');
            var failed = false;
            var destroyed = false;
            var saved = null;

            function setFallback(on, silent) {
                if (on === failed) return;
                failed = on;
                if (on) {
                    el.classList.add('is-fallback');
                    var name = img ? img.getAttribute('alt') : '';
                    if (text && name) {
                        saved = { role: text.getAttribute('role'), label: text.getAttribute('aria-label'), hidden: text.getAttribute('aria-hidden') };
                        text.setAttribute('role', 'img');
                        text.setAttribute('aria-label', name);
                        text.removeAttribute('aria-hidden');
                    }
                    if (!silent) ctx.trigger('fallback', { image: img });
                } else {
                    el.classList.remove('is-fallback');
                    if (text && saved) {
                        ['role', 'aria-label', 'aria-hidden'].forEach(function (attr, i) {
                            var value = saved[['role', 'label', 'hidden'][i]];
                            if (value === null) text.removeAttribute(attr); else text.setAttribute(attr, value);
                        });
                    }
                    saved = null;
                }
            }

            function check() {
                if (!img || destroyed) return;
                if (!img.getAttribute('src')) { setFallback(true); return; }
                if (!img.complete) return; /* still loading: the load or error event decides */
                if (img.naturalWidth > 0) { setFallback(false); return; }
                /* complete with no size: a failed image, or an SVG without intrinsic size. decode() tells them apart. */
                if (typeof img.decode === 'function') {
                    img.decode().then(function () { if (!destroyed) setFallback(false); }, function () { if (!destroyed) setFallback(true); });
                } else {
                    setFallback(true);
                }
            }
            function onError() { setFallback(true); }
            function onLoad() { setFallback(false); }

            if (img) {
                img.addEventListener('error', onError);
                img.addEventListener('load', onLoad);
            } else {
                ctx.log.debug('The avatar has no .bui-avatar__img, so there is nothing to watch.');
            }
            check();

            return {
                isFallback: function () { return failed; },
                refresh: check,
                destroy: function () {
                    destroyed = true;
                    if (img) {
                        img.removeEventListener('error', onError);
                        img.removeEventListener('load', onLoad);
                    }
                    setFallback(false, true);
                }
            };
        }
    });

    /*
     * Progress. The value is shown by CSS from --bui-progress-value (a percentage) and by assistive technology from aria-valuenow.
     * This component keeps both in sync: set(value) clamps to aria-valuemin/aria-valuemax, null makes the bar indeterminate
     * (no aria-valuenow), and an element with [data-bui-progress-text] shows the formatted percentage (inside the bar, or elsewhere
     * with data-bui-progress-text="{id of the progress element}"). Events: bui:progress:change and bui:progress:complete.
     * Without this component a progress bar still works: write the attributes and the --bui-progress-value yourself.
     */
    register('progress', {
        defaults: {},
        create: function (el, options, ctx) {
            var added = [];
            var min = 0;
            var max = 100;
            var value = null;

            function ensure(attr, val) {
                if (!el.hasAttribute(attr)) { el.setAttribute(attr, val); added.push(attr); }
            }
            ensure('role', 'progressbar');
            ensure('aria-valuemin', '0');
            ensure('aria-valuemax', '100');
            if (!el.hasAttribute('aria-label') && !el.hasAttribute('aria-labelledby')) {
                ctx.log.warn('A progressbar needs an accessible name: add aria-label or aria-labelledby.');
            }

            function number(attr, fallback) {
                var n = parseFloat(el.getAttribute(attr));
                return isFinite(n) ? n : fallback;
            }
            function readRange() {
                min = number('aria-valuemin', 0);
                max = number('aria-valuemax', 100);
                if (!(max > min)) {
                    ctx.log.warn('aria-valuemax must be greater than aria-valuemin. 0 and 100 are used.');
                    min = 0;
                    max = 100;
                }
            }
            function percent(v) { return Math.round(((v - min) / (max - min)) * 10000) / 100; }
            function format(p) {
                var lang = (locale.get && locale.get()) || document.documentElement.lang || undefined;
                try { return new Intl.NumberFormat(lang, { style: 'percent', maximumFractionDigits: 0 }).format(p / 100); } catch (e) { return Math.round(p) + '%'; }
            }
            function mirrors() {
                var list = Array.prototype.slice.call(el.querySelectorAll('[data-bui-progress-text=""]'));
                if (el.id) {
                    Array.prototype.forEach.call(document.getElementsByTagName('*'), function (node) {
                        if (node.getAttribute('data-bui-progress-text') === el.id) list.push(node);
                    });
                }
                return list;
            }
            function render() {
                var p = value === null ? null : percent(value);
                if (value === null) {
                    el.removeAttribute('aria-valuenow');
                    el.style.removeProperty('--bui-progress-value');
                } else {
                    el.setAttribute('aria-valuenow', String(value));
                    el.style.setProperty('--bui-progress-value', String(p));
                }
                mirrors().forEach(function (node) { node.textContent = p === null ? '' : format(p); });
            }
            function load() {
                readRange();
                var raw = el.getAttribute('aria-valuenow');
                if (raw === null) { value = null; return; }
                var n = parseFloat(raw);
                if (!isFinite(n)) {
                    ctx.log.warn('aria-valuenow is not a number, so the bar is indeterminate.');
                    value = null;
                    return;
                }
                value = Math.min(max, Math.max(min, n));
            }
            function onLocale() { render(); }

            load();
            render();
            document.documentElement.addEventListener('bui:locale:change', onLocale);

            var api = {
                set: function (next) {
                    var target;
                    if (next === null || next === undefined) {
                        target = null;
                    } else if (typeof next === 'number' && isFinite(next)) {
                        target = Math.min(max, Math.max(min, next));
                    } else {
                        ctx.log.warn('set() expects a finite number or null, got ' + String(next) + '. The value was not changed.');
                        return api;
                    }
                    var previous = value;
                    value = target;
                    render();
                    if (previous !== value) {
                        ctx.trigger('change', { value: value, percent: value === null ? null : percent(value), previousValue: previous, indeterminate: value === null });
                        if (value !== null && value === max) ctx.trigger('complete', { value: value });
                    }
                    return api;
                },
                get: function () { return value; },
                getPercent: function () { return value === null ? null : percent(value); },
                refresh: function () { load(); render(); return api; },
                destroy: function () {
                    document.documentElement.removeEventListener('bui:locale:change', onLocale);
                    added.forEach(function (attr) { el.removeAttribute(attr); });
                    added = [];
                }
            };
            return api;
        }
    });

    /*
     * Password toggle (Task 12). Shows or hides the value of a password input. The button keeps one accessible name ("Show password",
     * translated with data-bui-i18n-attr="aria-label:form.showPassword") and exposes its state with aria-pressed, so the name never changes.
     * The input is found with aria-controls (an id), or else the .bui-input of the same .bui-input-group.
     * Markup: <button type="button" class="bui-btn" data-bui-password-toggle aria-pressed="false" aria-controls="pw" aria-label="Show password">
     *             <i class="bui-icon-regular bui-icon-eye bui-password-toggle__show" aria-hidden="true"></i>
     *             <i class="bui-icon-regular bui-icon-eye-slash bui-password-toggle__hide" aria-hidden="true"></i></button>
     * Event: bui:password-toggle:toggle (detail { visible }). Without this component the input still works as a plain password field.
     */
    register('password-toggle', {
        defaults: {},
        create: function (el, options, ctx) {
            var controls = el.getAttribute('aria-controls');
            var input = controls ? document.getElementById(controls) : null;
            if (!input) {
                var group = el.closest('.bui-input-group');
                input = group ? group.querySelector('.bui-input') : null;
            }
            if (!input || input.tagName !== 'INPUT') {
                ctx.log.warn('No input found: add aria-controls with the input id, or place the button in the same .bui-input-group.');
                return { destroy: function () {} };
            }
            var originalType = input.getAttribute('type');
            var visible = false;

            function render(on) {
                visible = on;
                input.setAttribute('type', on ? 'text' : 'password');
                el.setAttribute('aria-pressed', on ? 'true' : 'false');
            }
            function set(on) {
                on = !!on;
                if (on === visible) return;
                render(on);
                ctx.trigger('toggle', { visible: visible });
            }
            function onClick() { set(!visible); }

            if (originalType !== 'password') { ctx.log.warn('The target input is not type="password"; it is switched to password.'); }
            render(false);
            el.addEventListener('click', onClick);

            return {
                show: function () { set(true); },
                hide: function () { set(false); },
                toggle: function () { set(!visible); },
                isVisible: function () { return visible; },
                destroy: function () {
                    el.removeEventListener('click', onClick);
                    if (originalType === null) { input.removeAttribute('type'); } else { input.setAttribute('type', originalType); }
                    el.removeAttribute('aria-pressed');
                }
            };
        }
    });

    /*
     * Dialog and Drawer (Task 13). One implementation for both: each is a native <dialog> opened with showModal() (see the Overlay manager
     * above). The <dialog> is the full-screen scrim and its first child is the visible panel (.bui-{type}__panel), so a click on the
     * scrim is a click on the <dialog> element itself. A pointerdown must also start there, so a drag that ends on the scrim is not a click.
     * Markup: <dialog class="bui-dialog" aria-labelledby="t" data-bui-dialog> ... </dialog>; open it with
     * <button data-bui-dialog-open="#id"> or BUI.dialog('#id').open(). data-bui-dismiss on a button inside closes the nearest overlay.
     * Events (cancelable ones marked): bui:{type}:beforeopen*, open, beforeclose* (detail.source: api, dismiss, escape, backdrop, form), close, load, loaderror.
     * They bubble, so a dialog nested in another dialog's markup also reaches the outer listeners: compare event.target.
     */
    var OVERLAY_DEFAULTS = { static: false, keyboard: true, focus: '', restoreFocus: true, url: '', load: null, loadOnce: true };
    var OVERLAY_FOCUSABLE = 'a[href], area[href], button, input, select, textarea, summary, iframe, [tabindex], [contenteditable]';

    function createOverlay(type, el, options, ctx) {
        if (!el || el.tagName !== 'DIALOG' || typeof el.showModal !== 'function') {
            throw new Error('BUI.' + type + ' needs a <dialog> element (and a browser that supports showModal()).');
        }
        var panel = el.querySelector(':scope > .bui-' + type + '__panel');
        var bodySelector = '.bui-' + type + '__body';
        var addedTabindex = false;
        if (!panel) {
            ctx.log.warn('The <dialog> has no direct child .bui-' + type + '__panel, so it will not be styled.');
        } else if (!panel.hasAttribute('tabindex')) {
            panel.setAttribute('tabindex', '-1');
            addedTabindex = true;
        }
        if (!el.hasAttribute('aria-labelledby') && !el.hasAttribute('aria-label')) {
            ctx.log.warn('The <dialog> has no accessible name: add aria-labelledby (the title id) or aria-label.');
        }

        var entry = null;
        var isOpen = false;
        var closing = false;
        var destroyed = false;
        var opener = null;
        var closeSource = 'api';
        var downOnScrim = false;
        var timers = [];
        var loadToken = 0;
        var loaded = false;
        var loading = false;
        var savedNodes = null;

        function later(fn, ms) {
            var id = window.setTimeout(function () {
                timers.splice(timers.indexOf(id), 1);
                fn();
            }, ms);
            timers.push(id);
            return id;
        }

        /* Calls done once the CSS animations running on the overlay (the scrim and the panel) have finished. */
        function afterAnimations(done) {
            var finished = false;
            function finish() {
                if (finished) return;
                finished = true;
                done();
            }
            later(finish, 2000);
            if (typeof el.getAnimations !== 'function') { finish(); return; }
            var running = el.getAnimations({ subtree: true }).filter(function (animation) {
                return animation.effect && animation.effect.getComputedTiming().iterations !== Infinity;
            });
            if (!running.length) { finish(); return; }
            Promise.all(running.map(function (animation) { return animation.finished.catch(function () {}); })).then(finish);
        }

        function focusables() {
            return Array.prototype.filter.call(el.querySelectorAll(OVERLAY_FOCUSABLE), function (node) {
                if (node.disabled || node.tabIndex < 0 || node.closest('[inert]')) return false;
                return node.getClientRects().length > 0 && window.getComputedStyle(node).visibility !== 'hidden';
            });
        }

        /* Keeps Tab inside the top overlay, so the focus never reaches the browser interface behind it. */
        function trapTab(e) {
            var top = overlayStack[overlayStack.length - 1];
            if (!top || top.el !== el) return;
            var list = focusables();
            var active = document.activeElement;
            if (!list.length) { e.preventDefault(); (panel || el).focus(); return; }
            if (e.shiftKey && (active === list[0] || active === el || active === panel)) {
                e.preventDefault();
                list[list.length - 1].focus();
            } else if (!e.shiftKey && active === list[list.length - 1]) {
                e.preventDefault();
                list[0].focus();
            }
        }

        function restoreFocus() {
            var target = opener;
            opener = null;
            if (options.restoreFocus && target && target.isConnected && typeof target.focus === 'function') {
                target.focus({ preventScroll: true });
            }
        }

        /* The overlay is closed (by close(), Esc, or any other call to the native close()): update the state and report it. */
        function finalize() {
            if (!isOpen && !closing) return;
            isOpen = false;
            closing = false;
            el.classList.remove('is-closing');
            overlayRemove(entry);
            var related = opener;
            restoreFocus();
            ctx.trigger('close', { source: closeSource, returnValue: el.returnValue, relatedTarget: related });
            closeSource = 'api';
        }

        function requestClose(source, returnValue) {
            if (!isOpen || closing) return false;
            if (!ctx.trigger('beforeclose', { source: source, relatedTarget: opener }, { cancelable: true })) return false;
            closing = true;
            closeSource = source;
            el.classList.add('is-closing');
            afterAnimations(function () {
                if (destroyed || !closing) return;
                if (el.open) { el.close(typeof returnValue === 'string' ? returnValue : undefined); } else { finalize(); }
            });
            return true;
        }

        /* A short bounce tells the user that a static overlay did not close on a click outside. */
        function bump() {
            el.classList.remove('is-static-bump');
            void el.offsetWidth;
            el.classList.add('is-static-bump');
            afterAnimations(function () { el.classList.remove('is-static-bump'); });
        }

        /* ---- Dynamic content ---- */
        function currentBody() { return panel ? panel.querySelector(bodySelector) : null; }

        function emptyBody(body) {
            BUI.destroy(body);
            while (body.firstChild) body.removeChild(body.firstChild);
        }

        function showStatus(body, key, text, role) {
            emptyBody(body);
            var line = document.createElement('p');
            line.className = 'bui-' + type + '__status';
            line.setAttribute('role', role);
            line.setAttribute('data-bui-i18n', key);
            line.textContent = text;
            body.appendChild(line);
            /* Without an active language, translate() would return the key, so the English text above stays. */
            if (locale.get()) applyBindings(line);
        }

        function fetchHtml(url) {
            var parsed;
            try { parsed = new window.URL(url, window.location.href); } catch (e) { return Promise.reject(new Error('Invalid URL "' + url + '".')); }
            if (parsed.origin !== window.location.origin) return Promise.reject(new Error('Only same-origin URLs can be loaded.'));
            return window.fetch(parsed.href, { credentials: 'same-origin', headers: { Accept: 'text/html' } }).then(function (response) {
                if (!response.ok) throw new Error('HTTP ' + response.status);
                return response.text();
            });
        }

        function startLoad() {
            var hasLoader = typeof options.load === 'function';
            if ((!options.url && !hasLoader) || loading || (loaded && options.loadOnce)) return;
            var body = currentBody();
            if (!body) { ctx.log.warn('Dynamic content needs a .bui-' + type + '__body element.'); return; }
            if (!savedNodes) {
                savedNodes = document.createDocumentFragment();
                while (body.firstChild) savedNodes.appendChild(body.firstChild);
            }
            var token = ++loadToken;
            loading = true;
            body.setAttribute('aria-busy', 'true');
            showStatus(body, 'common.loading', 'Loading...', 'status');
            var source;
            try {
                source = hasLoader ? Promise.resolve(options.load(body, ctx)) : fetchHtml(options.url);
            } catch (e) {
                source = Promise.reject(e);
            }
            source.then(function (result) {
                if (destroyed || token !== loadToken) return;
                emptyBody(body);
                if (typeof result === 'string') { body.innerHTML = result; }
                else if (result && result.nodeType) { body.appendChild(result); }
                else if (result !== undefined && result !== null) { throw new TypeError('load() must resolve with an HTML string or a Node.'); }
                loading = false;
                loaded = true;
                body.removeAttribute('aria-busy');
                init(body);
                if (locale.get()) applyBindings(body);
                ctx.trigger('load', {});
            }).catch(function (error) {
                if (destroyed || token !== loadToken) return;
                loading = false;
                loaded = false;
                body.removeAttribute('aria-busy');
                showStatus(body, 'overlay.loadError', 'The content could not be loaded.', 'alert');
                ctx.log.warn('The content could not be loaded: ' + (error && error.message ? error.message : error));
                ctx.trigger('loaderror', { error: error });
            });
        }

        function open(trigger) {
            if (isOpen || closing || el.open) { ctx.log.debug('open() ignored: already open or closing.'); return false; }
            var active = document.activeElement;
            opener = trigger && trigger.nodeType === 1 ? trigger : (active && active !== document.body ? active : null);
            if (!ctx.trigger('beforeopen', { relatedTarget: opener }, { cancelable: true })) { opener = null; return false; }
            overlayPush(entry);
            try {
                el.showModal();
            } catch (e) {
                overlayRemove(entry);
                opener = null;
                ctx.log.error('open() failed: ' + (e && e.message ? e.message : e));
                return false;
            }
            isOpen = true;
            startLoad();
            if (options.focus) {
                var wanted = el.querySelector(options.focus);
                if (wanted && typeof wanted.focus === 'function') wanted.focus();
            }
            if (document.activeElement === el && panel) panel.focus();
            ctx.trigger('open', { relatedTarget: opener });
            return true;
        }

        function onCancel(e) {
            e.preventDefault();
            if (options.keyboard) requestClose('escape');
        }

        function onKeydown(e) {
            if (e.key === 'Escape' || e.key === 'Esc') {
                /* Stopping the key itself (not only cancel) also defeats the browser's repeated-Esc close. A nested overlay owns its own Esc. */
                if (!options.keyboard && e.target.closest('dialog') === el) e.preventDefault();
            } else if (e.key === 'Tab') {
                trapTab(e);
            }
        }

        function onPointerDown(e) { downOnScrim = e.target === el; }

        function onClick(e) {
            var dismiss = e.target.closest ? e.target.closest('[data-bui-dismiss]') : null;
            /* An empty value (or this overlay's own type) dismisses it. Other values belong to other components, for example
               data-bui-dismiss="alert" on an Alert inside the dialog must not close the dialog. */
            var dismissScope = dismiss ? dismiss.getAttribute('data-bui-dismiss') : null;
            if (dismiss && dismiss.closest('dialog') === el && (dismissScope === '' || dismissScope === type)) {
                if (dismiss.tagName === 'A') e.preventDefault();
                requestClose('dismiss');
                return;
            }
            if (e.target === el && downOnScrim) {
                if (options.static) bump(); else requestClose('backdrop');
            }
            downOnScrim = false;
        }

        /* <form method="dialog"> would close the dialog without beforeclose, so the submit is taken over. */
        function onSubmit(e) {
            var form = e.target;
            if (!form || form.method !== 'dialog' || form.closest('dialog') !== el) return;
            e.preventDefault();
            requestClose('form', e.submitter && typeof e.submitter.value === 'string' ? e.submitter.value : undefined);
        }

        function onNativeClose() { finalize(); }

        var instance = {
            open: open,
            close: function (returnValue) { return requestClose('api', returnValue); },
            toggle: function () { return isOpen ? requestClose('api') : open(); },
            isOpen: function () { return isOpen; },
            destroy: function () {
                destroyed = true;
                loadToken += 1;
                timers.splice(0).forEach(function (id) { window.clearTimeout(id); });
                el.removeEventListener('cancel', onCancel);
                el.removeEventListener('keydown', onKeydown);
                el.removeEventListener('pointerdown', onPointerDown);
                el.removeEventListener('click', onClick);
                el.removeEventListener('submit', onSubmit);
                el.removeEventListener('close', onNativeClose);
                if (isOpen || closing) {
                    /* Closes at once: no animation and no events, because the listeners of this instance are already gone. */
                    isOpen = false;
                    closing = false;
                    el.classList.remove('is-closing');
                    if (el.open) el.close();
                    overlayRemove(entry);
                    restoreFocus();
                }
                el.classList.remove('is-static-bump');
                var body = currentBody();
                if (savedNodes && body) {
                    emptyBody(body);
                    body.removeAttribute('aria-busy');
                    body.appendChild(savedNodes);
                }
                savedNodes = null;
                if (addedTabindex && panel) panel.removeAttribute('tabindex');
            }
        };

        entry = {
            el: el,
            type: type,
            instance: instance,
            release: function () {
                isOpen = false;
                closing = false;
                el.classList.remove('is-closing');
                restoreFocus();
            }
        };

        el.addEventListener('cancel', onCancel);
        el.addEventListener('keydown', onKeydown);
        el.addEventListener('pointerdown', onPointerDown);
        el.addEventListener('click', onClick);
        el.addEventListener('submit', onSubmit);
        el.addEventListener('close', onNativeClose);
        return instance;
    }

    register('dialog', {
        defaults: OVERLAY_DEFAULTS,
        create: function (el, options, ctx) { return createOverlay('dialog', el, options, ctx); }
    });
    /* BUI.modal is an alias of BUI.dialog (same function). Events, attributes and getInstance() use the name "dialog". */
    BUI.modal = BUI.dialog;
    register('drawer', {
        defaults: OVERLAY_DEFAULTS,
        create: function (el, options, ctx) { return createOverlay('drawer', el, options, ctx); }
    });

    /*
     * Openers: <button data-bui-dialog-open="#id"> and <button data-bui-drawer-open="#id">. One delegated listener for the whole page
     * (not per instance), so openers added later work without a call. It starts the instance if the target was not initialized yet.
     */
    document.addEventListener('click', function (e) {
        var trigger = e.target && e.target.closest ? e.target.closest('[data-bui-dialog-open], [data-bui-drawer-open]') : null;
        if (!trigger || trigger.disabled || trigger.getAttribute('aria-disabled') === 'true') return;
        var type = trigger.hasAttribute('data-bui-dialog-open') ? 'dialog' : 'drawer';
        var selector = trigger.getAttribute('data-bui-' + type + '-open');
        var target = resolveElement(selector);
        if (trigger.tagName === 'A') e.preventDefault();
        if (!target) { log.warn(type, 'data-bui-' + type + '-open: target not found: "' + selector + '".'); return; }
        var instance = getInstance(target, type) || BUI[type](target);
        if (instance) instance.open(trigger);
    });


    /* ------------------------------------------------------------------ */
    /* Alert and Toast (Task 15)                                           */
    /* ------------------------------------------------------------------ */

    var ALERT_COLORS = ['primary', 'secondary', 'success', 'warning', 'danger', 'info'];
    var ALERT_ICONS = { primary: 'info', secondary: 'bell', success: 'check-circle', warning: 'warning', danger: 'x-circle', info: 'info' };
    var ALERT_TYPE_LABELS = {
        primary: ['alert.typePrimary', 'Notice'], secondary: ['alert.typeSecondary', 'Notice'], success: ['alert.typeSuccess', 'Success'],
        warning: ['alert.typeWarning', 'Warning'], danger: ['alert.typeDanger', 'Error'], info: ['alert.typeInfo', 'Information']
    };

    /* Calls done once the CSS animations running on el (and inside it) have finished, or after 2 s at most. Returns a cancel function. */
    function afterElementAnimations(el, done) {
        var finished = false;
        var timer = null;
        function finish() {
            if (finished) return;
            finished = true;
            window.clearTimeout(timer);
            done();
        }
        timer = window.setTimeout(finish, 2000);
        if (typeof el.getAnimations === 'function') {
            var running = el.getAnimations({ subtree: true }).filter(function (animation) {
                return animation.effect && animation.effect.getComputedTiming().iterations !== Infinity;
            });
            if (running.length) {
                Promise.all(running.map(function (animation) { return animation.finished.catch(function () {}); })).then(finish);
            } else {
                finish();
            }
        } else {
            finish();
        }
        return function cancel() { finished = true; window.clearTimeout(timer); };
    }

    /* The English fallback is used until a language is active: translate() would return the key itself. */
    function textOf(key, fallback) { return locale.get() ? translate(key) : fallback; }

    /*
     * Alert. A message in the page flow. CSS alone draws it; this component adds the dismissal (a leaving animation, then the element is
     * removed) and a default role (alert for the danger and warning colors, status for the others) when the markup has none.
     * Markup: <div class="bui-alert bui-alert--success" data-bui-alert> ... <button class="bui-btn-close" data-bui-dismiss="alert" aria-label="Close">.
     * A click on [data-bui-dismiss="alert"] works without data-bui-alert: the instance is created on demand.
     * Methods: close(), isClosed(), destroy(). Events: bui:alert:beforeclose (cancelable) and bui:alert:close (before the element is removed).
     */
    register('alert', {
        defaults: {},
        create: function (el, options, ctx) {
            var closing = false;
            var destroyed = false;
            var cancelWait = null;
            var addedRole = false;
            var instance;

            if (!el.hasAttribute('role')) {
                var danger = el.classList.contains('bui-alert--danger') || el.classList.contains('bui-alert--warning');
                el.setAttribute('role', danger ? 'alert' : 'status');
                addedRole = true;
            }

            function close() {
                if (destroyed || closing) return false;
                if (!ctx.trigger('beforeclose', {}, { cancelable: true })) return false;
                closing = true;
                el.classList.add('is-closing');
                cancelWait = afterElementAnimations(el, function () {
                    cancelWait = null;
                    if (destroyed) return;
                    ctx.trigger('close', {});
                    if (el.parentNode) el.parentNode.removeChild(el);
                    instance.destroy();
                });
                return true;
            }

            instance = {
                close: close,
                isClosed: function () { return closing; },
                destroy: function () {
                    destroyed = true;
                    if (cancelWait) { cancelWait(); cancelWait = null; }
                    el.classList.remove('is-closing');
                    if (addedRole) el.removeAttribute('role');
                }
            };
            return instance;
        }
    });

    document.addEventListener('click', function (e) {
        var button = e.target && e.target.closest ? e.target.closest('[data-bui-dismiss="alert"]') : null;
        if (!button || button.disabled || button.getAttribute('aria-disabled') === 'true') return;
        var alertEl = button.closest('.bui-alert');
        if (!alertEl) { log.warn('alert', 'data-bui-dismiss="alert" must be inside a .bui-alert element.'); return; }
        if (button.tagName === 'A') e.preventDefault();
        var instance = getInstance(alertEl, 'alert') || BUI.alert(alertEl);
        if (instance) instance.close();
    });

    /*
     * Toast manager. BUI.toast.show({ type, title, message, duration, position, closable, icon, actions }) returns a handle
     * { id, element, close(), update(partial), isOpen() }. Shortcuts: success, error, warning, info. clear() closes everything.
     *   - One live region (.bui-toast-region, role="region" + aria-live="polite") holds one stack per position. It is created when the
     *     first toast is shown and removed when the last one has left. The first toast is added a moment after the region exists,
     *     because assistive technology only announces changes in a region that is already rendered.
     *   - The region is a manual popover (top layer). A modal <dialog> makes everything outside it inert, so while an overlay is open the
     *     region is moved inside the top one (the Overlay Manager tells us); otherwise the toasts could not be focused or clicked.
     *   - Each position has its own limit (config.toast.max visible, the rest wait in a queue). The pause on hover and on focus keeps the
     *     remaining time. Focus is never moved to a toast; after a focused toast leaves, the focus goes back to where it came from.
     * Events on the toast element: bui:toast:show and bui:toast:hide (detail.reason: timeout, api, close-button, escape, action, clear).
     */
    var toastItems = new Map();       /* id -> item */
    var toastModels = {};             /* position -> { visible: [], queue: [] } */
    var toastRegion = null;
    var toastRegionReady = false;
    var toastMountQueue = [];
    var toastSeq = 0;
    var toastPopover = typeof window.HTMLElement === 'function' && typeof window.HTMLElement.prototype.showPopover === 'function';

    function toastModel(position) {
        if (!toastModels[position]) toastModels[position] = { visible: [], queue: [], pending: [] };
        return toastModels[position];
    }

    function toastIconName(value) { return typeof value === 'string' && /^[a-z][a-z0-9]*(-[a-z0-9]+)*$/.test(value); }

    /* Merges the options of one call (or one update) into the settings of an item and validates each value. Returns false if nothing can be shown. */
    function toastApply(settings, input, isUpdate) {
        var defaults = config.toast;
        if (!isUpdate || input.type !== undefined) {
            var type = input.type === undefined ? (settings.type || 'info') : input.type;
            if (type === 'error') type = 'danger';
            if (ALERT_COLORS.indexOf(type) === -1) { log.warn('Toast', 'Invalid type "' + type + '". "info" is used.'); type = 'info'; }
            settings.type = type;
        }
        ['title', 'message'].forEach(function (key) {
            if (input[key] === undefined && (isUpdate || settings[key] !== undefined)) return;
            var v = input[key];
            if (v === undefined || v === null || v === false) v = '';
            else if (typeof v === 'number') v = String(v);
            else if (typeof v !== 'string') { log.warn('Toast', key + ' must be a string. It was ignored.'); v = ''; }
            settings[key] = v;
        });
        if (!isUpdate || input.duration !== undefined) {
            var d = input.duration;
            if (d === undefined) {
                /* A toast with actions does not disappear by itself unless a duration is given (WCAG 2.2.1: time to reach the action). */
                d = settings.duration !== undefined ? settings.duration : (input.actions && input.actions.length ? 0 : defaults.duration);
            } else if (typeof d !== 'number' || !isFinite(d) || d < 0) {
                log.warn('Toast', 'duration must be a number >= 0 (0 keeps the toast until it is closed). The default is used.');
                d = defaults.duration;
            }
            settings.duration = d;
        }
        if (!isUpdate) {
            var position = input.position === undefined ? defaults.position : input.position;
            if (TOAST_POSITIONS.indexOf(position) === -1) { log.warn('Toast', 'Invalid position "' + position + '". "' + defaults.position + '" is used.'); position = defaults.position; }
            settings.position = position;
        } else if (input.position !== undefined) {
            log.warn('Toast', 'update(): the position cannot change. Close the toast and show a new one.');
        }
        if (!isUpdate || input.closable !== undefined) {
            var closable = input.closable === undefined ? defaults.closable : input.closable;
            if (typeof closable !== 'boolean') { log.warn('Toast', 'closable must be a boolean. The default is used.'); closable = defaults.closable; }
            settings.closable = closable;
        }
        if (!isUpdate || input.icon !== undefined || input.type !== undefined) {
            var icon = input.icon;
            if (icon === undefined) icon = (isUpdate && settings.iconCustom) ? settings.icon : ALERT_ICONS[settings.type];
            else if (icon === false) icon = false;
            else if (!toastIconName(icon)) { log.warn('Toast', 'icon must be an icon name (for example "check-circle") or false. The default icon is used.'); icon = ALERT_ICONS[settings.type]; }
            if (input.icon !== undefined) settings.iconCustom = true;
            settings.icon = icon;
        }
        if (!isUpdate || input.actions !== undefined) {
            var actions = [];
            if (input.actions !== undefined && !Array.isArray(input.actions)) log.warn('Toast', 'actions must be an array. It was ignored.');
            (Array.isArray(input.actions) ? input.actions : []).forEach(function (action) {
                if (!isPlainObject(action) || typeof action.label !== 'string' || !action.label) { log.warn('Toast', 'An action needs a label string. It was ignored.'); return; }
                if (action.onClick !== undefined && typeof action.onClick !== 'function') { log.warn('Toast', 'action.onClick must be a function. It was ignored.'); }
                actions.push({ label: action.label, onClick: typeof action.onClick === 'function' ? action.onClick : null, close: action.close !== false });
            });
            settings.actions = actions;
        }
        return !!(settings.title || settings.message);
    }

    function toastTopHost() {
        for (var i = overlayStack.length - 1; i >= 0; i--) {
            var host = overlayStack[i].el;
            if (host.isConnected && host.open) return host;
        }
        return document.body;
    }

    function toastPlaceRegion(target) {
        if (!toastRegion || toastRegion.parentNode === target) return;
        toastRegion.classList.add('is-relocating');
        try { if (toastPopover && toastRegion.matches(':popover-open')) toastRegion.hidePopover(); } catch (e) {}
        target.appendChild(toastRegion);
        try { if (toastPopover) toastRegion.showPopover(); } catch (e) { log.debug('Toast', 'showPopover() failed: ' + (e && e.message ? e.message : e)); }
        var region = toastRegion;
        window.setTimeout(function () { region.classList.remove('is-relocating'); }, 60);
    }

    /* Called by the Overlay Manager after the stack changes. The stack is read in a microtask, when showModal() has already run. */
    overlayHooks.push(function () {
        if (!toastRegion) return;
        Promise.resolve().then(function () { if (toastRegion) toastPlaceRegion(toastTopHost()); });
    });

    function toastEnsureRegion() {
        if (toastRegion) return;
        var region = document.createElement('div');
        region.className = 'bui-toast-region';
        region.setAttribute('role', 'region');
        region.setAttribute('aria-live', 'polite');
        region.setAttribute('aria-relevant', 'additions');
        region.setAttribute('aria-atomic', 'false');
        region.setAttribute('aria-label', textOf('toast.region', 'Notifications'));
        region.setAttribute('data-bui-i18n-attr', 'aria-label:toast.region');
        region.setAttribute('data-bui-toast-region', '');
        if (toastPopover) region.setAttribute('popover', 'manual');
        toastRegion = region;
        toastRegionReady = false;
        toastPlaceRegion(toastTopHost());
        window.setTimeout(function () {
            toastRegionReady = true;
            var queue = toastMountQueue.splice(0);
            queue.forEach(toastMount);
        }, 50);
    }

    function toastRemoveRegionIfIdle() {
        if (!toastRegion) return;
        for (var pos in toastModels) {
            if (toastModels[pos].visible.length || toastModels[pos].queue.length || toastModels[pos].pending.length) return;
        }
        if (toastMountQueue.length) return;
        try { if (toastPopover && toastRegion.matches(':popover-open')) toastRegion.hidePopover(); } catch (e) {}
        if (toastRegion.parentNode) toastRegion.parentNode.removeChild(toastRegion);
        toastRegion = null;
        toastRegionReady = false;
        toastModels = {};
    }

    function toastStack(position) {
        var existing = toastRegion.querySelector(':scope > .bui-toast-stack--' + position);
        if (existing) return existing;
        var stack = document.createElement('div');
        stack.className = 'bui-toast-stack bui-toast-stack--' + position;
        var index = TOAST_POSITIONS.indexOf(position);
        var before = null;
        Array.prototype.forEach.call(toastRegion.children, function (child) {
            if (before) return;
            var other = TOAST_POSITIONS.indexOf(child.getAttribute('data-bui-toast-position'));
            if (other > index) before = child;
        });
        stack.setAttribute('data-bui-toast-position', position);
        toastRegion.insertBefore(stack, before);
        return stack;
    }

    function toastFill(item) {
        var settings = item.settings;
        var el = item.el;
        el.className = 'bui-toast bui-alert bui-alert--' + settings.type;
        el.setAttribute('role', settings.type === 'danger' ? 'alert' : 'status');
        while (el.firstChild) el.removeChild(el.firstChild);
        if (settings.icon) {
            var icon = document.createElement('i');
            icon.className = 'bui-icon-regular bui-icon-' + settings.icon + ' bui-alert__icon';
            icon.setAttribute('aria-hidden', 'true');
            el.appendChild(icon);
        }
        var content = document.createElement('div');
        content.className = 'bui-alert__content';
        /* Tells the type without relying on color or icon: read before the title. */
        var label = ALERT_TYPE_LABELS[settings.type];
        var typeText = document.createElement('span');
        typeText.className = 'bui-visually-hidden';
        typeText.setAttribute('data-bui-i18n', label[0]);
        typeText.textContent = textOf(label[0], label[1]);
        content.appendChild(typeText);
        if (settings.title) {
            var title = document.createElement('p');
            title.className = 'bui-alert__title';
            title.textContent = settings.title;
            content.appendChild(title);
        }
        if (settings.message) {
            var message = document.createElement('div');
            message.className = 'bui-alert__description';
            message.textContent = settings.message;
            content.appendChild(message);
        }
        if (settings.actions.length) {
            var actions = document.createElement('div');
            actions.className = 'bui-alert__actions';
            settings.actions.forEach(function (action) {
                var button = document.createElement('button');
                button.type = 'button';
                button.className = 'bui-btn bui-btn--sm bui-btn--outline bui-btn--secondary';
                button.textContent = action.label;
                button.addEventListener('click', function (e) {
                    if (action.onClick) {
                        try { action.onClick(item.handle, e); } catch (err) { log.error('Toast', 'An action handler threw: ' + (err && err.message ? err.message : err)); }
                    }
                    if (action.close) toastClose(item, 'action');
                });
                actions.appendChild(button);
            });
            content.appendChild(actions);
        }
        el.appendChild(content);
        if (settings.closable) {
            var close = document.createElement('button');
            close.type = 'button';
            close.className = 'bui-btn-close bui-alert__close';
            close.setAttribute('aria-label', textOf('common.close', 'Close'));
            close.setAttribute('data-bui-i18n-attr', 'aria-label:common.close');
            var x = document.createElement('i');
            x.className = 'bui-icon-regular bui-icon-x';
            x.setAttribute('aria-hidden', 'true');
            close.appendChild(x);
            close.addEventListener('click', function () { toastClose(item, 'close-button'); });
            el.appendChild(close);
        }
    }

    function toastStartTimer(item) {
        window.clearTimeout(item.timer);
        item.timer = null;
        if (item.status !== 'shown' || item.settings.duration === 0 || item.hovered || item.focused) return;
        item.startedAt = Date.now();
        item.timer = window.setTimeout(function () { item.timer = null; toastClose(item, 'timeout'); }, Math.max(0, item.remaining));
    }

    function toastPauseTimer(item) {
        if (item.timer === null) return;
        window.clearTimeout(item.timer);
        item.timer = null;
        item.remaining = Math.max(0, item.remaining - (Date.now() - item.startedAt));
    }

    function toastMount(item) {
        if (item.status !== 'pending') return;
        var model = toastModel(item.settings.position);
        var pendingIndex = model.pending.indexOf(item);
        if (pendingIndex !== -1) model.pending.splice(pendingIndex, 1);
        var stack = toastStack(item.settings.position);
        var el = document.createElement('div');
        el.setAttribute('data-bui-toast-id', item.id);
        item.el = el;
        toastFill(item);
        if (locale.get()) locale.apply(el);
        item.status = 'shown';
        item.remaining = item.settings.duration;
        model.visible.push(item);
        /* The newest toast goes to the screen edge: first in a top stack, last in a bottom stack. */
        if (item.settings.position.indexOf('top') === 0) stack.insertBefore(el, stack.firstChild); else stack.appendChild(el);

        el.addEventListener('mouseenter', function () { item.hovered = true; toastPauseTimer(item); });
        el.addEventListener('mouseleave', function () { item.hovered = false; toastStartTimer(item); });
        el.addEventListener('focusin', function (e) {
            var from = e.relatedTarget;
            if (!item.focused && from && from.nodeType === 1 && !el.contains(from)) item.returnFocus = from;
            item.focused = true;
            toastPauseTimer(item);
        });
        el.addEventListener('focusout', function (e) {
            if (e.relatedTarget && el.contains(e.relatedTarget)) return;
            item.focused = false;
            toastStartTimer(item);
        });
        el.addEventListener('keydown', function (e) {
            if (e.key !== 'Escape' || !item.settings.closable) return;
            /* Stops the keydown so an open Dialog does not treat this Esc as its own close request. */
            e.preventDefault();
            e.stopPropagation();
            toastClose(item, 'escape');
        });
        toastStartTimer(item);
        trigger(el, 'toast', 'show', { id: item.id, type: item.settings.type, position: item.settings.position });
    }

    function toastPlace(item) {
        var model = toastModel(item.settings.position);
        if (model.visible.length + model.pending.length < config.toast.max) {
            item.status = 'pending';
            model.pending.push(item);
            toastEnsureRegion();
            if (toastRegionReady) toastMount(item); else toastMountQueue.push(item);
        } else {
            item.status = 'queued';
            model.queue.push(item);
        }
    }

    function toastClose(item, reason) {
        if (item.status === 'queued' || item.status === 'pending') {
            var model = toastModel(item.settings.position);
            var q = model.queue.indexOf(item);
            if (q !== -1) model.queue.splice(q, 1);
            var p = model.pending.indexOf(item);
            if (p !== -1) model.pending.splice(p, 1);
            var m = toastMountQueue.indexOf(item);
            if (m !== -1) toastMountQueue.splice(m, 1);
            item.status = 'closed';
            toastItems.delete(item.id);
            toastRemoveRegionIfIdle();
            return true;
        }
        if (item.status !== 'shown') return false;
        item.status = 'closing';
        window.clearTimeout(item.timer);
        item.timer = null;
        item.el.classList.add('is-closing');
        afterElementAnimations(item.el, function () { toastFinish(item, reason); });
        return true;
    }

    function toastFinish(item, reason) {
        var el = item.el;
        var hadFocus = el.contains(document.activeElement);
        trigger(el, 'toast', 'hide', { id: item.id, type: item.settings.type, position: item.settings.position, reason: reason });
        var model = toastModel(item.settings.position);
        var index = model.visible.indexOf(item);
        if (index !== -1) model.visible.splice(index, 1);
        var stack = el.parentNode;
        if (stack) stack.removeChild(el);
        if (stack && !stack.children.length && stack.parentNode) stack.parentNode.removeChild(stack);
        item.status = 'closed';
        item.el = null;
        toastItems.delete(item.id);
        if (hadFocus && item.returnFocus && item.returnFocus.isConnected && typeof item.returnFocus.focus === 'function') item.returnFocus.focus();
        while (model.visible.length < config.toast.max && model.queue.length) {
            var next = model.queue.shift();
            next.status = 'pending';
            toastMount(next);
        }
        toastRemoveRegionIfIdle();
    }

    function toastUpdate(item, partial) {
        if (item.status === 'closing' || item.status === 'closed') return false;
        if (!isPlainObject(partial)) { log.warn('Toast', 'update() needs a plain object.'); return false; }
        var next = deepMerge(item.settings);
        next.actions = item.settings.actions;
        if (!toastApply(next, partial, true)) { log.warn('Toast', 'update() would leave the toast without a title and a message. Nothing changed.'); return false; }
        var durationChanged = partial.duration !== undefined;
        item.settings = next;
        if (item.status === 'shown') {
            toastFill(item);
            if (locale.get()) locale.apply(item.el);
            if (durationChanged) { item.remaining = next.duration; toastStartTimer(item); }
        } else if (durationChanged) {
            item.remaining = next.duration;
        }
        return true;
    }

    function toastShow(input) {
        if (!isPlainObject(input)) { log.warn('Toast', 'show() needs a plain object, for example BUI.toast.show({ type: "success", message: "Saved" }).'); return null; }
        var settings = {};
        if (!toastApply(settings, input, false)) { log.warn('Toast', 'show() needs a title or a message.'); return null; }
        toastSeq += 1;
        var item = { id: 'bui-toast-' + toastSeq, settings: settings, status: 'pending', el: null, timer: null, startedAt: 0, remaining: settings.duration, hovered: false, focused: false, returnFocus: null, handle: null };
        item.handle = {
            id: item.id,
            get element() { return item.el; },
            close: function () { return toastClose(item, 'api'); },
            update: function (partial) { return toastUpdate(item, partial); },
            isOpen: function () { return item.status === 'shown' || item.status === 'queued' || item.status === 'pending'; }
        };
        toastItems.set(item.id, item);
        toastPlace(item);
        return item.handle;
    }

    function toastShortcut(type) {
        return function (messageOrOptions, options) {
            var input = {};
            if (typeof messageOrOptions === 'string') {
                input = isPlainObject(options) ? deepMerge(options) : {};
                input.message = messageOrOptions;
            } else if (isPlainObject(messageOrOptions)) {
                input = deepMerge(messageOrOptions);
                if (isPlainObject(options)) input = deepMerge(input, options);
            } else {
                log.warn('Toast', type + '() needs a message string or an options object.');
                return null;
            }
            input.type = type;
            if (isPlainObject(messageOrOptions) && Array.isArray(messageOrOptions.actions)) input.actions = messageOrOptions.actions;
            if (isPlainObject(options) && Array.isArray(options.actions)) input.actions = options.actions;
            return toastShow(input);
        };
    }

    var toast = {
        show: toastShow,
        success: toastShortcut('success'),
        error: toastShortcut('danger'),
        warning: toastShortcut('warning'),
        info: toastShortcut('info'),
        /* Closes every toast (shown ones with the leaving animation) and drops the queued ones. Returns how many were affected. */
        clear: function () {
            var count = 0;
            Array.from(toastItems.values()).forEach(function (item) { if (toastClose(item, 'clear')) count += 1; });
            return count;
        }
    };
    BUI.toast = toast;

    /* ------------------------------------------------------------------ */
    /* Positioning Engine (Task 16)                                        */
    /* ------------------------------------------------------------------ */

    /*
     * BUI.position(anchor, floating, options) places a floating element (a Popover, a Menu, later a Select list) next to an anchor and
     * keeps it there. Internal API: the library's own components use it; it is documented, but it may still change before 1.0.
     *   options: placement ('bottom'; top|bottom|start|end, optionally with -start or -end), offset (8, px between anchor and floating),
     *            padding (8, px kept free at the viewport edges), flip (true), shift (true), arrow (an element or null),
     *            arrowPadding (8), autoUpdate (true), hideWhenClipped (true), onUpdate (function or null).
     *   returns: { update(), destroy(), getPlacement() } or null for invalid arguments.
     * The floating element is positioned with position: fixed and inline left/top computed from rectangles (physical coordinates: they
     * come from measurements, not from the stylesheet). The engine owns these inline properties of the floating element: position,
     * margin, right, bottom, left, top and the two custom properties below. It also sets data-bui-side (top|bottom|left|right: where the
     * floating element is, physically), data-bui-placement (the same with start|end, logical) and data-bui-detached while the anchor is
     * scrolled out of view. start and end follow the direction of the anchor, so they swap in RTL.
     *   --bui-position-available-width and --bui-position-available-height: room left for the floating element on the chosen side.
     * Flip: when the chosen side lacks room and the opposite side has more, the opposite side is used. Shift: the element is moved along
     * the edge (and, as a last resort, along the main axis) so it stays inside the viewport. The arrow slides along the edge to keep
     * pointing at the anchor center. Updates run on scroll of every scrollable ancestor of the anchor and of the window, on resize and
     * when the anchor or the floating element changes size; destroy() removes all of it.
     */
    var POSITION_RE = /^(top|bottom|start|end)(?:-(start|end))?$/;
    var POSITION_OPPOSITE = { top: 'bottom', bottom: 'top', left: 'right', right: 'left' };

    function positionScrollParents(el) {
        var list = [];
        var node = el.parentNode;
        while (node && node.nodeType === 1 && node !== document.body && node !== document.documentElement) {
            var cs = window.getComputedStyle(node);
            if (/(auto|scroll|overlay|hidden|clip)/.test(cs.overflowX + ' ' + cs.overflowY)) list.push(node);
            node = node.parentNode;
        }
        return list;
    }

    function position(anchor, floating, opts) {
        if (!isElement(anchor) || !isElement(floating)) {
            log.warn('Position', 'position() needs an anchor element and a floating element.');
            return null;
        }
        var input = isPlainObject(opts) ? opts : {};
        var settings = {
            placement: 'bottom', offset: 8, padding: 8, flip: true, shift: true, arrow: null,
            arrowPadding: 8, autoUpdate: true, hideWhenClipped: true, onUpdate: null
        };
        Object.keys(input).forEach(function (key) {
            if (key in settings) settings[key] = input[key];
            else log.warn('Position', 'Unknown option "' + key + '".');
        });
        if (typeof settings.placement !== 'string' || !POSITION_RE.test(settings.placement)) {
            log.warn('Position', 'Invalid placement "' + settings.placement + '", using "bottom".');
            settings.placement = 'bottom';
        }
        ['offset', 'padding', 'arrowPadding'].forEach(function (key) {
            if (typeof settings[key] !== 'number' || !isFinite(settings[key]) || settings[key] < 0) {
                log.warn('Position', 'Option "' + key + '" must be a number >= 0.');
                settings[key] = 8;
            }
        });
        if (settings.arrow && !isElement(settings.arrow)) settings.arrow = null;

        var destroyed = false;
        var frame = 0;
        var last = null;
        var parents = positionScrollParents(anchor);
        var observer = null;

        floating.style.position = 'fixed';
        floating.style.margin = '0';
        floating.style.right = 'auto';
        floating.style.bottom = 'auto';

        function pass() {
            var root = document.documentElement;
            var vw = root.clientWidth;
            var vh = root.clientHeight;
            var rtl = window.getComputedStyle(anchor).direction === 'rtl';
            var pad = settings.padding;
            var arrow = settings.arrow;

            /* Measured at the origin: a fixed element next to the right edge would otherwise shrink to fit the room that is left. */
            floating.style.left = '0px';
            floating.style.top = '0px';
            var a = anchor.getBoundingClientRect();
            var f = floating.getBoundingClientRect();
            var fw = f.width;
            var fh = f.height;
            var arrowSize = arrow ? arrow.offsetWidth : 0;
            var gap = settings.offset + arrowSize * 0.7071;

            var m = POSITION_RE.exec(settings.placement);
            var align = m[2] || null;
            var side = m[1];
            if (side === 'start') side = rtl ? 'right' : 'left';
            else if (side === 'end') side = rtl ? 'left' : 'right';

            function room(s) {
                if (s === 'top') return a.top - pad;
                if (s === 'bottom') return vh - a.bottom - pad;
                if (s === 'left') return a.left - pad;
                return vw - a.right - pad;
            }
            function need(s) { return ((s === 'top' || s === 'bottom') ? fh : fw) + gap; }

            if (settings.flip && room(side) < need(side) && room(POSITION_OPPOSITE[side]) > room(side)) side = POSITION_OPPOSITE[side];
            var vertical = side === 'top' || side === 'bottom';

            var x;
            var y;
            if (vertical) {
                y = side === 'top' ? a.top - fh - gap : a.bottom + gap;
                if (!align) x = a.left + a.width / 2 - fw / 2;
                else x = ((align === 'start') !== rtl) ? a.left : a.right - fw;
            } else {
                x = side === 'left' ? a.left - fw - gap : a.right + gap;
                if (!align) y = a.top + a.height / 2 - fh / 2;
                else y = align === 'start' ? a.top : a.bottom - fh;
            }
            if (settings.shift) {
                x = Math.min(Math.max(x, pad), Math.max(pad, vw - fw - pad));
                y = Math.min(Math.max(y, pad), Math.max(pad, vh - fh - pad));
            }

            var roomMain = Math.max(0, room(side) - gap);
            floating.style.setProperty('--bui-position-available-height', Math.floor(vertical ? roomMain : Math.max(0, vh - 2 * pad)) + 'px');
            floating.style.setProperty('--bui-position-available-width', Math.floor(vertical ? Math.max(0, vw - 2 * pad) : roomMain) + 'px');

            /* Snapped to device pixels (crisp text); a snap must never push the element past the padding the shift just kept. */
            var dpr = window.devicePixelRatio || 1;
            var sx = Math.round(x * dpr) / dpr;
            var sy = Math.round(y * dpr) / dpr;
            if (settings.shift) {
                var maxX = Math.max(pad, vw - fw - pad);
                var maxY = Math.max(pad, vh - fh - pad);
                if (sx > maxX) sx = Math.floor(maxX * dpr) / dpr;
                if (sy > maxY) sy = Math.floor(maxY * dpr) / dpr;
            }
            floating.style.left = sx + 'px';
            floating.style.top = sy + 'px';

            if (arrow) {
                var half = arrowSize / 2;
                var ap = settings.arrowPadding;
                if (vertical) {
                    arrow.style.left = Math.min(Math.max(a.left + a.width / 2 - x - half, ap), Math.max(ap, fw - arrowSize - ap)) + 'px';
                    arrow.style.top = '';
                } else {
                    arrow.style.top = Math.min(Math.max(a.top + a.height / 2 - y - half, ap), Math.max(ap, fh - arrowSize - ap)) + 'px';
                    arrow.style.left = '';
                }
            }

            var logical = side;
            if (side === 'left') logical = rtl ? 'end' : 'start';
            else if (side === 'right') logical = rtl ? 'start' : 'end';
            floating.setAttribute('data-bui-side', side);
            floating.setAttribute('data-bui-placement', logical + (align ? '-' + align : ''));

            var detached = false;
            if (settings.hideWhenClipped) {
                var clipped = function (box) { return a.bottom <= box.top || a.top >= box.bottom || a.right <= box.left || a.left >= box.right; };
                detached = clipped({ top: 0, left: 0, bottom: vh, right: vw }) || parents.some(function (parent) { return clipped(parent.getBoundingClientRect()); });
            }
            if (detached) floating.setAttribute('data-bui-detached', '');
            else floating.removeAttribute('data-bui-detached');

            var after = floating.getBoundingClientRect();
            return {
                placement: floating.getAttribute('data-bui-placement'),
                side: side,
                x: x,
                y: y,
                detached: detached,
                resized: Math.abs(after.width - fw) > 0.5 || Math.abs(after.height - fh) > 0.5
            };
        }

        function update() {
            if (destroyed || !anchor.isConnected || !floating.isConnected || !floating.getClientRects().length) return last;
            var result = pass();
            /* The available size feeds max-height and max-width in CSS, so the size can change once after the first pass. */
            if (result.resized) result = pass();
            last = result;
            if (typeof settings.onUpdate === 'function') {
                try { settings.onUpdate(result); } catch (e) { log.error('Position', 'The onUpdate callback threw an error.', e); }
            }
            return result;
        }

        function schedule() {
            if (frame || destroyed) return;
            frame = window.requestAnimationFrame(function () { frame = 0; update(); });
        }

        if (settings.autoUpdate) {
            parents.forEach(function (parent) { parent.addEventListener('scroll', schedule, { passive: true }); });
            window.addEventListener('scroll', schedule, { passive: true });
            window.addEventListener('resize', schedule);
            if (typeof window.ResizeObserver === 'function') {
                observer = new window.ResizeObserver(schedule);
                observer.observe(anchor);
                observer.observe(floating);
            }
        }
        update();

        return {
            update: update,
            getPlacement: function () { return last ? last.placement : null; },
            destroy: function () {
                if (destroyed) return;
                destroyed = true;
                if (frame) { window.cancelAnimationFrame(frame); frame = 0; }
                if (observer) { observer.disconnect(); observer = null; }
                parents.forEach(function (parent) { parent.removeEventListener('scroll', schedule); });
                window.removeEventListener('scroll', schedule);
                window.removeEventListener('resize', schedule);
                ['position', 'margin', 'right', 'bottom', 'left', 'top'].forEach(function (name) { floating.style.removeProperty(name); });
                floating.style.removeProperty('--bui-position-available-height');
                floating.style.removeProperty('--bui-position-available-width');
                floating.removeAttribute('data-bui-side');
                floating.removeAttribute('data-bui-placement');
                floating.removeAttribute('data-bui-detached');
                if (settings.arrow) { settings.arrow.style.removeProperty('left'); settings.arrow.style.removeProperty('top'); }
            }
        };
    }
    BUI.position = position;

    /* ------------------------------------------------------------------ */
    /* Floating layers: shared by Popover and Menu (Task 16)               */
    /* ------------------------------------------------------------------ */

    /*
     * A floating layer is an open Popover or Menu. The controller moves the floating element next to the page (or inside the open
     * Dialog or Drawer that holds the trigger), puts it in the top layer with the Popover API when the browser has it, positions it with
     * BUI.position, and gives both components the same outside click, Esc and focus rules. Why the move: the native <dialog> opened with
     * showModal() makes everything outside it inert, so a floating element left in the page could not be focused or clicked.
     * One set of document listeners serves all open layers and is removed when the last one closes.
     */
    var layers = [];
    var layersListening = false;
    var popoverApi = typeof window.HTMLElement === 'function' && typeof window.HTMLElement.prototype.showPopover === 'function';
    var FOCUSABLE = 'a[href], button:not([disabled]), input:not([disabled]):not([type="hidden"]), select:not([disabled]), textarea:not([disabled]), summary, [tabindex]:not([tabindex="-1"])';

    function visibleFocusables(root) {
        return Array.from(root.querySelectorAll(FOCUSABLE)).filter(function (node) { return node.getClientRects().length > 0; });
    }

    function layerHost(trigger) {
        var host = trigger.closest ? trigger.closest('dialog') : null;
        if (host && host.open && overlayStack.some(function (entry) { return entry.el === host; })) return host;
        return document.body;
    }

    function layerContains(layer, node) {
        if (layer.floating.contains(node) || layer.trigger.contains(node)) return true;
        return layers.some(function (child) { return child.parent === layer && layerContains(child, node); });
    }

    function pruneLayers() {
        layers.slice().forEach(function (layer) { if (!layer.trigger.isConnected) layer.close('detached'); });
    }

    function onLayerPointer(e) {
        pruneLayers();
        layers.slice().reverse().forEach(function (layer) {
            if (layer.open && layer.closeOnOutside && !layerContains(layer, e.target)) layer.close('outside');
        });
    }

    function onLayerFocus(e) {
        layers.slice().reverse().forEach(function (layer) {
            if (layer.open && layer.closeOnFocusOut && !layerContains(layer, e.target)) layer.close('focusout');
        });
    }

    function onLayerKey(e) {
        if (e.key !== 'Escape' || !layers.length) return;
        var top = layers[layers.length - 1];
        if (!top.keyboard) return;
        /* Stops the native close of an open Dialog behind the layer: Esc closes the topmost thing only. */
        e.preventDefault();
        e.stopPropagation();
        top.close('escape');
    }

    function layerAdd(layer) {
        layers.push(layer);
        if (layersListening) return;
        layersListening = true;
        document.addEventListener('pointerdown', onLayerPointer, true);
        document.addEventListener('focusin', onLayerFocus, true);
        document.addEventListener('keydown', onLayerKey, true);
    }

    function layerRemove(layer) {
        var index = layers.indexOf(layer);
        if (index === -1) return;
        layers.splice(index, 1);
        layers.forEach(function (other) { if (other.parent === layer) other.parent = null; });
        if (layers.length || !layersListening) return;
        layersListening = false;
        document.removeEventListener('pointerdown', onLayerPointer, true);
        document.removeEventListener('focusin', onLayerFocus, true);
        document.removeEventListener('keydown', onLayerKey, true);
    }

    /* A layer whose host is no longer the top overlay is inert or hidden behind it, so it closes. */
    overlayHooks.push(function () {
        if (!layers.length) return;
        Promise.resolve().then(function () {
            var expected = toastTopHost();
            layers.slice().forEach(function (layer) { if (layer.host !== expected) layer.close('overlay'); });
        });
    });

    /* Copies the mode, theme, direction and language of the nearest scope of the trigger when the floating element leaves that scope. */
    function copyScope(trigger, floating, host) {
        var set = [];
        ['data-bui-mode', 'data-bui-theme', 'dir', 'lang'].forEach(function (name) {
            var scope = trigger.closest('[' + name + ']');
            if (!scope || scope === document.documentElement || scope.contains(host)) return;
            floating.setAttribute(name, scope.getAttribute(name));
            set.push(name);
        });
        return set;
    }

    function floatingController(cfg) {
        var el = cfg.trigger;
        var control = cfg.control || el;      /* the element that carries aria-expanded (a combobox inside the trigger area); defaults to the trigger */
        var floating = cfg.floating;
        var events = cfg.events;
        var isOpen = false;
        var destroyed = false;
        var placeholder = null;
        var engine = null;
        var scopeAttrs = [];
        var addedPopoverAttr = false;
        var layer = {
            trigger: el, floating: floating, host: null, parent: null, open: false,
            closeOnOutside: cfg.closeOnOutside, closeOnFocusOut: cfg.closeOnFocusOut, keyboard: cfg.keyboard,
            close: function (reason) { return close(reason); }
        };

        if (popoverApi && !floating.hasAttribute('popover')) {
            floating.setAttribute('popover', 'manual');
            addedPopoverAttr = true;
        }

        function open(source, extra) {
            if (destroyed || isOpen) return false;
            if (cfg.fire(events.beforeOpen, { source: source }, true) === false) return false;
            var host = layerHost(el);
            if (floating.parentNode !== host) {
                placeholder = document.createComment('bui-floating');
                if (floating.parentNode) floating.parentNode.insertBefore(placeholder, floating);
                host.appendChild(floating);
            }
            scopeAttrs = copyScope(el, floating, host);
            layer.host = host;
            layer.parent = layers.filter(function (other) { return other.floating.contains(el); }).pop() || null;
            floating.classList.add('is-open');
            if (popoverApi) { try { floating.showPopover(); } catch (e) { log.debug('Floating', 'showPopover() failed: ' + (e && e.message ? e.message : e)); } }
            isOpen = true;
            layer.open = true;
            control.setAttribute('aria-expanded', 'true');
            engine = position(el, floating, {
                placement: cfg.placement(), offset: cfg.offset(), flip: cfg.flip(), shift: cfg.shift(), arrow: cfg.arrow
            });
            layerAdd(layer);
            if (cfg.onOpened) cfg.onOpened(source, extra || {});
            cfg.fire(events.open, { source: source }, false);
            return true;
        }

        function finish(source, emit) {
            var hadFocus = floating.contains(document.activeElement);
            if (engine) { engine.destroy(); engine = null; }
            layerRemove(layer);
            isOpen = false;
            layer.open = false;
            layer.host = null;
            layer.parent = null;
            try { if (popoverApi && floating.matches(':popover-open')) floating.hidePopover(); } catch (e) { /* already hidden */ }
            floating.classList.remove('is-open');
            scopeAttrs.forEach(function (name) { floating.removeAttribute(name); });
            scopeAttrs = [];
            if (placeholder) {
                if (placeholder.parentNode) { placeholder.parentNode.insertBefore(floating, placeholder); placeholder.parentNode.removeChild(placeholder); }
                placeholder = null;
            }
            control.setAttribute('aria-expanded', 'false');
            if (hadFocus && cfg.restoreFocus() && emit && source !== 'outside' && source !== 'focusout' && source !== 'overlay' && el.isConnected) {
                try { el.focus({ preventScroll: true }); } catch (e) { /* not focusable */ }
            }
            if (emit) cfg.fire(events.close, { source: source }, false);
        }

        function close(source) {
            if (destroyed || !isOpen) return false;
            if (cfg.fire(events.beforeClose, { source: source || 'api' }, true) === false) return false;
            finish(source || 'api', true);
            return true;
        }

        return {
            open: open,
            close: close,
            toggle: function (source) { return isOpen ? close(source) : open(source); },
            isOpen: function () { return isOpen; },
            update: function () { if (engine) engine.update(); },
            layer: layer,
            destroy: function () {
                if (destroyed) return;
                if (isOpen) finish('destroy', false);
                destroyed = true;
                if (addedPopoverAttr) floating.removeAttribute('popover');
            }
        };
    }

    /* Adds a listener and returns what removes it. */
    function listen(target, type, handler, opts) {
        target.addEventListener(type, handler, opts);
        return function () { target.removeEventListener(type, handler, opts); };
    }

    /*
     * Popover. A small floating panel with a title and content, opened from a trigger.
     * Markup: <button class="bui-btn" data-bui-popover data-bui-title="Title" data-bui-content="Text">Open</button>  (the panel is built)
     *     or  <button data-bui-popover data-bui-target="#id">  /  the panel as the next sibling of the trigger: <div class="bui-popover">.
     * Options: target, title, content, trigger (click|hover|focus|manual, several separated by a space), placement, offset, arrow, flip,
     * shift, closeOnOutside, keyboard, focus, restoreFocus, delay. Methods: show, hide, toggle, isOpen, update, destroy.
     * Events (on the trigger): bui:popover:beforeshow (cancelable), show, beforehide (cancelable), hide; detail.source tells why.
     */
    register('popover', {
        defaults: {
            target: '', title: '', content: '', trigger: 'click', placement: 'bottom', offset: 8, arrow: true, flip: true, shift: true,
            closeOnOutside: true, keyboard: true, focus: true, restoreFocus: true, delay: 150
        },
        create: function (el, options, ctx) {
            var log2 = ctx.log;
            var cleanups = [];
            var timers = [];
            var added = [];          /* attributes added to the trigger or the panel, removed by destroy() */
            var panel = null;
            var built = false;
            var arrowEl = null;
            var openedBy = '';

            var triggers = String(options.trigger).split(/\s+/).filter(Boolean).filter(function (name, index, list) {
                var ok = name === 'click' || name === 'hover' || name === 'focus' || name === 'manual';
                if (!ok) log2.warn('Unknown trigger "' + name + '". Allowed: click, hover, focus, manual.');
                return ok && list.indexOf(name) === index;
            });
            if (!triggers.length || (triggers.indexOf('manual') > -1 && triggers.length > 1)) {
                if (triggers.length) log2.warn('"manual" cannot be combined with other triggers.');
                triggers = triggers.indexOf('manual') > -1 ? ['manual'] : ['click'];
            }
            if (!POSITION_RE.test(options.placement)) { log2.warn('Invalid placement "' + options.placement + '", using "bottom".'); options.placement = 'bottom'; }
            if (typeof options.offset !== 'number' || options.offset < 0) options.offset = 8;
            if (typeof options.delay !== 'number' || options.delay < 0) options.delay = 150;

            function setAttr(node, name, value) {
                if (!node.hasAttribute(name)) added.push([node, name]);
                node.setAttribute(name, value);
            }

            if (options.target) {
                try { panel = document.querySelector(options.target); } catch (e) { panel = null; }
                if (!panel) log2.warn('The target "' + options.target + '" was not found.');
            } else if (el.nextElementSibling && el.nextElementSibling.classList.contains('bui-popover')) {
                panel = el.nextElementSibling;
            } else if (options.title || options.content) {
                panel = document.createElement('div');
                panel.className = 'bui-popover';
                if (options.title) {
                    var header = document.createElement('div');
                    header.className = 'bui-popover__header';
                    var title = document.createElement('div');
                    title.className = 'bui-popover__title';
                    title.textContent = options.title;
                    header.appendChild(title);
                    panel.appendChild(header);
                }
                if (options.content) {
                    var body = document.createElement('div');
                    body.className = 'bui-popover__body';
                    body.textContent = options.content;
                    panel.appendChild(body);
                }
                el.parentNode.insertBefore(panel, el.nextSibling);
                built = true;
            } else {
                log2.error('A popover needs content: set data-bui-title or data-bui-content, point data-bui-target at a .bui-popover element, or put it right after the trigger.');
            }
            if (!panel) {
                return { show: function () { return false; }, hide: function () { return false; }, toggle: function () { return false; }, isOpen: function () { return false; }, update: function () {}, destroy: function () {} };
            }

            if (!panel.id) setAttr(panel, 'id', uid('bui-popover'));
            if (!panel.hasAttribute('role')) setAttr(panel, 'role', 'dialog');
            var titleEl = panel.querySelector('.bui-popover__title');
            if (titleEl && !panel.hasAttribute('aria-labelledby') && !panel.hasAttribute('aria-label')) {
                if (!titleEl.id) setAttr(titleEl, 'id', uid('bui-popover-title'));
                setAttr(panel, 'aria-labelledby', titleEl.id);
            }
            if (!panel.hasAttribute('aria-labelledby') && !panel.hasAttribute('aria-label')) {
                var triggerName = el.getAttribute('aria-label');
                if (triggerName) setAttr(panel, 'aria-label', triggerName);
                else log2.warn('The popover has no accessible name: add a title, aria-labelledby or aria-label.');
            }
            if (!panel.hasAttribute('tabindex')) setAttr(panel, 'tabindex', '-1');
            if (options.arrow) {
                arrowEl = panel.querySelector(':scope > .bui-popover__arrow');
                if (!arrowEl) {
                    arrowEl = document.createElement('div');
                    arrowEl.className = 'bui-popover__arrow';
                    arrowEl.setAttribute('aria-hidden', 'true');
                    panel.insertBefore(arrowEl, panel.firstChild);
                    added.push([arrowEl, null]);
                }
            }
            setAttr(el, 'aria-controls', panel.id);
            setAttr(el, 'aria-haspopup', 'dialog');
            setAttr(el, 'aria-expanded', 'false');
            if (!/^(a|button|input|summary|select|textarea)$/i.test(el.tagName) && !el.hasAttribute('tabindex')) {
                log2.warn('The trigger is not focusable. Use a <button> (or add tabindex="0" and a key handler).');
            }

            var instance;
            var controller = floatingController({
                trigger: el,
                floating: panel,
                arrow: arrowEl,
                events: { beforeOpen: 'beforeshow', open: 'show', beforeClose: 'beforehide', close: 'hide' },
                /* With a manual trigger only the code (and Esc) closes the panel, so a button of the page can toggle it. */
                closeOnOutside: options.closeOnOutside && triggers[0] !== 'manual',
                closeOnFocusOut: triggers.indexOf('click') > -1,
                keyboard: options.keyboard,
                restoreFocus: function () { return options.restoreFocus; },
                placement: function () { return options.placement; },
                offset: function () { return options.offset; },
                flip: function () { return options.flip; },
                shift: function () { return options.shift; },
                fire: function (name, detail, cancelable) { return ctx.trigger(name, detail, { cancelable: cancelable }); },
                onOpened: function (source) {
                    openedBy = source;
                    if (!options.focus || source === 'hover' || source === 'focus') return;
                    var list = visibleFocusables(panel);
                    (list[0] || panel).focus();
                }
            });

            function later(fn, ms) {
                var id = window.setTimeout(function () { timers.splice(timers.indexOf(id), 1); fn(); }, ms);
                timers.push(id);
            }
            function clearTimers() { timers.splice(0).forEach(function (id) { window.clearTimeout(id); }); }
            function disabled() { return el.disabled || el.getAttribute('aria-disabled') === 'true'; }
            function scheduleShow(source) {
                clearTimers();
                if (controller.isOpen() || disabled()) return;
                if (options.delay) later(function () { controller.open(source); }, options.delay); else controller.open(source);
            }
            function scheduleHide(source) {
                clearTimers();
                if (!controller.isOpen()) return;
                if (options.delay) later(function () { controller.close(source); }, options.delay); else controller.close(source);
            }

            if (triggers.indexOf('click') > -1) {
                cleanups.push(listen(el, 'click', function (e) {
                    if (disabled()) return;
                    if (el.tagName === 'A') e.preventDefault();
                    clearTimers();
                    controller.toggle('click');
                }));
            }
            if (triggers.indexOf('hover') > -1) {
                cleanups.push(listen(el, 'mouseenter', function () { scheduleShow('hover'); }));
                cleanups.push(listen(el, 'mouseleave', function () { scheduleHide('hover'); }));
                cleanups.push(listen(panel, 'mouseenter', function () { clearTimers(); }));
                cleanups.push(listen(panel, 'mouseleave', function () { if (openedBy === 'hover' || openedBy === 'focus') scheduleHide('hover'); }));
            }
            if (triggers.indexOf('focus') > -1) {
                cleanups.push(listen(el, 'focusin', function () { scheduleShow('focus'); }));
                cleanups.push(listen(el, 'focusout', function (e) {
                    if (e.relatedTarget && panel.contains(e.relatedTarget)) return;
                    scheduleHide('focus');
                }));
                cleanups.push(listen(panel, 'focusout', function (e) {
                    if (e.relatedTarget && (panel.contains(e.relatedTarget) || el.contains(e.relatedTarget))) return;
                    if (triggers.indexOf('click') === -1) scheduleHide('focus');
                }));
            }
            /* Tab leaves a popover that took the focus: forward from the last control, backward from the first, the trigger is next. */
            cleanups.push(listen(panel, 'keydown', function (e) {
                if (e.key !== 'Tab' || !controller.isOpen() || openedBy === 'hover' || openedBy === 'focus') return;
                var list = visibleFocusables(panel);
                var active = document.activeElement;
                if (e.shiftKey) {
                    if (active === panel || active === list[0] || !list.length) { e.preventDefault(); controller.close('tab'); }
                } else if (active === panel || active === list[list.length - 1] || !list.length) {
                    controller.close('tab');
                }
            }));

            instance = {
                show: function () { clearTimers(); return controller.open('api'); },
                hide: function () { clearTimers(); return controller.close('api'); },
                toggle: function () { clearTimers(); return controller.toggle('api'); },
                isOpen: function () { return controller.isOpen(); },
                update: function () { controller.update(); },
                destroy: function () {
                    clearTimers();
                    controller.destroy();
                    cleanups.splice(0).forEach(function (off) { off(); });
                    if (built && panel.parentNode) panel.parentNode.removeChild(panel);
                    added.forEach(function (pair) {
                        if (pair[1] === null) { if (pair[0].parentNode) pair[0].parentNode.removeChild(pair[0]); } else pair[0].removeAttribute(pair[1]);
                    });
                    added.length = 0;
                }
            };
            return instance;
        }
    });

    /*
     * Menu (Dropdown). A button that opens a list of actions. The ARIA Menu Button pattern: role="menu" and role="menuitem",
     * checkable items with role="menuitemcheckbox" and role="menuitemradio" and aria-checked.
     * Markup: <button class="bui-btn" data-bui-menu>Actions</button><div class="bui-menu"> <button class="bui-menu__item">Edit</button> ... </div>
     * (or point data-bui-target at the menu). Options: target, placement, offset, closeOnSelect, orientation, restoreFocus.
     * Methods: open, close, toggle, isOpen, update, destroy. Events (on the trigger): bui:menu:beforeopen (cancelable), open, beforeclose
     * (cancelable), close, select (detail: item, role, checked, value). A native disabled button is skipped by the keys, an item with
     * aria-disabled="true" is reachable but does nothing. data-bui-keep-open on an item keeps the menu open after it is chosen.
     */
    var MENU_ITEMS = '[role="menuitem"], [role="menuitemcheckbox"], [role="menuitemradio"]';

    register('menu', {
        defaults: { target: '', placement: 'bottom-start', offset: 4, closeOnSelect: true, orientation: 'vertical', restoreFocus: true },
        create: function (el, options, ctx) {
            var log2 = ctx.log;
            var cleanups = [];
            var added = [];
            var menu = null;
            var buffer = '';
            var bufferTimer = 0;

            if (options.orientation !== 'vertical' && options.orientation !== 'horizontal') {
                log2.warn('Invalid orientation "' + options.orientation + '", using "vertical".');
                options.orientation = 'vertical';
            }
            if (!POSITION_RE.test(options.placement)) { log2.warn('Invalid placement "' + options.placement + '", using "bottom-start".'); options.placement = 'bottom-start'; }
            if (typeof options.offset !== 'number' || options.offset < 0) options.offset = 4;

            function setAttr(node, name, value) {
                if (!node.hasAttribute(name)) added.push([node, name]);
                node.setAttribute(name, value);
            }

            if (options.target) {
                try { menu = document.querySelector(options.target); } catch (e) { menu = null; }
                if (!menu) log2.warn('The target "' + options.target + '" was not found.');
            } else if (el.nextElementSibling && el.nextElementSibling.classList.contains('bui-menu')) {
                menu = el.nextElementSibling;
            } else {
                log2.error('A menu needs a .bui-menu element: put it right after the trigger or point data-bui-target at it.');
            }
            if (!menu) {
                return { open: function () { return false; }, close: function () { return false; }, toggle: function () { return false; }, isOpen: function () { return false; }, update: function () {}, destroy: function () {} };
            }

            if (!el.id) setAttr(el, 'id', uid('bui-menu-trigger'));
            if (!menu.id) setAttr(menu, 'id', uid('bui-menu'));
            if (!menu.hasAttribute('role')) setAttr(menu, 'role', 'menu');
            if (!menu.hasAttribute('aria-labelledby') && !menu.hasAttribute('aria-label')) setAttr(menu, 'aria-labelledby', el.id);
            if (options.orientation === 'horizontal') setAttr(menu, 'aria-orientation', 'horizontal');
            setAttr(el, 'aria-haspopup', 'menu');
            setAttr(el, 'aria-controls', menu.id);
            setAttr(el, 'aria-expanded', 'false');
            if (!/^(a|button|input|summary)$/i.test(el.tagName) && !el.hasAttribute('tabindex')) {
                log2.warn('The trigger is not focusable. Use a <button>.');
            }

            /* Items written with only the class get their role; every item is focused by script only, so none is in the Tab order. */
            function prepare() {
                Array.from(menu.querySelectorAll('.bui-menu__item')).forEach(function (item) {
                    if (!item.hasAttribute('role')) setAttr(item, 'role', 'menuitem');
                });
                Array.from(menu.querySelectorAll('.bui-menu__header')).forEach(function (node) {
                    if (!node.hasAttribute('role')) setAttr(node, 'role', 'presentation');
                });
                Array.from(menu.querySelectorAll('.bui-menu__divider')).forEach(function (node) {
                    if (!node.hasAttribute('role')) setAttr(node, 'role', 'separator');
                });
                Array.from(menu.querySelectorAll(MENU_ITEMS)).forEach(function (item) {
                    if (!item.hasAttribute('tabindex')) setAttr(item, 'tabindex', '-1');
                });
            }
            function items() {
                return Array.from(menu.querySelectorAll(MENU_ITEMS)).filter(function (item) { return !item.disabled && item.getClientRects().length > 0; });
            }
            function currentItem() {
                return document.activeElement && document.activeElement.closest ? document.activeElement.closest(MENU_ITEMS) : null;
            }
            function focusItem(item) { if (item) item.focus(); }
            function itemText(item) { return (item.getAttribute('data-bui-text') || item.textContent || '').trim().toLowerCase(); }

            var controller = floatingController({
                trigger: el,
                floating: menu,
                arrow: null,
                events: { beforeOpen: 'beforeopen', open: 'open', beforeClose: 'beforeclose', close: 'close' },
                closeOnOutside: true,
                closeOnFocusOut: true,
                keyboard: true,
                restoreFocus: function () { return options.restoreFocus; },
                placement: function () { return options.placement; },
                offset: function () { return options.offset; },
                flip: function () { return true; },
                shift: function () { return true; },
                fire: function (name, detail, cancelable) { return ctx.trigger(name, detail, { cancelable: cancelable }); },
                onOpened: function (source, extra) {
                    var list = items();
                    focusItem(extra.last ? list[list.length - 1] : list[0]);
                }
            });

            function openMenu(source, last) {
                prepare();
                if (controller.isOpen()) {
                    var list = items();
                    focusItem(last ? list[list.length - 1] : list[0]);
                    return true;
                }
                return controller.open(source, { last: !!last });
            }

            cleanups.push(listen(el, 'click', function (e) {
                if (el.disabled || el.getAttribute('aria-disabled') === 'true') return;
                if (el.tagName === 'A') e.preventDefault();
                if (controller.isOpen()) controller.close('toggle'); else openMenu('click', false);
            }));
            cleanups.push(listen(el, 'keydown', function (e) {
                if (e.key === 'ArrowDown') { e.preventDefault(); openMenu('keyboard', false); }
                else if (e.key === 'ArrowUp') { e.preventDefault(); openMenu('keyboard', true); }
            }));

            /* Type-ahead: the typed characters pick the next item whose text starts with them (one repeated key cycles). */
            function typeAhead(key) {
                buffer += key.toLowerCase();
                window.clearTimeout(bufferTimer);
                bufferTimer = window.setTimeout(function () { buffer = ''; bufferTimer = 0; }, 600);
                var list = items();
                if (!list.length) return;
                var current = list.indexOf(currentItem());
                var start = buffer.length === 1 ? current + 1 : Math.max(current, 0);
                var query = buffer;
                if (buffer.length > 1 && buffer.split('').every(function (ch) { return ch === buffer[0]; })) { query = buffer[0]; start = current + 1; }
                for (var i = 0; i < list.length; i++) {
                    var item = list[(start + i) % list.length];
                    if (itemText(item).indexOf(query) === 0) { focusItem(item); return; }
                }
            }

            cleanups.push(listen(menu, 'keydown', function (e) {
                if (!controller.isOpen() || e.ctrlKey || e.metaKey || e.altKey) return;
                var horizontal = options.orientation === 'horizontal';
                var rtl = BUI.dom.isRTL(menu);
                var next = horizontal ? (rtl ? 'ArrowLeft' : 'ArrowRight') : 'ArrowDown';
                var prev = horizontal ? (rtl ? 'ArrowRight' : 'ArrowLeft') : 'ArrowUp';
                var list = items();
                var index = list.indexOf(currentItem());
                if (e.key === next) {
                    e.preventDefault();
                    focusItem(list[(index + 1) % list.length]);
                } else if (e.key === prev) {
                    e.preventDefault();
                    focusItem(list[index < 1 ? list.length - 1 : index - 1]);
                } else if (e.key === 'Home') {
                    e.preventDefault();
                    focusItem(list[0]);
                } else if (e.key === 'End') {
                    e.preventDefault();
                    focusItem(list[list.length - 1]);
                } else if (e.key === 'Tab') {
                    /* The trigger takes the focus back and the browser then moves on from it: forward goes past the trigger, backward before it. */
                    controller.close('tab');
                } else if ((e.key === 'Enter' || e.key === ' ') && !(e.key === ' ' && buffer)) {
                    var item = currentItem();
                    /* A button activates itself; links (Space) and other elements with the menuitem role are clicked here. */
                    if (item && !(item.tagName === 'BUTTON' || (item.tagName === 'A' && e.key === 'Enter'))) { e.preventDefault(); item.click(); }
                } else if (e.key.length === 1) {
                    e.preventDefault();
                    typeAhead(e.key);
                }
            }));

            cleanups.push(listen(menu, 'click', function (e) {
                var item = e.target.closest ? e.target.closest(MENU_ITEMS) : null;
                if (!item || !menu.contains(item)) return;
                if (item.getAttribute('aria-disabled') === 'true' || item.disabled) { e.preventDefault(); e.stopPropagation(); return; }
                var role = item.getAttribute('role');
                var checked = null;
                if (role === 'menuitemcheckbox') {
                    checked = item.getAttribute('aria-checked') !== 'true';
                    item.setAttribute('aria-checked', checked ? 'true' : 'false');
                } else if (role === 'menuitemradio') {
                    var group = item.closest('[role="group"]') || menu;
                    Array.from(group.querySelectorAll('[role="menuitemradio"]')).filter(function (radio) {
                        return (radio.closest('[role="group"]') || menu) === group;
                    }).forEach(function (radio) { radio.setAttribute('aria-checked', radio === item ? 'true' : 'false'); });
                    checked = true;
                }
                ctx.trigger('select', { item: item, role: role, checked: checked, value: item.getAttribute('data-bui-value') });
                if (options.closeOnSelect && !item.hasAttribute('data-bui-keep-open')) controller.close('select');
            }));

            return {
                open: function () { return openMenu('api', false); },
                close: function () { return controller.close('api'); },
                toggle: function () { return controller.isOpen() ? controller.close('api') : openMenu('api', false); },
                isOpen: function () { return controller.isOpen(); },
                update: function () { controller.update(); },
                destroy: function () {
                    window.clearTimeout(bufferTimer);
                    controller.destroy();
                    cleanups.splice(0).forEach(function (off) { off(); });
                    added.forEach(function (pair) { pair[0].removeAttribute(pair[1]); });
                    added.length = 0;
                }
            };
        }
    });

    /* ------------------------------------------------------------------ */
    /* Select (Task 17)                                                    */
    /* ------------------------------------------------------------------ */

    /*
     * Select. A custom control built over a native <select>. The native element stays in the DOM (hidden, outside the Tab order) and is
     * the source of truth for forms: Submit, Reset, required, name and FormData all keep working. The control is a combobox (the ARIA
     * pattern with a listbox popup and aria-activedescendant); the list is a floating layer placed by BUI.position.
     * Markup:  <select data-bui-select name="fruit"> <option value="">Choose</option> <option value="a">Apple</option> </select>
     *          <select data-bui-select multiple> ... </select>              (multiple: the native attribute)
     *          <select data-bui-select="remote" data-bui-url="api/people" data-bui-per-page="20"></select>   (remote mode)
     * Options: searchable, clearable, placeholder, size (sm|md|lg), placement, closeOnSelect (null = auto: close when single, stay open
     *          when multiple), url, perPage, debounce, loadMore (scroll|button). url, perPage, debounce and loadMore apply to the remote mode.
     * Methods: getValue, setValue, open, close, clear, setOptions, refresh, update, destroy.
     * Events (on the native <select>, they bubble): bui:select:change|open|close|search, plus the cancelable bui:select:beforeopen|beforeclose.
     * Remote request: GET {url}?page=1&perPage=20&search=text (search is left out when empty). Response: { items: [{ value, label }], total }.
     * Keys the native element can change at any time (disabled, class is-valid / is-invalid, aria-invalid, required, its options in the
     * static mode, its selection) are observed and the control follows them.
     */
    var SELECT_SIZES = ['sm', 'md', 'lg'];
    var SELECT_KEYS = ['searchable', 'clearable', 'placeholder', 'size', 'placement', 'closeOnSelect', 'url', 'perPage', 'debounce', 'loadMore'];

    function selectText(key, fallback, params) {
        if (locale.get()) return translate(key, params);
        return String(fallback).replace(/\{(\w+)\}/g, function (match, name) { return params && params[name] !== undefined ? params[name] : match; });
    }

    /* Search text: lower case, without Latin and Arabic diacritics, with the common Arabic letter variants merged. */
    function selectNorm(text) {
        return String(text).normalize('NFD')
            .replace(/[\u0300-\u036f\u0640\u064b-\u065f\u0670]/g, '')
            .replace(/[\u0622\u0623\u0625]/g, '\u0627')
            .replace(/\u0649/g, '\u064a')
            .toLowerCase();
    }

    register('select', {
        defaults: {
            searchable: false, clearable: false, placeholder: '', size: 'md', placement: 'bottom-start', closeOnSelect: null,
            url: '', perPage: 20, debounce: 300, loadMore: 'scroll'
        },
        variants: ['remote'],
        create: function (el, options, ctx) {
            var log2 = ctx.log;
            var inert = {
                getValue: function () { return null; }, setValue: function () { return inert; }, open: function () { return false; }, close: function () { return false; },
                clear: function () { return inert; }, setOptions: function () { return inert; }, refresh: function () { return inert; }, update: function () { return inert; },
                destroy: function () {}
            };
            if (!el || el.tagName !== 'SELECT') {
                log2.error('A select must be a <select> element.');
                return inert;
            }

            var remote = ctx.variant === 'remote';
            var destroyed = false;
            var multi = false;
            var cleanups = [];
            var timers = {};
            var restore = null;            /* what destroy() puts back on the native element */
            var observer = null;
            var resizeObserver = null;
            var controller = null;
            var ui = null;                 /* the DOM the control built; null while torn down */
            var items = [];                /* option records: { value, label, disabled, group, norm } */
            var visible = [];              /* records shown now (after the search filter) */
            var nodes = [];                /* option elements, same index as visible */
            var selected = new Map();      /* value -> { value, label }: the selection, in the order it was made */
            var emptyOption = null;        /* the native <option value=""> (its text is the placeholder) */
            var activeIndex = -1;
            var query = '';
            var typing = false;            /* false: the list is not filtered even when the input shows the selected label */
            var buffer = '';
            var announceText = '';
            var ownChange = false;
            var api;
            var rs = { page: 0, total: null, hasMore: false, loading: false, error: false, loaded: false, controller: null, token: 0, chain: 0 };

            function normalize(o) {
                if (SELECT_SIZES.indexOf(o.size) === -1) { log2.warn('Invalid size "' + o.size + '", using "md".'); o.size = 'md'; }
                if (!POSITION_RE.test(o.placement)) { log2.warn('Invalid placement "' + o.placement + '", using "bottom-start".'); o.placement = 'bottom-start'; }
                if (o.closeOnSelect !== null && typeof o.closeOnSelect !== 'boolean') { log2.warn('closeOnSelect must be true, false or unset.'); o.closeOnSelect = null; }
                if (typeof o.perPage !== 'number' || o.perPage < 1 || Math.floor(o.perPage) !== o.perPage) { log2.warn('perPage must be a whole number of 1 or more, using 20.'); o.perPage = 20; }
                if (typeof o.debounce !== 'number' || o.debounce < 0) { log2.warn('debounce must be a number of 0 or more, using 300.'); o.debounce = 300; }
                if (o.loadMore !== 'scroll' && o.loadMore !== 'button') { log2.warn('Invalid loadMore "' + o.loadMore + '", using "scroll".'); o.loadMore = 'scroll'; }
                if (typeof o.url !== 'string') o.url = '';
                if (typeof o.placeholder !== 'string') o.placeholder = '';
            }
            normalize(options);
            if (remote && !options.url) {
                log2.error('The remote mode needs a URL: set data-bui-url or the url option. The select works as a static select.');
                remote = false;
            }
            if (!remote && options.url) log2.warn('url is only used by the remote mode (data-bui-select="remote" or BUI.select.remote()).');

            /* ---- reading the native element ---- */

            function labelOf(option) { return (option.label || option.textContent || '').replace(/\s+/g, ' ').trim(); }

            function readSelection() {
                selected.clear();
                Array.from(el.options).forEach(function (o) {
                    if (o.selected && o.value !== '') selected.set(o.value, { value: o.value, label: labelOf(o) });
                });
                if (!multi && selected.size > 1) {
                    var last = Array.from(selected.values()).pop();
                    selected.clear();
                    selected.set(last.value, last);
                }
            }

            function readNative() {
                emptyOption = null;
                var list = [];
                function push(option, group) {
                    if (option.value === '' && !group) { if (!emptyOption) emptyOption = option; return; }
                    var label = labelOf(option);
                    list.push({ value: option.value, label: label, disabled: option.disabled || !!(group && group.disabled), group: group ? group.label : null, norm: selectNorm(label) });
                }
                Array.from(el.children).forEach(function (child) {
                    if (child.tagName === 'OPTION') push(child, null);
                    else if (child.tagName === 'OPTGROUP') {
                        var group = { label: child.label, disabled: child.disabled };
                        Array.from(child.children).forEach(function (o) { if (o.tagName === 'OPTION') push(o, group); });
                    }
                });
                items = list;
                readSelection();
            }

            function placeholderText() {
                if (options.placeholder) return options.placeholder;
                return emptyOption ? labelOf(emptyOption) : '';
            }

            /* A placeholder without an empty <option>: the native single select would show its first option, so nothing is selected. */
            function applyPlaceholderRule() {
                if (multi || remote || emptyOption || !options.placeholder) return;
                var hasDefault = Array.from(el.options).some(function (o) { return o.defaultSelected; });
                if (!hasDefault) el.selectedIndex = -1;
            }

            function isDisabled() { return !!(el.disabled || (el.matches && el.matches(':disabled'))); }

            /* ---- writing back to the native element ---- */

            function discard() { if (observer) observer.takeRecords(); }

            function writeNative() {
                if (remote) {
                    Array.from(el.options).forEach(function (o) { if (o !== emptyOption) el.removeChild(o); });
                    selected.forEach(function (rec) {
                        var o = document.createElement('option');
                        o.value = rec.value;
                        o.textContent = rec.label;
                        o.selected = true;
                        el.appendChild(o);
                    });
                    if (emptyOption) emptyOption.selected = selected.size === 0;
                    else if (selected.size === 0) el.selectedIndex = -1;
                } else {
                    Array.from(el.options).forEach(function (o) { o.selected = o !== emptyOption && selected.has(o.value); });
                    if (!multi && selected.size === 0) {
                        if (emptyOption) emptyOption.selected = true; else el.selectedIndex = -1;
                    }
                }
                discard();
            }

            function signature() { return Array.from(selected.keys()).join('\u0000'); }

            function detail(source) {
                return { value: getValue(), selected: Array.from(selected.values()).map(function (r) { return { value: r.value, label: r.label }; }), source: source };
            }

            /* Applies the selection to the native element, refreshes the control and reports the change. */
            function commit(source, before) {
                writeNative();
                renderValue();
                if (signature() === before) return false;
                if (source === 'user') {
                    ownChange = true;
                    try {
                        el.dispatchEvent(new Event('input', { bubbles: true }));
                        el.dispatchEvent(new Event('change', { bubbles: true }));
                    } finally { ownChange = false; }
                }
                ctx.trigger('change', detail(source));
                return true;
            }

            function getValue() {
                var values = Array.from(selected.keys());
                return multi ? values : (values[0] || '');
            }

            /* ---- text, state and announcements ---- */

            function announce(text) {
                if (!ui) return;
                window.clearTimeout(timers.announce);
                timers.announce = window.setTimeout(function () { if (ui) ui.status.textContent = text; }, 150);
            }

            function syncState() {
                if (!ui) return;
                var disabled = isDisabled();
                var invalid = el.classList.contains('is-invalid') || el.getAttribute('aria-invalid') === 'true';
                var valid = el.classList.contains('is-valid') && !invalid;
                ui.wrapper.classList.toggle('is-invalid', invalid);
                ui.wrapper.classList.toggle('is-valid', valid);
                ui.wrapper.classList.toggle('is-disabled', disabled);
                var combo = ui.combo;
                if (invalid) combo.setAttribute('aria-invalid', 'true'); else combo.removeAttribute('aria-invalid');
                if (el.required) combo.setAttribute('aria-required', 'true'); else combo.removeAttribute('aria-required');
                if (disabled) {
                    combo.setAttribute('aria-disabled', 'true');
                    if (options.searchable) combo.disabled = true; else combo.setAttribute('tabindex', '-1');
                    if (controller && controller.isOpen()) controller.close('disabled');
                } else {
                    combo.removeAttribute('aria-disabled');
                    if (options.searchable) combo.disabled = false; else combo.setAttribute('tabindex', '0');
                }
                ui.clear.hidden = !(options.clearable && selected.size > 0 && !disabled);
            }

            function renderTexts() {
                if (!ui) return;
                ui.clear.setAttribute('aria-label', selectText('select.clear', 'Clear selection'));
                Array.from(ui.values.querySelectorAll('.bui-select__tag-remove')).forEach(function (btn) {
                    btn.setAttribute('aria-label', selectText('select.remove', 'Remove {label}', { label: btn.getAttribute('data-label') }));
                });
                var ph = ui.values.querySelector('.bui-select__placeholder');
                if (ph) ph.textContent = placeholderText();
                if (options.searchable) ui.search.setAttribute('placeholder', selected.size === 0 || !multi ? placeholderText() : '');
                renderMessage();
            }

            /* ---- the value area ---- */

            function renderValue() {
                if (!ui) return;
                var values = ui.values;
                Array.from(values.querySelectorAll('.bui-select__tag, .bui-select__placeholder, .bui-select__value')).forEach(function (n) { values.removeChild(n); });
                var anchor = options.searchable ? ui.search : null;
                var list = Array.from(selected.values());
                var placeholder = placeholderText();
                if (multi) {
                    list.forEach(function (rec) {
                        var tag = document.createElement('span');
                        tag.className = 'bui-select__tag';
                        var text = document.createElement('span');
                        text.className = 'bui-select__tag-text';
                        text.textContent = rec.label;
                        tag.appendChild(text);
                        var remove = document.createElement('button');
                        remove.type = 'button';
                        remove.className = 'bui-select__tag-remove';
                        remove.setAttribute('tabindex', '-1');
                        remove.setAttribute('data-value', rec.value);
                        remove.setAttribute('data-label', rec.label);
                        if (options.searchable) remove.setAttribute('aria-label', selectText('select.remove', 'Remove {label}', { label: rec.label }));
                        else remove.setAttribute('aria-hidden', 'true');
                        tag.appendChild(remove);
                        values.insertBefore(tag, anchor);
                    });
                    if (!list.length && !options.searchable && placeholder) {
                        var ph = document.createElement('span');
                        ph.className = 'bui-select__placeholder';
                        ph.textContent = placeholder;
                        values.appendChild(ph);
                    }
                } else if (!options.searchable) {
                    var span = document.createElement('span');
                    if (list.length) { span.className = 'bui-select__value'; span.textContent = list[0].label; }
                    else { span.className = 'bui-select__placeholder'; span.textContent = placeholder; }
                    values.appendChild(span);
                }
                if (options.searchable) {
                    if (!multi) ui.search.value = typing ? query : (list.length ? list[0].label : '');
                    else ui.search.value = typing ? query : '';
                    ui.search.setAttribute('placeholder', list.length && multi ? '' : placeholder);
                }
                ui.wrapper.classList.toggle('has-value', list.length > 0);
                ui.clear.hidden = !(options.clearable && list.length > 0 && !isDisabled());
            }

            /* ---- the list ---- */

            function isOpen() { return !!(controller && controller.isOpen()); }

            function renderMessage() {
                if (!ui) return;
                var msg = ui.message;
                msg.textContent = '';
                var kind = '';
                if (remote && rs.loading) kind = 'loading';
                else if (remote && rs.error) kind = 'error';
                else if (!visible.length && (!remote || rs.loaded)) kind = 'empty';
                else if (remote && rs.hasMore && options.loadMore === 'button') kind = 'more';
                msg.setAttribute('data-kind', kind);
                msg.hidden = !kind;
                ui.list.setAttribute('aria-busy', remote && rs.loading ? 'true' : 'false');
                if (kind === 'loading') {
                    msg.textContent = selectText('common.loading', 'Loading...');
                } else if (kind === 'empty') {
                    msg.textContent = selectText('common.noResults', 'No results found');
                } else if (kind === 'error') {
                    var text = document.createElement('span');
                    text.textContent = selectText('select.loadError', 'The options could not be loaded.');
                    var retry = document.createElement('button');
                    retry.type = 'button';
                    retry.className = 'bui-select__retry';
                    retry.setAttribute('tabindex', '-1');
                    retry.setAttribute('data-action', 'retry');
                    retry.textContent = selectText('select.retry', 'Retry');
                    msg.appendChild(text);
                    msg.appendChild(retry);
                } else if (kind === 'more') {
                    var more = document.createElement('button');
                    more.type = 'button';
                    more.className = 'bui-select__more';
                    more.setAttribute('tabindex', '-1');
                    more.setAttribute('data-action', 'more');
                    more.textContent = selectText('select.loadMore', 'Load more');
                    msg.appendChild(more);
                }
            }

            function filterItems() {
                var q = typing ? selectNorm(query.trim()) : '';
                visible = !q || remote ? items.slice() : items.filter(function (rec) { return rec.norm.indexOf(q) > -1; });
            }

            /* Rendering is incremental: the first chunk now, the next ones when the list is scrolled or the keyboard reaches them. */
            var CHUNK = 100;
            var renderedCount = 0;
            var curGroupEl = null;
            var curGroupLabel = null;

            function appendUpTo(limit) {
                if (!ui) return;
                limit = Math.min(limit, visible.length);
                if (renderedCount >= limit) return;
                var fragment = document.createDocumentFragment();
                var fragmentGroups = [];
                for (var index = renderedCount; index < limit; index++) {
                    var rec = visible[index];
                    if (rec.group !== curGroupLabel) {
                        curGroupLabel = rec.group;
                        curGroupEl = null;
                        if (curGroupLabel !== null) {
                            curGroupEl = document.createElement('div');
                            curGroupEl.className = 'bui-select__group';
                            curGroupEl.setAttribute('role', 'group');
                            var heading = document.createElement('div');
                            heading.className = 'bui-select__group-label';
                            heading.id = ui.listId + '-g' + index;
                            heading.setAttribute('role', 'presentation');
                            heading.textContent = curGroupLabel;
                            curGroupEl.setAttribute('aria-labelledby', heading.id);
                            curGroupEl.appendChild(heading);
                            fragment.appendChild(curGroupEl);
                            fragmentGroups.push(curGroupEl);
                        }
                    }
                    var node = document.createElement('div');
                    node.className = 'bui-select__option';
                    node.id = ui.listId + '-o' + index;
                    node.setAttribute('role', 'option');
                    node.setAttribute('data-index', String(index));
                    node.setAttribute('aria-setsize', String(visible.length));
                    node.setAttribute('aria-posinset', String(index + 1));
                    node.setAttribute('aria-selected', selected.has(rec.value) ? 'true' : 'false');
                    if (rec.disabled) node.setAttribute('aria-disabled', 'true');
                    node.textContent = rec.label;
                    /* A group that started in an earlier chunk is already in the list: add to it directly. */
                    if (curGroupEl && curGroupEl.parentNode === ui.list) curGroupEl.appendChild(node);
                    else (curGroupEl || fragment).appendChild(node);
                    nodes.push(node);
                }
                renderedCount = limit;
                ui.list.appendChild(fragment);
            }

            function renderList() {
                if (!ui) return;
                ui.list.textContent = '';
                nodes = [];
                renderedCount = 0;
                curGroupEl = null;
                curGroupLabel = null;
                appendUpTo(CHUNK);
                ui.list.hidden = visible.length === 0;
                renderMessage();
                activeIndex = -1;
                ui.combo.removeAttribute('aria-activedescendant');
            }

            function enabledFrom(start, step) {
                for (var i = start; i >= 0 && i < visible.length; i += step) if (!visible[i].disabled) return i;
                return -1;
            }

            function scrollTo(node) {
                var list = ui.list;
                var top = node.offsetTop;
                var bottom = top + node.offsetHeight;
                if (top < list.scrollTop) list.scrollTop = top;
                else if (bottom > list.scrollTop + list.clientHeight) list.scrollTop = bottom - list.clientHeight;
            }

            function setActive(index, scroll) {
                if (!ui) return;
                var previous = ui.list.querySelector('.bui-select__option.is-active');
                if (previous) previous.classList.remove('is-active');
                if (index >= renderedCount) appendUpTo(index + 1 + CHUNK);
                activeIndex = index;
                var node = index >= 0 ? nodes[index] : null;
                if (node) {
                    node.classList.add('is-active');
                    ui.combo.setAttribute('aria-activedescendant', node.id);
                    if (scroll) scrollTo(node);
                } else {
                    ui.combo.removeAttribute('aria-activedescendant');
                }
            }

            /* Updates the selected marks without rebuilding the list (the scroll position stays). */
            function refreshMarks() {
                nodes.forEach(function (node, index) { node.setAttribute('aria-selected', selected.has(visible[index].value) ? 'true' : 'false'); });
            }

            function selectedIndex() {
                for (var i = 0; i < visible.length; i++) if (selected.has(visible[i].value) && !visible[i].disabled) return i;
                return -1;
            }

            function resetActive() {
                var index = typing ? enabledFrom(0, 1) : selectedIndex();
                if (index < 0) index = enabledFrom(0, 1);
                setActive(index, true);
            }

            function announceResults() {
                if (!isOpen()) return;
                var n = visible.length;
                announce(rs.loading ? selectText('common.loading', 'Loading...')
                    : n === 0 ? selectText('common.noResults', 'No results found')
                    : selectText('select.results', n === 1 ? '{count} result available' : '{count} results available', { count: n }));
            }

            function move(step) {
                var from = activeIndex < 0 ? (step > 0 ? -1 : visible.length) : activeIndex;
                var next = enabledFrom(from + step, step);
                if (next < 0) {
                    if (remote) remoteMore();
                    return;
                }
                setActive(next, true);
                if (remote && next >= visible.length - 2) remoteMore();
            }

            /* ---- choosing ---- */

            function closesOnSelect() { return options.closeOnSelect === null ? !multi : options.closeOnSelect; }

            function choose(index, source) {
                var rec = visible[index];
                if (!rec || rec.disabled || isDisabled()) return;
                var before = signature();
                if (multi) {
                    if (selected.has(rec.value)) selected.delete(rec.value); else selected.set(rec.value, { value: rec.value, label: rec.label });
                } else {
                    selected.clear();
                    selected.set(rec.value, { value: rec.value, label: rec.label });
                }
                var had = before.split('\u0000').indexOf(rec.value) > -1;
                commit(source, before);
                announce(selectText(had && multi ? 'select.removed' : 'select.selected', had && multi ? '{label} removed' : '{label} selected', { label: rec.label }));
                if (closesOnSelect()) { closeList('select'); return; }
                if (!remote && typing) {
                    typing = false;
                    query = '';
                    filterItems();
                    renderList();
                    var again = visible.indexOf(rec);
                    setActive(again >= 0 ? again : enabledFrom(0, 1), true);
                    if (options.searchable) renderValue();
                } else {
                    refreshMarks();
                }
                if (controller) controller.update();
            }

            function removeValue(value, source) {
                if (!selected.has(value)) return;
                var label = selected.get(value).label;
                var before = signature();
                selected.delete(value);
                commit(source, before);
                announce(selectText('select.removed', '{label} removed', { label: label }));
                if (isOpen()) { refreshMarks(); controller.update(); }
            }

            function clearAll(source) {
                var before = signature();
                if (!selected.size) return false;
                selected.clear();
                typing = false;
                query = '';
                var changed = commit(source, before);
                if (isOpen()) { if (!remote) filterItems(); renderList(); resetActive(); controller.update(); }
                return changed;
            }

            /* ---- opening and closing ---- */

            function updateWidth() {
                if (!ui) return;
                ui.panel.style.minInlineSize = ui.control.getBoundingClientRect().width + 'px';
            }

            function openList(source) {
                if (destroyed || !ui || isDisabled()) return false;
                if (controller.isOpen()) return true;
                if (!remote) { readSelection(); renderValue(); }
                filterItems();
                renderList();
                return controller.open(source);
            }

            function closeList(source) {
                if (!controller || !controller.isOpen()) return false;
                return controller.close(source);
            }

            function onOpened(source) {
                updateWidth();
                if (options.searchable && document.activeElement !== ui.combo) ui.combo.focus();
                resetActive();
                announceResults();
                if (remote && !typing && !rs.loaded && !rs.loading) remoteLoad(true);
                else if (remote && rs.loaded) remoteFill();
            }

            function onClosed(source) {
                window.clearTimeout(timers.search);
                buffer = '';
                if (typing || query) {
                    typing = false;
                    query = '';
                    if (!remote) filterItems();
                    if (remote && rs.loaded) { rs.loaded = false; items = []; rs.page = 0; abortRemote(); }
                    renderValue();
                } else if (options.searchable && !multi) {
                    renderValue();
                }
                /* A failed or empty result is not kept: the next opening asks again. */
                if (remote && rs.loaded && (rs.error || !items.length)) { abortRemote(); rs.loaded = false; rs.error = false; rs.page = 0; rs.hasMore = false; items = []; visible = []; }
                if (ui) ui.panel.classList.remove('is-keyboard');
                setActive(-1, false);
            }

            /* ---- remote mode ---- */

            function abortRemote() {
                rs.token += 1;
                if (rs.controller) { try { rs.controller.abort(); } catch (e) { /* already done */ } rs.controller = null; }
                rs.loading = false;
            }

            function remoteCanLoadMore() { return remote && rs.hasMore && !rs.loading && !rs.error; }

            function remoteMore() { if (remoteCanLoadMore()) remoteLoad(false); }

            /* The loaded options are fewer than the list needs to scroll: load the next page, up to a few in a row. */
            function remoteFill() {
                if (!ui || !isOpen() || options.loadMore !== 'scroll' || !remoteCanLoadMore()) return;
                if (ui.list.scrollHeight <= ui.list.clientHeight + 4 && rs.chain < 5) { rs.chain += 1; remoteLoad(false); }
            }

            function remoteLoad(reset) {
                if (!remote || destroyed) return;
                if (reset) {
                    abortRemote();
                    rs.page = 0; rs.total = null; rs.hasMore = false; rs.error = false; rs.loaded = false; rs.chain = 0;
                    items = []; visible = [];
                    if (ui) { renderList(); }
                } else if (rs.loading || !rs.hasMore) {
                    return;
                }
                var page = rs.page + 1;
                var url;
                try {
                    url = new URL(options.url, document.baseURI);
                    url.searchParams.set('page', String(page));
                    url.searchParams.set('perPage', String(options.perPage));
                    if (query.trim()) url.searchParams.set('search', query.trim());
                } catch (e) {
                    log2.error('The url "' + options.url + '" is not valid.');
                    rs.error = true; rs.loading = false; rs.loaded = true;
                    renderMessage();
                    return;
                }
                var token = ++rs.token;
                var request = typeof AbortController === 'function' ? new AbortController() : null;
                rs.controller = request;
                rs.loading = true;
                rs.error = false;
                renderMessage();
                if (isOpen()) { controller.update(); announce(selectText('common.loading', 'Loading...')); }

                window.fetch(url.toString(), { headers: { Accept: 'application/json' }, signal: request ? request.signal : undefined })
                    .then(function (response) {
                        if (!response.ok) throw new Error('HTTP ' + response.status);
                        return response.json();
                    })
                    .then(function (data) {
                        if (token !== rs.token || destroyed) return;
                        if (!data || !Array.isArray(data.items)) throw new Error('The response must be { items: [{ value, label }], total }.');
                        var known = {};
                        items.forEach(function (rec) { known[rec.value] = true; });
                        var added = 0;
                        data.items.forEach(function (raw) {
                            if (!raw || (typeof raw.value !== 'string' && typeof raw.value !== 'number') || (typeof raw.label !== 'string' && typeof raw.label !== 'number')) {
                                log2.warn('An item was skipped: each item needs a value and a label.');
                                return;
                            }
                            var value = String(raw.value);
                            if (known[value]) return;
                            known[value] = true;
                            var label = String(raw.label);
                            items.push({ value: value, label: label, disabled: raw.disabled === true, group: typeof raw.group === 'string' ? raw.group : null, norm: selectNorm(label) });
                            added += 1;
                        });
                        rs.page = page;
                        rs.loaded = true;
                        rs.loading = false;
                        rs.controller = null;
                        rs.total = typeof data.total === 'number' && isFinite(data.total) ? data.total : null;
                        rs.hasMore = added > 0 && (rs.total !== null ? items.length < rs.total : data.items.length >= options.perPage);
                        var keep = activeIndex;
                        var scrollTop = ui ? ui.list.scrollTop : 0;
                        filterItems();
                        if (ui) {
                            renderList();
                            ui.list.scrollTop = scrollTop;
                            if (page === 1) resetActive(); else if (keep >= 0) setActive(keep, false);
                            if (isOpen()) { controller.update(); announceResults(); }
                            remoteFill();
                        }
                    })
                    .catch(function (error) {
                        if (token !== rs.token || destroyed) return;
                        if (error && error.name === 'AbortError') return;
                        log2.warn('Loading the options failed: ' + (error && error.message ? error.message : error));
                        rs.loading = false;
                        rs.controller = null;
                        rs.error = true;
                        rs.loaded = true;
                        if (ui) { renderMessage(); if (isOpen()) { controller.update(); announce(selectText('select.loadError', 'The options could not be loaded.')); } }
                    });
            }

            /* ---- building and tearing down the DOM ---- */

            function labelling(combo, list) {
                var labels = el.labels ? Array.from(el.labels) : [];
                if (labels.length) {
                    var ids = labels.map(function (label) {
                        if (!label.id) { label.id = uid('bui-select-label'); restore.labelIds.push(label); }
                        return label.id;
                    });
                    combo.setAttribute('aria-labelledby', ids.join(' '));
                    list.setAttribute('aria-labelledby', ids.join(' '));
                } else if (el.getAttribute('aria-labelledby')) {
                    combo.setAttribute('aria-labelledby', el.getAttribute('aria-labelledby'));
                    list.setAttribute('aria-labelledby', el.getAttribute('aria-labelledby'));
                } else if (el.getAttribute('aria-label')) {
                    combo.setAttribute('aria-label', el.getAttribute('aria-label'));
                    list.setAttribute('aria-label', el.getAttribute('aria-label'));
                } else {
                    log2.warn('The select has no accessible name: add a <label for>, aria-label or aria-labelledby.');
                }
                if (el.getAttribute('aria-describedby')) combo.setAttribute('aria-describedby', el.getAttribute('aria-describedby'));
            }

            function build() {
                multi = !!el.multiple;
                var wrapper = document.createElement('div');
                wrapper.className = 'bui-select' + (options.size !== 'md' ? ' bui-select--' + options.size : '') + (multi ? ' bui-select--multiple' : '') + (options.searchable ? ' bui-select--searchable' : '');
                var listId = uid('bui-select-list');
                var control = document.createElement('div');
                control.className = 'bui-select__control';
                var values = document.createElement('div');
                values.className = 'bui-select__values';
                var combo;
                var search = null;
                if (options.searchable) {
                    search = document.createElement('input');
                    search.type = 'text';
                    search.className = 'bui-select__search';
                    search.setAttribute('autocomplete', 'off');
                    search.setAttribute('autocapitalize', 'off');
                    search.setAttribute('spellcheck', 'false');
                    search.setAttribute('aria-autocomplete', 'list');
                    values.appendChild(search);
                    combo = search;
                } else {
                    combo = values;
                    combo.setAttribute('tabindex', '0');
                }
                combo.setAttribute('role', 'combobox');
                combo.setAttribute('aria-haspopup', 'listbox');
                combo.setAttribute('aria-controls', listId);
                combo.setAttribute('aria-expanded', 'false');
                if (!options.searchable) combo.classList.add('bui-select__combobox');
                var clear = document.createElement('button');
                clear.type = 'button';
                clear.className = 'bui-select__clear';
                clear.setAttribute('tabindex', '-1');
                clear.hidden = true;
                var arrow = document.createElement('span');
                arrow.className = 'bui-select__arrow';
                arrow.setAttribute('aria-hidden', 'true');
                control.appendChild(values);
                control.appendChild(clear);
                control.appendChild(arrow);

                var panel = document.createElement('div');
                panel.className = 'bui-select__panel' + (options.size !== 'md' ? ' bui-select__panel--' + options.size : '');
                var list = document.createElement('div');
                list.className = 'bui-select__list';
                list.id = listId;
                list.setAttribute('role', 'listbox');
                if (multi) list.setAttribute('aria-multiselectable', 'true');
                var message = document.createElement('div');
                message.className = 'bui-select__message';
                message.hidden = true;
                panel.appendChild(list);
                panel.appendChild(message);
                var status = document.createElement('span');
                status.className = 'bui-visually-hidden';
                status.setAttribute('role', 'status');
                status.setAttribute('aria-live', 'polite');
                status.setAttribute('aria-atomic', 'true');

                el.parentNode.insertBefore(wrapper, el);
                wrapper.appendChild(el);
                wrapper.appendChild(control);
                wrapper.appendChild(panel);
                wrapper.appendChild(status);
                ui = { wrapper: wrapper, control: control, values: values, combo: combo, search: search, clear: clear, panel: panel, list: list, message: message, status: status, listId: listId };
                labelling(combo, list);

                controller = floatingController({
                    trigger: control,
                    control: combo,
                    floating: panel,
                    arrow: null,
                    events: { beforeOpen: 'beforeopen', open: 'open', beforeClose: 'beforeclose', close: 'close' },
                    closeOnOutside: true,
                    closeOnFocusOut: true,
                    keyboard: true,
                    restoreFocus: function () { return false; },
                    placement: function () { return options.placement; },
                    offset: function () { return 4; },
                    flip: function () { return true; },
                    shift: function () { return true; },
                    fire: function (name, d, cancelable) {
                        var result = ctx.trigger(name, d, { cancelable: cancelable });
                        if (name === 'close') onClosed(d.source);
                        return result;
                    },
                    onOpened: onOpened
                });
                wireUi();
            }

            function onKeydown(e) {
                if (e.ctrlKey || e.metaKey || e.altKey || e.isComposing) return;
                var open = isOpen();
                var key = e.key;
                var text = options.searchable;
                if (isDisabled()) return;
                if (key === 'ArrowDown' || key === 'ArrowUp') {
                    e.preventDefault();
                    ui.panel.classList.add('is-keyboard');
                    if (!open) { openList('keyboard'); if (key === 'ArrowUp' && visible.length) setActive(enabledFrom(visible.length - 1, -1), true); }
                    else move(key === 'ArrowDown' ? 1 : -1);
                } else if ((key === 'Home' || key === 'End') && open && !text) {
                    e.preventDefault();
                    ui.panel.classList.add('is-keyboard');
                    setActive(key === 'Home' ? enabledFrom(0, 1) : enabledFrom(visible.length - 1, -1), true);
                    if (remote && key === 'End') remoteMore();
                } else if ((key === 'PageDown' || key === 'PageUp') && open) {
                    e.preventDefault();
                    ui.panel.classList.add('is-keyboard');
                    var step = key === 'PageDown' ? 1 : -1;
                    var to = Math.max(0, Math.min(visible.length - 1, (activeIndex < 0 ? 0 : activeIndex) + step * 10));
                    var found = enabledFrom(to, -step);
                    setActive(found < 0 ? enabledFrom(to, step) : found, true);
                    if (remote && step > 0) remoteMore();
                } else if (key === 'Enter' || (key === ' ' && !text && !buffer)) {
                    if (!open) {
                        if (key === 'Enter' && text) return;
                        e.preventDefault();
                        openList('keyboard');
                    } else {
                        e.preventDefault();
                        if (activeIndex >= 0) choose(activeIndex, 'user');
                        else if (remote && rs.error) remoteLoad(rs.page === 0);
                    }
                } else if (key === 'Escape') {
                    if (open) { e.preventDefault(); closeList('escape'); }
                } else if (key === 'Tab') {
                    /* Nothing is chosen by Tab: the list closes when the focus leaves. */
                    if (open) closeList('tab');
                } else if ((key === 'Backspace' || key === 'Delete') && (!text || (ui.search.value === '' && !typing))) {
                    if (multi && key === 'Backspace' && selected.size) {
                        e.preventDefault();
                        removeValue(Array.from(selected.keys()).pop(), 'user');
                    } else if (!multi && options.clearable && selected.size) {
                        e.preventDefault();
                        clearAll('user');
                    }
                } else if (!text && key.length === 1) {
                    e.preventDefault();
                    typeAhead(key);
                }
            }

            /* Type-ahead for the select without a search box: the typed letters pick the next option that starts with them. */
            function typeAhead(key) {
                buffer += selectNorm(key);
                window.clearTimeout(timers.buffer);
                timers.buffer = window.setTimeout(function () { buffer = ''; }, 600);
                if (!isOpen()) openList('keyboard');
                ui.panel.classList.add('is-keyboard');
                if (!visible.length) return;
                var start = buffer.length === 1 ? activeIndex + 1 : Math.max(activeIndex, 0);
                var q = buffer;
                if (buffer.length > 1 && buffer.split('').every(function (ch) { return ch === buffer[0]; })) { q = buffer[0]; start = activeIndex + 1; }
                for (var i = 0; i < visible.length; i++) {
                    var index = (start + i) % visible.length;
                    if (!visible[index].disabled && visible[index].norm.indexOf(q) === 0) { setActive(index, true); return; }
                }
            }

            function onSearchInput() {
                query = ui.search.value;
                typing = true;
                if (!isOpen()) { if (!openList('input')) return; }
                ctx.trigger('search', { query: query, source: 'user' });
                if (remote) {
                    window.clearTimeout(timers.search);
                    abortRemote();
                    rs.loading = true;
                    renderMessage();
                    timers.search = window.setTimeout(function () { remoteLoad(true); }, options.debounce);
                } else {
                    filterItems();
                    renderList();
                    resetActive();
                    controller.update();
                    announce(visible.length ? selectText('select.results', visible.length === 1 ? '{count} result available' : '{count} results available', { count: visible.length }) : selectText('common.noResults', 'No results found'));
                }
            }

            function wireUi() {
                var u = ui;
                var off = [];
                off.push(listen(u.combo, 'keydown', onKeydown));
                if (u.search) {
                    off.push(listen(u.search, 'input', onSearchInput));
                    off.push(listen(u.search, 'focus', function () { if (!multi && u.search.value && !typing) window.setTimeout(function () { if (document.activeElement === u.search) u.search.select(); }, 0); }));
                }
                off.push(listen(u.combo, 'blur', function () {
                    window.setTimeout(function () {
                        if (!ui || !isOpen()) return;
                        var active = document.activeElement;
                        if (!active || (!u.control.contains(active) && !u.panel.contains(active))) closeList('blur');
                    }, 0);
                }));
                /* Pressing on the control keeps the focus where it is (or lets the combobox take it); the click then toggles the list. */
                off.push(listen(u.control, 'mousedown', function (e) {
                    if (e.target !== u.search && e.target !== u.combo) e.preventDefault();
                }));
                off.push(listen(u.control, 'click', function (e) {
                    var remove = e.target.closest ? e.target.closest('.bui-select__tag-remove') : null;
                    if (remove && u.control.contains(remove)) {
                        e.stopPropagation();
                        if (!isDisabled()) { removeValue(remove.getAttribute('data-value'), 'user'); if (!isOpen()) u.combo.focus(); }
                        return;
                    }
                    if (e.target.closest && e.target.closest('.bui-select__clear')) {
                        e.stopPropagation();
                        if (!isDisabled()) { clearAll('user'); u.combo.focus(); }
                        return;
                    }
                    if (isDisabled()) return;
                    u.combo.focus();
                    if (isOpen()) { if (!(u.search && e.target === u.search)) closeList('toggle'); } else openList('click');
                }));
                /* The panel never takes the focus: options are chosen with the pointer while the combobox keeps it. */
                off.push(listen(u.panel, 'mousedown', function (e) { e.preventDefault(); }));
                off.push(listen(u.panel, 'click', function (e) {
                    var action = e.target.closest ? e.target.closest('[data-action]') : null;
                    if (action) {
                        if (action.getAttribute('data-action') === 'retry') remoteLoad(rs.page === 0);
                        else remoteMore();
                        return;
                    }
                    var option = e.target.closest ? e.target.closest('.bui-select__option') : null;
                    if (option && u.list.contains(option)) choose(Number(option.getAttribute('data-index')), 'user');
                }));
                off.push(listen(u.panel, 'mousemove', function (e) {
                    var option = e.target.closest ? e.target.closest('.bui-select__option') : null;
                    u.panel.classList.remove('is-keyboard');
                    if (!option || option.getAttribute('aria-disabled') === 'true') return;
                    var index = Number(option.getAttribute('data-index'));
                    if (index !== activeIndex) setActive(index, false);
                }));
                off.push(listen(u.list, 'scroll', function () {
                    var nearEnd = u.list.scrollTop + u.list.clientHeight >= u.list.scrollHeight - 200;
                    if (nearEnd && renderedCount < visible.length) appendUpTo(renderedCount + CHUNK);
                    if (!remote || options.loadMore !== 'scroll') return;
                    if (u.list.scrollTop + u.list.clientHeight >= u.list.scrollHeight - 48) { rs.chain = 0; remoteMore(); }
                }, { passive: true }));
                if (typeof window.ResizeObserver === 'function') {
                    resizeObserver = new window.ResizeObserver(function () { if (isOpen()) { updateWidth(); controller.update(); } });
                    resizeObserver.observe(u.control);
                }
                ui.off = off;
            }

            function teardown() {
                window.clearTimeout(timers.search);
                window.clearTimeout(timers.buffer);
                window.clearTimeout(timers.announce);
                abortRemote();
                if (resizeObserver) { resizeObserver.disconnect(); resizeObserver = null; }
                if (controller) { controller.destroy(); controller = null; }
                if (ui) {
                    ui.off.forEach(function (fn) { fn(); });
                    if (ui.wrapper.parentNode) {
                        ui.wrapper.parentNode.insertBefore(el, ui.wrapper);
                        ui.wrapper.parentNode.removeChild(ui.wrapper);
                    }
                    ui = null;
                }
                restore.labelIds.splice(0).forEach(function (label) { if (label.id.indexOf('bui-select-label') === 0) label.removeAttribute('id'); });
                nodes = [];
            }

            /* ---- reacting to the native element ---- */

            function refreshFromNative() {
                if (destroyed || !ui) return;
                if (remote) { readSelection(); renderValue(); syncState(); return; }
                readNative();
                filterItems();
                renderValue();
                syncState();
                if (isOpen()) { renderList(); resetActive(); controller.update(); }
            }

            var scheduled = false;
            function scheduleRefresh() {
                if (scheduled) return;
                scheduled = true;
                Promise.resolve().then(function () { scheduled = false; refreshFromNative(); });
            }

            function init() {
                restore = {
                    className: el.getAttribute('class'), tabindex: el.getAttribute('tabindex'), ariaHidden: el.getAttribute('aria-hidden'), labelIds: []
                };
                multi = !!el.multiple;
                el.classList.add('bui-select__native');
                el.setAttribute('tabindex', '-1');
                el.setAttribute('aria-hidden', 'true');
                if (remote) { emptyOption = Array.from(el.options).filter(function (o) { return o.value === ''; })[0] || null; readSelection(); }
                else readNative();
                applyPlaceholderRule();
                if (!remote) readSelection();
                build();
                renderValue();
                syncState();
                renderTexts();

                cleanups.push(listen(el, 'focus', function () { if (ui && !isDisabled()) ui.combo.focus(); }));
                cleanups.push(listen(el, 'change', function () { if (!ownChange) refreshFromNative(); }));
                cleanups.push(listen(el, 'invalid', function () { if (ui) ui.combo.focus(); }));
                var form = el.form;
                if (form) {
                    cleanups.push(listen(form, 'reset', function () {
                        window.setTimeout(function () {
                            if (destroyed) return;
                            applyPlaceholderRule();
                            typing = false; query = '';
                            refreshFromNative();
                        }, 0);
                    }));
                }
                cleanups.push(listen(document.documentElement, 'bui:locale:change', function () { renderTexts(); if (isOpen()) renderList(); }));
                if (typeof window.MutationObserver === 'function') {
                    observer = new window.MutationObserver(function (records) {
                        var rebuild = records.some(function (r) { return r.type === 'attributes' && r.attributeName === 'multiple'; });
                        if (rebuild) { api.update({}); return; }
                        syncState();
                        if (records.some(function (r) { return r.type === 'childList' || r.attributeName === 'selected'; })) scheduleRefresh();
                    });
                    observer.observe(el, { attributes: true, attributeFilter: ['disabled', 'class', 'aria-invalid', 'required', 'multiple'], childList: !remote, subtree: !remote });
                }
            }

            /* ---- public methods ---- */

            function toList(input) {
                if (input === null || input === undefined || input === '') return [];
                return Array.isArray(input) ? input : [input];
            }

            api = {
                getValue: getValue,
                setValue: function (input) {
                    if (destroyed) return api;
                    var before = signature();
                    var next = new Map();
                    toList(input).forEach(function (entry) {
                        var value = entry !== null && typeof entry === 'object' ? entry.value : entry;
                        if (typeof value !== 'string' && typeof value !== 'number') { log2.warn('setValue(): each value must be a string or a number.'); return; }
                        value = String(value);
                        if (value === '') return;
                        var known = items.filter(function (r) { return r.value === value; })[0];
                        if (!known && !remote) { log2.warn('setValue(): there is no option with the value "' + value + '".'); return; }
                        var label = entry !== null && typeof entry === 'object' && entry.label !== undefined ? String(entry.label) : (known ? known.label : (selected.has(value) ? selected.get(value).label : value));
                        next.set(value, { value: value, label: label });
                    });
                    if (!multi && next.size > 1) { var lastRec = Array.from(next.values()).pop(); next = new Map(); next.set(lastRec.value, lastRec); }
                    selected = next;
                    commit('api', before);
                    if (isOpen()) { renderList(); resetActive(); }
                    return api;
                },
                open: function () { return openList('api'); },
                close: function () { return closeList('api'); },
                isOpen: isOpen,
                clear: function () { clearAll('api'); return api; },
                setOptions: function (list) {
                    if (destroyed) return api;
                    if (!Array.isArray(list)) { log2.warn('setOptions() expects an array of { value, label } or { label, options: [...] }.'); return api; }
                    var records = [];
                    var valid = true;
                    list.forEach(function (entry) {
                        if (entry && Array.isArray(entry.options) && typeof entry.label === 'string') {
                            entry.options.forEach(function (o) { records.push({ o: o, group: entry.label, groupDisabled: entry.disabled === true }); });
                        } else {
                            records.push({ o: entry, group: null, groupDisabled: false });
                        }
                    });
                    records.forEach(function (r) {
                        if (!r.o || (typeof r.o.value !== 'string' && typeof r.o.value !== 'number') || (typeof r.o.label !== 'string' && typeof r.o.label !== 'number')) valid = false;
                    });
                    if (!valid) { log2.warn('setOptions(): each option needs a value and a label. The options were not changed.'); return api; }
                    var before = signature();
                    var previous = new Set(selected.keys());
                    if (remote) {
                        abortRemote();
                        items = records.map(function (r) {
                            var label = String(r.o.label);
                            return { value: String(r.o.value), label: label, disabled: r.o.disabled === true || r.groupDisabled, group: r.group, norm: selectNorm(label) };
                        });
                        rs.loaded = true; rs.hasMore = false; rs.error = false; rs.page = 1; rs.chain = 0;
                        filterItems();
                        if (isOpen()) { renderList(); resetActive(); controller.update(); }
                        return api;
                    }
                    Array.from(el.children).forEach(function (child) {
                        if (child !== emptyOption) el.removeChild(child);
                    });
                    var groupEl = null;
                    var groupName = null;
                    var anySelected = false;
                    records.forEach(function (r) {
                        if (r.group !== groupName) {
                            groupName = r.group;
                            groupEl = null;
                            if (groupName !== null) {
                                groupEl = document.createElement('optgroup');
                                groupEl.label = groupName;
                                groupEl.disabled = r.groupDisabled;
                                el.appendChild(groupEl);
                            }
                        }
                        var option = document.createElement('option');
                        option.value = String(r.o.value);
                        option.textContent = String(r.o.label);
                        option.disabled = r.o.disabled === true;
                        option.selected = previous.has(option.value) || r.o.selected === true;
                        if (option.selected) anySelected = true;
                        (groupEl || el).appendChild(option);
                    });
                    if (!multi && !anySelected) { if (emptyOption) emptyOption.selected = true; else el.selectedIndex = -1; }
                    discard();
                    readNative();
                    renderValue();
                    syncState();
                    if (signature() !== before) ctx.trigger('change', detail('api'));
                    if (isOpen()) { filterItems(); renderList(); resetActive(); controller.update(); }
                    return api;
                },
                refresh: function () {
                    if (destroyed) return api;
                    if (remote) {
                        readSelection();
                        if (isOpen()) remoteLoad(true);
                        else { abortRemote(); rs.loaded = false; rs.page = 0; items = []; visible = []; }
                        renderValue();
                        syncState();
                    } else {
                        refreshFromNative();
                    }
                    return api;
                },
                update: function (partial) {
                    if (destroyed) return api;
                    var next = {};
                    Object.keys(options).forEach(function (k) { next[k] = options[k]; });
                    if (partial && typeof partial === 'object') {
                        Object.keys(partial).forEach(function (k) {
                            if (SELECT_KEYS.indexOf(k) === -1) { log2.warn('update(): unknown option "' + k + '". Known: ' + SELECT_KEYS.join(', ') + '.'); return; }
                            next[k] = partial[k];
                        });
                    }
                    normalize(next);
                    var wasOpen = isOpen();
                    var hadFocus = !!(ui && ui.wrapper.contains(document.activeElement));
                    var keepSelection = Array.from(selected.values());
                    teardown();
                    Object.keys(next).forEach(function (k) { options[k] = next[k]; });
                    if (!remote && options.url) log2.warn('url is only used by the remote mode.');
                    multi = !!el.multiple;
                    if (remote) { selected = new Map(); keepSelection.forEach(function (r) { selected.set(r.value, r); }); readSelection(); }
                    else readNative();
                    typing = false; query = '';
                    restore.labelIds = [];
                    build();
                    renderValue();
                    syncState();
                    renderTexts();
                    if (hadFocus) ui.combo.focus();
                    if (wasOpen) openList('api');
                    return api;
                },
                destroy: function () {
                    if (destroyed) return;
                    destroyed = true;
                    if (observer) { observer.disconnect(); observer = null; }
                    cleanups.splice(0).forEach(function (off) { off(); });
                    teardown();
                    el.classList.remove('bui-select__native');
                    if (restore.className === null || restore.className === '') el.removeAttribute('class');
                    else if (restore.className !== null) el.setAttribute('class', restore.className);
                    if (restore.tabindex === null) el.removeAttribute('tabindex'); else el.setAttribute('tabindex', restore.tabindex);
                    if (restore.ariaHidden === null) el.removeAttribute('aria-hidden'); else el.setAttribute('aria-hidden', restore.ariaHidden);
                }
            };

            init();
            return api;
        }
    });

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
