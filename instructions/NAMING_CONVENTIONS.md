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
