const fs = require('fs');
const files = ['index.html', '_includes/landing-layout.html', '_includes/blog-layout.html'];

files.forEach(file => {
  if (fs.existsSync(file)) {
    let html = fs.readFileSync(file, 'utf8');
    
    // Remove link
    html = html.replace(/<link rel="webmcp" href="\/webmcp.json" \/>\n?/g, '');
    
    // Fix form
    html = html.replace(/<form data-webmcp-form="contact" /g, '<form toolname="book_consultation" tooldescription="Submit a contact form to get in touch with Tirthesh Jain for marketing services." ');
    html = html.replace(/<form class="contact-form/g, '<form toolname="book_consultation" tooldescription="Submit a contact form to get in touch with Tirthesh Jain for marketing services." class="contact-form');
    
    // Fix inputs
    html = html.replace(/<input data-webmcp-input type="text" id="contact-name" name="name"/g, '<input toolparamdescription="The user\'s full name" type="text" id="contact-name" name="name"');
    html = html.replace(/<input data-webmcp-input type="email" id="contact-email" name="email"/g, '<input toolparamdescription="The user\'s email address" type="email" id="contact-email" name="email"');
    html = html.replace(/<input data-webmcp-input type="text" id="contact-company" name="company"/g, '<input toolparamdescription="The user\'s company name" type="text" id="contact-company" name="company"');
    html = html.replace(/<textarea data-webmcp-input id="contact-message" name="message"/g, '<textarea toolparamdescription="The message or inquiry" id="contact-message" name="message"');
    
    // Also catch non-data-webmcp ones if they were missed
    html = html.replace(/<input type="text" id="contact-name" name="name"/g, '<input toolparamdescription="The user\'s full name" type="text" id="contact-name" name="name"');
    html = html.replace(/<input type="email" id="contact-email" name="email"/g, '<input toolparamdescription="The user\'s email address" type="email" id="contact-email" name="email"');
    html = html.replace(/<input type="text" id="contact-company" name="company"/g, '<input toolparamdescription="The user\'s company name" type="text" id="contact-company" name="company"');
    html = html.replace(/<textarea id="contact-message" name="message"/g, '<textarea toolparamdescription="The message or inquiry" id="contact-message" name="message"');

    // Clean up duplicate toolparamdescriptions if any
    html = html.replace(/(toolparamdescription="[^"]*")\s+\1/g, '$1');
    html = html.replace(/(toolname="[^"]*")\s+\1/g, '$1');
    html = html.replace(/(tooldescription="[^"]*")\s+\1/g, '$1');

    fs.writeFileSync(file, html);
    console.log("Fixed " + file);
  }
});
