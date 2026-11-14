# معايير تطوير المكونات

كل Component يتبع نفس المعمارية مع السماح باختلافات منطقية حسب طبيعته. (لا يوجد Component منفذ حالياً.)

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
لا يُفرض أسلوب واحد على كل المكونات. المكون الذي لا معنى لـ JS فيه (مثل Badge) يبقى CSS فقط. التهيئة التلقائية من HTML تتم عبر `BUI.init()` (مستقبلي).

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
واجهة موحدة حيثما انطبقت: `open/close/toggle`، `show/hide`، `update`، `destroy`، `getInstance` (مستقبلي). التسمية في [JAVASCRIPT_API.md](JAVASCRIPT_API.md).

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
