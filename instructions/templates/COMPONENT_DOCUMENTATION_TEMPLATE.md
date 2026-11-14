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
- [ ] الأمثلة تعمل RTL/LTR وLight/Dark
- [ ] لا Emojis، لا محتوى وهمي
- [ ] الرابط مفعل في `nav.js`، وRegistry محدث
