# قواعد التسمية

## البادئة
كل شيء عام في المكتبة يبدأ بـ `bui-` (أو `BUI` في JavaScript).

| العنصر | القاعدة | مثال |
|---|---|---|
| CSS Class (Block) | `bui-{component}` | `.bui-btn` |
| CSS Element | `bui-{component}__{element}` | `.bui-modal__header` |
| CSS Modifier | `bui-{component}--{modifier}` | `.bui-btn--primary` |
| CSS State | `is-{state}` / `has-{state}` مع ربطها بالمكون | `.bui-modal.is-open` |
| CSS Variable | `--bui-{category}-{name}` (وللمكون: `--bui-{component}-{prop}`) | `--bui-color-primary`، `--bui-btn-padding-x` |
| HTML Attribute | `data-bui-{name}` | `data-bui-select`, `data-bui-theme` |
| Option Attribute | `data-bui-{option-kebab}` | `data-bui-per-page` |
| Events (DOM) | `bui:{component}:{event}` | `bui:modal:open` |
| JS Namespace | `BUI` | `BUI.toast.show()` |
| JS Method/Option | camelCase | `perPage`, `noResults` |
| JS Class داخلية | PascalCase | `ModalController` |
| Icon Class | `bui-icon-{weight}` + `bui-icon-{name}` | [ICONS_SYSTEM.md](ICONS_SYSTEM.md) |
| مفاتيح i18n | `section.camelCaseKey` | `common.noResults` |

## أسماء الأصناف المختصرة (قرار Task 09)
الأصناف والـ Tokens تستخدم اسماً مختصراً على نمط Bootstrap، مع إبقاء البادئة `bui-` دائماً.
- **القاعدة:** الاسم المختصر مأخوذ من الجدول أدناه فقط. أي مكون جديد له اختصار يُقترح في مهمته ويُوافق عليه قبل التنفيذ ثم يضاف للجدول، ولا يُخترع اختصار داخل الكود. مكون لا يوجد له اختصار معتمد يبقى باسمه الكامل.
- الاختصار يسري على الصنف و`--bui-{اختصار}-*` للـ Tokens والـ `@keyframes` والـ Modifiers (`bui-btn--outline`). أما أسماء الملفات والصفحات والـ Playground Schema والنصوص فتبقى بالاسم الكامل (`button.html`، Schema `button`).
- لا Aliases بالأسماء الطويلة القديمة.

| المكون | الصنف | Tokens | الحالة |
|---|---|---|---|
| Button | `bui-btn` | `--bui-btn-*` | معتمد (Task 09) |
| Button Group | `bui-btn-group` | `--bui-btn-group-*` (خاصة فقط) | معتمد (Task 09) |
| Close Button | `bui-btn-close` | `--bui-btn-close-*` | معتمد (Task 09) |

Card وList Group (Task 11) بلا اختصار معتمد، فتبقى بأسمائها الكاملة: `bui-card` و`bui-list-group`، وTokens `--bui-card-*` و`--bui-list-group-*`. العناصر: `bui-card__header/__body/__footer/__title/__subtitle/__text/__media/__stretched-link`، و`bui-list-group__item`. التخطيط الأفقي بتعديل على المكون نفسه: `bui-card--horizontal[-sm|-md|-lg]` و`bui-list-group--horizontal[-sm|-md|-lg]` (الاسم بلا لاحقة = صف دائماً، ومع Breakpoint = صف من هذا العرض).

Badge وAvatar وProgress (Task 10) بلا اختصار معتمد، فتبقى بأسمائها الكاملة: `bui-badge` و`bui-avatar` و`bui-progress`، وTokens `--bui-badge-*` و`--bui-avatar-*` و`--bui-progress-*`. العناصر الفرعية بـ BEM: `bui-avatar__img` و`__text` و`__status`، و`bui-progress__bar` و`__label`. المجموعات المستقلة: `bui-avatar-group` و`bui-progress-stack` (حاوية) و`bui-progress-label` (صف تسمية خارجية) و`bui-badge-anchor` (مضيف الشارة العائمة).

Form Controls وInput وCheckbox وRadio وSwitch (Task 12) بلا اختصار معتمد، فتبقى بأسمائها الكاملة: `bui-form-group` و`bui-form-label` و`bui-form-text` و`bui-form-fieldset` و`bui-form-legend` (وModifiers `--required` و`--error` و`--success` و`--horizontal[-sm|-md|-lg]`)، و`bui-input` و`bui-input-group` (`__text`)، و`bui-checkbox` و`bui-radio` و`bui-switch` (`__input` و`__label`، وModifiers `--sm|--md|--lg` و`--inline`)، و`bui-password-toggle__show|__hide` لأيقونتي المساعد. Tokens `--bui-form-*` و`--bui-input-*` و`--bui-check-*` (مشتركة بين Checkbox وRadio وSwitch) و`--bui-switch-*`. فئات الحالة `is-valid` و`is-invalid` على العنصر الأصلي.

Dialog وDrawer (Task 13) بلا اختصار معتمد، فتبقى بأسمائها الكاملة: `bui-dialog` و`bui-drawer`. **الاسم الرسمي للمكون في JavaScript هو `BUI.dialog`** (يطابق قسم الـ Sidebar)، و`BUI.modal` اسم مستعار موثق للدالة نفسها (`BUI.modal === BUI.dialog`)؛ السمة `data-bui-dialog` والأحداث `bui:dialog:*` و`BUI.getInstance(el, 'dialog')` تستعمل الاسم الرسمي فقط، ولا يوجد صنف `bui-modal`. العناصر: `bui-dialog__panel/__header/__title/__body/__footer/__status` ومثلها `bui-drawer__*`. التعديلات: `bui-dialog--sm|md|lg|xl|centered|scrollable|fullscreen|fullscreen-until-{sm|md|lg|xl}` و`bui-drawer--start|end|top|bottom|sm|md|lg|xl|no-backdrop`. **قرار تسمية:** اللاحقة `-until-{bp}` تعني "ملء الشاشة تحت هذا الـ Breakpoint" (Mobile First: الحالة الأساسية ملء الشاشة وتنهيها `min-width`)، وهي مختلفة عن لاحقة `--horizontal-{bp}` (التي تعني "من هذا العرض")، لذلك اختير اسم صريح بدل إعادة استعمال اللاحقة المجردة. Tokens `--bui-overlay-*` (السطح والـ Scrim والحركة، **مشتركة** بين Dialog وDrawer على سابقة `--bui-check-*`) و`--bui-dialog-*` (`radius` و`margin` و`offset` و`width-*`) و`--bui-drawer-size-*`. الحالات `is-closing` و`is-static-bump` تضعها السكربتات (لا سمة قياسية لها). `--bui-scroll-lock-gap` خاصية يضعها Overlay Manager على `<html>` أثناء القفل (عرض شريط التمرير) وليست Token للتخصيص. **أحداث Task 13:** `beforeopen` و`beforeclose` بلا شرطة، قرار بدل `before-open` الوارد في [JAVASCRIPT_API.md](JAVASCRIPT_API.md)، لأن نص المهمة سمّاها هكذا صراحة (وأولوية المهمة الصريحة حسب README) وتطابق أسماء المنصة (`beforetoggle`)؛ الأسماء بحروف صغيرة فتجتاز قاعدة kebab-case الآلية. المعالج الموحد للفتح: `data-bui-dialog-open="#id"` و`data-bui-drawer-open="#id"`، والإغلاق `data-bui-dismiss`.

## قيم خاصة وحالات (Task 09)
- **Token خاص (داخلي):** اسم يحتوي `_` بعد اسم المكون: `--bui-btn-_bg`. ليس API ولا يوثق كخيار ولا يعدله المستخدم أو الثيم.
- **حجم:** `--bui-{component}-{prop}-{sm|md|lg}`. **لمس:** `--bui-{component}-touch-{prop}-{sm|md|lg}`.
- **حالة:** السمة القياسية هي الحالة حين توجد (`disabled`, `aria-disabled="true"`, `aria-busy="true"`)، وفئة `is-{state}` لغيرها (مثال Task 10: `is-fallback` على Avatar، لأن فشل تحميل الصورة لا سمة قياسية له).
- **Modifier افتراضي** له اسم صريح اختياري (`bui-btn--solid`).
- **Keyframes:** `bui-{component}-{name}` (`bui-btn-spin`).

## الملفات
- ملفات CSS/JS/HTML/JSON: `kebab-case` بحروف صغيرة (`date-picker.js`).
- ملفات الـ Extensions: `baset-ui-{name}.css|js` (مثال `baset-ui-datatable.js`).
- ملفات Themes: `{theme-name}.css` داخل `assets/css/themes/`.
- ملفات الترجمة: رمز اللغة `ar.json` (BCP 47 مبسط: `en`, `ar`, `fr`, `pt-br`).
- ملفات التعليمات: `UPPER_SNAKE_CASE.md`.
- صفحات التوثيق: `documentation/components/{component}.html`.

## ممنوعات
- `BasetUI.*` أو أي Namespace غير `BUI`.
- Classes بدون بادئة في ملفات المكتبة.
- استخدام `id` في الـ Selectors داخل CSS المكتبة.
- Classes تصف اللون أو الموقع الفيزيائي بدل المعنى حيث توجد بدائل منطقية (استخدم `start/end` بدل `left/right`، راجع [RTL_LTR_AND_THEMES.md](RTL_LTR_AND_THEMES.md)).

## استثناء موثق
واجهة موقع التوثيق تستخدم البادئة `bui-docs-*` وهي خاصة بالموقع وليست API للمكتبة.

Alert وToast (Task 15) بلا اختصار معتمد، فتبقى بأسمائها الكاملة: `bui-alert` (وModifiers الألوان `--primary|secondary|success|warning|danger|info`) وعناصره `bui-alert__icon/__content/__title/__description/__actions/__close`، و`bui-toast` (يُستعمل مع `bui-alert` على العنصر نفسه)، و`bui-toast-region` (الحاوية) و`bui-toast-stack` مع `bui-toast-stack--{top|bottom}-{start|center|end}`. Tokens `--bui-alert-*` و`--bui-toast-*`. الحالات `is-closing` (Alert وToast) و`is-relocating` (حاوية Toast أثناء انتقالها) تضعها السكربتات. الأحداث بلا شرطة كما في Dialog: `bui:alert:beforeclose|close` و`bui:toast:show|hide`. **قيمة `data-bui-dismiss` تحدد صاحب الإغلاق:** فارغة للطبقات (Dialog وDrawer، أو باسم نوعها)، و`alert` لـ Alert؛ مكون جديد يضيف قيمته الخاصة ولا يستعمل الفارغة. الأيقونات في toast أسماء kebab-case من مجموعة الأيقونات (خيار `icon`)، والنوع `error` اسم بديل لـ `danger` في `BUI.toast` فقط (لا صنف `bui-alert--error`).
