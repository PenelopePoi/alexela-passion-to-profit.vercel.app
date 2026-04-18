# XELA Creative Branding Studio — 8-Week Implementation Roadmap

**Period:** April 4 - May 30, 2026
**Mission:** Revenue first, infrastructure second. Every week builds on the last.
**Pricing Tiers:** Budget ($149) | Premium ($249) | Elite ($399)
**Annual Target:** 50+ clients, $10K+ MRR

---

## Legend

| Symbol | Meaning |
|--------|---------|
| `AI` | Fully automated by Claude/Gemini — no human needed |
| `HUMAN` | Requires your hands, voice, or physical presence |
| `HYBRID` | AI drafts it, you review/approve |
| `$$$` | Direct revenue impact |
| `$$` | Indirect revenue (lead gen, credibility) |
| `$` | Infrastructure — pays off later |
| `DEP:` | Dependency — must complete the listed item first |

---

## WEEK 1: REVENUE FOUNDATION (April 4-11)

_Goal: Be able to accept money and hand someone a card by Friday._

| # | Task | Est. Time | Who | Revenue | Dependencies | Notes |
|---|------|-----------|-----|---------|--------------|-------|
| 1.1 | **Set up Stripe account** | 30 min | HUMAN | $$$ | None | Use business email. Connect bank account. Enable test mode first. |
| 1.2 | **Create Stripe payment links for all 3 tiers** | 45 min | HUMAN | $$$ | DEP: 1.1 | Budget ($149), Premium ($249), Elite ($399). Enable payment plans on Premium/Elite. |
| 1.3 | **Create booking/intake form page** | 2 hrs | AI | $$$ | None | Functional URL. Fields: business name, industry, tagline, colors, audience. Connects to Firebase. Deploy to xela domain. |
| 1.4 | **Design XELA business cards (print-ready PDF)** | 1.5 hrs | HYBRID | $$ | None | Front: logo, name, tagline, QR to intake form. Back: 3 package tiers with prices. CMYK, 3.5x2", 300dpi, bleed marks. |
| 1.5 | **Design XELA flyer (print-ready PDF)** | 2 hrs | HYBRID | $$ | None | 8.5x11". Hero: "Passion to Prophet in 60 Seconds." Package breakdown. QR code to booking page. Before/after brand examples. |
| 1.6 | **Design XELA door hanger (print-ready PDF)** | 1.5 hrs | HYBRID | $$ | None | 4.25x11" with die-cut hole. "Your Brand Deserves Better" headline. Single CTA: QR to intake form. |
| 1.7 | **Set up Google Business Profile** | 1 hr | HUMAN | $$ | None | Category: Marketing Agency + Graphic Design. Add photos, services, hours. Verify address. |
| 1.8 | **Submit to top 10 local directories** | 2 hrs | HYBRID | $$ | DEP: 1.7 | Yelp, BBB, Thumbtack, Alignable, Clutch, DesignRush, Bark, UpCity, Expertise, Florida Chamber. NAP consistency critical. |

**Week 1 Total Time:** ~11 hrs
**Week 1 Milestone:** Can accept payments, have physical marketing materials ready to print, discoverable online.

---

## WEEK 2: CLIENT ACQUISITION (April 11-18)

_Goal: Start generating inbound leads. First outbound push with print materials._

| # | Task | Est. Time | Who | Revenue | Dependencies | Notes |
|---|------|-----------|-----|---------|--------------|-------|
| 2.1 | **Launch first 4 blog posts (programmatic SEO)** | 3 hrs | AI | $$ | None | Target: "branding for [industry] in Florida" x4. Industries: restaurants, salons, contractors, fitness. Long-tail keywords. |
| 2.2 | **Deploy Google Property Stack for XELA** | 2 hrs | HYBRID | $$ | DEP: 1.7 | Google Sites, Docs, Sheets, Slides — all interlinked. Entity stacking for local SEO authority. Per the Google Drive Entity Stacking report already in output/. |
| 2.3 | **Start GBP post automation** | 1 hr | AI | $$ | DEP: 1.7 | 3 posts/week automated. Mix of offers, tips, portfolio pieces. Schedule via Claude cron job. |
| 2.4 | **Create 10 social media posts (scheduled)** | 2 hrs | HYBRID | $$ | None | Instagram + Facebook. Brand identity showcases, tips, before/after. Use Xela brand voice skill. Schedule across 2 weeks. |
| 2.5 | **Add Schema markup to website** | 1 hr | AI | $$ | None | LocalBusiness, Service, PriceSpecification, AggregateRating (when reviews come in). JSON-LD in index.html. |
| 2.6 | **Order 500 business cards from printer** | 30 min | HUMAN | $$ | DEP: 1.4 | Use HP Precision for proofs first. Order from VistaPrint/4over or local print shop. Matte finish, thick stock. |
| 2.7 | **Start door-to-door/local outreach with flyers** | 4 hrs/week | HUMAN | $$$ | DEP: 1.5, 1.6 | Target: small businesses without professional branding. Strip malls, salons, restaurants, auto shops. 50 doors minimum Week 2. |
| 2.8 | **Print door hangers (100 qty)** | 1 hr | HUMAN | $$ | DEP: 1.6 | Cricut Explorer 3 for die-cut if needed. HP Precision for print run. Cardstock. |

**Week 2 Total Time:** ~14.5 hrs (includes ongoing outreach time)
**Week 2 Milestone:** SEO pipeline live, physical outreach started, social presence active. First inbound leads possible.

---

## WEEK 3: VOICE & PHONE (April 18-25)

_Goal: Automated phone agent handles inbound calls and qualifies leads while you sleep._

| # | Task | Est. Time | Who | Revenue | Dependencies | Notes |
|---|------|-----------|-----|---------|--------------|-------|
| 3.1 | **Get Deepgram API key** | 15 min | HUMAN | $ | None | $200 free credit on signup. STT engine for voice pipeline. |
| 3.2 | **Get ElevenLabs API key** | 15 min | HUMAN | $ | None | Free tier available. TTS for voice agent responses. |
| 3.3 | **Test voice agent through mixer** | 3 hrs | HYBRID | $ | DEP: 3.1, 3.2 | USB Audio CODEC -> BlackHole -> LiveKit. Test STT accuracy. Test TTS quality. Confirm round-trip latency <500ms. |
| 3.4 | **Set up Vapi phone agent** | 2 hrs | HYBRID | $$$ | DEP: 3.1, 3.2 | Vapi for phone number + call routing. Agent script: greet, qualify (business name, needs, budget), book or transfer. |
| 3.5 | **Test phone-to-Claude pipeline** | 2 hrs | HYBRID | $$$ | DEP: 3.4 | Caller -> Vapi -> Deepgram STT -> Claude (qualification logic) -> ElevenLabs TTS -> caller. End-to-end test with real phone number. |
| 3.6 | **Record voice samples for RVC training** | 2 hrs | HUMAN | $ | None | 30+ min of clean vocal audio through mixer. Varied pitch, tone, speaking style. For custom voice model later. |
| 3.7 | **Add phone number to all marketing materials** | 1 hr | HYBRID | $$ | DEP: 3.4 | Update business cards PDF, flyer, door hanger, website, GBP. Reprint cards if needed. |

**Week 3 Total Time:** ~10.5 hrs
**Week 3 Milestone:** Inbound phone calls answered by AI agent 24/7. Lead qualification automated. Voice samples recorded for future training.

---

## WEEK 4: QNEXT DEADLINE + VINYL (April 25 - May 2)

_Goal: Ship GuardianAI Phase One by April 29. Start vinyl production pipeline._

| # | Task | Est. Time | Who | Revenue | Dependencies | Notes |
|---|------|-----------|-----|---------|--------------|-------|
| 4.1 | **Complete Qnext GuardianAI Phase One** | 20+ hrs | HYBRID | $$$ | See Qnext memory file | **HARD DEADLINE: April 29.** Knowledge graph, PII detection, AI orchestration, agent architecture. Simplest architecture that works on real FileFlex data. Get "functional" criteria agreed IN WRITING before final push. |
| 4.2 | **Get compute budget approval from Anthony** | 1 hr | HUMAN | $$$ | None | IN WRITING. Email or Slack. $1K/mo cap per Section 20. Multi-model will exceed this — need explicit approval. |
| 4.3 | **Contact pressing plants** | 2 hrs | HUMAN | $ | None | Gotta Groove Records (Cleveland), Disc Makers, United Record Pressing. Get quotes for 2x 7" or 12" records. MOQs, turnaround, pricing. |
| 4.4 | **Finalize vinyl masters** | 4 hrs | HUMAN | $ | None | Logic Pro. Both records: "Conflict Resolution" (Lost Inside Myself + Within) and "For the Kids" (Schoolyard + Trampoline). Mastering chain: Ozone, Waves, Nectar 4. Vinyl-specific mastering (mono bass, -3dB inner grooves). |
| 4.5 | **Start vinyl album art with family photos** | 3 hrs | HYBRID | $ | None | Record 2 art: real photos with son and daughter. Record 1 art: abstract/emotional. Both need print-ready specs from pressing plant (DEP: 4.3 for specs, but can start layout now). |
| 4.6 | **Continue local outreach** | 4 hrs/week | HUMAN | $$$ | Ongoing | 50 more doors. Follow up on Week 2 contacts. Track conversion: doors knocked -> leads -> clients. |

**Week 4 Total Time:** ~34 hrs (heavy week — Qnext deadline dominates)
**Week 4 Milestone:** GuardianAI delivered. Vinyl production initiated. Outreach pipeline continuing.

---

## WEEK 5: SCALE — FIRST CLIENTS (May 2-9)

_Goal: Convert outreach into paying clients. Iterate on package quality._

| # | Task | Est. Time | Who | Revenue | Dependencies | Notes |
|---|------|-----------|-----|---------|--------------|-------|
| 5.1 | **Close first 5 paying clients** | 8 hrs | HUMAN | $$$ | DEP: Weeks 1-4 outreach | Follow up on all leads from outreach, phone agent, and web. Offer 20% launch discount if needed. Target: 5 x $249 avg = $1,245 revenue. |
| 5.2 | **Iterate on branding package quality** | 4 hrs | HYBRID | $$$ | DEP: 5.1 | Review first client deliverables. Improve Gemini prompts. Add more template variety. Ensure print-readiness of all outputs. |
| 5.3 | **A/B test pricing** | 2 hrs | AI | $$$ | DEP: 5.1 | Test $149/$249/$399 vs $199/$299/$499. Track conversion by tier. Use Stripe payment link analytics. |
| 5.4 | **Launch SEO monthly packages** | 3 hrs | HYBRID | $$$ | None | New recurring revenue stream. $99/mo (basic), $249/mo (growth), $499/mo (aggressive). Blog posts, GBP optimization, citation building, reporting. |
| 5.5 | **Start Google Stack service for clients** | 4 hrs | HYBRID | $$$ | DEP: 2.2 | Productize the entity stacking strategy. Offer as add-on ($199 one-time) or include in SEO packages. AI generates the stack, human reviews. |
| 5.6 | **Client testimonial collection** | 1 hr | HYBRID | $$ | DEP: 5.1 | Automated follow-up email 48 hrs after delivery. Google review request. Screenshot testimonials for social proof. |

**Week 5 Total Time:** ~22 hrs
**Week 5 Milestone:** First revenue collected. SEO packages launched. Client feedback incorporated.

---

## WEEK 6: SCALE — VOICE MODEL + SYSTEMS (May 9-16)

_Goal: Custom voice model trained. Client pipeline becoming repeatable._

| # | Task | Est. Time | Who | Revenue | Dependencies | Notes |
|---|------|-----------|-----|---------|--------------|-------|
| 6.1 | **Voice model training (RVC v2)** | 4 hrs | HYBRID | $ | DEP: 3.6 | Install RVC v2. Train on recorded samples + extracted Logic Pro vocals. Target: natural-sounding clone for voice agent and music. |
| 6.2 | **Deploy custom voice to phone agent** | 2 hrs | HYBRID | $$ | DEP: 6.1, 3.4 | Replace ElevenLabs stock voice with RVC-trained custom voice. Test naturalness and latency. |
| 6.3 | **Build client onboarding automation** | 3 hrs | AI | $$ | DEP: 5.1 | Stripe payment -> Firebase record -> intake form auto-sent -> brand generation triggered -> deliverables emailed. End-to-end automated. |
| 6.4 | **Create portfolio page with completed work** | 2 hrs | HYBRID | $$ | DEP: 5.1 | Auto-detect from /public/gallery/ (per gallery sync architecture). Add first 5 client brands. Before/after format. |
| 6.5 | **Second batch of 4 blog posts** | 3 hrs | AI | $$ | None | New industries: real estate, cleaning services, food trucks, pet grooming. Same programmatic SEO template. |
| 6.6 | **Outreach continues** | 4 hrs/week | HUMAN | $$$ | Ongoing | Now with testimonials and portfolio to show. Conversion rate should improve. Target: 5 more clients this week. |

**Week 6 Total Time:** ~18 hrs
**Week 6 Milestone:** Custom voice deployed. Client pipeline semi-automated. 10 total clients in sight.

---

## WEEK 7: SYSTEMS — HARNESS + AUTOMATION (May 16-23)

_Goal: Operational infrastructure catches up to revenue growth._

| # | Task | Est. Time | Who | Revenue | Dependencies | Notes |
|---|------|-----------|-----|---------|--------------|-------|
| 7.1 | **Harness Phase 2 — Operational Controls** | 8 hrs | HYBRID | $ | DEP: Harness Phase 1 (already planned for early April) | Agents 5-8: token management, event system, structured logging, output verification. Per harness-architecture.md spec. |
| 7.2 | **Payment plan automation** | 3 hrs | AI | $$$ | DEP: 1.1 | Stripe subscriptions for Premium/Elite payment plans. Auto-pause on failed payment. Dunning emails. |
| 7.3 | **Review automation** | 2 hrs | AI | $$ | DEP: 5.6 | Auto-request Google review 7 days post-delivery. Follow-up if no review in 14 days. Aggregate rating on website via Schema. |
| 7.4 | **Monthly SEO reporting automated** | 3 hrs | AI | $$ | DEP: 5.4 | For SEO retainer clients. Pull GBP insights, Search Console data, citation status. Generate branded PDF report. Email monthly. |
| 7.5 | **Client dashboard page** | 4 hrs | HYBRID | $$ | None | Simple status page per client: package purchased, deliverables status, files download, invoice history. Firebase-backed. |
| 7.6 | **GPT-SoVITS setup for vinyl** | 3 hrs | HYBRID | $ | DEP: 6.1 | Text-to-singing capability for vinyl production. Install and test with trained voice model. |

**Week 7 Total Time:** ~23 hrs
**Week 7 Milestone:** Business runs with less manual intervention. Payment, reviews, reporting all automated.

---

## WEEK 8: SYSTEMS — SHIP & COMPOUND (May 23-30)

_Goal: All systems operational. Vinyl ordered. Growth compounding._

| # | Task | Est. Time | Who | Revenue | Dependencies | Notes |
|---|------|-----------|-----|---------|--------------|-------|
| 8.1 | **Vinyl records ordered and in production** | 2 hrs | HUMAN | $ | DEP: 4.3, 4.4, 4.5 | Submit masters + art to pressing plant. Pay deposit. Typical turnaround: 6-10 weeks (arrives July-August). |
| 8.2 | **10+ clients served milestone review** | 2 hrs | HUMAN | $$$ | DEP: All previous | Audit: avg revenue per client, time per delivery, client satisfaction, repeat rate. Identify bottlenecks. |
| 8.3 | **Harness Phase 2 completion** | 4 hrs | HYBRID | $ | DEP: 7.1 | Finish operational controls. All 4 agents tested and deployed. Token budgets enforced. |
| 8.4 | **Launch referral program** | 2 hrs | HYBRID | $$$ | DEP: 5.1 | $50 credit per referral that converts. Automated tracking via Stripe metadata. Email notification to referrer. |
| 8.5 | **Third batch of blog posts (8 total new)** | 3 hrs | AI | $$ | None | Expand to service-based: "how much does branding cost," "DIY vs professional branding," "branding checklist for startups." Informational intent. |
| 8.6 | **Quarterly review + Q3 planning** | 3 hrs | HUMAN | $ | None | What worked, what didn't. Revenue vs target. Client pipeline health. Adjust pricing, services, outreach strategy for June-August. |
| 8.7 | **Social proof compilation** | 2 hrs | HYBRID | $$ | DEP: 8.2 | Case studies from best clients. Video testimonials if possible. Update website hero section with real numbers. |

**Week 8 Total Time:** ~18 hrs
**Week 8 Milestone:** 10+ clients served. Vinyl in production. Automated systems running. Clear path to $10K MRR.

---

## CUMULATIVE METRICS BY END OF WEEK 8 (May 30, 2026)

| Metric | Target |
|--------|--------|
| Paying clients | 10+ |
| Revenue collected | $2,500 - $5,000 |
| MRR (SEO packages) | $500 - $1,500 |
| Blog posts live | 12+ |
| Google reviews | 5+ |
| Phone agent uptime | 24/7 |
| Automated workflows | 15+ |
| Vinyl records | Ordered, in production |
| GuardianAI Phase One | Delivered |
| Harness | Phase 2 complete |
| Doors knocked | 200+ |
| Social media posts | 30+ |

---

## REVENUE PROJECTION

| Week | New Clients | Revenue (One-Time) | MRR Added | Cumulative |
|------|-------------|-------------------|-----------|------------|
| 1 | 0 | $0 | $0 | $0 |
| 2 | 0 | $0 | $0 | $0 |
| 3 | 1 | $249 | $0 | $249 |
| 4 | 1 | $249 | $0 | $498 |
| 5 | 3 | $747 | $198 | $1,443 |
| 6 | 3 | $747 | $297 | $2,487 |
| 7 | 2 | $498 | $198 | $3,183 |
| 8 | 2 | $498 | $249 | $3,930 |
| **Total** | **12** | **$2,988** | **$942/mo** | **$3,930** |

_Conservative estimate. Based on $249 avg package price and $99 avg SEO monthly. Actual could be higher with Elite tier conversions._

---

## CRITICAL PATH (Do These or Everything Stalls)

1. **Week 1, Day 1:** Stripe account live (blocks all revenue)
2. **Week 1, Day 2:** Intake form URL live (blocks client acquisition)
3. **Week 1, Day 3:** Business cards designed (blocks physical outreach)
4. **Week 2, Day 1:** Start outreach (blocks client pipeline)
5. **Week 4, April 29:** GuardianAI delivered (contractual obligation)
6. **Week 5:** First paying client (validates entire business model)

---

## COST BUDGET (8 Weeks)

| Item | Cost | When |
|------|------|------|
| Stripe fees | 2.9% + $0.30/txn | Ongoing |
| Business cards (500) | $30-50 | Week 2 |
| Flyer/door hanger printing | $20-40 | Week 1-2 |
| Deepgram API | $0 (free credit) | Week 3 |
| ElevenLabs API | $0-22/mo | Week 3 |
| Vapi phone number | $5-15/mo | Week 3 |
| Vinyl pressing (2 records) | $500-1,500 | Week 8 |
| Google Workspace | Already have | -- |
| Firebase/Vercel hosting | Free tier | -- |
| Domain renewal | Already have | -- |
| **Total estimated:** | **$600 - $1,650** | |

---

## AUTOMATION vs HUMAN BREAKDOWN

### AI Does This (No Human Needed)
- Blog post generation and publishing
- GBP post scheduling
- Social media content drafting
- Schema markup implementation
- Intake form deployment
- Client onboarding email flow
- SEO report generation
- Review request automation
- Payment plan dunning
- Harness agent scripts

### Human Must Do This
- Stripe account setup (identity verification)
- Google Business Profile verification
- Door-to-door outreach
- Phone calls with prospects
- Closing sales
- Approving final deliverables
- Recording voice samples
- Vinyl mastering (final ear check)
- Qnext client communication
- Ordering physical prints
- Contacting pressing plants

### Hybrid (AI Drafts, Human Approves)
- Business card / flyer / door hanger design
- Branding package quality review
- Voice agent script and personality
- Client dashboard design
- Pricing decisions
- Album art direction
- Blog post topic selection
- Social media post approval

---

_Last updated: April 4, 2026_
_Next review: Weekly Friday check-in_
_Owner: XELA Creative Branding Studio_
