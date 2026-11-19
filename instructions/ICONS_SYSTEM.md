# نظام الأيقونات

> الحالة (Task 07): **منفذ**. المصدر: Phosphor Icons 2.1.1 (MIT). التقنية: SVG Mask بالفئات. الملف: Extension (CSS فقط) `assets/css/extensions/baset-ui-icons.css`. التوثيق الموجه للمستخدمين: `documentation/advanced/icons.html` (كتالوج تفاعلي). الترخيص والإسناد: `THIRD_PARTY.md`.

## ممنوع Emojis
في الوثائق والأمثلة والمكونات والتنقل والأزرار والتنبيهات والـ Empty States وأي واجهة. الأيقونات من المكتبة فقط. واجهة التوثيق الحالية (Navbar وSidebar) ما زالت بلا أيقونات (مؤشرات مرسومة بـ CSS)، واستبدالها مهمة لاحقة مستقلة.

## القرارات (Task 07، بموافقة المالك)
1. **المصدر: Phosphor (MIT).** السبب: التسمية (`airplane-in-flight`) والأوزان الستة تطابقه حرفياً. الملفات تُنسخ مرة واحدة إلى `assets/icons/` ولا يُحمَّل شيء منه وقت التشغيل ولا يُعد Dependency. الأوزان: `solid` = "fill" في Phosphor.
2. **التقنية: SVG Mask بالفئات.** السبب: الوحيدة التي تحقق صيغة `<i class="bui-icon-light bui-icon-x">` دون Build ودون Dependencies. الـ SVG يُضمَّن في CSS كـ `data:` URI، فلا طلبات إضافية. Icon Font يحتاج أداة توليد خطوط (Dependency)، وSVG Sprite لا يعمل بفئات على `<i>`.
3. **Duotone بلا طبقتين.** أثناء التنفيذ تبين أن القناع يحتفظ بقناة alpha، وأيقونة Phosphor duotone تحتوي شكلاً بـ `opacity="0.2"` ومساراً كاملاً، فيظهر النغمتان بقناع واحد (الشكل الخلفي بـ 20% من اللون الحالي). تقدير سابق في عرض القرار (طبقتان `::before/::after` وحجم مضاعف) كان خاطئاً وصُحح هنا.
4. **الملف Extension لا Core**، حسب معايير [CORE_ASSETS.md](CORE_ASSETS.md): حجمه أكبر بكثير من حد 15KB، ولا تحتاجه معظم الصفحات (شرطان). CSS فقط، **بلا تسجيل `BUI.register`** (لا JavaScript).
5. **قلب RTL يدوي بفئة `bui-icon-flip-rtl`** وليس تلقائياً، لأن الأيقونة نفسها قد تكون حرفية أو دلالية. الكتالوج يعلّم الاتجاهية ويضيف الفئة لكودها المولَّد.

## التسمية والاستخدام
```html
<i class="bui-icon-light bui-icon-airplane-in-flight" aria-hidden="true"></i>
<i class="bui-icon-solid bui-icon-x bui-icon-lg" aria-hidden="true"></i>
<i class="bui-icon-regular bui-icon-arrow-right bui-icon-flip-rtl" aria-hidden="true"></i>
```
- `bui-icon-{weight}`: `thin`, `light`, `regular`, `solid`, `bold`, `duotone`. **الافتراضي `light`**: اسم الأيقونة وحده يرسم light.
- `bui-icon-{name}`: kebab-case، وصفي، فريد. أسماء محجوزة لا تصلح كأسماء أيقونات: الأوزان الستة و`sm` و`md` و`lg` و`xl` و`flip-rtl`.
- `bui-icon-{size}`: `sm` و`md` و`lg` و`xl` (من Tokens `--bui-icon-size-sm|md|lg|xl` المشتقة من مقياس المسافات: 1 و1.5 و2 و3 rem). بدونها الحجم `1em`.
- اللون = `currentColor` (لون النص). لا توجد أدوات ألوان بعد، فتُضبط `color` بـ Token على العنصر أو أبيه.
- وزن بلا اسم أيقونة لا يرسم شيئاً (لا مربع ممتلئ).
- خصائص `--bui-icon-{weight}-src` و`--bui-icon-size` داخلية (مسجلة بـ `@property` بلا وراثة) وليست API.

## المجموعة الأولية (51 أيقونة)
القائمة النهائية في `assets/icons/icons.json` (مصدر الحقيقة، يعرضها الكتالوج). اختيرت لتغطي المكونات القادمة: x, check, plus, minus، الأسهم والأقواس (caret-up/down/left/right، caret-double-left/right، caret-up-down، arrow-up/down/left/right)، حالات التنبيه (info, warning, warning-circle, check-circle, x-circle, question)، magnifying-glass, calendar-blank, clock, list, dots-three, dots-three-vertical, trash, pencil-simple, gear, user, house, funnel, download-simple, upload-simple, copy, eye, eye-slash, star, heart, bell, envelope, link, sun, moon, sort-ascending, sort-descending, arrows-clockwise, map-pin, airplane-in-flight, image.
- الاتجاهية (تُقلب في RTL): `caret-left`, `caret-right`, `caret-double-left`, `caret-double-right`, `arrow-left`, `arrow-right`.
- ما عداها يُضاف لاحقاً بالإجراء أدناه.

## Adding an icon (إجراء إضافة أيقونة)
الأداة: `tools/build-icons.js` (Node فقط، بلا Dependencies).
1. ضع SVG لكل وزن في `assets/icons/{weight}/{name}.svg` (الأوزان الستة كلها، أو يفشل المولّد ويذكر الملف الناقص). كل ملف يحتاج `xmlns` و`viewBox`، ولا يحتوي سكربتات أو روابط أو صوراً مضمنة (يرفضها المولّد).
2. أضف عنصراً في `assets/icons/icons.json`: `name` و`directional` (إلزاميان) و`categories` و`tags` (اختياريان للبحث).
3. شغّل `node tools/build-icons.js` ثم `node tools/build-icons.js --check`.
4. إن لم يكن المصدر Phosphor فأضف ترخيصه إلى `THIRD_PARTY.md`.
5. راجع الأيقونة في الكتالوج (كل الأوزان، RTL، Light/Dark)، وحدّث `CHANGELOG.md`.
- الملفان المولَّدان: `assets/css/extensions/baset-ui-icons.css` و`documentation/assets/js/icons-data.js`. لا يُعدَّلان يدوياً. `--check` يفشل إن كان أحدهما قديماً.
- لا تكرر أيقونة بأوزان غير متسقة؛ أي إضافة تشمل كل الأوزان.

## الحجم
قيس في Task 07: `baset-ui-icons.css` = 149,674 بايت خام و28,515 gzip لـ 51 أيقونة بستة أوزان (نحو 3KB خام لكل أيقونة). كل وزن لكل أيقونة داخل الملف حتى لو استخدمت الصفحة وزناً واحداً. تقليله (ملف مخصص لمجموعة أصغر) قرار للمالك، غير منفذ.

## الاستخدام والـ RTL
- الأيقونات ترث `currentColor` و`font-size` (حجم `1em`).
- `bui-icon-flip-rtl` يطبق `transform: scaleX(-1)` بـ `:dir(rtl)` (نفس قرار translate-middle في Task 04، يتطلب متصفحاً حديثاً). الأيقونات غير الاتجاهية (ساعة، شعار) لا تأخذه.

## Accessibility
- زخرفية: `aria-hidden="true"` (الافتراضي في كل الأمثلة).
- زر أيقونة: الاسم على **الزر** (`aria-label` من i18n أو نص `bui-visually-hidden`)، والأيقونة داخله `aria-hidden`.
- أيقونة معلوماتية خارج عنصر تحكم: `role="img"` و`aria-label`.
- لا يعتمد المعنى على الأيقونة وحدها في السياقات الحرجة. التباين = تباين لون النص (3:1 للأيقونة ذات المعنى).
- Forced Colors: الأيقونة خلفية مرسومة فيستبدلها المتصفح، لذلك يعيد CSS تلوينها بـ `CanvasText` مع `forced-color-adjust: none`. الطباعة: `print-color-adjust: exact`.
