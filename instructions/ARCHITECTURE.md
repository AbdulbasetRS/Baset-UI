# المعمارية العامة

## هيكل المستودع

```text
Baset-UI/
├── index.html              واجهة موقع التوثيق (في الجذر لـ GitHub Pages)
├── README.md  CHANGELOG.md  CONTRIBUTING.md  LICENSE  .nojekyll
├── assets/                 ملفات المكتبة نفسها (ما يستخدمه المستخدم النهائي)
│   ├── css/baset-ui.css    الملف الأساسي
│   ├── css/extensions/     مكونات كبيرة مستقلة
│   ├── css/themes/         Themes
│   ├── js/baset-ui.js      الملف الأساسي
│   ├── js/extensions/      مكونات كبيرة مستقلة
│   ├── i18n/               ملفات الترجمة JSON
│   ├── icons/  fonts/  images/  sounds/
├── documentation/          صفحات التوثيق وملفات موقع التوثيق فقط
│   ├── getting-started/ customization/ layout/ components/ utilities/ extensions/ examples/
│   └── assets/{css,js,images}   ملفات واجهة التوثيق (ليست جزءاً من المكتبة)
├── instructions/           المرجع الأساسي للتطوير
├── tests/                  الاختبارات
└── examples/               أمثلة تطبيقية مستقلة
```

## قواعد الفصل
1. `assets/` = المكتبة. أي شيء يحتاجه المستخدم النهائي. لا يعتمد أبداً على `documentation/`.
2. `documentation/assets/` = واجهة موقع التوثيق فقط. يستخدم Classes بالبادئة `bui-docs-*` وهي **ليست** جزءاً من API المكتبة.
3. `instructions/` لا توضع داخل `documentation/`.
4. لا تُنشأ مجلدات/ملفات جديدة دون سبب معماري موثق هنا.
5. المجلدات الفارغة تحتوي `.gitkeep` حتى أول استخدام.

## اتجاه الاعتماد
`documentation/*` يعتمد على `assets/*`، وليس العكس. Extensions تعتمد على Core، والعكس ممنوع (Core لا يعرف أسماء الـ Extensions).

## نشر GitHub Pages
- المستودع: https://github.com/AbdulbasetRS/Baset-UI
- الموقع: https://abdulbasetrs.github.io/Baset-UI/ (مسار فرعي `/Baset-UI/`، لذلك المسارات المطلقة التي تبدأ بـ `/` ممنوعة).
الجذر هو مصدر النشر. المسارات **نسبية** دائماً (`assets/...`) وليست مطلقة (`/assets/...`) لأن الموقع قد يُخدَّم من مسار فرعي. ملف `.nojekyll` موجود لتعطيل Jekyll.

## صفحات التوثيق
- صفحات `documentation/**/*.html` تعتمد نفس الـ Shell (Navbar/Sidebar/Footer) وتحسب المسارات النسبية للجذر.
- **قالب الصفحة (محدد في Task 02):** لا ملف قالب منفصل (لا Build). تُنسخ بنية أي صفحة قائمة، والمرجع `documentation/layout/container.html`. المتطلبات:
  - `<body data-docs-root="../../">`: المسار النسبي من الصفحة إلى الجذر (`../../` لصفحات `documentation/{section}/`). يستخدمه `docs.js` لروابط Sidebar.
  - ترتيب التحميل: `{root}assets/css/baset-ui.css` ثم `../assets/css/docs.css`، والسكربتات: `baset-ui.js` ثم `nav.js` ثم `docs.js`.
  - المحتوى داخل `<main id="bui-docs-main"><article class="bui-docs-article">` وفيه `h1` واحد وعناوين `h2`/`h3` بلا قفز في المستويات.
  - مكونات العرض (Docs فقط، البادئة `bui-docs-*`): `bui-docs-example` (معاينة + كود)، `bui-docs-preview`، `bui-docs-code` مع زر `data-docs-copy`، `bui-docs-table-wrap`/`bui-docs-table`، `bui-docs-note`. الكود المعروض يجب أن يطابق المعاينة حرفياً ولا يحتوي كلاسات `bui-docs-*`.
  - قراءات حية اختيارية: `data-docs-viewport`، `data-docs-breakpoint`، `data-docs-width-of="#id"`، `data-docs-css-var="--bui-x"`.
  - عنصر `role="status"` بالمعرف `bui-docs-status` لإعلان نتيجة النسخ.
- تفعيل رابط في Sidebar: تعديل `documentation/assets/js/nav.js` وإضافة `href` للعنصر، وهي الطريقة المعتمدة لإضافة روابط جديدة.
- Sidebar الحالي يُرسم من `nav.js`؛ العناصر بدون `href` تظهر معطلة (Placeholder).

## تعديل المعمارية
أي تعديل على هذا الهيكل يتطلب: سبب مكتوب هنا، وإدخال في CHANGELOG، وموافقة المالك إذا كان يغير مسارات عامة.
