# مسؤوليات ملفات Core

## `assets/css/baset-ui.css`
**المسؤولية (إلزامي):** كل ما هو مشترك للمكتبة:
- CSS Variables (Colors, Typography, Spacing, Borders, Shadows, Radius) و Theme Variables.
- Base/Reset الخفيف.
- Layout: Containers, Grid, Flex Utilities, Responsive Utilities.
- المكونات الأساسية الصغيرة والمشتركة (Buttons, Forms, Modals, Alerts, Toasts, Cards...).

**الحالة الحالية (Task 03):** Tokens كاملة (Light/Dark)، Base، Layout (Container/Grid)، Utilities (Flexbox وSpacing)، وكل نسخ الـ Breakpoints. لا Components.

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
**المسؤولية (إلزامي):** Core Initialization، Global Config، Theme Manager، Locale Manager، Toast Manager، Modal Manager، Shared Utilities، DOM Helpers، Component Initialization، Event Management.

**الحالة الحالية:** ملف تعليقات فقط، لا تنفيذ. (مستقبلي: كل ما سبق.)

قواعد: IIFE أو UMD بدون Modules كشرط، يعرّض `window.BUI` فقط، لا متغيرات Global أخرى. التفاصيل في [JAVASCRIPT_API.md](JAVASCRIPT_API.md).

## متى يصبح Component Extension مستقلاً؟
يكون Extension إذا تحقق **شرطان على الأقل** من التالية:
1. حجم CSS+JS المتوقع يتجاوز **15KB** غير مضغوطة (اقتراح للحد، يُراجع).
2. لا يحتاجه معظم المستخدمين في معظم الصفحات.
3. يعتمد على منطق ثقيل (حسابات، رسم Canvas/SVG، بيانات كبيرة).
4. يحتاج ملفات إضافية خاصة به (خطوط، بيانات، Workers).

أمثلة مرشحة (مستقبلي): Charts, DataTable, Calendar, Rich Text Editor, Maps.

### قواعد الـ Extension
- ملفاته: `assets/css/extensions/baset-ui-{name}.css` و`assets/js/extensions/baset-ui-{name}.js`.
- يُحمَّل **بعد** Core ويتسجل عبر آلية تسجيل رسمية (مستقبلي: `BUI.register(...)`) دون تعديل Core.
- يلتزم بنفس معايير [COMPONENT_DEVELOPMENT.md](COMPONENT_DEVELOPMENT.md).
- يوثق في قسم Installation & Include الملفات المطلوبة وترتيبها.
- إن كان له نصوص، تُضاف مفاتيحه لجميع ملفات i18n.
- قرار جعل Component Extension يُسجل في [COMPONENTS_REGISTRY.md](COMPONENTS_REGISTRY.md) مع السبب.
