# XELA Creative Branding Studio

## Project
React + Vite + TypeScript + Tailwind CSS + Firebase + Google Gemini AI.
AI-powered branding package generator. 68 services across 10 categories. Florida-based creative studio (Brevard County / Space Coast).
Official name: **XELA Creative Branding Studio**. Phone: (321) 375-9685.
Positioning: "We are your marketing team. Digital, print, everything."

## Prompt Refinement Protocol

When the user gives a prompt, silently apply these refinements before executing:

1. **Decode phonetic/abbreviated input** — user types fast. "gemake" = "make", "nd" = "and", "ording" = "ordering". Never comment on typos.
2. **Infer missing context** — if the user says "the packages" or "the pricing", they mean the branding packages in this project. If they say "the grid" or "the layout", check which component they last discussed.
3. **Expand vague aesthetic direction** — "make it elegant" = clean spacing, consistent radii, proper hierarchy, subtle hover states. "hash grid" = uniform card grid with logical grouping. "efficient" = scannable, no wasted space, information-dense.
4. **Apply design system automatically** — brand-lavender, brand-teal, brand-black. Rounded 2-3rem corners. font-black + tracking-widest for labels. Dark cards for Elite tier.
5. **Suggest improvements subtly** — when executing a task, if you notice a UX issue or inconsistency nearby, fix it in the same pass. Don't announce it as a separate thing — just include it. If it's a bigger change, mention it in one line at the end.

## Code Style
- Tailwind utility classes, no external CSS files
- Lucide React for icons
- Framer Motion for animations
- Components in `/components/`, services in `/services/`
- Types in `types.ts` at root

## Revenue Model
- Branding packages: $75-$2,000 (Budget/Premium/Elite/Custom)
- SEO retainers: $149-$299/month
- Google Stack: $99-$399
- Monthly retainers: $99-$399/month
- Audio branding: $49-$149
- Consulting: $199-$299/session
- GuardianAI: $1K/month (Qnext)

## Current State (as of April 4, 2026)
- 60+ agents dispatched, 25+ skills created, 17 cron jobs
- 60+ Mac aliases in .zshrc
- Harness Phase 1 foundation built (schemas, permissions, config)
- Suno MCP bridge (9 tools), voice agent scaffolded, agent-browser installed
- Full 11-process business automation pipeline
- SEO: Google Stack + 56 programmatic pages + 24 blog topics + 5 SEO crons
- Print specs: business card, flyer, door hanger, social ads
- Booking page at /public/book.html (Firebase backend)
- 78 gaps identified, 14 critical
- Critical path: LLC → EIN → bank → deploy → Stripe → GBP → outreach

## Automation & Skills
- 17 proactive cron workflows in ~/automation/
- 25+ skills in ~/.claude/skills/
- 7 context docs in ~/.claude/projects/-Users-TroubleshootGuest/context/
- 18 memory files in ~/.claude/projects/-Users-TroubleshootGuest/memory/
- MCP Bridges: Firebase, Suno (~/mcp-bridges/)
- Voice agent project at ~/voice-agent/ (LiveKit + ElevenLabs)
- Agentic harness at ~/harness/ (26 agents, 88+ scripts, 12 capabilities)

## Progress Tracking
- Save per-project progress to ~/.claude/projects/-Users-TroubleshootGuest/memory/ after significant work sessions
- Update project memory files when milestones hit, blockers found, or architecture decisions made
- Always check existing progress files before starting work on a returning project

## Key Deadlines
- April 29, 2026: Qnext GuardianAI Phase One delivery
- June 2026: 2 vinyl records pressed and shipped
- May 30, 2026: First $3,930 revenue + $942/mo recurring target

## Do NOT
- Ask clarifying questions about typos or grammar
- Add console.logs or debugging code
- Restructure files or folders without being asked
- Add npm packages without being asked
- Use "Xela Elite AI Creative Studio" or any old name — the correct name is "XELA Creative Branding Studio"
