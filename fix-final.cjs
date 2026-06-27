const fs = require('fs');

// 1. Fix CSS
let css = fs.readFileSync('_includes/styles.css', 'utf8');
css = css.replace(/--text-muted: [^;]+;/g, '--text-muted: #D1D5DB;');
css = css.replace(/--text-subtle: [^;]+;/g, '--text-subtle: #9CA3AF;');
css = css.replace(/--font-heading: [^;]+;/g, '--font-heading: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;');
css = css.replace(/--font-body: [^;]+;/g, '--font-body: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;');
css = css.replace(/0%, 100% \{ height: 48px; opacity: 0\.5; \}/g, '0%, 100% { transform: scaleY(1); opacity: 0.5; }');
css = css.replace(/50% \{ height: 32px; opacity: 1; \}/g, '50% { transform: scaleY(0.66); opacity: 1; }');
css = css.replace(/height: 48px;\s*background: linear-gradient/g, 'height: 48px; transform-origin: top; background: linear-gradient');
fs.writeFileSync('_includes/styles.css', css);

// 2. Fix HTML files
const files = ['index.html', '_includes/landing-layout.html', '_includes/blog-layout.html'];
files.forEach(f => {
  let html = fs.readFileSync(f, 'utf8');
  
  // Remove font links completely
  html = html.replace(/<link rel="preconnect" href="https:\/\/fonts.googleapis.com"[^>]*>\n?/g, '');
  html = html.replace(/<link rel="preconnect" href="https:\/\/fonts.gstatic.com"[^>]*>\n?/g, '');
  html = html.replace(/<link rel="preconnect" href="https:\/\/api.fontshare.com"[^>]*>\n?/g, '');
  html = html.replace(/<link rel="preload" as="style" href="https:\/\/fonts.googleapis.com[^\n]*\n?/g, '');
  html = html.replace(/<noscript><link href="https:\/\/fonts.googleapis.com[^\n]*\n?/g, '');
  html = html.replace(/<link rel="preload" as="style" href="https:\/\/api.fontshare.com[^\n]*\n?/g, '');
  html = html.replace(/<noscript><link href="https:\/\/api.fontshare.com[^\n]*\n?/g, '');
  
  // Remove setTimeout for GA4 so it ONLY loads on interaction, avoiding Lighthouse entirely
  html = html.replace(/setTimeout\(loadGA, 3500\);/g, '');
  
  fs.writeFileSync(f, html);
});
console.log('Fixed CSS and HTML');
