# قالب صفحة توثيق Component

> يُنسخ المحتوى كهيكل لصفحة `documentation/components/{name}.html`. الأقسام والترتيب إلزامية. العناوين بالإنجليزية.

```text
# {Component Name}
وصف من جملة واحدة.

## 01. Installation & Include
- الملفات المطلوبة وترتيب التحميل (Core ثم Extension ثم Theme اختياري)
- مثال كامل قابل للنسخ

## 02. Customize
- Playground خاص بالمكون: Sizes/Colors/Variants/States/Options/Responsive/Light-Dark/RTL-LTR (ما ينطبق)
- Preview حي + Code Output + Copy + Reset
- يُبنى بالإطار المشترك بكتابة **Schema فقط** ([CUSTOMIZATION_AND_PLAYGROUND.md](../CUSTOMIZATION_AND_PLAYGROUND.md)). كل خيار يقابل خيار حقيقي موثق في قسم 04 و06. مثال الاستخدام في الصفحة (`{component}` و`{option}` و`{value}` placeholders تُستبدل بقيم المكون الفعلي):

```html
<!-- في <head> بعد docs.css -->
<link rel="stylesheet" href="../../documentation/assets/css/playground.css">

<!-- في قسم 02 -->
<div data-docs-playground="{component}"></div>

<!-- آخر <body>، بعد docs.js وبعد سكربتات المكتبة -->
<script src="../../documentation/assets/js/playground.js"></script>
<script>
    BUI_DOCS_PLAYGROUND.define('{component}', {
        controls: [
            // types: select | radio-group | checkbox | switch | range | text | number | color
            { type: 'select', name: '{option}', label: '{Option label}', default: '{value}',
              options: [{ value: '{value}', label: '{Value label}' }] }
        ],
        // يرجع HTML (وJS اختيارياً). نفس الـ HTML يُعرض في المعاينة وفي Code Output.
        template: function (state, h) {
            return '<div class="bui-{component} bui-{component}--' + state.{option} + '">...</div>';
        }
        // اختياري للمكونات ذات JS: beforeRender(frame) و afterRender(frame, state)
    });
</script>
```
- أي قيمة `text` تدخل HTML تمر عبر `h.escape()`.

## 03. Default
- أقل كود لتشغيل المكون

## 04. Variants & Options
- جدول Variants/Sizes/States
- جدول Options: الاسم | النوع | الافتراضي | HTML Attribute | الوصف

## 05. Examples
- أمثلة عملية (كل مثال: عرض + كود)

## 06. JavaScript API
- Initialization (HTML / JS)
- Methods | Events | Options
- (أو: "CSS only, no JavaScript API")

## 07. Responsive Behavior
- السلوك لكل Breakpoint ذي صلة

## 08. Accessibility
- Keyboard | ARIA | Screen Reader
```

## قائمة تحقق قبل التسليم
- [ ] الأقسام الثمانية بالترتيب
- [ ] Playground قسم 02 بـ Schema ويحمّل `playground.css` و`playground.js` (بعد `docs.js`)
- [ ] الأمثلة تعمل RTL/LTR وLight/Dark
- [ ] لا Emojis، لا محتوى وهمي
- [ ] الرابط مفعل في `nav.js`، وRegistry محدث
