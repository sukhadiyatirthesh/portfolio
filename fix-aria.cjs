const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

// Fix ARIA label on div
html = html.replace(/<div class="tool-logo([^"]*)" aria-label=/g, '<div class="tool-logo$1" role="img" aria-label=');

// Add WebMCP form annotations
html = html.replace(/<form class="contact-form/g, '<form data-webmcp-form="contact" class="contact-form');
html = html.replace(/<input /g, '<input data-webmcp-input ');
html = html.replace(/<textarea /g, '<textarea data-webmcp-input ');

// Wait, the SVG has aria-hidden="true" in index.html line 1343 etc, which is fine.
// What about the "Accessibility tree is not well-formed"?
// Usually caused by headings not in order (h1, h2, h3).
// Or missing main landmark (fixed).

fs.writeFileSync('index.html', html);

// Also apply to landing-layout and blog-layout
let landing = fs.readFileSync('_includes/landing-layout.html', 'utf8');
landing = landing.replace(/<form class="contact-form/g, '<form data-webmcp-form="contact" class="contact-form');
landing = landing.replace(/<input /g, '<input data-webmcp-input ');
landing = landing.replace(/<textarea /g, '<textarea data-webmcp-input ');
fs.writeFileSync('_includes/landing-layout.html', landing);

console.log("Fixed.");
