# Changelog

يتبع صيغة [Keep a Changelog](https://keepachangelog.com) و[SemVer](https://semver.org).

## [Unreleased]

### Added (Task 09: Button + Button Group + Close Button)
- `assets/css/baset-ui.css` (161,098 بايت خام و19,109 gzip، كان 140,405 و15,024): قسم 6 (Components) فيه ثلاثة مكونات CSS فقط، وComponent Tokens في الطبقة 3 (`--bui-btn-*` و`--bui-btn-close-*`).
- **Button:** 4 Variants (solid وoutline وghost وlink) x 6 ألوان دلالية x 3 أحجام (`sm`/`md`/`lg`)، `bui-btn--block` للعرض الكامل و`bui-btn--icon` لزر الأيقونة فقط، حالات hover وfocus-visible وactive وdisabled وloading. يعمل على `button` و`a` و`input type="button"`. Loading عبر `aria-busy="true"`: Spinner داخلي (`::before`) يحل محل الأيقونة ويمنع إدخال المؤشر.
- **Button Group:** صف وعمود (`--vertical`) وأحجام (`--sm`/`--lg`) وتحول عمودي متجاوب `--stack-sm|md|lg` (Mobile First)، تلاصق حدود وزوايا بـ Logical Properties يعمل في RTL، فاصل بلون النص بين أزرار solid.
- **Close Button:** زر مربع (`--sm`/`--md`/`--lg`) لأيقونة `x`، ألوانه Tokens يعيد المكون الأب تعريفها.
- ثلاث صفحات توثيق في `documentation/components/` (`button.html` و`button-group.html` و`close-button.html`) بالأقسام الثمانية بالترتيب وPlayground حقيقي لكل منها (Schema خاص: 9 و8 و4 عناصر تحكم)، مفعلة في `nav.js`.
- `tests/manual/button.html`: Fixture لمصفوفة Variant x Color x Size والحالات والمجموعات وClose Button، مع مبدلات الثيم والوضع والاتجاه (انظر ARCHITECTURE.md).

### Changed (Task 09)
- `instructions/`: `COMPONENT_DEVELOPMENT.md` (قسم **النمط المرجعي**: تسمية Tokens وبنية CSS وشكل Playground Schema)، `NAMING_CONVENTIONS.md` (Tokens الخاصة `_` والحالة بالسمة وKeyframes)، `COMPONENTS_REGISTRY.md` (المكونات الثلاثة Documented وملاحظات الأنظمة)، `ARCHITECTURE.md` (قسم Task 09)، `CORE_ASSETS.md` وPROJECT_OVERVIEW.md وRTL_LTR_AND_THEMES.md وINTERNATIONALIZATION.md وCUSTOMIZATION_AND_PLAYGROUND.md (أسطر الحالة فقط).
- حُذف `documentation/components/.gitkeep` لأن المجلد لم يعد فارغاً (قاعدة 5 في ARCHITECTURE.md).
- `assets/i18n/*.json`: **لم تتغير.** المكونات تعيد استخدام `common.close` و`common.loading`.

### Changed (Task 09, تسمية مختصرة بطلبك)
- الأصناف: `bui-btn` و`bui-btn-group` و`bui-btn-close` (بدل `bui-button` و`bui-button-group` و`bui-close-button`)، والـ Modifiers كما هي (`bui-btn--outline`، `bui-btn--lg`، `bui-btn-group--stack-md`). الـ Tokens: `--bui-btn-*` و`--bui-btn-close-*`، والـ Keyframes `bui-btn-spin`. بدون Aliases للأسماء القديمة. القاعدة وجدول الاختصارات المعتمدة في `NAMING_CONVENTIONS.md`. أسماء الملفات (`button.html`) وSchemas الـ Playground (`button`) بقيت كما هي.

### Decisions (Task 09)
- **النمط المرجعي** (التفاصيل في COMPONENT_DEVELOPMENT.md): Tokens عامة `--bui-{component}-{prop}[-{size}]` في الطبقة 3؛ قيم خاصة `--bui-{component}-_*`؛ الألوان تأتي من Tokens الألوان الدلالية عبر Modifier اللون (فيتحكم الثيم بها دون Tokens لونية خاصة بالمكون)؛ Modifier افتراضي لكل خيار؛ Playground Schema يحذف القيم الافتراضية من Code Output.
- **السمة هي الحالة:** `disabled` و`aria-disabled="true"` و`aria-busy="true"` وليس فئة `is-loading`. السبب: نقل الحالة الدلالية مع الشكل في مكان واحد وعدم تكرارها. `aria-busy` وحدها تمنع المؤشر فقط ولا تمنع Enter/Space: موثق، والتوصية معالج يتحقق من السمة أو إضافة `disabled`.
- **Loading لا يخفي النص:** Spinner بجانب النص (يحل محل الأيقونة) بدل تغطية الزر، فيبقى النص مقروءاً. الثمن: عرض الزر يتغير عند التبديل إن لم يكن فيه أيقونة. `aria-busy` لا تعلنها قارئات الشاشة غالباً فيُوصى بنص مخفي `common.loading` داخل الزر.
- **`input type="button"` لا يدعم Spinner ولا أيقونة** (عنصر بلا محتوى): موثق، يدعم باقي الخيارات.
- **رابط معطل:** بلا `href` ومعه `role="link"` و`aria-disabled="true"`؛ `aria-disabled` وحدها على رابط له `href` لا توقف تنقل الكيبورد.
- **التحول العمودي المتجاوب:** `--stack-{sm|md|lg}` (576 و768 و992). الأساس عمودي و`min-width` يعيد الصف. تُنفذ الأعلام `_h`/`_v` بدل تكرار قواعد الزوايا لكل نقطة.
- **فاصل أزرار solid:** خط بلون نص الزر (`--bui-color-*-contrast`) على حافة البداية فقط، لأن حدودها بلون الخلفية فتختفي عند التلاصق. أزرار outline تتداخل حدودها بدل ذلك.
- **أهداف اللمس** (`pointer: coarse`): Button 40 و44 و48px، Close Button 36 و44 و48px. حجم `sm` على اللمس أقل من توصية 44px وأعلى من حد WCAG 2.2 AA (24px).
- **Close Button:** الاسم `aria-label` ثابت بالإنجليزية (يعمل بلا JS) + `data-bui-i18n-attr="aria-label:common.close"` للترجمة (يحتاج `baset-ui.js`)، لأن CSS وحده لا يترجم. يتطلب Extension الأيقونات في Include وإلا يظهر فارغاً (موثق).
- `Spinner` يُبطأ (2s) تحت `prefers-reduced-motion` ولا يتوقف لأنه مؤشر حالة، بخلاف بقية الحركة التي تتوقف بـ Tokens المدة.

### Tested (Task 09, Chromium 157 عبر Playwright فقط، خادم http محلي)
- **التباين:** 2,984 عينة لـ Button (4 Variants x 6 ألوان x 3 أحجام x حالات rest وhover وactive وfocus-visible وloading، إضافة a وinput، x default وocean x Light وDark x LTR وRTL): أدنى نسبة نص 5.02:1 (solid warning، Light)، أدنى حلقة تركيز 6.01:1، أدنى حد outline 5.02:1. Close Button: 48 عينة، أدنى 5.90:1 (سكون) و12.28:1 (hover) و9.96:1 (active). حالات hover وactive وfocus بإجبارها عبر CDP (`CSS.forcePseudoState`)، وتأكد أن الستايل يتغير فعلاً. disabled مستثنى من الشرط.
- **الهندسة:** زوايا وتداخل الحدود في الصف والعمود وLTR وRTL (الزر الأول يمين في RTL)، وStack عند 320 و575 و576 و767 و768 و992 و1920، الفاصل على الحافة الصحيحة في الاتجاهين، الأحجام (32 و40 و48)، زر الأيقونة مربع، الزر الكامل يلتف النص بلا Overflow.
- **الكيبورد والمؤشر:** Enter وSpace على button وinput وClose Button، Tab يتخطى المعطل والرابط بلا `href`، المعطل لا يطلق Click، `aria-disabled` و`aria-busy` يمنعان المؤشر، `aria-busy` وحدها لا تمنع الكيبورد (كما هو موثق)، حلقة التركيز ظاهرة (2px بإزاحة 2px).
- **Responsive:** 256 تركيبة (3 صفحات توثيق + Fixture x 8 عروض 320-1920 x اتجاهان x وضعان x ثيمان) بلا Overflow أفقي ولا أخطاء Console ولا 404.
- **Playground:** 62 فحصاً بتحريك كل عنصر تحكم في الصفحات الثلاث: المعاينة تطابق Code Output، تهريب النص، Reset، عدم تطبيق الخيارات غير المنطبقة.
- **i18n:** `node tests/i18n-keys.js` ينجح (لم تتغير الملفات)، وتبديل en/ar/fr يحدّث `aria-label` و`lang` و`dir` فعلياً. **لمس:** محاكاة `pointer: coarse` (hasTouch وisMobile) تعطي الأحجام أعلاه. **Reduced motion وForced Colors:** بمحاكاة Chromium.
- **التراجع:** 26 صفحة (كل صفحات التوثيق و`index.html`) بلا Console ولا 404، و`tests/manual/core.html` 43/43، و`node tools/build-icons.js --check` ينجح، و`node --check` للـ JS، وصحة JSON.
- **لم يُختبر:** قارئات الشاشة (NVDA وVoiceOver)، Safari وFirefox، أجهزة لمس فعلية، Forced Colors على Windows الفعلي، متصفحات أقدم من الحديثة (الـ CSS يعتمد على `:dir()` و`:not()` بقوائم و`calc()` بقيم أعلام و`@media (hover)`)، الاستخدام داخل Alert/Dialog/Toast (غير منفذة).

### Added (Task 08: Playground Framework)
- `documentation/assets/js/playground.js` (45,061 بايت) و`documentation/assets/css/playground.css` (11,895 بايت): إطار Customize مشترك للتوثيق بلا Dependencies. `BUI_DOCS_PLAYGROUND.define(name, schema)` و`mount(element, schema)` و`escape(text)`؛ النسخة: `getState` و`setState` و`reset` و`resetPreview` و`destroy`.
- Schema: `controls` بثمانية أنواع (select وradio-group وcheckbox وswitch وrange وtext وnumber وcolor) مع قيم افتراضية، و`template(state, helpers)` يرجع HTML أو `{ html, js }`، و`beforeRender`/`afterRender` اختياريان. تحقق من الـ Schema برسائل خطأ واضحة.
- معاينة حية، Code Output بكتلتين (HTML وJavaScript) بنسخ مستقل، Reset options وReset preview، Light/Dark وRTL/LTR على حاوية المعاينة فقط، أزرار عرض (Full وBase 320 وXS..XXXL من `--bui-bp-*`) مع مقبض سحب وكيبورد، وإعلان مهذب (polite، مؤجل 700ms) لقارئ الشاشة.

### Changed (Task 08)
- `documentation/assets/js/docs.js` (+6 أسطر): يعرّض `window.BUI_DOCS_HELPERS = { highlight, copyText }` ليعيد الإطار استخدام التلوين والنسخ. سبب خروجه عن قائمة الملفات موثق في `ARCHITECTURE.md`.
- `instructions/CUSTOMIZATION_AND_PLAYGROUND.md` (شكل Schema وطريقة الاستخدام والقيد المعروف؛ أُزيل وسم "مستقبلي")، `instructions/templates/COMPONENT_DOCUMENTATION_TEMPLATE.md` (مثال استخدام قسم Customize وبند قائمة تحقق)، `instructions/ARCHITECTURE.md`، `instructions/COMPONENTS_REGISTRY.md`، `instructions/PROJECT_OVERVIEW.md` و`README.md` (سطر الحالة).

### Decisions (Task 08)
- **العرض يطابق المطلوب ولا يُقصّ بعمود الصفحة:** عمود محتوى التوثيق نحو 820px حتى على شاشة 1920، فلو قُصّ العرض لانهارت أزرار XL وXXL وXXXL إلى القيمة نفسها. الحاوية تأخذ العرض فعلاً (320 إلى 1920) و**منطقة العرض** تتمرر أفقياً (منطقة مسماة قابلة للتركيز)، فلا Overflow للصفحة.
- الحاوية تحمل أيضاً `data-bui-theme` للصفحة وتتبع تغييره: Dark الخاص بـ Theme (ocean) لا يُطبق إلا إن حمل العنصر الوسمين معاً. هذه إضافة على `data-bui-mode` و`dir` المطلوبين.
- القيمة الابتدائية للوضع والاتجاه تتبع الصفحة ثم تستقل، وReset preview يعيدها من حالة الصفحة الحالية.
- المعاينة `innerHTML` (لا تنفذ سكربتات) و`helpers.escape` لقيم `text`؛ قيم بقية الأنواع مقيدة بالنوع. تُعرض `js` ولا تُنفذ، وتهيئة المكونات ذات JS عبر Hooks يتحمل كاتب الصفحة مطابقتها.
- Reset زران: خيارات المكون، والمعاينة (وضع واتجاه وعرض). لا اختصار كيبورد مخترع.
- قيم الإطار (نصوص الواجهة) إنجليزية ثابتة كباقي Shell، ولا تدخل ملفات i18n.
- **قيد معروف موثق:** عرض الحاوية لا يغيّر نتيجة `@media` (الأعمدة `md` تبقى جنباً إلى جنب في حاوية 320 على Viewport 1280)؛ المعاينة ليست بديلاً عن فحص الجهاز.

### Tested (Task 08, Chrome for Testing 153 عبر Playwright فقط، صفحة مؤقتة خارج المشروع لا تُسلَّم، وهي Fixture معلنة بعناصر HTML عادية)
- وظيفي (50 فحصاً): الأنواع الثمانية بالفأرة والكيبورد، التحديث متزامن، تطابق Code Output مع المعاينة بعد تغييرات متتالية، تهريب `<img onerror>` (لا تنفيذ)، `maxLength`، حالات `number` (خارج الحدود، فارغ)، Reset، `setState/getState`.
- الحاوية (78): Dark وRTL على الحاوية فقط (`<html>` وجسم الصفحة لا يتغيران، لون الخلفية يطابق Token الداكن)، Dark لثيم ocean صحيح، تتبع تغيير الثيم، عرض بدقة كل Breakpoint، سحب الفأرة (LTR وRTL معكوس) وأسهم/Home/End/Shift، حدود 320 و1920، Reset preview.
- التخطيط (51): 128 تركيبة (8 عروض x اتجاهان x وضعان x ثيمان x عرضان) بلا Overflow ولا عنصر مقصوص؛ التباين (4 تراكيب ثيم/وضع) للنص والحدود والمقبض ومفتاح التبديل؛ الأهداف 24px (مؤشر عادي) و44px (محاكاة `pointer: coarse`)؛ تأكيد القيد المعروف.
- الوصولية والدورة (76): أسماء كل العناصر، Tab يصل لكل عنصر، تشغيل كل عنصر بالكيبورد وأزرار Reset، حلقة تركيز ظاهرة، إعلان مؤجل وحيد للتغييرات السريعة وفوري للـ Reset، Copy (نجاح وفشل مع تحديد الكود)، `prefers-reduced-motion`، Forced Colors بمحاكاة، `destroy` متوازن المستمعين وObserver، تركيب مزدوج، 14 حالة Schema خاطئة (خطأ واضح بلا كسر وقالب يرمي استثناء ويتعافى).
- تراجع: 23 صفحة x (1280 LTR فاتح، 320 RTL داكن) بلا Console ولا Overflow (ملاحظة قديمة موجودة دون تعديلاتي: طلب `/favicon.ico` على `index.html` يعطي 404)، `core.html` 43/43، `tests/i18n-keys.js` وبناء الأيقونات `--check` ناجحان، وCopy في صفحة موجودة ما زال يعمل.
- **غير مختبر:** قارئات الشاشة، Safari/Firefox، أجهزة اللمس الفعلية، Hooks مع مكون JS حقيقي، Forced Colors على Windows الفعلي.

### Added (Task 07: Icons System)
- `assets/icons/{thin,light,regular,solid,bold,duotone}/{name}.svg` و`assets/icons/icons.json`: 51 أيقونة بستة أوزان (Phosphor Icons 2.1.1، MIT؛ `solid` = "fill")، منسوخة مرة واحدة دون تغيير في التصميم. الأسماء والفئات والكلمات المفتاحية في `icons.json` من بيانات Phosphor.
- `assets/css/extensions/baset-ui-icons.css` (149,674 بايت خام، 28,515 gzip): Extension CSS فقط، مولَّد. الفئات `bui-icon-{weight}` و`bui-icon-{name}` و`bui-icon-{sm|md|lg|xl}` و`bui-icon-flip-rtl`، الوزن الافتراضي `light`، التلوين بـ `currentColor`، Tokens `--bui-icon-size-*`، ودعم Forced Colors والطباعة. لا JavaScript ولا Global جديد.
- `tools/build-icons.js`: مولّد بلا Dependencies (`node tools/build-icons.js` و`--check`): يتحقق من الأوزان الستة ومن سلامة الـ SVG (يرفض سكربتات وروابط وصوراً مضمنة)، ويولّد الـ CSS وبيانات الكتالوج.
- `documentation/advanced/icons.html` (مفعلة في `nav.js`) و`documentation/assets/js/icons-data.js` (مولَّد): كتالوج بشبكة وبحث (بالاسم والكلمات المفتاحية) وتصفية (فئة، اتجاهية) واختيار وزن العرض، ولوحة تفاصيل بـ `<dialog>` أصلي: الأوزان الستة، الحجم واللون وقلب RTL وزخرفية/بوسم، كود HTML مطابق للمعاينة مع Copy.
- `docs.css`: أصناف الكتالوج `bui-docs-icon-*` (docs فقط).
- `THIRD_PARTY.md`: إسناد Phosphor ونص ترخيص MIT.

### Changed (Task 07)
- `ICONS_SYSTEM.md` أُعيد كتابته (القرارات، الاستخدام، المجموعة الأولية، إجراء الإضافة، الحجم، Accessibility). `ARCHITECTURE.md` (مجلد `tools/` والملفات الجديدة)، `CORE_ASSETS.md` (أول Extension)، `ROADMAP.md` (قرار الأيقونات حُسم)، `TESTING.md`، `COMPONENTS_REGISTRY.md`، `PROJECT_OVERVIEW.md`، `README.md` (سطر الحالة).
- حذف `.gitkeep` من `assets/icons/` و`assets/css/extensions/` (لم يعودا فارغين).

### Decisions (Task 07)
- المصدر: Phosphor (MIT)، وهو مصدر نسخ لمرة واحدة وليس Dependency. التقنية: SVG Mask. الملف: Extension (حجمه بعيد عن 15KB ولا تحتاجه معظم الصفحات). استثناء موثق: Extension بلا `BUI.register` لأنه CSS فقط.
- **تصحيح لتقدير سابق:** Duotone لا يحتاج طبقتين ولا يضاعف الحجم؛ القناع يحتفظ بقناة alpha فيظهر الشكل الخلفي بـ 20% من اللون من نفس الملف.
- اسم الفئة يعتمد على Custom Properties داخلية لكل وزن (`--bui-icon-{weight}-src`) على فئة الأيقونة، وفئة الوزن تختار منها؛ لأن CSS لا يجمع فئتين في `url()` واحد. الخصائص الداخلية مسجلة `@property` بلا وراثة.
- القلب في RTL بفئة يدوية `bui-icon-flip-rtl` (`:dir(rtl)`) وليس تلقائياً.
- فئات محجوزة لا تصلح أسماء أيقونات: الأوزان وsm/md/lg/xl وflip-rtl (يفحصها المولّد).
- مجلد `tools/` جديد لأداة بلا Dependencies، وبيانات الكتالوج في ملف JS مولَّد (ليعمل من `file://`)، وكلاهما موثق في `ARCHITECTURE.md`.
- الكتالوج يستخدم `<dialog>` أصلياً docs-only ولم يُنشأ `BUI.dialog` (Task 13).

### Tested (Task 07, Chromium 157 عبر Playwright فقط، خادم http محلي)
- الأوزان الستة: قيم `mask-image` مختلفة، والافتراضي = light، ورسم فعلي بالبكسل (الشكل غير فارغ ولا مربع ممتلئ؛ solid أثقل من thin وbold أثقل من regular؛ duotone فيه نغمة 20%). اللون `currentColor`، والأحجام (1em/16/24/32/48)، والقلب في RTL فقط مع الفئة.
- الكتالوج: بحث بالاسم والكلمة المفتاحية (يتسامح مع الشرطة/المسافة)، تصفية الفئة والاتجاهية (6)، حالة الفراغ، تغيير وزن الشبكة. الـ dialog: فتح بـ Enter، التركيز داخله، الكود مطابق للمعاينة (HTML الفعلي)، الأوزان بأسهم الكيبورد، Esc والنقر على الخلفية وزر Close، عودة التركيز للمصدر، Copy (Clipboard) وفق حالة الاختبار، وعدم تسرب التركيز لعناصر الصفحة (الانتقال إلى واجهة المتصفح هو سلوك `showModal()` الأصلي).
- Forced Colors (محاكاة Chromium): الأيقونة ظاهرة بلون نظام.
- 64 تركيبة (8 عروض 320-1920 x ltr/rtl x light/dark x default/ocean) والـ dialog مفتوح: بلا Overflow أفقي، الـ dialog داخل الشاشة، بلا أخطاء Console ولا 404.
- تراجع: 23 صفحة (index وكل صفحات التوثيق) بلا أخطاء ولا Overflow؛ `tests/manual/core.html` 43/43 بوضعي autoInit؛ `node tests/i18n-keys.js` ناجح؛ `BUI` بلا أعضاء جديدة؛ `node tools/build-icons.js --check` ناجح.
- لم يُختبر: قارئات الشاشة، Safari/Firefox، أجهزة اللمس، Forced Colors على نظام فعلي، متصفحات لا تدعم `:dir()` أو `mask` بلا بادئة، أداء الرسم مع آلاف الأيقونات.

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
