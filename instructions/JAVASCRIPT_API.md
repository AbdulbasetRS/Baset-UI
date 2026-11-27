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
BUI.dialog(el, options?) -> { open, close, toggle, isOpen, destroy }  // Task 13، data-bui-dialog، BUI.modal اسم مستعار
BUI.drawer(el, options?) -> { open, close, toggle, isOpen, destroy }  // Task 13، data-bui-drawer
BUI.overlay.{getStack, getTop, closeAll};                              // Task 13، Overlay Manager المشترك
BUI.position(anchor, floating, options?) -> { update, getPlacement, destroy } | null   // Task 16: Positioning Engine (internal, documented)
BUI.popover(el, options?) -> { show, hide, toggle, isOpen, update, destroy }          // Task 16: data-bui-popover
BUI.menu(el, options?) -> { open, close, toggle, isOpen, update, destroy }            // Task 16: data-bui-menu
BUI.{camelCaseName}(target, options?)         // Factory يضيفه register()
BUI.{camelCaseName}.{variant}(target, options?)
```

### مستقبلي (غير منفذ)
خيار `locale` في `config` (لم يُنفذ في Task 06: انظر قرار INTERNATIONALIZATION.md)، `BUI.dataTable`، `BUI.select.*`، `instance.on/off`، `BUI.register` لمكونات Core نفسها (لا مكون منفذ).

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

## إضافات Task 13 (Overlay Manager وDialog وDrawer)
- **Overlay Manager** (`BUI.overlay`) يحتفظ بمكدس الطبقات المفتوحة (Dialog وDrawer معاً) وبقفل تمرير واحد مشترك. `getStack()` عناصر الطبقات المفتوحة من الأسفل، `getTop()` الأعلى أو `null`، `closeAll()` يطلب إغلاق الكل من الأعلى ويرجع عدد من قبل (إلغاء `beforeclose` لا يُحسب). الدوال الداخلية (دفع الطبقة وسحبها) غير معلنة.
- **الخيارات** (متطابقة في Dialog وDrawer، الأنواع من القيم الافتراضية): `static: false` و`keyboard: true` و`focus: ''` (Selector لعنصر التركيز الأولي) و`restoreFocus: true` و`url: ''` و`load: null` (دالة، JavaScript فقط) و`loadOnce: true`. المقابل في HTML: `data-bui-static` و`data-bui-keyboard` و`data-bui-focus` و`data-bui-restore-focus` و`data-bui-url` و`data-bui-load-once`.
- **الطرق:** `open(trigger?)` و`close(returnValue?)` و`toggle()` ترجع بوليان (القبول)، و`isOpen()`، و`destroy()` (يغلق فوراً بلا حركة ولا أحداث، ويزيل كل المستمعات والمؤقتات، ويعيد محتوى الـ Body الأصلي، ويزيل `tabindex` الذي أضافه للـ Panel). العنصر غير `<dialog>`: خطأ في Console ويرجع `null`.
- **الأحداث** `bui:dialog:*` و`bui:drawer:*`: `beforeopen` (قابل للإلغاء، `relatedTarget`) و`open` و`beforeclose` (قابل للإلغاء، `source` وهو `api` أو `dismiss` أو `escape` أو `backdrop` أو `form`) و`close` (`source` و`returnValue` و`relatedTarget`) و`load` و`loaderror` (`error`). تصعد (Bubble)، فمستمع على حوار أب يستقبل أحداث الحوار المتداخل في Markup ويقارن `event.target`. **قرار تسمية:** `beforeopen` وليس `before-open` (انظر NAMING_CONVENTIONS.md): هذا يعدّل ما كتب في بند الأحداث أعلاه (`before-*`) لهذين الحدثين، ويبقى `before-*` للأحداث متعددة الكلمات مستقبلاً.
- **المحتوى الديناميكي:** `load(body, ctx)` يرجع نصاً (HTML، يُدرج بـ `innerHTML` فهو لمحتوى موثوق) أو Node أو Promise بأحدهما؛ و`url` عنوان من نفس الأصل فقط (غيره يُرفض بـ `loaderror`). أثناء التحميل: `aria-busy` على الـ Body وسطر حالة، وعند الفشل سطر `role="alert"` مترجم (`overlay.loadError`). بعد النجاح يُستدعى `BUI.init` على الـ Body.
- **الفتح من HTML:** مستمع نقر واحد مفوّض على المستند (ليس لكل نسخة، فلا يُزال مع `destroy`) يخدم `data-bui-dialog-open` و`data-bui-drawer-open`، ويهيئ الهدف إن لم يكن مهيّأ، ويمرر زر الفتح كـ `relatedTarget`.

## إضافات Task 15 (Alert وToast)
- **`BUI.config`:** مفتاح جديد `toast` (كائن): `position` (أحد المواضع الستة، الافتراضي `top-end`) و`duration` (رقم >= 0 بالمللي ثانية، `5000`، و`0` دائم) و`max` (عدد صحيح >= 1، `5`، لكل موضع) و`closable` (`true`). الدمج جزئي (المفاتيح غير الممررة تبقى)، والمفتاح المجهول أو القيمة غير الصالحة تُرفض بتحذير وتبقى القيمة الحالية. `BUI.config()` يرجع `toast` ضمن النسخة.
- **`BUI.alert(el)`:** مكون مسجل (`data-bui-alert`، بلا خيارات). `close()` يرجع بوليان (`false` إن كان يُغلق أو أُلغي `beforeclose`) ويبدأ حركة الخروج ثم يطلق `bui:alert:close` ثم يزيل العنصر من DOM ثم يدمّر النسخة. `isClosed()`. `destroy()` يلغي إغلاقاً معلقاً ويزيل `role` الذي أضافه المكون (لا يعيد عنصراً أُزيل). الأحداث على العنصر وتصعد: `bui:alert:beforeclose` (قابل للإلغاء) و`bui:alert:close`. **أسماء الأحداث بلا شرطة** (`beforeclose`) كما في Dialog (انظر NAMING_CONVENTIONS.md).
- **`data-bui-dismiss`:** صار له نطاق. القيمة الفارغة (أو نوع الطبقة نفسها) لـ Dialog وDrawer، و`alert` لـ Alert (معالج مفوض واحد على المستند، يعمل بلا `data-bui-alert`). قيمة أخرى لا يلتقطها Dialog ولا Drawer.
- **`BUI.toast`:** `show(options)` يرجع Handle أو `null` (مع تحذير) إن لم يكن `options` كائناً عادياً أو بلا عنوان ورسالة. الخيارات: `type` (`primary|secondary|success|warning|danger|info`، و`error` اسم بديل لـ `danger`، الافتراضي `info`) و`title` و`message` (نصوص تُدرج كنص فقط) و`duration` و`position` و`closable` و`icon` (اسم أيقونة أو `false`) و`actions` (مصفوفة `{ label, onClick(handle, event), close }`). القيم غير الصالحة تُستبدل بالافتراضي مع تحذير. الاختصارات `success/error/warning/info(messageOrOptions, options?)`. `clear()` يرجع عدد ما أُغلق أو أُسقط من الطابور. الـ Handle: `id` و`element` (`null` أثناء الانتظار وبعد المغادرة) و`close()` و`update(partial)` (لا يغيّر `position`، ويعيد بناء المحتوى فيُفقد تركيز زر داخله) و`isOpen()` (`true` أثناء الانتظار والعرض). الأحداث على عنصر toast وتصعد، غير قابلة للإلغاء: `bui:toast:show` (`id` و`type` و`position`) و`bui:toast:hide` (وفيها `reason`: `timeout|api|close-button|escape|action|clear`، تُطلق بعد حركة الخروج وقبل إزالة العنصر). التفاصيل في صفحة Toast.
- **Overlay Manager (داخلي):** بعد دفع الطبقة أو سحبها يُستدعى `overlayChanged` إن عُيّن (لا يُعلن ولا يُصدَّر؛ Toast وحده يستخدمه) لينقل حاوية Toast إلى أعلى طبقة مفتوحة.

## إضافات Task 16 (Positioning Engine وPopover وMenu)
- **`BUI.position(anchor, floating, options)`** واجهة **داخلية** موثقة (للمكونات؛ قد تتغير قبل 1.0 دون Major). ترجع `{ update(), getPlacement(), destroy() }` أو `null` لوسائط غير عناصر (تحذير). الخيارات: `placement` (`'bottom'`؛ `top|bottom|start|end` مع `-start|-end`، والقيمة غير الصالحة تُستبدل بـ `bottom` بتحذير) و`offset` (8) و`padding` (8، حافة الشاشة) و`flip` (true) و`shift` (true) و`arrow` (عنصر أو `null`) و`arrowPadding` (8) و`autoUpdate` (true) و`hideWhenClipped` (true) و`onUpdate(result)` (`result`: `placement` و`side` و`x` و`y` و`detached`). مفتاح مجهول: تحذير. أرقام غير صالحة: تحذير والعودة للافتراضي. **يملك** الخصائص المضمنة `position` و`margin` و`right` و`bottom` و`left` و`top` للعنصر العائم، ويضع `data-bui-side` (فيزيائي) و`data-bui-placement` (منطقي بعد أي Flip) و`data-bui-detached` والخصائص `--bui-position-available-width|height`، ويزيلها كلها في `destroy()` (ومعها كل المستمعين: Scroll لكل أب قابل للتمرير وللنافذة وResize وResizeObserver وrAF). `start` و`end` يتبعان `direction` المحسوب للمرتكز. العنصر العائم يجب أن يكون معروضاً (ليس `display: none`) عند القياس، وألا يكون داخل سلف له `transform`.
- **`BUI.popover(trigger, options)`** (`data-bui-popover`): الخيارات `target` و`title` و`content` (نص فقط) و`trigger` (`click|hover|focus|manual`، يُجمع بمسافة، و`manual` منفرد) و`placement` (`bottom`) و`offset` (8) و`arrow` (true) و`flip` و`shift` (true) و`closeOnOutside` (true؛ لا يسري مع `manual`) و`keyboard` (true) و`focus` (true) و`restoreFocus` (true) و`delay` (150). الطرق `show/hide/toggle/isOpen/update/destroy`. الأحداث على المرتكز وتصعد: `bui:popover:beforeshow` (قابل للإلغاء) و`show` و`beforehide` (قابل للإلغاء) و`hide`، وفي `detail.source` السبب: `click|hover|focus|api|escape|outside|focusout|tab|overlay|detached`. مرتكز غير قابل للتركيز: تحذير. بلا محتوى (لا عنوان ولا محتوى ولا هدف): خطأ ونسخة خاملة.
- **`BUI.menu(trigger, options)`** (`data-bui-menu`): الخيارات `target` و`placement` (`bottom-start`) و`offset` (4) و`closeOnSelect` (true) و`orientation` (`vertical|horizontal`) و`restoreFocus` (true). الطرق `open/close/toggle/isOpen/update/destroy`. الأحداث على المرتكز: `bui:menu:beforeopen` (قابل للإلغاء) و`open` و`beforeclose` (قابل للإلغاء) و`close` و`select` (`detail`: `item` و`role` و`checked` و`value` من `data-bui-value`). سمات العنصر: `data-bui-keep-open` و`data-bui-value` و`data-bui-text` (لـ Type-ahead).
- **قرار تسمية الأحداث:** أحداث Popover `beforeshow|show|beforehide|hide` مع الطرق `show/hide`، وأحداث Menu `beforeopen|open|beforeclose|close` مع `open/close`، كلها بلا شرطة بين الكلمات كما في Dialog. الأحداث تُطلق على المرتكز لا على اللوحة (اللوحة تُنقل في DOM أثناء الفتح).
- **Overlay Manager (داخلي، تحديث):** الخطاف الواحد `overlayChanged` صار قائمة `overlayHooks` داخلية (Toast وPopover وMenu)، يُستدعى بعد كل تغيير في مكدس الطبقات.
