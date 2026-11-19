# خطة التطوير المستقبلية

> اقتراح قابل للتعديل. لا شيء هنا منفذ ما لم يُسجل في [COMPONENTS_REGISTRY.md](COMPONENTS_REGISTRY.md).

| المرحلة | المحتوى |
|---|---|
| **0 (منجزة): Foundation** | الهيكل، `instructions/`، Shell التوثيق |
| 1: Core Tokens | Colors/Typography/Spacing/Breakpoints الكاملة، Container/Grid/Flex، Utilities الأساسية، أول صفحات Layout/Customization |
| 2: Core JS | `BUI` Namespace، Init، Events، Config |
| 3: Systems | Theme Manager + أول Theme إضافي، Locale Manager، قرار تقنية الأيقونات وأول مجموعة |
| 4: Playground Framework | إطار Customize المشترك + قالب صفحة التوثيق |
| 5: Basic Components | Button, Alert, Badge, Card, Close Button, Avatar, Progress, List Group |
| 6: Forms | Form Controls, Input, Checkbox, Radio, Switch, Select |
| 7: Overlays/Navigation | Dialog, Drawer, Popover, Menu, Toast, Accordion, Pagination, Carousel |
| 8: Extensions | DataTable, Charts, Calendar, Maps, Date/Time Pickers |
| 9: Quality | Accessibility audit، اختبارات آلية (بموافقة)، أداء |
| 10: Release | `v1.0.0`، توثيق كامل، أمثلة في `examples/` |

## قرارات مفتوحة تحتاج حسماً
1. ~~تقنية الأيقونات ومصدر التصميمات~~: حُسم في Task 07 (Phosphor + SVG Mask)، انظر [ICONS_SYSTEM.md](ICONS_SYSTEM.md).
2. أداة الاختبار الآلي وأداة الضغط (Dependencies).
3. قالب صفحات التوثيق المشترك (بدون Build).
4. تأكيد الترخيص MIT.
