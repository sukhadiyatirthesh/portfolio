import dotenv from 'dotenv';
dotenv.config();
import { GoogleGenerativeAI } from '@google/generative-ai';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const API_KEY = process.env.GEMINI_API_KEY;
if (!API_KEY) {
  console.error("No GEMINI_API_KEY found. Exiting.");
  process.exit(1);
}

const genAI = new GoogleGenerativeAI(API_KEY);
const SITE_URL = 'https://tirthesh-jain-portfolio.vercel.app';

// ── RETRY WITH BACKOFF ────────────────────────────────────────────────────────
async function generateWithRetry(prompt, maxRetries = 3) {
  const models = [
    'gemini-2.0-flash', 
    'gemini-2.0-flash-lite',
    'gemini-1.5-pro',
    'gemini-1.5-flash',
    'gemini-1.5-flash-8b',
    'gemini-1.0-pro'
  ];
  
  for (const modelName of models) {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const model = genAI.getGenerativeModel({ model: modelName });
        const result = await model.generateContent(prompt);
        const response = await result.response;
        console.log(`✅ Generated using ${modelName} (attempt ${attempt})`);
        return response.text();
      } catch (err) {
        const isRateLimit = err.status === 429 || err.message?.includes('429');
        
        if (isRateLimit && attempt < maxRetries) {
          const waitMs = Math.pow(2, attempt) * 10000; // 20s, 40s, 80s
          console.log(`⏳ Rate limited on ${modelName}. Waiting ${waitMs/1000}s (attempt ${attempt}/${maxRetries})...`);
          await new Promise(r => setTimeout(r, waitMs));
        } else if (isRateLimit && attempt === maxRetries) {
          console.log(`⚠️  ${modelName} quota exhausted. Trying next model...`);
          break; // Try next model
        } else {
          throw err; // Non-rate-limit error, throw immediately
        }
      }
    }
  }
  throw new Error('All models and retries exhausted. Try again later.');
}

// ── TOPIC ROTATION — Never repeat topics ─────────────────────────────────────
const TOPIC_CATEGORIES = [
  // Google Ads Deep Dives
  "Google Ads Performance Max campaign optimization strategies for 2026",
  "Google Ads Quality Score hacks that reduce CPC by 40%+",
  "Google Ads Shopping campaigns: Feed optimization and bidding mastery",
  "Google Ads Demand Gen campaigns: The complete technical playbook",
  "Google Ads conversion tracking: Server-side tagging and Enhanced Conversions setup",
  "Google Ads audience signals: First-party data and Customer Match strategies",
  
  // Meta Ads Deep Dives
  "Meta Ads Advantage+ Shopping: The 2026 complete scaling framework",
  "Meta Ads CAPI and server-side tracking: iOS 18 survival guide",
  "Meta Ads creative testing at scale: The systematic framework that wins",
  "Meta Ads cost-per-lead optimization: From ₹500 CPL to ₹80 CPL",
  "Meta Ads retargeting funnels: Advanced Custom Audience layering",
  "Meta Ads for B2B lead generation: LinkedIn killer strategies",
  
  // SEO & Content Marketing
  "Local SEO domination: How to rank #1 in 'near me' searches in 2026",
  "AI Overviews (AIO) SEO: How to get featured in Google's AI answers",
  "Programmatic SEO: Scaling to 10,000 pages that drive organic traffic",
  "Technical SEO audit checklist: Core Web Vitals and page experience in 2026",
  "Content velocity strategy: Publishing daily for exponential organic growth",
  "E-E-A-T signals: Building topical authority that Google rewards",
  
  // Growth & Strategy
  "Full-funnel paid media strategy: TOFU to BOFU campaign architecture",
  "Attribution modeling in 2026: Data-Driven vs. Last-Click vs. MMM",
  "CAC to LTV optimization: The unit economics every founder must track",
  "Zero-click search strategy: Winning when users never click through",
  "WhatsApp marketing + paid ads: The India growth hack playbook",
  "Performance marketing for D2C brands: ₹0 to ₹1Cr revenue framework",
  
  // Analytics & Tracking
  "GA4 advanced setup: Custom events, audiences, and predictive metrics",
  "Google Tag Manager server-side: Complete implementation guide",
  "Looker Studio dashboards for performance marketers: Templates and formulas",
  "Marketing Mix Modeling (MMM) for startups: Budget allocation science",
  
  // Industry Specific
  "Performance marketing for real estate: Lead gen that actually converts",
  "Performance marketing for healthcare: HIPAA-compliant paid strategies",
  "Performance marketing for SaaS: Free trial to paid conversion funnels",
  "Performance marketing for e-commerce: ROAS scaling from 2X to 8X+"
];

function getTopicForToday() {
  const historyPath = path.join(__dirname, 'blog', '.topic-history.json');
  let usedTopics = [];
  
  try {
    if (fs.existsSync(historyPath)) {
      usedTopics = JSON.parse(fs.readFileSync(historyPath, 'utf-8'));
    }
  } catch (_) { usedTopics = []; }
  
  // Filter out already-used topics
  let available = TOPIC_CATEGORIES.filter(t => !usedTopics.includes(t));
  
  // If all topics used, reset the rotation
  if (available.length === 0) {
    usedTopics = [];
    available = [...TOPIC_CATEGORIES];
  }
  
  // Pick random from available
  const topic = available[Math.floor(Math.random() * available.length)];
  
  // Save to history
  usedTopics.push(topic);
  fs.writeFileSync(historyPath, JSON.stringify(usedTopics, null, 2));
  
  return topic;
}

// ── GET EXISTING BLOG SLUGS FOR INTERNAL LINKING ──────────────────────────────
function getExistingBlogLinks() {
  const blogDir = path.join(__dirname, 'blog');
  const files = fs.readdirSync(blogDir)
    .filter(f => f.endsWith('.md') && !f.startsWith('.'))
    .sort()
    .reverse()
    .slice(0, 5); // Last 5 posts for internal linking

  return files.map(f => {
    const raw = fs.readFileSync(path.join(blogDir, f), 'utf-8');
    const titleMatch = raw.match(/title:\s*"(.*?)"/);
    const slug = f.replace('.md', '');
    return {
      title: titleMatch ? titleMatch[1] : slug,
      url: `/blog/${slug}/`
    };
  });
}

// ── DYNAMIC SITEMAP UPDATE ────────────────────────────────────────────────────
function updateSitemap() {
  const blogDir = path.join(__dirname, 'blog');
  const files = fs.readdirSync(blogDir)
    .filter(f => f.endsWith('.md') && !f.startsWith('.'))
    .sort()
    .reverse();

  const today = new Date().toISOString().split('T')[0];

  let urls = `  <url>
    <loc>${SITE_URL}/</loc>
    <lastmod>${today}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>${SITE_URL}/blog/</loc>
    <lastmod>${today}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>`;

  for (const f of files) {
    const slug = f.replace('.md', '');
    const dateMatch = f.match(/^(\d{4}-\d{2}-\d{2})/);
    const date = dateMatch ? dateMatch[1] : today;
    urls += `
  <url>
    <loc>${SITE_URL}/blog/${slug}/</loc>
    <lastmod>${date}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>`;
  }

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:news="http://www.google.com/schemas/sitemap-news/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${urls}
</urlset>`;

  fs.writeFileSync(path.join(__dirname, 'sitemap.xml'), sitemap);
  console.log(`🗺️  Sitemap updated with ${files.length} blog posts`);
}

// ── MAIN BLOG GENERATOR (2 POSTS PER DAY) ───────────────────────────────────
async function generateBlog() {
  try {
    const POSTS_PER_DAY = 2;
    let postsCreated = 0;
    
    console.log(`\n═══════════════════════════════════════════`);
    console.log(`  🚀 GENERATING ${POSTS_PER_DAY} BLOG POSTS TODAY`);
    console.log(`═══════════════════════════════════════════\n`);

    for (let postNum = 1; postNum <= POSTS_PER_DAY; postNum++) {
    const todaysTopic = getTopicForToday();
    const existingPosts = getExistingBlogLinks();
    const internalLinksContext = existingPosts.length > 0
      ? `\nINTERNAL LINKS TO INCLUDE (naturally weave 2-3 of these into the article):\n${existingPosts.map(p => `- [${p.title}](${p.url})`).join('\n')}`
      : '';

    const today = new Date().toISOString().split('T')[0];

    const prompt = `You are Tirthesh Jain, an elite Top 1% Performance Marketer and Growth Expert based in Ahmedabad, India. You manage millions in ad spend and consult for 6-figure brands.

TODAY'S ASSIGNED TOPIC: "${todaysTopic}"
TODAY'S DATE: ${today}

Your goal is to write THE definitive, Google #1 ranking, ultra-high-converting SEO pillar blog post on this topic.

═══════════════════════════════════════════════════════
🚨 CRITICAL SEO OPTIMIZATION RULES (FOLLOW ALL OF THESE)
═══════════════════════════════════════════════════════

1. WORD COUNT: Minimum 2500 words. Google rewards comprehensive, in-depth content. Thin content = no rankings.

2. TITLE TAG OPTIMIZATION:
   - Include the PRIMARY keyword within the first 3 words
   - Use power modifiers: "Ultimate Guide", "Complete Framework", "2026", "[Data-Backed]", "Step-by-Step"
   - Under 60 characters for Google SERP display
   - Must create irresistible curiosity + search intent match

3. META DESCRIPTION:
   - Exactly 150-155 characters
   - Include primary keyword + secondary keyword
   - Include a CTA or benefit statement
   - Use numbers or data points for CTR boost

4. HEADING STRUCTURE (H2/H3 HIERARCHY):
   - Every H2 must contain a high-volume keyword variation
   - Use H3s under each H2 for sub-topics
   - Include question-based H2s for PAA (People Also Ask) targeting
   - Minimum 6 H2 sections + 3 H3 subsections

5. KEYWORD STRATEGY:
   - Primary keyword: Mention 8-12 times naturally across 2500+ words (0.4-0.5% density)
   - Secondary keywords: 3-5 LSI keywords mentioned 3-5 times each
   - Entity SEO: Mention related entities (tools, platforms, brands) to build topical relevance
   - Semantic NLP optimization: Use contextually related terms throughout

6. AI OVERVIEW (AIO) OPTIMIZATION:
   - START the article with a "TL;DR" section using bullet points (5-7 points)
   - These bullets must be direct, factual, and self-contained
   - Google's AI Overview WILL scrape these bullets for featured answers
   - Each bullet should answer a micro-question about the topic

7. E-E-A-T SIGNALS (Experience, Expertise, Authority, Trust):
   - Include first-person experience: "In my campaigns, I observed..."
   - Reference specific metrics: "This reduced CPA by 34% in 3 weeks"
   - Mention tools you use: Google Ads Editor, Meta Business Suite, GA4, GTM, Looker Studio
   - Include dates and timeframes to show recency
   - Cite industry sources (Google's official documentation, Think with Google, Meta Business Help Center)

8. CONTENT STRUCTURE FOR MAXIMUM DWELL TIME:
   - Short paragraphs (2-3 sentences max)
   - Bold key takeaways in every section
   - Use numbered lists and bullet points liberally
   - Include "Pro Tip:" callouts in blockquotes
   - Add comparison tables where relevant (use markdown tables)

9. INTERNAL LINKING:
${internalLinksContext || '   - No previous posts available yet — skip internal links'}

10. UI/UX & DATA VISUALIZATION (NO IMAGES):
    DO NOT generate or include any images or image links. Instead, use advanced Markdown to create a stunning UI/UX experience:
    - Use Markdown Tables: Include at least TWO detailed comparison tables (e.g., "Before vs After", "Cost vs ROI", "Tool Comparisons").
    - Use Alert Blocks: Use blockquotes for critical warnings and pro-tips (e.g., `> ⚠️ **CRITICAL WARNING:** ...` or `> 💡 **PRO TIP:** ...`).
    - Use Horizontal Rules (`---`) to separate major sections visually.
    - Use Bold and Italic text aggressively to highlight key metrics and KPIs.
    - Create a "Quick Summary Metrics" bulleted list at the very top of the article.

11. CTA INJECTION (CONVERSION OPTIMIZATION):
    - Include exactly 3 CTAs spread across the article (top, middle, bottom)
    - Use urgency and specificity: "Book your free 15-minute ad account audit"
    - Link format: [CTA text](#contact)
    - Make CTAs contextually relevant to the surrounding content

12. FAQ SCHEMA TARGETING:
    - Include a "Frequently Asked Questions" section at the bottom
    - Answer 5 hyper-specific questions (target Google's PAA box)
    - Each answer: 2-3 sentences, direct, factual, keyword-rich
    - Questions should match actual Google autocomplete/PAA queries

13. WRITING STYLE (ANTI-AI DETECTION):
    - NEVER use: "Furthermore", "In conclusion", "As we navigate", "Delve into", "Landscape", "Moreover", "Leverage", "Utilize", "It's worth noting", "In today's digital age"
    - DO use: Short punchy sentences. Contractions. Direct address ("you", "your"). 
    - Write like you're talking to a fellow marketer over chai — raw, direct, no fluff
    - Include mild opinions and strong stances ("Stop doing X. It's killing your ROAS.")
    - Use industry slang correctly: "creative fatigue", "learning phase", "signal loss", "auction overlap"

14. READABILITY:
    - Target Flesch Reading Ease: 60-70 (conversational professional)
    - Average sentence length: 12-18 words
    - Use transition words: "Here's the thing", "Look", "Bottom line", "Real talk"

FORMAT THE OUTPUT EXACTLY LIKE THIS:
---
layout: blog-layout.html
title: "[SEO-Optimized Title — Under 60 chars, primary keyword first]"
date: ${today}
description: "[150-155 char meta description with primary + secondary keyword and CTA]"
tags: [blog, marketing, growth]
author: "Tirthesh Jain"
canonical: "${SITE_URL}/blog/${today}-SLUG/"
---

[Full 2500+ Word Expert Content in Markdown]

IMPORTANT: Replace SLUG in the canonical URL with the actual slug derived from your title.
Output ONLY the markdown with frontmatter. No explanations, no preamble.`;

    console.log(`\n🎯 Topic ${postNum}/2: "${todaysTopic}"`);
    console.log("🤖 Generating world-class SEO content...\n");
    
    let text = await generateWithRetry(prompt);

    // Clean up any code fences Gemini might wrap around the output
    text = text.replace(/^```(?:markdown|md)?\n?/gm, '').replace(/\n?```$/gm, '');

    // Create filename from title
    const titleMatch = text.match(/title:\s*"(.*?)"/);
    let titleStr = titleMatch ? titleMatch[1] : `marketing-insights-${Date.now()}`;
    const slug = titleStr.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    
    // Fix canonical URL with actual slug
    text = text.replace(/SLUG\//g, `${slug}/`);
    
    const filename = `${today}-${slug}.md`;
    const filepath = path.join(__dirname, 'blog', filename);
    
    // Check for duplicate (same day + same slug)
    if (fs.existsSync(filepath)) {
      console.log(`⚠️  Blog already exists: ${filename}. Skipping.`);
      continue;
    }
    
    fs.writeFileSync(filepath, text);
    console.log(`✅ Blog post ${postNum}/2 created: ${filename}`);
    console.log(`📊 Word count: ~${text.split(/\s+/).length} words`);
    postsCreated++;

    // Small delay between posts to avoid back-to-back API hammering
    if (postNum < 2) {
      console.log('\n⏳ Waiting 10s before generating post 2...\n');
      await new Promise(r => setTimeout(r, 10000));
    }
  }

    // Update sitemap with all new posts
    updateSitemap();
    console.log(`\n🎉 Done! ${postsCreated} blog post(s) created today.`);
    
  } catch (err) {
    console.error("❌ Failed to generate blog:", err);
    process.exit(1);
  }
}

generateBlog();
