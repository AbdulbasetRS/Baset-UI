/*
 * Baset UI docs — navigation manifest (docs-only).
 * Single source of truth for the sidebar, breadcrumbs, previous/next links
 * and the page-level entries of the search index.
 * Paths are relative to the docs/ folder.
 */
(function () {
  var D = (window.BUIDocs = window.BUIDocs || {});

  D.nav = {
    repoUrl: 'https://github.com/AbdulbasetRS/Baset-UI',
    editBase: 'https://github.com/AbdulbasetRS/Baset-UI/edit/main/docs/',
    siteTitle: { en: 'Baset UI documentation', ar: 'توثيق Baset UI' },
    home: {
      id: 'index',
      path: 'index.html',
      title: { en: 'Overview', ar: 'نظرة عامة' },
      description: {
        en: 'Documentation home: project status and where to start.',
        ar: 'الصفحة الرئيسية للتوثيق: حالة المشروع ومن أين تبدأ.'
      },
      keywords: { en: 'home status overview', ar: 'الرئيسية حالة المشروع نظرة عامة' }
    },
    groups: [
      {
        id: 'getting-started',
        title: { en: 'Getting Started', ar: 'البدء' },
        pages: [
          {
            id: 'getting-started/introduction',
            path: 'getting-started/introduction.html',
            title: { en: 'Introduction', ar: 'المقدمة' },
            description: {
              en: 'What Baset UI is, its goals, what exists today and a basic usage example.',
              ar: 'ما هي Baset UI، وأهدافها، وما هو متاح اليوم، ومثال استخدام أساسي.'
            },
            keywords: {
              en: 'about features why framework agnostic overview basic usage status',
              ar: 'نبذة مميزات لماذا مستقلة عن الأطر نظرة عامة استخدام أساسي الحالة'
            }
          },
          {
            id: 'getting-started/install',
            path: 'getting-started/install.html',
            title: { en: 'Install', ar: 'التثبيت' },
            description: {
              en: 'Which installation methods exist today, which do not, and what is needed before announcing them.',
              ar: 'طرق التثبيت المتاحة اليوم وغير المتاحة، وما يلزم تنفيذه قبل الإعلان عنها.'
            },
            keywords: {
              en: 'install cdn npm download source files git clone zip required files',
              ar: 'تثبيت سي دي ان npm تحميل ملفات المصدر نسخ المستودع الملفات المطلوبة'
            }
          },
          {
            id: 'getting-started/approach',
            path: 'getting-started/approach.html',
            title: { en: 'Approach', ar: 'المنهجية' },
            description: {
              en: 'Design philosophy and architecture: framework-agnostic, progressive enhancement, modular, CSS architecture, lifecycle, RTL/LTR.',
              ar: 'فلسفة التصميم والبنية: استقلال عن الأطر، تحسين تدريجي، وحدات مستقلة، بنية CSS، دورة الحياة، RTL/LTR.'
            },
            keywords: {
              en: 'philosophy architecture vanilla javascript progressive enhancement modular css lifecycle rtl ltr logical properties',
              ar: 'فلسفة بنية جافاسكربت خالصة تحسين تدريجي وحدات css دورة الحياة خصائص منطقية'
            }
          },
          {
            id: 'getting-started/css-variables',
            path: 'getting-started/css-variables.html',
            title: { en: 'CSS Variables', ar: 'متغيرات CSS' },
            description: {
              en: 'Every design token defined today: colors, typography, spacing, radius, shadows, themes and how to customize them.',
              ar: 'كل Design Token معرّف اليوم: الألوان والخطوط والمسافات والزوايا والظلال والثيمات وطريقة تخصيصها.'
            },
            keywords: {
              en: 'css variables custom properties tokens colors typography spacing radius shadow theme dark light customize override --bui',
              ar: 'متغيرات css خصائص مخصصة ألوان خطوط مسافات زوايا ظلال ثيم داكن فاتح تخصيص'
            }
          },
          {
            id: 'getting-started/javascript',
            path: 'getting-started/javascript.html',
            title: { en: 'JavaScript', ar: 'جافاسكربت' },
            description: {
              en: 'Current JavaScript status (none yet) and the contracts future component scripts must follow.',
              ar: 'حالة جافاسكربت الحالية (لا يوجد بعد) والقواعد التي يجب أن تلتزم بها سكربتات المكونات مستقبلًا.'
            },
            keywords: {
              en: 'javascript initialization api events lifecycle configuration instances errors BUI namespace',
              ar: 'جافاسكربت تهيئة واجهة برمجية أحداث دورة الحياة إعدادات نسخ أخطاء BUI'
            }
          },
          {
            id: 'getting-started/browsers-devices',
            path: 'getting-started/browsers-devices.html',
            title: { en: 'Browsers & Devices', ar: 'المتصفحات والأجهزة' },
            description: {
              en: 'Proposed browser support policy, platform features relied on, and what has and has not been tested.',
              ar: 'سياسة دعم المتصفحات المقترحة، وميزات المنصة المعتمَد عليها، وما تم اختباره وما لم يُختبر.'
            },
            keywords: {
              en: 'browsers devices support desktop mobile responsive compatibility policy chrome firefox safari edge',
              ar: 'متصفحات أجهزة دعم سطح المكتب الجوال متجاوب سياسة التوافق'
            }
          },
          {
            id: 'getting-started/accessibility',
            path: 'getting-started/accessibility.html',
            title: { en: 'Accessibility', ar: 'إمكانية الوصول' },
            description: {
              en: 'Accessibility principles, measured color contrast of the tokens, keyboard use of this site and testing status.',
              ar: 'مبادئ إمكانية الوصول، وقياسات تباين ألوان الـ tokens، واستخدام لوحة المفاتيح في هذا الموقع، وحالة الاختبار.'
            },
            keywords: {
              en: 'accessibility a11y semantic html keyboard focus aria screen reader contrast wcag testing',
              ar: 'إمكانية الوصول لوحة المفاتيح التركيز aria قارئ الشاشة التباين اختبار'
            }
          }
        ]
      },
      {
        id: 'customize',
        title: { en: 'Customize', ar: 'التخصيص' },
        pages: [
          {
            id: 'customize/colors',
            path: 'customize/colors.html',
            title: { en: 'Colors', ar: 'الألوان' },
            description: {
              en: 'The default color palette, light and dark values, usage rules and how to customize colors.',
              ar: 'لوحة الألوان الافتراضية، وقيم الفاتح والداكن، وقواعد الاستخدام، وطريقة تخصيص الألوان.'
            },
            keywords: {
              en: 'colors palette primary semantic success warning danger info light dark values usage customize contrast brand',
              ar: 'ألوان لوحة أساسي دلالي نجاح تحذير خطر معلومة فاتح داكن استخدام تخصيص تباين علامة'
            }
          },
          {
            id: 'customize/color-modes',
            path: 'customize/color-modes.html',
            title: { en: 'Color Modes', ar: 'أوضاع الألوان' },
            description: {
              en: 'Light and dark mode, theme architecture, switching, persistence and creating a custom theme.',
              ar: 'الوضعان الفاتح والداكن، وبنية الثيم، والتبديل، والحفظ، وإنشاء ثيم مخصص.'
            },
            keywords: {
              en: 'color modes light dark theme architecture switching toggle persistence localstorage prefers-color-scheme custom theme bui-dark bui-light',
              ar: 'أوضاع الألوان فاتح داكن ثيم بنية تبديل حفظ ثيم مخصص bui-dark bui-light'
            }
          },
          {
            id: 'customize/typography',
            path: 'customize/typography.html',
            title: { en: 'Typography', ar: 'الخطوط' },
            description: {
              en: 'Font families, sizes, weights, line heights, text utilities status and typography customization.',
              ar: 'عائلات الخطوط والأحجام والأوزان وارتفاع السطر، وحالة أدوات النصوص، وتخصيص الخطوط.'
            },
            keywords: {
              en: 'typography fonts font family size weight line height text utilities rem arabic customize',
              ar: 'خطوط طباعة عائلة حجم وزن ارتفاع السطر أدوات النصوص عربي تخصيص'
            }
          },
          {
            id: 'customize/spacing',
            path: 'customize/spacing.html',
            title: { en: 'Spacing', ar: 'المسافات' },
            description: {
              en: 'The spacing scale, margin and padding, gap, responsive spacing and spacing customization.',
              ar: 'سلّم المسافات، والهوامش والحشوة، والفجوات، والمسافات المتجاوبة، وتخصيص المسافات.'
            },
            keywords: {
              en: 'spacing scale margin padding gap responsive clamp space tokens density',
              ar: 'مسافات سلّم هامش حشوة فجوة متجاوب كثافة'
            }
          },
          {
            id: 'customize/css-variables',
            path: 'customize/css-variables.html',
            title: { en: 'CSS Variables', ar: 'متغيرات CSS' },
            description: {
              en: 'Naming conventions, the complete index of implemented variables, overrides and practical examples.',
              ar: 'قواعد التسمية، والفهرس الكامل للمتغيرات المنفَّذة، والتعديلات، وأمثلة عملية.'
            },
            keywords: {
              en: 'css variables custom properties naming convention index override setproperty fallback examples --bui',
              ar: 'متغيرات css خصائص مخصصة تسمية فهرس تعديل أمثلة'
            }
          },
          {
            id: 'customize/rtl-customization',
            path: 'customize/rtl-customization.html',
            title: { en: 'RTL Customization', ar: 'تخصيص RTL' },
            description: {
              en: 'RTL architecture, logical CSS properties, direction-aware components and RTL/LTR customization.',
              ar: 'بنية RTL، وخصائص CSS المنطقية، والمكونات التي تراعي الاتجاه، وتخصيص RTL/LTR.'
            },
            keywords: {
              en: 'rtl ltr direction dir logical properties margin-inline arabic bidi mirror icons',
              ar: 'rtl ltr اتجاه خصائص منطقية عربي عكس أيقونات ثنائي الاتجاه'
            }
          }
        ]
      },
      {
        id: 'layout',
        title: { en: 'Layout', ar: 'التخطيط' },
        pages: [
          {
            id: 'layout/containers',
            path: 'layout/containers.html',
            title: { en: 'Containers', ar: 'الحاويات' },
            description: {
              en: 'Fixed and fluid containers: bui-container, bui-container-fluid, maximum widths per breakpoint.',
              ar: 'الحاويات الثابتة والسائلة: bui-container وbui-container-fluid وأقصى العروض لكل نقطة توقف.'
            },
            keywords: {
              en: 'containers container fluid bui-container bui-container-fluid max width centered responsive',
              ar: 'حاويات bui-container bui-container-fluid عرض أقصى توسيط متجاوب سائلة ثابتة'
            }
          },
          {
            id: 'layout/grid-system',
            path: 'layout/grid-system.html',
            title: { en: 'Grid System', ar: 'نظام الشبكة' },
            description: {
              en: 'The 12-column responsive grid: containers, rows, columns, gutters, auto layout, nesting, alignment, offset and order.',
              ar: 'شبكة الـ 12 عمودًا المتجاوبة: الحاويات والصفوف والأعمدة والمسافات والتخطيط التلقائي والتداخل والمحاذاة والإزاحة والترتيب.'
            },
            keywords: {
              en: 'grid system 12 columns bui-row bui-col bui-col-md-6 gutters bui-g-3 offset order nesting auto layout responsive align',
              ar: 'شبكة نظام 12 عمود صف أعمدة bui-row bui-col مسافات إزاحة ترتيب تداخل تخطيط تلقائي محاذاة متجاوب'
            }
          },
          {
            id: 'layout/breakpoints',
            path: 'layout/breakpoints.html',
            title: { en: 'Breakpoints', ar: 'نقاط التوقف' },
            description: {
              en: 'The seven official breakpoints (xs to xxxl), the mobile-first approach, where the values live and how to customize them.',
              ar: 'نقاط التوقف الرسمية السبع (من xs إلى xxxl)، وأسلوب mobile-first، وأين تُخزَّن القيم، وكيف تخصّصها.'
            },
            keywords: {
              en: 'breakpoints xs sm md lg xl xxl xxxl 480 576 768 992 1200 1600 1920 media queries min-width mobile first',
              ar: 'نقاط التوقف xs sm md lg xl xxl xxxl استعلامات الوسائط mobile first 768 992 1200'
            }
          },
          {
            id: 'layout/display',
            path: 'layout/display.html',
            title: { en: 'Display', ar: 'العرض' },
            description: {
              en: 'Display and visibility utilities (bui-d-*) with responsive variants, and how to show or hide content by breakpoint.',
              ar: 'أدوات العرض والإظهار (bui-d-*) مع متغيرات متجاوبة، وكيف تُظهر المحتوى أو تُخفيه حسب نقطة التوقف.'
            },
            keywords: {
              en: 'display visibility bui-d-none bui-d-md-block hidden show hide responsive utilities',
              ar: 'عرض إظهار إخفاء bui-d-none bui-d-md-block hidden أدوات متجاوب'
            }
          },
          {
            id: 'layout/flexbox',
            path: 'layout/flexbox.html',
            title: { en: 'Flexbox', ar: 'Flexbox' },
            description: {
              en: 'Flex utilities: direction, justify-content, align-items, align-content, align-self and wrap, with a live class playground.',
              ar: 'أدوات flex: الاتجاه وjustify-content وalign-items وalign-content وalign-self والالتفاف، مع ساحة تجربة حية بالأصناف.'
            },
            keywords: {
              en: 'flexbox flex direction justify-content align-items align-content align-self wrap bui-flex bui-justify-content utilities playground',
              ar: 'flexbox اتجاه محاذاة التفاف bui-flex bui-justify-content bui-align-items أدوات تجربة'
            }
          },
          {
            id: 'layout/spacing-utilities',
            path: 'layout/spacing-utilities.html',
            title: { en: 'Spacing Utilities', ar: 'أدوات المسافات' },
            description: {
              en: 'The grid gutter classes (bui-g, bui-gx, bui-gy) and the status of margin, padding and gap utilities (not implemented).',
              ar: 'أصناف مسافات الشبكة (bui-g وbui-gx وbui-gy) وحالة أدوات الهامش والحشوة والفجوة (غير منفَّذة).'
            },
            keywords: {
              en: 'spacing utilities gutters bui-g-3 bui-gx bui-gy margin padding gap not implemented',
              ar: 'أدوات المسافات مسافات bui-g-3 bui-gx bui-gy هامش حشوة فجوة غير منفذ'
            }
          }
        ]
      }
    ]
  };

  /** Flat ordered list used for previous/next navigation: home first. */
  D.navPages = function () {
    var list = [D.nav.home];
    D.nav.groups.forEach(function (g) {
      g.pages.forEach(function (p) { list.push(p); });
    });
    return list;
  };
})();
