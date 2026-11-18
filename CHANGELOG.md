# Changelog

يتبع صيغة [Keep a Changelog](https://keepachangelog.com) و[SemVer](https://semver.org).

## [Unreleased]

### Added (Task 06: Theme Manager + Locale Manager)
- `assets/js/baset-ui.js` (52,004 بايت خام، 12,143 gzip، +18,376 عن Task 05): `BUI.theme` (`set`, `setMode`, `toggleMode`, `get`, `getMode`, `load`) و`BUI.locale` (`use`, `t`, `get`, `getDirection`, `register`, `apply`). الأحداث `bui:theme:change` و`bui:locale:change`. ما زال الـ Global الوحيد `BUI`.
- `assets/css/themes/ocean.css` (5,405 بايت): ثيم Light وDark يعيد تعريف الألوان والخط والـ Radius والظلال وعرض الحد السميك وسماكة Focus دون لمس Core. تباين 40/40 في Light وDark.
- `assets/i18n/fr.json` بنفس مفاتيح `en` و`ar`. مفاتيح جديدة لكل اللغات: `common.showing` و`common.items` (جمع).
- `tests/i18n-keys.js`: اختبار تطابق المفاتيح والمتغيرات والبنية بلا Dependencies.
- صفحات التوثيق: Themes وDark Mode (`documentation/customization/`)، RTL & LTR وInternationalization (`documentation/advanced/`)، مفعلة في `nav.js`.
- Navbar التوثيق: مبدّل ثيم (Default/Ocean) ومبدّل RTL/LTR، وزر الوضع مربوط بـ `BUI.theme`.

### Changed (Task 06)
- كل صفحات التوثيق و`index.html` وقالب الصفحة: Snippet `<head>` بمفتاحي `bui-theme` و`bui-mode` (بدل `bui-docs-mode`) ورابط `ocean.css`. أُزيل `bui-docs-mode`، فتفضيل الوضع المحفوظ سابقاً في المتصفحات لن يُقرأ مرة واحدة.
- `docs.js`: القيم الحية والتباين تتبع ثيم الصفحة وتُحدَّث عند تغيره، مع `data-docs-theme` اختيارياً. زر الوضع في Navbar تسميته ثابتة (`Dark mode`) مع `aria-pressed`، بدل تبديل النص. في العرض الضيق (أقل من 576px) يُخفى مربع البحث (معطل أصلاً) وتختصر الأزرار لتتسع عند 320px.
- `docs.css`: أصناف `bui-docs-select` و`bui-docs-input` و`bui-docs-demo-fill`، وإعادة ترتيب Navbar للعرض الضيق.
- التعليمات: `INTERNATIONALIZATION.md`, `RTL_LTR_AND_THEMES.md`, `JAVASCRIPT_API.md`, `CORE_ASSETS.md`, `ARCHITECTURE.md`, `TESTING.md`, `COMPONENT_DOCUMENTATION.md`, `COMPONENTS_REGISTRY.md`, `PROJECT_OVERVIEW.md`، وقالب `templates/DOC_PAGE_TEMPLATE.html`، و`README.md` (سطر الحالة).
- حذف `.gitkeep` من `assets/css/themes/` و`documentation/advanced/` (لم يعودا فارغين).

### Decisions (Task 06)
- ترتيب تحديد الوضع: المحفوظ ثم `prefers-color-scheme` ثم `data-bui-mode` في الـ HTML. تفضيل النظام يتفوق على سمة الـ HTML، وإلا لما احترم نظام لقوالب تكتب `light` دائماً.
- اختيار الوضع صراحة يوقف تتبع النظام حتى لو فشل الحفظ. `set()` لا يتحقق من وجود ملف الثيم. `load()` لا يفعّل الثيم.
- جمع الترجمة: كائن بفئات CLDR مع `other` إلزامي؛ اختبار التطابق يعامله كمفتاح واحد (لأن العربية ست فئات والإنجليزية اثنتان) ويقارن أسماء المتغيرات.
- `use()` يضبط `lang` و`dir` دائماً، ويطلق `bui:locale:change` عند تغير الرمز فقط. آخر استدعاء `use()` هو الذي يُطبَّق. فشل `fallback` تحذير؛ فشل اللغة الرئيسية رفض للوعد دون تغيير.
- `url` الافتراضي `../i18n/{code}.json` نسبةً إلى `baset-ui.js`. خيار `fallbackUrl` أُضيف لأن الـ Fallback يحتاج مساره. `BUI.locale.apply(root)` أُضيف لعناصر تُضاف بعد التحميل. لا خيار `locale` في `BUI.config`.
- HTML Binding: `data-bui-i18n-attr` يقبل أزواجاً `attr:key` تفصلها `;`، وسمات `on*` مرفوضة.
- مبدّل اتجاه التوثيق يضبط `<html dir>` ويحفظه بـ `bui-docs-dir` (docs فقط). لا حدث لتغيير `dir` مباشرة.
- ocean: خطوط نظام فقط (لا خطوط خارجية)، ولا يعيد تعريف success/warning/danger/info.

### Tested (Task 06, Chromium عبر Playwright فقط، خادم http محلي)
- `node tests/i18n-keys.js`: ناجح (3 ملفات، 8 مفاتيح)، وفشل مقصود في نسخة معدلة (مفتاح ناقص، متغير مختلف، مفتاح غير camelCase). `node --check` ناجح للـ JS.
- 26 فحصاً للثيم والتخزين: تبديل الثيم والوضع دون إعادة تحميل، الأحداث وتفاصيلها، الحفظ والاسترجاع بعد إعادة التحميل، `load()`، `localStorage` محجوبة (`get` يرمي) و`setItem` يرمي: بلا أخطاء، `prefers-color-scheme` (بدء، تتبع حي، التوقف بعد اختيار صريح، المحفوظ يتفوق).
- 18 فحصاً للغة: ar/fr/en بالواجهة (lang وdir وBinding والمتغيرات والجمع العربي لست فئات والفرنسي)، انقلاب الـ Shell (الـ Sidebar يمين)، مفتاح مفقود (يرجع المفتاح ويحذر مرة)، `register`، سباق `use()`، `fallback:false`، `apply`، رفض `on*`، وفشل `file://` برسالة واضحة.
- Snippet منع الوميض: السمات والأنماط مطبقة قبل تحميل Core المؤخر 1.5 ثانية. Keyboard: Tab/Enter/Space/الأسهم على عناصر Navbar الجديدة.
- 648 تركيبة (9 صفحات x 9 عروض 320-1920 x ثيمين x وضعين x اتجاهين): بلا Overflow أفقي ولا أخطاء Console ولا 404. تباين 40 ثنائية: Default وOcean، Light وDark: 40/40. `tests/manual/core.html`: 43/43 (http وfile، autoInit تشغيل وإيقاف). مقطع "استبدال Default" في صفحة Themes اختُبر فعلاً في Light وDark.
- لم يُختبر: Safari/Firefox، أجهزة اللمس، قارئات الشاشة، Forced Colors، تأثير الثيم أو اللغة على مكونات (لا مكون منفذ)، `file://` للتحميل (غير مدعوم عمداً).

### Added (Task 05: Core JavaScript)
- `assets/js/baset-ui.js`: نواة `BUI` (33,628 بايت خام، 7,806 gzip): `version`, `config`, `register`, `init`, `getInstance`, `destroy`, `destroyAll`, `on/off/emit`, `trigger`, `options` (Parser)، `dom`, `utils`, `log`، وObserver اختياري. Global واحد فقط: `BUI`.
- `tests/manual/core.html`: 43 فحصاً ذاتي التشغيل (مكونات تجريبية داخل الصفحة فقط)، يدعم `?autoinit=0`.
- صفحات التوثيق: `documentation/javascript/` (introduction, initialization, events, api-reference) مفعلة في `nav.js`.
- `CORE_ASSETS.md`: قسم آلية تسجيل Extensions.

### Changed (Task 05)
- `JAVASCRIPT_API.md` أُعيد كتابته: الواجهة المنفذة مفصلة، وما بقي "مستقبلي" محدد صراحة.
- `COMPONENT_DEVELOPMENT.md` (وسما `BUI.init()` وgetInstance لم يعودا مستقبليين)، `ARCHITECTURE.md` (tests/manual وصفحات JavaScript)، `TESTING.md` (سطر الحالة)، `COMPONENTS_REGISTRY.md`، `README.md` و`PROJECT_OVERVIEW.md` (سطر الحالة فقط).

### Decisions (Task 05)
- اسم المكون kebab-case عند `register`؛ Factory بـ camelCase (`BUI.datePicker`)؛ السمة `data-bui-<name>`؛ قيمة السمة تختار الـ Variant.
- أسماء أحداث DOM kebab-case (`before-open`). `BUI.trigger` يرجع `false` عند الإلغاء أو عند وسيط غير صالح.
- `create()` يجب أن يرجع نسخة بها `destroy()`، والـ Core يغلّفه ليزيل النسخة من السجل. أنواع الخيارات تُستنتج من القيم الافتراضية.
- `BUI.config` يقبل `autoInit` و`observe` و`logLevel` فقط؛ مفتاح غير معروف يُرفض بتحذير (الأنظمة اللاحقة تضيف مفاتيحها بنفسها).
- `WeakMap` للنسخ و`WeakRef` لتمكين `destroyAll()` دون مراجع قوية.
- الـ Observer يهيئ فقط ولا يهدم عند الإزالة (قد يعاد إدراج العنصر).

### Fixed (Task 05)
- أثناء الاختبار: حارس التلوث بـ `__proto__` في `deepMerge` كان يقارن `FORBIDDEN_KEYS[key] === 1` فيُرجع `Object.prototype` للمفتاح `__proto__` ولا يحجبه (تلويث فعلي). استُبدل بمقارنة مباشرة بالمفاتيح، وأُضيف اختبار لذلك.

### Tested (Task 05, Chromium 153 عبر Playwright فقط)
- `tests/manual/core.html`: 43/43 ناجح (autoInit تشغيل وإيقاف)، وعبر `file://`، ومع إعادة التشغيل بـ RTL وDark. صفحة بيضاء بالمكتبة فقط: Global جديد واحد هو `BUI`. `node --check` ناجح.
- 8 صفحات (4 جديدة و4 سابقة) x LTR/RTL x Light/Dark x 8 عروض (320-1920): بلا Overflow أفقي ولا أخطاء Console ولا 404.
- لم يُختبر: Safari/Firefox، أجهزة اللمس، قارئات الشاشة، Component حقيقي فوق الـ Core.

### Added (Task 04: Utilities)
- `baset-ui.css`: Display (`bui-d-{none,block,inline,inline-block,flex,inline-flex,grid}` + نسخ لكل Breakpoint)، Position (النوع بنسخ Breakpoint، Offsets منطقية `top/bottom/start/end` بقيم 0/50/100، translate-middle وx وy، Z-index من Tokens)، Overflow (كل المحاور + نسخ Breakpoint، `bui-text-truncate`، `bui-line-clamp-1..5`)، Visibility (`visible`, `invisible`, `visually-hidden`, `visually-hidden-focusable`)، Borders (عرض/نمط/لون من Tokens، جوانب منطقية t/b/s/e وإزالتها، Radius بالمقياس مع زوايا منطقية ss/se/es/ee، Shadows).
- حجم `baset-ui.css`: 140,405 بايت خام (+24,308 عن Task 03)، 14,419 بايت gzip. مولَّد بسكريبت لمرة واحدة غير مُسلَّم، كل قاعدة تُصرَّح مرة واحدة.
- صفحات التوثيق: `documentation/utilities/` (display, position, overflow, visibility, borders) مفعلة في `nav.js`.

### Changed (Task 04)
- `COMPONENTS_REGISTRY.md` (Utilities: Documented، وصفحات Utilities الخمس) و`CORE_ASSETS.md` و`PROJECT_OVERVIEW.md` و`RTL_LTR_AND_THEMES.md`: تحديث الحالة والملاحظات.

### Decisions (Task 04)
- كل أدوات Task 04 بـ `!important` (الاستثناء المسموح) وموثق في كل صفحة.
- `bui-flex` و`bui-inline-flex` (Task 03) أُبقيا للتوافق، و`bui-d-flex` و`bui-d-inline-flex` هما الشكل ذو النسخ المتجاوبة.
- translate-middle يقلب الإزاحة الأفقية في RTL بـ `:dir(rtl)`؛ يتطلب متصفحاً حديثاً.
- عرض/نمط الحد كخصائص `--bui-util-border-*` معرّفة بـ `@property` (`inherits:false`) كي لا تتسرب من أب إلى أبناء.
- الـ Borders والـ Visibility والـ z-index والـ Offsets وtruncate/line-clamp بلا نسخ Breakpoint لأنها لا تغيّر البنية، وأضيف ذلك للتوثيق.
- أمثلة صفحات Utilities الخمس تستخدم أدوات المكتبة نفسها فقط (`bui-border` و`bui-border-primary` و`bui-rounded-sm` و`bui-p-2` وغيرها) بلا أي صنف `bui-docs-demo-*`، فيكون الكود المنسوخ نظيفاً. لا توجد أدوات للخلفية ولا لمحاذاة النص ولا للأبعاد، لذا تُستخدم Styles مضمنة (`grid-template-columns`, `height`, `width`) حين يلزم، بدل تعديل `docs.css`.
- صفحات Layout وCustomization من Task 03 لم تُعدَّل وما زالت تستخدم `bui-docs-demo-*`.

### Tested (Task 04, Chromium 153 عبر Playwright فقط)
- 5 صفحات x LTR/RTL x Light/Dark x 8 عروض (320/480/576/768/992/1200/1600/1920): بلا Overflow أفقي، بلا أخطاء/تحذيرات Console، بلا 404. 14 صفحة في المشروع تعمل بلا أخطاء (تراجع).
- Computed Style: Display المتجاوب، جوانب Border وزواياه منطقياً في LTR/RTL، عدم تسرب العرض/النمط، translate-middle بالاتجاهين، line-clamp، Visually-hidden (التركيز بـ Tab يُظهره)، Z-index.
- لم يُختبر: قارئ شاشة، Safari/Firefox، Forced Colors، أجهزة لمس، Print.

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
