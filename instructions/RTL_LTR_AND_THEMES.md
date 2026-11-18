# الاتجاهات (RTL/LTR) والـ Themes

> الحالة (Task 06): **Theme Manager (`BUI.theme`) منفذ**، وثيم `ocean` (Light/Dark) في `assets/css/themes/ocean.css`. Tokens الافتراضية (Light/Dark) في `baset-ui.css` (Task 03). Task 04: أدوات Borders تقرأ Tokens، وtranslate-middle يعتمد `:dir(rtl)`. التوثيق الموجه للمستخدمين: صفحات Themes وDark Mode وRTL & LTR في `documentation/`. لا مكون منفذ بعد، فتأثير الثيم على المكونات غير مختبر.

## RTL / LTR (إلزامي)
- الاتجاه يُحدد بـ `dir` على `<html>` (أو على حاوية لمعاينات محلية).
- استخدم **Logical Properties** حصراً: `margin-inline-start`، `padding-inline`، `inset-inline-start`، `border-start-start-radius`، `text-align: start`، `float: inline-start`. ممنوع `left/right` الفيزيائية إلا لمبرر (مثل رسم) موثق.
- Flex/Grid ينعكسان تلقائياً؛ لا تعكس يدوياً بـ `row-reverse` للاتجاه.
- الأيقونات الاتجاهية (أسهم، تقدم/رجوع) تنعكس في RTL ([ICONS_SYSTEM.md](ICONS_SYSTEM.md)).
- الحركة الاتجاهية (Slide) تستخدم متغيرات تعتمد على الاتجاه.
- JavaScript: اقرأ الاتجاه من `document.documentElement.dir` (أو `BUI.dom.isRTL()`) وتفاعل مع تغيره. لا يوجد حدث لتغيير السمة `dir` مباشرة؛ التغيير عبر `BUI.locale.use()` يطلق `bui:locale:change`، وللتغيير اليدوي تُراقَب السمة بـ `MutationObserver`.
- مبدّل الاتجاه في Navbar التوثيق (Task 06) يضبط `<html dir>` مباشرة ويحفظه بمفتاح docs فقط `bui-docs-dir` (ليس جزءاً من المكتبة).
- اختبر كل مكون بـ RTL وLTR.

## Theme Architecture
Theme = ملف CSS يعيد تعريف Tokens (وأحياناً Component Tokens) فقط، **دون تعديل ملفات Core**.

### السمات
```html
<html lang="en" dir="ltr" data-bui-theme="ocean" data-bui-mode="light">
```
- `data-bui-theme`: اسم الـ Theme (الافتراضي `default`).
- `data-bui-mode`: `light` | `dark`.

### التحميل
```html
<link rel="stylesheet" href="assets/css/baset-ui.css">
<link rel="stylesheet" href="assets/css/themes/ocean.css">
```

### طبقات Tokens
1. **Global Tokens:** `--bui-color-*`, `--bui-font-*`, `--bui-radius-*`, `--bui-shadow-*`, `--bui-space-*`.
2. **Component Tokens:** `--bui-grid-gutter`, `--bui-container-padding-x` (والمستقبلي `--bui-button-bg`) وتشتق افتراضياً من Global.
المكونات تقرأ Component Tokens فقط (مع Fallback إلى Global)، فيستطيع الـ Theme التحكم بكل مكون دون كتابة Selectors له.

**التنفيذ في `baset-ui.css` (Task 03) وقواعد الاشتقاق:**
- الطبقة 1 (قيم خام تتبع الوضع): `:root, [data-bui-mode="light"]` و`[data-bui-mode="dark"]` (يأتي بعده).
- الطبقة 2 (قيم ثابتة): `:root` فقط.
- الطبقة 3 (Aliases وComponent Tokens): `:root, [data-bui-mode], [data-bui-theme]`، بـ `var()` فقط. تُعاد على كل Scope لأن قيمة `var()` تُحسب عند التصريح، فالموروث من `:root` يبقى بقيمة الصفحة.
- **محددات Theme** تُكتب على أي عنصر: `[data-bui-theme="ocean"]` و`[data-bui-theme="ocean"][data-bui-mode="dark"]` (بدل `:root[...]`). قيود: Dark الخاص بـ Theme يلزم أن يكون الوسمان على نفس العنصر.
- العنصر ذو `data-bui-mode` يرسم خلفيته ولونه بنفسه، فيعمل Dark داخل صفحة Light.

### ما يجب أن يتحكم فيه Theme
Backgrounds، Colors، Typography، Buttons، Alerts، Cards، Forms، Modals، Toasts، Borders، Shadows، Component States (hover/focus/active/disabled).

### إنشاء Theme جديد (خطوات إلزامية)
1. أنشئ `assets/css/themes/{name}.css`.
2. عرّف Tokens تحت `[data-bui-theme="{name}"]` للوضع Light (بدون `:root` ليعمل على أي عنصر).
3. عرّف نسخة Dark تحت `[data-bui-theme="{name}"][data-bui-mode="dark"]`.
4. لا تستخدم `!important` ولا Selectors للمكونات.
5. تحقق من التباين (انظر [ACCESSIBILITY.md](ACCESSIBILITY.md)) وجرّب كل المكونات المسجلة.
6. وثّقه في صفحة Themes، وأضفه إلى `THEMES` في `docs.js` لتقدمه قائمة الثيمات في Navbar التوثيق، واربط ملفه في `<head>` كل صفحة (التوثيق يربط `ocean.css` في كل صفحة لمنع وميض ثيم محفوظ).

### استبدال Default Theme
طريقتان (مختبرتان في Chromium، Light وDark):
1. **الموصى بها:** ثيم باسم جديد (`brand`) ويُفعَّل بـ `data-bui-theme="brand"` على `<html>` أو `BUI.theme.set('brand')`.
2. **إعادة تعريف `default`:** ملف يُحمَّل بعد Core يعرّف `[data-bui-theme="default"]` (Light) و`[data-bui-theme="default"][data-bui-mode="dark"]` (Dark، الوسمان على نفس العنصر). تفوز دون `!important` لأن Core يعرّف Light على `:root, [data-bui-mode="light"]` بخصوصية أقل. الصيغة `:root[data-bui-theme="default"]` المذكورة سابقاً لم تُختبر في Task 06 وتقيد الثيم بالجذر، فاعتُمد `[data-bui-theme="default"]`.

### التبديل أثناء التشغيل (منفذ Task 06)
`BUI.theme.set(name)`، `setMode('light'|'dark')`، `toggleMode()`، `get()`، `getMode()`، `load(name, url)`. الحدث `bui:theme:change` على `document.documentElement` بالتفاصيل `{ theme, mode, previousTheme, previousMode, source }` حيث `source` هو `api` أو `system`. لا يُطلق للحالة الأولية ولا عند عدم التغير.

- **التخزين:** `localStorage` بمفتاحين `bui-theme` و`bui-mode`، وكل قراءة وكتابة داخل `try/catch`. عند تعطل التخزين لا أخطاء ولا تحذيرات (رسالة Debug فقط) ويعمل التبديل للصفحة الحالية.
- **ترتيب تحديد الوضع عند التحميل (قرار Task 06):** المحفوظ، ثم `prefers-color-scheme`، ثم (بلا `matchMedia`) سمة `data-bui-mode` في الـ HTML، ثم `light`. أي أن تفضيل النظام يتفوق على `data-bui-mode` المكتوبة في الـ HTML (هي قيمة ما قبل تشغيل JS فقط)، وإلا لما أمكن احترام تفضيل النظام في قوالب تكتب `data-bui-mode="light"` دائماً. من أراد وضعاً ثابتاً يستدعي `setMode()` (يُحفظ).
- **تتبع النظام:** ما دام المستخدم لم يختر وضعاً صراحة (`setMode`/`toggleMode`) تتبع الصفحة تغير تفضيل النظام حياً (`source: "system"`). بعد اختيار صريح تتوقف المتابعة حتى لو فشل الحفظ. `set(name)` يحفظ الثيم فقط ولا يؤثر على المتابعة.
- **الثيم:** يقبل `set()` أي اسم kebab-case دون التحقق من وجود ملف الـ CSS (غير مضمون). الاسم غير الصالح: تحذير ويرجع `null`.
- **`load(name, url)`:** يضيف `<link rel="stylesheet" data-bui-theme-css="name">` ويرجع Promise (يُحل بالاسم، ويُرفض مع خطأ في Console عند فشل التحميل أو وسائط غير صالحة). لا يفعّل الثيم. لا يكرر ربط ملف مربوط أصلاً في الصفحة. الاستدعاء المتكرر لنفس الاسم يرجع نفس الوعد.
- **منع الوميض (FOUC):** Snippet `<head>` صغير يقرأ نفس المفتاحين ويطبق `data-bui-theme` و`data-bui-mode` قبل الرسم، وموثق في صفحة Dark Mode ومستخدم في رأس كل صفحة توثيق. ثيم محفوظ غير `default` يحتاج ربط ملفه في الصفحة وإلا تُطبَّق السمة دون تنسيق.
- **حد معروف في تعريف Tokens (Task 03، لم يُعدَّل):** Layer 2 (الخط، Radius، عرض الحدود، Focus) يُعرَّف على `:root` فقط. نطاق متداخل بثيم `default` داخل صفحة ثيمها `ocean` لا يعيد قيم Layer 2 الافتراضية (يرثها من الأب)، وتتحول الألوان والظلال فقط. التبديل على `<html>` غير متأثر. اقتراح خارج النطاق: تعريف Layer 2 على `:root, [data-bui-theme]`.
- **ثيم `ocean` (Task 06):** يعيد تعريف الألوان (Neutral وPrimary وSecondary والظلال والـ Overlay) في Light وDark، والخط (`--bui-font-family` بأسماء خطوط نظام فقط دون تحميل خطوط)، وكل مقياس Radius، و`--bui-border-width-thick` و`--bui-focus-ring-width`، ووزن العناوين. لا يعيد تعريف success/warning/danger/info. التباين مقاس بنفس 40 ثنائية لصفحة Colors: 40/40 في Light وDark.

### Dark Mode
يعتمد على Tokens فقط، ويُضبط `color-scheme`. لا صور/ظلال بقيم ثابتة تكسر الوضع الداكن.
