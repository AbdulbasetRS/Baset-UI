/*
 * Navigation structure of the documentation website.
 * To activate a page: create the HTML file, then set its `href` (relative to the site root).
 * Items without `href` are rendered as disabled placeholders.
 * See instructions/COMPONENT_DOCUMENTATION.md for the procedure.
 */
window.BUI_DOCS_NAV = [
    { title: 'Get Started', items: ['Introduction', 'Installation', 'Quick Start', 'Download', 'Browser Support'] },
    { title: 'Layout', items: [
        { title: 'Breakpoints', href: 'documentation/layout/breakpoints.html' },
        { title: 'Container', href: 'documentation/layout/container.html' },
        { title: 'Grid', href: 'documentation/layout/grid.html' },
        { title: 'Flexbox', href: 'documentation/layout/flexbox.html' },
        { title: 'Spacing', href: 'documentation/layout/spacing.html' }
    ] },
    { title: 'Customization', items: [
        { title: 'Colors', href: 'documentation/customization/colors.html' },
        { title: 'Typography', href: 'documentation/customization/typography.html' },
        { title: 'CSS Variables', href: 'documentation/customization/css-variables.html' },
        'Themes',
        'Dark Mode'
    ] },
    { title: 'Components', items: ['Accordion', 'Alert', 'Avatar', 'Badge', 'Button', 'Button Group', 'Card', 'Carousel', 'Close Button', 'Dialog', 'Drawer', 'Menu', 'Pagination', 'Popover', 'Progress', 'List Group'] },
    { title: 'Forms', items: ['Form Controls', 'Input', 'Select', 'Checkbox', 'Radio', 'Switch', 'Date Picker', 'Time Picker'] },
    { title: 'Data Display', items: ['DataTable', 'Charts', 'Calendar', 'Maps'] },
    { title: 'Utilities', items: ['Display', 'Position', 'Overflow', 'Visibility', 'Borders'] },
    { title: 'JavaScript', items: ['Introduction', 'Initialization', 'Events', 'API Reference'] },
    { title: 'Extensions', items: ['Overview'] },
    { title: 'Accessibility', items: ['Guidelines', 'Keyboard Navigation'] },
    { title: 'Advanced', items: ['RTL & LTR', 'Internationalization', 'Icons'] },
    { title: 'Development', items: ['Changelog', 'Contributing'] }
];

/*
 * Footer configuration (documentation shell only).
 * Documentation column: generated from the sections above (first linked page of each section).
 * Add `footer: false` to a section to leave it out.
 * Contact column: add real links only, e.g. { title: 'LinkedIn', href: 'https://...' } or
 * { title: 'Email', href: 'mailto:name@example.com' }. The column is hidden while the list is empty.
 * Note: GitHub links must follow instructions/PROJECT_OVERVIEW.md (official repository only).
 */
window.BUI_DOCS_FOOTER = {
    contact: [
        { title: 'LinkedIn', href: 'https://www.linkedin.com/in/abdulbaset-r-sayed/' },
        { title: 'Email', href: 'mailto:abdulbasetredasayedhf@gmail.com' }
    ]
};
