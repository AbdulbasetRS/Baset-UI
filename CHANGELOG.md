# Changelog

يتبع صيغة [Keep a Changelog](https://keepachangelog.com) و[SemVer](https://semver.org).

## [Unreleased]

### Added
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
