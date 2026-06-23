/**
 * ═══════════════════════════════════════════════════════════════════
 *  TIRTHESH JAIN — AUTOMATED OFF-PAGE SEO DISTRIBUTION ENGINE
 *  Platforms: LinkedIn · Twitter/X · Medium · Reddit · Pinterest
 *  Trigger: Auto-fires after every AI blog post is generated
 * ═══════════════════════════════════════════════════════════════════
 */

import dotenv from 'dotenv';
dotenv.config();

import { GoogleGenerativeAI } from '@google/generative-ai';
import { createHmac } from 'crypto';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);

const PORTFOLIO_URL = 'https://tirthesh-jain-portfolio.vercel.app';
const DRY_RUN      = process.argv.includes('--dry-run');

if (DRY_RUN) console.log('🧪 DRY RUN MODE — No real API calls will be made.\n');

// ── Gemini AI ─────────────────────────────────────────────────────────────────
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function ai(prompt) {
  const model  = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
  const result = await model.generateContent(prompt);
  return result.response.text().trim();
}

// ── Blog Parser ───────────────────────────────────────────────────────────────
function getLatestBlog() {
  const blogDir = path.join(__dirname, 'blog');
  const files   = fs.readdirSync(blogDir)
    .filter(f => f.endsWith('.md'))
    .sort()
    .reverse();

  if (!files.length) throw new Error('No blog posts found in /blog directory.');

  const filename = files[0];
  const raw      = fs.readFileSync(path.join(blogDir, filename), 'utf-8');

  const get = (key) => {
    const m = raw.match(new RegExp(`${key}:\\s*"?([^"\\n]+)"?`));
    return m ? m[1].trim() : '';
  };

  const slug = filename.replace('.md', '');
  const url  = `${PORTFOLIO_URL}/blog/${slug}/`;

  // Strip YAML frontmatter to get markdown body
  const body = raw.replace(/^---[\s\S]*?---\n?/, '').trim();

  return {
    title      : get('title'),
    description: get('description'),
    date       : get('date'),
    url,
    slug,
    body,
    raw
  };
}

// ── Content Generator ─────────────────────────────────────────────────────────
async function generateCopy(blog, platform) {
  const baseContext = `
Blog Title: "${blog.title}"
Description: "${blog.description}"
Full URL: ${blog.url}
Author: Tirthesh Jain, elite Performance Marketer from Ahmedabad, India.
`;

  const prompts = {
    linkedin: `${baseContext}
Write a high-impact LinkedIn post promoting this blog. Rules:
- Start with a shocking stat or bold contrarian statement (NO "I'm excited to share")
- 3-5 punchy paragraphs, short sentences, data-driven
- Sound like a senior PPC expert — raw, direct, zero fluff
- End hard CTA: "Full breakdown → ${blog.url}"
- Add 5 relevant hashtags at the very end
- Max 1300 characters total
- NEVER use: "Furthermore", "In conclusion", "delve", "landscape", "navigate", "moreover"
Output ONLY the post text, nothing else.`,

    twitter: `${baseContext}
Write ONE viral tweet for performance marketers. Rules:
- Under 240 characters including the URL
- Start with a bold hook (number, controversial take, or surprising stat)
- End with the URL
- No hashtags, no emojis unless they add punch
- Sound human and confident
Output ONLY the tweet text, nothing else.`,

    reddit_title: `${baseContext}
Write a Reddit post TITLE for subreddits like r/PPC, r/digital_marketing, r/marketing. Rules:
- Max 300 characters
- Sound like a genuine practitioner sharing value, NOT promotional
- Curiosity-driven or problem-focused (e.g. "How I cut wasted spend by 41%...")
- Must feel organic, not like an ad
Output ONLY the title, nothing else.`,

    reddit_text: `${baseContext}
Write a short Reddit post body (3-4 sentences, max 300 chars) to go with this blog link. Sound like a genuine practitioner. Mention 1 concrete insight from the blog. End with "Link in comments" (don't add the actual URL in body).
Output ONLY the body text, nothing else.`,

    pinterest: `${baseContext}
Write a Pinterest pin description for a marketing blog post. Rules:
- 100-400 characters
- Keyword-rich naturally (performance marketing, Google Ads, Meta Ads, ROAS, PPC)
- End with: 👉 ${blog.url}
Output ONLY the description, nothing else.`,

    medium_intro: `${baseContext}
Write a 2-sentence Medium publication intro note that appears at the TOP of the crossposted article. Tell readers this was originally published on Tirthesh Jain's portfolio and links back there. Keep it simple and professional.
Output ONLY the intro note, nothing else.`
  };

  if (DRY_RUN) return `[DRY RUN — ${platform} copy would be generated here]`;
  return await ai(prompts[platform]);
}

// ── PLATFORM 1: LINKEDIN ──────────────────────────────────────────────────────
async function postToLinkedIn(blog) {
  const token     = process.env.LINKEDIN_ACCESS_TOKEN;
  const personUrn = process.env.LINKEDIN_PERSON_URN; // e.g. "abc123xyz"

  if (!token || !personUrn) throw new Error('Missing LINKEDIN_ACCESS_TOKEN or LINKEDIN_PERSON_URN');

  const copy = await generateCopy(blog, 'linkedin');

  const body = {
    author           : `urn:li:person:${personUrn}`,
    lifecycleState   : 'PUBLISHED',
    specificContent  : {
      'com.linkedin.ugc.ShareContent': {
        shareCommentary  : { text: copy },
        shareMediaCategory: 'ARTICLE',
        media            : [{
          status     : 'READY',
          description: { text: blog.description.slice(0, 200) },
          originalUrl: blog.url,
          title      : { text: blog.title }
        }]
      }
    },
    visibility: { 'com.linkedin.ugc.MemberNetworkVisibility': 'PUBLIC' }
  };

  if (DRY_RUN) return { platform: 'linkedin', success: true, dry: true, copy };

  const res = await fetch('https://api.linkedin.com/v2/ugcPosts', {
    method : 'POST',
    headers: {
      'Authorization'             : `Bearer ${token}`,
      'Content-Type'              : 'application/json',
      'X-Restli-Protocol-Version' : '2.0.0'
    },
    body: JSON.stringify(body)
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`LinkedIn ${res.status}: ${err}`);
  }

  const data = await res.json();
  return { platform: 'linkedin', success: true, postId: data.id, copy };
}

// ── PLATFORM 2: TWITTER / X ───────────────────────────────────────────────────
function buildOAuth1Header(method, url, bodyParams, creds) {
  const { apiKey, apiSecret, accessToken, accessSecret } = creds;
  const ts    = Math.floor(Date.now() / 1000).toString();
  const nonce = Math.random().toString(36).slice(2) + Math.random().toString(36).slice(2);

  const oauthParams = {
    oauth_consumer_key    : apiKey,
    oauth_nonce           : nonce,
    oauth_signature_method: 'HMAC-SHA1',
    oauth_timestamp       : ts,
    oauth_token           : accessToken,
    oauth_version         : '1.0'
  };

  const allParams    = { ...bodyParams, ...oauthParams };
  const paramString  = Object.keys(allParams).sort()
    .map(k => `${encodeURIComponent(k)}=${encodeURIComponent(allParams[k])}`)
    .join('&');

  const baseString   = [method.toUpperCase(), encodeURIComponent(url), encodeURIComponent(paramString)].join('&');
  const signingKey   = `${encodeURIComponent(apiSecret)}&${encodeURIComponent(accessSecret)}`;
  const signature    = createHmac('sha1', signingKey).update(baseString).digest('base64');

  oauthParams.oauth_signature = signature;

  const headerParts = Object.keys(oauthParams).sort()
    .map(k => `${encodeURIComponent(k)}="${encodeURIComponent(oauthParams[k])}"`)
    .join(', ');

  return `OAuth ${headerParts}`;
}

async function postToTwitter(blog) {
  const apiKey      = process.env.TWITTER_API_KEY;
  const apiSecret   = process.env.TWITTER_API_SECRET;
  const accessToken = process.env.TWITTER_ACCESS_TOKEN;
  const accessSecret= process.env.TWITTER_ACCESS_SECRET;

  if (!apiKey || !apiSecret || !accessToken || !accessSecret) {
    throw new Error('Missing Twitter/X API credentials (need all 4 keys)');
  }

  const tweetText = await generateCopy(blog, 'twitter');

  if (DRY_RUN) return { platform: 'twitter', success: true, dry: true, tweet: tweetText };

  const TWEET_URL = 'https://api.twitter.com/2/tweets';
  const authHeader = buildOAuth1Header('POST', TWEET_URL, {}, { apiKey, apiSecret, accessToken, accessSecret });

  const res = await fetch(TWEET_URL, {
    method : 'POST',
    headers: { 'Authorization': authHeader, 'Content-Type': 'application/json' },
    body   : JSON.stringify({ text: tweetText })
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Twitter ${res.status}: ${err}`);
  }

  const data = await res.json();
  return { platform: 'twitter', success: true, tweetId: data.data?.id, tweet: tweetText };
}

// ── PLATFORM 3: MEDIUM ────────────────────────────────────────────────────────
async function postToMedium(blog) {
  const token = process.env.MEDIUM_INTEGRATION_TOKEN;
  if (!token) throw new Error('Missing MEDIUM_INTEGRATION_TOKEN');

  if (DRY_RUN) return { platform: 'medium', success: true, dry: true };

  // Step 1: Get author ID
  const meRes  = await fetch('https://api.medium.com/v1/me', {
    headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
  });
  if (!meRes.ok) throw new Error(`Medium /me failed: ${meRes.status}`);

  const meData = await meRes.json();
  const userId = meData.data?.id;
  if (!userId) throw new Error('Could not resolve Medium user ID');

  // Step 2: Build crosspost content
  const intro   = await generateCopy(blog, 'medium_intro');
  const content = `> ${intro}\n\n---\n\n${blog.body}`;

  // Step 3: Publish
  const postRes = await fetch(`https://api.medium.com/v1/users/${userId}/posts`, {
    method : 'POST',
    headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
    body   : JSON.stringify({
      title        : blog.title,
      contentFormat: 'markdown',
      content,
      canonicalUrl : blog.url,           // 🔑 Free backlink to your portfolio
      publishStatus: 'public',
      tags         : ['performance-marketing', 'google-ads', 'meta-ads', 'ppc', 'digital-marketing']
    })
  });

  if (!postRes.ok) {
    const err = await postRes.text();
    throw new Error(`Medium publish ${postRes.status}: ${err}`);
  }

  const postData = await postRes.json();
  return { platform: 'medium', success: true, url: postData.data?.url, canonicalUrl: blog.url };
}

// ── PLATFORM 4: REDDIT ───────────────────────────────────────────────────────
async function postToReddit(blog) {
  const clientId     = process.env.REDDIT_CLIENT_ID;
  const clientSecret = process.env.REDDIT_CLIENT_SECRET;
  const username     = process.env.REDDIT_USERNAME;
  const password     = process.env.REDDIT_PASSWORD;

  if (!clientId || !clientSecret || !username || !password) {
    throw new Error('Missing Reddit credentials');
  }

  const title    = await generateCopy(blog, 'reddit_title');
  const textBody = await generateCopy(blog, 'reddit_text');

  if (DRY_RUN) return { platform: 'reddit', success: true, dry: true, title, textBody };

  // Authenticate
  const tokenRes = await fetch('https://www.reddit.com/api/v1/access_token', {
    method : 'POST',
    headers: {
      'Authorization' : `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString('base64')}`,
      'Content-Type'  : 'application/x-www-form-urlencoded',
      'User-Agent'    : 'TirtheshJainPortfolio/1.0 (by /u/tirtheshjain)'
    },
    body: `grant_type=password&username=${encodeURIComponent(username)}&password=${encodeURIComponent(password)}`
  });

  const tokenData = await tokenRes.json();
  const rToken    = tokenData.access_token;
  if (!rToken) throw new Error(`Reddit auth failed: ${JSON.stringify(tokenData)}`);

  // Target subreddits
  const subreddits = ['PPC', 'digital_marketing', 'marketing'];
  const subredditResults = [];

  for (const sr of subreddits) {
    try {
      // Post link
      const submitRes = await fetch('https://oauth.reddit.com/api/submit', {
        method : 'POST',
        headers: {
          'Authorization': `Bearer ${rToken}`,
          'Content-Type' : 'application/x-www-form-urlencoded',
          'User-Agent'   : 'TirtheshJainPortfolio/1.0'
        },
        body: new URLSearchParams({
          kind    : 'link',
          sr,
          title,
          url     : blog.url,
          resubmit: 'true',
          nsfw    : 'false'
        }).toString()
      });

      const submitData = await submitRes.json();
      const errors     = submitData?.json?.errors;

      if (errors && errors.length) {
        subredditResults.push({ subreddit: sr, success: false, errors });
      } else {
        const postUrl = submitData?.json?.data?.url || '';
        subredditResults.push({ subreddit: sr, success: true, postUrl });

        // Comment with URL (Reddit best practice — put link in comment)
        const postId = submitData?.json?.data?.name;
        if (postId) {
          await fetch('https://oauth.reddit.com/api/comment', {
            method : 'POST',
            headers: {
              'Authorization': `Bearer ${rToken}`,
              'Content-Type' : 'application/x-www-form-urlencoded',
              'User-Agent'   : 'TirtheshJainPortfolio/1.0'
            },
            body: new URLSearchParams({
              thing_id: postId,
              text    : `${textBody}\n\n**Full article:** ${blog.url}`
            }).toString()
          });
        }
      }
    } catch (e) {
      subredditResults.push({ subreddit: sr, success: false, error: e.message });
    }

    // Respect Reddit's rate limits — 2s between submissions
    if (sr !== subreddits[subreddits.length - 1]) {
      await new Promise(r => setTimeout(r, 2500));
    }
  }

  return { platform: 'reddit', success: true, subreddits: subredditResults };
}

// ── PLATFORM 6: DEV.TO ────────────────────────────────────────────────────────
async function postToDevTo(blog) {
  const apiKey = process.env.DEV_TO_API_KEY;
  if (!apiKey) throw new Error('Missing DEV_TO_API_KEY');

  if (DRY_RUN) return { platform: 'devto', success: true, dry: true };

  const content = `> *Originally published on [Tirthesh Jain's Portfolio](${blog.url})*\n\n---\n\n${blog.body}`;

  const res = await fetch('https://dev.to/api/articles', {
    method: 'POST',
    headers: {
      'api-key': apiKey,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      article: {
        title: blog.title,
        published: true,
        body_markdown: content,
        tags: ['marketing', 'seo', 'growth', 'ppc'],
        canonical_url: blog.url
      }
    })
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Dev.to publish ${res.status}: ${err}`);
  }

  const data = await res.json();
  return { platform: 'devto', success: true, url: data.url, canonicalUrl: blog.url };
}

// ── PLATFORM 5: PINTEREST ─────────────────────────────────────────────────────
async function postToPinterest(blog) {
  const token   = process.env.PINTEREST_ACCESS_TOKEN;
  const boardId = process.env.PINTEREST_BOARD_ID;

  if (!token || !boardId) throw new Error('Missing PINTEREST_ACCESS_TOKEN or PINTEREST_BOARD_ID');

  const description = await generateCopy(blog, 'pinterest');

  if (DRY_RUN) return { platform: 'pinterest', success: true, dry: true, description };

  const res = await fetch('https://api.pinterest.com/v5/pins', {
    method : 'POST',
    headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
    body   : JSON.stringify({
      link       : blog.url,
      title      : blog.title.slice(0, 100),
      description,
      board_id   : boardId,
      media_source: {
        source_type: 'image_url',
        url        : 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1200&q=80'
      }
    })
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Pinterest ${res.status}: ${err}`);
  }

  const data = await res.json();
  return { platform: 'pinterest', success: true, pinId: data.id, description };
}

// ── DISTRIBUTION LOG ──────────────────────────────────────────────────────────
function updateLog(blog, results) {
  const logPath = path.join(__dirname, 'distribution-log.json');
  let log = [];

  try {
    if (fs.existsSync(logPath)) {
      log = JSON.parse(fs.readFileSync(logPath, 'utf-8'));
    }
  } catch (_) { log = []; }

  log.unshift({
    timestamp: new Date().toISOString(),
    blog     : { title: blog.title, url: blog.url, date: blog.date },
    summary  : {
      total  : results.length,
      success: results.filter(r => r.success).length,
      failed : results.filter(r => !r.success).length
    },
    results
  });

  // Keep last 100 entries
  if (log.length > 100) log = log.slice(0, 100);

  fs.writeFileSync(logPath, JSON.stringify(log, null, 2));
}

// ── MAIN ──────────────────────────────────────────────────────────────────────
async function run() {
  console.log('\n════════════════════════════════════════════════════');
  console.log(' 🚀  TIRTHESH JAIN — OFF-PAGE SEO ENGINE v2.0');
  console.log('════════════════════════════════════════════════════\n');

  const blog = getLatestBlog();
  console.log(`📖 Blog: "${blog.title}"`);
  console.log(`🔗 URL:  ${blog.url}\n`);

  const distributors = [
    { name: 'LinkedIn',    emoji: '💼', fn: () => postToLinkedIn(blog)  },
    { name: 'Twitter/X',  emoji: '🐦', fn: () => postToTwitter(blog)   },
    { name: 'Medium',     emoji: '📰', fn: () => postToMedium(blog)    },
    { name: 'Dev.to',     emoji: '👨‍💻', fn: () => postToDevTo(blog)     },
    { name: 'Reddit',     emoji: '🔖', fn: () => postToReddit(blog)    },
    { name: 'Pinterest',  emoji: '📌', fn: () => postToPinterest(blog) }
  ];

  const results = [];

  for (const { name, emoji, fn } of distributors) {
    process.stdout.write(`${emoji} Posting to ${name}... `);
    try {
      const result = await fn();
      results.push(result);
      console.log('✅');
    } catch (err) {
      console.log('❌');
      console.error(`   └─ Error: ${err.message}`);
      results.push({ platform: name.toLowerCase().replace('/', '_'), success: false, error: err.message });
    }
  }

  updateLog(blog, results);

  const successes = results.filter(r => r.success).length;
  const fails     = results.length - successes;

  console.log('\n════════════════════════════════════════════════════');
  console.log(` 🎯  DONE — ${successes}/${distributors.length} platforms distributed`);
  if (fails > 0) console.log(` ⚠️   ${fails} platform(s) failed — check distribution-log.json`);
  console.log('════════════════════════════════════════════════════\n');

  if (successes === 0 && !DRY_RUN) process.exit(1);
}

run().catch(err => {
  console.error('\n💥 Fatal error:', err.message);
  process.exit(1);
});
