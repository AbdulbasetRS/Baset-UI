Baset UI
===========

Baset UI is a small, self-contained HTML/CSS/JS component library and documentation site. I reorganized the project and changed the component prefix from `bu-` to `bui-` across the documented components and scripts.

What's changed
- All component classes and CSS custom properties now use the `bui-` prefix (for example: `bui-btn`, `--bui-primary`).
- JS behavior updated to target the new classes (assets/js/baset-ui.js).
- Individual component example pages added under `components/` (buttons, forms, cards, alerts, badges, utilities).
- README updated with installation and usage instructions.

Installation
1. Clone the repository:

   git clone https://github.com/AbdulbasetRS/Baset-UI.git
   cd Baset-UI

2. Open the documentation locally by opening `index.html` in your browser.

Optional: Run a static server (recommended for proper routing)

   npx serve .

Usage
- Include the stylesheet and script in your project pages:

  <link rel="stylesheet" href="assets/css/baset-ui.css">
  <script src="assets/js/baset-ui.js"></script>

- Use the `bui-` prefixed classes in your markup. Example:

  <button class="bui-btn bui-btn-primary">Primary</button>

Copy buttons
- Each example page includes a "Copy" button. The button uses a `data-copy` attribute that contains the encoded HTML snippet (with `&lt;`, `&gt;`, `&quot;`). The library decodes and writes the content to the clipboard when the button is clicked.

Next steps (what I can do next)
- Convert every component example on the main `index.html` into the individual component pages with more examples.
- Add build scripts, minified assets, and a packaged distribution folder (`dist/`).
- Add accessibility checks and keyboard copy button support.

If you want, I can now:
- Convert more components into detailed example pages.
- Add a `dist/` build and update the example `data-copy` values to point to full component demos.
- Restore any specific CSS tokens or styles you want preserved from the original file.
