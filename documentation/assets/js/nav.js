/*
 * Navigation structure of the documentation website.
 * To activate a page: create the HTML file, then set its `href` (relative to the site root).
 * Items without `href` are rendered as disabled placeholders.
 * See instructions/COMPONENT_DOCUMENTATION.md for the procedure.
 */
window.BUI_DOCS_NAV = [
    { title: 'Get Started', items: ['Introduction', 'Installation', 'Quick Start', 'Download', 'Browser Support'] },
    { title: 'Layout', items: ['Breakpoints', 'Container', 'Grid', 'Flexbox', 'Spacing'] },
    { title: 'Customization', items: ['Colors', 'Typography', 'CSS Variables', 'Themes', 'Dark Mode'] },
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
