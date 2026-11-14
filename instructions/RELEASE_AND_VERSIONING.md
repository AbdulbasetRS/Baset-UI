# الإصدارات والنشر

## الإصدارات
[Semantic Versioning](https://semver.org): `MAJOR.MINOR.PATCH`.
- **MAJOR:** كسر توافق (حذف/تغيير Class أو API أو Token أو مفتاح i18n منشور).
- **MINOR:** ميزة/مكون جديد متوافق.
- **PATCH:** إصلاحات.
- النسخة الحالية: `0.0.0-foundation` (لا إصدار منشور). مرحلة `0.x` يجوز فيها التغيير مع توثيقه.

## موضع رقم الإصدار
مصدر الحقيقة: ترويسة `baset-ui.css` و`baset-ui.js` و`CHANGELOG.md`، (مستقبلي: `BUI.version`). وتعرضه الـ Footer عبر `data-docs-version`؛ تحديثه يتم يدوياً مع كل إصدار حتى يُقرر تحديثه آلياً.

## CHANGELOG
صيغة [Keep a Changelog](https://keepachangelog.com): Added/Changed/Deprecated/Removed/Fixed/Security. كل مهمة تضيف بنداً تحت `Unreleased`.

## النشر على GitHub Pages
1. المصدر: فرع `main`، المجلد الجذر، في https://github.com/AbdulbasetRS/Baset-UI وينشر على https://abdulbasetrs.github.io/Baset-UI/.
2. `.nojekyll` موجود.
3. مسارات نسبية فقط.
4. قبل النشر: اختبارات [TESTING.md](TESTING.md) + فتح الموقع محلياً عبر خادم ساكن بسيط.
5. وسم Git للإصدار `vX.Y.Z` وإنشاء Release.

## التراجع والإهمال
Deprecation تُعلن في MINOR وتُزال في MAJOR التالي مع تحذير `[BUI]` في Console (مستقبلي).

## ملفات مستقبلية للتوزيع (اقتراح)
نسخ `.min` للـ CSS/JS: تتطلب أداة ضغط، أي Dependency، فتحتاج قراراً وموافقة قبل اعتمادها.
