# التخصيص والـ Playground

## المبدأ
قسم **Customize** في كل صفحة Component هو Playground تفاعلي **مصمم لذلك المكون تحديداً**. ممنوع فرض لوحة خيارات موحدة على كل المكونات.

## ما يعرضه الـ Playground (حسب طبيعة المكون)
Sizes، Colors، Variants، States، Options، Configurations، Responsive Preview، Light/Dark، RTL/LTR.
أمثلة: Button يعرض Variant/Size/Disabled/Loading؛ DataTable يعرض Pagination/Search/Sorting؛ Modal يعرض Size/Scrollable/Backdrop.

## المتطلبات الإلزامية
1. **Preview حي** يتحدث فور تغيير أي خيار.
2. **Code Output** يعرض HTML (وJS إن لزم) مطابقاً للمعاينة، مع زر Copy.
3. كل خيار في الـ Playground يقابل خيار حقيقي موثق في API. ممنوع خيارات لا يدعمها المكون.
4. مفاتيح تبديل Light/Dark وRTL/LTR تؤثر على المعاينة فقط (عبر `data-bui-mode` و`dir` على حاوية المعاينة).
5. Responsive Preview بعرض قابل للتغيير يطابق Breakpoints ([RESPONSIVE_DESIGN.md](RESPONSIVE_DESIGN.md)).
6. قابل للاستخدام بالكيبورد، وعناصر التحكم لها Labels ([ACCESSIBILITY.md](ACCESSIBILITY.md)).
7. أزرار Reset.

## التنفيذ
- بنية Playground المشتركة (الإطار فقط) تكون في `documentation/assets/js/` و`documentation/assets/css/`، وتقبل **تعريفاً (Schema)** للخيارات من كل صفحة، بينما الخيارات نفسها خاصة بالمكون. (مستقبلي: تحديد شكل الـ Schema في أول مهمة Component.)
- لا يعتمد على مكتبات خارجية دون موافقة.

## تخصيص المستخدم (للتوثيق لاحقاً)
Tokens عبر CSS Variables، Themes ([RTL_LTR_AND_THEMES.md](RTL_LTR_AND_THEMES.md))، خيارات JS/HTML لكل مكون.
