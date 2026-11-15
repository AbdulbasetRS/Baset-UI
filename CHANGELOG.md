# Changelog

يتبع صيغة [Keep a Changelog](https://keepachangelog.com) و[SemVer](https://semver.org).

## [Unreleased]

### Added
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

### Decisions
- Task 02 تسمية الـ Layout: `bui-{property}-{breakpoint}-{value}` (البادئة بين الخاصية والقيمة)، مثل `bui-grid-cols-md-2` و`bui-flex-md-row`. مثال Task 02 كتب `bui-flex-row-md` (لاحقة)، وُحّد على الصيغة الأولى لتتسق مع مثال Grid.
- Task 02: `bui-container` = Fixed (يتدرج عند كل Breakpoint)، `bui-container-fluid` = كامل العرض، `bui-container-{bp}` = Responsive (كامل العرض تحت الـ Breakpoint ثم يتبع التدرج).
- Task 02: كل قواعد `@media` للـ Layout في القسم 7 (Responsive Utilities) من `baset-ui.css`، والقسم 4 للقواعد الأساسية فقط.
- Task 02: الـ Tokens المعتمدة على الوضع (الألوان والظلال والمشتقة منها) تُعرّف داخل كتلة كل وضع لا في `:root`، لأن المتغيرات المشتقة تُحسب عند العنصر المعرِّف. السبب: صحة الوضع المحصور في حاوية `data-bui-mode`.
- Task 02: `data-bui-mode` يعمل على أي حاوية (`[data-bui-mode="dark"]`) وليس `:root` فقط، لدعم معاينة Playground لاحقاً حسب CUSTOMIZATION_AND_PLAYGROUND.md.
- Task 02: `display` لكلاسات `bui-flex` و`bui-grid` يستخدم `:not([hidden])` ليتغلب `hidden` دون `!important`.
- Task 02: ما يزال `--bui-bp-*` مرجعياً (لا يُستخدم في `@media`)؛ وسم "(مستقبلي)" في RESPONSIVE_DESIGN.md لم يُعدَّل.
- Sidebar يُرسم من `documentation/assets/js/nav.js` لسهولة إضافة الروابط.
- لا أيقونات في Shell التوثيق الحالي (رسم CSS) لأن نظام الأيقونات غير منفذ بعد.
