# دليل التعليمات (Instructions)

هذا المجلد هو **المرجع الأساسي** لأي مطور أو أداة ذكاء اصطناعي تعمل على Baset-UI. كل ما هو مكتوب هنا مُلزِم ما لم يُوسَم صراحةً بأنه "اقتراح".

## ترتيب القراءة

**دائماً قبل أي مهمة (إلزامي):**
1. هذا الملف.
2. [AI_RULES.md](AI_RULES.md)
3. [TASK_WORKFLOW.md](TASK_WORKFLOW.md)
4. [COMPONENTS_REGISTRY.md](COMPONENTS_REGISTRY.md) لمعرفة الحالة الحالية.

**بحسب نوع المهمة:**

| نوع المهمة | الملفات المطلوب قراءتها |
|---|---|
| فهم المشروع | [PROJECT_OVERVIEW.md](PROJECT_OVERVIEW.md)، [ARCHITECTURE.md](ARCHITECTURE.md) |
| أي كود | [NAMING_CONVENTIONS.md](NAMING_CONVENTIONS.md)، [CORE_ASSETS.md](CORE_ASSETS.md) |
| Component جديد | [COMPONENT_DEVELOPMENT.md](COMPONENT_DEVELOPMENT.md)، [COMPONENT_DOCUMENTATION.md](COMPONENT_DOCUMENTATION.md)، [CUSTOMIZATION_AND_PLAYGROUND.md](CUSTOMIZATION_AND_PLAYGROUND.md)، [ACCESSIBILITY.md](ACCESSIBILITY.md)، [RESPONSIVE_DESIGN.md](RESPONSIVE_DESIGN.md)، [RTL_LTR_AND_THEMES.md](RTL_LTR_AND_THEMES.md)، [TESTING.md](TESTING.md) |
| JavaScript API | [JAVASCRIPT_API.md](JAVASCRIPT_API.md) |
| نظام الترجمة | [INTERNATIONALIZATION.md](INTERNATIONALIZATION.md) |
| الأيقونات | [ICONS_SYSTEM.md](ICONS_SYSTEM.md) |
| Theme | [RTL_LTR_AND_THEMES.md](RTL_LTR_AND_THEMES.md) |
| إصدار أو نشر | [RELEASE_AND_VERSIONING.md](RELEASE_AND_VERSIONING.md) |
| تسليم مهمة (Preview/ZIP) | [TASK_WORKFLOW.md](TASK_WORKFLOW.md) قسم التسليم |
| تخطيط مهمة | [ROADMAP.md](ROADMAP.md) وملفات `templates/` |

## مستويات الإلزام

- **إلزامي**: كلمات "يجب"، "ممنوع"، "لا". مخالفتها تعني أن المهمة غير مكتملة.
- **اقتراح**: يُوسَم بـ "(اقتراح)". يمكن تجاوزه مع توثيق السبب.
- **مستقبلي**: يُوسَم بـ "(مستقبلي)". غير موجود حالياً ولا يجوز الادعاء بوجوده.

## قواعد الصيانة

- لغة ملفات التعليمات والوثائق الداخلية: **العربية**. المصطلحات التقنية والأكواد تبقى بالإنجليزية.
- كل موضوع له ملف واحد مسؤول عنه؛ الملفات الأخرى تشير إليه برابط ولا تكرره.
- أي تغيير معماري يُوثَّق في الملف المسؤول وفي [CHANGELOG](../CHANGELOG.md) مع السبب.
- عند التعارض: الأولوية للمهمة الحالية الصريحة، ثم [AI_RULES.md](AI_RULES.md)، ثم باقي الملفات.
