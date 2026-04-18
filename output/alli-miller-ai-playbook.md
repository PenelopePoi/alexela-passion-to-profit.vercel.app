# Alli Miller AI Productivity Playbook
## Extracted from Interview — AI Advisor to OpenAI, Google, Anthropic
## Reference Date: 2026-04-04

---

## PRIORITY TIER: IMPLEMENT FIRST (High Impact, Low Effort)

### P1. Context Documents (Foundation — Everything Else Depends on These)
These three documents power every workflow, skill, and agent below.

| Document | What Goes In It | Update Frequency |
|----------|----------------|------------------|
| **Personal Constitution** | Core values, personality traits, working style, communication methods, decision-making principles | Rarely (timeless) |
| **2026 Goals Document** | Annual/quarterly/monthly goals, habits to build, habits to kick, specific measurable inputs and outputs | Quarterly review |
| **Core Business Strategy** | What Xela does, who it serves, who it does NOT serve, value proposition, things not on the website, competitive positioning | Semi-annually |

**Action:** Create these as markdown files in project root or `.claude/` — they become system context for every agent.

---

### P2. Claude Skills to Build (Portable, Reusable Across All Projects)

| # | Skill Name | What It Does | Build Priority |
|---|-----------|--------------|----------------|
| 1 | **Tone of Voice** | Enforces personal writing style across all output | FIRST |
| 2 | **Anti-AI Language** | Strips corporate AI slop ("delve", "leverage", "I'd be happy to") from all output | FIRST |
| 3 | **Brand Guidelines** | Xela brand rules, colors, fonts, language patterns | FIRST |
| 4 | **LinkedIn Voice** | Social media voice tuned for LinkedIn engagement | SECOND |
| 5 | **Client Recap** | Takes client name, returns customized context + advice history | SECOND |
| 6 | **PR Skill** | Transforms any content into press-ready format, news pitches | THIRD |
| 7 | **GEO (Generative Engine Optimization)** | Optimizes content for AI search engines (not just Google SEO) | THIRD |
| 8 | **Ask User Questions** | Interview mode — AI asks YOU questions to build context docs instead of you writing from scratch | FIRST |
| 9 | **Skill Creator** | Meta-skill: builds new skills from conversations (built into Claude already) | USE NOW |

**Key insight:** Skills are portable. A skill built in Claude Code works in Claude.ai, can be adapted for ChatGPT custom instructions, Perplexity profiles, etc.

---

## PROACTIVE WORKFLOWS (Scheduled/Automated)

### W1. Friday Urgent Email Recap
- **Trigger:** Every Friday (scheduled)
- **Actions:**
  1. Scrape Gmail for past 5 days of messages
  2. Rank all emails by urgency level
  3. Draft reply suggestions for each
  4. Flag delegation candidates (who else can handle this?)
  5. Set reminder if no reply sent by Monday
- **Tools needed:** Gmail MCP, Calendar MCP, scheduled trigger

### W2. Morning Briefing Agent
- **Trigger:** Daily, before first meeting
- **Actions:**
  1. Pull industry news + trending AI stories
  2. Check weather + suggest outfit (Florida heat context)
  3. Surface local events relevant to business
  4. Pull today's calendar, prep for each client meeting
  5. If keyword detected (client name, project name) → trigger asset generation
- **Tools needed:** Gmail MCP, Calendar MCP, WebSearch, custom triggers

### W3. Proactive Meeting Blocker
- **Trigger:** Weekly or on calendar change
- **Actions:**
  1. Scan calendar for open slots
  2. Block deep work time (2-4 hour chunks)
  3. Protect mornings or preferred focus windows
  4. Auto-decline or suggest reschedule for low-priority conflicts
- **Tools needed:** Google Calendar MCP

### W4. Client Prep Agent
- **Trigger:** Keyword from morning briefing OR 24hrs before client meeting
- **Actions:**
  1. Pull client history, past deliverables, open items
  2. Generate meeting agenda
  3. Create any needed assets (slides, one-pagers, proposals)
  4. Surface relevant industry news for that client's sector
- **Tools needed:** Calendar MCP, file system, brand skills

---

## CLAUDE CO-WORK PLUGINS (Pre-Built by Anthropic)

Available in Claude.ai's co-work feature:

| Plugin | Use Case |
|--------|----------|
| **Brand Voice** | Maintains consistent brand tone |
| **Customer Support** | Drafts support responses |
| **Data / SQL Queries** | Query databases conversationally |
| **Finance** | Financial analysis, reporting |
| **Engineering** | Code review, architecture |
| **Legal** | Contract review, compliance checks |

---

## KEY FRAMEWORKS

### F1. Four-Stage AI Maturity Model
Progress through these stages — most people are stuck at 1-2:

| Stage | Name | Description | Example |
|-------|------|-------------|---------|
| 1 | **Microtasker** | One-off prompts, copy-paste | "Write me an email" |
| 2 | **Companion** | Ongoing conversations, remembers context | Chat history, custom instructions |
| 3 | **Delegate** | Assigned tasks with autonomy, uses tools | "Monitor my inbox and flag urgent items" |
| 4 | **Teammate** | Proactive, has authority, works independently | Morning briefing runs without being asked |

**Goal:** Move every repeated task from Stage 1 → Stage 3-4.

### F2. "Complain to AI" Method
- Open a conversation
- Describe what's frustrating, broken, slow, annoying
- Don't propose solutions — just vent
- Let the AI propose the solution/automation
- Often surfaces workflows you didn't know you needed

### F3. Context Building Hack
- Run team sessions where everyone talks to AI together
- AI interviews the team to extract tribal knowledge
- Produces shared context documents everyone's agents can use
- Use the "Ask User Questions" skill for solo version

### F4. Modular Skill Architecture
- Skills are small, focused, single-purpose
- Skills can be combined (Brand + Tone + Anti-AI = polished output)
- Skills can be shared between agents and projects
- Skills are platform-agnostic (work in Claude, GPT, Perplexity)

---

## PRODUCTIVITY PRINCIPLES

| # | Principle | Application |
|---|-----------|-------------|
| 1 | **If you do it repeatedly, automate it** | Any task done 3+ times becomes a workflow |
| 2 | **Charge by output, not hours** | AI makes hourly billing obsolete — price deliverables |
| 3 | **Maintain critical thinking authority** | YOU decide what's good. AI proposes, you dispose |
| 4 | **High agency + sense of wonder** | Stay curious, stay in control |
| 5 | **AI as teammate, not intern** | Give it real context, real authority, real feedback |
| 6 | **Every person needs their own AI OS** | Your setup is unique — build YOUR system |
| 7 | **Skills are portable** | Invest in skills that work everywhere |

---

## IMPLEMENTATION ROADMAP FOR XELA STUDIO

### Week 1: Foundation
- [ ] Create Personal Constitution (use "Ask User Questions" skill)
- [ ] Create 2026 Goals Document
- [ ] Create Core Business Strategy for Xela
- [ ] Build Tone of Voice skill
- [ ] Build Anti-AI Language skill
- [ ] Build Brand Guidelines skill

### Week 2: Daily Workflows
- [ ] Set up Morning Briefing (even manual-trigger version)
- [ ] Set up Friday Email Recap using Gmail MCP
- [ ] Build Client Recap skill
- [ ] Set up Meeting Blocker using Calendar MCP

### Week 3: Growth Skills
- [ ] Build LinkedIn Voice skill
- [ ] Build PR skill
- [ ] Build GEO skill
- [ ] Set up Client Prep Agent

### Week 4: Scale
- [ ] Audit all repeated tasks → convert to workflows
- [ ] Run "Complain to AI" session to find hidden automation opportunities
- [ ] Share skills across all active projects
- [ ] Document the full system for replication

---

## QUICK REFERENCE: TOOLS WE ALREADY HAVE ACCESS TO

Available right now in this environment:
- **Gmail MCP** — search, read, draft emails
- **Google Calendar MCP** — list events, find free time, create/block events
- **WebSearch / WebFetch** — pull news, research
- **Claude Skills** — buildable via CLAUDE.md or slash commands
- **File System** — full read/write for context docs and outputs

---

*Source: Alli Miller interview transcript*
*36 proactive workflows, ~100 agents referenced in her personal setup*
*This document extracts the implementable subset for a solo creative studio operator*
