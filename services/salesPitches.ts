/**
 * XELA Creative Branding Studio — Sales Pitch Library
 *
 * 50 pre-written, conversational responses to the most common
 * client questions and objections. Designed to build trust and
 * deliver real value, not push.
 *
 * Voice: warm, honest, Florida studio energy, Florida heart, Col 3:23.
 */

export type PitchCategory =
  | 'pricing-concern'
  | 'quality-doubt'
  | 'timeline-worry'
  | 'credibility-check'
  | 'comparison'
  | 'trust-building'
  | 'value-delivery'
  | 'technical-question'
  | 'post-purchase'
  | 'objection-handling';

export interface SalesPitch {
  id: string;
  category: PitchCategory;
  triggerQuestions: string[]; // Keywords/phrases that trigger this pitch
  pitch: string; // The actual response (2-4 sentences, conversational, warm)
  followUp?: string; // Optional follow-up question to keep conversation going
  tier?: 'budget' | 'premium' | 'elite'; // Suggested package
}

export const SALES_PITCHES: SalesPitch[] = [
  // ────────────────────────────────────────────────────────────────
  // PRICING CONCERNS (8)
  // ────────────────────────────────────────────────────────────────
  {
    id: 'price-too-expensive',
    category: 'pricing-concern',
    triggerQuestions: ['too expensive', 'costs too much', 'pricey', 'out of budget', 'cant afford'],
    pitch:
      "I hear you, and the honest truth is a brand isn't a cost line, it's the first thing people decide to trust before they ever talk to you. Most of our clients earn back their package within their first two or three new customers. We built tiers from $97 up so nobody gets priced out of looking legit.",
    followUp: "What's the smallest investment that would feel safe to start with?",
    tier: 'budget',
  },
  {
    id: 'price-discount',
    category: 'pricing-concern',
    triggerQuestions: ['discount', 'lower price', 'deal', 'coupon', 'promo code'],
    pitch:
      "I won't play games with you on this — our prices are already cut deep because we run AI plus a focused Florida studio instead of a 12-person agency. What I can do is help you pick the tier that actually matches what you need today, so you're not paying for things you won't use yet.",
    followUp: 'Want me to walk you through which tier fits your stage?',
  },
  {
    id: 'price-why-cheap',
    category: 'pricing-concern',
    triggerQuestions: ['why so cheap', 'too cheap', 'how is it that low', 'whats the catch'],
    pitch:
      "Fair question, and the answer is structural: we use AI to do the heavy lifting on iterations, then Alex (the founder) reviews every single piece before it ships. No agency overhead, no junior designers learning on your dime. You get professional output without paying for a fancy office in Manhattan.",
    followUp: 'Want to see a few examples from the same price tier you are looking at?',
  },
  {
    id: 'price-budget-tier',
    category: 'pricing-concern',
    triggerQuestions: ['only afford budget', 'cheapest option', 'starter', '$97', 'lowest tier'],
    pitch:
      "The $97 starter is no joke — you get a real logo, color palette, and brand basics, fully yours to keep. A lot of our best clients started right there and grew into bigger packages once their first customers came in. We treat every tier like it matters, because it does.",
    followUp: 'Want me to show you exactly what comes in the $97 package?',
    tier: 'budget',
  },
  {
    id: 'price-payment-plan',
    category: 'pricing-concern',
    triggerQuestions: ['payment plan', 'installment', 'split payment', 'pay over time', 'financing'],
    pitch:
      "Yes — we run installments through Stripe on anything $350 and above, usually 2 or 3 payments with no interest. It's set up so cash flow isn't the thing standing between you and a brand you're proud of. Just pick the package and we'll send the link.",
    followUp: 'Which package were you eyeing so I can pull the right plan?',
  },
  {
    id: 'price-hidden-catch',
    category: 'pricing-concern',
    triggerQuestions: ['hidden catch', 'fine print', 'gotcha', 'extra fees', 'upsell'],
    pitch:
      "No catch, and I'd rather lose a sale than pretend otherwise. The price you see is the full price — files, revisions, delivery, all included. The only time you'd pay more is if you came back later for a totally new project, and even then existing clients get priority pricing.",
    followUp: 'Anything specific you wanted me to clarify in writing first?',
  },
  {
    id: 'price-many-tiers',
    category: 'pricing-concern',
    triggerQuestions: ['so many tiers', 'why different packages', 'confusing pricing', 'too many options'],
    pitch:
      "Because a food truck and a law firm need different things, and pretending one package fits both is how people end up overpaying. Each tier exists because a real client asked for that exact bundle. If you tell me a little about your business, I can usually point you to the right one in under a minute.",
    followUp: 'What kind of business are you building?',
  },
  {
    id: 'price-pay-after',
    category: 'pricing-concern',
    triggerQuestions: ['pay after', 'see it first', 'preview before paying', 'try before buy'],
    pitch:
      "We do a 50% deposit to start and 50% on delivery — that way you've seen real concepts before the second half clears. It protects both of us: you're not paying full price sight unseen, and we're not building something for free that walks away. Fair trade.",
    followUp: 'Want me to send the deposit link so we can get started today?',
  },

  // ────────────────────────────────────────────────────────────────
  // QUALITY DOUBTS (6)
  // ────────────────────────────────────────────────────────────────
  {
    id: 'quality-look-good',
    category: 'quality-doubt',
    triggerQuestions: ['look good', 'will it be nice', 'design quality', 'how good'],
    pitch:
      "Best way to answer that is to show you — our portfolio page has every package tier with real client work, no stock mockups. And if anything ever doesn't feel right, we revise until it does. Above $350 the revisions are unlimited, so the only way you end up unhappy is if you stop talking to us.",
    followUp: 'Want me to drop a link to a few portfolio pieces in your industry?',
  },
  {
    id: 'quality-dont-like',
    category: 'quality-doubt',
    triggerQuestions: ['dont like it', 'what if i hate', 'not satisfied', 'unhappy'],
    pitch:
      "Then we keep working until you do. On any package $350 and up the revisions are unlimited, and even on the starter you get 2 free rounds. We'd rather spend an extra hour getting it right than ship something you have to apologize for.",
    followUp: 'What does \"right\" look like for you when you picture the final brand?',
  },
  {
    id: 'quality-ai-lower',
    category: 'quality-doubt',
    triggerQuestions: ['ai lower quality', 'ai generated', 'just ai', 'machine made', 'soulless'],
    pitch:
      "AI is the brush, not the artist. We use it to explore 200 directions in the time it would take an agency to draw 5, then Alex personally hand-picks, refines, and finishes everything. Nothing leaves the studio without human eyes on it.",
    followUp: 'Want me to walk you through our actual production flow?',
  },
  {
    id: 'quality-match-style',
    category: 'quality-doubt',
    triggerQuestions: ['match my style', 'specific look', 'have a vision', 'already have inspiration'],
    pitch:
      "Yes — bring us references, mood boards, even napkin sketches. Our intake wizard literally has a step for uploading inspiration so we can lock onto your vision before generating anything. The more you give us, the closer the first draft lands.",
    followUp: 'Got a Pinterest board or screenshots you can share?',
  },
  {
    id: 'quality-revisions',
    category: 'quality-doubt',
    triggerQuestions: ['how many revisions', 'rounds of edits', 'changes allowed'],
    pitch:
      "Starter package gets 2 rounds, and everything $350 and above is unlimited revisions until you sign off. We don't count emails or charge per tweak — that's small thinking and we hate it.",
    followUp: 'Which package are you considering so I can confirm the exact terms?',
  },
  {
    id: 'quality-generic',
    category: 'quality-doubt',
    triggerQuestions: ['look generic', 'cookie cutter', 'template', 'same as everyone'],
    pitch:
      "The reason brands look generic is when the studio skips the discovery part. Our intake spends real time on your story, your customer, the feeling you want people to have — then the visuals build from that. Generic happens when nobody asked the right questions, and that's the part we don't skip.",
    followUp: "What's one feeling you want a customer to have the first time they see your brand?",
  },

  // ────────────────────────────────────────────────────────────────
  // TIMELINE WORRIES (5)
  // ────────────────────────────────────────────────────────────────
  {
    id: 'timeline-same-day',
    category: 'timeline-worry',
    triggerQuestions: ['same day', 'same-day delivery', 'really that fast', 'how is it so quick'],
    pitch:
      "Yes, really — for the starter package, same-day delivery is standard because the AI does the iteration work in minutes instead of days. Alex reviews, polishes, and ships it the same business day if you order before 2pm Eastern. Bigger packages take 24 to 48 hours because there's more to do right.",
    followUp: 'When do you need it in your hands?',
  },
  {
    id: 'timeline-changes-after',
    category: 'timeline-worry',
    triggerQuestions: ['changes after delivery', 'edit later', 'update down the road'],
    pitch:
      "Elite tier comes with lifetime revisions — you can come back a year later and ask for tweaks. Other tiers, we keep your brand files stored so updates are quick and existing clients always get priority pricing on follow-ups.",
    followUp: 'Are you thinking long-term or just need the launch right now?',
  },
  {
    id: 'timeline-full-launch',
    category: 'timeline-worry',
    triggerQuestions: ['full launch', 'how long total', 'complete brand', 'whole package time'],
    pitch:
      "Most full brand packages land in 24 to 48 hours from when we have your intake info. We've done same-day rushes for events, and we've done slower, more thoughtful builds when a client wanted to sit with concepts. You set the pace.",
    followUp: "What's driving the timeline on your end?",
  },
  {
    id: 'timeline-event-3-days',
    category: 'timeline-worry',
    triggerQuestions: ['3 days', 'event coming up', 'urgent deadline', 'rush', 'asap'],
    pitch:
      "Three days is comfortable for us — even our biggest packages can ship inside 48 hours when we know there's a hard deadline. Just flag the date in the intake and we'll prioritize it. We've shipped grand-opening branding the morning of the ribbon cutting.",
    followUp: "What's the event and what's the absolute latest you can receive files?",
  },
  {
    id: 'timeline-weekends',
    category: 'timeline-worry',
    triggerQuestions: ['weekends', 'saturday', 'sunday', 'after hours'],
    pitch:
      "We work weekends for urgent jobs — being a small Florida studio means we can move fast to cover what's needed without going through HR. If you've got a Monday morning launch, we can absolutely move on it Saturday or Sunday.",
    followUp: 'Is this a weekend rush or just a regular project?',
  },

  // ────────────────────────────────────────────────────────────────
  // CREDIBILITY CHECKS (6)
  // ────────────────────────────────────────────────────────────────
  {
    id: 'cred-real-business',
    category: 'credibility-check',
    triggerQuestions: ['real business', 'legit', 'are you actually', 'who are you', 'verify you'],
    pitch:
      "Yes — XELA Creative Branding Studio is a registered Florida LLC, run by Alex, with a real phone number (321) 375-9685 you can call right now. We're not a faceless storefront — Alex puts her actual name on every package that ships.",
    followUp: 'Want our LLC number or to hop on a quick intro call first?',
  },
  {
    id: 'cred-file-ownership',
    category: 'credibility-check',
    triggerQuestions: ['who owns', 'rights to files', 'can i use commercially', 'license', 'ownership'],
    pitch:
      "You own everything 100% — full commercial rights, source files, the works. We don't keep a license, we don't restrict resale, we don't pop up on your shoulder later asking for credit. Once it's delivered, it's yours like you drew it yourself.",
    followUp: 'Anything specific about usage you want me to confirm in writing?',
  },
  {
    id: 'cred-data-privacy',
    category: 'credibility-check',
    triggerQuestions: ['my data', 'privacy', 'what happens to my info', 'data protection', 'gdpr'],
    pitch:
      "Your data stays in your file. We store what we need to deliver your project, encrypted, and we don't sell or share anything — ever. Our privacy policy is plain English, no dark patterns. If you want your data deleted after delivery, just say the word.",
    followUp: 'Want me to send the privacy policy link?',
  },
  {
    id: 'cred-references',
    category: 'credibility-check',
    triggerQuestions: ['past client', 'reference', 'testimonial', 'talk to someone', 'who has used you'],
    pitch:
      "Absolutely — we have clients who've offered to take calls from prospective ones, and our portfolio shows real work tied to real businesses. Just tell me what kind of business you'd want to hear from (food, services, creative, etc.) and I'll connect you.",
    followUp: 'What industry would feel most relevant to talk to?',
  },
  {
    id: 'cred-insurance',
    category: 'credibility-check',
    triggerQuestions: ['insured', 'licensed', 'liability', 'professional insurance'],
    pitch:
      "Yes — we carry professional liability coverage as a registered Florida LLC. It's the boring but important stuff that lets us work with bigger clients without a hiccup. Happy to share the certificate if you need it for procurement.",
    followUp: 'Is this for a vendor onboarding form or just due diligence?',
  },
  {
    id: 'cred-go-out-of-business',
    category: 'credibility-check',
    triggerQuestions: ['out of business', 'go away', 'shut down', 'lose my files'],
    pitch:
      "Even in the worst case, your files are yours forever — we deliver everything to you on day one. You'd never be left dependent on us hosting anything to keep using your brand. And realistically, a real Florida studio with a real address isn't going anywhere.",
    followUp: 'Want me to walk you through exactly what gets delivered to you on day one?',
  },

  // ────────────────────────────────────────────────────────────────
  // COMPARISON QUESTIONS (5)
  // ────────────────────────────────────────────────────────────────
  {
    id: 'compare-canva',
    category: 'comparison',
    triggerQuestions: ['canva', 'why not canva', 'i can do it myself', 'diy'],
    pitch:
      "Canva is great for execution once you know what to build — but it doesn't tell you what your brand should be. We do the strategy, the voice, the system, and then hand you assets you can actually edit in Canva later if you want. You leave with a brand, not just a logo template.",
    followUp: 'Are you mostly stuck on the design part or the strategy part?',
  },
  {
    id: 'compare-agency',
    category: 'comparison',
    triggerQuestions: ['agency', 'big firm', 'why not hire', 'design firm'],
    pitch:
      "An agency will charge you $8K to $40K and take 6 to 12 weeks, and you'll mostly talk to a junior. With us, you talk directly to the people building your brand, you pay a fraction, and you get it back in days. The trade-off is we're a small team — but for most small businesses that's the upgrade, not the downside.",
    followUp: 'Have you gotten quotes from agencies you can compare against?',
  },
  {
    id: 'compare-fiverr',
    category: 'comparison',
    triggerQuestions: ['fiverr', 'upwork', 'freelancer', '99designs'],
    pitch:
      "Fiverr can produce a logo, but you're often gambling on whoever takes the gig and there's no follow-through, no system, no second chance if you change direction. We're a real registered studio with a process — same deposit gets you strategy, design, files, and a real human (Alex) you can call.",
    followUp: 'Have you tried that route before, or just considering it?',
  },
  {
    id: 'compare-xela-different',
    category: 'comparison',
    triggerQuestions: ['what makes you different', 'why xela', 'why choose you', 'whats unique'],
    pitch:
      "Three things: AI lets us move 10x faster, you talk directly to Alex, never bounced around a sales team, and Col 3:23 isn't a marketing tag for us — we work like the work matters. Florida-based, real phone, real people, real heart.",
    followUp: 'What part of that matters most to you?',
  },
  {
    id: 'compare-ai-trust',
    category: 'comparison',
    triggerQuestions: ['trust ai', 'ai with my brand', 'ai do branding', 'machines making my brand'],
    pitch:
      "We use AI as a power tool, not a replacement for the people. It explores hundreds of directions fast — but a human picks, refines, and ships every final piece. Think of it like a chef using a great oven: the oven matters, but the chef is still the one cooking.",
    followUp: 'Want me to show you what the AI does versus what we do by hand?',
  },

  // ────────────────────────────────────────────────────────────────
  // TRUST BUILDING (6)
  // ────────────────────────────────────────────────────────────────
  {
    id: 'trust-tell-me-about',
    category: 'trust-building',
    triggerQuestions: ['tell me about you', 'who are you', 'about yourselves', 'your story'],
    pitch:
      "Alex runs XELA out of Florida — built it because we kept watching small businesses get priced out of professional branding by agencies that didn't even care about them. Our mission is simple: make every business look like it belongs at the top, no matter their budget.",
    followUp: "What's the story of how you got to needing a brand right now?",
  },
  {
    id: 'trust-process',
    category: 'trust-building',
    triggerQuestions: ['process', 'how does it work', 'what are the steps', 'walkthrough'],
    pitch:
      "Eight clear steps: intake → strategy → moodboard → logo concepts → palette + type → full system → delivery → follow-up. You see milestones as we go, so there's no black box. Most clients say the wizard alone made them feel like they finally understood what they were buying.",
    followUp: 'Want me to walk you through the wizard live?',
  },
  {
    id: 'trust-why-started',
    category: 'trust-building',
    triggerQuestions: ['why did you start', 'founding story', 'how did xela begin', 'origin'],
    pitch:
      "We started XELA because we kept watching friends with real businesses give up on branding — they couldn't afford an agency, didn't trust a freelancer, and Canva left them feeling stuck. We wanted a third path that was fast, affordable, and still felt like real care. So we built it.",
    followUp: 'Have you been stuck in that same place yourself?',
  },
  {
    id: 'trust-guarantee',
    category: 'trust-building',
    triggerQuestions: ['guarantee', 'money back', 'satisfaction', 'refund'],
    pitch:
      "Our guarantee is simple: we revise until it's right. On packages $350 and up that's unlimited rounds, on the starter it's 2 free rounds. If we genuinely can't deliver something you love, we work it out — we're not in the business of holding your money over a bad job.",
    followUp: 'What would make you feel like the guarantee is solid enough to start?',
  },
  {
    id: 'trust-faith-based',
    category: 'trust-building',
    triggerQuestions: ['faith based', 'christian', 'religion', 'colossians', 'faith'],
    pitch:
      "Yes — Colossians 3:23 is in our DNA: \"Whatever you do, work at it with all your heart, as working for the Lord, not for men.\" We don't push it on clients, we just live it in how we work. You'll feel it without us ever preaching it.",
    followUp: 'Does that resonate with how you run your business too?',
  },
  {
    id: 'trust-treat-clients',
    category: 'trust-building',
    triggerQuestions: ['how do you treat', 'customer service', 'client experience', 'support'],
    pitch:
      "Like family, and we mean that the unglamorous way — we answer texts, we remember details, we follow up after delivery to make sure things are working. You're not a ticket number with us, you're the reason the lights are on.",
    followUp: 'Has past customer service from other vendors burned you before?',
  },

  // ────────────────────────────────────────────────────────────────
  // VALUE DELIVERY (6)
  // ────────────────────────────────────────────────────────────────
  {
    id: 'value-what-i-get',
    category: 'value-delivery',
    triggerQuestions: ['what do i get', 'whats included', 'deliverables', 'what comes with'],
    pitch:
      "Depends on the tier, but every package includes a logo system, color palette, typography, brand voice notes, and source files. $350 and up adds marketing materials, a landing page, and unlimited revisions. Elite adds lifetime revisions, brand spokesperson, and ongoing updates.",
    followUp: 'Which tier should I break down for you in detail?',
  },
  {
    id: 'value-get-customers',
    category: 'value-delivery',
    triggerQuestions: ['help me get customers', 'will it bring sales', 'attract clients', 'grow my business'],
    pitch:
      "A brand is the trust signal that turns scrollers into customers — when you look professional, people stop questioning whether you're real and start asking about price and availability. We can't promise sales, but we can promise you won't lose sales because your brand looks like a side hustle.",
    followUp: 'Where are most of your potential customers finding you right now?',
  },
  {
    id: 'value-grow-business',
    category: 'value-delivery',
    triggerQuestions: ['grow my business', 'scale up', 'help me scale', 'business growth'],
    pitch:
      "The cycle is simple: look legit → get trusted → get paid → reinvest. A solid brand makes every other dollar you spend on marketing work harder, because you stop having to justify your existence and start having to manage demand. That's the real ROI.",
    followUp: "What's the one thing about your business that feels least \"legit\" right now?",
  },
  {
    id: 'value-marketing',
    category: 'value-delivery',
    triggerQuestions: ['marketing help', 'social media', 'ads', 'campaigns'],
    pitch:
      "Yes — at the $350 tier and above we include marketing material templates: social posts, email headers, ad creatives, the works. You leave with a kit you can post from on day one, not just a logo sitting in a folder.",
    followUp: 'Which platforms are you trying to show up on first?',
  },
  {
    id: 'value-pricing-services',
    category: 'value-delivery',
    triggerQuestions: ['help me price', 'what should i charge', 'pricing my services', 'rate setting'],
    pitch:
      "We include a pricing strategy session in the $350+ tiers — we'll look at your market, your costs, and your positioning, and help you land on numbers you can actually defend. Most new businesses underprice by 30 to 50%, and we fix that on day one.",
    followUp: 'What are you charging now versus what you wish you could charge?',
  },
  {
    id: 'value-industry-specific',
    category: 'value-delivery',
    triggerQuestions: ['my industry', 'will it work for', 'specific niche', 'unique business'],
    pitch:
      "We've worked with food trucks, law firms, churches, gyms, salons, makers, consultants, music artists — the process adapts because we start from your story, not a template. Tell me what you do and I'll tell you exactly how we'd approach it.",
    followUp: 'What industry are you in?',
  },

  // ────────────────────────────────────────────────────────────────
  // TECHNICAL QUESTIONS (5)
  // ────────────────────────────────────────────────────────────────
  {
    id: 'tech-file-formats',
    category: 'technical-question',
    triggerQuestions: ['file format', 'svg', 'png', 'pdf', 'ai file', 'what files'],
    pitch:
      "You get SVG (vector, infinite scale), PNG (transparent + solid), PDF (print-ready), and editable source — Adobe Illustrator (.ai) or Figma depending on the project. Anything you'd ever need for web, print, or merch, we ship it.",
    followUp: 'Any specific format your printer or platform requires?',
  },
  {
    id: 'tech-edit-later',
    category: 'technical-question',
    triggerQuestions: ['edit later', 'change myself', 'modify files', 'editable'],
    pitch:
      "Yes — we ship editable source files and a quick guide on how to make basic edits in Canva, Illustrator, or Figma. If you ever get stuck, we'll do small edits as a courtesy for existing clients, no charge.",
    followUp: 'Which design tool are you most comfortable with?',
  },
  {
    id: 'tech-websites',
    category: 'technical-question',
    triggerQuestions: ['website', 'landing page', 'web design', 'site'],
    pitch:
      "Yes — at $350 and up we include a landing page built on your new brand. It's fully responsive, fast, and you own the code. If you need a bigger site (multi-page, e-commerce), we can scope that as an add-on.",
    followUp: 'One landing page, or are you thinking bigger?',
  },
  {
    id: 'tech-color-match',
    category: 'technical-question',
    triggerQuestions: ['match color', 'pantone', 'hex', 'rgb', 'color codes'],
    pitch:
      "Every package includes Pantone, Hex, RGB, and CMYK codes for every color in your palette. So whether you're printing on a banner or coding a button, the color matches across mediums.",
    followUp: 'Are you doing a lot of print or mostly digital?',
  },
  {
    id: 'tech-software',
    category: 'technical-question',
    triggerQuestions: ['what software', 'tools you use', 'design programs', 'tech stack'],
    pitch:
      "Stack is AI (Gemini, Imagen, custom models) for ideation and exploration, Adobe Creative Suite for refinement, and human eyes for every final approval. The AI is fast, Adobe is professional, and the humans are the ones who actually care.",
    followUp: 'Was there a specific tool you were curious about?',
  },

  // ────────────────────────────────────────────────────────────────
  // POST-PURCHASE SUPPORT (3)
  // ────────────────────────────────────────────────────────────────
  {
    id: 'post-after-delivery',
    category: 'post-purchase',
    triggerQuestions: ['after delivery', 'what happens next', 'post project', 'after the project'],
    pitch:
      "After delivery you get access to your client portal — every file, every revision, every asset, archived for life. We also follow up at 30 days to see how it's working in the wild and to catch anything that needs a small tweak.",
    followUp: 'Want to see what the client portal looks like?',
  },
  {
    id: 'post-come-back',
    category: 'post-purchase',
    triggerQuestions: ['come back', 'updates later', 'future work', 'next project'],
    pitch:
      "Always welcome back — existing clients get priority pricing and faster turnaround on follow-ups because we already know your brand. A lot of our work is repeat clients adding new pieces as they grow.",
    followUp: 'Are you thinking ahead to phase two already?',
  },
  {
    id: 'post-remember-brand',
    category: 'post-purchase',
    triggerQuestions: ['remember my brand', 'store my files', 'keep on file', 'brand memory'],
    pitch:
      "Yes — your brand is stored securely in your client vault so any future updates start from your real assets, not from scratch. We call it Brand Memory and it means you never have to re-explain who you are when you come back.",
    followUp: 'Want me to create your vault now so it is ready when you order?',
  },
];

// ────────────────────────────────────────────────────────────────
// HELPERS
// ────────────────────────────────────────────────────────────────

/**
 * Match a user question to the best sales pitch
 * Uses simple keyword scoring for speed
 */
export function matchPitch(userQuestion: string): SalesPitch | null {
  const lower = userQuestion.toLowerCase();
  let bestMatch: SalesPitch | null = null;
  let bestScore = 0;

  for (const pitch of SALES_PITCHES) {
    let score = 0;
    for (const trigger of pitch.triggerQuestions) {
      if (lower.includes(trigger.toLowerCase())) {
        score += trigger.length; // longer matches = more specific
      }
    }
    if (score > bestScore) {
      bestScore = score;
      bestMatch = pitch;
    }
  }

  return bestScore > 3 ? bestMatch : null;
}

/**
 * Get pitches by category for browsing
 */
export function getPitchesByCategory(category: PitchCategory): SalesPitch[] {
  return SALES_PITCHES.filter((p) => p.category === category);
}

/**
 * Get a random pitch from a category (useful for variety)
 */
export function randomPitchFromCategory(category: PitchCategory): SalesPitch | null {
  const pitches = getPitchesByCategory(category);
  return pitches.length > 0 ? pitches[Math.floor(Math.random() * pitches.length)] : null;
}

/**
 * All categories with human-readable labels (handy for UI tabs)
 */
export const PITCH_CATEGORY_LABELS: Record<PitchCategory, string> = {
  'pricing-concern': 'Pricing',
  'quality-doubt': 'Quality',
  'timeline-worry': 'Timeline',
  'credibility-check': 'Credibility',
  comparison: 'Comparison',
  'trust-building': 'Trust',
  'value-delivery': 'Value',
  'technical-question': 'Technical',
  'post-purchase': 'After Purchase',
  'objection-handling': 'Objections',
};
