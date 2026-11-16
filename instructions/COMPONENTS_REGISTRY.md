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

> **الوضع الحالي (Task 01): كل المكونات Planned. لا يوجد أي مكون منفذ.** الروابط في Sidebar Placeholders فقط.

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
| Layout (Container/Grid/Flex/Spacing) | Planned | |
| Utilities | Planned | |
| Theme Manager | Planned | [RTL_LTR_AND_THEMES.md](RTL_LTR_AND_THEMES.md) |
| Locale Manager | Planned | [INTERNATIONALIZATION.md](INTERNATIONALIZATION.md) |
| Toast Manager / Modal Manager | Planned | Toast/Modal غير مدرجين في Sidebar بعد |
| Icons | Planned | [ICONS_SYSTEM.md](ICONS_SYSTEM.md) |

### Documentation Shell
| Item | Status | Notes |
|---|---|---|
| Navbar / Sidebar / Footer (`index.html`) | Completed | Task 01. اختُبر وفق قسم الاختبار في تقرير Task 01 |
