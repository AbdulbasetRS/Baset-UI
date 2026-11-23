# معايير تطوير المكونات

كل Component يتبع نفس المعمارية مع السماح باختلافات منطقية حسب طبيعته. (المنفذ حتى Task 11: Avatar وBadge وButton وButton Group وCard وClose Button وList Group وProgress. النمط المرجعي أدناه من Task 09، وTask 10 اتبعه.)

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
