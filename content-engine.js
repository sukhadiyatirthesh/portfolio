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
    
    const prompt = `You are Tirthesh Jain, an elite Performance Marketer and Growth Expert based in Ahmedabad, India.
    Your goal is to write a "Hard-Level", ultra-high-converting, and deeply technical SEO pillar blog post (minimum 1500 words) that ranks on the first page of Google.
    
    STEP 1: KEYWORD RESEARCH
    Identify a trending, high-search-volume topic in Performance Marketing for this month (e.g., Google Ads Performance Max updates, Meta Ads ROAS scaling, B2B Lead Gen).

    STEP 2: WRITE THE CONTENT
    Write a highly detailed, authoritative article targeting business owners and marketing directors.
    - Include LSI (Latent Semantic Indexing) keywords naturally.
    - Structure with H1, H2, and H3 tags.
    - Use bullet points, bold text for emphasis, and actionable data-driven strategies.
    
    STEP 3: CONVERSION INJECTION
    Inject exactly 2 aggressive "Call to Action" (CTA) sections driving the reader to contact you (Tirthesh Jain) for a free ad account audit or consulting. Link them to the contact section (e.g., "Ready to scale? Contact me today to audit your ad account.").
    
    STEP 4: SEO FAQ & SCHEMA
    Include a "Frequently Asked Questions" section at the bottom to target Google's "People Also Ask" snippets.

    Format the output EXACTLY like this (ensure the frontmatter is perfect YAML):
    ---
    layout: blog-layout.html
    title: "[Your Catchy, Clickbait-style SEO Title Here]"
    date: YYYY-MM-DD
    description: "[Your 160-character SEO meta description targeting the primary keyword]"
    tags: [blog, marketing, growth]
    ---
    
    [Full 1500+ Word Content in Markdown format here]
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
