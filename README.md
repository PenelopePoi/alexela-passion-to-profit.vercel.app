# AleXelA Creative Branding Studio

AI-powered branding package generator for small businesses. Enter your business details and receive a complete brand strategy — color palettes, typography, logo concepts, marketing materials, business cards, and more — generated in real time by Google Gemini AI.

**AleXelA Creative Branding Studio** is a Florida-based creative agency (Brevard County / Space Coast) operating under Reconsumeralization LLC. We are your marketing team — digital, print, everything.

## Features

- **AI Brand Strategy Generator** — input your business name, industry, vibe, and audience to receive a full branding package powered by Gemini AI
- **Tiered Pricing** — Budget ($75), Premium ($500), Elite ($2,000), and Custom packages with transparent deliverables
- **76 Components** spanning branding, CRM, analytics, payments, and operations:
  - Brand assets: color palettes, typography studio, logo generator, landing page previews, social profile previews, vinyl sticker generator
  - Client management: CRM, client profiles, consultation wizard, chat intake, intake shuffler, submissions inbox
  - Business tools: contract generator, invoice tracker, revenue projector, payment options (Stripe), grant proposal generator
  - AI tools: AI Studio, brand intelligence, brand consistency checker, attention heatmap, brand memory, brand voice studio
  - Security and governance: Sentinel dashboard, Guardian Council, data sovereignty, provenance dashboard, supply chain auditor
  - Marketing: marketing materials, business cards, sales pitch assistant, video ad generator, brand spokesperson
- **Portfolio Gallery** — auto-detects images from `/public/gallery/` with no code changes needed
- **Live Assistant** — real-time AI chat for brand consultations
- **A/B Variant Testing** — built-in experimentation with variant banners and conversion tracking
- **Serverless API** — Vercel Functions for financial operations, invoicing, Stripe payments, and health checks
- **Mobile-Responsive** — bottom navigation and optimized layouts for mobile devices

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | React 19 + TypeScript |
| Build | Vite 6 |
| Styling | Tailwind CSS 4 |
| AI | Google Gemini (`@google/genai`) |
| Auth & Database | Firebase (Auth, Firestore) |
| Payments | Stripe |
| Animations | Motion (Framer Motion) |
| Icons | Lucide React |
| Hosting | Vercel |
| Testing | Vitest + Testing Library |

## Project Structure

```
├── App.tsx                  # Main application entry
├── components/              # 76 React components
├── services/                # 27 service modules (AI, CRM, payments, security)
├── hooks/                   # Custom React hooks (A/B variants)
├── api/                     # Vercel serverless functions (financial, invoice, stripe)
├── public/                  # Static assets, gallery images, SEO pages
│   ├── gallery/             # Portfolio images (auto-detected)
│   ├── seo/                 # Programmatic SEO pages
│   └── portfolio/           # Portfolio assets
├── types.ts                 # Shared TypeScript interfaces
├── firebase.ts              # Firebase configuration
├── vite.config.ts           # Vite build config with code splitting
├── vercel.json              # Vercel deployment and routing
└── tests/                   # Test suite
```

## Getting Started

### Prerequisites

- Node.js 18+
- A [Google Gemini API key](https://ai.google.dev/)
- Firebase project (for auth and database features)
- Stripe account (for payment processing)

### Installation

```bash
git clone https://github.com/AAlexandre00/xela-elite-ai-creative-studio.git
cd xela-creative-branding-studio
npm install
```

### Environment Variables

Create a `.env.local` file in the project root:

```env
VITE_API_KEY=your_gemini_api_key
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_STRIPE_PUBLISHABLE_KEY=your_stripe_key
```

### Development

```bash
npm run dev        # Start dev server on http://localhost:3000
npm run build      # Production build
npm run preview    # Preview production build
npm run lint       # TypeScript type checking
npm run test       # Run test suite
```

## Deployment

The project deploys to **Vercel** with automatic builds on push. The `vercel.json` configures:

- SPA routing (all paths rewrite to `index.html`)
- API routes for `/api/financial`, `/api/invoice`, and `/api/stripe`
- Vite as the build framework

## Revenue Model

| Service | Price |
|---------|-------|
| Branding Packages | $75 -- $2,000 |
| SEO Retainers | $149 -- $299/month |
| Google Stack | $99 -- $399 |
| Monthly Retainers | $99 -- $399/month |
| Audio Branding | $49 -- $149 |
| Consulting Sessions | $199 -- $299/session |

## License

Proprietary. All rights reserved by Reconsumeralization LLC.

## Contact

- **Phone:** (321) 375-9685
- **Email:** xelabrandingstudio@gmail.com
- **Location:** Brevard County, FL (Space Coast)
