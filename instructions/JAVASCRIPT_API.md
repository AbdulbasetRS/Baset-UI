# قواعد JavaScript API

> الحالة: **لا يوجد API منفذ**. كل ما يلي قواعد للتنفيذ المستقبلي.

## Namespace
`window.BUI` فقط. ممنوع `BasetUI` أو أي Global آخر. لا تلوث الـ Global Scope.

## الشكل العام
```javascript
BUI.version;                         // string
BUI.config({ locale: 'en' });        // Global config (مستقبلي)
BUI.init(root?);                     // تهيئة data-bui-* داخل root (مستقبلي)
BUI.theme.set('ocean');              // مستقبلي
BUI.locale.use('ar', {...});         // مستقبلي
BUI.toast.show({...});               // مستقبلي
BUI.modal.open('#id');               // مستقبلي
BUI.dataTable('#users', {...});      // Component كبير: دالة مباشرة (مستقبلي)
BUI.select.remote('#users', {...});  // مستقبلي
```

## قواعد التصميم
1. **Component Factory:** `BUI.{component}(target, options)` أو `BUI.{component}.{variant}(target, options)` يرجع Instance.
2. **Target:** Selector أو Element. غير موجود → `null` + تحذير `[BUI]`.
3. **Options:** كائن camelCase؛ الأولوية: Defaults < HTML Attributes < JS.
4. **Instance:** Methods واضحة (`open`, `close`, `update`, `destroy`, `on`, `off`).
5. **Events:** DOM Events `bui:{component}:{event}` (Bubbling) و`instance.on()` اختياري. أحداث `before*` قابلة للإلغاء.
6. **Promises:** العمليات غير المتزامنة (`locale.use`, تحميل بيانات) ترجع Promise.
7. **Idempotent:** تهيئة نفس العنصر مرتين ترجع نفس الـ Instance.
8. **Chaining:** لا يُشترط.
9. **Extensions:** تسجل نفسها في `BUI` دون تعديل Core.
10. **التوافق:** لا كسر لواجهة منشورة قبل Major جديد ([RELEASE_AND_VERSIONING.md](RELEASE_AND_VERSIONING.md)). الواجهات الداخلية تبدأ بـ `_` وغير مضمونة.
11. **المتصفحات:** المتصفحات الحديثة (Evergreen). لا Polyfills دون قرار.
12. **الأمان:** لا `innerHTML` بنصوص غير موثوقة؛ استخدم `textContent` أو تنظيف صريح. لا `eval`.
13. **الأداء:** Event Delegation حيث أمكن، لا قراءة/كتابة DOM متداخلة.
14. **الكود:** `'use strict'`، بدون اعتماد على Build.

قواعد Lifecycle والذاكرة والأخطاء في [COMPONENT_DEVELOPMENT.md](COMPONENT_DEVELOPMENT.md).
