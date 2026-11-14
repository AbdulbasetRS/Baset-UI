# قواعد التسمية

## البادئة
كل شيء عام في المكتبة يبدأ بـ `bui-` (أو `BUI` في JavaScript).

| العنصر | القاعدة | مثال |
|---|---|---|
| CSS Class (Block) | `bui-{component}` | `.bui-button` |
| CSS Element | `bui-{component}__{element}` | `.bui-modal__header` |
| CSS Modifier | `bui-{component}--{modifier}` | `.bui-button--primary` |
| CSS State | `is-{state}` / `has-{state}` مع ربطها بالمكون | `.bui-modal.is-open` |
| CSS Variable | `--bui-{category}-{name}` (وللمكون: `--bui-{component}-{prop}`) | `--bui-color-primary`، `--bui-button-padding-x` |
| HTML Attribute | `data-bui-{name}` | `data-bui-select`, `data-bui-theme` |
| Option Attribute | `data-bui-{option-kebab}` | `data-bui-per-page` |
| Events (DOM) | `bui:{component}:{event}` | `bui:modal:open` |
| JS Namespace | `BUI` | `BUI.toast.show()` |
| JS Method/Option | camelCase | `perPage`, `noResults` |
| JS Class داخلية | PascalCase | `ModalController` |
| Icon Class | `bui-icon-{weight}` + `bui-icon-{name}` | [ICONS_SYSTEM.md](ICONS_SYSTEM.md) |
| مفاتيح i18n | `section.camelCaseKey` | `common.noResults` |

## الملفات
- ملفات CSS/JS/HTML/JSON: `kebab-case` بحروف صغيرة (`date-picker.js`).
- ملفات الـ Extensions: `baset-ui-{name}.css|js` (مثال `baset-ui-datatable.js`).
- ملفات Themes: `{theme-name}.css` داخل `assets/css/themes/`.
- ملفات الترجمة: رمز اللغة `ar.json` (BCP 47 مبسط: `en`, `ar`, `fr`, `pt-br`).
- ملفات التعليمات: `UPPER_SNAKE_CASE.md`.
- صفحات التوثيق: `documentation/components/{component}.html`.

## ممنوعات
- `BasetUI.*` أو أي Namespace غير `BUI`.
- Classes بدون بادئة في ملفات المكتبة.
- استخدام `id` في الـ Selectors داخل CSS المكتبة.
- Classes تصف اللون أو الموقع الفيزيائي بدل المعنى حيث توجد بدائل منطقية (استخدم `start/end` بدل `left/right`، راجع [RTL_LTR_AND_THEMES.md](RTL_LTR_AND_THEMES.md)).

## استثناء موثق
واجهة موقع التوثيق تستخدم البادئة `bui-docs-*` وهي خاصة بالموقع وليست API للمكتبة.
