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

> **الوضع الحالي (بعد Task 04): كل المكونات Planned. لا يوجد أي Component منفذ.** المنفذ: Design Tokens وLayout (Container/Grid/Flexbox/Spacing) كأنظمة أساسية، وUtilities (Flexbox وSpacing وDisplay وPosition وOverflow وVisibility وBorders). روابط Sidebar للمكونات Placeholders.

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
| Design Tokens (Colors, Typography, Spacing, Borders, Radius, Shadows, Motion, Z-index, Focus, Breakpoints) | Documented | Task 03. اختُبر آلياً في Chromium فقط (انظر تقرير Task 03). صفحات: Colors, Typography, CSS Variables, Spacing. تحقق التباين: 40 ثنائية في كل وضع، محسوبة حياً في صفحة Colors. لم يُختبر بقارئ شاشة ولا Safari/Firefox ولا أجهزة لمس |
| Layout (Container/Grid/Flexbox/Spacing) | Documented | Task 03. صفحات Breakpoints, Container, Grid, Flexbox, Spacing. التوثيق بروح المعيار (استثناء الأقسام الثمانية موثق في [COMPONENT_DOCUMENTATION.md](COMPONENT_DOCUMENTATION.md)). حجم `baset-ui.css`: انظر CHANGELOG. Chromium فقط |
| Utilities | Documented | Flexbox وSpacing (Task 03)، وDisplay/Position/Overflow/Visibility/Borders (Task 04) مع 5 صفحات في `documentation/utilities/`. اختُبرت آلياً في Chromium فقط: 5 صفحات x LTR/RTL x Light/Dark x 8 عروض (320-1920) بلا Overflow أفقي ولا أخطاء Console ولا 404، وقيم Computed Style للأدوات. `bui-visually-hidden` لم يُختبر بقارئ شاشة. لم يُختبر Safari/Firefox ولا Forced Colors ولا أجهزة لمس. `:dir()` يتطلب متصفحاً حديثاً (translate-middle في RTL) |
| Theme Manager | Planned | [RTL_LTR_AND_THEMES.md](RTL_LTR_AND_THEMES.md) |
| Locale Manager | Planned | [INTERNATIONALIZATION.md](INTERNATIONALIZATION.md) |
| Toast Manager / Modal Manager | Planned | Toast/Modal غير مدرجين في Sidebar بعد |
| Icons | Planned | [ICONS_SYSTEM.md](ICONS_SYSTEM.md) |

### Documentation Shell
| Item | Status | Notes |
|---|---|---|
| Navbar / Sidebar / Footer (`index.html`) | Completed | Task 01. اختُبر وفق قسم الاختبار في تقرير Task 01. Task 02: أُصلح تثبيت (sticky) الـ Navbar/Sidebar في `docs.css` |
| Docs page template (`templates/DOC_PAGE_TEMPLATE.html`) | Completed | Task 02. بنيته نفسها منفذة ومختبرة آلياً (Chromium فقط). لا توجد صفحة توثيق حقيقية بعد |
| Docs page widgets (Breadcrumb, On this page, Previous/Next, Example, Code + Copy, Callouts, Tables) | Completed | Task 02. اختُبرت بصفحات مؤقتة خارج المشروع، ولم تُختبر بقارئ شاشة أو أجهزة لمس أو Safari/Firefox |
| Sidebar للصفحات المتداخلة (active + فتح القسم + تمرير) | Completed | Task 02. المسارات عبر `data-root` ([ARCHITECTURE.md](ARCHITECTURE.md)) |
| Live token widgets (`data-docs-token`, `tr[data-docs-contrast]`, `data-docs-current-bp`) | Completed | Task 03. في `docs.js`. اختُبرت في Chromium فقط |
| صفحات التوثيق الثمانية (Layout x5, Customization x3) | Completed | Task 03. مفعلة في `nav.js` |
| صفحات Utilities الخمس (Display, Position, Overflow, Visibility, Borders) | Completed | Task 04. مفعلة في `nav.js`. صفحة بلا أقسام Component الثمانية (استثناء موثق) |
