# نظام الترجمة (i18n)

> الحالة (Task 06): **`BUI.locale` منفذ** في `assets/js/baset-ui.js`، والملفات `en.json` و`ar.json` و`fr.json` بنفس المفاتيح. التوثيق الموجه للمستخدمين: `documentation/advanced/internationalization.html`. Close Button (Task 09) يستهلك `common.close` عبر HTML Binding (`data-bui-i18n-attr`) واختُبر بـ en وar وfr؛ لكنه CSS فقط ولا يستمع لـ `bui:locale:change`، فتحديث المكونات ذات JS عبر `refresh()` غير مختبر مع مكون حقيقي.

## الملفات
`assets/i18n/{code}.json`. مثال: `en.json`, `ar.json`, `fr.json`, `pt-br.json`.

## الهيكل (إلزامي)
```json
{
    "meta": { "code": "en", "name": "English", "direction": "ltr" },
    "common": { "loading": "Loading...", "search": "Search", "close": "Close",
                "cancel": "Cancel", "confirm": "Confirm", "noResults": "No results found",
                "showing": "Showing {from} to {to} of {total}",
                "items": { "one": "{count} item", "other": "{count} items" } }
}
```
(مفاتيح `common.showing` و`common.items` أضيفت في Task 06 لجميع اللغات معاً، لأن صفحة التوثيق تحتاجها لإثبات المتغيرات والجمع بنصوص حقيقية.)
- `meta.code`, `meta.name` (بلغته الأصلية)، `meta.direction` (`ltr`|`rtl`) إلزامية.
- مفاتيح المكونات تحت اسم المكون: `modal.close`, `datatable.rowsPerPage`.
- مفاتيح `camelCase`، مستوى تداخل لا يزيد على 3.
- نصوص بمتغيرات: `{name}` — مثال `"showing": "Showing {from} to {to} of {total}"`.
- **الجمع (Task 06):** الرسالة كائن مفاتيحه فئات CLDR (`zero`, `one`, `two`, `few`, `many`, `other`) ويجب أن يحتوي `other`. تُختار الفئة بـ `Intl.PluralRules` للغة التي وفرت الرسالة من `params.count` (رقم)، وإن غابت الفئة تُستخدم `other`. `{count}` يمكن استخدامه داخل النص.
- **قرار (Task 06): اختبار التطابق يعامل كائن الجمع كمفتاح واحد.** السبب: اللغات تحتاج فئات مختلفة (العربية ست فئات، الإنجليزية اثنتان)، فاشتراط نفس الفئات يفرض فئات لا تستخدمها اللغة. يُقارَن مسار المفتاح (`common.items`) وأسماء المتغيرات `{...}`، ولا تُقارَن الفئات. الكائن يُعد جمعاً إن كانت كل مفاتيحه فئات CLDR.
- أسماء المتغيرات `{name}` يجب أن تتطابق بين اللغات لكل مفتاح (يفحصها الاختبار).

## قاعدة الاتساق (إلزامي)
**نفس المفاتيح بالضبط في كل الملفات.** أي مفتاح يُضاف لملف يُضاف لجميع الملفات في نفس المهمة. اختبار التطابق جزء من [TESTING.md](TESTING.md).

## API (منفذ في Task 06)
```javascript
await BUI.locale.use('ar', { url: 'assets/i18n/ar.json', fallback: 'en' });
BUI.locale.t('common.loading');
BUI.locale.t('common.showing', { from: 1, to: 10, total: 95 });
BUI.locale.t('common.items', { count: 3 });          // جمع
BUI.locale.get();                                    // 'ar'  (null قبل أول use() ناجح)
BUI.locale.getDirection();                           // 'rtl'
BUI.locale.register('de', { meta: { code: 'de', name: 'Deutsch', direction: 'ltr' }, common: { /* ... */ } });
BUI.locale.apply(root);                              // يطبق HTML Binding على شجرة أضيفت لاحقاً
```
- `use(code, { url, fallback, fallbackUrl })` يرجع Promise بالرمز. `url` الافتراضي `../i18n/{code}.json` نسبةً إلى مكان `baset-ui.js` نفسه (يُلتقط `document.currentScript.src` عند التحميل؛ إن لم يتوفر ولم تُسجَّل اللغة بـ `register` يُرفض الوعد). `fallback` الافتراضي `en`، و`false`/`null` يعطله. `fallbackUrl` اختياري بنفس قاعدة `url`.
- التحميل بـ `fetch`، فيتطلب http/https. من `file://` يرفض الوعد ويسجل خطأ ولا تتغير اللغة النشطة؛ `register()` هو البديل بلا طلب.
- أكواد اللغات تُخزَّن بحروف صغيرة. الملف يجب أن يحتوي `meta.direction` صالحاً (`ltr`|`rtl`) وإلا يُرفض.
- عند استدعاء `use()` مرتين قبل انتهاء الأولى يُطبَّق آخر استدعاء فقط (الأولى تحدّث الـ Cache فقط). فشل تحميل `fallback` تحذير فقط. فشل اللغة الرئيسية: الوعد يُرفض واللغة النشطة لا تتغير.
- التحذير للمفتاح المفقود: `[BUI] Locale: Missing key "..."` مرة واحدة لكل مفتاح ولغة (صيغة السجل الموحدة في [JAVASCRIPT_API.md](JAVASCRIPT_API.md)).
- **قرار (Task 06): لا خيار `locale` في `BUI.config`.** لم يُطلب في المهمة، ولا مسار موثوق لتحميل اللغة منه. اللغة الافتراضية للمفاتيح المفقودة هي `fallback` (`en`). التبديل بـ `use()`.
- `lang` و`dir` على `<html>` يُضبطان بعد كل `use()` ناجح (حتى لو كانت اللغة نفسها)، وحدث `bui:locale:change` يُطلق عند تغير الرمز فقط. تفاصيله `{ locale, previousLocale, direction, fallback }` على `document.documentElement`.

## السلوك المطلوب
- **اللغة الافتراضية:** `en` ما لم يضبط المستخدم غيرها (`BUI.config({ locale })` أو `lang` على `<html>`).
- **نص غير مترجم:** البحث في اللغة الحالية ثم `fallback` ثم يُرجع المفتاح نفسه مع `console.warn('[BUI] Missing key …')`.
- **الاتجاه:** يؤخذ من `meta.direction` ويُطبق على `<html dir>` و`lang`.
- **التبديل أثناء التشغيل:** `use()` يحمّل (مع Cache)، يحدث `lang/dir`، يطلق `bui:locale:change`.
- **تحديث المكونات:** كل مكون له نصوص يستمع لـ `bui:locale:change` ويستدعي `refresh()` دون فقدان حالته.
- **HTML (منفذ):** `data-bui-i18n="common.close"` للنصوص (`textContent`، فللعناصر النصية فقط)، و`data-bui-i18n-attr="aria-label:common.close; title:common.close"` للسمات (أزواج `attr:key` تفصلها `;`، وسمات `on*` مرفوضة). يُطبَّق بعد كل `use()` وعند `BUI.locale.apply(root)`. النص المكتوب في HTML هو ما يراه المستخدم قبل تحميل اللغة.
- النصوص الداخلية للمكونات لا تُكتب داخل JS مباشرة.
- أرقام/تواريخ: عبر `Intl` (اقتراح).
- **Shell التوثيق (قرار Task 06):** نصوص Navbar/Sidebar/Footer تبقى بالإنجليزية ولا تستخدم `data-bui-i18n`؛ صفحة Internationalization وحدها تعرض `BUI.locale` بأمثلة حية.

## إضافة لغة جديدة
1. انسخ `en.json` إلى `{code}.json` واترجم القيم دون تغيير المفاتيح.
2. اضبط `meta`.
3. شغل اختبار التطابق: `node tests/i18n-keys.js` (بلا Dependencies؛ يفحص صحة JSON، `meta`، تطابق المفاتيح، camelCase، عمق التداخل، وتطابق المتغيرات؛ يخرج بـ 1 عند أي فشل).
4. وثّق اللغة في صفحة Internationalization.
لا تعديل في JavaScript أو CSS لإضافة لغة. (`fr` أضيفت في Task 06 لإثبات ذلك؛ لغات أخرى غير مطلوبة الآن.)

## مفاتيح Task 10
أُضيفت مجموعة `avatar` إلى `en.json` و`ar.json` و`fr.json` معاً: `avatar.statusOnline` و`statusOffline` و`statusBusy` و`statusAway` (للاسم الوصولي لمؤشر حالة Avatar عبر `data-bui-i18n-attr="aria-label:avatar.statusOnline"`). Badge وProgress لا يضيفان مفاتيح: نصهما من كاتب الصفحة، ومؤشر Progress غير المحدد يعيد استخدام `common.loading`. Progress يعيد رسم نصه المنسق عند `bui:locale:change`.

## مفاتيح Task 12
أُضيفت مجموعة `form` إلى `en.json` و`ar.json` و`fr.json` معاً: `form.showPassword` (الاسم الوصولي لزر إظهار كلمة المرور في Input عبر `data-bui-i18n-attr="aria-label:form.showPassword"`). الاسم ثابت (الحالة بـ `aria-pressed`) فلا مفتاح "إخفاء". Form Controls وCheckbox وRadio وSwitch لا تضيف مفاتيح: النصوص من كاتب الصفحة. الاختبار: `node tests/i18n-keys.js` (13 مفتاحاً، ناجح).

## مفاتيح Task 13
أُضيفت مجموعة `overlay` إلى `en.json` و`ar.json` و`fr.json` معاً: `overlay.loadError` (رسالة فشل تحميل المحتوى الديناميكي في Dialog وDrawer، تُربط عبر `data-bui-i18n` على سطر الحالة). نص "Loading..." المؤقت يعيد استعمال `common.loading`. النص الإنجليزي المكتوب في سطر الحالة داخل JS هو نص HTML Binding الافتراضي (يراه المستخدم قبل تحميل أي لغة؛ لا تُطبَّق الترجمة إلا حين تكون لغة نشطة، وإلا أرجع `translate` المفتاح نفسه). الاختبار: `node tests/i18n-keys.js` (14 مفتاحاً، ناجح).
