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
│   ├── getting-started/ layout/ customization/ components/ utilities/
│   ├── javascript/ extensions/ accessibility/ advanced/ development/ examples/
│   └── assets/{css,js,images}   ملفات واجهة التوثيق (ليست جزءاً من المكتبة)
├── instructions/           المرجع الأساسي للتطوير (templates/ تضم قوالب المهام وقالب صفحة التوثيق)
├── tests/                  الاختبارات (manual/{component}.html: صفحات اختبار يدوي تعمل بلا Build)
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
القالب الرسمي: [templates/DOC_PAGE_TEMPLATE.html](templates/DOC_PAGE_TEMPLATE.html). عقد العناصر (Example/Code/Callout/Tables/Anchors) في [COMPONENT_DOCUMENTATION.md](COMPONENT_DOCUMENTATION.md).

### مكان كل قسم من الـ Sidebar
المجلد يطابق قسم الـ Sidebar، واسم الملف هو عنوان العنصر بصيغة kebab-case (`Button Group` ← `button-group.html`، `Date Picker` ← `date-picker.html`).

| قسم الـ Sidebar | المجلد |
|---|---|
| Get Started | `documentation/getting-started/` |
| Layout | `documentation/layout/` |
| Customization | `documentation/customization/` |
| Components | `documentation/components/` |
| Forms | `documentation/components/` |
| Data Display | `documentation/components/` |
| Utilities | `documentation/utilities/` |
| JavaScript | `documentation/javascript/` |
| Extensions | `documentation/extensions/` |
| Accessibility | `documentation/accessibility/` |
| Advanced | `documentation/advanced/` |
| Development | `documentation/development/` |

- **Forms وData Display داخل `components/`** لأنها مكونات من نفس النوع (نفس الأقسام الثمانية)، فلا يلزم مجلد لكل قسم، وتبقى المجلدات قليلة. التمييز بين الأقسام يتم في `nav.js` فقط.
- **المجلدات الأربعة الجديدة** (`javascript/`, `accessibility/`, `advanced/`, `development/`) أُضيفت لأن هذه الأقسام موجودة في الـ Sidebar ولم يكن لها مكان؛ وكل مجلد يحتوي `.gitkeep` حتى أول صفحة (القاعدة 5). `examples/` لا قسم له في الـ Sidebar وبقي كما هو.
- **عمق كل صفحة ثابت (2):** `documentation/{folder}/{name}.html`، لذلك قيمة `data-root` لكل صفحة توثيق هي دائماً `../../`. تُسمح أعماق أخرى (مثلاً `../../../`) بتغيير `data-root` وروابط الملفات معاً فقط.

### صفحات JavaScript واختبار Core (Task 05)
- `documentation/javascript/{introduction,initialization,events,api-reference}.html`: قسم JavaScript في الـ Sidebar، بالقالب نفسه وبعمق مجلدين (`data-root="../../"`).
- `tests/manual/core.html`: صفحة اختبار ذاتية التشغيل للـ Core (تُنشئ مكونات تجريبية داخل الصفحة فقط ولا تُشحن مع المكتبة). السبب: `TESTING.md` يحدد `tests/manual/{component}.html` للاختبار اليدوي دون أداة أو Dependency.

### الثيمات واللغات واختبار المفاتيح (Task 06)
- `assets/css/themes/ocean.css`، و`assets/i18n/fr.json`: داخل مجلدين موجودين في الهيكل (`css/themes/` و`i18n/`)، وأُزيل `.gitkeep` من `css/themes/` لأنه لم يعد فارغاً.
- `tests/i18n-keys.js`: سكريبت Node بلا Dependencies (`node tests/i18n-keys.js`). السبب: `TESTING.md` يطلب اختبار تطابق i18n، و`tests/` هو مكان الاختبارات الآلية، والمهمة سمّت `tests/i18n-keys.*` صراحة. ملف واحد مستقل، لا يحمّل شيئاً من المكتبة.
- صفحات التوثيق الأربع: `documentation/customization/{themes,dark-mode}.html` و`documentation/advanced/{rtl-ltr,internationalization}.html`، وأُزيل `.gitkeep` من `advanced/` لأنه لم يعد فارغاً. اسم `rtl-ltr.html` من قاعدة kebab-case لعنصر Sidebar `RTL & LTR`.
- **كل صفحة توثيق (وقالبها و`index.html`) تربط `assets/css/themes/ocean.css` وتحمل Snippet منع الوميض بمفتاحي `bui-theme` و`bui-mode`** (بدل `bui-docs-mode` القديم). السبب: مبدّل الثيم/الوضع في Navbar صار يعتمد على `BUI.theme`، فلو بقي Snippet القديم لقرأ مفتاحاً لم يعد يُكتب وعاد الوميض. المفتاح `bui-docs-dir` (اتجاه Navbar) docs-only ويقرؤه نفس Snippet.
- `docs.js`: عناصر القيم الحية (`data-docs-token` وصفوف التباين) تقرأ الآن من Probes تحمل `data-bui-mode` و`data-bui-theme` معاً، وتُعاد عند `bui:theme:change`، وتقبل `data-docs-theme` لثيم صريح.

### الأيقونات والأداة (Task 07)
- `assets/icons/{thin,light,regular,solid,bold,duotone}/{name}.svg` و`assets/icons/icons.json` (قائمة الأيقونات): داخل `assets/icons/` الموجود في الهيكل، وأُزيل `.gitkeep` منه ومن `assets/css/extensions/` لأنهما لم يعودا فارغين.
- `assets/css/extensions/baset-ui-icons.css`: Extension بحسب [CORE_ASSETS.md](CORE_ASSETS.md) (مولَّد).
- `tools/build-icons.js`: **مجلد جديد `tools/`** لأدوات المطور الخالية من Dependencies. السبب: ICONS_SYSTEM.md يطلب إجراء موثقاً لإضافة أيقونة، وتوليد ملف CSS من مئات الـ SVG يدوياً غير عملي؛ `tests/` للاختبارات فقط، و`assets/` لما يستخدمه المستخدم النهائي، فالأداة لا تنتمي لأي منهما. لا يعتمد عليه تشغيل المكتبة ولا الموقع.
- `documentation/assets/js/icons-data.js`: بيانات الكتالوج (مولَّد، docs فقط، مثل `nav.js`). السبب: الصفحة يجب أن تعمل من `file://` فلا يصلح `fetch` لـ JSON.
- `documentation/advanced/icons.html` (مفعلة في `nav.js`). `THIRD_PARTY.md` في الجذر (إسناد وترخيص Phosphor).

### قرار المسارات في الصفحات المتداخلة
- كل صفحة تضع `data-root="../../"` على `<html>`: المسار **من الصفحة نفسها** إلى جذر الموقع (مجلد `index.html`). يُقرأ في `docs.js` ويُبنى عليه كل رابط (Sidebar، Breadcrumb، Previous/Next، رابط الشعار).
- إن غابت السمة يستنتج `docs.js` الجذر من مسار سكربت `docs.js` نفسه (دائماً ثلاثة مستويات تحت الجذر)، فتبقى الصفحة تعمل. السمة هي المصدر الأساسي لأنها صريحة ولا تعتمد على موضع السكربت.
- **السبب:** لا مسارات مطلقة (`/assets/...`) لأن الموقع يُخدَّم من `/Baset-UI/` على GitHub Pages، ولا Build Tools لتوليد المسارات، ويجب أن تعمل الصفحات من `file://` ومن خادم محلي. الروابط في `<head>` (CSS) وآخر `<body>` (JS) تُكتب في الصفحة نفسها بنفس بادئة `data-root` لأنها تُحمَّل قبل تشغيل أي JavaScript.
- مقارنة الصفحة الحالية بعناصر `nav.js` تتم على المسار النسبي للجذر بعد حذف `.html` و`/index`، فيستمر التمييز النشط حتى لو قُدِّمت الصفحة بدون الامتداد (GitHub Pages يفعل ذلك).

### ما يُكرَّر وما لا يُكرَّر في كل صفحة
- لا يُكتب Navbar ولا Sidebar ولا Footer ولا Skip Link في الصفحات: يبنيها `docs.js` حول `<main id="bui-docs-main">`. المكرَّر في كل صفحة هو فقط: `<head>` (3 روابط/سكربتات ثابتة + سكربت الوضع المبكر) و`<main>` ومحتواه وسطر سكربتات الـ body.
- `index.html` يحتفظ بـ Shell ثابت من Task 01 ويعمل كما هو؛ `docs.js` يتجاوز البناء عند وجوده. (اقتراح مستقبلي: ترحيل `index.html` إلى نفس الصيغة المختصرة لإلغاء ازدواج تعريف الـ Navbar بين `index.html` و`docs.js`.)
- ترتيب الـ Sidebar وBreadcrumb وPrevious/Next مصدره الوحيد `nav.js` (صيغته موثقة في رأس الملف).

### تفعيل رابط في الـ Sidebar
تعديل `documentation/assets/js/nav.js` فقط: استبدال النص بكائن `{ title, href }` حيث `href` نسبي لجذر الموقع (بدون `/` في البداية ولا `../`). العناصر بدون `href` تظهر معطلة (Placeholder). قيمة `href` غير الصالحة تُرفض مع تحذير `[BUI docs]` في Console.

## تعديل المعمارية
أي تعديل على هذا الهيكل يتطلب: سبب مكتوب هنا، وإدخال في CHANGELOG، وموافقة المالك إذا كان يغير مسارات عامة.
