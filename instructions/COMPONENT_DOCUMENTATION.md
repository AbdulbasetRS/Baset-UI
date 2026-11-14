# معايير توثيق المكونات

لكل Component صفحة في `documentation/components/{component}.html` (أو القسم المناسب) تتبع **الترتيب الإلزامي التالي**، بنفس العناوين الإنجليزية ونفس الترتيب:

| # | القسم | المحتوى الإلزامي |
|---|---|---|
| 01 | **Installation & Include** | الملفات المطلوبة (CSS/JS/Extensions)، ترتيب التحميل، مثال جاهز للنسخ |
| 02 | **Customize** | Playground تفاعلي خاص بالمكون ([CUSTOMIZATION_AND_PLAYGROUND.md](CUSTOMIZATION_AND_PLAYGROUND.md)) |
| 03 | **Default** | الشكل الافتراضي بأقل إعدادات |
| 04 | **Variants & Options** | كل الأنواع والأحجام والخصائص والحالات المدعومة |
| 05 | **Examples** | أمثلة عملية متنوعة وواقعية |
| 06 | **JavaScript API** | Methods/Options/Events (إن وُجد API؛ وإلا يُذكر أن المكون CSS فقط) |
| 07 | **Responsive Behavior** | سلوك المكون عبر Breakpoints |
| 08 | **Accessibility** | Keyboard وScreen Readers وARIA |

## قواعد
- لا يُحذف قسم. إن لم ينطبق، يبقى مع جملة توضح السبب.
- كل مثال: كود قابل للنسخ + عرض حي. الكود المعروض يطابق ما يعمل فعلاً.
- جداول Options/Methods/Events بأعمدة: الاسم، النوع، الافتراضي، الوصف (+ المقابل في HTML للـ Options).
- لا Emojis. الأيقونات من المكتبة. لا محتوى وهمي.
- الأمثلة تعمل في RTL وLTR وLight وDark.
- النصوص العامة في صفحات التوثيق بالإنجليزية (لغة الموقع الافتراضية)، إلى أن يُقرر نظام توثيق متعدد اللغات (مستقبلي).

## إجراءات إضافة صفحة
1. أنشئ الصفحة من [templates/COMPONENT_DOCUMENTATION_TEMPLATE.md](templates/COMPONENT_DOCUMENTATION_TEMPLATE.md).
2. فعّل الرابط في `documentation/assets/js/nav.js` بإضافة `href`.
3. تحقق أن العنصر يظهر Active في Sidebar.
4. حدّث [COMPONENTS_REGISTRY.md](COMPONENTS_REGISTRY.md) إلى Documented.

## ما لا يُوثَّق
ميزات غير منفذة أو غير مختبرة.
