# Changelog

يتبع صيغة [Keep a Changelog](https://keepachangelog.com) و[SemVer](https://semver.org).

## [Unreleased]

### Added
- Task 03 (Row and Column, بأسلوب Bootstrap):
  - `assets/css/baset-ui.css`: نظام 12 عموداً بـ Flexbox: `bui-row`، `bui-col`، `bui-col-auto`، `bui-col-{1-12}`، `bui-row-cols-{auto|1-6}`، `bui-offset-{0-11}`، `bui-order-{first|0-5|last}`، `bui-g-{0-5}` و`bui-gx-*` و`bui-gy-*`، وكلها بنسخ Responsive لكل الـ Breakpoints السبعة (`bui-col-md-6`، `bui-offset-lg-2`...). Token جديد: `--bui-row-gutter`.
  - `documentation/layout/grid.html`: الصفحة أعيد ترتيبها: Row and Column أولاً (جدول التسمية و12 مثالاً بالكود، RTL، Responsive، Tokens) ثم قسم CSS Grid كما هو بعناوين تبدأ بـ "CSS Grid:".
  - `documentation/assets/css/docs.css`: تنسيق عرض أعمدة الأمثلة (خاص بالموقع).
  - Footer التوثيق مضغوط: `docs.js` (بناء الأعمدة) و`nav.js` (`BUI_DOCS_FOOTER`).
- Footer التوثيق بأعمدة (`docs.js` + `docs.css`): عمود العلامة (الشعار الكامل + وصف من README)، وعمود لكل قسم في الـ Sidebar له روابط فعلية (حالياً Layout وCustomization)، وشريط سفلي يضم حقوق النشر والإصدار ورابط GitHub. الأعمدة تتولد من `nav.js` فتكبر تلقائياً مع إضافة صفحات.
- Syntax Highlighting لكل Code Blocks في صفحات التوثيق (ألوان VS Code Dark+):
  - مكون موحد داخل `documentation/assets/js/docs.js` (`window.BUI_DOCS_CODE`: `detect`, `tokenize`, `highlight`, `enhance`) بـ Tokenizer خاص بدون أي مكتبة. اللغات: HTML (مع `<script>` و`<style>`)، CSS، JavaScript، JSON، PHP.
  - ألوان Dark+ كـ Tokens في `docs.css` (`--bui-docs-syntax-*`، `bui-docs-tok-*`). خاصة بالموقع وليست جزءاً من المكتبة.
  - اللغة تُكتشف تلقائياً، ويمكن فرضها بسمة `data-docs-lang` على `.bui-docs-code` أو `pre` أو `code` (`plain` تعطل التلوين).
- شعار Baset-UI (`documentation/assets/images/brand/`) في موقع التوثيق وREADME:
  - Navbar: الـ Mark (نسختا light وdark) بدل نص الاسم.
  - Footer: الشعار الكامل (نسختا light وdark).
  - Favicon: الـ Mark، يتبدل مع وضع Light/Dark للموقع.
  - `README.md`: الشعار الكامل عبر `<picture>` مع `prefers-color-scheme`.
- Task 02 (Design Tokens, Base & Layout):
  - `assets/css/baset-ui.css`: نظام Tokens كامل (Palette + Semantic Colors لـ 6 أدوار، Typography، Spacing، Radius، Border Width، Shadows، Z-Index، Transitions، Breakpoints، Container، Grid، Focus)، وضع Dark، Base كامل، Container (fixed/fluid/responsive)، Grid، Flexbox، `bui-gap-*`، متغيرات Responsive لكل Breakpoints، Reduced Motion وPrint.
  - 8 صفحات توثيق: `documentation/customization/{colors,typography,css-variables}.html` و`documentation/layout/{breakpoints,container,grid,flexbox,spacing}.html`.
  - Shell التوثيق: مكونات عرض الأمثلة، نسخ الكود، قراءات حية، دعم الصفحات الفرعية. وصف القالب في `instructions/ARCHITECTURE.md`.
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

### Fixed
- Shell التوثيق: `overflow-x: hidden` على `html` و`body` كان يعطل `position: sticky` للـ Navbar؛ استُبدل بـ `clip`.
- Shell التوثيق: الصفحات لم تكن تعرّف أيقونة (Favicon) فكان المتصفح يطلب `/favicon.ico` ويحصل على 404؛ أُضيفت الأيقونة من `docs.js`.

### Decisions
- Task 03: الـ Gutter بأسلوب Bootstrap: Padding على الأعمدة ومارجن سالب (`margin-inline`) على الـ Row. السبب: التوافق مع نموذج Bootstrap المطلوب وسهولة الـ Offset. شرط الاستخدام: الـ Row داخل Container، وأقصى Gutter هو الخطوة 5 (2rem) حتى لا يتجاوز نصفه Padding الـ Container (1rem) فلا يحدث Overflow أفقي.
- Task 03: يُعاد تعريف `--bui-gutter-x/y` على كل `bui-row` من `--bui-row-gutter`، فلا يرث Row متداخل Gutter أبيه.
- Task 03: `.bui-row-cols-*` تسبق `.bui-col-*` في الملف، فيغلب العمود المرقّم على إعداد الصف (نفس ترتيب Bootstrap).
- Task 03: لا Gutter متجاوب (`bui-g-md-3`) في هذه المهمة؛ يُضاف عند الحاجة.
- Task 03: التسمية متسقة مع قرار Task 02 `bui-{property}-{breakpoint}-{value}` (`bui-col-md-6`، `bui-row-cols-md-3`، `bui-offset-lg-2`). الكلاسات الأقدم `bui-grid-*` و`bui-col-span-*` (CSS Grid) باقية بلا تغيير ولا تتعارض معها.
- Task 03 (Footer): عمود "Documentation" صار يعرض نقطة دخول واحدة لكل قسم في الـ Sidebar (أول صفحة فيه) بدل كل الصفحات، فيكبر مع الأقسام لا مع الصفحات (`footer: false` في `nav.js` يستثني قسماً). عمود "Contact" يُقرأ من `window.BUI_DOCS_FOOTER.contact` في `nav.js` ويُخفى وهو فارغ، ولا يقبل إلا روابط `http(s)` و`mailto`. أُضيف رابط LinkedIn والبريد الإلكتروني من المالك. روابط GitHub تبقى للمستودع الرسمي فقط حسب PROJECT_OVERVIEW.md.
- Footer: الأعمدة تُبنى من `docs.js` وليس بتعديل الصفحات (نفس سبب الشعار). عناصر الـ Footer الأصلية (حقوق النشر، `data-docs-version`، GitHub) تُنقل كما هي إلى الشريط السفلي، وبدون JavaScript يبقى الـ Footer القديم. الشعار صار داخل عمود العلامة بدل صف مستقل.
- Footer: لم تُنقل عناصر مثال الـ Footer المقترح (حالة النظام، الساعة والمنطقة الزمنية، قائمة اللغة) لأنها تعتمد على Dropdown وButton وInput والأيقونات ونظام اللغة وكلها غير منفذة، ولا توجد حالة نظام حقيقية. تُضاف في مهام تلك المكونات.
- Footer: لا روابط GitHub إلا المستودع الرسمي (قاعدة PROJECT_OVERVIEW)، لذلك لا روابط مباشرة لـ LICENSE أو CHANGELOG.
- Syntax Highlighting: بلوكات الكود داكنة دائماً (Dark+) في Light وDark، بقرار المالك. الألوان على `:root` ولا تتبع `data-bui-mode`.
- Syntax Highlighting: المكون داخل `docs.js` وليس ملفاً منفصلاً، لأن ملفاً جديداً يتطلب وسم `<script>` في كل صفحة. التلوين يعمل على الـ DOM الموجود بدون تعديل الصفحات، ولا يغير النص أبداً (`textContent` ثابت)، فيبقى زر Copy كما هو. إن اختلف نص التلوين عن الأصل لأي سبب يُترك البلوك بلا تلوين مع تحذير في Console.
- Syntax Highlighting: تطبيق المكون على Playground وCode Generator مؤجل لحين وجودهما (غير موجودين حالياً)، والواجهة العامة `BUI_DOCS_CODE.highlight/enhance` جاهزة لهما.
- Syntax Highlighting: الاستثناء من التباين: لون أقواس الوسوم `#808080` في Dark+ نسبته 4.22:1 على `#1e1e1e` (أقل من 4.5:1 لنص عادي). أُبقي كما في Dark+ لأن المهمة اشترطت الألوان الأصلية، وهو يتحكم فيه `--bui-docs-syntax-tagpunct`.
- الشعار: يُحقن من `documentation/assets/js/docs.js` (Navbar وFooter وFavicon) بدل تكرار الوسوم في 9 صفحات HTML، ليبقى تغيير الشعار مستقبلاً في مكان واحد (نفس فكرة رسم الـ Sidebar من `nav.js`). نص "Baset-UI" الأصلي في الـ Navbar يُستبدل بالصورة (الاسم يبقى عبر `alt`)، وبدون JavaScript يظهر النص الأصلي.
- الشعار: النسخة المعروضة تتبع `data-bui-mode` على `<html>` (زر Dark mode في الموقع) وليس إعداد نظام التشغيل، لتتسق مع باقي الموقع. في README (GitHub) يُستخدم `prefers-color-scheme` لأن GitHub لا يعرف زر الموقع.
- الشعار: الـ Mark في الـ Navbar (كل العروض) والشعار الكامل في الـ Footer، لأن السطر الوصفي في الشعار الكامل لا يُقرأ في ارتفاع الـ Navbar. الأحجام عبر `--bui-docs-logo-mark-h` و`--bui-docs-logo-full-h` (خاصة بالموقع وليست Tokens للمكتبة).
- Task 02 تسمية الـ Layout: `bui-{property}-{breakpoint}-{value}` (البادئة بين الخاصية والقيمة)، مثل `bui-grid-cols-md-2` و`bui-flex-md-row`. مثال Task 02 كتب `bui-flex-row-md` (لاحقة)، وُحّد على الصيغة الأولى لتتسق مع مثال Grid.
- Task 02: `bui-container` = Fixed (يتدرج عند كل Breakpoint)، `bui-container-fluid` = كامل العرض، `bui-container-{bp}` = Responsive (كامل العرض تحت الـ Breakpoint ثم يتبع التدرج).
- Task 02: كل قواعد `@media` للـ Layout في القسم 7 (Responsive Utilities) من `baset-ui.css`، والقسم 4 للقواعد الأساسية فقط.
- Task 02: الـ Tokens المعتمدة على الوضع (الألوان والظلال والمشتقة منها) تُعرّف داخل كتلة كل وضع لا في `:root`، لأن المتغيرات المشتقة تُحسب عند العنصر المعرِّف. السبب: صحة الوضع المحصور في حاوية `data-bui-mode`.
- Task 02: `data-bui-mode` يعمل على أي حاوية (`[data-bui-mode="dark"]`) وليس `:root` فقط، لدعم معاينة Playground لاحقاً حسب CUSTOMIZATION_AND_PLAYGROUND.md.
- Task 02: `display` لكلاسات `bui-flex` و`bui-grid` يستخدم `:not([hidden])` ليتغلب `hidden` دون `!important`.
- Task 02: ما يزال `--bui-bp-*` مرجعياً (لا يُستخدم في `@media`)؛ وسم "(مستقبلي)" في RESPONSIVE_DESIGN.md لم يُعدَّل.
- Sidebar يُرسم من `documentation/assets/js/nav.js` لسهولة إضافة الروابط.
- لا أيقونات في Shell التوثيق الحالي (رسم CSS) لأن نظام الأيقونات غير منفذ بعد. الشعار صورة علامة تجارية وليس أيقونة واجهة.
