# الاتجاهات (RTL/LTR) والـ Themes

> الحالة: لا Theme فعلي منفذ سوى Tokens الافتراضية (Light/Dark) في `baset-ui.css`. نظام Theme Manager **مستقبلي**.

## RTL / LTR (إلزامي)
- الاتجاه يُحدد بـ `dir` على `<html>` (أو على حاوية لمعاينات محلية).
- استخدم **Logical Properties** حصراً: `margin-inline-start`، `padding-inline`، `inset-inline-start`، `border-start-start-radius`، `text-align: start`، `float: inline-start`. ممنوع `left/right` الفيزيائية إلا لمبرر (مثل رسم) موثق.
- Flex/Grid ينعكسان تلقائياً؛ لا تعكس يدوياً بـ `row-reverse` للاتجاه.
- الأيقونات الاتجاهية (أسهم، تقدم/رجوع) تنعكس في RTL ([ICONS_SYSTEM.md](ICONS_SYSTEM.md)).
- الحركة الاتجاهية (Slide) تستخدم متغيرات تعتمد على الاتجاه.
- JavaScript: اقرأ الاتجاه من `document.documentElement.dir` وتفاعل مع تغيره.
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
2. **Component Tokens:** `--bui-button-bg` وتشتق افتراضياً من Global.
المكونات تقرأ Component Tokens فقط (مع Fallback إلى Global)، فيستطيع الـ Theme التحكم بكل مكون دون كتابة Selectors له.

### ما يجب أن يتحكم فيه Theme
Backgrounds، Colors، Typography، Buttons، Alerts، Cards، Forms، Modals، Toasts، Borders، Shadows، Component States (hover/focus/active/disabled).

### إنشاء Theme جديد (خطوات إلزامية)
1. أنشئ `assets/css/themes/{name}.css`.
2. عرّف Tokens تحت `:root[data-bui-theme="{name}"]` للوضع Light.
3. عرّف نسخة Dark تحت `:root[data-bui-theme="{name}"][data-bui-mode="dark"]`.
4. لا تستخدم `!important` ولا Selectors للمكونات.
5. تحقق من التباين (انظر [ACCESSIBILITY.md](ACCESSIBILITY.md)) وجرّب كل المكونات المسجلة.
6. وثّقه في صفحة Themes (مستقبلي).

### استبدال Default Theme
تضمين ملف Theme بعد Core يعيد تعريف Tokens لـ `default` عبر `:root[data-bui-theme="default"]` أو بتغيير السمة. (مستقبلي: توثيق تفصيلي.)

### التبديل أثناء التشغيل (مستقبلي)
`BUI.theme.set('ocean')`، `BUI.theme.setMode('dark')`، `BUI.theme.get()`. يحفظ التفضيل في `localStorage` بمفتاح `bui-theme` و`bui-mode` ويحترم `prefers-color-scheme` عند عدم وجود تفضيل. التفاصيل تُحدد عند تنفيذه، ويجب إطلاق حدث `bui:theme:change`.

### Dark Mode
يعتمد على Tokens فقط، ويُضبط `color-scheme`. لا صور/ظلال بقيم ثابتة تكسر الوضع الداكن.
