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

### إطار Playground (Task 08)
- `documentation/assets/js/playground.js` و`documentation/assets/css/playground.css`: إطار docs-only (الملفان من قائمة المهمة) بلا Dependencies. تحمّلهما صفحات Components التي فيها Playground فقط، ولا يضافان إلى `DOC_PAGE_TEMPLATE.html` كي لا تطلبهما كل صفحة. متغير عام وحيد: `BUI_DOCS_PLAYGROUND`.
- **تعديل `docs.js` (خارج قائمة الملفات المتوقعة، 6 أسطر):** يعرّض `window.BUI_DOCS_HELPERS = { highlight, copyText }`. السبب: Code Output يتغير عند كل خيار، ويجب أن يُلوَّن وينسخ بنفس سلوك بقية الكتل. البديل (مُلوّن ونسخ ثانٍ داخل `playground.js`) يكرر نحو 150 سطراً ويفترق عن `docs.js` مع الوقت. الإطار يعمل بدونه بتدهور لطيف (كود غير ملون، ونسخ عبر Clipboard API).
- المعاينة حاوية وليست `iframe` (قرار المهمة): قيدها (Media Queries تتبع الـ Viewport) موثق في [CUSTOMIZATION_AND_PLAYGROUND.md](CUSTOMIZATION_AND_PLAYGROUND.md).

### Button وButton Group وClose Button (Task 09)
- الكود داخل `assets/css/baset-ui.css` (قسم 6 من [CORE_ASSETS.md](CORE_ASSETS.md))، بلا ملف CSS أو JS جديد في `assets/`. ثلاث صفحات في `documentation/components/` (`button.html` و`button-group.html` و`close-button.html`) مفعلة في `nav.js`. لا مجلدات جديدة.
- **ملف جديد: `tests/manual/button.html`** (خارج قائمة ملفات المهمة). السبب: [TESTING.md](TESTING.md) يطلب Checklist اختبار يدوي لكل مكون في `tests/manual/{component}.html`، والمصفوفة الكاملة Variant x Color x Size x الحالات (ومعها المجموعات وClose Button) لا تتسع في صفحات التوثيق. ملف واحد للمكونات الثلاثة لأنها تتشارك الأصناف والـ Tokens. Fixture معلن، لا يُشحن كمكون ولا يحمّله شيء.
- **الاعتماد:** Close Button يرسم أيقونة `x` من Extension الأيقونات، لكن الاعتماد على مستوى الـ Markup (الأيقونة عنصر داخل الزر) وليس في CSS الـ Core، فيبقى اتجاه الاعتماد سليماً (Core لا يعرف الـ Extension). `[class*="bui-icon-"]` في Button محدد عام.
- صفحات المكونات الثلاث تحمّل `playground.css` و`playground.js` وأيقونات الـ Extension في `<head>` (الأيقونات لازمة لأمثلة الأزرار ذات الأيقونة).
- النمط المرجعي (Tokens والـ CSS والـ Playground Schema) في [COMPONENT_DEVELOPMENT.md](COMPONENT_DEVELOPMENT.md).

### Badge وAvatar وProgress (Task 10)
- الكود في `assets/css/baset-ui.css` (قسم 6) و`assets/js/baset-ui.js`، بلا ملف جديد في `assets/`. ثلاث صفحات في `documentation/components/` (`badge.html` و`avatar.html` و`progress.html`) مفعلة في `nav.js`.
- **JS داخل الـ Core:** `avatar` و`progress` مسجلان في `baset-ui.js` بعد `window.BUI = BUI` (قسم Components shipped with the Core)، لا في ملف Extension، لأنهما مكونان أساسيان صغيران (نحو 9.8 كيلوبايت خام معاً) ويتبعان قاعدة "Core فيه ما يحتاجه كل موقع". Badge لا JS له.
- **ملف جديد: `tests/manual/badge-avatar-progress.html`** (خارج قائمة ملفات المهمة). السبب: [TESTING.md](TESTING.md) يطلب Checklist يدوي لكل مكون في `tests/manual/{component}.html`، ومصفوفة Variant x Color x Size والحالات وحالات الاحتياط لا تتسع في صفحات التوثيق. ملف واحد للثلاثة لأنها صغيرة وتتشارك الصفحة والمبدلات. **Fixtures معلنة** في رأس الملف: صورة SVG مولدة كـ data URI، وصورة معطوبة عمداً (`data:image/png;base64,AAAA`) لاختبار الـ Fallback بلا طلب شبكة ولا 404. لا يُشحن كمكون ولا يحمّله شيء.
- صفحات التوثيق الثلاث تستخدم الـ Fixtures نفسها (صورة مولدة وصورة معطوبة) في أمثلة Avatar وPlayground، وتذكر ذلك في نص الصفحة. كود المثال المعروض يستعمل مساراً وهمياً (`img/sara.jpg`) والمعاينة تستعمل الـ data URI.
- النمط المرجعي في [COMPONENT_DEVELOPMENT.md](COMPONENT_DEVELOPMENT.md) (قسم إضافات Task 10).

### Card وList Group (Task 11)
- الكود في `assets/css/baset-ui.css` (قسم 6: Card بين Button Group وClose Button، وList Group بين Close Button وProgress) بلا ملف جديد في `assets/` وبلا JS. صفحتان في `documentation/components/` (`card.html` و`list-group.html`) مفعلتان في `nav.js`.
- **ملف جديد: `tests/manual/card-list-group.html`** (خارج قائمة ملفات المهمة). السبب: [TESTING.md](TESTING.md) يطلب Checklist يدوي لكل مكون في `tests/manual/{component}.html`، ومصفوفة Variant x Color والتخطيطات الأفقية وStretched Link مع عناصر داخلية وقوائم داخل Cards لا تتسع في صفحات التوثيق. ملف واحد للمكونين لأن قائمة داخل Card تختبرهما معاً. **Fixtures معلنة** في رأس الملف: كل النصوص والأرقام نص عينة، والوسائط SVG مضمن مولد بألوان الـ Tokens بلا ملف ولا طلب شبكة. لا يُشحن كمكون ولا يحمّله شيء.
- أمثلة التوثيق تستعمل SVG مضمناً مولداً بدل صورة، فكود المثال المعروض هو نفسه الذي يعمل (بخلاف Avatar).
- النمط المرجعي في [COMPONENT_DEVELOPMENT.md](COMPONENT_DEVELOPMENT.md) (قسم إضافات Task 11).

### Form Controls وInput وCheckbox وRadio وSwitch (Task 12)
- الكود في `assets/css/baset-ui.css` (قسم 6، بالترتيب الأبجدي) و`assets/js/baset-ui.js` (مكون `password-toggle` الاختياري في قسم Components shipped with the Core، كـ`avatar` و`progress`)، بلا ملف جديد في `assets/`. خمس صفحات في `documentation/components/` (`form-controls.html` و`input.html` و`checkbox.html` و`radio.html` و`switch.html`) مفعلة في `nav.js` تحت قسم Forms (القاعدة: Forms داخل `components/`). لا مجلدات جديدة.
- **ملف جديد: `tests/manual/forms.html`** (خارج قائمة ملفات المهمة). السبب: [TESTING.md](TESTING.md) يطلب Checklist يدوي لكل مكون في `tests/manual/{component}.html`، ومصفوفة النوع x الحجم x الحالة (والتحقق ومجموعات Input وتخطيطات Form Group وترتيب Tab) لا تتسع في صفحات التوثيق. ملف واحد للخمسة لأنها تتشارك الحالات والـ Tokens ولأن Form Group يجمعها. **Fixtures معلنة** في رأس الملف: كل النصوص والقيم نص عينة، بلا صور ولا طلبات شبكة. لا يُشحن كمكون ولا يحمّله شيء.
- المكونات الثلاثة (Checkbox وRadio وSwitch) تشترك في كتلة قواعد واحدة معلنة داخل قسم Checkbox (Selectors مشتركة)، ويضيف Radio وSwitch بعدها ما يخصه فقط. هذا استثناء من "قسم لكل مكون" لأن تكرار الأحجام والـ Label وhover وdisabled والتحقق ثلاث مرات يفرّق الثلاثة مع الوقت.
- صفحات المكونات الخمس تحمّل `playground.css` و`playground.js` وأيقونات الـ Extension في `<head>` (الأيقونات لأمثلة Input Group ومساعد كلمة المرور).
- النمط المرجعي في [COMPONENT_DEVELOPMENT.md](COMPONENT_DEVELOPMENT.md) (قسم إضافات Task 12).

### Dialog وDrawer وOverlay Manager (Task 13)
- الكود في `assets/css/baset-ui.css` (قسم 6: Dialog وDrawer بين Close Button وForm Controls، مع Tokens `--bui-overlay-*` و`--bui-dialog-*` و`--bui-drawer-*` في الطبقة 3) و`assets/js/baset-ui.js` (Overlay Manager قبل `window.BUI = BUI`، والمكونان `dialog` و`drawer` مسجلان بعد `password-toggle`). لا ملف جديد في `assets/`. صفحتان في `documentation/components/` (`dialog.html` و`drawer.html`) مفعلتان في `nav.js`. مفتاح i18n جديد `overlay.loadError`.
- **ملفان جديدان (خارج قائمة ملفات المهمة):** `tests/manual/overlays.html` (السبب: [TESTING.md](TESTING.md) يطلب Checklist يدوي لكل مكون، ومصفوفة الأحجام والأنماط والتداخل والمحتوى الديناميكي لا تتسع في صفحات التوثيق؛ ملف واحد للمكونين لأن Drawer يُفتح فوق Dialog وبالعكس) و`tests/manual/fixtures/overlay-content.html` (**مجلد جديد `tests/manual/fixtures/`**: مقطع HTML صغير بلا ملف CSS أو JS، يلزم لاختبار خيار `url` فعلياً، لأن `fetch` يحتاج عنواناً حقيقياً من نفس الأصل. Fixture معلن، لا يُشحن كمكون ولا يحمّله شيء سوى الصفحة اليدوية). **Fixtures معلنة** في رأس الصفحة: كل النصوص نص عينة.
- **القرار: `<dialog>` الأصلي مقابل التنفيذ المخصص** موثق مع الأدلة في [COMPONENT_DEVELOPMENT.md](COMPONENT_DEVELOPMENT.md) (قسم إضافات Task 13).

### ترقية كتالوج الأيقونات وShell التوثيق (Task 14)
- لا ملفات ولا مجلدات جديدة. التعديل في `documentation/advanced/icons.html` و`documentation/assets/css/docs.css` و`documentation/assets/js/docs.js` و`index.html` وقالب الصفحة.
- **تعديل خارج قائمة الملفات المتوقعة (سببه معماري):** أُضيف `<link>` لـ `assets/css/extensions/baset-ui-icons.css` إلى `<head>` **كل** صفحة توثيق (21 صفحة كانت تفتقده، والبقية تحمّله أصلاً). السبب: الـ Shell يُبنى في كل صفحة ويرسم الآن أيقونات المكتبة، والقاعدة الموثقة أدناه تقضي بأن روابط CSS تُكتب في الصفحة نفسها لأنها تُحمَّل قبل أي JavaScript (حقنها من `docs.js` يسبب وميضاً بلا أيقونات). ثمنه: نحو 28.5KB مضغوطة (149,674 خام) تُحمَّل في كل صفحة توثيق وتُخزَّن مؤقتاً بعد الأولى.
- **الأيقونات:** زر القائمة `bui-icon-regular bui-icon-list` وأيقونة `bui-icon-regular bui-icon-x` في الزر نفسه تتبدلان بـ CSS من `aria-expanded` (الاسم ثابت `Toggle navigation`)، وسهم الأقسام `bui-icon-bold bui-icon-caret-down` يدور 180 درجة بـ CSS عند `aria-expanded="true"`. الأيقونات غير اتجاهية فلا `bui-icon-flip-rtl`. لا زر إغلاق منفصل في الـ Sidebar: أيقونة `x` في زر القائمة نفسه هي الإغلاق (هذا هو تفسير "إغلاق الـ Sidebar" في المهمة).
- **أزرار Navbar:** `bui-btn bui-btn--outline bui-btn--secondary bui-btn--sm` (والتبديل بـ `bui-btn--icon bui-btn--ghost` للقائمة). **قرار:** Button المكتبة لا يملك حالة `aria-pressed`، ولا يجوز تغيير API المكونات في هذه المهمة، فيبدّل `docs.js` الفئة `bui-btn--outline` (غير مضغوط) إلى Variant solid (مضغوط) مع `aria-pressed` للتقنيات المساعدة. حشوة أفقية أضيق تحت SM بإعادة تعريف `--bui-btn-padding-x-sm` على حاوية الـ Navbar (Token عام) لاتساع الصف عند 320px.
- **الكتالوج:** تفاصيل الأيقونة في `<dialog class="bui-dialog" data-bui-dialog>` بدل `<dialog>` الأصلي المنسق بـ `bui-docs-icon-dialog` (حُذفت قواعده). `data-bui-focus` يضع التركيز الأولي على الوزن المحدد (كان زر Close)، وزر الفتح يمرَّر لـ `open()` فيعاد إليه التركيز. أزرار الحوار والـ Checkbox والـ Radio وحقل البحث والتسمية من المكتبة؛ كل وزن بطاقة فيها Radio مرئي بدل Input مخفي. **القائمتان المنسدلتان تبقيان `<select>` أصلية بـ `bui-docs-select`** لأن Select (Task 17) غير منفذ، ولا يجوز تنفيذه هنا.
- **ما بقي docs-only بقرار (خارج نطاق المهمة):** `bui-docs-btn` في أزرار Copy داخل Code Blocks (`docs.js`) وفي عناصر Playground (`playground.js` و`playground.css`) وأمثلة صفحات Themes وDark Mode وRTL & LTR وInternationalization. ترقيتها تحتاج موافقة لأنها تغيّر ملفات خارج القائمة.

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
