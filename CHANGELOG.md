# Changelog

يتبع صيغة [Keep a Changelog](https://keepachangelog.com) و[SemVer](https://semver.org).

## [Unreleased]

### Added (Task 03: Design Tokens + Layout)
- `baset-ui.css`: Tokens كاملة (Neutral Scale، 6 ألوان Semantic x 6 أشكال، Aliases، Typography، Spacing 0-6، Borders، Radius، Shadows، Motion، Z-index، Focus Ring، Breakpoints، Container) بوضعي Light وDark.
- `baset-ui.css`: Layout (`bui-container`, `bui-container-fluid`, Grid 12 عمود مع Gutters وOffset وOrder وRow Cols) وUtilities (Flexbox وSpacing بـ Logical Properties) بنسخ متجاوبة لكل Breakpoint.
- حجم `baset-ui.css`: 116,097 بايت خام (12,140 بايت gzip)، مولَّد بسكريبت لمرة واحدة غير مُسلَّم، بلا تكرار قواعد (كل قاعدة تُصرَّح مرة واحدة).
- صفحات التوثيق: `layout/` (breakpoints, container, grid, flexbox, spacing) و`customization/` (colors, typography, css-variables)، مفعلة في `nav.js`.
- `docs.js`: خلايا قيم Tokens حية، جدول تباين WCAG محسوب حياً، مؤشر Breakpoint الحالي. `docs.css`: عناصر العرض التوضيحي (`bui-docs-*`).

### Changed (Task 03)
- `baset-ui.css`: محددات Tokens صارت `[data-bui-mode]` و`[data-bui-theme]` بدل `:root` فقط (تعمل على أي عنصر). أسماء الـ Tokens القديمة لم تتغير (`--bui-color-primary`, `--bui-space-1..5`, `--bui-radius-md`, `--bui-shadow-sm`, ...).
- `RTL_LTR_AND_THEMES.md` و`CORE_ASSETS.md` و`COMPONENT_DOCUMENTATION.md` و`README.md` و`PROJECT_OVERVIEW.md`: تحديث الحالة والمحددات والاستثناء الموثق (انظر Decisions).

### Decisions (Task 03)
- ثلاث طبقات Tokens: Raw حسب الوضع، Static على `:root`، وAliases/Component تُعاد تعريفها على كل Scope بـ `var()` فقط (القاعدة في صفحة CSS Variables وفي `RTL_LTR_AND_THEMES.md`). السبب: قيمة `var()` تُحسب عند التصريح، فبدون إعادة التصريح يبقى Alias موروثاً بقيمة الصفحة.
- Utilities (Flex وSpacing) تستخدم `!important` لأن قسم Utilities يسبق قسم Components بالترتيب الإلزامي. Grid/Container بدون `!important`.
- كل نسخ الـ Breakpoints (Layout وUtilities) في القسم 7 مرتبة تصاعدياً.
- `bui-flex` و`bui-inline-flex` أُضيفا لأن بقية أدوات Flex تحتاج Flex Container، ولا يُعدّان بديلاً عن Display Utilities (Task 04).
- Gutter Classes من 0 إلى 5 فقط وبدون نسخ متجاوبة، لتفادي Overflow أفقي (القاعدة: Gutter <= ضعف `--bui-container-padding-x`).
- لا Web Fonts (لا Dependencies): Fallback عربي بخطوط النظام.
- صفحات Layout وCustomization معفاة من الأقسام الثمانية (ليست Components)، موثق في `COMPONENT_DOCUMENTATION.md`.
- الأرقام في جداول التوثيق (قيم Tokens ونسب التباين) لا تُكتب يدوياً: تُقرأ من CSS عند التحميل.

### Added (Task 02: Docs Page Template)
- `instructions/templates/DOC_PAGE_TEMPLATE.html`: قالب صفحة توثيق (هيكل Component بالأقسام الثمانية وAnchors ثابتة).
- `docs.js`: بناء Navbar/Sidebar/Footer حول `<main>`، Breadcrumb، فهرس "On this page" مع Scroll Spy، Previous/Next من `nav.js`، Example Block، Code Block مع Copy وتلوين ذاتي، تغليف الجداول، ومناطق التمرير القابلة للتركيز.
- `docs.css`: تنسيق عناصر الصفحة (`bui-docs-*`) بمنطق Mobile First وLogical Properties.
- مجلدات `documentation/javascript/`, `accessibility/`, `advanced/`, `development/` (مع `.gitkeep`).
- `COMPONENT_DOCUMENTATION.md`: عقد عناصر الصفحة وإجراء إضافة صفحة محدث. `nav.js`: توثيق الصيغة في الرأس (لا تغيير في البيانات).

### Changed (Task 02)
- `ARCHITECTURE.md`: مكان كل قسم من الـ Sidebar في المجلدات، وقرار المسارات (`data-root`).
- `docs.css`: `overflow-x: hidden` على `html, body` استُبدل بـ `clip`، وقاعدة `max-width` لزر GitHub حُوّلت إلى Mobile First.

### Fixed (Task 02)
- Navbar والـ Sidebar لم يكونا يثبتان عند التمرير (`position: sticky` معطل لأن `overflow-x: hidden` على `html` و`body` يجعل `body` حاوية تمرير). أُصلح بـ `overflow-x: clip`.

### Decisions (Task 02)
- `data-root` على `<html>` هو مصدر الجذر للصفحات المتداخلة، مع استنتاج بديل من مسار `docs.js`؛ لا مسارات مطلقة بسبب `/Baset-UI/` وfile://. السبب في `ARCHITECTURE.md`.
- Forms وData Display داخل `documentation/components/`؛ أي صفحة بعمق مجلدين وقيمة `data-root` لها `../../`.
- كود الـ Example يُولَّد من المعاينة الحية نفسها لضمان تطابقه مع ما يعمل.
- `index.html` لم يُعدَّل (Shell ثابت من Task 01 يعمل كما هو).

### Added
- Task 01 (Foundation): إعادة تأسيس المشروع من الصفر.
- هيكل المستودع (`assets/`, `documentation/`, `instructions/`, `tests/`, `examples/`).
- مجلد `instructions/` بـ 20 ملفاً و3 قوالب.
- `assets/css/baset-ui.css`: Design Tokens افتراضية (Light/Dark) وBase فقط.
- `assets/js/baset-ui.js`: ملف تعليمات فقط بلا تنفيذ.
- `assets/i18n/en.json` و`ar.json`: الهيكل ومفاتيح `common` الأولية فقط.
- واجهة التوثيق: Navbar، Sidebar (قابل للطي، Mobile)، Footer، منطقة محتوى فارغة.
- `LICENSE` (MIT، مبدئي) و`.nojekyll` و`.gitignore`.

### Changed
- روابط GitHub تشير إلى المستودع الرسمي وموقع Pages الرسمي.
- إضافة مرحلة التسليم (Preview + ZIP) إلى سير العمل وقواعد الـ AI.

### Decisions
- Sidebar يُرسم من `documentation/assets/js/nav.js` لسهولة إضافة الروابط.
- لا أيقونات في Shell التوثيق الحالي (رسم CSS) لأن نظام الأيقونات غير منفذ بعد.
