+ ot# XELA Website Personalization Research
## Every Method to Customize Visitor Experience — Legally and Ethically
*Compiled April 2026*

---

# PART 1: AUTOMATICALLY AVAILABLE (No Opt-In Needed)

These data points are revealed the instant someone loads the page. No cookies, no consent banner, no login required.

---

## 1. IP Address → Geolocation

### What Data Is Revealed
- **City and state** (e.g., "Tampa, Florida")
- **Country and region code** (ISO 3166-2)
- **Approximate latitude/longitude** (accurate to ~5-25 mile radius)
- **ISP / organization name** (can reveal if visitor is on a corporate network)
- **Timezone** (derived from location)
- IP addresses do NOT reveal street addresses, names, or exact locations

### What You Can Customize
- Show "Serving Tampa Bay businesses" to local visitors
- Display Florida-specific testimonials anr _ iportfolio pieces
- Show different pricing/currency for international visitors
- Highlight location-relevant services ("Hurricane season prep? Refresh your brand now")
- Auto-fill city/state in contact forms
- Show nearest competitors or local market data

### Legal/Privacy Considerations
- IP geolocation for content customization is **generally legal without consent** in most jurisdictions
- Under GDPR, IP addresses are considered personal data, but geolocation-based content customization falls under "legitimate interest" in most interpretations
- Do NOT store or log IP addresses without a privacy policy disclosure
- VPN users will see incorrect location — always provide a way to override
- Vercel provides this data via headers at no extra cost, so no third-party data sharing needed

### Implementation Approach
**Vercel Edge Middleware (recommended for XELA)**:
```
// middleware.ts at project root
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // Vercel auto-populates these headers:
  const country = request.headers.get('x-vercel-ip-country')      // "US"
  const region = request.headers.get('x-vercel-ip-country-region') // "FL"
  const city = request.headers.get('x-vercel-ip-city')             // "Tampa"
  const latitude = request.headers.get('x-vercel-ip-latitude')
  const longitude = request.headers.get('x-vercel-ip-longitude')

  // Pass to client via response headers or cookies
  const response = NextResponse.next()
  response.cookies.set('visitor-geo', JSON.stringify({ country, region, city }))
  return response
}
```

**For Vite/React (XELA's stack)**: Use a Vercel serverless function or edge function that reads geo headers and returns them to the client. Alternatively, use a free API like `ipapi.co` or `ip-api.com` (50K requests/month free).

### XELA Use Case
- Homepage hero says "Elite Branding for [Tampa Bay / South Florida / Florida] Businesses" based on geo
- If visitor is outside Florida: "Premium Branding — Delivered Nationwide, Crafted in Florida"
- Portfolio section auto-filters to show projects from the visitor's region first
- Contact page auto-fills state/city in the inquiry form

---

## 2. User-Agent → Device, Browser, OS

### What Data Is Revealed
- **Device type**: mobile phone, tablet, desktop, TV
- **Operating system**: Windows 11, macOS, iOS, Android, Linux
- **Browser**: Chrome, Safari, Firefox, Edge, etc.
- **Browser version**: exact version number
- **Device model** (on mobile): iPhone 16, Samsung Galaxy S25, etc.
- **Bot detection**: Googlebot, Bingbot, social media crawlers

### What You Can Customize
- Serve simplified layouts/animations on mobile
- Show "Download our mobile lookbook" to phone users vs. "Explore our full portfolio" on desktop
- Adjust CTA placement (tap-friendly on mobile, hover-rich on desktop)
- Serve WebP/AVIF images to supporting browsers, fallback for older
- Detect if visitor is a search engine crawler and serve SEO-optimized content
- Show Apple Pay buttons to iOS users, Google Pay to Android

### Legal/Privacy Considerations
- User-Agent string is **sent automatically by every browser** — reading it requires no consent
- It is considered "technical data" under most privacy frameworks
- Using it for layout adaptation is universally accepted
- Using it for fingerprinting (combining with other data to track users) enters gray area — see fingerprinting section below
- Chrome is reducing User-Agent granularity via "User-Agent Reduction" initiative — rely on `User-Agent Client Hints` for future-proofing

### Implementation Approach
**Client-side (simplest)**:
```javascript
// Basic device detection
const isMobile = /Mobi|Android/i.test(navigator.userAgent)
const isIOS = /iPhone|iPad|iPod/.test(navigator.userAgent)
const isBot = /bot|crawl|spider|slurp/i.test(navigator.userAgent)

// Modern approach: User-Agent Client Hints
if (navigator.userAgentData) {
  const platform = navigator.userAgentData.platform  // "macOS", "Windows", "Android"
  const mobile = navigator.userAgentData.mobile       // true/false
}
```

**CSS media queries (no JS needed)**:
```css
@media (max-width: 768px) { /* mobile styles */ }
@media (hover: hover) { /* device has hover capability (desktop) */ }
@media (pointer: coarse) { /* touch device */ }
```

### XELA Use Case
- Mobile visitors see a streamlined portfolio carousel with swipe gestures and a prominent "Tap to Call" button
- Desktop visitors get the full interactive grid with hover previews and detailed case studies
- iPad visitors see a special "Perfect for presentations — share this portfolio with your team" CTA
- Bot/crawler detection ensures the AI-generated content is served pre-rendered for SEO

---

## 3. Referral Source (HTTP Referer Header)

### What Data Is Revealed
- **The exact URL** the visitor came from (if not blocked)
- **The domain** at minimum (e.g., google.com, instagram.com, linkedin.com)
- **Search engine origin**: Google, Bing, DuckDuckGo
- **Social media origin**: Instagram, LinkedIn, Facebook, TikTok, X/Twitter
- **Other referring site**: Yelp, directories, blog mentions, partner sites
- **Direct traffic**: no referer (typed URL, bookmarked, or app link)
- Note: HTTPS→HTTPS preserves referer, HTTPS→HTTP does not. Some browsers/extensions strip it.

### What You Can Customize
- Show social proof relevant to the referral channel
- Match the messaging/tone of where they came from
- Show "Welcome from [Platform]" acknowledgment
- Display different CTAs based on likely intent
- Track which channels drive the most valuable traffic

### Legal/Privacy Considerations
- Reading the HTTP Referer header is **standard practice and requires no consent**
- It is sent automatically by browsers as part of the HTTP protocol
- Do not display the raw referer URL to the user (could leak private info)
- Some privacy-focused browsers (Brave, Firefox strict mode) truncate or remove referer headers
- GDPR considers this metadata, not PII — but combining it with other data could change that

### Implementation Approach
```javascript
// Client-side
const referrer = document.referrer  // "https://www.instagram.com/"

// Classify the source
function getReferralSource() {
  const ref = document.referrer.toLowerCase()
  if (!ref) return 'direct'
  if (ref.includes('google')) return 'google'
  if (ref.includes('instagram')) return 'instagram'
  if (ref.includes('linkedin')) return 'linkedin'
  if (ref.includes('facebook') || ref.includes('fb.com')) return 'facebook'
  if (ref.includes('tiktok')) return 'tiktok'
  if (ref.includes('yelp')) return 'yelp'
  return 'other'
}
```

**Server-side (Vercel Edge Middleware)**: Read the `Referer` request header before the page renders.

### XELA Use Case
- **From Instagram**: Show visual-first portfolio grid, emphasize social media branding packages, display Instagram-specific testimonials. CTA: "Get the feed aesthetic your brand deserves"
- **From LinkedIn**: Show professional/corporate branding work, emphasize brand strategy and consulting. CTA: "Elevate your professional presence"
- **From Google Search**: Show the most relevant service page based on search terms (via UTM), trust signals, and case studies
- **From Yelp**: Highlight reviews, ratings, local business focus. CTA: "See why Tampa businesses rate us 5 stars"
- **Direct traffic**: Likely a returning visitor or word-of-mouth referral — show "Welcome back" or "Glad someone sent you our way"

---

## 4. Time and Date (Client-Side)

### What Data Is Revealed
- **Local time of day** (morning, afternoon, evening, late night)
- **Day of week** (weekday vs. weekend)
- **Season/month** (can infer seasonal needs)
- **Timezone** (confirms location or reveals travel)
- **Holidays** (if you maintain a holiday calendar)
- All derived from JavaScript `Date` object using the visitor's system clock

### What You Can Customize
- Time-appropriate greetings ("Good morning" vs. "Working late?")
- Daypart-specific CTAs (business hours: "Call us now" / After hours: "Book a consultation")
- Weekend messaging (relaxed, inspiration-focused) vs. weekday (productivity, deadlines)
- Seasonal content rotation (Q1 fresh starts, summer refreshes, Q4 year-end rebrands)
- Holiday-themed touches without being heavy-handed

### Legal/Privacy Considerations
- **No privacy concerns** — this data comes from the visitor's own browser clock
- Not personal data under any framework
- No consent needed
- Time-based personalization is one of the safest methods available

### Implementation Approach
```javascript
function getTimeContext() {
  const now = new Date()
  const hour = now.getHours()
  const day = now.getDay()  // 0=Sun, 6=Sat
  const month = now.getMonth()

  return {
    greeting: hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening',
    isBusinessHours: hour >= 9 && hour < 18 && day > 0 && day < 6,
    isWeekend: day === 0 || day === 6,
    season: month < 3 || month === 11 ? 'winter' : month < 6 ? 'spring' : month < 9 ? 'summer' : 'fall'
  }
}
```

### XELA Use Case
- **Morning (6-11am)**: "Good morning — ready to build something great today?" Fresh, energetic portfolio showcase
- **Afternoon (12-5pm)**: "Let's make your brand unforgettable." Business-focused, deadline-oriented CTAs
- **Evening (6-10pm)**: "Dreaming up your next brand? We are too." Inspirational mood boards, lighter browsing experience
- **Late night (11pm-5am)**: "Still awake? So are we — creativity doesn't clock out." Show the most visually striking work
- **Weekend**: "Weekend inspiration — browse our latest work" with relaxed, gallery-style layout
- **Business hours**: Show "Call Now" button prominently. After hours: "Schedule a consultation"
- **January**: "New year, new brand — 2026 packages available" | **Hurricane season**: "Storm-proof your brand with digital-first assets"

---

## 5. Screen Resolution and Viewport

### What Data Is Revealed
- **Screen resolution**: total pixels (e.g., 2560x1440, 1920x1080)
- **Viewport size**: actual browser window dimensions
- **Device pixel ratio (DPR)**: 1x (standard), 2x (Retina), 3x (high-end mobile)
- **Orientation**: portrait vs. landscape
- This data infers device class: ultrawide monitor, laptop, tablet, phone

### What You Can Customize
- Serve appropriately sized images (1x, 2x, 3x for Retina)
- Adjust layout complexity based on real estate
- Show/hide elements based on viewport (e.g., hide sidebar on narrow screens)
- Serve higher-quality portfolio images to high-DPR screens
- Optimize animation complexity for device capability

### Legal/Privacy Considerations
- **No consent needed** — this is purely technical rendering data
- CSS media queries access this without JavaScript
- Part of standard responsive design, universally accepted
- Using it for fingerprinting (in combination with other data) requires consent

### Implementation Approach
```javascript
const screenWidth = window.screen.width
const screenHeight = window.screen.height
const viewportWidth = window.innerWidth
const dpr = window.devicePixelRatio  // 1, 2, 3

// Responsive image serving
<img srcset="portfolio-400.jpg 400w, portfolio-800.jpg 800w, portfolio-1600.jpg 1600w"
     sizes="(max-width: 600px) 400px, (max-width: 1200px) 800px, 1600px" />
```

### XELA Use Case
- Ultrawide monitors (>2560px): Show immersive full-bleed portfolio with large typography and cinematic layouts
- Standard desktop (1920px): Classic grid layout with hover interactions
- Laptop (1366px): Slightly compressed grid, sticky navigation
- Tablet (768-1024px): Two-column portfolio, touch-optimized
- Phone (<768px): Single-column, swipe navigation, compressed hero
- Retina displays: Serve 2x/3x images of portfolio work so branding materials look crisp

---

## 6. Browser Language (Accept-Language Header)

### What Data Is Revealed
- **Preferred language(s)** with priority weighting (e.g., `en-US,en;q=0.9,es;q=0.8`)
- **Language variants**: American English vs. British English vs. Australian English
- **Secondary languages**: indicates multilingual visitors
- Sent as an HTTP header with every request — also accessible via `navigator.language`

### What You Can Customize
- Serve content in the visitor's preferred language
- Adjust copy tone for regional English variants
- Show multilingual capabilities if the visitor speaks multiple languages
- Auto-detect Spanish speakers in Florida market

### Legal/Privacy Considerations
- **No consent needed** — this is a standard HTTP header the browser sends automatically
- Not considered PII
- Good practice to always allow manual language override
- Avoid assumptions about nationality based solely on language

### Implementation Approach
```javascript
// Client-side
const primaryLanguage = navigator.language       // "en-US"
const allLanguages = navigator.languages         // ["en-US", "es", "fr"]
const speaksSpanish = navigator.languages.some(l => l.startsWith('es'))

// Server-side: Read Accept-Language header
// In Vercel Edge Middleware:
const acceptLang = request.headers.get('accept-language')
```

### XELA Use Case
- Detect Spanish-speaking visitors (huge in Florida market) and show: "Tambien hablamos espanol — Paquetes de branding en tu idioma"
- For Haitian Creole speakers (significant in South Florida): acknowledge the language even if full translation isn't available
- Show "We create bilingual brand materials" to any visitor with multiple language preferences
- Adjust formality of copy based on language variant (British English visitors may respond better to more formal tone)

---

## 7. UTM Parameters (URL Query Strings)

### What Data Is Revealed
- **utm_source**: Where the traffic came from (google, instagram, newsletter)
- **utm_medium**: The marketing channel (cpc, social, email, organic)
- **utm_campaign**: Specific campaign name (spring-2026-launch, rebrand-sale)
- **utm_term**: Paid search keyword
- **utm_content**: Which specific ad/link was clicked (cta-button, banner-ad)
- These are set by YOU in your marketing links — they reveal what campaign brought the visitor

### What You Can Customize
- Match landing page headline to the ad/campaign that drove the click
- Show campaign-specific offers or messaging
- Track which campaigns convert and at what rate
- Dynamically swap testimonials, images, and CTAs to match campaign context
- Persist campaign context across the entire session

### Legal/Privacy Considerations
- **No consent needed** — these are URL parameters you control
- Not personal data (they describe the campaign, not the person)
- Do not put PII in UTM parameters (no email addresses or names)
- Store UTM data in session storage (not cookies) to avoid consent requirements
- UTM parameters are visible in the URL bar — keep them clean and professional

### Implementation Approach
```javascript
function getUTMParams() {
  const params = new URLSearchParams(window.location.search)
  return {
    source: params.get('utm_source'),
    medium: params.get('utm_medium'),
    campaign: params.get('utm_campaign'),
    term: params.get('utm_term'),
    content: params.get('utm_content')
  }
}

// Persist across page navigations
const utms = getUTMParams()
if (utms.source) sessionStorage.setItem('utm_data', JSON.stringify(utms))
```

**Dynamic content swap**:
```javascript
// If they came from a "logo-design" campaign, emphasize logo work
if (utms.campaign?.includes('logo')) {
  heroHeadline = "Logo Design That Commands Attention"
  portfolioFilter = 'logos'
}
```

### XELA Use Case
- **Google Ads for "logo design Tampa"**: Landing page shows logo portfolio first, headline: "Tampa's Most-Booked Logo Designer"
- **Instagram ad for branding packages**: Show the exact package featured in the ad, pre-selected
- **Email newsletter link**: "Welcome back — here's what's new since your last visit"
- **Partner referral link** (utm_source=partnername): "Referred by [Partner]? Here's your exclusive package pricing"
- **Campaign-specific**: `utm_campaign=spring-rebrand` triggers spring-themed visuals and "Fresh start" messaging

---

## 8. Connection Type (Network Information API)

### What Data Is Revealed
- **Connection type**: wifi, cellular, ethernet, bluetooth, none
- **Effective type**: 4g, 3g, 2g, slow-2g
- **Downlink speed**: estimated bandwidth in Mbps
- **Round-trip time (RTT)**: network latency estimate
- **Data saver mode**: whether the user has requested reduced data usage

### What You Can Customize
- Serve lower-resolution images and disable auto-playing videos on slow connections
- Skip heavy animations on cellular/slow connections
- Show a "lite" version of the portfolio on 2G/3G
- Preload resources aggressively on fast wifi connections
- Respect data saver preferences

### Legal/Privacy Considerations
- **No consent needed** — this is a browser API for performance optimization
- Limited browser support: Chrome and Chromium-based browsers only (no Safari, no Firefox)
- Considered a legitimate performance optimization, not tracking
- Part of the web platform's progressive enhancement model

### Implementation Approach
```javascript
function getConnectionInfo() {
  const conn = navigator.connection || navigator.mozConnection || navigator.webkitConnection
  if (!conn) return { supported: false }

  return {
    supported: true,
    type: conn.type,              // "wifi", "cellular"
    effectiveType: conn.effectiveType,  // "4g", "3g", "2g"
    downlink: conn.downlink,      // Mbps
    rtt: conn.rtt,                // milliseconds
    saveData: conn.saveData       // true/false
  }
}

// Adaptive content loading
const { effectiveType, saveData } = getConnectionInfo()
const loadHighRes = effectiveType === '4g' && !saveData
```

### XELA Use Case
- Fast connection (4G wifi): Full portfolio with high-res images, video backgrounds, smooth Framer Motion animations
- Slow connection (3G/cellular): Compressed thumbnails, static hero image, simplified animations
- Data saver mode: Text-focused layout, "Tap to load images" for portfolio
- This ensures the XELA site feels premium on fast connections without frustrating mobile users on the go

---

# PART 2: AVAILABLE WITH CONSENT OR INTERACTION

These require either a cookie consent banner, user interaction, or explicit opt-in.

---

## 9. Cookies → Returning Visitor Detection

### What Data Is Revealed (with consent)
- **New vs. returning visitor** (has this browser been here before?)
- **Visit count** (first time, second time, loyal visitor)
- **Last visit date** (days since last session)
- **Pages previously viewed** (what content interested them)
- **Previous selections** (which package they looked at, which portfolio category)
- **A/B test assignments** (consistent experience across visits)

### What You Can Customize
- Different hero content for new vs. returning visitors
- "Welcome back" messaging with context
- Resume where they left off
- Escalating offers (first visit: info, second visit: discount, third visit: urgency)
- Consistent A/B test experiences

### Legal/Privacy Considerations
- **Requires consent in EU/UK** (GDPR + ePrivacy Directive) for non-essential cookies
- **CCPA (California)**: Must disclose in privacy policy, provide opt-out for "sale" of data
- **Strictly necessary cookies** (session management, security) do NOT require consent
- **Personalization cookies** are classified as "functional" and DO require consent in GDPR jurisdictions
- Consent must be: freely given, specific, informed, unambiguous, via clear affirmative action (no pre-checked boxes)
- Must provide granular control: users can accept analytics but reject marketing cookies
- Cookie consent banner required before setting any non-essential cookies

### Implementation Approach
```javascript
// Simple returning visitor detection (requires consent for GDPR)
function trackVisitor() {
  const visits = parseInt(localStorage.getItem('xela_visit_count') || '0')
  const lastVisit = localStorage.getItem('xela_last_visit')

  localStorage.setItem('xela_visit_count', (visits + 1).toString())
  localStorage.setItem('xela_last_visit', new Date().toISOString())

  return {
    isReturning: visits > 0,
    visitCount: visits + 1,
    daysSinceLastVisit: lastVisit
      ? Math.floor((Date.now() - new Date(lastVisit).getTime()) / 86400000)
      : null
  }
}
```

**Cookie consent implementation**:
```javascript
// Only run personalization after consent
if (hasConsent('functional')) {
  const visitor = trackVisitor()
  applyPersonalization(visitor)
}
```

### XELA Use Case
- **First visit**: Full intro experience — who we are, what we do, featured work, trust signals
- **Second visit**: "Welcome back — pick up where you left off" with the last package they viewed
- **Third+ visit**: "Ready to get started?" with a direct CTA to book a consultation, plus a small incentive
- **Returning after 30+ days**: "It's been a while — check out what we've been creating" with new portfolio pieces
- **Previously viewed specific package**: Pre-highlight that package tier, show related add-ons

---

## 10. Local Storage → Persistent State

### What Data Is Revealed (with interaction)
- **Saved preferences** (dark mode, language choice, package tier interest)
- **Browsing history within the site** (which pages visited, in what order)
- **Form progress** (partially completed intake form)
- **Generated content** (if the AI branding tool produced results, store them)
- Up to 5-10MB of structured data, persists until manually cleared

### What You Can Customize
- Remember dark/light mode preference
- Save and restore AI-generated branding results
- Track which portfolio items they've already seen
- Store package comparison state
- Save partial form submissions to reduce friction

### Legal/Privacy Considerations
- Same rules as cookies under ePrivacy Directive — consent required for non-essential use
- Local storage is harder for users to manage than cookies (no built-in browser UI to view/clear per-site)
- More storage capacity than cookies but same legal obligations
- Consider local storage as "functionally equivalent to cookies" for compliance purposes
- MUST be cleared if user revokes consent

### Implementation Approach
```javascript
// Preference management
const prefs = {
  save(key, value) {
    if (!hasConsent('functional')) return
    localStorage.setItem(`xela_${key}`, JSON.stringify(value))
  },
  load(key) {
    const raw = localStorage.getItem(`xela_${key}`)
    return raw ? JSON.parse(raw) : null
  },
  clear() {
    Object.keys(localStorage)
      .filter(k => k.startsWith('xela_'))
      .forEach(k => localStorage.removeItem(k))
  }
}
```

### XELA Use Case
- Store the visitor's AI-generated brand preview so they can return to it later without re-running the Gemini API call
- Remember which branding packages they compared
- Save partial contact form data so they don't have to re-type if they navigate away
- Track portfolio pieces they've "liked" or saved to a favorites board
- Store their industry/business type selection to pre-filter relevant portfolio examples

---

## 11. Form Submissions → Explicit Data

### What Data Is Revealed
- Whatever the user explicitly provides: name, email, business name, industry, budget range, design preferences, project description, timeline, etc.

### What You Can Customize
- Fully personalized follow-up experience
- Tailored package recommendations based on budget and needs
- Portfolio filtered to their industry
- Custom AI-generated brand concepts using their business details
- Personalized email sequences

### Legal/Privacy Considerations
- **Explicit consent** is built into the form submission action
- Must have a privacy policy explaining data use
- Must provide data deletion capability (GDPR "right to be forgotten")
- Must not use data beyond stated purpose
- Double opt-in recommended for email marketing

### XELA Use Case
- After submitting the inquiry form, the site transforms into a personalized dashboard: "Welcome, [Business Name] — here's what we'd recommend for your [Industry] brand"
- Show portfolio pieces from similar industries
- Pre-configure the AI branding generator with their submitted preferences
- Generate a custom mood board based on their aesthetic preferences

---

## 12. Login / Authentication → Full Profile

### What Data Is Revealed
- Complete profile: name, email, company, subscription tier, purchase history
- All previous interactions, projects, and communications
- Saved brand assets, generated materials, invoices

### What You Can Customize
- Complete personalized dashboard
- Project management interface
- Re-download previous deliverables
- Suggest upsells based on purchase history
- Anniversary/milestone celebrations

### Legal/Privacy Considerations
- Governed by your Terms of Service and Privacy Policy
- Must comply with data protection laws for all stored personal data
- Provide data export and deletion capabilities
- Secure storage with encryption

### XELA Use Case
- Client portal: "Welcome back, [Name] — Your Starter Package is 60% complete"
- Show project timeline, pending deliverables, revision status
- "Your brand has been live for 6 months — ready for an Elite upgrade?"
- Quick re-order of business cards, social templates, etc.

---

# PART 3: AVAILABLE VIA THIRD-PARTY APIs

These require an API call using data from Part 1 (usually geo coordinates from IP).

---

## 13. Weather API → Local Conditions

### What Data Is Revealed (via API call using visitor's approximate location)
- **Current temperature and conditions** (sunny, raining, hurricane warning)
- **Forecast** (upcoming weather events)
- **Humidity, wind, UV index**
- **Severe weather alerts**
- **Sunrise/sunset times** (for light/dark theming)

### What You Can Customize
- Weather-responsive imagery and messaging
- Seasonal urgency ("Storm season approaching — is your brand digital-ready?")
- Mood-matching visuals (warm tones on cold days, cool tones on hot days)
- Emergency-relevant messaging during severe weather

### Legal/Privacy Considerations
- Weather APIs receive approximate coordinates, not visitor identity
- **No consent needed** if you're using already-available geo data (from IP)
- OpenWeatherMap free tier: 1,000 calls/day — sufficient for most sites
- Cache aggressively (weather doesn't change every page load)
- Do not share visitor coordinates with weather API beyond what's needed

### Implementation Approach
```javascript
// Server-side (protect API key)
async function getWeather(lat, lon) {
  const API_KEY = process.env.OPENWEATHER_KEY
  const res = await fetch(
    `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=imperial`
  )
  return res.json()
  // Cache result for 30 minutes per location
}
```

### XELA Use Case
- **Sunny day in Tampa (90°F)**: Bright, warm visuals. "Your brand should shine as bright as today's Florida sun"
- **Rainy day**: Moodier palette, cozy messaging. "Perfect day to plan your next brand evolution"
- **Hurricane warning**: Swap hero entirely. "Stay safe, Tampa. When you're ready, we'll be here to help rebuild your brand presence." (Empathy-first, no selling during emergencies)
- **Winter in the Northeast**: "Escape to Florida creativity — premium branding from the Sunshine State"
- **General cold weather**: Show warm color palettes, cozy brand aesthetics

---

## 14. Local Events API → What's Happening Nearby

### What Data Is Revealed (via API call)
- Local events, conferences, business expos
- Industry-specific events in the visitor's area
- Holiday-specific happenings
- Sports events, cultural events

### What You Can Customize
- Reference relevant local events for timeliness
- Offer event-specific branding packages
- Show "Attending [Conference]? Let's meet" messaging

### Legal/Privacy Considerations
- Same as weather — using geo data you already have
- Event data is public information
- No consent needed for the API call itself

### Implementation Approach
Use APIs like Eventbrite, PredictHQ, or local chamber of commerce feeds. Cache heavily — events don't change minute to minute.

### XELA Use Case
- Detect visitor near a business expo: "Getting ready for [Tampa Bay Business Expo]? Stand out with a fresh brand package"
- Local festival season: Show event-themed branding examples
- Conference season: "Need pitch decks, booth graphics, and leave-behinds? We've got you"

---

## 15. Business/Company Detection (Reverse IP Lookup)

### What Data Is Revealed (via third-party API)
- **Company name** (if visiting from a corporate IP)
- **Company size** (employee count range)
- **Industry** (SIC/NAICS code)
- **Annual revenue** (estimate)
- **Technology stack** (what tools they use)

### What You Can Customize
- Show industry-relevant portfolio pieces
- Adjust pricing/package emphasis based on company size
- Reference their industry in copy

### Legal/Privacy Considerations
- **GDPR-compliant for company-level data** (not personal data — it identifies the organization, not the individual)
- Tools: Clearbit Reveal, 6sense, Leadfeeder, Dealfront
- Most offer free tiers with limited lookups
- Person-level identification (matching to a specific employee) requires consent and is restricted outside the US
- B2B-focused — not useful for individual consumers

### Implementation Approach
```javascript
// Server-side reverse IP lookup
async function identifyCompany(ip) {
  const res = await fetch(`https://api.clearbit.com/v1/reveal?ip=${ip}`, {
    headers: { Authorization: `Bearer ${CLEARBIT_KEY}` }
  })
  const data = await res.json()
  return {
    company: data.company?.name,
    industry: data.company?.category?.industry,
    employees: data.company?.metrics?.employees,
  }
}
```

### XELA Use Case
- Visitor from a law firm's IP: Show legal industry branding examples, professional/conservative aesthetics
- Visitor from a tech startup IP: Show modern, dynamic branding work, emphasize digital-first packages
- Visitor from a large enterprise: Emphasize Elite tier and enterprise-level branding
- Visitor from a marketing agency: "Looking for a creative partner? Let's collaborate" (white-label messaging)

---

# PART 4: COMBINING DATA SOURCES — THE PERSONALIZATION STACK

The real power comes from combining multiple signals. Here's how they layer for XELA:

## Tier 1: Zero-Config (Works Immediately)
| Signal | Source | Consent? |
|--------|--------|----------|
| City/State | Vercel geo headers | No |
| Device type | User-Agent + viewport | No |
| Time of day | JavaScript Date | No |
| Referral source | document.referrer | No |
| Browser language | navigator.language | No |
| UTM parameters | URL query string | No |

## Tier 2: Consent Required
| Signal | Source | Consent? |
|--------|--------|----------|
| Returning visitor | Cookie/localStorage | Yes (EU) |
| Visit history | localStorage | Yes (EU) |
| Preferences | Cookie | Yes (EU) |

## Tier 3: API-Enhanced
| Signal | Source | Consent? |
|--------|--------|----------|
| Weather | OpenWeatherMap API | No (uses geo from Tier 1) |
| Company info | Clearbit/similar | No (company-level) |
| Local events | Eventbrite/PredictHQ | No (uses geo from Tier 1) |

## Combined Personalization Example

**Visitor profile**: Mobile, from Instagram, Tampa, 8pm, speaks English + Spanish, rainy evening, returning visitor (3rd visit), previously viewed Starter Package.

**Personalized experience**:
- Hero: "Good evening — still thinking about that Starter Package?" (time + returning visitor + history)
- Layout: Mobile-optimized, swipe-friendly (device)
- Imagery: Cozy, warm tones matching the rainy evening (weather + time)
- Language: Subtle Spanish CTA option available (language detection)
- Social proof: Instagram-specific testimonials (referral source)
- CTA: "You've been here 3 times — let's make it happen. Book a free consultation" (visit count)
- Offer: "Save 10% when you book this week" (returning visitor escalation)

---

# PART 5: IMPLEMENTATION PRIORITY FOR XELA

## Phase 1 — Ship This Week (Zero Config, High Impact)
1. **Time-based greeting** in hero section
2. **Device-adaptive layout** (already doing responsive, enhance with content changes)
3. **UTM parameter handling** for ad campaigns
4. **Referral source detection** with channel-specific messaging

## Phase 2 — Ship Next Week (Needs Vercel Config)
5. **Vercel geo headers** for Florida-local messaging
6. **Browser language detection** for Spanish-speaking visitors
7. **Cookie consent banner** (required before Phase 3)

## Phase 3 — Ship This Month (Needs Consent Infrastructure)
8. **Returning visitor detection** with progressive messaging
9. **Visit history tracking** for personalized portfolios
10. **AI-generated brand preview persistence** via localStorage

## Phase 4 — Future Enhancement (API Integration)
11. **Weather-based imagery** via OpenWeatherMap
12. **Company detection** via Clearbit or similar
13. **Local event awareness** for timely messaging

---

# PART 6: LEGAL COMPLIANCE CHECKLIST

## Required for All Personalization
- [ ] Privacy policy that discloses all data collection and use
- [ ] Cookie policy if using any cookies or localStorage
- [ ] SSL/HTTPS on all pages (already handled by Vercel)

## Required for EU/UK Visitors (GDPR)
- [ ] Cookie consent banner with granular controls (necessary, functional, analytics, marketing)
- [ ] No non-essential cookies before consent
- [ ] Ability to withdraw consent
- [ ] Data processing records
- [ ] Data deletion capability ("right to be forgotten")
- [ ] No pre-checked consent boxes

## Required for California Visitors (CCPA/CPRA)
- [ ] "Do Not Sell or Share My Personal Information" link
- [ ] Privacy policy with California-specific disclosures
- [ ] Opt-out mechanism for cross-context behavioral advertising
- [ ] Annual privacy policy updates

## Best Practices (All Visitors)
- [ ] Always provide manual override for auto-detected settings (language, location)
- [ ] Degrade gracefully when data is unavailable (VPN users, privacy browsers)
- [ ] Never make the site feel "creepy" — personalize helpfully, not invasively
- [ ] Log what you customize and why (for debugging and compliance audits)
- [ ] Test with privacy-focused browsers (Brave, Firefox strict mode)

---

# WHAT NOT TO DO

## Browser Fingerprinting for Tracking
Combining canvas fingerprint + WebGL + audio context + installed fonts + timezone + screen resolution to create a unique visitor ID. This is **legally risky** (consent required under GDPR, CCPA considers it behavioral advertising data), **ethically questionable** (users can't easily opt out), and **technically fragile** (browsers are actively fighting it). Use cookies with consent instead.

## Third-Party Tracking Pixels
Facebook Pixel, Google Analytics with advertising features, etc. These share visitor data with third parties. If you use them, they require explicit consent and privacy policy disclosures. Prefer privacy-respecting alternatives like Plausible or Fathom Analytics.

## Dark Patterns
- Don't make the "Accept All Cookies" button bigger/brighter than "Reject"
- Don't hide the decline option behind multiple clicks
- Don't wall content behind cookie consent (EU regulators have fined for this)
- Don't track users who explicitly opted out

---

*This research covers every mainstream, legal, and ethical method for website personalization as of April 2026. Methods are ordered by privacy-friendliness and implementation simplicity. All Tier 1 methods can be implemented on the XELA Vite/React/Vercel stack without any additional packages or services.*

---

## Sources

- [Emarsys — Website Personalization Strategies 2026](https://emarsys.com/learn/blog/website-personalization-guide-strategies/)
- [Adobe — Anonymous Visitor Web Personalization](https://experienceleague.adobe.com/en/docs/blueprints-learn/architecture/use-case-patterns/personalization-patterns/anonymous-visitor-web-personalization)
- [Data-Mania — Website Visitor Identification 2026](https://www.data-mania.com/blog/website-visitor-identification-2026-what-works-hype-best-tools/)
- [VWO — Real-Time Website Personalization Guide 2026](https://vwo.com/blog/real-time-personalization/)
- [IPinfo — IP-Based Website Customization](https://ipinfo.io/use-cases/ip-based-website-customization)
- [Cloudflare — IP Geolocation](https://developers.cloudflare.com/network/ip-geolocation/)
- [CHEQ — Browser Fingerprinting and GDPR](https://cheq.ai/blog/what-is-browser-fingerprinting/)
- [TermsFeed — Legal Requirements for Device Fingerprinting](https://www.termsfeed.com/blog/legal-requirements-device-fingerprinting/)
- [Fingerprint.com — Browser Fingerprinting Techniques](https://fingerprint.com/blog/browser-fingerprinting-techniques/)
- [DiCloak — Device Fingerprinting 2026 Guide](https://dicloak.com/blog-detail/understanding-device-fingerprinting-your-complete-2026-guide-to-online-privacy)
- [ConversionWax — UTM-Based Personalization](https://www.conversionwax.com/solutions-utm-personalization/)
- [If-So — Personalize Content Using UTM Parameters](https://www.if-so.com/help/documentation/utms/)
- [If-So — Referral Source Personalization](https://www.if-so.com/help/documentation/referrer/)
- [Netlify — Personalize Based on Referral](https://www.netlify.com/blog/personalize-static-site-based-on-previous-site-referral/)
- [ABmatic — Mobile vs Desktop Personalization](https://abmatic.ai/blog/personalization-for-mobile-vs.-desktop-websites-strategies-and-best-practices)
- [Martech Zone — Content Device Optimization](https://martech.zone/device-content-optimization/)
- [Spin Sucks — Weather-Based Personalization](https://spinsucks.com/marketing/weather-based-personalization/)
- [OpenWeatherMap API](https://openweathermap.org/api)
- [DynamicYield — Weather-Based Personalization](https://www.dynamicyield.com/examples/tag/weather-based-personalization/)
- [w3collective — Repeat Visitor Cookie Detection](https://w3collective.com/repeat-visitor-cookie-message/)
- [Fingerprint.com — Personalization for Anonymous Users](https://fingerprint.com/blog/providing-personalization-to-anonymous-users/)
- [Vercel — Geo IP Headers](https://vercel.com/kb/guide/geo-ip-headers-geolocation-vercel-functions)
- [Vercel — Edge Middleware Personalization](https://vercel.com/resources/edge-middleware-experiments-personalization-performance)
- [Vercel — Routing Middleware API](https://vercel.com/docs/routing-middleware/api)
- [Cookiebot — GDPR Cookie Consent](https://www.cookiebot.com/en/gdpr-cookies/)
- [GDPR.eu — Cookies and the GDPR](https://gdpr.eu/cookies/)
- [Usercentrics — GDPR and Cookies 2026](https://usercentrics.com/knowledge-hub/gdpr-cookies/)
- [MDN — Network Information API](https://developer.mozilla.org/en-US/docs/Web/API/Network_Information_API)
- [MDN — Accept-Language Header](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Accept-Language)
- [Clearbit — Data-Driven Website Personalization](https://clearbit.com/resources/books/data-driven-marketing/website-personalization)
- [HubSpot — Website Personalization Examples](https://blog.hubspot.com/website/website-personalization-examples-dynamic)
