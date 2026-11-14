# نظام الأيقونات

> الحالة: **غير منفذ**. لا توجد مجموعة أيقونات ولا مكتبة خارجية معتمدة. مجلدا `assets/icons/` و`assets/fonts/` فارغان. ممنوع استخدام مكتبة أيقونات خارجية ضمن المكتبة دون قرار موثق وموافقة.

## ممنوع Emojis
في الوثائق والأمثلة والمكونات والتنقل والأزرار والتنبيهات والـ Empty States وأي واجهة. الأيقونات من المكتبة فقط.

## التسمية
```html
<i class="bui-icon-thin bui-icon-airplane-in-flight"></i>
<i class="bui-icon-light bui-icon-airplane-in-flight"></i>
<i class="bui-icon-regular bui-icon-airplane-in-flight"></i>
<i class="bui-icon-solid bui-icon-airplane-in-flight"></i>
<i class="bui-icon-bold bui-icon-airplane-in-flight"></i>
<i class="bui-icon-duotone bui-icon-airplane-in-flight"></i>
```
- فئة الوزن: `bui-icon-{weight}`، والاسم: `bui-icon-{kebab-name}`.
- الأوزان: `thin`, `light`, `regular`, `solid`, `bold`, `duotone`.
- **الوزن الافتراضي: `light`**: عند حذف فئة الوزن يُعامل كـ light (مستقبلي: تحدد الآلية عند التنفيذ).
- الأسماء بحروف صغيرة وشرطات، وصفية للمعنى لا للشكل حيثما أمكن، وفريدة.

## الإضافة والتحميل (مستقبلي، تُحدد التقنية بقرار)
- مصدر واحد لكل أيقونة (SVG) في `assets/icons/{weight}/{name}.svg` أو Font في `assets/fonts/`، والتقنية تُقرر قبل أول تنفيذ (SVG Sprite/CSS Mask/Icon Font) مع الموازنة بين الأداء وتلوين `currentColor` ودعم duotone.
- لا تكرر أيقونة بأوزان غير متسقة؛ أي إضافة تشمل كل الأوزان أو تُوثق الناقص.
- ملف CSS الخاص بالأيقونات: يُحدد هل هو جزء من Core أو Extension (يفضل Extension إن كبر).
- كل إضافة تُسجل في قائمة الأيقونات وتوثق في صفحة Icons.

## الاستخدام والـ RTL
- الأيقونات ترث `currentColor` و`font-size`.
- الأيقونات الاتجاهية تنعكس في RTL بفئة مساعدة (مثل `bui-icon-flip-rtl`)؛ غير الاتجاهية (ساعة، شعار) لا تنعكس.

## Accessibility
- زخرفية: `aria-hidden="true"`.
- ذات معنى منفردة (زر أيقونة): `aria-label` من i18n على الزر، أو نص `visually-hidden`.
- لا يعتمد المعنى على الأيقونة وحدها في السياقات الحرجة.

## ملاحظة موقع التوثيق الحالي
واجهة التوثيق الحالية لا تستخدم أي أيقونات (مؤشرات الـ Sidebar ورمز القائمة مرسومة بـ CSS). عند توفر الأيقونات تُستبدل بها في مهمة مستقلة.
