# Changelog

يتبع صيغة [Keep a Changelog](https://keepachangelog.com) و[SemVer](https://semver.org).

## [Unreleased]

### Added (Task 15: Alert + Toast Manager)
- `assets/css/baset-ui.css` (257,517 بايت خام و35,102 gzip، كان 246,749 و33,427): **Alert** في قسم 6 (قبل Avatar) و**Toast** (بعد Switch)، وTokens `--bui-alert-*` و`--bui-toast-*` في الطبقة 3. Alert: `bui-alert` بستة ألوان (`--primary` الافتراضي و`--secondary` و`--success` و`--warning` و`--danger` و`--info`) وأجزاء `__icon/__content/__title/__description/__actions/__close`، وحافة بداية سميكة تنتقل في RTL. Toast يعيد استخدام شكل Alert (`bui-toast bui-alert bui-alert--{type}`) ويضيف الحاوية `bui-toast-region` والأكوام `bui-toast-stack--{top|bottom}-{start|center|end}`.
- `assets/js/baset-ui.js` (114,415 بايت خام و26,330 gzip، كان 85,789 و20,047): مكون `alert` (`BUI.alert`: `close/isClosed/destroy`، الحدثان `bui:alert:beforeclose` القابل للإلغاء و`bui:alert:close`) ومعالج مفوض لـ `data-bui-dismiss="alert"`، و**Toast Manager** `BUI.toast.{show,success,error,warning,info,clear}` مع Handle `{id,element,close,update,isOpen}` والحدثين `bui:toast:show|hide`، وخيار `toast` في `BUI.config` (`position` و`duration` و`max` و`closable`).
- **قرار (Top Layer):** حاوية Toast `popover="manual"`. قيس في Chromium: `showModal()` يجعل Popover خارج الـ Dialog inert (لا تركيز ولا نقر)، وإعادة توليده داخل الـ Dialog تعمل. لذلك أُضيف خطاف داخلي `overlayChanged` في Overlay Manager ينقل الحاوية إلى أعلى Dialog/Drawer مفتوح (وإلى `body` حين لا يوجد)، بلا إعادة تشغيل حركة الدخول. بلا Popover API تعمل كعنصر ثابت بـ `--bui-toast-z` (مختبر بحذف الواجهة).
- **قرار:** Toast وAlert في الـ Core لا Extension. حجم الإضافة نحو 28.6KB خام JS و10.8KB خام CSS يتجاوز 15KB (الشرط 1) لكن [CORE_ASSETS.md](instructions/CORE_ASSETS.md) يحدد Toast Manager ضمن مسؤوليات `baset-ui.js` صراحة، والخطاف مع Overlay Manager يحتاج أن يكونا معاً. الشرط 2 غير متحقق (الإشعارات مما تحتاجه معظم التطبيقات).
- **قرار:** toast له `actions` بلا `duration` صريح يصير دائماً (`duration: 0`)، وإلا يختفي قبل أن يصل المستخدم للزر (WCAG 2.2.1). حد المكدس **لكل موضع** وليس إجمالياً.
- `assets/i18n/{en,ar,fr}.json`: `alert.typePrimary|typeSecondary|typeSuccess|typeWarning|typeDanger|typeInfo` (كلمة النوع المخفية بصرياً قبل عنوان كل Toast) و`toast.region` (21 مفتاحاً، `node tests/i18n-keys.js` ناجح). نص الإغلاق يعيد استعمال `common.close`.
- `documentation/components/alert.html` و`toast.html` بالأقسام الثمانية وPlayground حقيقي لكل منهما (Toast: زر المعاينة ينفذ `BUI.toast.show` بالخيارات نفسها المعروضة في Code Output). مفعلتان في `nav.js`، وأُضيف **Toast** إلى قسم Components بعد List Group (قرار المهمة).
- `tests/manual/alert-toast.html` (Fixture معلن، انظر ARCHITECTURE.md).

### Changed (Task 15)
- **Dialog وDrawer:** معالج `data-bui-dismiss` صار يغلق الطبقة فقط حين تكون القيمة فارغة أو نوع الطبقة نفسها (`dialog`/`drawer`). السبب: Alert داخل Dialog بزر `data-bui-dismiss="alert"` كان سيغلق الـ Dialog كله. كل الاستخدامات الموجودة (85 موضعاً) بلا قيمة فلا تتأثر. (تعديل سلوك صغير في مكون منفذ، موثق في صفحتي Dialog وDrawer.)
- `documentation/javascript/introduction.html`: جدول `BUI.config` فيه `toast`، وصُححت جملة "Settings other than these three do not exist yet".
- `documentation/assets/css/docs.css`: قاعدة واحدة (`.bui-docs-content .bui-alert__title { margin: 0 }`) لأن قاعدة `p` في التوثيق (هامش 16px) كانت تتغلب على صفر هامش عنوان Alert في المعاينات (docs فقط).
- `instructions/`: `ARCHITECTURE.md` و`COMPONENTS_REGISTRY.md` و`COMPONENT_DEVELOPMENT.md` و`CORE_ASSETS.md` و`INTERNATIONALIZATION.md` و`JAVASCRIPT_API.md` و`NAMING_CONVENTIONS.md` و`PROJECT_OVERVIEW.md` و`TESTING.md` و`ACCESSIBILITY.md`.

### Tests (Task 15، Chromium فقط، Playwright خارج المستودع)
- سلوك Toast: 71 فحصاً (6 مواضع x LTR وRTL بالقياس، الطابور والترتيب، الإيقاف بـ Hover وFocus ودقة الزمن المتبقي، الإجراءات، `update/close/clear`، مدخلات غير صالحة، `BUI.config`، الأحداث، التسرب، i18n، Reduced Motion، فوق Dialog وDialog متداخل وDrawer، حذف Dialog يحمل الحاوية، بلا Popover API). Alert: الأدوار والأحداث وإلغاء `beforeclose` وداخل Dialog.
- Playground: 51 حالة (39 Toast و12 Alert) المعاينة = تنفيذ الكود الظاهر. أمثلة التوثيق وأزرار العرض.
- التباين: 768 عينة (أدنى نص 11.35:1، أيقونة 6.26:1، حافة البداية 4.49:1، زر الإجراء 5.10:1).
- 192 تركيبة Overflow للصفحات الجديدة، و39 صفحة توثيق x 3 عروض (تراجع)، `tests/manual/core.html` 43/43، `node tests/i18n-keys.js` وفحص الأيقونات ناجحان.
- **غير مختبر:** قارئ شاشة (إعلان الحاوية وتوقيت أول toast وإعلان toast الـ danger داخل منطقة polite)، Safari/Firefox، لمس فعلي، Forced Colors الفعلي على Windows.
- **أخطاء وُجدت وصُححت أثناء التنفيذ والاختبار:** (1) Code Output في Playground كان يكسر النصوص التي تحوي apostrophe. (2) كتلة سكربت `alert.html` خرجت من المولّد بسطر جديد داخل نص JS. (3) حدّ المكدس لم يحسب toasts المنتظرة إنشاء الحاوية (كان يسمح بتجاوزه عند استدعاءات متتالية سريعة).

### Changed (Task 14: كتالوج الأيقونات وShell التوثيق على مكونات المكتبة)
- `documentation/advanced/icons.html`: تفاصيل الأيقونة في `BUI.dialog` (كان `<dialog>` أصلياً docs-only) مع تركيز أولي على الوزن المحدد وإعادة التركيز لزر الفتح؛ الأزرار وحقل البحث وCheckbox وRadio من المكتبة (`bui-btn` و`bui-input` و`bui-checkbox` و`bui-radio`)؛ بقيت القائمتان `<select>` بـ `bui-docs-select` (لا Select بعد).
- `docs.js` و`docs.css` و`index.html`: زر القائمة بأيقونتي `list`/`x` تتبدلان بـ `aria-expanded`، وسهم طي الأقسام أيقونة `caret-down` تدور عند الفتح، بدل الرموز المرسومة بـ CSS (`bui-docs-burger` و`::after`)؛ أزرار Navbar (RTL وDark mode وGitHub) صارت `bui-btn` (الضغط يبدّل Variant من outline إلى solid).
- إضافة `<link>` لـ `baset-ui-icons.css` إلى `<head>` 21 صفحة توثيق وقالب الصفحة و`index.html` (السبب: الـ Shell يحتاجه في كل صفحة).
- `instructions/`: `ARCHITECTURE.md` (قسم Task 14) و`COMPONENTS_REGISTRY.md` و`ICONS_SYSTEM.md`.
- لا تغيير في API المكتبة (`baset-ui.css`/`baset-ui.js`/i18n لم تُعدَّل). اختُبر في Chromium فقط: 2,432 تركيبة بلا Overflow أو أخطاء، وكيبورد الحوار، وتباين نص الحوار، و`tests/manual/core.html` 43/43. غير مختبر: قارئ شاشة، Safari/Firefox، لمس فعلي.

### Added (Task 13: Overlay Manager + Dialog + Drawer)
- `assets/js/baset-ui.js` (85,789 بايت خام و20,244 gzip، كان 64,750 و15,029): **Overlay Manager** (`BUI.overlay.{getStack,getTop,closeAll}`) قبل `window.BUI = BUI`، والمكونان `dialog` و`drawer` مسجلان بعد `password-toggle`، والاسم المستعار `BUI.modal === BUI.dialog`، ومستمع نقر مفوّض واحد لـ `data-bui-dialog-open` و`data-bui-drawer-open`. قفل تمرير واحد مشترك بلا إزاحة، وتنظيف تلقائي إن أُزيلت طبقة مفتوحة من DOM.
- `assets/css/baset-ui.css` (246,749 بايت خام و34,507 gzip، كان 235,063 و31,553): Dialog وDrawer في قسم 6 (بين Close Button وForm Controls)، وTokens `--bui-overlay-*` (مشتركة) و`--bui-dialog-*` و`--bui-drawer-size-*` في الطبقة 3.
- **Dialog:** `bui-dialog` على `<dialog>` الأصلي، `__panel/__header/__title/__body/__footer`، `--sm|md|lg|xl` و`--centered` و`--scrollable` (Body) والافتراضي Page و`--fullscreen` و`--fullscreen-until-{sm|md|lg|xl}`، Static (`data-bui-static`) وخيار `keyboard`، تداخل، `<form method="dialog">`، محتوى ديناميكي (`load` أو `url`).
- **Drawer:** `bui-drawer` بنفس الأساس، `--start|end|top|bottom` (start/end تنعكس في RTL مع اتجاه الانزلاق) و`--sm|md|lg|xl` و`--no-backdrop`.
- **JS:** الخيارات `static` و`keyboard` و`focus` و`restoreFocus` و`url` و`load` و`loadOnce`؛ الطرق `open/close/toggle/isOpen/destroy`؛ الأحداث القابلة للإلغاء `bui:dialog|drawer:beforeopen` و`beforeclose` ثم `open` و`close` و`load` و`loaderror`.
- `assets/i18n/{en,ar,fr}.json`: `overlay.loadError` (14 مفتاحاً، `node tests/i18n-keys.js` ناجح).
- `documentation/components/dialog.html` و`drawer.html` بالأقسام الثمانية وPlayground حقيقي لكل منهما، ومفعلتان في `nav.js`.
- `tests/manual/overlays.html` و`tests/manual/fixtures/overlay-content.html` (Fixtures معلنة، انظر ARCHITECTURE.md).
- **قرارات (انظر COMPONENT_DEVELOPMENT.md):** (1) `<dialog>` الأصلي بدل المخصص مع أدلة وأثر على Toast/Popover (يجب أن يعملا في الـ Top Layer). (2) Dialog وDrawer في الـ Core لا Extension (CORE_ASSETS.md). (3) الاسم الرسمي `BUI.dialog` و`BUI.modal` اسم مستعار. (4) **الأحداث `beforeopen`/`beforeclose` بلا شرطة** بدل `before-open` الوارد في JAVASCRIPT_API.md (تعارض حُسم بأولوية المهمة الصريحة، ويحتاج تأكيدك). (5) لاحقة `--fullscreen-until-{bp}`.
- **ثمن معروف:** مع `scrollbar-gutter` (لعدم الإزاحة) لا يغطي الـ Scrim مساحة شريط التمرير المحجوزة على المنصات ذات الأشرطة الكلاسيكية، فتظهر بعرض الشريط بلا تعتيم.

### Changed (Task 13)
- ملفات `instructions/` المعدلة: `COMPONENTS_REGISTRY.md` و`PROJECT_OVERVIEW.md` و`ARCHITECTURE.md` و`COMPONENT_DEVELOPMENT.md` و`CORE_ASSETS.md` و`NAMING_CONVENTIONS.md` و`JAVASCRIPT_API.md` و`INTERNATIONALIZATION.md` و`TESTING.md`. تغيير قاعدة موجودة: اسما الحدثين `before-open`/`before-close` صارا `beforeopen`/`beforeclose` (JAVASCRIPT_API.md وNAMING_CONVENTIONS.md). بند Modal Manager المستقبلي حلّ محله Overlay Manager. `AI_RULES.md` لم يتغير.

### Tested (Task 13، Chromium 157 فقط عبر Playwright خارج المستودع)
- فتح/إغلاق بالزر وAPI وDismiss وEsc والنقر خارجاً (وسحب من الصندوق إلى الخارج لا يغلق)؛ عزل الصفحة؛ Tab وShift+Tab 12 مرة لا تخرج؛ إعادة التركيز لزر الفتح؛ Nested (Esc يغلق B ثم A، والقفل يبقى حتى آخر طبقة)؛ ترتيب الأحداث ومصادر الإغلاق؛ إلغاء `beforeopen` و`beforeclose` (Esc وDismiss)؛ Static وkeyboard=false (4 ضغطات Esc)؛ `<form method="dialog">` مع `returnValue`؛ `focus` وحالة بلا عنصر قابل للتركيز؛ 29/29.
- قفل التمرير: لا إزاحة (عرض body وعنصر ثابت وscrollY) في صفحة طويلة LTR وRTL وصفحة قصيرة بلا شريط، واستعادة `style` كاملاً؛ Drawer: الجوانب الأربعة بالقياس في LTR وRTL وعرض 24rem واتجاه الانزلاق وNo-backdrop وDrawer+Dialog و`closeAll`؛ المحتوى الديناميكي (دالة، فشل، `url` من نفس الأصل، رفض عبر الأصول، ترجمة الخطأ ar)؛ destroy أثناء الفتح ومستمعات 0 بعد destroy و60 دورة create/destroy؛ إزالة الحوار من DOM وهو مفتوح؛ عنصر غير `<dialog>` يرجع `null`؛ `fullscreen-until-md` عند 500 و900؛ لا Overflow أفقي لـ xl عند 320 و480 و768 و1920؛ 33/33.
- التوثيق: صفحتان بلا أخطاء Console ولا 404 وأقسام ثمانية بالترتيب ولا معرفات مكررة؛ Playground: 25 حالة لـ Dialog و21 لـ Drawer (المعاينة تطابق Code Output، وتهريب نص العنوان) وفتح المعاينة فعلياً (الحجم وملء الشاشة والتوسط وStart/End مع RTL المعاينة)؛ 12/12؛ لا Overflow أفقي في 128 تركيبة؛ التباين 432 عينة (أدنى 5.90:1)؛ Reduced Motion (إغلاق فوري) وحركة عادية (ينتظر الخروج)؛ Forced Colors بمحاكاة (Scrim شفاف وحدّ للصندوق).
- التراجع: `tests/manual/core.html` 43/43، و43 صفحة (توثيق وindex واختبارات يدوية) بلا أخطاء Console ولا 404، و`node tests/i18n-keys.js` ناجح.
- **غير مختبر:** قارئ شاشة (NVDA/VoiceOver/JAWS)، Firefox وSafari (الدعم من المنصة لا من اختبار)، لمس فعلي وقفل التمرير على iOS/Android، Forced Colors على Windows الفعلي، مسار Padding البديل حيث لا يوجد `scrollbar-gutter`، `:dir(rtl)` في متصفحات أقدم، السحب للإغلاق (غير منفذ).

### Added (Task 12: Form Controls + Input + Checkbox + Radio + Switch)
- `assets/css/baset-ui.css` (235,063 بايت خام و31,553 gzip، كان 207,037 و26,437): Form Controls وCheckbox وInput وRadio وSwitch في قسم 6 بالترتيب الأبجدي (Checkbox بعد Card، Form Controls وInput قبل List Group، Radio وSwitch بعد Progress)، وTokens في الطبقة 3 (`--bui-form-*` و`--bui-input-*` و`--bui-check-*` و`--bui-switch-*`). لا ملف CSS جديد.
- **Form Controls:** `bui-form-group` (Grid، عمودي، و`--horizontal` و`--horizontal-sm|md|lg`) و`bui-form-label` (`--required`) و`bui-form-text` (`--error` و`--success`) و`bui-form-fieldset` و`bui-form-legend`.
- **Input:** `bui-input` على `input` (text وemail وpassword وnumber وsearch وurl وtel وdate) و`textarea`، أحجام `--sm|--md|--lg`، حالات readonly وdisabled وvalid وinvalid (حلقة داخلية فتختلف الحافة بغير اللون)، Input Group (`bui-input-group` و`bui-input-group__text` و`--sm|--lg`)، قاعدة Autofill (`:-webkit-autofill`)، وارتفاع أكبر على المؤشر الخشن.
- **Checkbox وRadio وSwitch:** على `<input>` الأصلي بـ `appearance: none`، داخل `bui-checkbox` و`bui-radio` و`bui-switch` (`__input` ثم `__label`)، أحجام `--sm|--md|--lg`، `--inline`، Indeterminate لـ Checkbox، `role="switch"` لـ Switch، وقواعد مشتركة بين الثلاثة (الـ Label وhover وdisabled والتحقق وFocus وForced Colors).
- `assets/js/baset-ui.js` (64,750 بايت خام و15,029 gzip، كان 61,801 و14,476): مكون اختياري `password-toggle` (`data-bui-password-toggle`، `BUI.passwordToggle`، `show/hide/toggle/isVisible/destroy`، الحدث `bui:password-toggle:toggle`). الاسم الوصولي ثابت والحالة بـ `aria-pressed`.
- i18n: مفتاح `form.showPassword` في `en.json` وar وfr معاً (`node tests/i18n-keys.js` ناجح: 13 مفتاحاً).
- `documentation/components/form-controls.html` و`input.html` و`checkbox.html` و`radio.html` و`switch.html`، بالأقسام الثمانية بالترتيب وPlayground حقيقي لكل صفحة، ومفعلة في `nav.js`.
- `tests/manual/forms.html`: Fixture معلن (انظر ARCHITECTURE.md).

### Changed (Task 12)
- `COMPONENTS_REGISTRY.md` وARCHITECTURE.md وCOMPONENT_DEVELOPMENT.md وNAMING_CONVENTIONS.md وINTERNATIONALIZATION.md وJAVASCRIPT_API.md وCORE_ASSETS.md وPROJECT_OVERVIEW.md وCUSTOMIZATION_AND_PLAYGROUND.md (ملفات `instructions/`).
- تفعيل صفحات Forms الخمس غيّر رابط Next/Previous في أسفل بعض صفحات التوثيق الموجودة (لا تغيير في أي مكون سابق: قورنت 35 صفحة قبل التعديل وبعده في Chromium، والفروق الوحيدة روابط Next/Previous).

### Decisions (Task 12)
- **لا Floating Label:** يعتمد على Placeholder مخفي وانكماش الـ Label عند التركيز ويتأثر بتبديل الاتجاه؛ الـ Label الظاهر فوق الحقل أأمن. موثق في صفحة Form Controls.
- **حالة invalid:** تُقبل `is-invalid` و`aria-invalid="true"` بالمظهر نفسه (طلب المهمة صراحة `is-valid`/`is-invalid` مع `aria-invalid`، وقاعدة الحالة بالسمة تفضّل السمة القياسية)؛ `is-valid` فئة لأنه لا سمة قياسية للصحة.
- **مساعد كلمة المرور داخل الـ Core:** يتبع قرار Task 10 (JS صغير اختياري مسجل في `baset-ui.js` لما لا يستقيم بـ CSS). الاسم ثابت و`aria-pressed` بدل تبديل الاسم، فلا مفتاح i18n إلا `form.showPassword`.
- **`fieldset` لا يصلح Grid أفقياً** (المتصفح لا يضع `legend` كعنصر شبكة)، فالأفقي لمجموعات الراديو بـ `role="radiogroup"` و`aria-labelledby`.
- **`<select>` الأصلي لم يُنسَّق** (Select مهمة لاحقة)، وChrome الأصلي لحقول file/color/range لم يُلمس.
- **اتجاه النص:** `dir="ltr"` لحقول البريد والرابط والهاتف والرقم، و`dir="auto"` للنص الحر. قيس أن الحقل الفارغ بـ `dir="auto"` يصبح LTR في صفحة RTL (وفق المتصفح) وهو موثق.
- **علامة Checkbox بحدود فيزيائية** عمداً (رسم لا يُعكس في RTL)، وبقية المكان Logical Properties (المؤشر `inset-inline-start`).

### Tested (Task 12) - Chromium (Playwright)، بلا متصفحات أخرى
- تشغيل: 5 صفحات توثيق وFixture بلا أخطاء Console ولا 404. صياغة: `node --check` لـ `baset-ui.js` ولسكربتات الصفحات. `node tests/i18n-keys.js` وفحص الأيقونات ناجحان.
- التباين: 1,024 عينة، صفر فشل (أدنى نص 5.07:1، أدنى غير نصي 3.73:1).
- Overflow: 320 تركيبة للصفحات الخمس و64 للـ Fixture، صفر Overflow أفقي.
- Playground: 97 حالة (كل الخيارات في الصفحات الخمس)، المعاينة تطابق Code Output. تهيئة `password-toggle` داخل المعاينة بـ Hooks، وIndeterminate.
- كيبورد: ترتيب Tab، Space على Checkbox وSwitch، أسهم Radio في LTR وRTL، نقر الـ Label بالنمطين. Switch: موضع المؤشر في LTR وRTL. المؤشر الخشن: ارتفاعات 40/44/48 وصفوف 44. Forced Colors (محاكاة).
- **غير مختبر:** قارئ شاشة، Safari/Firefox، لمس فعلي، Autofill حقيقي، Forced Colors على Windows، `content: "*" / ""` في متصفحات لا تدعم النص البديل، `dir="auto"` على أجهزة فعلية.

### Added (Task 11: Card + List Group)
- `assets/css/baset-ui.css` (207,037 بايت خام و26,437 gzip، كان 185,831 و23,505): Card بين Button Group وClose Button، وList Group بين Close Button وProgress في قسم 6، وTokens في الطبقة 3 (`--bui-card-*` و`--bui-list-group-*`). بلا JS وبلا مفاتيح i18n (لا نص داخلي).
- **Card:** `bui-card` مع `__header/__body/__footer/__title/__subtitle/__text/__media`، وVariants (افتراضي محايد، `--solid` و`--subtle` و`--outline`) x ستة ألوان، وأفقي `--horizontal` و`--horizontal-sm|md|lg`، وStretched Link (`__stretched-link`) بحلقة تركيز حول البطاقة كلها، وبطاقة بارتفاع 100% لتتساوى في الـ Grid. قائمة List Group داخل Card تتبع ألوان البطاقة.
- **List Group:** `bui-list-group` و`__item` على `li` أو `a[href]` أو `button`، و`--flush` و`--numbered` (عداد CSS) و`--horizontal` و`--horizontal-sm|md|lg`، والحالات بالسمات (`aria-current` و`aria-disabled` و`disabled`)، وHover وPressed للروابط والأزرار فقط، وارتفاع 44 بكسل للمؤشر اللمسي.
- `documentation/components/card.html` و`list-group.html` بالأقسام الثمانية بالترتيب وPlayground حقيقي لكل منهما (Schema خاص: 11 و10 عناصر تحكم)، ومفعلتان في `nav.js`. قسم JavaScript API يذكر أنهما CSS فقط.
- `tests/manual/card-list-group.html`: Fixture للمصفوفات الكاملة والأفقي والـ Stretched Link والـ Grid والقوائم داخل Cards (انظر ARCHITECTURE.md). Fixtures معلنة: نصوص عينة وSVG مضمن مولد.

### Changed (Task 11)
- `documentation/assets/js/nav.js`: Card وList Group تحولا من نصين إلى `{ title, href }` (الترتيب لم يتغير: List Group ما زال بعد Progress كما كان).
- `instructions/` المعدلة: `COMPONENTS_REGISTRY.md` وARCHITECTURE.md وCOMPONENT_DEVELOPMENT.md (قسم إضافات Task 11) وNAMING_CONVENTIONS.md وCORE_ASSETS.md وPROJECT_OVERVIEW.md.

### Decisions (Task 11)
- **Stretched Link بعنصر `bui-card__stretched-link` لا Utility عامة:** المطلوب ضمن Card، وUtility عامة تحتاج مهمة Utilities. يُرفع ما حوله من عناصر تفاعلية بـ `:where()` (تخصيص صفري) و`:has()`، مع `@supports not selector(:has(*))` للرفع الشامل.
- **الحالة بالسمة (`aria-current`/`aria-disabled`/`disabled`) بلا فئة `active`/`disabled`**، حسب NAMING_CONVENTIONS.
- **Header/Footer غير مدعومين كأبناء مباشرين في Card الأفقي، و`--flush` لا يجتمع مع الأفقي في List Group.** بديل Grid لأجل الـ Header/Footer رُفض لأنه يعتمد على عدد الصفوف الضمنية؛ القيدان موثقان.
- **اللون في Card يعمل مع Variant فقط** (البطاقة الافتراضية محايدة)، كما في Badge.

### Tested (Task 11) - Chromium 157 (Playwright)، بلا متصفحات أخرى
- تباين النص: 524 عينة (Card: العنوان والعنوان الفرعي والنص والـ Header والـ Footer لكل Variant x لون، وعناصر List Group وقوائم داخل Cards) x ثيمان (default وocean) x وضعان: لا إخفاق، الأدنى 5.02. Hover/Pressed داخل Cards: 64 عينة >= 4.5. حلقة تركيز Stretched Link >= 3:1.
- لا Horizontal Overflow: 64 تركيبة (ثيمان x وضعان x اتجاهان x 8 عروض من 320 إلى 1920) على الـ Fixture، و20 تركيبة لكل صفحة توثيق.
- Breakpoints الأفقية (576/768/992) صحيحة عند 8 عروض x 8 تركيبات (ثيمان x وضعان x اتجاهان). ارتفاعات متساوية في الـ Grid وFooter في الأسفل عند 3 عروض.
- Stretched Link: النقر على الزاوية والوسائط، والعناصر الداخلية (زر ورابط) تستجيب دون تفعيل الرابط، Tab وEnter وSpace، في LTR وRTL: 34 فحصاً ناجحاً. List Group: Hover لا يغير النشط ولا المعطل، Tab يتخطى المعطل.
- Playground: كل عنصر تحكم في الصفحتين يغير المخرج كما هو موثق (فحص آلي). لا أخطاء Console ولا 404 في الصفحتين.
- **لم يُختبر:** قارئات الشاشة، الأجهزة اللمسية الحقيقية (محاكاة `pointer: coarse` فقط)، Safari وFirefox (الاعتماد على `:has()` و`:dir` و`outline` المنحني)، وVoiceOver مع `list-style: none`.

### Added (Task 10: Badge + Avatar + Progress)
- `assets/css/baset-ui.css` (185,831 بايت خام و23,505 gzip، كان 161,098 و19,109): ثلاثة مكونات في قسم 6 مرتبة أبجدياً (Avatar قبل Button، وBadge بينهما، وProgress بعد Close Button)، وComponent Tokens في الطبقة 3 (`--bui-avatar-*` و`--bui-badge-*` و`--bui-progress-*`).
- `assets/js/baset-ui.js` (61,801 بايت خام و14,476 gzip، كان 52,004 و12,143): مكونان مسجلان بـ `BUI.register`: `avatar` و`progress` (انظر Decisions).
- **Badge (CSS فقط):** `bui-badge` بثلاثة Variants (solid وsubtle وoutline) x ستة ألوان x ثلاثة أحجام، `--pill` و`--dot` وأيقونة بالـ Extension، وشارة إشعار عائمة: `bui-badge-anchor` على المضيف و`bui-badge--floating` (+ `--bottom` و`--start`) بـ `inset-inline-end` و`inset-block-start`.
- **Avatar:** `bui-avatar` بخمسة أحجام (`xs` إلى `xl`) وثلاثة أشكال (`circle` وهو الافتراضي، `rounded`، `square`)، محتواه أحرف (`__text`) أو أيقونة أو صورة (`__img`) مع Fallback، ومؤشر حالة `__status--{online|away|busy|offline}`، و`bui-avatar-group` (+ `--{xs..xl}`) بتداخل `margin-inline-start` سالب نسبته `--bui-avatar-group-overlap`. `BUI.avatar(el)`: `isFallback` و`refresh` و`destroy`، والحدث `bui:avatar:fallback`.
- **Progress:** `bui-progress` محدد وغير محدد، ستة ألوان x ثلاثة أحجام، تسمية داخل الشريط (`__label`) أو خارجه (`bui-progress-label`)، وSegments عبر `bui-progress-stack`. `BUI.progress(el)`: `set(value|null)` و`get` و`getPercent` و`refresh` و`destroy`، والحدثان `bui:progress:change` و`bui:progress:complete`، ومزامنة `[data-bui-progress-text]`.
- `assets/i18n/en.json` و`ar.json` و`fr.json`: مجموعة `avatar` (`statusOnline` و`statusOffline` و`statusBusy` و`statusAway`) في الملفات الثلاثة معاً. `node tests/i18n-keys.js` ينجح (12 مفتاحاً).
- ثلاث صفحات توثيق في `documentation/components/` (`badge.html` و`avatar.html` و`progress.html`) بالأقسام الثمانية بالترتيب وPlayground حقيقي لكل منها (Schema خاص: 9 و6 و6 عناصر تحكم)، مفعلة في `nav.js` (Active State مختبر). قسم JavaScript API في Badge يقول صراحة إنه CSS فقط.
- `tests/manual/badge-avatar-progress.html`: Fixture للمصفوفات الكاملة والـ Fallback والمجموعات وحالات Progress، مع مبدلات الثيم والوضع والاتجاه (انظر ARCHITECTURE.md). Fixtures معلنة: صورة SVG مولدة وصورة معطوبة عمداً بـ data URI.

### Changed (Task 10)
- `documentation/assets/js/nav.js`: Avatar وBadge وProgress تحولت من نصوص إلى `{ title, href }` (الترتيب لم يتغير).
- `instructions/` المعدلة: `COMPONENTS_REGISTRY.md` وARCHITECTURE.md وCOMPONENT_DEVELOPMENT.md (قسم إضافات Task 10) وNAMING_CONVENTIONS.md وCORE_ASSETS.md وJAVASCRIPT_API.md وINTERNATIONALIZATION.md وPROJECT_OVERVIEW.md.

### Decisions (Task 10)
- **JS اختياري ضمن الـ Core:** `avatar` لأن CSS لا يكشف فشل تحميل الصورة، و`progress` لأن إبقاء `aria-valuenow` و`--bui-progress-value` متطابقين يدوياً هو الخطأ الأشيع. كلاهما بلا Options. Badge بلا JS. بدون JS يعمل كل شيء من الـ Markup عدا الـ Fallback ومزامنة القيمة.
- **الحالة:** Progress غير المحدد = غياب `aria-valuenow` (السمة القياسية هي الحالة)؛ Avatar الاحتياطي فئة `is-fallback` لأن لا سمة قياسية لفشل الصورة (الاستثناء الذي تسمح به NAMING_CONVENTIONS.md). عند الـ Fallback ينقل الـ JS اسم `alt` إلى عنصر الأحرف (`role="img"` + `aria-label`) ويعيد الأصل عند عودة الصورة.
- **أسماء كاملة** `bui-badge` و`bui-avatar` و`bui-progress` لأن لا اختصار معتمداً لها في جدول NAMING_CONVENTIONS.md.
- **نقطة Badge من نوع subtle** تُملأ بلون solid، لأن خلفيتها الفاتحة بلا نص تقاس 1.10:1 (Light) و1.37:1 (Dark) وتكاد تختفي؛ نقطة outline حلقة مجوفة.
- **نص Badge subtle** بلون `-hover` لا اللون العادي، لأن اللون العادي على الخلفية الفاتحة أقل من 4.5:1 (success في Light).
- **مؤشرات حالة Avatar بأشكال مختلفة** (نقطة، ونقطة ينقصها ربع، ونقطة بشريط، وحلقة مجوفة) فلا يكون اللون الإشارة الوحيدة.
- **Avatar Group** تداخله نسبة من حجم كل صورة (`--bui-avatar-group-overlap: 0.25`) بـ `margin-inline-start`، فيعمل في RTL بلا قاعدة خاصة، والأحدث ترسم فوق الأقدم.
- **تسمية Progress الداخلية** مركزة على المسار كله ويتبدل لون النص عند حافة التعبئة (تدرج مقصوص بالنص، `to right` وفي RTL `to left`) فتبقى مقروءة عند أي قيمة. الاحتياط: لون النص العادي حيث لا يدعم المتصفح `background-clip: text`، وقرص Canvas في Forced Colors. عند 50% يظهر نصف النص بكل لون، وهذا مقصود وموثق.
- **Reduced Motion:** حركة Progress غير المحدد تُبطأ إلى 3s ولا تتوقف (مؤشر حالة، الفلسفة نفسها لـ Spinner الزر)؛ تغير القيمة المحدد يبقى انتقالاً قصيراً.
- **Segments:** كل جزء Progress كامل بقيمته وتسميته، وقيمته نسبته من المسار كله؛ الجمع حتى 100 مسؤولية كاتب الصفحة.
- **حجم `sm` لـ Progress** يخفي التسمية الداخلية (لا يتسع لها)، والغير المحدد لا تسمية له (لا قيمة).

### Tested (Task 10, Chromium عبر Playwright فقط، خادم http محلي)
- **التباين (قياس حي في المتصفح، default وocean x Light وDark x LTR وRTL):** Badge 432 عينة، أدنى نص 5.02:1 (solid warning، Light)، وحد outline على سطح 4.68:1 كأدنى قيمة، والنقطة 40 عينة (أدنى 5.02:1)؛ أحرف Avatar 120 عينة (أدنى 8.06:1)، ومؤشر الحالة 288 (أدنى 5.02:1)؛ Progress: التسمية فوق التعبئة 160 عينة (أدنى 5.02:1) وفوق المسار 160 (أدنى 9.96:1)، والتعبئة مقابل المسار 208 (أدنى 3.73:1، فوق حد 3:1 لغير النص).
- **Fixture:** 24 تركيبة (ثيمان x وضعان x اتجاهان x 320 و768 و1920): فشل الصورة وعدم فشل الصورة السليمة (3 + 1 حالات)، ترتيب مجموعة Avatar وتداخلها صحيحان في LTR وRTL، مؤشر الحالة على الحافة الصحيحة، `role` و`aria-valuemin/max/now` لكل Progress وغياب `aria-valuenow` لغير المحدد، بلا Overflow أفقي ولا أخطاء Console.
- **JS API:** `set(75)` يزامن `aria-valuenow` و`--bui-progress-value` والنص؛ `set(999)` يقص إلى 100 ويطلق `complete` مرة؛ `set(null)` يزيل `aria-valuenow`؛ `set(-5)` يقص إلى 0؛ حدث Avatar `fallback` عند فشل الصورة؛ Reduced Motion يعطي 3s.
- **صفحات التوثيق:** 3 صفحات x LTR وRTL: Active State في Sidebar، الأقسام 01 إلى 08 بالترتيب، بلا Console ولا 404؛ مسح Responsive (320 و375 و768 و1024 و1920 x ltr/light وrtl/dark) بلا Overflow أفقي؛ Playground: 26 فحصاً بتحريك كل عنصر تحكم (المعاينة تطابق Code Output، تهريب النص، الخيارات غير المنطبقة).
- **i18n:** تبديل en/ar/fr يحدّث اسم مؤشر الحالة (Online/متصل/En ligne) و`dir`، وProgress يعيد رسم نصه عند `bui:locale:change`.
- **الكيبورد:** Badge وAvatar وProgress غير قابلة للتركيز (لا عناصر تفاعلية).
- **التراجع:** 33 صفحة HTML (كل صفحات التوثيق والـ Fixtures و`index.html`) بلا Console ولا 404 عدا ما يلي، و`tests/manual/core.html` 43/43، و`node tools/build-icons.js --check` ينجح، و`node --check assets/js/baset-ui.js`، وصحة JSON للغات الثلاث.
- **مشكلة سابقة ليست من Task 10:** ظهر مرة واحدة 404 على `index.html` (لم يتكرر في إعادة التشغيل؛ لا يوجد `<link rel="icon">` في `index.html` فالمرجح `/favicon.ico`). الملف لم يُعدَّل في هذه المهمة (مطابق للأصل). لم يُعالج لأنه خارج النطاق.
- **لم يُختبر:** قارئات الشاشة (NVDA وVoiceOver)، خاصة إعلان تغيير Progress وقراءة عدد الشارة العائمة، Safari وFirefox، أجهزة لمس فعلية، Forced Colors على Windows الفعلي (بدائل Canvas وحدود Avatar مكتوبة بمحاكاة CSS فقط)، متصفحات بلا `@property` أو `:dir()` أو `background-clip: text`، صور Avatar حقيقية من الشبكة (Fixtures مولدة)، الاستخدام داخل Card/List Group/Dialog (غير منفذة).

### Added (Task 09: Button + Button Group + Close Button)
- `assets/css/baset-ui.css` (161,098 بايت خام و19,109 gzip، كان 140,405 و15,024): قسم 6 (Components) فيه ثلاثة مكونات CSS فقط، وComponent Tokens في الطبقة 3 (`--bui-btn-*` و`--bui-btn-close-*`).
- **Button:** 4 Variants (solid وoutline وghost وlink) x 6 ألوان دلالية x 3 أحجام (`sm`/`md`/`lg`)، `bui-btn--block` للعرض الكامل و`bui-btn--icon` لزر الأيقونة فقط، حالات hover وfocus-visible وactive وdisabled وloading. يعمل على `button` و`a` و`input type="button"`. Loading عبر `aria-busy="true"`: Spinner داخلي (`::before`) يحل محل الأيقونة ويمنع إدخال المؤشر.
- **Button Group:** صف وعمود (`--vertical`) وأحجام (`--sm`/`--lg`) وتحول عمودي متجاوب `--stack-sm|md|lg` (Mobile First)، تلاصق حدود وزوايا بـ Logical Properties يعمل في RTL، فاصل بلون النص بين أزرار solid.
- **Close Button:** زر مربع (`--sm`/`--md`/`--lg`) لأيقونة `x`، ألوانه Tokens يعيد المكون الأب تعريفها.
- ثلاث صفحات توثيق في `documentation/components/` (`button.html` و`button-group.html` و`close-button.html`) بالأقسام الثمانية بالترتيب وPlayground حقيقي لكل منها (Schema خاص: 9 و8 و4 عناصر تحكم)، مفعلة في `nav.js`.
- `tests/manual/button.html`: Fixture لمصفوفة Variant x Color x Size والحالات والمجموعات وClose Button، مع مبدلات الثيم والوضع والاتجاه (انظر ARCHITECTURE.md).

### Changed (Task 09)
- `instructions/`: `COMPONENT_DEVELOPMENT.md` (قسم **النمط المرجعي**: تسمية Tokens وبنية CSS وشكل Playground Schema)، `NAMING_CONVENTIONS.md` (Tokens الخاصة `_` والحالة بالسمة وKeyframes)، `COMPONENTS_REGISTRY.md` (المكونات الثلاثة Documented وملاحظات الأنظمة)، `ARCHITECTURE.md` (قسم Task 09)، `CORE_ASSETS.md` وPROJECT_OVERVIEW.md وRTL_LTR_AND_THEMES.md وINTERNATIONALIZATION.md وCUSTOMIZATION_AND_PLAYGROUND.md (أسطر الحالة فقط).
- حُذف `documentation/components/.gitkeep` لأن المجلد لم يعد فارغاً (قاعدة 5 في ARCHITECTURE.md).
- `assets/i18n/*.json`: **لم تتغير.** المكونات تعيد استخدام `common.close` و`common.loading`.

### Changed (Task 09, تسمية مختصرة بطلبك)
- الأصناف: `bui-btn` و`bui-btn-group` و`bui-btn-close` (بدل `bui-button` و`bui-button-group` و`bui-close-button`)، والـ Modifiers كما هي (`bui-btn--outline`، `bui-btn--lg`، `bui-btn-group--stack-md`). الـ Tokens: `--bui-btn-*` و`--bui-btn-close-*`، والـ Keyframes `bui-btn-spin`. بدون Aliases للأسماء القديمة. القاعدة وجدول الاختصارات المعتمدة في `NAMING_CONVENTIONS.md`. أسماء الملفات (`button.html`) وSchemas الـ Playground (`button`) بقيت كما هي.

### Decisions (Task 09)
- **النمط المرجعي** (التفاصيل في COMPONENT_DEVELOPMENT.md): Tokens عامة `--bui-{component}-{prop}[-{size}]` في الطبقة 3؛ قيم خاصة `--bui-{component}-_*`؛ الألوان تأتي من Tokens الألوان الدلالية عبر Modifier اللون (فيتحكم الثيم بها دون Tokens لونية خاصة بالمكون)؛ Modifier افتراضي لكل خيار؛ Playground Schema يحذف القيم الافتراضية من Code Output.
- **السمة هي الحالة:** `disabled` و`aria-disabled="true"` و`aria-busy="true"` وليس فئة `is-loading`. السبب: نقل الحالة الدلالية مع الشكل في مكان واحد وعدم تكرارها. `aria-busy` وحدها تمنع المؤشر فقط ولا تمنع Enter/Space: موثق، والتوصية معالج يتحقق من السمة أو إضافة `disabled`.
- **Loading لا يخفي النص:** Spinner بجانب النص (يحل محل الأيقونة) بدل تغطية الزر، فيبقى النص مقروءاً. الثمن: عرض الزر يتغير عند التبديل إن لم يكن فيه أيقونة. `aria-busy` لا تعلنها قارئات الشاشة غالباً فيُوصى بنص مخفي `common.loading` داخل الزر.
- **`input type="button"` لا يدعم Spinner ولا أيقونة** (عنصر بلا محتوى): موثق، يدعم باقي الخيارات.
- **رابط معطل:** بلا `href` ومعه `role="link"` و`aria-disabled="true"`؛ `aria-disabled` وحدها على رابط له `href` لا توقف تنقل الكيبورد.
- **التحول العمودي المتجاوب:** `--stack-{sm|md|lg}` (576 و768 و992). الأساس عمودي و`min-width` يعيد الصف. تُنفذ الأعلام `_h`/`_v` بدل تكرار قواعد الزوايا لكل نقطة.
- **فاصل أزرار solid:** خط بلون نص الزر (`--bui-color-*-contrast`) على حافة البداية فقط، لأن حدودها بلون الخلفية فتختفي عند التلاصق. أزرار outline تتداخل حدودها بدل ذلك.
- **أهداف اللمس** (`pointer: coarse`): Button 40 و44 و48px، Close Button 36 و44 و48px. حجم `sm` على اللمس أقل من توصية 44px وأعلى من حد WCAG 2.2 AA (24px).
- **Close Button:** الاسم `aria-label` ثابت بالإنجليزية (يعمل بلا JS) + `data-bui-i18n-attr="aria-label:common.close"` للترجمة (يحتاج `baset-ui.js`)، لأن CSS وحده لا يترجم. يتطلب Extension الأيقونات في Include وإلا يظهر فارغاً (موثق).
- `Spinner` يُبطأ (2s) تحت `prefers-reduced-motion` ولا يتوقف لأنه مؤشر حالة، بخلاف بقية الحركة التي تتوقف بـ Tokens المدة.

### Tested (Task 09, Chromium 157 عبر Playwright فقط، خادم http محلي)
- **التباين:** 2,984 عينة لـ Button (4 Variants x 6 ألوان x 3 أحجام x حالات rest وhover وactive وfocus-visible وloading، إضافة a وinput، x default وocean x Light وDark x LTR وRTL): أدنى نسبة نص 5.02:1 (solid warning، Light)، أدنى حلقة تركيز 6.01:1، أدنى حد outline 5.02:1. Close Button: 48 عينة، أدنى 5.90:1 (سكون) و12.28:1 (hover) و9.96:1 (active). حالات hover وactive وfocus بإجبارها عبر CDP (`CSS.forcePseudoState`)، وتأكد أن الستايل يتغير فعلاً. disabled مستثنى من الشرط.
- **الهندسة:** زوايا وتداخل الحدود في الصف والعمود وLTR وRTL (الزر الأول يمين في RTL)، وStack عند 320 و575 و576 و767 و768 و992 و1920، الفاصل على الحافة الصحيحة في الاتجاهين، الأحجام (32 و40 و48)، زر الأيقونة مربع، الزر الكامل يلتف النص بلا Overflow.
- **الكيبورد والمؤشر:** Enter وSpace على button وinput وClose Button، Tab يتخطى المعطل والرابط بلا `href`، المعطل لا يطلق Click، `aria-disabled` و`aria-busy` يمنعان المؤشر، `aria-busy` وحدها لا تمنع الكيبورد (كما هو موثق)، حلقة التركيز ظاهرة (2px بإزاحة 2px).
- **Responsive:** 256 تركيبة (3 صفحات توثيق + Fixture x 8 عروض 320-1920 x اتجاهان x وضعان x ثيمان) بلا Overflow أفقي ولا أخطاء Console ولا 404.
- **Playground:** 62 فحصاً بتحريك كل عنصر تحكم في الصفحات الثلاث: المعاينة تطابق Code Output، تهريب النص، Reset، عدم تطبيق الخيارات غير المنطبقة.
- **i18n:** `node tests/i18n-keys.js` ينجح (لم تتغير الملفات)، وتبديل en/ar/fr يحدّث `aria-label` و`lang` و`dir` فعلياً. **لمس:** محاكاة `pointer: coarse` (hasTouch وisMobile) تعطي الأحجام أعلاه. **Reduced motion وForced Colors:** بمحاكاة Chromium.
- **التراجع:** 26 صفحة (كل صفحات التوثيق و`index.html`) بلا Console ولا 404، و`tests/manual/core.html` 43/43، و`node tools/build-icons.js --check` ينجح، و`node --check` للـ JS، وصحة JSON.
- **لم يُختبر:** قارئات الشاشة (NVDA وVoiceOver)، Safari وFirefox، أجهزة لمس فعلية، Forced Colors على Windows الفعلي، متصفحات أقدم من الحديثة (الـ CSS يعتمد على `:dir()` و`:not()` بقوائم و`calc()` بقيم أعلام و`@media (hover)`)، الاستخدام داخل Alert/Dialog/Toast (غير منفذة).

### Added (Task 08: Playground Framework)
- `documentation/assets/js/playground.js` (45,061 بايت) و`documentation/assets/css/playground.css` (11,895 بايت): إطار Customize مشترك للتوثيق بلا Dependencies. `BUI_DOCS_PLAYGROUND.define(name, schema)` و`mount(element, schema)` و`escape(text)`؛ النسخة: `getState` و`setState` و`reset` و`resetPreview` و`destroy`.
- Schema: `controls` بثمانية أنواع (select وradio-group وcheckbox وswitch وrange وtext وnumber وcolor) مع قيم افتراضية، و`template(state, helpers)` يرجع HTML أو `{ html, js }`، و`beforeRender`/`afterRender` اختياريان. تحقق من الـ Schema برسائل خطأ واضحة.
- معاينة حية، Code Output بكتلتين (HTML وJavaScript) بنسخ مستقل، Reset options وReset preview، Light/Dark وRTL/LTR على حاوية المعاينة فقط، أزرار عرض (Full وBase 320 وXS..XXXL من `--bui-bp-*`) مع مقبض سحب وكيبورد، وإعلان مهذب (polite، مؤجل 700ms) لقارئ الشاشة.

### Changed (Task 08)
- `documentation/assets/js/docs.js` (+6 أسطر): يعرّض `window.BUI_DOCS_HELPERS = { highlight, copyText }` ليعيد الإطار استخدام التلوين والنسخ. سبب خروجه عن قائمة الملفات موثق في `ARCHITECTURE.md`.
- `instructions/CUSTOMIZATION_AND_PLAYGROUND.md` (شكل Schema وطريقة الاستخدام والقيد المعروف؛ أُزيل وسم "مستقبلي")، `instructions/templates/COMPONENT_DOCUMENTATION_TEMPLATE.md` (مثال استخدام قسم Customize وبند قائمة تحقق)، `instructions/ARCHITECTURE.md`، `instructions/COMPONENTS_REGISTRY.md`، `instructions/PROJECT_OVERVIEW.md` و`README.md` (سطر الحالة).

### Decisions (Task 08)
- **العرض يطابق المطلوب ولا يُقصّ بعمود الصفحة:** عمود محتوى التوثيق نحو 820px حتى على شاشة 1920، فلو قُصّ العرض لانهارت أزرار XL وXXL وXXXL إلى القيمة نفسها. الحاوية تأخذ العرض فعلاً (320 إلى 1920) و**منطقة العرض** تتمرر أفقياً (منطقة مسماة قابلة للتركيز)، فلا Overflow للصفحة.
- الحاوية تحمل أيضاً `data-bui-theme` للصفحة وتتبع تغييره: Dark الخاص بـ Theme (ocean) لا يُطبق إلا إن حمل العنصر الوسمين معاً. هذه إضافة على `data-bui-mode` و`dir` المطلوبين.
- القيمة الابتدائية للوضع والاتجاه تتبع الصفحة ثم تستقل، وReset preview يعيدها من حالة الصفحة الحالية.
- المعاينة `innerHTML` (لا تنفذ سكربتات) و`helpers.escape` لقيم `text`؛ قيم بقية الأنواع مقيدة بالنوع. تُعرض `js` ولا تُنفذ، وتهيئة المكونات ذات JS عبر Hooks يتحمل كاتب الصفحة مطابقتها.
- Reset زران: خيارات المكون، والمعاينة (وضع واتجاه وعرض). لا اختصار كيبورد مخترع.
- قيم الإطار (نصوص الواجهة) إنجليزية ثابتة كباقي Shell، ولا تدخل ملفات i18n.
- **قيد معروف موثق:** عرض الحاوية لا يغيّر نتيجة `@media` (الأعمدة `md` تبقى جنباً إلى جنب في حاوية 320 على Viewport 1280)؛ المعاينة ليست بديلاً عن فحص الجهاز.

### Tested (Task 08, Chrome for Testing 153 عبر Playwright فقط، صفحة مؤقتة خارج المشروع لا تُسلَّم، وهي Fixture معلنة بعناصر HTML عادية)
- وظيفي (50 فحصاً): الأنواع الثمانية بالفأرة والكيبورد، التحديث متزامن، تطابق Code Output مع المعاينة بعد تغييرات متتالية، تهريب `<img onerror>` (لا تنفيذ)، `maxLength`، حالات `number` (خارج الحدود، فارغ)، Reset، `setState/getState`.
- الحاوية (78): Dark وRTL على الحاوية فقط (`<html>` وجسم الصفحة لا يتغيران، لون الخلفية يطابق Token الداكن)، Dark لثيم ocean صحيح، تتبع تغيير الثيم، عرض بدقة كل Breakpoint، سحب الفأرة (LTR وRTL معكوس) وأسهم/Home/End/Shift، حدود 320 و1920، Reset preview.
- التخطيط (51): 128 تركيبة (8 عروض x اتجاهان x وضعان x ثيمان x عرضان) بلا Overflow ولا عنصر مقصوص؛ التباين (4 تراكيب ثيم/وضع) للنص والحدود والمقبض ومفتاح التبديل؛ الأهداف 24px (مؤشر عادي) و44px (محاكاة `pointer: coarse`)؛ تأكيد القيد المعروف.
- الوصولية والدورة (76): أسماء كل العناصر، Tab يصل لكل عنصر، تشغيل كل عنصر بالكيبورد وأزرار Reset، حلقة تركيز ظاهرة، إعلان مؤجل وحيد للتغييرات السريعة وفوري للـ Reset، Copy (نجاح وفشل مع تحديد الكود)، `prefers-reduced-motion`، Forced Colors بمحاكاة، `destroy` متوازن المستمعين وObserver، تركيب مزدوج، 14 حالة Schema خاطئة (خطأ واضح بلا كسر وقالب يرمي استثناء ويتعافى).
- تراجع: 23 صفحة x (1280 LTR فاتح، 320 RTL داكن) بلا Console ولا Overflow (ملاحظة قديمة موجودة دون تعديلاتي: طلب `/favicon.ico` على `index.html` يعطي 404)، `core.html` 43/43، `tests/i18n-keys.js` وبناء الأيقونات `--check` ناجحان، وCopy في صفحة موجودة ما زال يعمل.
- **غير مختبر:** قارئات الشاشة، Safari/Firefox، أجهزة اللمس الفعلية، Hooks مع مكون JS حقيقي، Forced Colors على Windows الفعلي.

### Added (Task 07: Icons System)
- `assets/icons/{thin,light,regular,solid,bold,duotone}/{name}.svg` و`assets/icons/icons.json`: 51 أيقونة بستة أوزان (Phosphor Icons 2.1.1، MIT؛ `solid` = "fill")، منسوخة مرة واحدة دون تغيير في التصميم. الأسماء والفئات والكلمات المفتاحية في `icons.json` من بيانات Phosphor.
- `assets/css/extensions/baset-ui-icons.css` (149,674 بايت خام، 28,515 gzip): Extension CSS فقط، مولَّد. الفئات `bui-icon-{weight}` و`bui-icon-{name}` و`bui-icon-{sm|md|lg|xl}` و`bui-icon-flip-rtl`، الوزن الافتراضي `light`، التلوين بـ `currentColor`، Tokens `--bui-icon-size-*`، ودعم Forced Colors والطباعة. لا JavaScript ولا Global جديد.
- `tools/build-icons.js`: مولّد بلا Dependencies (`node tools/build-icons.js` و`--check`): يتحقق من الأوزان الستة ومن سلامة الـ SVG (يرفض سكربتات وروابط وصوراً مضمنة)، ويولّد الـ CSS وبيانات الكتالوج.
- `documentation/advanced/icons.html` (مفعلة في `nav.js`) و`documentation/assets/js/icons-data.js` (مولَّد): كتالوج بشبكة وبحث (بالاسم والكلمات المفتاحية) وتصفية (فئة، اتجاهية) واختيار وزن العرض، ولوحة تفاصيل بـ `<dialog>` أصلي: الأوزان الستة، الحجم واللون وقلب RTL وزخرفية/بوسم، كود HTML مطابق للمعاينة مع Copy.
- `docs.css`: أصناف الكتالوج `bui-docs-icon-*` (docs فقط).
- `THIRD_PARTY.md`: إسناد Phosphor ونص ترخيص MIT.

### Changed (Task 07)
- `ICONS_SYSTEM.md` أُعيد كتابته (القرارات، الاستخدام، المجموعة الأولية، إجراء الإضافة، الحجم، Accessibility). `ARCHITECTURE.md` (مجلد `tools/` والملفات الجديدة)، `CORE_ASSETS.md` (أول Extension)، `ROADMAP.md` (قرار الأيقونات حُسم)، `TESTING.md`، `COMPONENTS_REGISTRY.md`، `PROJECT_OVERVIEW.md`، `README.md` (سطر الحالة).
- حذف `.gitkeep` من `assets/icons/` و`assets/css/extensions/` (لم يعودا فارغين).

### Decisions (Task 07)
- المصدر: Phosphor (MIT)، وهو مصدر نسخ لمرة واحدة وليس Dependency. التقنية: SVG Mask. الملف: Extension (حجمه بعيد عن 15KB ولا تحتاجه معظم الصفحات). استثناء موثق: Extension بلا `BUI.register` لأنه CSS فقط.
- **تصحيح لتقدير سابق:** Duotone لا يحتاج طبقتين ولا يضاعف الحجم؛ القناع يحتفظ بقناة alpha فيظهر الشكل الخلفي بـ 20% من اللون من نفس الملف.
- اسم الفئة يعتمد على Custom Properties داخلية لكل وزن (`--bui-icon-{weight}-src`) على فئة الأيقونة، وفئة الوزن تختار منها؛ لأن CSS لا يجمع فئتين في `url()` واحد. الخصائص الداخلية مسجلة `@property` بلا وراثة.
- القلب في RTL بفئة يدوية `bui-icon-flip-rtl` (`:dir(rtl)`) وليس تلقائياً.
- فئات محجوزة لا تصلح أسماء أيقونات: الأوزان وsm/md/lg/xl وflip-rtl (يفحصها المولّد).
- مجلد `tools/` جديد لأداة بلا Dependencies، وبيانات الكتالوج في ملف JS مولَّد (ليعمل من `file://`)، وكلاهما موثق في `ARCHITECTURE.md`.
- الكتالوج يستخدم `<dialog>` أصلياً docs-only ولم يُنشأ `BUI.dialog` (Task 13).

### Tested (Task 07, Chromium 157 عبر Playwright فقط، خادم http محلي)
- الأوزان الستة: قيم `mask-image` مختلفة، والافتراضي = light، ورسم فعلي بالبكسل (الشكل غير فارغ ولا مربع ممتلئ؛ solid أثقل من thin وbold أثقل من regular؛ duotone فيه نغمة 20%). اللون `currentColor`، والأحجام (1em/16/24/32/48)، والقلب في RTL فقط مع الفئة.
- الكتالوج: بحث بالاسم والكلمة المفتاحية (يتسامح مع الشرطة/المسافة)، تصفية الفئة والاتجاهية (6)، حالة الفراغ، تغيير وزن الشبكة. الـ dialog: فتح بـ Enter، التركيز داخله، الكود مطابق للمعاينة (HTML الفعلي)، الأوزان بأسهم الكيبورد، Esc والنقر على الخلفية وزر Close، عودة التركيز للمصدر، Copy (Clipboard) وفق حالة الاختبار، وعدم تسرب التركيز لعناصر الصفحة (الانتقال إلى واجهة المتصفح هو سلوك `showModal()` الأصلي).
- Forced Colors (محاكاة Chromium): الأيقونة ظاهرة بلون نظام.
- 64 تركيبة (8 عروض 320-1920 x ltr/rtl x light/dark x default/ocean) والـ dialog مفتوح: بلا Overflow أفقي، الـ dialog داخل الشاشة، بلا أخطاء Console ولا 404.
- تراجع: 23 صفحة (index وكل صفحات التوثيق) بلا أخطاء ولا Overflow؛ `tests/manual/core.html` 43/43 بوضعي autoInit؛ `node tests/i18n-keys.js` ناجح؛ `BUI` بلا أعضاء جديدة؛ `node tools/build-icons.js --check` ناجح.
- لم يُختبر: قارئات الشاشة، Safari/Firefox، أجهزة اللمس، Forced Colors على نظام فعلي، متصفحات لا تدعم `:dir()` أو `mask` بلا بادئة، أداء الرسم مع آلاف الأيقونات.

### Added (Task 06: Theme Manager + Locale Manager)
- `assets/js/baset-ui.js` (52,004 بايت خام، 12,143 gzip، +18,376 عن Task 05): `BUI.theme` (`set`, `setMode`, `toggleMode`, `get`, `getMode`, `load`) و`BUI.locale` (`use`, `t`, `get`, `getDirection`, `register`, `apply`). الأحداث `bui:theme:change` و`bui:locale:change`. ما زال الـ Global الوحيد `BUI`.
- `assets/css/themes/ocean.css` (5,405 بايت): ثيم Light وDark يعيد تعريف الألوان والخط والـ Radius والظلال وعرض الحد السميك وسماكة Focus دون لمس Core. تباين 40/40 في Light وDark.
- `assets/i18n/fr.json` بنفس مفاتيح `en` و`ar`. مفاتيح جديدة لكل اللغات: `common.showing` و`common.items` (جمع).
- `tests/i18n-keys.js`: اختبار تطابق المفاتيح والمتغيرات والبنية بلا Dependencies.
- صفحات التوثيق: Themes وDark Mode (`documentation/customization/`)، RTL & LTR وInternationalization (`documentation/advanced/`)، مفعلة في `nav.js`.
- Navbar التوثيق: مبدّل ثيم (Default/Ocean) ومبدّل RTL/LTR، وزر الوضع مربوط بـ `BUI.theme`.

### Changed (Task 06)
- كل صفحات التوثيق و`index.html` وقالب الصفحة: Snippet `<head>` بمفتاحي `bui-theme` و`bui-mode` (بدل `bui-docs-mode`) ورابط `ocean.css`. أُزيل `bui-docs-mode`، فتفضيل الوضع المحفوظ سابقاً في المتصفحات لن يُقرأ مرة واحدة.
- `docs.js`: القيم الحية والتباين تتبع ثيم الصفحة وتُحدَّث عند تغيره، مع `data-docs-theme` اختيارياً. زر الوضع في Navbar تسميته ثابتة (`Dark mode`) مع `aria-pressed`، بدل تبديل النص. في العرض الضيق (أقل من 576px) يُخفى مربع البحث (معطل أصلاً) وتختصر الأزرار لتتسع عند 320px.
- `docs.css`: أصناف `bui-docs-select` و`bui-docs-input` و`bui-docs-demo-fill`، وإعادة ترتيب Navbar للعرض الضيق.
- التعليمات: `INTERNATIONALIZATION.md`, `RTL_LTR_AND_THEMES.md`, `JAVASCRIPT_API.md`, `CORE_ASSETS.md`, `ARCHITECTURE.md`, `TESTING.md`, `COMPONENT_DOCUMENTATION.md`, `COMPONENTS_REGISTRY.md`, `PROJECT_OVERVIEW.md`، وقالب `templates/DOC_PAGE_TEMPLATE.html`، و`README.md` (سطر الحالة).
- حذف `.gitkeep` من `assets/css/themes/` و`documentation/advanced/` (لم يعودا فارغين).

### Decisions (Task 06)
- ترتيب تحديد الوضع: المحفوظ ثم `prefers-color-scheme` ثم `data-bui-mode` في الـ HTML. تفضيل النظام يتفوق على سمة الـ HTML، وإلا لما احترم نظام لقوالب تكتب `light` دائماً.
- اختيار الوضع صراحة يوقف تتبع النظام حتى لو فشل الحفظ. `set()` لا يتحقق من وجود ملف الثيم. `load()` لا يفعّل الثيم.
- جمع الترجمة: كائن بفئات CLDR مع `other` إلزامي؛ اختبار التطابق يعامله كمفتاح واحد (لأن العربية ست فئات والإنجليزية اثنتان) ويقارن أسماء المتغيرات.
- `use()` يضبط `lang` و`dir` دائماً، ويطلق `bui:locale:change` عند تغير الرمز فقط. آخر استدعاء `use()` هو الذي يُطبَّق. فشل `fallback` تحذير؛ فشل اللغة الرئيسية رفض للوعد دون تغيير.
- `url` الافتراضي `../i18n/{code}.json` نسبةً إلى `baset-ui.js`. خيار `fallbackUrl` أُضيف لأن الـ Fallback يحتاج مساره. `BUI.locale.apply(root)` أُضيف لعناصر تُضاف بعد التحميل. لا خيار `locale` في `BUI.config`.
- HTML Binding: `data-bui-i18n-attr` يقبل أزواجاً `attr:key` تفصلها `;`، وسمات `on*` مرفوضة.
- مبدّل اتجاه التوثيق يضبط `<html dir>` ويحفظه بـ `bui-docs-dir` (docs فقط). لا حدث لتغيير `dir` مباشرة.
- ocean: خطوط نظام فقط (لا خطوط خارجية)، ولا يعيد تعريف success/warning/danger/info.

### Tested (Task 06, Chromium عبر Playwright فقط، خادم http محلي)
- `node tests/i18n-keys.js`: ناجح (3 ملفات، 8 مفاتيح)، وفشل مقصود في نسخة معدلة (مفتاح ناقص، متغير مختلف، مفتاح غير camelCase). `node --check` ناجح للـ JS.
- 26 فحصاً للثيم والتخزين: تبديل الثيم والوضع دون إعادة تحميل، الأحداث وتفاصيلها، الحفظ والاسترجاع بعد إعادة التحميل، `load()`، `localStorage` محجوبة (`get` يرمي) و`setItem` يرمي: بلا أخطاء، `prefers-color-scheme` (بدء، تتبع حي، التوقف بعد اختيار صريح، المحفوظ يتفوق).
- 18 فحصاً للغة: ar/fr/en بالواجهة (lang وdir وBinding والمتغيرات والجمع العربي لست فئات والفرنسي)، انقلاب الـ Shell (الـ Sidebar يمين)، مفتاح مفقود (يرجع المفتاح ويحذر مرة)، `register`، سباق `use()`، `fallback:false`، `apply`، رفض `on*`، وفشل `file://` برسالة واضحة.
- Snippet منع الوميض: السمات والأنماط مطبقة قبل تحميل Core المؤخر 1.5 ثانية. Keyboard: Tab/Enter/Space/الأسهم على عناصر Navbar الجديدة.
- 648 تركيبة (9 صفحات x 9 عروض 320-1920 x ثيمين x وضعين x اتجاهين): بلا Overflow أفقي ولا أخطاء Console ولا 404. تباين 40 ثنائية: Default وOcean، Light وDark: 40/40. `tests/manual/core.html`: 43/43 (http وfile، autoInit تشغيل وإيقاف). مقطع "استبدال Default" في صفحة Themes اختُبر فعلاً في Light وDark.
- لم يُختبر: Safari/Firefox، أجهزة اللمس، قارئات الشاشة، Forced Colors، تأثير الثيم أو اللغة على مكونات (لا مكون منفذ)، `file://` للتحميل (غير مدعوم عمداً).

### Added (Task 05: Core JavaScript)
- `assets/js/baset-ui.js`: نواة `BUI` (33,628 بايت خام، 7,806 gzip): `version`, `config`, `register`, `init`, `getInstance`, `destroy`, `destroyAll`, `on/off/emit`, `trigger`, `options` (Parser)، `dom`, `utils`, `log`، وObserver اختياري. Global واحد فقط: `BUI`.
- `tests/manual/core.html`: 43 فحصاً ذاتي التشغيل (مكونات تجريبية داخل الصفحة فقط)، يدعم `?autoinit=0`.
- صفحات التوثيق: `documentation/javascript/` (introduction, initialization, events, api-reference) مفعلة في `nav.js`.
- `CORE_ASSETS.md`: قسم آلية تسجيل Extensions.

### Changed (Task 05)
- `JAVASCRIPT_API.md` أُعيد كتابته: الواجهة المنفذة مفصلة، وما بقي "مستقبلي" محدد صراحة.
- `COMPONENT_DEVELOPMENT.md` (وسما `BUI.init()` وgetInstance لم يعودا مستقبليين)، `ARCHITECTURE.md` (tests/manual وصفحات JavaScript)، `TESTING.md` (سطر الحالة)، `COMPONENTS_REGISTRY.md`، `README.md` و`PROJECT_OVERVIEW.md` (سطر الحالة فقط).

### Decisions (Task 05)
- اسم المكون kebab-case عند `register`؛ Factory بـ camelCase (`BUI.datePicker`)؛ السمة `data-bui-<name>`؛ قيمة السمة تختار الـ Variant.
- أسماء أحداث DOM kebab-case (`before-open`). `BUI.trigger` يرجع `false` عند الإلغاء أو عند وسيط غير صالح.
- `create()` يجب أن يرجع نسخة بها `destroy()`، والـ Core يغلّفه ليزيل النسخة من السجل. أنواع الخيارات تُستنتج من القيم الافتراضية.
- `BUI.config` يقبل `autoInit` و`observe` و`logLevel` فقط؛ مفتاح غير معروف يُرفض بتحذير (الأنظمة اللاحقة تضيف مفاتيحها بنفسها).
- `WeakMap` للنسخ و`WeakRef` لتمكين `destroyAll()` دون مراجع قوية.
- الـ Observer يهيئ فقط ولا يهدم عند الإزالة (قد يعاد إدراج العنصر).

### Fixed (Task 05)
- أثناء الاختبار: حارس التلوث بـ `__proto__` في `deepMerge` كان يقارن `FORBIDDEN_KEYS[key] === 1` فيُرجع `Object.prototype` للمفتاح `__proto__` ولا يحجبه (تلويث فعلي). استُبدل بمقارنة مباشرة بالمفاتيح، وأُضيف اختبار لذلك.

### Tested (Task 05, Chromium 153 عبر Playwright فقط)
- `tests/manual/core.html`: 43/43 ناجح (autoInit تشغيل وإيقاف)، وعبر `file://`، ومع إعادة التشغيل بـ RTL وDark. صفحة بيضاء بالمكتبة فقط: Global جديد واحد هو `BUI`. `node --check` ناجح.
- 8 صفحات (4 جديدة و4 سابقة) x LTR/RTL x Light/Dark x 8 عروض (320-1920): بلا Overflow أفقي ولا أخطاء Console ولا 404.
- لم يُختبر: Safari/Firefox، أجهزة اللمس، قارئات الشاشة، Component حقيقي فوق الـ Core.

### Added (Task 04: Utilities)
- `baset-ui.css`: Display (`bui-d-{none,block,inline,inline-block,flex,inline-flex,grid}` + نسخ لكل Breakpoint)، Position (النوع بنسخ Breakpoint، Offsets منطقية `top/bottom/start/end` بقيم 0/50/100، translate-middle وx وy، Z-index من Tokens)، Overflow (كل المحاور + نسخ Breakpoint، `bui-text-truncate`، `bui-line-clamp-1..5`)، Visibility (`visible`, `invisible`, `visually-hidden`, `visually-hidden-focusable`)، Borders (عرض/نمط/لون من Tokens، جوانب منطقية t/b/s/e وإزالتها، Radius بالمقياس مع زوايا منطقية ss/se/es/ee، Shadows).
- حجم `baset-ui.css`: 140,405 بايت خام (+24,308 عن Task 03)، 14,419 بايت gzip. مولَّد بسكريبت لمرة واحدة غير مُسلَّم، كل قاعدة تُصرَّح مرة واحدة.
- صفحات التوثيق: `documentation/utilities/` (display, position, overflow, visibility, borders) مفعلة في `nav.js`.

### Changed (Task 04)
- `COMPONENTS_REGISTRY.md` (Utilities: Documented، وصفحات Utilities الخمس) و`CORE_ASSETS.md` و`PROJECT_OVERVIEW.md` و`RTL_LTR_AND_THEMES.md`: تحديث الحالة والملاحظات.

### Decisions (Task 04)
- كل أدوات Task 04 بـ `!important` (الاستثناء المسموح) وموثق في كل صفحة.
- `bui-flex` و`bui-inline-flex` (Task 03) أُبقيا للتوافق، و`bui-d-flex` و`bui-d-inline-flex` هما الشكل ذو النسخ المتجاوبة.
- translate-middle يقلب الإزاحة الأفقية في RTL بـ `:dir(rtl)`؛ يتطلب متصفحاً حديثاً.
- عرض/نمط الحد كخصائص `--bui-util-border-*` معرّفة بـ `@property` (`inherits:false`) كي لا تتسرب من أب إلى أبناء.
- الـ Borders والـ Visibility والـ z-index والـ Offsets وtruncate/line-clamp بلا نسخ Breakpoint لأنها لا تغيّر البنية، وأضيف ذلك للتوثيق.
- أمثلة صفحات Utilities الخمس تستخدم أدوات المكتبة نفسها فقط (`bui-border` و`bui-border-primary` و`bui-rounded-sm` و`bui-p-2` وغيرها) بلا أي صنف `bui-docs-demo-*`، فيكون الكود المنسوخ نظيفاً. لا توجد أدوات للخلفية ولا لمحاذاة النص ولا للأبعاد، لذا تُستخدم Styles مضمنة (`grid-template-columns`, `height`, `width`) حين يلزم، بدل تعديل `docs.css`.
- صفحات Layout وCustomization من Task 03 لم تُعدَّل وما زالت تستخدم `bui-docs-demo-*`.

### Tested (Task 04, Chromium 153 عبر Playwright فقط)
- 5 صفحات x LTR/RTL x Light/Dark x 8 عروض (320/480/576/768/992/1200/1600/1920): بلا Overflow أفقي، بلا أخطاء/تحذيرات Console، بلا 404. 14 صفحة في المشروع تعمل بلا أخطاء (تراجع).
- Computed Style: Display المتجاوب، جوانب Border وزواياه منطقياً في LTR/RTL، عدم تسرب العرض/النمط، translate-middle بالاتجاهين، line-clamp، Visually-hidden (التركيز بـ Tab يُظهره)، Z-index.
- لم يُختبر: قارئ شاشة، Safari/Firefox، Forced Colors، أجهزة لمس، Print.

### Added (Task 03: Design Tokens + Layout)
- `baset-ui.css`: Tokens كاملة (Neutral Scale، 6 ألوان Semantic x 6 أشكال، Aliases، Typography، Spacing 0-6، Borders، Radius، Shadows، Motion، Z-index، Focus Ring، Breakpoints، Container) بوضعي Light وDark.
- `baset-ui.css`: Layout (`bui-container`, `bui-container-fluid`, Grid 12 عمود مع Gutters وOffset وOrder وRow Cols) وUtilities (Flexbox وSpacing بـ Logical Properties) بنسخ متجاوبة لكل Breakpoint.
- حجم `baset-ui.css`: 116,097 بايت خام (12,140 بايت gzip)، مولَّد بسكريبت لمرة واحدة غير مُسلَّم، بلا تكرار قواعد (كل قاعدة تُصرَّح مرة واحدة).
- صفحات التوثيق: `layout/` (breakpoints, container, grid, flexbox, spacing) و`customization/` (colors, typography, css-variables)، مفعلة في `nav.js`.
- `docs.js`: خلايا قيم Tokens حية، جدول تباين WCAG محسوب حياً، مؤشر Breakpoint الحالي. `docs.css`: عناصر العرض التوضيحي (`bui-docs-*`).

### Changed (Task 03)
- `baset-ui.css`: محددات Tokens صارت `[data-bui-mode]` و`[data-bui-theme]` بدل `:root` فقط (تعمل على أي عنصر). أسماء الـ Tokens القديمة لم تتغير (`--bui-color-primary`, `--bui-space-1..5`, `--bui-radius-md`, `--bui-shadow-sm`, ...).
- `RTL_LTR_AND_THEMES.md` و`CORE_ASSETS.md` و`COMPONENT_DOCUMENTATION.md` و`README.md` و`PROJECT_OVERVIEW.md`: تحديث الحالة والمحددات والاستثناء الموثق (انظر Decisions).

### Decisions (Task 03)
- ثلاث طبقات Tokens: Raw حسب الوضع، Static على `:root`، وAliases/Component تُعاد تعريفها على كل Scope بـ `var()` فقط (القاعدة في صفحة CSS Variables وفي `RTL_LTR_AND_THEMES.md`). السبب: قيمة `var()` تُحسب عند التصريح، فبدون إعادة التصريح يبقى Alias موروثاً بقيمة الصفحة.
- Utilities (Flex وSpacing) تستخدم `!important` لأن قسم Utilities يسبق قسم Components بالترتيب الإلزامي. Grid/Container بدون `!important`.
- كل نسخ الـ Breakpoints (Layout وUtilities) في القسم 7 مرتبة تصاعدياً.
- `bui-flex` و`bui-inline-flex` أُضيفا لأن بقية أدوات Flex تحتاج Flex Container، ولا يُعدّان بديلاً عن Display Utilities (Task 04).
- Gutter Classes من 0 إلى 5 فقط وبدون نسخ متجاوبة، لتفادي Overflow أفقي (القاعدة: Gutter <= ضعف `--bui-container-padding-x`).
- لا Web Fonts (لا Dependencies): Fallback عربي بخطوط النظام.
- صفحات Layout وCustomization معفاة من الأقسام الثمانية (ليست Components)، موثق في `COMPONENT_DOCUMENTATION.md`.
- الأرقام في جداول التوثيق (قيم Tokens ونسب التباين) لا تُكتب يدوياً: تُقرأ من CSS عند التحميل.

### Added (Task 02: Docs Page Template)
- `instructions/templates/DOC_PAGE_TEMPLATE.html`: قالب صفحة توثيق (هيكل Component بالأقسام الثمانية وAnchors ثابتة).
- `docs.js`: بناء Navbar/Sidebar/Footer حول `<main>`، Breadcrumb، فهرس "On this page" مع Scroll Spy، Previous/Next من `nav.js`، Example Block، Code Block مع Copy وتلوين ذاتي، تغليف الجداول، ومناطق التمرير القابلة للتركيز.
- `docs.css`: تنسيق عناصر الصفحة (`bui-docs-*`) بمنطق Mobile First وLogical Properties.
- مجلدات `documentation/javascript/`, `accessibility/`, `advanced/`, `development/` (مع `.gitkeep`).
- `COMPONENT_DOCUMENTATION.md`: عقد عناصر الصفحة وإجراء إضافة صفحة محدث. `nav.js`: توثيق الصيغة في الرأس (لا تغيير في البيانات).

### Changed (Task 02)
- `ARCHITECTURE.md`: مكان كل قسم من الـ Sidebar في المجلدات، وقرار المسارات (`data-root`).
- `docs.css`: `overflow-x: hidden` على `html, body` استُبدل بـ `clip`، وقاعدة `max-width` لزر GitHub حُوّلت إلى Mobile First.

### Fixed (Task 02)
- Navbar والـ Sidebar لم يكونا يثبتان عند التمرير (`position: sticky` معطل لأن `overflow-x: hidden` على `html` و`body` يجعل `body` حاوية تمرير). أُصلح بـ `overflow-x: clip`.

### Decisions (Task 02)
- `data-root` على `<html>` هو مصدر الجذر للصفحات المتداخلة، مع استنتاج بديل من مسار `docs.js`؛ لا مسارات مطلقة بسبب `/Baset-UI/` وfile://. السبب في `ARCHITECTURE.md`.
- Forms وData Display داخل `documentation/components/`؛ أي صفحة بعمق مجلدين وقيمة `data-root` لها `../../`.
- كود الـ Example يُولَّد من المعاينة الحية نفسها لضمان تطابقه مع ما يعمل.
- `index.html` لم يُعدَّل (Shell ثابت من Task 01 يعمل كما هو).

### Added
- Task 01 (Foundation): إعادة تأسيس المشروع من الصفر.
- هيكل المستودع (`assets/`, `documentation/`, `instructions/`, `tests/`, `examples/`).
- مجلد `instructions/` بـ 20 ملفاً و3 قوالب.
- `assets/css/baset-ui.css`: Design Tokens افتراضية (Light/Dark) وBase فقط.
- `assets/js/baset-ui.js`: ملف تعليمات فقط بلا تنفيذ.
- `assets/i18n/en.json` و`ar.json`: الهيكل ومفاتيح `common` الأولية فقط.
- واجهة التوثيق: Navbar، Sidebar (قابل للطي، Mobile)، Footer، منطقة محتوى فارغة.
- `LICENSE` (MIT، مبدئي) و`.nojekyll` و`.gitignore`.

### Changed
- روابط GitHub تشير إلى المستودع الرسمي وموقع Pages الرسمي.
- إضافة مرحلة التسليم (Preview + ZIP) إلى سير العمل وقواعد الـ AI.

### Decisions
- Sidebar يُرسم من `documentation/assets/js/nav.js` لسهولة إضافة الروابط.
- لا أيقونات في Shell التوثيق الحالي (رسم CSS) لأن نظام الأيقونات غير منفذ بعد.
