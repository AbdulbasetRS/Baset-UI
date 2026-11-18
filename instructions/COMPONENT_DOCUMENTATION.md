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

## استثناء: صفحات غير Components (Task 03)
صفحات Layout وCustomization (Breakpoints, Container, Grid, Flexbox, Spacing, Colors, Typography, CSS Variables) ليست Components، فالأقسام الثمانية غير مطلوبة لها. تُبنى بنفس قالب الصفحة وتتبع روح المعيار: Overview وجداول مرجعية وExamples حية بكود مولَّد، ثم Responsive Behavior وAccessibility حيثما ينطبق. حُذفت الأقسام غير المنطبقة (Installation, Customize Playground, JavaScript API) عمداً.

### عناصر قيم حية (Docs-only)
- `<span data-docs-token="--bui-x" data-docs-mode="light|dark">`: يملأه `docs.js` بالقيمة المحسوبة للـ Token من عنصر Probe مخفي بالوضع المحدد (الافتراضي light). ممنوع كتابة قيم Tokens يدوياً في الصفحات.
- `<tr data-docs-contrast data-fg="--bui-color-a" data-bg="--bui-color-b" data-min="4.5">` مع خليتين `data-docs-cell="light"` و`data-docs-cell="dark"`: يحسب `docs.js` نسبة التباين (WCAG) ويكتب النتيجة والنص Pass/Fail. `[data-docs-contrast-summary]` يلخصها.
- `data-docs-theme="ocean"` (اختياري، على خلية القيمة أو صف التباين): يقرأ القيمة لثيم محدد بدل ثيم الصفحة الحالي (Task 06). بدونه تُقرأ القيم لثيم الصفحة وتُحدَّث عند `bui:theme:change`.
- `[data-docs-current-bp]`: يعرض Breakpoint الحالي من Tokens `--bui-bp-*`.
- أصناف العرض `bui-docs-demo-*` وSwatches في `docs.css` خاصة بالموقع.

## إجراءات إضافة صفحة
1. انسخ [templates/DOC_PAGE_TEMPLATE.html](templates/DOC_PAGE_TEMPLATE.html) إلى `documentation/{folder}/{kebab-name}.html` (المجلد والاسم: [ARCHITECTURE.md](ARCHITECTURE.md)، قسم "صفحات التوثيق")، واملأ المحتوى حسب [templates/COMPONENT_DOCUMENTATION_TEMPLATE.md](templates/COMPONENT_DOCUMENTATION_TEMPLATE.md). لا تغيّر `data-root` ولا روابط CSS/JS ما دامت الصفحة بعمق مجلدين.
2. فعّل الرابط في `documentation/assets/js/nav.js` فقط: استبدل `'Button'` بـ `{ title: 'Button', href: 'documentation/components/button.html' }` (الصيغة الكاملة في رأس `nav.js`).
3. تحقق أن العنصر يظهر Active في Sidebar مع فتح قسمه، وأن Breadcrumb وPrevious/Next و"On this page" صحيحة.
4. حدّث [COMPONENTS_REGISTRY.md](COMPONENTS_REGISTRY.md) إلى Documented.

## عقد عناصر الصفحة (Docs-only)
كل ما يلي بادئته `bui-docs-*` وهو ليس API للمكتبة. يبنيه ويحسّنه `documentation/assets/js/docs.js` ويُنسَّق في `documentation/assets/css/docs.css`.

### هيكل الصفحة
```html
<main class="bui-docs-main" id="bui-docs-main" tabindex="-1">
  <div class="bui-docs-page">
    <div class="bui-docs-page__body">
      <header class="bui-docs-page-header">
        <nav class="bui-docs-breadcrumb" aria-label="Breadcrumb" data-docs-breadcrumb hidden></nav>
        <h1>Title</h1>
        <p class="bui-docs-lead">One sentence.</p>
      </header>
      <div class="bui-docs-content"> ...sections... </div>
    </div>
  </div>
</main>
```
- Navbar وSidebar وFooter وSkip Link تُبنى تلقائياً حول `<main>`، ولا تُكتب في الصفحة.
- Breadcrumb وPrevious/Next و"On this page" تُولَّد تلقائياً: Breadcrumb وPrevious/Next من `nav.js` (تظهر فقط لصفحة مسجلة فيه بـ `href`)، والفهرس من عناوين `h2`/`h3` داخل `.bui-docs-content` (لا يظهر إن كان أقل من عنوانين، ويظهر من عرض 1200px فقط).
- لعناوين `h2`/`h3` بلا `id` يُولَّد `id` من النص (`Auto Id` ← `auto-id`، والتكرار `-2`). عناوين `h2`/`h3` داخل `.bui-docs-example` لا تدخل الفهرس. يُضاف لكل عنوان رابط Anchor تلقائي.

### Anchors الثابتة لصفحة Component
تُكتب صراحة في الصفحة ولا تُترك للتوليد التلقائي، وكل رابط داخلي أو خارجي يعتمد عليها:

| القسم | `id` |
|---|---|
| 01. Installation & Include | `installation-include` |
| 02. Customize | `customize` |
| 03. Default | `default` |
| 04. Variants & Options | `variants-options` |
| 05. Examples | `examples` |
| 06. JavaScript API | `javascript-api` |
| 07. Responsive Behavior | `responsive-behavior` |
| 08. Accessibility | `accessibility` |

### Example Block
```html
<div class="bui-docs-example">
  <div class="bui-docs-example__preview"> live markup </div>
</div>
```
- يُولَّد كود HTML تلقائياً من محتوى `__preview` كما هو عند تحميل الصفحة، فالمعروض هو ما يعمل فعلاً، ويُضاف زر Copy.
- لأمثلة تُهيَّأ بـ JavaScript، أو عندما يختلف الكود المعروض عن الـ HTML الحي، أضف داخل الـ Example كتلة كود صريحة (`<pre class="bui-docs-code">` أدناه) فلا يُولَّد كود تلقائي.
- المعاينة تتمرر أفقياً داخلها عند العرض الضيق، ولا تسبب Overflow للصفحة.

### Code Block
```html
<pre class="bui-docs-code" data-lang="html"><code>&lt;button class="bui-button"&gt;Save&lt;/button&gt;</code></pre>
```
- `data-lang`: `html` | `css` | `javascript` | `json` | `bash` | `text` (الافتراضي `text` بلا تلوين).
- يجب تهريب `<` و`&` داخل `<code>` (`&lt;` و`&amp;`).
- الكود يُعرض دائماً من اليسار لليمين (`dir="ltr"`) حتى داخل صفحة RTL، ويضاف شريط فيه اللغة وزر Copy.
- Copy: Clipboard API عند توفره (سياق آمن) ثم `execCommand` كبديل، وإن فشلا يظهر "Copy failed" ويُحدَّد الكود لنسخه يدوياً. النتيجة تُعلن لقارئ الشاشة.
- التلوين ذاتي وخفيف (بلا مكتبات)، ليس Parser كاملاً.

### Callouts
```html
<div class="bui-docs-callout bui-docs-callout--note" role="note">
  <p class="bui-docs-callout__title">Note</p>
  <p>Text.</p>
</div>
```
الأنواع: `bui-docs-callout--note` (الافتراضي) و`bui-docs-callout--warning`. العنوان النصي (`Note` / `Warning`) إلزامي لأن المعنى لا يعتمد على اللون وحده.

### جداول Options / Methods / Events
```html
<table class="bui-docs-table">
  <caption class="bui-docs-sr-only">Component options</caption>
  <thead><tr><th scope="col">Name</th><th scope="col">Type</th><th scope="col">Default</th><th scope="col">HTML attribute</th><th scope="col">Description</th></tr></thead>
  <tbody>...</tbody>
</table>
```
- يُغلَّف الجدول تلقائياً بحاوية تتمرر أفقياً. الأعمدة المطلوبة لكل نوع جدول في القسم الأول من هذا الملف. `caption` المخفي بصرياً يعطي الجدول والمنطقة اسماً لقارئ الشاشة.
- أي منطقة (كود/جدول/معاينة) تتجاوز عرضها تصبح تلقائياً قابلة للتركيز بالكيبورد (`tabindex="0"` و`role="region"` مع `aria-label`)، وتعود عادية حين لا تتجاوز.

## ما لا يُوثَّق
ميزات غير منفذة أو غير مختبرة.
