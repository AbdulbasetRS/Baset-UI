# معايير تطوير المكونات

كل Component يتبع نفس المعمارية مع السماح باختلافات منطقية حسب طبيعته. (المنفذ حتى Task 13: Avatar وBadge وButton وButton Group وCard وCheckbox وClose Button وDialog وDrawer وForm Controls وInput وList Group وProgress وRadio وSwitch. النمط المرجعي أدناه من Task 09، وTask 10 اتبعه.)

## قائمة قبل البدء
- التأكد من وجود المكون في [COMPONENTS_REGISTRY.md](COMPONENTS_REGISTRY.md) أو إضافته.
- تحديد: Core أم Extension ([CORE_ASSETS.md](CORE_ASSETS.md)).
- تحديد هل يحتاج JavaScript أم CSS فقط (CSS فقط هو الأفضل متى أمكن).

## طرق التهيئة
عندما تناسب المكون، تُدعم الطريقتان وتعطيان نفس النتيجة:

**HTML Attributes**
```html
<select data-bui-select="remote" data-bui-url="/api/users" data-bui-per-page="10"></select>
```
**JavaScript**
```javascript
const select = BUI.select.remote('#users', { perPage: 10 });
```
لا يُفرض أسلوب واحد على كل المكونات. المكون الذي لا معنى لـ JS فيه (مثل Badge) يبقى CSS فقط. التهيئة التلقائية من HTML تتم عبر `BUI.init()` (منفذ في Task 05، انظر [JAVASCRIPT_API.md](JAVASCRIPT_API.md)). المكون يسجل نفسه بـ `BUI.register(name, definition)`.

## Lifecycle (إلزامي للمكونات ذات JS)
1. **Create/Init:** قراءة الخيارات بالترتيب: Defaults < HTML Attributes < JS Options. التهيئة مرة واحدة فقط لكل عنصر (تكرار الاستدعاء يُرجع النسخة الموجودة).
2. **Mount:** إضافة ARIA، الأحداث، الحالة الأولية.
3. **Update:** `update(options)` و/أو `refresh()` عند تغير DOM/اللغة/الاتجاه.
4. **Destroy:** `destroy()` يزيل كل المستمعات والمؤقتات والعناصر المضافة ويعيد DOM لحالته الأصلية.

## Configuration & Options
- لكل خيار: اسم camelCase، النوع، القيمة الافتراضية، المقابل في HTML (`data-bui-*`)، وتوثيقه.
- تحقق من صحة الخيارات؛ القيم غير الصالحة تُرجع للافتراضي مع تحذير في Console (انظر Error Handling).

## Events
- أحداث DOM بالصيغة `bui:{component}:{event}` مع `detail`، قابلة للإلغاء عند الحاجة (`before*` events).
- نفس الأحداث تتاح عبر callbacks اختيارية `onOpen` إلخ (اقتراح).

## Methods
واجهة موحدة حيثما انطبقت: `open/close/toggle`، `show/hide`، `update`، `destroy`، `getInstance` (منفذ في الـ Core: `BUI.getInstance(el, name)`). التسمية في [JAVASCRIPT_API.md](JAVASCRIPT_API.md).

## Error Handling
- لا Exceptions تكسر الصفحة بسبب عنصر واحد خاطئ. سجّل `console.warn` برسالة واضحة تبدأ بـ `[BUI]` واذكر المكون والسبب.
- Selector غير موجود: تحذير وإرجاع `null`.

## Memory Management
- كل `addEventListener` له إزالة مقابلة في `destroy()`.
- لا مراجع قوية لعناصر محذوفة؛ استخدم `WeakMap` لتخزين النسخ.
- أوقف `setInterval`/`requestAnimationFrame`/`ResizeObserver`/`MutationObserver` عند Destroy.

## التكامل مع Extensions والنظام
- الاعتماد على Tokens فقط للأشكال ([RTL_LTR_AND_THEMES.md](RTL_LTR_AND_THEMES.md)).
- النصوص الداخلية عبر i18n وليست مكتوبة داخل الكود ([INTERNATIONALIZATION.md](INTERNATIONALIZATION.md)).
- الأيقونات من نظام المكتبة فقط ([ICONS_SYSTEM.md](ICONS_SYSTEM.md)).
- يدعم Keyboard/ARIA ([ACCESSIBILITY.md](ACCESSIBILITY.md)) وResponsive ([RESPONSIVE_DESIGN.md](RESPONSIVE_DESIGN.md)).
- تفاعل المكون مع تغيير Theme/Locale/Direction أثناء التشغيل دون إعادة تحميل.

## تعريف الاكتمال (Definition of Done)
الكود + Documentation بالترتيب الإلزامي + Playground + اختبارات ناجحة + مراجعة RTL/LTR/Light/Dark/Responsive + تحديث Registry.

## النمط المرجعي (Task 09: Button وButton Group وClose Button)
أول مكونات المكتبة. باقي المكونات تتبع هذا النمط ما لم يوجد سبب موثق للخروج عنه.

### التسمية
- Block/Modifier حسب [NAMING_CONVENTIONS.md](NAMING_CONVENTIONS.md): `bui-btn`، `bui-btn--{variant|color|size|block|icon}`. مكون مجموعة له Block خاص (`bui-btn-group`). المكون الافتراضي بلا Modifier (`bui-btn` = solid وprimary وmd)، ولكل قيمة افتراضية Modifier صريح اختياري (`--solid`, `--primary`, `--md`) ليستطيع الـ Playground وكاتب الصفحة التصريح بها.
- **Component Tokens (عامة):** `--bui-{component}-{prop}` وللأحجام `--bui-{component}-{prop}-{sm|md|lg}`، وللمس `--bui-{component}-touch-{prop}-{size}`. تُعرَّف في **الطبقة 3** من `baset-ui.css` (`:root, [data-bui-mode], [data-bui-theme]`) بـ `var()` على Tokens الطبقة 1 و2 فقط (مقاسات وألوان من مقياس المسافات والألوان الدلالية، لا قيم حرة).
- **قيم خاصة:** الاسم الذي يحتوي `_` بعد اسم المكون (`--bui-btn-_bg`) داخلي وليس API ولا يوثق كخيار. تُستخدم لحساب القيمة المطبقة من الـ Modifiers.
- **الألوان ليست Component Tokens:** Modifier اللون يعيّن مجموعة `_accent*` من `--bui-color-{name}*`، فيتحكم الثيم بالمكون عبر Tokens الألوان العامة. Component Tokens للشكل والحجم والحركة والحالات.
- أنماط الحالة: لكل Variant قيم السكون وhover وactive، وقواعد الحالة تبدل ثلاث قيم مطبقة فقط (`_bg-c` و`_fg-c` و`_border-c`).

### بنية CSS داخل `baset-ui.css` (قسم 6، ترتيب أبجدي)
1. تعليق ترويسة يشرح النمط. 2. `@keyframes` بالبادئة `bui-{component}-`. 3. القاعدة الأساسية بكل القيم الافتراضية. 4. Variants ثم Colors ثم Sizes ثم الخيارات (`block`, `icon`). 5. الحالات. 6. `@media (pointer: coarse)` لرفع الأهداف. 7. المكونات المرتبطة (Group) بعد المكون.
- مرجع الحالة: **السمة هي الحالة** حين يوجد معيار (`:disabled`، `[aria-disabled="true"]`، `[aria-busy="true"]`) بدل فئة `is-*` المكررة. الفئة `is-*` للحالات التي لا تقابلها سمة قياسية.
- `:hover` داخل `@media (hover: hover)`. التحريك يستخدم Tokens المدة فيتوقف بـ `prefers-reduced-motion`؛ المؤشرات التي تدل على حالة (Spinner) تُبطأ ولا تتوقف (قاعدة في القسم 8).
- أهداف اللمس: `min-height: max(القيمة العادية, قيمة المس)`. أي ارتفاع يبقى قابلاً للتخصيص بالثيم.
- التلاصق وتبديل التخطيط: أعلام أرقام (`--bui-btn-group-_h`/`_v` بقيمة 0 أو 1) تتحكم بالتداخل وأنصاف الأقطار بـ `calc()`، فتبديل الاتجاه (عمودي أو Stack متجاوب) يغيّر الأعلام و`flex-direction` فقط بلا تكرار القواعد.
- الأيقونات داخل المكون تُحدد بـ `[class*="bui-icon-"]` (محدد عام، بلا اعتماد على ملف الـ Extension). المكون الذي يرسم أيقونة (Close Button) يتطلب الـ Extension في Include ويوثق ذلك. Core لا يعتمد على Extension: الاعتماد على مستوى الـ Markup فقط.
- أحجام المجموعة تتفوق على الحجم في الزر (خصوصية أعلى) ويُوثق ذلك.
- مكون سيوضع داخل غيره (Close Button داخل Alert لاحقاً): ألوانه Tokens عامة يعيد الأب تعريفها على نفسه.

### شكل Playground Schema
- `{ title, controls, template }` فقط (بلا Hooks للمكونات CSS فقط). اسم Schema = اسم المكون (`button`, `button-group`, `close-button`).
- كل خيار يقابل Class أو سمة موثقة في قسم 04. `select` للقيم الكثيرة (Variant وColor وElement)، `radio-group` للأحجام والاتجاه، `switch` للحالات والخيارات المنطقية (`disabled`, `loading`, `block`)، `range` للأعداد (عدد أزرار المجموعة)، `text` للنصوص (يمر عبر `h.escape()`) مثل Label.
- `template` يحذف القيم الافتراضية (لا يطبع `bui-btn--primary` ولا `--md`) فيبقى Code Output هو الحد الأدنى المنسوخ.
- الخيارات التي لا تنطبق على تركيبة (أيقونة على `input`) تُهمل في القالب وتُوثق في فقرة قسم Customize، ولا تُخفى الواجهة ديناميكياً (الإطار لا يدعم الاعتماد بين الخيارات).
- الصفحة تضيف معالج نقر docs-only يمنع قفز `href="#"` داخل المعاينة.
- ترتيب الملفات في `<head>`: `baset-ui.css` ثم Extension الأيقونات ثم الثيم ثم `docs.css` ثم `playground.css`؛ وآخر `<body>`: `baset-ui.js` ثم `nav.js` ثم `docs.js` ثم `playground.js` ثم سكربت الصفحة.

### Fixture الاختبار
`tests/manual/button.html`: يعرض Variant x Color x Size والحالات التي تحتاج سمة (disabled وloading) والعناصر الأخرى وكل تخطيطات المجموعة والـ Close Button، مع مبدلات الثيم والوضع والاتجاه. حالات hover وactive وfocus تُفحص بالمؤشر أو بالكيبورد أو بإجبارها من أدوات المطور.

### إضافات Task 10 (Badge وAvatar وProgress)
- **CSS فقط أم JS صغير:** Badge CSS فقط. Avatar وProgress CSS مع JS **اختياري** مسجل بـ `BUI.register` داخل `baset-ui.js` (قسم Components shipped with the Core). المعيار: JS يُضاف فقط حين لا يستطيع CSS إنجاز السلوك (Avatar: كشف فشل تحميل الصورة؛ Progress: إبقاء `aria-valuenow` و`--bui-progress-value` متطابقين). الصفحة تقول بوضوح "CSS only" في قسم JavaScript API للمكون بلا JS.
- **الحالة:** السمة القياسية حين توجد. Progress غير المحدد = غياب `aria-valuenow` (هذا ما تقوله ARIA، وCSS يقرأه بـ `:not([aria-valuenow])`). Avatar الاحتياطي لا سمة قياسية له، فالحالة فئة `is-fallback` (استثناء مبرر بالقاعدة نفسها في NAMING_CONVENTIONS.md).
- **Logical Properties حصراً** للموضع (`inset-inline-end`) والتداخل (`margin-inline-start` السالب)، فلا فئة RTL. الاتجاه الذي لا تحله الخصائص المنطقية (حركة Progress غير المحدد، وتدرج نص التسمية) يُقلب بـ `:dir(rtl)` على قيمة خاصة (`--bui-progress-_dir`) أو تدرج خاص.
- **اللون ليس الإشارة الوحيدة:** مؤشرات حالة Avatar لكل منها شكل مختلف (نقطة وربع مفقود وشريط وحلقة).
- **Fixture:** `tests/manual/badge-avatar-progress.html` (انظر ARCHITECTURE.md). صور الاختبار مولدة (data URI) ومعلنة في رأس الملف، ولا صور خارجية.

### إضافات Task 11 (Card وList Group)
- **Flags الاتجاه:** `--bui-card-_h/_v` و`--bui-list-group-_h/_v` (1 للصف و0 للعمود وعكسها) تتحكم في تداخل الحدود وانحناء أول وآخر ابن وحجم الوسائط، فالتخطيط الأفقي (دائماً أو من Breakpoint) يقلب الـ Flags واتجاه الـ Flex فقط. انحناءات الأبناء بخصائص منطقية فتصح في RTL بلا قواعد إضافية.
- **الحالة بالسمة:** نشط = `aria-current` (أي قيمة غير `"false"`)، معطل = `disabled` أو `aria-disabled="true"`، بلا فئات `is-*`. قواعد hover/pressed تستثني النشط والمعطل بـ `:where(:not(...))` لتبقى بتخصيص منخفض فلا تتغلب على حالة النشط.
- **تخصيص صفري للتعاون بين المكونات:** رفع العناصر التفاعلية فوق الـ Stretched Link يتم بـ `:where(...)` (تخصيص 0) فلا يكسر مكوناً يحدد موضعه بنفسه. الـ Fallback لغير الداعمين لـ `:has()` في `@supports not selector(:has(*))`.
- **مكون داخل مكون:** الأب يعيد تصريح Tokens الابن على نفسه (Card يعيد تصريح `--bui-list-group-*` لقوائمه) بدل أن يتضمن الابن معرفة بالأب.
- **حلقة التركيز داخل العنصر:** عند تداخل الجيران أو وجود `overflow` عند الأب تُرسم الحلقة بـ `outline-offset` سالب، ولونها يتبدل حيث يطابق لون الحلقة لون الخلفية (العنصر النشط، وCard solid).
- **قيد معلن:** Header وFooter في Card أفقي غير مدعومين كأبناء مباشرين (يصيران عمودين)، و`--flush` في List Group لا يجتمع مع الأفقي. كلاهما موثق في صفحتي التوثيق، وخيارات Playground المتعارضة تُهمل في القالب وتُذكر في فقرة Customize.

### إضافات Task 12 (Form Controls وInput وCheckbox وRadio وSwitch)
- **العنصر الأصلي أولاً:** المكون يرسم `<input>` و`<textarea>` الأصليين (`appearance: none`) ولا يستبدلهما، فيبقى التركيز والإرسال وConstraint Validation API والـ Autofill للمتصفح. لا JavaScript للتحقق: الصفحة تبدّل `is-valid`/`is-invalid`/`aria-invalid` بسكربتها (موثق كمثال لا API).
- **ترتيب العنصر في Markup:** `__input` قبل `__label` (الأخ التالي)، لأن حالة الـ Label المعطل وhover الغلاف تعتمد على `input + label` و`wrapper:hover > input`. الغلاف `div` أو `label` بالقواعد نفسها.
- **كتلة مشتركة:** مكونات الفئة نفسها (Checkbox وRadio وSwitch) تشترك في Selectors واحدة للحجم والـ Label والحالات، وتعلن ذلك في تعليق الترويسة. الخصائص الداخلية المشتركة `--bui-check-_size` و`--bui-check-_font-size` (ليست API).
- **حالة التحقق:** `is-valid` فئة (لا سمة قياسية للصحة)، و`is-invalid` أو `aria-invalid="true"` بمظهر واحد. الحالة لا تعتمد على اللون: حلقة `box-shadow` داخلية تزيد سماكة الحافة دون تغيير التخطيط (`--bui-input-_ring`)، وتبقى مع Autofill.
- **قواعد hover تستثني حالات التحقق** (`:not(.is-valid):not(.is-invalid):not([aria-invalid="true"])`) كي لا تتغلب على لون الحافة.
- **Grid بدل Flex لـ Form Group** وأعلام مكانية (`--bui-form-group-_cols` و`_content-col` و`_label-min`)، فالتخطيط الأفقي (دائماً أو من Breakpoint) يبدّل ثلاث قيم فقط بلا تكرار القواعد.
- **المؤشر الخشن:** لكل حجم Token لمس (`--bui-input-touch-height-*`) و`min-block-size: max(...)`، وصفوف Check تصل 44px والـ Label يتمدد لصف كامل.
- **Forced Colors:** المكونات المرسومة بـ `appearance: none` تعيد رسم التعبئة والعلامات بألوان النظام (`@media (forced-colors: active)`).
- **JS اختياري (`password-toggle`):** يتبع نمط Task 10 (مسجل في `baset-ui.js`، `destroy()` يعيد النوع الأصلي ويزيل `aria-pressed`). الاسم الوصولي ثابت والحالة بـ `aria-pressed` (نمط Toggle Button)، فلا تبديل نص ولا اعتماد JS على الترجمة. الأيقونتان تتبدلان بـ CSS من الحالة بـ Selector أعلى من قاعدة الـ Extension، فلا يعرف الـ Core أسماء الأيقونات.
- **Playground بـ Hooks:** Input يستعمل `beforeRender` (`BUI.destroy(frame)`) و`afterRender` (`BUI.init(frame)`)، وCheckbox يضبط `indeterminate` في `afterRender` ويعرض سطر `js` في Code Output. أول استخدام حقيقي للـ Hooks (اختُبر في Chromium).
- **Fixture:** `tests/manual/forms.html` (انظر ARCHITECTURE.md).

### إضافات Task 13 (Overlay Manager وDialog وDrawer)

#### قرار: `<dialog>` الأصلي (`showModal`) بدل تنفيذ مخصص بـ `role="dialog"`
**القرار: الأصلي.** القياس في Chromium 157 (Playwright، شريط تمرير حقيقي) والباقي من مواصفات المنصة (لم يُختبر Firefox ولا Safari في هذه البيئة):

| المطلوب | الأصلي | ملاحظة |
|---|---|---|
| عزل الخلفية (`inert`/`aria-hidden`) | يوفره المتصفح لكل ما خارج الـ Dialog المفتوح | مقاس: `focus()` على عنصر خارجي يفشل، وكذلك على Dialog سفلي أثناء التداخل |
| Esc يغلق الأعلى فقط | حدث `cancel` على الأعلى فقط | مقاس مع Dialog متداخل (Esc الأول يغلق B، الثاني A) |
| Stack وترتيب الطبقات | الـ Top Layer بترتيب الفتح | لا حاجة لـ `z-index` (انظر الأثر أدناه) |
| Focus Trap | التركيز لا يصل للصفحة، لكن Tab من آخر عنصر قد يخرج لواجهة المتصفح | أُضيف التفاف يدوي صغير (Tab وShift+Tab) على أعلى طبقة، مقاس |
| إعادة التركيز | يعيده المتصفح لآخر عنصر مركّز | Safari لا يركّز الزر عند النقر، فيُخزَّن زر الفتح صراحة ويُعاد إليه |
| Scroll Lock | **لا يوفره** | يوفره Overlay Manager (انظر أدناه) |
| Static Backdrop | يتطلب اعتراض `cancel` | `preventDefault()` على `cancel` وحده لا يكفي في بعض إصدارات Chrome (تكرار Esc يغلق)، فيُمنع أيضاً `keydown` لـ Esc حين `keyboard: false`، وهذا مقاس |

**الأثر المقبول:** عناصر الـ Top Layer تتجاوز `z-index`، فلا يُعيَّن `z-index` لـ Dialog/Drawer، وتبقى Tokens `--bui-z-*` لما ليس في الـ Top Layer. **خطر على المهام اللاحقة:** أي عنصر عائم يُضاف إلى `<body>` بـ `z-index` عادي (Toast في Task 15، Popover/Menu في Task 16) سيظهر **خلف** Dialog مفتوح؛ يجب أن يعمل في الـ Top Layer أيضاً (مثلاً Popover API أو `<dialog>` غير مشروط) أو يُحمَّل داخل الـ Dialog. ما يُرسم داخل الـ Dialog نفسه (قائمة داخل Dialog) يرث موقعه فلا يتأثر.

#### Overlay Manager
- مكدس عناصر `{ el, type, instance, release }` من الأسفل. **قفل التمرير واحد مشترك** (يبدأ عند أول طبقة ويُرفع عند آخر طبقة). `overflow: hidden` على `<html>`؛ لمنع الإزاحة: إن وُجد شريط تمرير فعلاً (`innerWidth - clientWidth > 0`) يُضبط `scrollbar-gutter: stable` فيبقى مكانه محجوزاً (لا يتحرك المحتوى ولا العناصر الثابتة، مقاس: عرض الـ body وموضع عنصر `position: fixed` وscrollY قبل/أثناء/بعد، في LTR وRTL، وفي صفحة قصيرة بلا شريط). **لا يُطبَّق `stable` بلا قياس** لأن `scrollbar-gutter: stable` على عنصر `overflow: hidden` يحجز المساحة حتى بلا شريط (مقاس) فيزيح الصفحة. حيث لا يُدعم `scrollbar-gutter` يُضاف Padding بنفس العرض على `<html>` (تتحرك العناصر الثابتة؛ مسار مكتوب وغير مختبر). **ثمن معروف:** الـ Scrim الثابت لا يغطي الشريط المحجوز (مقاس: محاولة تمديده بـ `inset` سالب لا ترسم فيه)، فيظهر بعرض الشريط بلا تعتيم على المنصات ذات الأشرطة الكلاسيكية؛ البديل (Padding) يعتم كل شيء لكنه يزيح العناصر الثابتة، واخترنا عدم الإزاحة لأنه المطلوب صراحة. الشريط الطافي (macOS وأجهزة اللمس) بعرض 0 فلا أثر.
- **الأمان من التسرب:** `MutationObserver` على المستند يعمل فقط ما دام المكدس غير فارغ، ويسحب أي طبقة أُزيلت من DOM وهي مفتوحة ويرفع القفل (مختبر).
- iOS: `overflow: hidden` على `<html>` هو الأسلوب المعتمد؛ iOS قديم قد يحتاج حيلة `position: fixed`، وهذا غير منفذ وغير مختبر.

#### النمط
- **الـ `<dialog>` نفسه هو الـ Scrim** (عنصر بحجم النافذة بلون `--bui-overlay-backdrop-bg`، و`::backdrop` الأصلي شفاف)، وأول ابن له `__panel` هو الصندوق المرئي. السبب: ألوان الـ Scrim تأتي من Tokens وراثة عادية (ليس `::backdrop` الذي لا يرث الخصائص المخصصة في المتصفحات الأقدم)، والنقر على الـ Scrim = النقر على `<dialog>` نفسه. إغلاق الـ Backdrop يتطلب أن يبدأ `pointerdown` على الـ Scrim أيضاً (سحب من النص إلى الخارج لا يغلق، مختبر).
- **Flags لا نسخ:** `--bui-dialog-_fs` (0 أو 1) يتحكم بتحول ملء الشاشة (الحشوة والعرض الأقصى والارتفاع والحدّ والانحناء بـ `calc()`)، فصنف `--fullscreen-until-md` يبدّل رقماً واحداً داخل `min-width` (Mobile First). `--bui-drawer-_dir` (1 أو -1 بـ `:dir(rtl)`) يقلب اتجاه الانزلاق، والمواضع بخصائص منطقية.
- **الإغلاق بحركة:** `is-closing` يشغّل حركة الخروج، ويُنتظر `Animation.finished` لكل الحركات الجارية (مع مهلة أمان) ثم يُستدعى `close()` الأصلي؛ المعالجة النهائية (رفع القفل وإعادة التركيز وحدث `close`) في حدث `close` الأصلي، فتعمل أيضاً حين يُستدعى `dialog.close()` مباشرة. مع `prefers-reduced-motion` تُصفَّر المدة فيُغلق فوراً (مقاس).
- **`<form method="dialog">`:** يُعترض `submit` ويمر بـ `beforeclose` (`source: 'form'`) و`returnValue` من الزر. استدعاء `dialog.close()` الأصلي مباشرة يتخطى `beforeclose` (طبيعة المنصة).
- **المحتوى الديناميكي:** `load` دالة أو `url` من نفس الأصل؛ `innerHTML` للنص الراجع (لمحتوى موثوق، موثق بتحذير). النص الإنجليزي لسطر الحالة نص HTML Binding الافتراضي، ولا يُترجَم إلا حين توجد لغة نشطة (خلاف ذلك يُرجع `translate` المفتاح نفسه، وهذا اكتُشف أثناء التنفيذ).
- **Playground:** المعاينة زر فتح وحوار حقيقي (لا يمكن عرضه مفتوحاً مع بقاء عناصر التحكم متاحة لأنه Modal)، بـ Hooks `beforeRender` (`BUI.destroy(frame)`) و`afterRender` (`BUI.init(frame)`). مقاس الحوار من نافذة المتصفح لا من حاوية المعاينة.
- **Fixture:** `tests/manual/overlays.html` (انظر ARCHITECTURE.md).
