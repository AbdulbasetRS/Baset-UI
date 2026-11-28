# مسؤوليات ملفات Core

## `assets/css/baset-ui.css`
**المسؤولية (إلزامي):** كل ما هو مشترك للمكتبة:
- CSS Variables (Colors, Typography, Spacing, Borders, Shadows, Radius) و Theme Variables.
- Base/Reset الخفيف.
- Layout: Containers, Grid, Flex Utilities, Responsive Utilities.
- المكونات الأساسية الصغيرة والمشتركة (Buttons, Forms, Modals, Alerts, Toasts, Cards...).

**الحالة الحالية (Task 13):** Tokens كاملة (Light/Dark)، Base، Layout (Container/Grid)، Utilities (Flexbox وSpacing وDisplay وPosition وOverflow وVisibility وBorders)، وكل نسخ الـ Breakpoints، وقسم 6 (Components) فيه Avatar وBadge وButton وButton Group وCard وCheckbox وClose Button وDialog وDrawer وForm Controls وInput وList Group وProgress وRadio وSwitch (Task 09 إلى Task 13، وحجم `baset-ui.css` بعد Task 13: 246,749 بايت خام و34,507 gzip، النمط في [COMPONENT_DEVELOPMENT.md](COMPONENT_DEVELOPMENT.md)). في Task 10 صار `baset-ui.js` يحتوي أيضاً مكونين مسجلين (`avatar` و`progress`)، وفي Task 12 ثالثاً (`password-toggle`، `baset-ui.js` 64,750 بايت خام و15,029 gzip) بعد `window.BUI = BUI`، وفي Task 13 رابعاً وخامساً (`dialog` و`drawer`، مع Overlay Manager قبل `window.BUI`؛ `baset-ui.js` 85,789 بايت خام و20,244 gzip)، لأن لهما سلوكاً صغيراً لا يستقيم بـ CSS وحده (انظر [ARCHITECTURE.md](ARCHITECTURE.md)). نسخ الـ Breakpoints موجودة لـ Display وPosition (النوع فقط) وOverflow؛ لا نسخ لـ Visibility وBorders وz-index وOffsets وtruncate/line-clamp.

### ترتيب الأقسام داخل الملف (إلزامي)
1. Tokens  2. Dark Mode  3. Base  4. Layout  5. Utilities  6. Components (أبجدياً)  7. Responsive Utilities  8. Print/Reduced-motion.
كل قسم بتعليق ترويسة واضح.

**ملاحظات تنفيذ (Task 03):** القسم 7 يضم نسخ الـ Breakpoints لكل من القسمين 4 و5 (مرتبة تصاعدياً بعد القواعد الأساسية)، لأن Mobile First يتطلب أن تأتي نسخ `min-width` بعد الأساس. Utilities تستخدم `!important` (هذا هو الاستثناء المسموح)، لأنها تسبق Components في الترتيب. قواعد Tokens والاشتقاق في [RTL_LTR_AND_THEMES.md](RTL_LTR_AND_THEMES.md).

### قواعد
- لا ملف CSS مستقل لكل Component صغير.
- كل قيم الألوان والمسافات تأتي من Tokens، لا قيم مكتوبة مباشرة داخل المكونات (راجع [RTL_LTR_AND_THEMES.md](RTL_LTR_AND_THEMES.md)).
- تُستخدم Logical Properties.
- ممنوع `!important` إلا في Utilities المصممة لذلك.

## `assets/js/baset-ui.js`
**المسؤولية (إلزامي):** Core Initialization، Global Config، Theme Manager، Locale Manager، Overlay Manager (يحل محل Modal Manager)، Toast Manager، Shared Utilities، DOM Helpers، Component Initialization، Event Management.

**الحالة الحالية (Task 06):** منفذ: Theme Manager (`BUI.theme`) وLocale Manager (`BUI.locale`) إضافة إلى ما يلي من Task 05: Namespace `BUI`، Global Config (`BUI.config`)، Registry (`BUI.register`)، Init وInstances، Events، DOM Helpers، Utilities، Options Parser، Logger، وObserver اختياري. **منفذ في Task 13:** Overlay Manager (`BUI.overlay`) و`BUI.dialog` (الاسم المستعار `BUI.modal`) و`BUI.drawer`. **منفذ في Task 15:** Toast Manager (`BUI.toast`) ومكون `alert`، وخيار `toast` في `BUI.config`. الواجهة في [JAVASCRIPT_API.md](JAVASCRIPT_API.md).

قواعد: IIFE أو UMD بدون Modules كشرط، يعرّض `window.BUI` فقط، لا متغيرات Global أخرى. التفاصيل في [JAVASCRIPT_API.md](JAVASCRIPT_API.md).

## متى يصبح Component Extension مستقلاً؟
يكون Extension إذا تحقق **شرطان على الأقل** من التالية:
1. حجم CSS+JS المتوقع يتجاوز **15KB** غير مضغوطة (اقتراح للحد، يُراجع).
2. لا يحتاجه معظم المستخدمين في معظم الصفحات.
3. يعتمد على منطق ثقيل (حسابات، رسم Canvas/SVG، بيانات كبيرة).
4. يحتاج ملفات إضافية خاصة به (خطوط، بيانات، Workers).

أمثلة مرشحة (مستقبلي): Charts, DataTable, Calendar, Rich Text Editor, Maps.

### آلية تسجيل Extensions (Task 05)
Extension سكربت مستقل يُحمَّل بعد `baset-ui.js` ويسجل مكوناته عبر الواجهة العامة فقط، دون تعديل Core ودون أي Global جديد:
```javascript
(function () {
    'use strict';
    if (!window.BUI) { console.warn('[BUI] DataTable: load baset-ui.js first.'); return; }
    BUI.register('data-table', {
        defaults: { perPage: 10 },
        create: function (element, options, context) { /* ... */ return { destroy: function () { /* ... */ } }; }
    });
})();
```
- يُحمَّل قبل `DOMContentLoaded` ليلتقطه الـ Init التلقائي، أو يستدعي `BUI.init()` بعد التسجيل.
- يفشل `register` (خطأ في Console ويرجع `null`) إن كان الاسم مسجلاً أو محجوزاً أو التعريف غير صالح؛ الـ Core لا يعرف أسماء الـ Extensions مسبقاً.
- الاسم kebab-case، ويُنشئ `BUI.dataTable` وسمة `data-bui-data-table` والأحداث `bui:data-table:*`. تعريف `create/defaults/variants` في [JAVASCRIPT_API.md](JAVASCRIPT_API.md).
- يلتزم بـ `destroy()` الذي يزيل كل ما أضافه.

### أول Extension منفذ: الأيقونات (Task 07)
`assets/css/extensions/baset-ui-icons.css` (CSS فقط، مولَّد). **استثناء موثق:** لا يسجل بـ `BUI.register` ولا يحتوي JavaScript لأنه لا سلوك له؛ التسجيل لازم فقط للمكونات ذات JS. يُحمَّل بعد `baset-ui.css`. التفاصيل في [ICONS_SYSTEM.md](ICONS_SYSTEM.md).

### قواعد الـ Extension
- ملفاته: `assets/css/extensions/baset-ui-{name}.css` و`assets/js/extensions/baset-ui-{name}.js`.
- يُحمَّل **بعد** Core ويتسجل عبر آلية تسجيل رسمية (مستقبلي: `BUI.register(...)`) دون تعديل Core.
- يلتزم بنفس معايير [COMPONENT_DEVELOPMENT.md](COMPONENT_DEVELOPMENT.md).
- يوثق في قسم Installation & Include الملفات المطلوبة وترتيبها.
- إن كان له نصوص، تُضاف مفاتيحه لجميع ملفات i18n.
- قرار جعل Component Extension يُسجل في [COMPONENTS_REGISTRY.md](COMPONENTS_REGISTRY.md) مع السبب.

### قرار Task 13: Dialog وDrawer في الـ Core لا Extension
حجم Dialog وDrawer معاً نحو 21KB خام JS و12KB خام CSS، أي يتجاوز حد 15KB (الشرط 1)، لكن الشرط 2 لا يتحقق: النوافذ المنبثقة مما يحتاجه معظم المواقع، و[CORE_ASSETS.md](CORE_ASSETS.md) نفسه يضع Modals ضمن الـ Core وModal Manager ضمن `baset-ui.js`. المطلوب شرطان على الأقل للجعل Extension، فيبقيان في الـ Core. Overlay Manager يُعرَّف قبل `window.BUI = BUI` (بنية تحتية)، والمكونان يُسجلان بعده كـ `avatar` و`progress`.

### قرار Task 15: Alert وToast في الـ Core لا Extension
الإضافة نحو 28.6KB خام JS (6.3KB gzip) و10.8KB خام CSS (1.7KB gzip) (`baset-ui.js` 114,415 بايت و`baset-ui.css` 257,517 بعد Task 15)، أي يتجاوز حد 15KB (الشرط 1). لكن: (1) هذا الملف نفسه يعدّ Toast Manager وAlerts من مسؤوليات الـ Core صراحة؛ (2) الشرط 2 غير متحقق، فالإشعارات مما تحتاجه معظم التطبيقات؛ (3) Toast يحتاج خطافاً داخل Overlay Manager (الـ Core لا يعرف أسماء الـ Extensions). المطلوب شرطان على الأقل للجعل Extension، فيبقيان في الـ Core. **ملاحظة:** الملف يُسلَّم غير مضغوط وفيه تعليقات كثيرة، وتقليله بالتصغير يحتاج موافقة على أداة (انظر RELEASE_AND_VERSIONING.md).

### قرار Task 16: Positioning Engine وPopover وMenu في الـ Core لا Extension
الإضافة نحو 46KB خام JS (10KB gzip) و12KB خام CSS (2.8KB gzip) (`baset-ui.js` 160,514 بايت و`baset-ui.css` 269,887 بعد Task 16)، أي يتجاوز حد 15KB (الشرط 1). لكن الشرط 2 غير متحقق: القوائم المنسدلة والنوافذ العائمة مما تحتاجه معظم المواقع، والمحرك بنية تحتية ستعتمد عليها Select (Task 17) وDate Picker وTooltip، والـ Core لا يعرف أسماء الـ Extensions فلا يمكن أن يكون المحرك في Extension تحمّله Select. المطلوب شرطان على الأقل للجعل Extension، فتبقى في الـ Core. ملاحظة: الملف يُسلَّم غير مضغوط وبتعليقات كثيرة (التصغير يحتاج موافقة على أداة).

### قرار Task 17: Select في الـ Core لا Extension
الإضافة 65,011 بايت JS (12,496 gzip) و17,038 بايت CSS (2,508 gzip) (`baset-ui.js` 225,525 بايت و`baset-ui.css` 286,925 بعد Task 17)، أي تتجاوز حد 15KB (الشرط 1). لكن الشرط 2 غير متحقق: القوائم المنسدلة مما تحتاجه معظم النماذج. وأهم من ذلك: المكون يعتمد على الطبقة العائمة الداخلية `floatingController` (التركيز والإغلاق بالنقر خارجاً وEsc والنقل إلى الـ Dialog المفتوح ونسخ الوضع والاتجاه)، وهي غير مُصدَّرة، والـ Core لا يعرف الـ Extensions، فإخراج Select إلى Extension يتطلب تصدير تلك الطبقة (قرار معماري لم يُطلب). المطلوب شرطان على الأقل للجعل Extension، فيبقى في الـ Core. **تنبيه للمهمة 20 (Date Picker):** إن بُني كـ Extension (`baset-ui-datetime.*` المقترح) فقوائمه ستظهر inert داخل Dialog ما لم تُصدَّر الطبقة العائمة؛ يلزم قرار قبل تلك المهمة. الملف يُسلَّم غير مضغوط (التصغير يحتاج موافقة على أداة).
