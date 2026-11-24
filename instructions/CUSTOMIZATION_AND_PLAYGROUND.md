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

## التنفيذ (الإطار منفذ في Task 08)
- الإطار docs-only ولا يعرف أي مكون: `documentation/assets/js/playground.js` و`documentation/assets/css/playground.css`. كل صفحة تعرّف **Schema** لخياراتها، وهذه الخيارات خاصة بالمكون. إضافة Playground لمكون جديد = كتابة Schema فقط.
- لا مكتبات خارجية. عناصر التحكم عناصر HTML أصلية منسقة بـ `bui-docs-*` و`bui-docs-playground*` إلى أن تُبنى Form Controls المكتبة. ترقيتها لاستخدام مكونات المكتبة ضمن مهمة ترقية Shell التوثيق.
- الأسماء `BUI_DOCS_PLAYGROUND` و`BUI_DOCS_HELPERS` (يضيفه `docs.js`) متغيرات عامة للتوثيق فقط وليست جزءاً من API المكتبة.

## استخدام الإطار في صفحة
ترتيب التحميل: `playground.css` بعد `docs.css`، و`playground.js` **بعد** `docs.js` (يعتمد على `BUI_DOCS_HELPERS` للتلوين والنسخ). الصفحات التي بلا Playground لا تحمّل الملفين.

```html
<link rel="stylesheet" href="../../documentation/assets/css/playground.css">
...
<h2 id="customize">02. Customize</h2>
<div data-docs-playground="my-widget"></div>
...
<script src="../../documentation/assets/js/docs.js"></script>
<script src="../../documentation/assets/js/playground.js"></script>
<script>
    BUI_DOCS_PLAYGROUND.define('my-widget', {
        controls: [
            { type: 'select', name: 'variant', label: 'Variant', default: 'primary',
              options: [{ value: 'primary', label: 'Primary' }, { value: 'secondary', label: 'Secondary' }] },
            { type: 'text', name: 'label', label: 'Label', default: 'Save', maxLength: 24 }
        ],
        template: function (state, h) {
            return '<my-widget class="bui-my-widget--' + state.variant + '">' + h.escape(state.label) + '</my-widget>';
        }
    });
</script>
```
`my-widget` مكون افتراضي للتوضيح فقط، لا مكون منفذ باسمه. محتوى عنصر `data-docs-playground` يُستبدل عند التركيب.

## شكل الـ Schema
```js
{
    title: 'Playground',        // اختياري: الاسم المتاح لقارئ الشاشة للمجموعة
    controls: [ /* عناصر التحكم، يمكن أن تكون فارغة */ ],
    template: function (state, helpers) { /* مطلوب */ },
    beforeRender: function (frame) {},          // اختياري
    afterRender: function (frame, state) {}     // اختياري
}
```

### عناصر التحكم (`controls`)
المشترك: `type` و`name` و`label` (مطلوبة) و`default` (اختياري). `name` يبدأ بحرف أو `_` ويتكون من حروف وأرقام و`_` و`-`، وفريد داخل الـ Schema. `label` نص ظاهر دائماً.

| type | حقول إضافية | قيمة الحالة | الافتراضي إن حُذف `default` |
|------|-------------|-------------|------------------------------|
| `select` | `options` | string | أول خيار |
| `radio-group` | `options` | string | أول خيار |
| `checkbox` | - | boolean | `false` |
| `switch` | - | boolean | `false` |
| `range` | `min` و`max` (مطلوبان)، `step` (1)، `unit` | number | `min` |
| `number` | `min` و`max` و`step` (اختيارية) | number | `min` أو 0 |
| `text` | `maxLength`، `placeholder` | string | سلسلة فارغة |
| `color` | - | string بصيغة `#rrggbb` | `#000000` |

- `options`: مصفوفة غير فارغة من نصوص أو `{ value, label }`، وقيمها فريدة وتُخزن كنصوص.
- قيمة `default` غير صالحة تُنتج تحذيراً في Console وتعود لقيمة آمنة. Control غير صالح (نوع مجهول، اسم مكرر، بلا label) يُتخطى مع خطأ واضح في Console دون كسر البقية. Schema بلا `template` لا تُركّب ويرجع `mount` القيمة `null`.
- `number`: أثناء الكتابة تبقى الحالة على آخر قيمة صالحة إن كان المدخل فارغاً أو خارج الحدود (مع `aria-invalid`)، وعند مغادرة الحقل يُقصّ للحدود ويُعاد عرض القيمة.

### قالب الكود (`template`)
`template(state, helpers)` دالة تأخذ نسخة من الحالة وتُرجع إما نص HTML أو `{ html, js }` (`js` اختياري).
- `html` هو نفسه ما يُعرض في المعاينة وما يظهر في Code Output، فلا يختلفان. `js` يظهر في كتلة JavaScript مستقلة بزر Copy خاص بها، وتُخفى الكتلة حين لا يوجد `js`.
- **لا تدرج قيم `text` في HTML إلا عبر `helpers.escape()`**: قيم `select`/`radio-group` تُقيّد بالخيارات المعلنة، و`color` بصيغة `#rrggbb`، و`number`/`range` بأرقام، أما `text` فنص حر.
- الإزاحة الزائدة تُزال في العرض فقط، فاكتب القالب بتنسيق مرتب.
- إن رمى `template` استثناءً تبقى آخر معاينة سليمة ويظهر تنبيه، ويتعافى الإطار عند أول حالة صالحة.

### Hooks للمكونات ذات JavaScript (اختيارية)
المعاينة تُبنى بـ `innerHTML` (لا تُنفذ سكربتات). لتهيئة مكون يحتاج JS داخل المعاينة:
- `beforeRender(frame)`: قبل كل إعادة رسم وعند `destroy()`؛ أنسب مكان لتدمير نسخ المكون.
- `afterRender(frame, state)`: بعد كل رسم؛ أنسب مكان لتهيئة المكون على `frame`.

المسؤولية على كاتب الصفحة أن يطابق JS المعروض في Code Output ما تفعله الـ Hooks. اختُبرت الـ Hooks مع مكون JS حقيقي في Task 12 (Chromium فقط): Input يدمّر ويهيّئ `password-toggle` بها (`BUI.destroy(frame)` في `beforeRender` و`BUI.init(frame)` في `afterRender`)، وCheckbox يضبط `indeterminate` في `afterRender` ويعرض سطر `js` في Code Output. لم تُختبر في Safari/Firefox. نمط Schema المرجعي لمكون CSS فقط في [COMPONENT_DEVELOPMENT.md](COMPONENT_DEVELOPMENT.md).

## واجهة الإطار
| الدالة | الوصف |
|--------|-------|
| `BUI_DOCS_PLAYGROUND.define(name, schema)` | يركّب Schema في كل عنصر `data-docs-playground="name"` ويرجع مصفوفة النسخ. يحذّر إن لم يوجد عنصر. |
| `BUI_DOCS_PLAYGROUND.mount(element, schema)` | تركيب مباشر على عنصر. يرجع النسخة أو `null`. التركيب مرتين على العنصر نفسه يحذّر ويرجع النسخة الموجودة. |
| `BUI_DOCS_PLAYGROUND.escape(text)` | تهريب HTML (`& < > " '`). |

النسخة: `getState()` نسخة من الحالة، `setState(partial)` يطبّق قيماً صالحة ويتجاهل غيرها بتحذير، `reset()` يعيد الخيارات، `resetPreview()` يعيد المعاينة، `destroy()` يزيل الواجهة والمستمعين (آمن للتكرار)، و`element` الجذر.

## سلوك المعاينة
- **Light/Dark وRTL/LTR** يُطبّقان على حاوية المعاينة فقط (`data-bui-mode` و`dir`) ولا يمسان `<html>` ولا الصفحة. القيمة الابتدائية تتبع وضع الصفحة واتجاهها وقت التركيب، ثم تصبح مستقلة. Code Output لا يتأثر بهما (ليسا جزءاً من الكود المنسوخ).
- الحاوية تعكس أيضاً `data-bui-theme` للصفحة وتتبع تغييره، لأن Dark الخاص بـ Theme يتطلب الوسمين على العنصر نفسه ([RTL_LTR_AND_THEMES.md](RTL_LTR_AND_THEMES.md)). هذه إضافة على ما ذكر المتطلب الأصلي وسببها صحة Dark داخل Theme غير الافتراضي.
- **العرض**: أزرار Full وBase 320 وXS..XXXL (القيم تُقرأ من `--bui-bp-*`) ومقبض سحب/كيبورد (أسهم ±10، Shift+أسهم ±50، Home/End، وتنعكس الأسهم في RTL). الحدود من 320 إلى أكبر Breakpoint. عرض الحاوية يطابق المطلوب فعلاً، وإن زاد عن عمود الصفحة تتمرر **منطقة العرض** أفقياً داخلياً دون Overflow للصفحة وتصبح منطقة مسماة قابلة للتركيز.
- **Reset options** يعيد القيم الافتراضية. **Reset preview** يعيد الوضع والاتجاه من الصفحة الحالية والعرض إلى Full.
- **قارئ الشاشة**: منطقة `role="status"` مهذبة (`polite`). رسالة قصيرة بعد توقف التغيير 700ms ("Code updated. Variant: Secondary.") لا تتضمن الكود، فالتغييرات السريعة المتتالية تنتج إعلاناً واحداً. تغيير الوضع/الاتجاه/العرض وReset وCopy تُعلن فوراً. نصوص واجهة الإطار إنجليزية ثابتة كباقي Shell التوثيق ولا تدخل ملفات i18n.
- الـ Playground لا يضيف عناوين `h2/h3` فلا يلوث "On this page"؛ عناوين أقسامه `role="heading"`.

## قيد معروف: Responsive Preview هي حاوية وليست Viewport
تغيير عرض الحاوية لا يغيّر نتيجة `@media`، لأن الـ Media Queries تتبع نافذة المتصفح لا الحاوية (والمكتبة لا تستخدم Container Queries). مُحقق آلياً: عند Viewport 1280 تبقى أعمدة `.bui-col-md-6` جنباً إلى جنب داخل حاوية 320، وعند Viewport 600 تتكدس مهما كان عرض الحاوية. لذلك المعاينة صالحة لفحص تمدد المحتوى وقصه وتمريره داخل عرض معين، وليست بديلاً عن فتح الصفحة بعرض الجهاز لفحص سلوك Breakpoints. بدائل مستقبلية (تحتاج قراراً): معاينة داخل `iframe` أو اعتماد Container Queries في المكونات.

## تخصيص المستخدم (للتوثيق لاحقاً)
Tokens عبر CSS Variables، Themes ([RTL_LTR_AND_THEMES.md](RTL_LTR_AND_THEMES.md))، خيارات JS/HTML لكل مكون.
