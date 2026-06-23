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
  console.error("No GEMINI_API_KEY found. Exiting. Please add it to your environment variables or a .env file.");
  process.exit(1);
}

const genAI = new GoogleGenerativeAI(API_KEY);

async function generateBlog() {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
    
    const prompt = `You are Tirthesh Jain, an elite Top 1% Performance Marketer and Growth Expert based in Ahmedabad, India. You manage millions in ad spend.
    Your goal is to write an absolute MASTERCLASS, ultra-high-converting, and deeply technical SEO pillar blog post (minimum 1800 words) that ranks #1 on Google.
    
    CRITICAL RULE: DO NOT SOUND LIKE AN AI. DO NOT use generic AI filler words like "Furthermore", "In conclusion", "As we navigate", "Delve into", or "Landscape". Write with the raw, direct, and aggressive tone of a seasoned expert who only cares about ROAS, CPAs, and data. Use extremely technical jargon correctly (e.g., Server-Side Tagging, CAPI, Offline Conversion Tracking, Data-Driven Attribution).
    
    STEP 1: TREND IDENTIFICATION
    Hypothesize the most cutting-edge, 2026-relevant Performance Marketing trend right now. (e.g., Advanced AI Bidding, Surviving Zero-Click Google Searches, First-Party Data strategies for Meta Ads, Local SEO dominance).
    
    STEP 2: WRITE WORLD-CLASS CONTENT
    - Write a highly detailed, authoritative article targeting Business Owners, Founders, and CMOs.
    - Entity SEO & LSI: Naturally integrate high-density semantic keywords without keyword stuffing.
    - AI Overviews (AIO) Optimization: Include a "TL;DR" at the top with bullet points specifically designed for Google's AI Overview to scrape and feature.
    - Formatting: Use H2s, H3s, bolding for emphasis, short punchy paragraphs, and actionable data-backed strategies.

    STEP 3: PREMIUM VISUAL INJECTION
    You must include EXACTLY TWO beautiful, highly professional cover images within the markdown. Use Unsplash source URLs with hyper-specific premium keywords.
    Format them EXACTLY like this:
    ![Premium Strategy Visualization](https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&q=80)
    ![Data Analytics Dashboard](https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1200&q=80)
    (Ensure the URLs are EXACTLY as written above to guarantee high-quality cinematic business aesthetics).
    
    STEP 4: CONVERSION INJECTION
    Inject exactly 2 aggressive "Call to Action" (CTA) sections driving the reader to contact you (Tirthesh Jain) for a free ad account audit or consulting. Link them to the contact section (e.g., "[Ready to scale? Contact me today to audit your ad account.](#contact)").
    
    STEP 5: SEO FAQ & SCHEMA
    Include a "Frequently Asked Questions" section at the bottom to target Google's "People Also Ask" snippets. Provide direct, 2-sentence answers to 3 highly searched questions.

    Format the output EXACTLY like this (ensure the frontmatter is perfect YAML):
    ---
    layout: blog-layout.html
    title: "[Your Catchy, High-CTR, Clickbait-style SEO Title Here]"
    date: YYYY-MM-DD
    description: "[Your 150-character SEO meta description targeting the primary keyword perfectly]"
    tags: [blog, marketing, growth]
    ---
    
    [Full 1800+ Word Expert Content in Markdown format here]
    `;

    console.log("🤖 Asking AI for today's blog topic...");
    const result = await model.generateContent(prompt);
    const response = await result.response;
    let text = response.text();

    // Fix the date
    const today = new Date().toISOString().split('T')[0];
    text = text.replace(/YYYY-MM-DD/g, today);
    
    // Create a filename
    const titleMatch = text.match(/title:\s*"(.*?)"/);
    let titleStr = titleMatch ? titleMatch[1] : `marketing-insights-${Date.now()}`;
    const slug = titleStr.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    
    const filename = `${today}-${slug}.md`;
    const filepath = path.join(__dirname, 'blog', filename);
    
    fs.writeFileSync(filepath, text);
    console.log(`✅ Automated Blog post created successfully: ${filepath}`);
    
  } catch (err) {
    console.error("❌ Failed to generate blog:", err);
    process.exit(1);
  }
}

generateBlog();
