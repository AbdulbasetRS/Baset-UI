# نظام الترجمة (i18n)

> الحالة: **غير منفذ**. الموجود حالياً ملفا `en.json` و`ar.json` بمفاتيح أولية للهيكل فقط. `BUI.locale` **مستقبلي**.

## الملفات
`assets/i18n/{code}.json`. مثال: `en.json`, `ar.json`, `fr.json`, `pt-br.json`.

## الهيكل (إلزامي)
```json
{
    "meta": { "code": "en", "name": "English", "direction": "ltr" },
    "common": { "loading": "Loading...", "search": "Search", "close": "Close",
                "cancel": "Cancel", "confirm": "Confirm", "noResults": "No results found" }
}
```
- `meta.code`, `meta.name` (بلغته الأصلية)، `meta.direction` (`ltr`|`rtl`) إلزامية.
- مفاتيح المكونات تحت اسم المكون: `modal.close`, `datatable.rowsPerPage`.
- مفاتيح `camelCase`، مستوى تداخل لا يزيد على 3.
- نصوص بمتغيرات: `{name}` — مثال `"showing": "Showing {from} to {to} of {total}"`.
- الجمع: مفاتيح `one`/`other` (واتساق مع `Intl.PluralRules`) حيث يلزم. (مستقبلي: التفاصيل عند أول حاجة.)

## قاعدة الاتساق (إلزامي)
**نفس المفاتيح بالضبط في كل الملفات.** أي مفتاح يُضاف لملف يُضاف لجميع الملفات في نفس المهمة. اختبار التطابق جزء من [TESTING.md](TESTING.md).

## API المستقبلي
```javascript
await BUI.locale.use('ar', { url: 'assets/i18n/ar.json', fallback: 'en' });
BUI.locale.t('common.loading');
BUI.locale.t('datatable.showing', { from: 1, to: 10, total: 95 });
```

## السلوك المطلوب
- **اللغة الافتراضية:** `en` ما لم يضبط المستخدم غيرها (`BUI.config({ locale })` أو `lang` على `<html>`).
- **نص غير مترجم:** البحث في اللغة الحالية ثم `fallback` ثم يُرجع المفتاح نفسه مع `console.warn('[BUI] Missing key …')`.
- **الاتجاه:** يؤخذ من `meta.direction` ويُطبق على `<html dir>` و`lang`.
- **التبديل أثناء التشغيل:** `use()` يحمّل (مع Cache)، يحدث `lang/dir`، يطلق `bui:locale:change`.
- **تحديث المكونات:** كل مكون له نصوص يستمع لـ `bui:locale:change` ويستدعي `refresh()` دون فقدان حالته.
- **HTML:** `data-bui-i18n="common.close"` للنصوص، و`data-bui-i18n-attr="aria-label:common.close"` للسمات (مستقبلي).
- النصوص الداخلية للمكونات لا تُكتب داخل JS مباشرة.
- أرقام/تواريخ: عبر `Intl` (اقتراح).

## إضافة لغة جديدة
1. انسخ `en.json` إلى `{code}.json` واترجم القيم دون تغيير المفاتيح.
2. اضبط `meta`.
3. شغل اختبار التطابق.
4. وثّق اللغة في صفحة Internationalization.
