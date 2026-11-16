# Changelog

يتبع صيغة [Keep a Changelog](https://keepachangelog.com) و[SemVer](https://semver.org).

## [Unreleased]

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
