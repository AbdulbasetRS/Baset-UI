/*
 * Navigation structure of the documentation website (single source of truth for
 * the Sidebar, Breadcrumb and Previous/Next links).
 *
 * FORMAT
 *   window.BUI_DOCS_NAV = [ { title: 'Section', items: [ item, item, ... ] }, ... ];
 *   item = 'Title'                         -> disabled placeholder (no page yet)
 *        | { title: 'Title' }              -> disabled placeholder
 *        | { title: 'Title', href: '...' } -> active link
 *
 * HREF RULES
 *   - `href` is relative to the SITE ROOT (the folder that contains index.html).
 *   - No leading slash, no "../", no protocol: the site is served from the
 *     sub-path /Baset-UI/ on GitHub Pages and may be opened from file://.
 *   - docs.js prefixes the site root, so one value works from any page depth.
 *   - Pages live in the folder that matches their Sidebar section (ARCHITECTURE.md).
 *
 * TO ACTIVATE A PAGE
 *   1. Create the page from instructions/templates/DOC_PAGE_TEMPLATE.html.
 *   2. Replace the item string with an object, for example:
 *        'Button'  ->  { title: 'Button', href: 'documentation/components/button.html' }
 *   3. Edit nothing else: order here = Sidebar order = Previous/Next order.
 *
 * See instructions/COMPONENT_DOCUMENTATION.md for the full procedure.
 */
window.BUI_DOCS_NAV = [
    { title: 'Get Started', items: ['Introduction', 'Installation', 'Quick Start', 'Download', 'Browser Support'] },
    { title: 'Layout', items: [{ title: 'Breakpoints', href: 'documentation/layout/breakpoints.html' }, { title: 'Container', href: 'documentation/layout/container.html' }, { title: 'Grid', href: 'documentation/layout/grid.html' }, { title: 'Flexbox', href: 'documentation/layout/flexbox.html' }, { title: 'Spacing', href: 'documentation/layout/spacing.html' }] },
    { title: 'Customization', items: [{ title: 'Colors', href: 'documentation/customization/colors.html' }, { title: 'Typography', href: 'documentation/customization/typography.html' }, { title: 'CSS Variables', href: 'documentation/customization/css-variables.html' }, 'Themes', 'Dark Mode'] },
    { title: 'Components', items: ['Accordion', 'Alert', 'Avatar', 'Badge', 'Button', 'Button Group', 'Card', 'Carousel', 'Close Button', 'Dialog', 'Drawer', 'Menu', 'Pagination', 'Popover', 'Progress', 'List Group'] },
    { title: 'Forms', items: ['Form Controls', 'Input', 'Select', 'Checkbox', 'Radio', 'Switch', 'Date Picker', 'Time Picker'] },
    { title: 'Data Display', items: ['DataTable', 'Charts', 'Calendar', 'Maps'] },
    { title: 'Utilities', items: [{ title: 'Display', href: 'documentation/utilities/display.html' }, { title: 'Position', href: 'documentation/utilities/position.html' }, { title: 'Overflow', href: 'documentation/utilities/overflow.html' }, { title: 'Visibility', href: 'documentation/utilities/visibility.html' }, { title: 'Borders', href: 'documentation/utilities/borders.html' }] },
    { title: 'JavaScript', items: ['Introduction', 'Initialization', 'Events', 'API Reference'] },
    { title: 'Extensions', items: ['Overview'] },
    { title: 'Accessibility', items: ['Guidelines', 'Keyboard Navigation'] },
    { title: 'Advanced', items: ['RTL & LTR', 'Internationalization', 'Icons'] },
    { title: 'Development', items: ['Changelog', 'Contributing'] }
];
