# نظرة عامة على المشروع

## التعريف
**Baset-UI** مكتبة واجهات (CSS + JavaScript) تعمل مباشرة في المتصفح بدون أي Build Tools، ومعها موقع Documentation تفاعلي.

## الروابط الرسمية
- **المستودع (المصدر الأساسي للمكتبة):** https://github.com/AbdulbasetRS/Baset-UI
- **موقع التوثيق (GitHub Pages):** https://abdulbasetrs.github.io/Baset-UI/
- أي رابط GitHub داخل الكود أو التوثيق يشير إلى هذين الرابطين فقط. الموقع يُخدَّم من مسار فرعي (`/Baset-UI/`) لذلك المسارات نسبية دائماً.

## الأهداف
1. مكتبة موحدة بمعمارية واضحة ومتسقة بين جميع المكونات.
2. دعم كامل لـ RTL و LTR منذ البداية.
3. نظام Themes (Light / Dark / Custom) يتحكم في الشكل العام الكامل.
4. نظام ترجمة قابل للتوسع.
5. نظام أيقونات خاص بالمكتبة.
6. Accessibility وResponsive كجزء أصيل من كل مكون وليس إضافة لاحقة.
7. توثيق موحد لكل مكون مع Playground تفاعلي.

## النطاق
**داخل النطاق:** ملفات CSS/JS/i18n/Icons، موقع التوثيق، الاختبارات، ملفات التعليمات.
**خارج النطاق (قرارات إلزامية):**
- لا Build Tools أو Bundlers كشرط للتشغيل.
- لا Frameworks (React/Vue/...) كاعتماد للمكتبة.
- لا مكتبات خارجية كجزء من المكتبة دون قرار موثق وموافقة.

## حالة المشروع الحالية
مرحلة **التأسيس** (Task 01 إلى Task 08): الهيكل، التعليمات، واجهة التوثيق وقالب الصفحات، Design Tokens (Light/Dark)، نظام Layout وUtilities، ونواة JavaScript (`BUI`: Registry وInit وEvents وHelpers وLogger) مع صفحات توثيقها، وTheme Manager وثيم `ocean`، وLocale Manager وثلاث لغات (en وar وfr)، ونظام الأيقونات (Phosphor، SVG Mask، 51 أيقونة بستة أوزان، Extension CSS فقط) مع كتالوج تفاعلي، وإطار Playground مشترك لقسم Customize (docs فقط). **لا يوجد أي Component منفذ.** ملفات اللغات تحتوي مفاتيح `common` فقط. راجع [COMPONENTS_REGISTRY.md](COMPONENTS_REGISTRY.md) و[ROADMAP.md](ROADMAP.md).

## القرارات المعمارية المعتمدة
| القرار | السبب |
|---|---|
| Prefix `bui-` و Namespace `BUI` | منع التعارض مع مكتبات أخرى، وتوحيد التسمية |
| بدون Build Tools | سهولة الاستخدام والنشر على GitHub Pages |
| ملف CSS وJS أساسي واحد + Extensions للمكونات الكبيرة | تقليل الطلبات مع عدم تحميل ما لا يلزم |
| `index.html` في الجذر | متطلب GitHub Pages |
| `instructions/` خارج `documentation/` | فصل تعليمات التطوير عن محتوى المستخدمين |
| ترخيص MIT في `LICENSE` | قرار مبدئي، **يحتاج تأكيد المالك** |
