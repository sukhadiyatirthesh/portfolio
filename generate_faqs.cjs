const fs = require('fs');
const path = require('path');

const faqs = {
  "WordPress Website Development": [
    { q: "Will the website be mobile-friendly and fast?", a: "Absolutely. Every WordPress site I build follows a 'mobile-first' approach. I also ensure rigorous optimization so the site scores 90+ on Google PageSpeed Insights, ensuring zero lag for your mobile users." },
    { q: "How long does it take to build a custom WordPress site?", a: "A standard, highly-optimized WordPress website usually takes 2 to 4 weeks from the initial strategy phase to final deployment. E-commerce or highly complex portals may take slightly longer." },
    { q: "Can I manage the content myself after launch?", a: "Yes. I build the backend with user-friendly custom fields and block editors, allowing you or your team to easily update text, images, and blog posts without touching a single line of code." },
    { q: "Do you provide website maintenance and security?", a: "Yes, I offer ongoing maintenance packages that include core updates, plugin updates, daily backups, and robust security monitoring to keep your site safe from malware and hackers." },
    { q: "Will my website be SEO-friendly?", a: "100%. I build all WordPress sites with semantic HTML, proper heading structures, optimized image delivery, and schema markup integration right out of the box." },
    { q: "Can you redesign my existing website?", a: "Yes, I specialize in revamping outdated WordPress sites. We will audit your current site, migrate your existing content, and deploy a modern, high-converting design without losing your SEO rankings." }
  ],
  "SEO": [
    { q: "How long does it take to see results from SEO?", a: "SEO is a long-term investment. Typically, you will start seeing noticeable shifts in organic rankings and traffic within 3 to 6 months, depending on the competitiveness of your niche and the age of your domain." },
    { q: "Are your SEO practices safe from Google penalties?", a: "100%. I strictly adhere to White-Hat SEO techniques. I focus on creating helpful content, building genuine authority, and ensuring technical perfection. No spammy links or black-hat tactics that risk a Google penalty." },
    { q: "Do you do Local SEO for {{ pageData.city }} businesses?", a: "Yes. Local SEO is highly effective for brick-and-mortar or service businesses. I optimize your Google Business Profile (GBP), manage local citations, and create hyper-localized content to dominate 'near me' searches." },
    { q: "How do you handle Technical SEO?", a: "Technical SEO is the foundation. I audit and fix Core Web Vitals, canonical tags, xml sitemaps, robots.txt, mobile usability, and internal linking structures to ensure Google can crawl and index your site flawlessly." },
    { q: "Do you guarantee a #1 ranking on Google?", a: "No ethical SEO expert can guarantee a #1 spot due to Google's dynamic algorithm. However, I do guarantee a proven, data-backed methodology that has consistently grown organic traffic and leads for my clients." },
    { q: "Will you provide SEO reports?", a: "Yes, you will receive comprehensive monthly reports detailing keyword ranking movements, organic traffic growth, backlink acquisitions, and the number of leads generated directly from SEO." }
  ],
  "Graphic Design": [
    { q: "What types of design do you handle?", a: "I handle everything from social media creatives, ad banners, and pitch decks to full brand identity design (logos, typography, color palettes) for businesses in {{ pageData.city }}." },
    { q: "Do you provide source files?", a: "Yes, upon project completion and final payment, you will receive all high-resolution exports (PNG, PDF, SVG) as well as the original source files (PSD, AI, or Figma) for your records." },
    { q: "How many revisions are included?", a: "Most of my design packages include up to 2-3 rounds of revisions to ensure the final product perfectly aligns with your vision and brand standards." },
    { q: "Do you design landing pages or UI/UX?", a: "Yes, I specialize in designing high-converting landing pages and user interfaces in Figma before we move them into the development phase." },
    { q: "What is your design turnaround time?", a: "For standard social media creatives or ad banners, turnaround is typically 24-48 hours. Larger projects like full brand identity or website UI take 1-2 weeks." },
    { q: "Will the designs be optimized for ad platforms?", a: "Absolutely. I design specifically for performance. Every ad creative is optimized for Facebook/Google's text-to-image ratios, safe zones, and visual hierarchy to maximize click-through rates." }
  ],
  "Video Editing": [
    { q: "Do you edit Reels and TikToks?", a: "Yes, short-form vertical video is one of my specialties. I edit high-retention Reels, Shorts, and TikToks using dynamic captions, fast cuts, and trending audio to maximize virality in {{ pageData.city }}." },
    { q: "What do you need from me to start?", a: "I need your raw footage (via Google Drive/Dropbox), any specific branding assets (logos, fonts), and a brief outline of the goal or style you're aiming for. I handle the rest." },
    { q: "Can you do motion graphics?", a: "Yes, I integrate professional motion graphics, lower thirds, tracking text, and VFX elements to make your videos look highly produced and engaging." },
    { q: "Do you edit YouTube long-form videos?", a: "Yes. I edit YouTube documentaries, talking-head videos, and podcasts. I focus on pacing, B-roll integration, and sound design to keep audience retention high throughout the video." },
    { q: "Can you help with Video Sales Letters (VSLs)?", a: "Definitely. VSLs require a specific direct-response editing style. I use pattern interrupts, kinetic typography, and psychological pacing to maximize viewer conversion rates." },
    { q: "What software do you use?", a: "I primarily edit using Adobe Premiere Pro and After Effects for advanced motion graphics, ensuring the highest industry standard for your final exports." }
  ],
  "Social Media Management": [
    { q: "Which platforms do you manage?", a: "I specialize in managing Instagram, Facebook, LinkedIn, and Twitter (X) for brands in {{ pageData.city }}. We choose the platforms where your target audience is most active." },
    { q: "Do you create the content too?", a: "Yes. As a full-stack manager, I write the captions, design the graphics, and edit the videos. You don't have to worry about sourcing content from multiple freelancers." },
    { q: "How do you track success?", a: "I provide monthly reports detailing follower growth, engagement rates, reach, and most importantly, the number of leads or website clicks generated from organic social media efforts." },
    { q: "Do you handle community engagement?", a: "Yes. Replying to comments, responding to direct messages, and actively engaging with other accounts in your niche is a core part of my organic growth strategy." },
    { q: "How many times a week will you post?", a: "Post frequency depends on your package, but generally, I recommend 3-5 high-quality posts per week combined with daily stories to keep your brand top-of-mind." },
    { q: "Do you use automation tools?", a: "I use scheduling tools like Buffer or Later for consistency, but all community engagement and content creation is done manually to maintain a genuine brand voice." }
  ],
  "Default": [
    { q: "Do you guarantee specific ROAS or leads?", a: "While no one can ethically guarantee specific ROAS due to external market factors, I do guarantee a strictly data-driven approach, 100% transparency, and relentless optimization. My past campaigns have achieved up to 4.55X ROAS using these exact frameworks." },
    { q: "How long does it take to see results from {{ pageData.service }}?", a: "For paid campaigns like {{ pageData.service }}, initial traction and data gathering take about 7 to 14 days. We enter the aggressive optimization and scaling phase within the first month once we identify the winning audiences and creatives." },
    { q: "What ad budget do you recommend for businesses in {{ pageData.city }}?", a: "The ideal starting budget depends on your niche and average order value (AOV). However, I recommend a minimum starting budget of ₹50,000 to ₹1,00,000 per month so we have enough data velocity to exit the learning phase quickly." },
    { q: "Do you set up tracking and analytics?", a: "Yes. Before spending a single rupee, I ensure Google Tag Manager, GA4, Meta Pixel, and Conversions API (CAPI) are flawlessly integrated so we can attribute every sale or lead accurately." },
    { q: "Will I have ownership of the ad accounts?", a: "100%. You will retain full admin ownership of all Google, Meta, and analytics accounts. I only request partner/agency access to manage them on your behalf." },
    { q: "Do you create the ad creatives?", a: "Yes, my performance marketing packages include the creation of high-converting ad copies and static/video creatives designed specifically to stop the scroll and drive clicks." }
  ]
};

let htmlOutput = ``;
let jsonOutput = ``;

Object.keys(faqs).forEach((service, index) => {
  const isDefault = service === "Default";
  const condition = isDefault ? `{% else %}` : `${index === 0 ? '{% if' : '{% elif'} pageData.service == "${service}" %}`;
  
  htmlOutput += `      ${condition}\n`;
  jsonOutput += `    ${condition}\n`;
  
  faqs[service].forEach((faq, fIndex) => {
    // HTML
    htmlOutput += `      <details class="faq-item"${fIndex === 0 ? ' open' : ''}>\n`;
    htmlOutput += `        <summary class="faq-summary">${faq.q}</summary>\n`;
    htmlOutput += `        <div class="faq-content">\n          ${faq.a}\n        </div>\n`;
    htmlOutput += `      </details>\n`;
    
    // JSON-LD
    jsonOutput += `    {\n`;
    jsonOutput += `      "@type": "Question",\n`;
    jsonOutput += `      "name": "${faq.q}",\n`;
    jsonOutput += `      "acceptedAnswer": {\n`;
    jsonOutput += `        "@type": "Answer",\n`;
    jsonOutput += `        "text": "${faq.a}"\n`;
    jsonOutput += `      }\n`;
    jsonOutput += `    }${fIndex < faqs[service].length - 1 ? ',' : ''}\n`;
  });
});

htmlOutput += `      {% endif %}`;
jsonOutput += `    {% endif %}`;

const finalHtml = `
<!-- FAQS -->
<section class="premium-section premium-section-alt">
  <div class="container">
    <div class="section-header reveal-up">
      <h2>Frequently Asked Questions</h2>
      <p>Common questions about my {{ pageData.service }} services in {{ pageData.city }}.</p>
    </div>
    
    <div class="faq-container reveal-up">
${htmlOutput}
    </div>
  </div>
</section>

<!-- FAQ SCHEMA SCRIPT FOR RICH SNIPPETS -->
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
${jsonOutput}
  ]
}
</script>
`;

const filePath = path.join(__dirname, 'seo-landing.njk');
let fileContent = fs.readFileSync(filePath, 'utf-8');

// Replace everything from <!-- FAQS --> to the end of the file
const faqStartIndex = fileContent.indexOf('<!-- FAQS -->');
if(faqStartIndex !== -1) {
  fileContent = fileContent.substring(0, faqStartIndex) + finalHtml.trim() + '\\n';
  fs.writeFileSync(filePath, fileContent);
  console.log("Successfully updated seo-landing.njk with 6 FAQs per service.");
} else {
  console.log("Could not find <!-- FAQS --> in the file.");
}
