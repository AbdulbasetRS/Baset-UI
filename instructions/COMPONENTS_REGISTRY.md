# سجل المكونات

## الحالات
| الحالة | المعنى |
|---|---|
| Planned | مخطط، لا كود |
| In Progress | قيد التطوير |
| Completed | الكود منفذ |
| Tested | اجتاز [TESTING.md](TESTING.md) |
| Documented | صفحته مكتملة بالأقسام الإلزامية الثمانية |

الحالة تراكمية: لا يصبح المكون Documented قبل Tested، ولا Tested قبل Completed. المكون **مكتمل فعلاً** فقط عند Documented.

## طريقة التحديث
بعد كل مهمة، عدّل صف المكون: الحالة، النوع (Core/Extension)، رابط الصفحة، تاريخ آخر تحديث، ملاحظات. المكون الجديد خارج القائمة يُضاف بحالة مناسبة.

## الأعمدة
`Type`: Core | Extension. `JS`: Yes | No. `Docs`: مسار الصفحة أو `-`.

> **الوضع الحالي (Task 02): كل المكونات Planned. لا يوجد أي مكون منفذ.** المنفذ حالياً أنظمة الأساس فقط (جدول Systems). روابط المكونات في Sidebar Placeholders.

### Components
| Component | Status | Type | JS | Docs | Updated | Notes |
|---|---|---|---|---|---|---|
| Accordion | Planned | Core | - | - | - | |
| Alert | Planned | Core | - | - | - | |
| Avatar | Planned | Core | - | - | - | |
| Badge | Planned | Core | - | - | - | |
| Button | Planned | Core | - | - | - | |
| Button Group | Planned | Core | - | - | - | |
| Card | Planned | Core | - | - | - | |
| Carousel | Planned | Core | - | - | - | |
| Close Button | Planned | Core | - | - | - | |
| Dialog | Planned | Core | - | - | - | |
| Drawer | Planned | Core | - | - | - | |
| Menu | Planned | Core | - | - | - | |
| Pagination | Planned | Core | - | - | - | |
| Popover | Planned | Core | - | - | - | |
| Progress | Planned | Core | - | - | - | |
| List Group | Planned | Core | - | - | - | |

### Forms
| Component | Status | Type | JS | Docs | Updated | Notes |
|---|---|---|---|---|---|---|
| Form Controls | Planned | Core | - | - | - | |
| Input | Planned | Core | - | - | - | |
| Select | Planned | Core | - | - | - | |
| Checkbox | Planned | Core | - | - | - | |
| Radio | Planned | Core | - | - | - | |
| Switch | Planned | Core | - | - | - | |
| Date Picker | Planned | غير محدد | - | - | - | |
| Time Picker | Planned | غير محدد | - | - | - | |

### Data Display
| Component | Status | Type | JS | Docs | Updated | Notes |
|---|---|---|---|---|---|---|
| DataTable | Planned | Extension (مرشح) | Yes | - | - | حسب [CORE_ASSETS.md](CORE_ASSETS.md) |
| Charts | Planned | Extension (مرشح) | Yes | - | - | |
| Calendar | Planned | Extension (مرشح) | Yes | - | - | |
| Maps | Planned | Extension (مرشح) | Yes | - | - | |

### Systems (مستقبلية)
| System | Status | Notes |
|---|---|---|
| Design Tokens (Colors, Typography, Spacing, Radius, Border, Shadow, Z-Index, Transition, Container) | Completed | Task 02، 2026-11-15. Light/Dark عبر `data-bui-mode` (على `html` أو أي حاوية). لم يُختبر بقارئ شاشة |
| Base (Reset, Typography, Links, Images, Forms Reset, Focus, Selection, Reduced Motion) | Completed | Task 02، 2026-11-15 |
| Breakpoints | Completed | Task 02. قيم مرجعية `--bui-bp-*` + Media Queries في القسم 7 من `baset-ui.css` |
| Container | Completed | Task 02. `bui-container`, `bui-container-fluid`, `bui-container-{bp}` |
| Grid | Completed | Task 02. التسمية: `bui-{property}-{breakpoint}-{value}` |
| Flexbox | Completed | Task 02. `bui-items-*`, `bui-justify-*`, `bui-content-*`, `bui-gap-*` مشتركة مع Grid. لا تُعاد تعريفها في Task 03 |
| Spacing | Completed | Task 02: Tokens + `bui-gap-*` فقط. كلاسات Margin/Padding ضمن Task 03 |
| Utilities | Planned | |
| Theme Manager | Planned | [RTL_LTR_AND_THEMES.md](RTL_LTR_AND_THEMES.md) |
| Locale Manager | Planned | [INTERNATIONALIZATION.md](INTERNATIONALIZATION.md) |
| Toast Manager / Modal Manager | Planned | Toast/Modal غير مدرجين في Sidebar بعد |
| Icons | Planned | [ICONS_SYSTEM.md](ICONS_SYSTEM.md) |

### Documentation Shell
| Item | Status | Notes |
|---|---|---|
| Navbar / Sidebar / Footer (`index.html`) | Completed | Task 01. اختُبر وفق قسم الاختبار في تقرير Task 01 |
| Documentation pages: Customization (3) + Layout (5) | Completed | Task 02. `documentation/customization/` و`documentation/layout/`. لا Playground (Task 09) ولا الأقسام الثمانية الخاصة بالمكونات، لذلك لا تُسجل كـ Documented |
| Shell: روابط Sidebar من الصفحات الفرعية (`data-docs-root`)، نسخ الكود، قراءات حية | Completed | Task 02. إصلاح `overflow-x: hidden` الذي كان يعطل `sticky` للـ Navbar |
| Shell: الشعار (Navbar Mark، Footer Logo، Favicon) وREADME | Completed | 2026-11-15. يُحقن من `docs.js`، ملفات `documentation/assets/images/brand/`. فُحصت صياغة JS وتوازن CSS فقط؛ لم يُختبر بصرياً في متصفح (RTL/LTR، Light/Dark، Responsive) |
