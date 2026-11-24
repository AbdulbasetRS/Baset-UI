# قواعد JavaScript API

> الحالة (Task 06): **نواة JavaScript منفذة** في `assets/js/baset-ui.js`: Namespace وRegistry وInit وInstances وEvents وOptions Parser وDOM Helpers وUtilities وLogger وObserver اختياري، و`BUI.theme` (Theme Manager) و`BUI.locale` (Locale Manager) منذ Task 06. **لا يوجد أي Component منفذ**. كل ما وُسم "مستقبلي" أدناه غير موجود ولا يجوز الادعاء بوجوده. التوثيق الموجه للمستخدمين: `documentation/javascript/`.

## Namespace
`window.BUI` فقط. ممنوع `BasetUI` أو أي Global آخر. لا تلوث الـ Global Scope. تحميل الملف مرتين يطبع تحذيراً ولا يستبدل `BUI`.

## الواجهة المنفذة
```javascript
BUI.version;                          // '0.0.0-foundation'
BUI.config({ autoInit, observe, logLevel });   // يرجع نسخة من الإعدادات؛ BUI.config() للقراءة
BUI.register(name, definition);       // يرجع Factory أو null
BUI.init(root?);                      // يرجع مصفوفة النسخ الجديدة فقط
BUI.getInstance(target, name);        // نسخة أو null
BUI.destroy(root?);                   // يرجع العدد
BUI.destroyAll();                     // يرجع العدد (يشمل العناصر خارج المستند)
BUI.on(name, handler);                // يرجع دالة إلغاء الاشتراك
BUI.off(name, handler?);
BUI.emit(name, detail?);              // يرجع عدد المعالجات المستدعاة
BUI.trigger(el, component, event, detail?, { bubbles, cancelable });  // بوليان
BUI.options.fromElement(el, defaults, component?);
BUI.options.resolve(el, defaults, jsOptions?, component?);
BUI.dom.{select, selectAll, closest, matches, getData, hasData, setData, removeData, hasClass, addClass, removeClass, toggleClass, isRTL};
BUI.utils.{uid, debounce, throttle, deepMerge, isPlainObject, kebabToCamel, camelToKebab};
BUI.log.{error, warn, info, debug, getLevel, setLevel};
BUI.theme.{set, setMode, toggleMode, get, getMode, load};   // Task 06، التفاصيل في RTL_LTR_AND_THEMES.md
BUI.locale.{use, t, get, getDirection, register, apply};    // Task 06، التفاصيل في INTERNATIONALIZATION.md
BUI.avatar(el)  -> { isFallback, refresh, destroy }            // Task 10، اختياري، data-bui-avatar
BUI.progress(el) -> { set, get, getPercent, refresh, destroy } // Task 10، اختياري، data-bui-progress
BUI.passwordToggle(el) -> { show, hide, toggle, isVisible, destroy } // Task 12، اختياري، data-bui-password-toggle، الحدث bui:password-toggle:toggle
BUI.{camelCaseName}(target, options?)         // Factory يضيفه register()
BUI.{camelCaseName}.{variant}(target, options?)
```

### مستقبلي (غير منفذ)
خيار `locale` في `config` (لم يُنفذ في Task 06: انظر قرار INTERNATIONALIZATION.md)، `BUI.toast`، `BUI.modal`، `BUI.dataTable`، `BUI.select.*`، `instance.on/off`، `BUI.register` لمكونات Core نفسها (لا مكون منفذ).

## قواعد التصميم
1. **Component Factory:** `BUI.{component}(target, options)` أو `BUI.{component}.{variant}(target, options)` يرجع Instance. اسم المكون kebab-case عند التسجيل (`date-picker`)، والـ Factory بصيغة camelCase (`BUI.datePicker`)، والسمة `data-bui-date-picker`، والحدث `bui:date-picker:*`.
2. **Target:** Selector أو Element (أول عنصر مطابق). غير موجود → `null` + تحذير `[BUI]`.
3. **Options:** كائن camelCase؛ الأولوية: Defaults < HTML Attributes < JS. الدمج عميق للكائنات، والمصفوفات والقيم الأخرى تُستبدل. نوع كل خيار يُستنتج من قيمته الافتراضية؛ قيمة HTML غير صالحة أو قيمة JS من نوع مختلف → تحذير والعودة للأدنى أولوية. خيار JS غير موجود في `defaults` → تحذير ويمرر كما هو. الافتراضي `null` يقبل أي نوع.
4. **Instance:** يجب أن يرجع `create()` كائناً فيه `destroy()` (إلزامي، وإلا يُرفض بخطأ ويرجع `null`). الـ Core يغلّف `instance.destroy()` ليزيل النسخة من السجل؛ التكرار لا يفعل شيئاً. نسخة مجمّدة لا يمكن تغليفها: تحذير، وتُنظف عبر `BUI.destroy()`.
5. **Events:** DOM Events `bui:{component}:{event}` (Bubbling افتراضياً، ليست Cancelable افتراضياً). أحداث `before-*` قابلة للإلغاء عبر `cancelable: true`. **قرار (Task 05):** أسماء الأحداث kebab-case (`before-open` وليس `beforeOpen`). ناقل عام منفصل `BUI.on/off/emit` بأسماء حرة؛ الأحداث التي يطلقها الـ Core: `register` و`init` و`destroy` (لا تُنسخ إلى DOM). **أحداث النظامين (Task 06)** أحداث DOM على `document.documentElement` عبر `BUI.trigger`: `bui:theme:change` و`bui:locale:change` (Bubbling، غير قابلة للإلغاء).
6. **Promises:** العمليات غير المتزامنة ترجع Promise: `BUI.locale.use()` و`BUI.theme.load()` منفذان (Task 06)؛ تحميل البيانات مستقبلي.
7. **Idempotent:** تهيئة نفس العنصر والمكون مرتين ترجع نفس الـ Instance، والخيارات الممررة في المرة الثانية تُتجاهل.
8. **Chaining:** لا يُشترط.
9. **Extensions:** تسجل نفسها بـ `BUI.register` دون تعديل Core (انظر [CORE_ASSETS.md](CORE_ASSETS.md)).
10. **التوافق:** لا كسر لواجهة منشورة قبل Major جديد ([RELEASE_AND_VERSIONING.md](RELEASE_AND_VERSIONING.md)). الواجهات الداخلية تبدأ بـ `_` وغير مضمونة (لا توجد حالياً).
11. **المتصفحات:** المتصفحات الحديثة (Evergreen). الـ Core يستخدم `WeakMap` و`WeakRef` و`MutationObserver` و`CustomEvent`. لا Polyfills دون قرار.
12. **الأمان:** لا `innerHTML` بنصوص غير موثوقة؛ استخدم `textContent` أو تنظيف صريح. لا `eval`. `deepMerge` يتجاهل المفاتيح `__proto__` و`constructor` و`prototype`.
13. **الأداء:** Event Delegation حيث أمكن، لا قراءة/كتابة DOM متداخلة.
14. **الكود:** `'use strict'`، بدون اعتماد على Build.

## التهيئة التلقائية والتوقيت
- `autoInit` (افتراضي `true`): `BUI.init(document)` عند `DOMContentLoaded`. إن حُمّل الملف بعد ذلك، يُنفذ في المهمة التالية (`setTimeout 0`) ليبقى `BUI.config({ autoInit: false })` المكتوب بعد وسم السكربت فعالاً.
- `observe` (افتراضي `false`): `MutationObserver` على المستند يهيئ العناصر المضافة فقط (لا يهدم عند الإزالة). يبدأ بعد جاهزية المستند وبعد أول Init تلقائي.
- `logLevel`: `silent` | `error` | `warn` (افتراضي) | `info` | `debug`. الصيغة `[BUI] Component: message`.

## الأخطاء
- `create()` يرمي استثناء → `console.error` ويرجع `null` دون تخزين، ولا يوقف تهيئة العناصر الأخرى.
- `destroy()` يرمي استثناء → `console.error` ويُنظف السجل.
- Selector غير صالح في Helpers → تحذير وقيمة فارغة.

قواعد Lifecycle والذاكرة والأخطاء في [COMPONENT_DEVELOPMENT.md](COMPONENT_DEVELOPMENT.md).
