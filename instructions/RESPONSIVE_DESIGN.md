# Responsive Design

## Breakpoints الموحدة (إلزامي)
| Name | Min-width | Token (مستقبلي) |
|---|---:|---|
| XS | 480px | `--bui-bp-xs` |
| SM | 576px | `--bui-bp-sm` |
| MD | 768px | `--bui-bp-md` |
| LG | 992px | `--bui-bp-lg` |
| XL | 1200px | `--bui-bp-xl` |
| XXL | 1600px | `--bui-bp-xxl` |
| XXXL | 1920px | `--bui-bp-xxxl` |

ما دون 480px هو الحالة الأساسية (Base). ملاحظة تقنية: CSS Variables لا تعمل داخل `@media`، لذلك تُكتب القيم الرقمية مباشرة في Media Queries، وتبقى الـ Tokens للاستخدام في JavaScript.

## Mobile First (إلزامي)
- الأنماط الأساسية للشاشة الأصغر، ثم `@media (min-width: …)` للتوسيع فقط.
- ممنوع `max-width` Media Queries إلا لحالة خاصة موثقة بتعليق.
```css
.bui-card { padding: var(--bui-space-3); }
@media (min-width: 768px) { .bui-card { padding: var(--bui-space-4); } }
```

## قواعد
- وحدات نسبية (`rem`, `%`, `fr`, `minmax`, `clamp`) بدل البكسل الثابت للتخطيط.
- لا Horizontal Overflow على أي عرض ≥ 320px. المحتوى العريض (جداول/أكواد) يتمرر داخل حاويته.
- أهداف اللمس لا تقل عن 44x44px على الشاشات اللمسية (اقتراح مشدد).
- لا الاعتماد على `:hover` وحده.
- استخدام `prefers-reduced-motion` للحركة.

## سلوك خاص بالمكون
المكونات المعقدة (DataTable, Navbar, Modal) تعرّف سلوكها لكل Breakpoint في قسم **Responsive Behavior** بالتوثيق. إن احتاج JS الاستجابة لتغير العرض، يستخدم `matchMedia` ويزيل المستمع في `destroy()`.

## الاختبار
افحص كل مكون عند: 320، 480، 576، 768، 992، 1200، 1600، 1920 (عرض). وتأكد: لا Overflow، النص مقروء، التفاعل ممكن، RTL سليم. تفاصيل الأدوات في [TESTING.md](TESTING.md).
