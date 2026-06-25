# 🔑 Off-Page SEO Automation — API Keys Setup Guide

Your automated off-page SEO system needs **14 secrets** added to GitHub once.
After that, everything runs **fully automatically** — zero human input required.

---

## ⚡ What Changed (v2.0 → v3.0)

| Feature | Before (v2.0) | Now (v3.0) |
|---|---|---|
| Blog Frequency | Every 2 days | **DAILY** (12 AM UTC / 5:30 AM IST) |
| Word Count | ~1800 words | **2500+ words** (Google rewards depth) |
| SEO Level | Basic | **Nuclear** (E-E-A-T, AIO, Schema, NLP) |
| Topic System | Random | **Smart rotation** (never repeats) |
| Internal Linking | None | **Auto-links last 5 posts** |
| Sitemap | Static | **Auto-updates after every post** |
| Search Engine Ping | None | **Pings Google + Bing after each post** |
| Schema Markup | None | **Article + Breadcrumb + FAQ Schema** |
| Blog Template | Basic | **Share buttons, author box, breadcrumbs** |
| Duplicate Prevention | None | **Skips if blog already exists for today** |

---

## How to Add Secrets to GitHub

1. Go to your repo → **Settings** → **Secrets and variables** → **Actions**
2. Click **"New repository secret"**
3. Add each secret below

---

## Platform 1: Gemini AI (Already Have)

| Secret Name | How to Get |
|---|---|
| `GEMINI_API_KEY` | Already in your `.env` — just add it to GitHub Secrets |

---

## Platform 2: LinkedIn

**Goal:** Auto-post professional blog teasers to your LinkedIn profile.

| Secret Name | Value |
|---|---|
| `LINKEDIN_ACCESS_TOKEN` | See steps below |
| `LINKEDIN_PERSON_URN` | Your LinkedIn member ID (see below) |

**Steps:**
1. Go to [LinkedIn Developer Portal](https://www.linkedin.com/developers/apps) → Create App
2. Add products: **"Share on LinkedIn"** + **"Sign In with LinkedIn using OpenID Connect"**
3. Under **Auth** tab → copy your `Client ID` and `Client Secret`
4. Use [LinkedIn OAuth 2.0 Token Generator](https://www.linkedin.com/developers/tools/oauth/token-generator) to generate an access token with scopes: `r_liteprofile`, `w_member_social`
5. To get your `LINKEDIN_PERSON_URN`:
   ```
   curl -H "Authorization: Bearer YOUR_TOKEN" https://api.linkedin.com/v2/me
   ```
   Copy the `id` field (e.g. `abc123xyz`) — that's your Person URN

---

## Platform 3: Twitter / X

**Goal:** Auto-tweet punchy blog announcements.

| Secret Name | Value |
|---|---|
| `TWITTER_API_KEY` | Consumer Key |
| `TWITTER_API_SECRET` | Consumer Secret |
| `TWITTER_ACCESS_TOKEN` | Access Token |
| `TWITTER_ACCESS_SECRET` | Access Token Secret |

**Steps:**
1. Go to [developer.twitter.com](https://developer.twitter.com) → Create Project + App
2. Go to **Keys and Tokens** tab
3. Generate all 4 keys — make sure your app has **Read and Write** permissions
4. Under **User Authentication Settings** → enable OAuth 1.0a

---

## Platform 4: Medium

**Goal:** Crosspost full blogs to Medium with canonical URL → free backlink to your portfolio.

| Secret Name | Value |
|---|---|
| `MEDIUM_INTEGRATION_TOKEN` | See steps below |

**Steps:**
1. Go to [medium.com](https://medium.com) → **Settings** → **Security and apps**
2. Scroll to **Integration Tokens** → Generate token
3. Copy the token → add as `MEDIUM_INTEGRATION_TOKEN`

> ✅ Easiest platform to set up — takes 2 minutes.

---

## Platform 5: Reddit

**Goal:** Share blogs to r/PPC, r/digital_marketing, r/marketing.

| Secret Name | Value |
|---|---|
| `REDDIT_CLIENT_ID` | App Client ID |
| `REDDIT_CLIENT_SECRET` | App Secret |
| `REDDIT_USERNAME` | Your Reddit username |
| `REDDIT_PASSWORD` | Your Reddit password |

**Steps:**
1. Go to [reddit.com/prefs/apps](https://www.reddit.com/prefs/apps)
2. Click **"Create App"** → Choose type **"script"**
3. Name: `TirtheshJainPortfolio`, Redirect URI: `http://localhost`
4. Copy `client_id` (under app name) and `secret`

> ⚠️ Reddit requires your account to be at least 30 days old and have some karma before link posts are allowed in some subreddits.

---

## Platform 6: Pinterest

**Goal:** Pin blog images to a Marketing board — great for long-tail traffic.

| Secret Name | Value |
|---|---|
| `PINTEREST_ACCESS_TOKEN` | See steps below |
| `PINTEREST_BOARD_ID` | Your board's ID |

**Steps:**
1. Go to [developers.pinterest.com](https://developers.pinterest.com) → Create App
2. Generate an **Access Token** with `boards:read`, `pins:read`, `pins:write` scopes
3. To get your Board ID: Go to your Pinterest board → the URL contains the board ID
   (e.g. `pinterest.com/tirtheshjain/digital-marketing-insights/` → board ID is in the API response)
   ```
   curl -H "Authorization: Bearer YOUR_TOKEN" https://api.pinterest.com/v5/boards
   ```

---

## Final Checklist

After adding all secrets, test it:

1. Go to **GitHub → Actions → "🤖 Daily AI Blog Auto-Publisher"**
2. Click **"Run workflow"** to manually trigger
3. Check logs — new blog should be committed with updated sitemap
4. Go to **Actions → "🌐 Off-Page SEO Auto-Distributor"**
5. Run with `dry_run = true` first to test social distribution
6. Then run again with `dry_run = false` for a real test

---

## How the Full Automation Flow Works (v3.0)

```
Every day at 12:00 AM UTC (5:30 AM IST):
  │
  ▼
🤖 ai-blog-generator.yml
  │
  ├─→ content-engine.js
  │     ├─ Picks unique topic (smart rotation, never repeats)
  │     ├─ Gemini writes 2500+ word SEO pillar article
  │     │    ├─ E-E-A-T signals injected
  │     │    ├─ AI Overview (AIO) optimization
  │     │    ├─ Internal links to last 5 posts
  │     │    ├─ FAQ schema targeting
  │     │    └─ 3 CTAs injected
  │     ├─ Auto-updates sitemap.xml
  │     └─ Skips if blog already exists (duplicate protection)
  │
  ├─→ Commits blog + sitemap to GitHub
  ├─→ Pings Google & Bing with updated sitemap
  │
  ▼ (triggers automatically)
🌐 off-page-seo.yml → social-engine.js
  │
  ├─→ LinkedIn post
  ├─→ Twitter/X tweet
  ├─→ Medium crosspost (with canonical backlink)
  ├─→ Dev.to crosspost (with canonical backlink)
  ├─→ Reddit (r/PPC, r/digital_marketing, r/marketing)
  └─→ Pinterest pin
  │
  ▼
📊 distribution-log.json updated → committed to GitHub
```

**Zero human action required after initial setup. DAILY content machine. 🚀**
