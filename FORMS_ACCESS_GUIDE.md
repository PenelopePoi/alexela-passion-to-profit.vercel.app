# XELA Creative Branding Studio — Forms Access Guide

**Last updated:** 2026-04-09
**Live site:** https://xela-elite-ai-creative-studio.vercel.app

---

## Every Way a Client Can Submit an Intake

The XELA site has **6 different intake paths**. Each collects the same core data but offers a different experience. All submissions email `xelastudios@gmail.com` via formsubmit.co and log to localStorage for the SubmissionsInbox dashboard.

### 1. Consultation Wizard (primary path)
- **URL:** https://xela-elite-ai-creative-studio.vercel.app/?view=consult
- **Format:** 8-step guided wizard with brand personality profiling
- **Features:** localStorage auto-save, animated pricing, downloadable brand profile, confetti on completion
- **Best for:** Clients who want a premium, guided experience
- **Text to client:** "Here's a quick 3-minute brand quiz → [link]"

### 2. AI Chat Intake
- **URL:** https://xela-elite-ai-creative-studio.vercel.app/?view=chat
- **Format:** Conversational, one question at a time, with live "Brand Brief" sidebar
- **Features:** Smart parsing (extracts multiple fields from one response), friendly tone
- **Best for:** Clients who prefer chatting over forms
- **Text to client:** "Chat with our AI brand consultant → [link]"

### 3. Intake Shuffler (20 variants)
- **URL:** https://xela-elite-ai-creative-studio.vercel.app/?view=shuffle
- **Format:** Randomly picks 1 of 20 intake styles per visit, with like/dislike learning
- **Features:** Pattern detection, adaptive to user preferences, never repeats disliked variants
- **Best for:** Curious clients who want variety / UX testing
- **Text to client:** "Try our surprise intake experience → [link]"

### 4. Standalone HTML Form (email-only, no login)
- **URL:** https://xela-elite-ai-creative-studio.vercel.app/intake.html
- **Format:** Pure HTML, 6 sections, works with JavaScript disabled
- **Features:** Mobile-first, no framework, always works
- **Best for:** Clients on slow connections, old devices, or who click directly from email
- **Text to client:** "Fill out our intake form → [link]" (simplest, most reliable)

### 5. Classic Input Form
- **URL:** https://xela-elite-ai-creative-studio.vercel.app (scroll to intake) or package selection → intake
- **Format:** 5-step form with AI-powered name generation and logo suggestions
- **Features:** Uses Gemini for business name/motto generation, vibe chips, auto-populated industries
- **Best for:** Clients who know what they want and need a fast path
- **Text to client:** Use the wizard instead — this is accessed via the package selection flow

### 6. Voice Intake (Live Assistant)
- **URL:** Available via the floating Live Assistant button on every page
- **Format:** Two-way voice conversation with Gemini
- **Features:** No typing required, natural speech recognition
- **Best for:** Hands-free intake, accessibility, phone-style interaction

---

## A/B/C/D Testing Variants

The site auto-assigns a variant to each visitor. To manually show a specific variant, append `?v=a|b|c|d`:

| Variant | URL Parameter | Hook |
|---|---|---|
| **A** — Urgency + Scripture (default) | `?v=a` | "From Pain to Purpose" |
| **B** — Bold + Chat-First | `?v=b` | "Your Brand, Ready Today" |
| **C** — Transparent Pricing | `?v=c` | "$75 to $2,000" |
| **D** — Local + Minimal | `?v=d` | "Florida's Creative Studio" |

Append `&debug=true` to show the variant switcher overlay.

**Example:** https://xela-elite-ai-creative-studio.vercel.app/?v=b&debug=true

---

## How the Sister Sees Submissions

All submissions flow into 3 places:

1. **Email inbox** (`xelastudios@gmail.com`)
   - Subject: `🚨 NEW LEAD · [Company] · [Tier] · ACTION NEEDED`
   - Includes all intake data + auto-generated action items
   - Arrives within seconds of submission

2. **SubmissionsInbox Dashboard**
   - Access: The main dashboard has an "Inbox" tab
   - Shows: Today's new leads, status filters, click-to-call, click-to-email, bulk export
   - Stored in: browser localStorage (capped at 500 records)

3. **Client CRM** (existing, pre-wired)
   - Access: Dashboard → Clients tab
   - Shows: Pipeline stages, deal values, activity log
   - Backed by: Firebase Firestore

---

## Sharing Forms via Text Message

Copy these short messages to send via SMS or WhatsApp:

### For warm leads:
```
Hey! Here's that quick intake — takes 3 minutes:
https://xela-elite-ai-creative-studio.vercel.app/?view=consult
```

### For curious browsers:
```
Chat with our AI brand consultant (free):
https://xela-elite-ai-creative-studio.vercel.app/?view=chat
```

### For the simplest path:
```
Fill out our form — no login needed:
https://xela-elite-ai-creative-studio.vercel.app/intake.html
```

### For a phone consultation:
```
Call us: (321) 375-9685
Or book online: https://xela-elite-ai-creative-studio.vercel.app/book.html
```

---

## Generating PDF Versions

The site doesn't currently have a standalone PDF form, but you can:

1. **Print the standalone form** — Visit `/intake.html` and use browser print → save as PDF
2. **Download the Brand Profile** — Completed consultations generate a downloadable `.txt` brand profile
3. **Export submissions** — The SubmissionsInbox dashboard has an "Export" button that downloads all leads as JSON

For a true fillable PDF, that would require adding a PDF generation library like `jsPDF` or `react-pdf`. This is a potential future upgrade.

---

## WhatsApp / SMS Intake Integration

**Current status:** Not wired up. Would require:

1. **WhatsApp Business API account** (Meta Business verification, ~2 weeks)
2. **Twilio account** for SMS routing ($0.0075 per message)
3. **Webhook endpoint** hosted somewhere (Vercel Functions work)
4. **Gemini/Claude API** for the conversational AI layer

**Recommended simpler path:**
- Use **Twilio Studio** with a no-code flow builder
- Connect to a Vercel serverless function that calls `logSubmission()`
- WhatsApp requires the Meta Business verification which takes time

**I can build the Vercel function + flow config** if you confirm you want to pursue this. It's about 2 hours of setup once credentials are in place.

---

## Google Drive Backup

**Current status:** Not wired up. Submissions are stored in:
- Browser localStorage (client-side)
- formsubmit.co email archive
- Firebase Firestore (for CRM records)

**To sync to Google Drive:**

Option 1: **Manual export + upload** (simplest)
- Weekly: Click "Export" in SubmissionsInbox → downloads JSON
- Drag the JSON file to Google Drive

Option 2: **Automated via Google Drive API**
- Requires OAuth setup with Google Cloud
- Requires a Vercel serverless function to handle the upload
- Can run on a cron schedule

I have Gmail MCP access in this session but NOT Drive MCP, so I can't directly upload files. **If you want automated Drive sync, that's a separate build.**

---

## Video Upgrade with Veo 3.1 (planned)

**Status:** Not yet implemented. Would upgrade static hero images and portfolio cards to AI-generated video loops.

**Requirements:**
- Google Veo 3.1 API access
- Billing setup (Veo is pay-per-generation)
- Storage for generated videos (Firebase Storage works)

**Recommended first videos:**
1. Hero background — abstract brand transformation loop
2. Process animation — "3 steps to revenue" visualized
3. Portfolio card videos — before/after transformations

**I can wire this up** when you're ready to fund the Veo API calls. The skill `/veo-tiers` in your library has the full implementation plan.

---

## Summary Table

| Feature | Status | Access |
|---|---|---|
| Consultation Wizard | LIVE | `/?view=consult` |
| AI Chat Intake | LIVE | `/?view=chat` |
| Intake Shuffler | LIVE | `/?view=shuffle` |
| Standalone HTML | LIVE | `/intake.html` |
| Classic Input Form | LIVE | Via package selection |
| Voice Assistant | LIVE | Floating button |
| A/B/C/D Variants | LIVE | `?v=a\|b\|c\|d` |
| Sales Pitch Assistant | LIVE | Floating button (once wired) |
| Email to Sister | LIVE | `xelastudios@gmail.com` |
| SubmissionsInbox | LIVE | Dashboard tab |
| CRM Auto-populate | Pending Wave 3 | Dashboard → Clients |
| PDF forms | Partial | Browser print-to-PDF |
| WhatsApp intake | Not wired | Needs Meta/Twilio setup |
| Google Drive sync | Not wired | Needs Drive API setup |
| Veo 3.1 videos | Not wired | Needs Veo API credentials |
