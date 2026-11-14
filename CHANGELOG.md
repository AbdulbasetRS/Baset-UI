# Changelog

يتبع صيغة [Keep a Changelog](https://keepachangelog.com) و[SemVer](https://semver.org).

## [Unreleased]

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
