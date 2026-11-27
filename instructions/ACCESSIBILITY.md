# Accessibility

الهدف: **WCAG 2.2 مستوى AA** لكل مكون (إلزامي). هذا جزء من تعريف الاكتمال وليس تحسيناً لاحقاً.

## قواعد عامة
- استخدم عناصر HTML الدلالية أولاً (`button`, `a`, `nav`, `ul`) قبل ARIA.
- كل عنصر تفاعلي قابل للوصول بالكيبورد وله `:focus-visible` واضح (Tokens: `--bui-color-focus`).
- التباين: نص عادي ≥ 4.5:1، نص كبير وعناصر واجهة ≥ 3:1، في Light وDark وكل Theme.
- لا يعتمد المعنى على اللون وحده.
- أهداف اللمس ≥ 24x24px كحد أدنى حسب WCAG، والمستهدف 44px ([RESPONSIVE_DESIGN.md](RESPONSIVE_DESIGN.md)).
- احترم `prefers-reduced-motion`.
- الأيقونات الزخرفية `aria-hidden="true"`؛ الأيقونات ذات المعنى لها نص بديل ([ICONS_SYSTEM.md](ICONS_SYSTEM.md)).
- النصوص الداخلية (aria-label وغيرها) تأتي من i18n.
- تغيير `lang` و`dir` يجب أن ينعكس على القراءة.

## Keyboard (الأنماط المرجعية)
| النمط | المفاتيح |
|---|---|
| Button/Link | Enter، Space (للزر) |
| Dialog | Focus Trap، Esc للإغلاق، إعادة التركيز للمصدر |
| Menu/Listbox | الأسهم، Home/End، Esc، Type-ahead |
| Tabs | الأسهم للتنقل، Tab للخروج |
| Accordion | Enter/Space، الأسهم (اختياري) |
في RTL تنعكس مفاتيح الأسهم الأفقية.

## ARIA
- استخدم Roles/States وفق [WAI-ARIA Authoring Practices] المطابقة لنمط المكون، وحدّث `aria-expanded/selected/checked/disabled/current` ديناميكياً.
- مناطق حية: `aria-live="polite"` للتنبيهات العادية، `assertive` للأخطاء الحرجة فقط.
- `Toast/Alert`: `role="status"` أو `role="alert"` حسب الأهمية. (Task 15) Alert: `alert` لـ danger وwarning و`status` للباقي، والنوع يُقال بالأيقونة والعنوان لا باللون وحده. Toast: حاوية واحدة `role="region"` + `aria-live="polite"` باسم من i18n، و`role="alert"` لـ danger، ولا سرقة Focus، وEsc يغلق toast المركّز فقط، والمؤقت يتوقف عند Hover/Focus، وtoast بإجراءات دائم افتراضياً (WCAG 2.2.1). **لم يُختبر بقارئ شاشة.**

- (Task 16) Popover: غير مودال؛ المرتكز `aria-haspopup="dialog"` و`aria-expanded` و`aria-controls`، واللوحة `role="dialog"` باسم من العنوان أو `aria-label` (يحذّر المكون إن غاب). Esc يغلق أعلى طبقة فقط ويعيد التركيز للمرتكز، Tab من آخر عنصر يغلق ويكمل من المرتكز، وhover/focus triggers تبقى مفتوحة فوق اللوحة (WCAG 1.4.13) ولا تحمل محتوى ضرورياً. Menu: نمط ARIA Menu Button (`role=menu` و`menuitem|menuitemcheckbox|menuitemradio` و`aria-checked`)، المرتكز نقطة Tab واحدة والعناصر تُركَّز بالسكربت، الأسهم مع الالتفاف وHome/End وType-ahead وEsc وTab، والعنصر `aria-disabled` قابل للوصول، وفي القائمة الأفقية تنعكس الأسهم الأفقية في RTL. **لم يُختبر بقارئ شاشة.**

## الاختبار (إلزامي لكل مكون)
تنقل كامل بالكيبورد فقط، فحص Screen Reader (NVDA/VoiceOver أو معادل) مع تسجيل ما اختُبر، فحص تباين، فحص آلي (مثال axe) إن توفر بموافقة على الأداة ([TESTING.md](TESTING.md)).
قسم **Accessibility** في كل صفحة مكون يوثق: Keyboard، ARIA، سلوك Screen Reader.
