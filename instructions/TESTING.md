# قواعد الاختبار

> الحالة: لا توجد أطر اختبار مثبتة. يوجد اختبار يدوي ذاتي التشغيل واحد: `tests/manual/core.html` (Task 05)، واختبار آلي بلا Dependencies لتطابق مفاتيح i18n: `node tests/i18n-keys.js` (Task 06)، وفحص الأيقونات: `node tools/build-icons.js --check` (Task 07: يتحقق من الأوزان الستة لكل أيقونة ومن أن الملفات المولَّدة حديثة). اختيار أداة اختبار آلية = إضافة Dependency تحتاج موافقة ([AI_RULES.md](AI_RULES.md)).

> Task 13: صفحة الاختبار اليدوي `tests/manual/overlays.html` (مع Fixture `tests/manual/fixtures/overlay-content.html` لاختبار `url`، تحتاج http أو https). الاختبارات الآلية للسلوك نُفذت بمتصفح آلي خارج المستودع (Playwright/Chromium) ولا تُشحن لأنها تحتاج Dependency، وملخصها في CHANGELOG.

## المبدأ
لا مهمة مكتملة دون اختبار فعلي، ويُذكر في التقرير ما اختُبر وكيف وما لم يُختبر.

## الاختبارات المطلوبة لكل مهمة
| النوع | المطلوب |
|---|---|
| **تشغيل** | فتح `index.html` بدون أخطاء Console ولا طلبات 404 |
| **Static** | فحص صياغة JS/CSS/JSON (مثال `node --check`، تحقق JSON) |
| **RTL/LTR** | مراجعة بصرية للمكون بالاتجاهين |
| **Light/Dark** | مراجعة بالوضعين |
| **Responsive** | العروض المذكورة في [RESPONSIVE_DESIGN.md](RESPONSIVE_DESIGN.md)، ولا Horizontal Overflow |
| **Keyboard/A11y** | حسب [ACCESSIBILITY.md](ACCESSIBILITY.md) |
| **i18n** | تطابق مفاتيح كل ملفات `assets/i18n/*.json`: `node tests/i18n-keys.js` |
| **JS Lifecycle** | init مرتين، destroy، عدم تسرب مستمعات |
| **التراجع** | المكونات المسجلة الأخرى لم تتأثر |

## التنظيم
- `tests/` تحتوي الاختبارات الآلية وصفحات الاختبار اليدوية (`tests/manual/{component}.html`).
- كل مكون له Checklist اختبار يدوي في صفحته أو في `tests/`.
- يجب أن يعمل أي اختبار بدون Build إن أمكن (اقتراح).

## قالب التقرير
قائمة بما اختُبر (+ البيئة/المتصفح/الأحجام)، النتيجة، وما لم يُختبر وسببه. ممنوع الادعاء بنجاح لم يُنفذ فعلاً.

> Task 15: صفحة الاختبار اليدوي `tests/manual/alert-toast.html` (Fixture معلن؛ تعمل من `file://` عدا تبديل اللغة الذي يحتاج http). الاختبارات الآلية (Playwright/Chromium) نُفذت خارج المستودع ولم تُشحن لأنها تحتاج Dependency، وملخصها في CHANGELOG.
