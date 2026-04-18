K
# XELA Elite AI Creative Studio — Agent / Tool / Skill Matrix
## Definitive Cross-Reference for the Entire Ecosystem
**Generated:** 2026-04-04
**Total Skills:** 190+ | **Agents:** 71+ | **Cron Jobs:** 17 | **Modes:** 15 | **Automation Scripts:** 25

---

## TABLE 1: AGENT INVENTORY

### Harness Agents (1-26)

| Agent ID | Name | Mode | Category | Triggers | Outputs | Dependencies |
|----------|------|------|----------|----------|---------|-------------|
| H-01 | Data Generator | BUILD | ML Pipeline | Pipeline stage, manual | training_data.jsonl | knowledge-extract, data-gen skill |
| H-02 | Training Orchestrator | BUILD+OPERATOR | ML Pipeline | Pipeline stage | model checkpoint/ | data-gen output, GPU resources |
| H-03 | Evaluation Agent | VERIFY | ML Pipeline | Post-training trigger | eval_results.json | eval-pipeline skill, checkpoint |
| H-04 | Failure Analyst | ANALYST | ML Pipeline | Post-eval trigger | failure_clusters.json | failure-analysis skill, eval results |
| H-05 | Deployment Agent | OPERATOR | ML Pipeline | Convergence gate pass | Deployed model | model-deploy skill, checkpoint |
| H-06 | Cost Monitor | FINANCIAL | ML Pipeline | Continuous background | cost_report.json | cost-optimize skill |
| H-07 | Brand Package Agent | CREATIVE+BUILD | Client Delivery | /brand-package command | Full brand package HTML | brand-package-creator, Gemini API |
| H-08 | Client Intake Agent | SALES | Client Pipeline | /client-onboarding command | Client brief, package recommendation | client-onboarding skill |
| H-09 | Proposal Writer | SALES+CREATIVE | Client Pipeline | /proposal command | Proposal markdown/PDF | proposal-generator skill |
| H-10 | Invoice Agent | FINANCIAL | Billing | /invoice command | Invoice HTML, payment tracker | invoice-tracker, banking-system |
| H-11 | SEO Strategist | ANALYST+BUILD | Marketing | /seo command | SEO reports, schema markup | seo-automation skill |
| H-12 | Social Content Agent | CREATIVE | Marketing | Cron (4 AM daily) | Social posts (3 platforms) | social-content.sh, WebSearch |
| H-13 | Morning Briefing Agent | EXPLORE+ANALYST | Operations | Cron (6 AM daily) | Briefing email draft | morning-briefing skill, Gmail MCP, Calendar MCP |
| H-14 | Friday Recap Agent | ANALYST | Operations | Cron (7 AM Fridays) | Email recap markdown | friday-email-recap skill, Gmail MCP |
| H-15 | Competitor Watch Agent | EXPLORE | Intelligence | Cron (5 AM daily) | competitor-DATE.md | WebSearch, WebFetch |
| H-16 | Revenue Scanner Agent | EXPLORE+ANALYST | Business Dev | Cron (Wed+Sun 3 AM) | revenue-DATE.md | WebSearch, WebFetch |
| H-17 | Client Follow-up Agent | REP+SALES | Client Pipeline | Cron (9 AM daily) | followup-DATE.report, Gmail drafts | Gmail MCP |
| H-18 | Brand Consistency Agent | VERIFY+ANALYST | Quality | Cron (1st monthly) | brand-consistency-MONTH.report | Gmail MCP, xela-brand-checker |
| H-19 | GEO Audit Agent | EXPLORE+ANALYST | Marketing | Cron (Mon 5 AM) | geo-DATE.md | geo-optimization skill, WebSearch |
| H-20 | Blog Autopilot Agent | CREATIVE+BUILD | Content | Cron (Mon 3 AM) | Blog HTML with schema | blog-autopilot.sh, brand-voice |
| H-21 | GBP Post Agent | CREATIVE | Marketing | Cron (Wed 8 AM) | GBP post markdown | gbp-poster.sh, brand-voice |
| H-22 | Phone Agent | REP+SALES | Client Comms | Inbound call to (321) 375-9685 | Voice responses, call logs | Deepgram STT, ElevenLabs TTS, Claude API |
| H-23 | Music Producer Agent | PRODUCER+CREATIVE | Music | /music-prompt, /suno commands | Suno prompts, production notes | music-prompt-engineer, suno-brand-audio, daw-mastery |
| H-24 | Vinyl Release Agent | PRODUCER+PLAN | Music | /vinyl-release command | Timeline, task tracker | vinyl-release, record-1/2-production |
| H-25 | Portfolio Update Agent | OPERATOR | Operations | Cron (1st+15th monthly) | portfolio-DATE.md | portfolio-update.sh |
| H-26 | Codebase Health Agent | GUARDIAN+VERIFY | DevOps | Cron (2 AM daily) | health-DATE.md | codebase-health.sh |

### Banking Agents (1-30)

| Agent ID | Name | Mode | Category | Triggers | Outputs | Dependencies |
|----------|------|------|----------|----------|---------|-------------|
| B-01 | Invoice Generator | FINANCIAL | Billing | /banking invoice generate | Invoice document | Firebase Firestore, Stripe |
| B-02 | Payment Processor | FINANCIAL | Payments | Client payment event | Payment confirmation, ledger entry | Stripe API, Firebase |
| B-03 | Cash Flow Forecaster | FINANCIAL+ANALYST | Reporting | /banking cashflow forecast | Cash flow projection | Transaction history, Firebase |
| B-04 | Tax Reserve Agent | FINANCIAL | Tax | /banking tax reserve | Tax reserve calculation | Transaction ledger, FL tax rules |
| B-05 | Fraud Detector | GUARDIAN+FINANCIAL | Security | Every transaction | Alert or pass | Transaction patterns, thresholds |
| B-06 | Accounts Receivable Agent | FINANCIAL | Collections | Daily scan | AR aging report | Invoice tracker, payment history |
| B-07 | Accounts Payable Agent | FINANCIAL | Vendor Payments | /banking pay vendor | Payment authorization | Vendor records, Firebase |
| B-08 | Expense Tracker | FINANCIAL | Expense Mgmt | Team expense submission | Categorized expense, approval queue | Firebase, RBAC |
| B-09 | Expense Approver | FINANCIAL | Expense Mgmt | Expense submission > threshold | Approval/denial | OWNER role, expense policy |
| B-10 | Refund Processor | FINANCIAL | Customer Service | /banking refund | Refund confirmation, ledger correction | Stripe, OWNER auth |
| B-11 | Subscription Manager | FINANCIAL | Recurring | Monthly cycle | Renewal/cancellation processing | Stripe subscriptions, Firebase |
| B-12 | Revenue Reporter | FINANCIAL+ANALYST | Reporting | Weekly/monthly trigger | Revenue by period report | All transaction data |
| B-13 | P&L Generator | FINANCIAL+ANALYST | Reporting | Monthly/quarterly | Profit & Loss statement | Revenue + expense data |
| B-14 | Budget Monitor | FINANCIAL+ANALYST | Planning | Continuous | Budget vs actual alerts | Budget config, transaction data |
| B-15 | Payroll Agent | FINANCIAL | Team | Bi-weekly cycle | Payroll calculations | Team records, tax tables |
| B-16 | Commission Calculator | FINANCIAL | Partners | Deal close event | Commission payout amount | Partner agreements, deal data |
| B-17 | Payment Plan Manager | FINANCIAL | Customer Service | /banking payment plan | Installment schedule | Client agreement, Stripe |
| B-18 | Late Payment Agent | FINANCIAL+SALES | Collections | 7/14/21/30 day overdue | Reminder email drafts | AR data, Gmail MCP |
| B-19 | Financial Auditor | GUARDIAN+FINANCIAL | Compliance | Monthly sweep | Audit log verification report | Immutable transaction log |
| B-20 | Tax Document Agent | FINANCIAL | Tax | Annual/quarterly | 1099s, expense summaries | Full year transaction data |
| B-21 | Vendor Onboarding Agent | FINANCIAL | Vendor Mgmt | New vendor setup | W-9 tracking, payment config | Firebase, RBAC |
| B-22 | Currency Handler | FINANCIAL | Payments | International transaction | Converted amount (cents) | Exchange rate API |
| B-23 | Reconciliation Agent | FINANCIAL+VERIFY | Accounting | Weekly | Reconciliation report | Bank feed, Stripe, Firebase ledger |
| B-24 | Pricing Optimizer | FINANCIAL+ANALYST | Strategy | /banking pricing | Pricing recommendations | Revenue data, competitor data |
| B-25 | Client Credit Agent | FINANCIAL | Customer Finance | New client financial check | Credit assessment | Client history, payment patterns |
| B-26 | Growth Metrics Agent | ANALYST | Business Intel | Monthly | MRR, churn, LTV, CAC report | All financial + client data |
| B-27 | Cash Reserve Agent | FINANCIAL | Treasury | Weekly | Reserve adequacy report | Cash flow, obligations |
| B-28 | Investment Tracker | FINANCIAL | Treasury | Quarterly | Investment performance | Asset records |
| B-29 | Financial Alert Agent | GUARDIAN+FINANCIAL | Monitoring | Continuous | Real-time financial alerts | Thresholds, transaction stream |
| B-30 | Year-End Agent | FINANCIAL | Tax/Compliance | December trigger | Year-end financial package | All annual data |

### Operational Agents

| Agent ID | Name | Mode | Category | Triggers | Outputs | Dependencies |
|----------|------|------|----------|----------|---------|-------------|
| O-01 | Cron Runner | OPERATOR | Infrastructure | System crontab | Script execution | All automation/*.sh scripts |
| O-02 | SEO Pipeline Orchestrator | OPERATOR+BUILD | Marketing | SEO cron schedule | Blog, GBP, social, report outputs | seo-workflows/*.sh |
| O-03 | Skills Improvement Agent | ANALYST+BUILD | Meta/Self | Cron (Sun 6 AM) | skills-review-DATE.md | skill-improve, skill-metrics |
| O-04 | Social Cross-Poster | CREATIVE | Marketing | Cron (5:30 AM daily) | Platform-specific posts (4 platforms) | social-cross-post.sh |
| O-05 | Review Request Agent | SALES | Client Satisfaction | Manual trigger post-delivery | Gmail draft, review-request file | review-request.sh, Gmail MCP |
| O-06 | Client Pipeline Manager | OPERATOR+SALES | Client Pipeline | Cron (8 AM + 4 PM daily) | pipeline-DATE.md | Firebase MCP, Gmail MCP |
| O-07 | Pipeline Executor | OPERATOR | Meta/Orchestration | /pipeline command | Stage outputs per YAML | pipeline-executor skill |
| O-08 | Agent Orchestrator | GENERAL | Meta/Orchestration | /orchestrate command | Coordinated multi-agent output | agent-orchestrate skill |
| O-09 | MCP Bridge Builder | BUILD | Infrastructure | /mcp-bridge command | Python MCP server files | mcp-bridge skill |

---

## TABLE 2: SKILL INVENTORY

### Business & Client Skills

| Skill Name | Command | User-Invocable | Category | Inputs | Outputs | Chains To | Triggered By |
|------------|---------|----------------|----------|--------|---------|-----------|-------------|
| client-onboarding | /client-onboarding | Yes | Client | Business info, vibe, goals | Client brief, package recommendation | proposal-generator, brand-package-creator | Manual, client-pipeline.sh |
| brand-package-creator | /brand-package | Yes | Client Delivery | BrandInput object | Full brand package (logos, colors, copy, strategy) | seo-automation, invoice-tracker, suno-brand-audio | client-onboarding output |
| proposal-generator | /proposal | Yes | Sales | Client name, needs, tier | Proposal markdown (scope, pricing, timeline) | invoice-tracker | client-onboarding output |
| invoice-tracker | /invoice | Yes | Financial | Client, line items, terms | Invoice HTML, payment status tracker | banking-system, friday-email-recap | proposal acceptance |
| phone-agent | /phone-agent | Yes | Client Comms | Inbound voice call | Voice responses, call transcripts | client-onboarding | Phone call to (321) 375-9685 |
| payment-system | N/A | No | Financial | Payment event | Transaction processing | banking-system | Stripe webhook |
| financial-evaluator-suite | N/A | No | Financial | Financial data | Evaluation reports | banking-system | Manual |
| financial-fortress | N/A | No | Security | Financial system config | Security audit report | banking-system, guardian-doctrine | Manual |
| financial-security | N/A | No | Security | Financial endpoints | Security assessment | banking-system | Manual |

### SEO & Marketing Skills

| Skill Name | Command | User-Invocable | Category | Inputs | Outputs | Chains To | Triggered By |
|------------|---------|----------------|----------|--------|---------|-----------|-------------|
| seo-automation | /seo | Yes | Marketing | Client config | Google Stack, schema, citations | geo-optimization, content-intelligence-suite | brand-package completion |
| geo-optimization | /geo | Yes | Marketing | Search queries | GEO audit report, action plan | seo-automation | geo-monitor.sh cron |
| content-intelligence-suite | N/A | No | Marketing | Content corpus | Content analysis, recommendations | seo-automation | Manual |
| sos-content-engine | N/A | No | Content | Brief | Content drafts | social-content.sh | Manual |
| linkedin-strategy | N/A | No | Social | Brand voice, topic | LinkedIn content plan | social-content.sh | Manual |
| site-personalization | N/A | No | Web | Visitor data | Personalized content | brand-package-creator | Manual |
| content-monetize | N/A | No | Business | Content assets | Monetization strategy | seo-automation | Manual |
| youtube-research | N/A | No | Content | Topic | YouTube content strategy | seo-automation | Manual |

### Brand & Creative Skills

| Skill Name | Command | User-Invocable | Category | Inputs | Outputs | Chains To | Triggered By |
|------------|---------|----------------|----------|--------|---------|-----------|-------------|
| xela-brand-checker | N/A | No | Quality | Asset paths | Brand consistency scores | brand-consistency-check.sh | Monthly cron |
| xela-brand-voice | /brand-voice | Yes | Brand | N/A | Voice guidelines, tone rules | social-content.sh, proposal-generator | Any content generation |
| firefly-brand-character | N/A | No | Brand | Character brief | Brand character profile | brand-package-creator | Manual |
| xela-analytics | N/A | No | Analytics | Usage data | Performance dashboard | xela-operations | Manual |
| xela-operations | N/A | No | Operations | System state | Operations dashboard | xela-analytics | Manual |
| xela-attention | N/A | No | UX | User behavior | Attention optimization | site-personalization | Manual |
| xela-upscale | N/A | No | Media | Low-res image | Upscaled image | brand-package-creator | Manual |
| xela-ab-test | N/A | No | Optimization | Variants | A/B test results | xela-analytics | Manual |

### Music & Audio Skills

| Skill Name | Command | User-Invocable | Category | Inputs | Outputs | Chains To | Triggered By |
|------------|---------|----------------|----------|--------|---------|-----------|-------------|
| suno-brand-audio | /suno-brand | Yes | Audio | Client brief, brand identity | Suno prompts, audio tracks | brand-package-creator | brand-package creation |
| suno-studio-workstation | /suno-studio | Yes | Audio | Production brief | Full Suno session | vinyl-release, record-1/2-production | Manual |
| music-prompt-engineer | /music-prompt | Yes | Audio | Artist/vibe description | Optimized Suno/Udio prompts | suno-brand-audio, suno-studio-workstation | Manual |
| daw-mastery | /daw | Yes | Audio | Production question | DAW guidance, Logic Pro workflows | record-1/2-production | Manual |
| vinyl-release | /vinyl-release | Yes | Project Mgmt | N/A | Timeline, task tracker, quality gates | record-1/2-production, suno-studio-workstation | Manual |
| record-1-production | /record-1 | Yes | Production | N/A | Record 1 production tracker | daw-mastery, suno-studio-workstation | vinyl-release |
| record-2-production | /record-2 | Yes | Production | N/A | Record 2 production tracker | daw-mastery, suno-studio-workstation | vinyl-release |
| cryo-mix-service | N/A | No | Audio | Mix stems | Mix/master guidance | record-1/2-production | Manual |
| audio-branding | N/A | No | Audio | Brand brief | Audio identity plan | suno-brand-audio | Manual |
| voice-model-trainer | N/A | No | Audio | Voice samples | Voice model config | phone-agent | Manual |
| freebeat-music-video | N/A | No | Video | Track + concept | Music video plan | vinyl-release | Manual |
| ripx-note-edit | N/A | No | Audio | Audio file | Note-level edits | record-1/2-production | Manual |

### Operations & Automation Skills

| Skill Name | Command | User-Invocable | Category | Inputs | Outputs | Chains To | Triggered By |
|------------|---------|----------------|----------|--------|---------|-----------|-------------|
| morning-briefing | /morning-briefing | Yes | Operations | N/A | Daily briefing email draft | Gmail draft | Cron 6 AM |
| friday-email-recap | /friday-recap | Yes | Operations | N/A | Email digest markdown | Gmail draft | Cron Fri 7 AM |
| meeting-prep | /meeting-prep | Yes | Operations | Meeting details | Prep brief | morning-briefing | Calendar events |
| pipeline-executor | /pipeline | Yes | Orchestration | Pipeline YAML | Stage outputs | All downstream skills | agent-orchestrate |
| agent-orchestrate | /orchestrate | Yes | Orchestration | Task description | Multi-agent coordination | All agent skills | Manual |
| agent-modes | /modes | Yes | Configuration | Mode name | Mode specification | All agents | Agent initialization |
| bridge-ops | N/A | No | Infrastructure | Bridge config | Bridge health report | mcp-bridge | Manual |
| context-manage | N/A | No | Meta | Context state | Compacted context | All long-running agents | Auto at 80% context |
| context-engine | N/A | No | Meta | Conversation | Context analysis | context-manage | Auto |
| pulse-trigger-system | N/A | No | Automation | Trigger config | Event dispatch | pipeline-executor | Event conditions |

### Meta / Self-Improvement Skills

| Skill Name | Command | User-Invocable | Category | Inputs | Outputs | Chains To | Triggered By |
|------------|---------|----------------|----------|--------|---------|-----------|-------------|
| skill-improve | /skill-improve | Yes | Meta | Skill name or "all" | Improved SKILL.md | skill-metrics, skill-compose | skills-improvement.sh cron |
| skill-compose | /skill-compose | Yes | Meta | Pipeline YAML | Composed pipeline definition | pipeline-executor | Manual |
| skill-dependency-map | /skill-deps | Yes | Meta | N/A | Dependency graph | skill-improve | Manual |
| skill-metrics | /skill-metrics | Yes | Meta | Skill name | Performance metrics JSON | skill-improve | Every skill execution |
| meta-skill-suite | N/A | No | Meta | Skill ecosystem | Meta-analysis | skill-improve | Manual |
| quality-loop | /quality-loop | Yes | Quality | Any draft output | Refined output (3 iterations) | All creative skills | Auto in CREATIVE mode |
| anti-ai-language | /anti-ai | Yes | Quality | Text draft | Filtered text (no AI cliches) | All content skills | Auto in CREATIVE mode |
| feedback-pipeline | /feedback | Yes | Learning | User corrections | Updated preference model | quality-loop, anti-ai-language | Every correction |
| reflexion-loop | N/A | No | Meta | Task + reflection | Improved output | skill-improve | Manual |
| eval-pipeline | /eval | Yes | ML | Model checkpoint | Evaluation results | failure-analysis, data-gen | Training completion |
| failure-analysis | N/A | No | ML | Eval results | Failure clusters | data-gen (targeted) | eval-pipeline output |

### Security Skills

| Skill Name | Command | User-Invocable | Category | Inputs | Outputs | Chains To | Triggered By |
|------------|---------|----------------|----------|--------|---------|-----------|-------------|
| banking-system | /banking | Yes | Financial Security | Banking operation | Transaction processing | All B-agents | Manual, cron |
| guardian-doctrine | N/A | No | Security Policy | N/A | Security rules | All GUARDIAN mode agents | Agent init |
| digital-fortress | N/A | No | Security | System config | Hardening report | hardening-guide | Manual |
| web-security-pipeline | N/A | No | Security | Target URL | Vulnerability report | web-vuln-audit, api-pentest | Manual |
| web-vuln-audit | N/A | No | Security | Target URL | Vuln findings | bug-hunt | Manual |
| api-pentest | N/A | No | Security | API endpoint | Pentest report | web-security-pipeline | Manual |
| bug-hunt | /bug-hunt | Yes | Security | Codebase | Bug findings | web-security-pipeline | Manual |
| exploit-dev | N/A | No | Security | Vulnerability | Exploit PoC | red-team-full | Manual |
| red-team-full | N/A | No | Security | Target scope | Red team report | incident-response | Manual |
| red-team-plan | N/A | No | Security | Engagement scope | Red team plan | red-team-full | Manual |
| threat-model | /threat-model | Yes | Security | System description | Threat model | guardian-doctrine | Manual |
| incident-response | N/A | No | Security | Incident alert | IR playbook | evidence-vault | Alert trigger |
| evidence-vault | N/A | No | Forensics | Evidence items | Chain of custody | incident-response | IR process |
| network-recon | N/A | No | Security | Target range | Network map | nmap-bridge (MCP) | Manual |
| malware-analysis | N/A | No | Security | Sample | Analysis report | reverse-engineer | Manual |
| reverse-engineer | N/A | No | Security | Binary | RE analysis | ghidra-auto, ghidra-script | Manual |
| ghidra-auto | N/A | No | RE | Binary path | Auto-analyzed binary | ghidra-script | Manual |
| ghidra-script | N/A | No | RE | Analysis task | Ghidra script | mcp-bridge (Ghidra) | Manual |
| osint | /osint | Yes | Intelligence | Target | OSINT report | threat-model | Manual |
| phishing-analysis | N/A | No | Security | Email/URL | Phishing assessment | incident-response | Manual |
| crypto-audit | N/A | No | Security | Crypto implementation | Audit report | guardian-doctrine | Manual |
| supply-chain-audit | N/A | No | Security | Dependencies | Supply chain risk report | guardian-doctrine | Manual |
| container-escape | N/A | No | Security | Container config | Escape analysis | red-team-full | Manual |
| detect-* (20 skills) | N/A | No | Detection | Various telemetry | Detection alerts | incident-response, siem-pipeline | Continuous |
| siem-pipeline | N/A | No | Security Ops | Log streams | Correlated alerts | incident-response | Continuous |
| ir-automation | N/A | No | Security Ops | Incident | Automated IR steps | incident-response | Alert trigger |
| silent-alarm | N/A | No | Security | Anomaly detection | Silent alert | incident-response | Auto |

### AI/ML & Research Skills

| Skill Name | Command | User-Invocable | Category | Inputs | Outputs | Chains To | Triggered By |
|------------|---------|----------------|----------|--------|---------|-----------|-------------|
| data-gen | /data-gen | Yes | ML | Seeds or failure clusters | Training data JSONL | training-orchestrator | Pipeline stage |
| training-orchestrator | /train | Yes | ML | Data + config | Model checkpoint | eval-pipeline | Pipeline stage |
| knowledge-extract | /knowledge | Yes | ML | Source documents | Structured knowledge JSON | data-gen | Manual |
| model-deploy | /deploy-model | Yes | ML | Checkpoint | Deployed model | cost-optimize | Convergence gate |
| cost-optimize | /cost | Yes | ML | Usage data | Cost report, recommendations | training-orchestrator | Continuous |
| llm-factory | N/A | No | ML | Full pipeline config | End-to-end model | All ML skills | Manual |
| reward-model | N/A | No | ML | Preference data | Reward model | training-orchestrator | Manual |
| prompt-engineer | /prompt | Yes | AI | Task description | Optimized prompt | All AI interactions | Manual |
| prompt-injection | N/A | No | Security | Prompt | Injection analysis | guardian-doctrine | Manual |
| differential-fuzz | N/A | No | Testing | Two implementations | Divergence report | bug-hunt | Manual |
| safety-eval | N/A | No | AI Safety | Model output | Safety scores | eval-pipeline | Post-eval |

### Teaching & Knowledge Skills

| Skill Name | Command | User-Invocable | Category | Inputs | Outputs | Chains To | Triggered By |
|------------|---------|----------------|----------|--------|---------|-----------|-------------|
| ai-literacy | N/A | No | Education | Topic | AI literacy content | curriculum-design | Manual |
| curriculum-design | N/A | No | Education | Learning goals | Curriculum plan | learning-teaching-suite | Manual |
| learning-teaching-suite | N/A | No | Education | Learner profile | Personalized learning path | curriculum-design | Manual |
| cs-deep-dive | N/A | No | Education | CS topic | Deep technical explanation | ai-literacy | Manual |
| story-engine | N/A | No | Creative | Story brief | Narrative content | love-writing-suite | Manual |
| love-writing-suite | N/A | No | Creative | Writing brief | Written content | anti-ai-language | Manual |
| report-writer | /report | Yes | Documentation | Data + template | Formatted report | All reporting workflows | Manual |
| news-to-feature | N/A | No | Product | News items | Feature ideas | content-intelligence-suite | Manual |

---

## TABLE 3: TOOL INVENTORY

### MCP Tools (External Services)

| Tool Name | Source | Type | Category | Used By Skills | Used By Agents | Auth Required |
|-----------|--------|------|----------|---------------|---------------|---------------|
| gmail_search_messages | Gmail MCP | Read | Email | morning-briefing, friday-email-recap, client-followup | H-13, H-14, H-17, H-18, O-05, O-06 | OAuth2 (Google) |
| gmail_read_message | Gmail MCP | Read | Email | morning-briefing, friday-email-recap | H-13, H-14, H-17 | OAuth2 (Google) |
| gmail_read_thread | Gmail MCP | Read | Email | friday-email-recap | H-14, H-17 | OAuth2 (Google) |
| gmail_create_draft | Gmail MCP | Write | Email | morning-briefing, friday-email-recap, client-followup, review-request | H-13, H-14, H-17, O-05 | OAuth2 (Google) |
| gmail_get_profile | Gmail MCP | Read | Email | morning-briefing | H-13 | OAuth2 (Google) |
| gmail_list_drafts | Gmail MCP | Read | Email | invoice-tracker | B-18 | OAuth2 (Google) |
| gmail_list_labels | Gmail MCP | Read | Email | friday-email-recap | H-14 | OAuth2 (Google) |
| gcal_list_events | Google Calendar MCP | Read | Calendar | morning-briefing, meeting-prep | H-13 | OAuth2 (Google) |
| gcal_list_calendars | Google Calendar MCP | Read | Calendar | morning-briefing | H-13 | OAuth2 (Google) |
| gcal_create_event | Google Calendar MCP | Write | Calendar | client-onboarding, phone-agent | H-08, H-22 | OAuth2 (Google) |
| gcal_find_meeting_times | Google Calendar MCP | Read | Calendar | meeting-prep | H-13 | OAuth2 (Google) |
| gcal_find_my_free_time | Google Calendar MCP | Read | Calendar | phone-agent | H-22 | OAuth2 (Google) |
| gcal_get_event | Google Calendar MCP | Read | Calendar | meeting-prep | H-13 | OAuth2 (Google) |
| gcal_update_event | Google Calendar MCP | Write | Calendar | meeting-prep | H-13 | OAuth2 (Google) |
| gcal_delete_event | Google Calendar MCP | Write | Calendar | meeting-prep | H-13 | OAuth2 (Google) |
| gcal_respond_to_event | Google Calendar MCP | Write | Calendar | meeting-prep | H-13 | OAuth2 (Google) |
| Suno API | Suno (planned bridge) | Write | Music | suno-brand-audio, suno-studio-workstation, music-prompt-engineer | H-23 | API Key |
| Firebase Firestore | Firebase MCP (planned) | Read/Write | Database | banking-system, client-pipeline, invoice-tracker | All B-agents, O-06 | Firebase Service Account |
| Stripe API | Stripe (planned bridge) | Read/Write | Payments | banking-system, payment-system | B-01 thru B-11 | Stripe Secret Key |
| Nmap | nmap-bridge (planned) | Execute | Security | network-recon | Security agents | Local install |
| Nuclei | nuclei-bridge (planned) | Execute | Security | web-vuln-audit | Security agents | Local install |
| Burp Suite | burp-bridge (planned) | Execute | Security | web-security-pipeline | Security agents | Local install + license |
| Ghidra | ghidra-bridge (planned) | Execute | RE | ghidra-auto, ghidra-script, reverse-engineer | Security agents | Local install |
| Deepgram | Voice pipeline | STT | Voice | phone-agent | H-22 | API Key |
| ElevenLabs | Voice pipeline | TTS | Voice | phone-agent | H-22 | API Key |
| Gemini API | Google AI | AI Generation | Core App | brand-package-creator | H-07 | API Key (env var) |
| Google Search Console | GSC API | Read | SEO | seo-automation | H-11, SEO pipeline | OAuth2 |
| GBP API | Google Business | Read/Write | Marketing | seo-automation, gbp-poster | H-21 | OAuth2 |

### Built-in Tools

| Tool Name | Source | Type | Category | Used By Skills | Used By Agents | Auth Required |
|-----------|--------|------|----------|---------------|---------------|---------------|
| Read | Claude Code | File I/O | Core | All skills | All agents | None |
| Write | Claude Code | File I/O | Core | All BUILD mode skills | All BUILD mode agents | None |
| Edit | Claude Code | File I/O | Core | All BUILD mode skills | All BUILD mode agents | None |
| Bash | Claude Code | Execution | Core | All skills with allowed-tools: Bash | All BUILD/OPERATOR agents | None |
| Grep | Claude Code | Search | Core | All skills | All agents | None |
| Glob | Claude Code | Search | Core | All skills | All agents | None |
| WebSearch | Claude Code | Web | Research | morning-briefing, competitor-watch, revenue-scanner, social-content, geo-monitor | H-12, H-13, H-15, H-16, H-19 | None |
| WebFetch | Claude Code | Web | Research | competitor-watch, revenue-scanner, geo-monitor | H-15, H-16, H-19 | None |
| Agent (subagent) | Claude Code | Orchestration | Meta | agent-orchestrate, pipeline-executor | O-07, O-08 | None |

---

## TABLE 4: CRON JOB INVENTORY

| Schedule | Name | Script | Skills Used | Tools Used | Output Path | Log Path |
|----------|------|--------|-------------|-----------|-------------|----------|
| `0 2 * * *` | Codebase Health | ~/automation/codebase-health.sh | (native bash checks) | npm audit, npm build | ~/automation/output/health-DATE.md | (inline in report) |
| `0 3 * * 1` | Blog Autopilot | ~/automation/seo-workflows/blog-autopilot.sh | brand-voice, anti-ai-language | Claude CLI | ~/automation/output/blog/DATE-SLUG.html | ~/automation/output/blog/blog-autopilot.log |
| `0 3 * * 3,0` | Revenue Scanner | ~/automation/revenue-scanner.sh | (inline analysis) | WebSearch, WebFetch | ~/automation/output/revenue-DATE.md | ~/automation/logs/revenue-scanner-DATE.log |
| `0 4 * * *` | Social Content | ~/automation/social-content.sh | brand-voice, anti-ai-language | WebSearch | ~/automation/output/social-DATE.md | ~/automation/logs/social-DATE.log |
| `0 4 1 * *` | Monthly SEO Report | ~/automation/seo-workflows/seo-report.sh | seo-automation | GSC API (if configured) | ~/automation/output/reports/seo-report-MONTH.md | ~/automation/output/reports/seo-report.log |
| `0 5 * * *` | Competitor Watch | ~/automation/competitor-watch.sh | (inline analysis) | WebSearch, WebFetch | ~/automation/output/competitor-DATE.md | ~/automation/output/run-DATE.log |
| `0 5 * * 1` | GEO Monitor | ~/automation/geo-monitor.sh | geo-optimization | WebSearch, WebFetch | ~/automation/output/geo-DATE.md | (stdout) |
| `30 5 * * *` | Social Cross-Post | ~/automation/seo-workflows/social-cross-post.sh | brand-voice | Claude CLI | ~/automation/output/social-cross/{platform}/ | ~/automation/output/social-cross/social-cross-post.log |
| `0 6 * * *` | Morning Briefing | ~/automation/morning-briefing.sh | morning-briefing | Gmail MCP, Calendar MCP, WebSearch | Gmail draft | ~/automation/logs/morning-briefing-DATE.log |
| `0 7 * * 5` | Friday Email Recap | ~/automation/friday-email-recap.sh | friday-email-recap | Gmail MCP | ~/automation/output/friday-recap-DATE.md | ~/automation/logs/friday-recap-DATE.log |
| `0 8 * * *` | Client Pipeline (AM) | ~/automation/client-pipeline.sh | client-onboarding | Firebase MCP, Gmail MCP | ~/automation/output/pipeline-DATE.md | ~/automation/pipeline.log |
| `0 8 * * 3` | GBP Post | ~/automation/seo-workflows/gbp-poster.sh | brand-voice | Claude CLI | ~/automation/output/gbp-posts/gbp-DATE.md | ~/automation/output/gbp-posts/gbp-poster.log |
| `0 9 * * *` | Client Follow-up | ~/automation/client-followup.sh | (inline templates) | Gmail MCP (search, read, draft) | ~/automation/output/followup-DATE.report | ~/automation/logs/followup-DATE.log |
| `0 16 * * *` | Client Pipeline (PM) | ~/automation/client-pipeline.sh | client-onboarding | Firebase MCP, Gmail MCP | ~/automation/output/pipeline-DATE.md | ~/automation/pipeline.log |
| `0 1 1,15 * *` | Portfolio Update | ~/automation/portfolio-update.sh | (native bash checks) | npm build | ~/automation/output/portfolio-DATE.md | ~/automation/logs/portfolio-update-DATE.log |
| `0 3 1 * *` | Brand Consistency | ~/automation/brand-consistency-check.sh | xela-brand-checker | Gmail MCP | ~/automation/output/brand-consistency-MONTH.report | ~/automation/logs/brand-consistency-MONTH.log |
| `0 6 * * 0` | Skills Improvement | ~/automation/skills-improvement.sh | skill-improve, skill-metrics | Claude CLI, Read | ~/automation/output/skills-review-DATE.md | ~/automation/logs/skills-improvement-DATE.log |

---

## TABLE 5: WORKFLOW MAP

| Workflow Name | Trigger | Skills Chain | Tools Used | Agents Involved | Mode | Automation % |
|---------------|---------|-------------|-----------|-----------------|------|-------------|
| Client Onboarding Flow | Manual / phone call / form submission | client-onboarding -> proposal-generator -> brand-package-creator | Firebase, Gmail MCP, Gemini API | H-08, H-09, H-07, H-22 | SALES -> CREATIVE | 70% (human approval gates) |
| Brand Package Creation Flow | Client onboarding complete | brand-package-creator -> (parallel: suno-brand-audio, seo-automation) -> quality-loop -> anti-ai-language | Gemini API, Suno API, WebSearch | H-07, H-23, H-11 | CREATIVE+BUILD | 85% (human review final) |
| Proposal Generation Flow | Client intake complete | proposal-generator -> invoice-tracker | Read, Write | H-09, H-10 | SALES+CREATIVE | 90% (human sends) |
| Invoice & Payment Flow | Proposal accepted | invoice-tracker -> banking-system -> (late-payment at 7/14/21/30d) | Stripe, Firebase, Gmail MCP | H-10, B-01, B-02, B-06, B-18 | FINANCIAL | 80% (human approves refunds) |
| SEO Setup Flow | Brand package delivered | seo-automation (Google Stack build) -> schema markup -> sitemap -> citation building | Google APIs (Docs, Sheets, Sites, Forms, Maps, Calendar, GBP), GSC | H-11 | BUILD+ANALYST | 75% (manual GBP verification) |
| Google Stack Build Flow | SEO setup trigger | seo-automation (10-property stack) -> interlinking matrix | Google Apps Script, Drive API | H-11 | BUILD | 90% (manual verification) |
| Social Content Pipeline | Cron 4 AM daily | social-content.sh -> social-cross-post.sh (LinkedIn, Instagram, Facebook, X) | WebSearch, Claude CLI | H-12, O-04 | CREATIVE | 95% (human review before post) |
| Morning Briefing Flow | Cron 6 AM daily | morning-briefing.sh -> (WebSearch + Gmail search + Calendar check) -> Gmail draft | WebSearch, Gmail MCP, Calendar MCP | H-13 | EXPLORE+ANALYST | 100% |
| Friday Email Recap Flow | Cron 7 AM Fridays | friday-email-recap.sh -> Gmail scan -> classify -> draft replies | Gmail MCP (search, read, draft) | H-14 | ANALYST | 95% (human sends drafted replies) |
| Client Follow-up Flow | Cron 9 AM daily | client-followup.sh -> (stale inquiries + pending proposals + delivery check-ins + dormant reactivation + risk flags) | Gmail MCP | H-17 | REP+SALES | 90% (human sends drafts) |
| Brand Consistency Check Flow | Cron 1st monthly | brand-consistency-check.sh -> (client roster + delivery audit + drift detection + scoring + actions) | Gmail MCP | H-18 | VERIFY+ANALYST | 100% |
| Revenue Scanning Flow | Cron Wed+Sun 3 AM | revenue-scanner.sh -> (RFPs + freelance platforms + grants + new biz registrations + upsells) -> ranked opportunity list | WebSearch, WebFetch | H-16 | EXPLORE+ANALYST | 100% |
| Competitor Monitoring Flow | Cron 5 AM daily | competitor-watch.sh -> (AI branding tools + creative platforms + voice AI + Florida industry + emerging tools) | WebSearch, WebFetch | H-15 | EXPLORE | 100% |
| GEO Audit Flow | Cron Mon 5 AM | geo-monitor.sh -> (10 search queries + competitor analysis + brand mentions + content recs + action plan) | WebSearch, WebFetch | H-19 | EXPLORE+ANALYST | 100% |
| Blog Autopilot Flow | Cron Mon 3 AM | blog-autopilot.sh -> topic queue -> Claude generation -> schema markup -> save HTML -> mark topic published | Claude CLI | H-20 | CREATIVE+BUILD | 95% (human review) |
| GBP Post Flow | Cron Wed 8 AM | gbp-poster.sh -> template rotation -> Claude generation -> save markdown | Claude CLI | H-21 | CREATIVE | 95% (human posts to GBP) |
| Phone Consultation Flow | Inbound call | phone-agent -> (Deepgram STT -> Claude -> ElevenLabs TTS) -> client-onboarding (if new lead) | Deepgram, ElevenLabs, Claude API | H-22, H-08 | REP+SALES | 80% (human escalation) |
| Music Production Flow | Manual /music-prompt or /suno commands | music-prompt-engineer -> suno-brand-audio -> daw-mastery -> record-1/2-production | Suno API, Logic Pro (guidance) | H-23 | PRODUCER+CREATIVE | 60% (heavy human creative input) |
| Vinyl Release Flow | Manual /vinyl-release | vinyl-release -> record-1-production + record-2-production -> (parallel tracks) -> quality gates -> master -> press order | Suno API, DAW guidance | H-24 | PRODUCER+PLAN | 50% (milestone-driven, human decisions) |
| Portfolio Update Flow | Cron 1st+15th monthly | portfolio-update.sh -> (gallery scan + deliverable scan + categorize + build check + report) | npm build, file system | H-25 | OPERATOR | 100% |
| Codebase Health Flow | Cron 2 AM daily | codebase-health.sh -> (npm audit + outdated + build + bundle size + firebase rules + env vars) -> notification | npm audit, npm build, npm outdated | H-26 | GUARDIAN+VERIFY | 100% |
| Skills Improvement Flow | Cron Sun 6 AM | skills-improvement.sh -> (inventory audit + performance analysis + improvement recs + new skill proposals + health score + action plan) | Claude CLI, Read | O-03 | ANALYST+BUILD | 100% |

---

## TABLE 6: MESH CONNECTIONS

### Skill-to-Tool Connections

| Source | Target | Connection Type | Data Flow | Frequency |
|--------|--------|----------------|-----------|-----------|
| morning-briefing | gmail_search_messages | MCP call | Query -> email list | Daily 6 AM |
| morning-briefing | gmail_create_draft | MCP call | Briefing text -> draft | Daily 6 AM |
| morning-briefing | gcal_list_events | MCP call | Date -> events list | Daily 6 AM |
| morning-briefing | WebSearch | Tool call | Keywords -> news results | Daily 6 AM |
| friday-email-recap | gmail_search_messages | MCP call | 5-day query -> email list | Weekly Fri 7 AM |
| friday-email-recap | gmail_read_message | MCP call | Message ID -> full content | Weekly Fri 7 AM |
| client-followup | gmail_search_messages | MCP call | Stale/dormant queries -> results | Daily 9 AM |
| client-followup | gmail_create_draft | MCP call | Draft text -> saved draft | Daily 9 AM |
| brand-package-creator | Gemini API | API call | BrandInput -> BrandStrategy | Per client |
| suno-brand-audio | Suno API | API call | Music prompt -> audio track | Per brand package |
| phone-agent | Deepgram | Streaming | Audio -> text transcript | Per call |
| phone-agent | ElevenLabs | Streaming | Response text -> audio | Per call |
| banking-system | Stripe API | API call | Payment intent -> confirmation | Per transaction |
| banking-system | Firebase Firestore | API call | Transaction -> ledger entry | Per transaction |
| seo-automation | Google APIs | API calls | Client config -> 10-property stack | Per client |
| social-content.sh | WebSearch | Tool call | Trend queries -> trending topics | Daily 4 AM |
| competitor-watch.sh | WebSearch | Tool call | Competitor names -> latest news | Daily 5 AM |
| competitor-watch.sh | WebFetch | Tool call | URLs -> page content | Daily 5 AM |
| revenue-scanner.sh | WebSearch | Tool call | Opportunity queries -> results | Wed+Sun 3 AM |
| geo-monitor.sh | WebSearch | Tool call | 10 brand queries -> visibility data | Weekly Mon 5 AM |
| blog-autopilot.sh | Claude CLI | CLI call | Blog prompt -> HTML article | Weekly Mon 3 AM |
| gbp-poster.sh | Claude CLI | CLI call | Post prompt -> GBP markdown | Weekly Wed 8 AM |
| codebase-health.sh | npm (audit/build/outdated) | CLI call | Package.json -> health metrics | Daily 2 AM |

### Cron-to-Skill Connections

| Source | Target | Connection Type | Data Flow | Frequency |
|--------|--------|----------------|-----------|-----------|
| cron 6 AM | morning-briefing skill | Script invocation | Time trigger -> briefing | Daily |
| cron 7 AM Fri | friday-email-recap skill | Script invocation | Time trigger -> recap | Weekly |
| cron 4 AM | social-content (inline) | Script invocation | Time trigger -> 3 platform drafts | Daily |
| cron 5:30 AM | social-cross-post (inline) | Script invocation | Social output -> 4 platform formats | Daily |
| cron 5 AM | competitor-watch (inline) | Script invocation | Time trigger -> intel report | Daily |
| cron Mon 5 AM | geo-optimization skill | Script invocation | Time trigger -> GEO audit | Weekly |
| cron 3 AM Mon | blog-autopilot (inline) | Script invocation | Topic queue -> blog post | Weekly |
| cron 8 AM Wed | gbp-poster (inline) | Script invocation | Template queue -> GBP post | Weekly |
| cron 9 AM | client-followup (inline) | Script invocation | Time trigger -> follow-up report | Daily |
| cron 8 AM/4 PM | client-pipeline (inline) | Script invocation | Time trigger -> pipeline status | Twice daily |
| cron Wed+Sun 3 AM | revenue-scanner (inline) | Script invocation | Time trigger -> opportunity scan | Twice weekly |
| cron 2 AM | codebase-health (native) | Script invocation | Time trigger -> health report | Daily |
| cron 1st+15th 1 AM | portfolio-update (native) | Script invocation | Time trigger -> portfolio report | Bi-monthly |
| cron 1st 3 AM | brand-consistency (inline) | Script invocation | Time trigger -> consistency audit | Monthly |
| cron 1st 4 AM | seo-report (native) | Script invocation | Time trigger -> monthly SEO report | Monthly |
| cron Sun 6 AM | skill-improve skill | Script invocation | Time trigger -> skills review | Weekly |

### Agent-to-Mode Connections

| Source | Target | Connection Type | Data Flow | Frequency |
|--------|--------|----------------|-----------|-----------|
| H-07 Brand Package | CREATIVE+BUILD mode | Mode assignment | Capabilities + constraints | Per session |
| H-08 Client Intake | SALES mode | Mode assignment | Approval gates enforced | Per client |
| H-09 Proposal Writer | SALES+CREATIVE mode | Mode assignment | Brand voice + pricing rules | Per proposal |
| H-10 Invoice Agent | FINANCIAL mode | Mode assignment | Double-entry, audit log, cents-only | Per invoice |
| H-13 Morning Briefing | EXPLORE+ANALYST mode | Mode assignment | Read-only, confidence scores | Daily |
| H-15 Competitor Watch | EXPLORE mode | Mode assignment | Read-only, source diversity | Daily |
| H-17 Client Follow-up | REP+SALES mode | Mode assignment | 80% confidence threshold, no auto-send | Daily |
| H-22 Phone Agent | REP+SALES mode | Mode assignment | Confidence calibration, escalation rules | Per call |
| H-23 Music Producer | PRODUCER+CREATIVE mode | Mode assignment | Preserve originals, 3 variants | Per session |
| H-26 Codebase Health | GUARDIAN+VERIFY mode | Mode assignment | Never suppress alerts | Daily |
| All B-agents | FINANCIAL mode | Mode assignment | Immutable audit log, server-side only | Per transaction |
| B-05 Fraud Detector | GUARDIAN+FINANCIAL mode | Mode assignment | Escalate all findings | Continuous |

### Workflow Chain Connections

| Source | Target | Connection Type | Data Flow | Frequency |
|--------|--------|----------------|-----------|-----------|
| client-onboarding | proposal-generator | Sequential chain | Client brief -> proposal input | Per client |
| proposal-generator | invoice-tracker | Sequential chain | Accepted scope -> invoice line items | Per deal close |
| brand-package-creator | seo-automation | Parallel chain | Brand assets -> Google Stack config | Per brand package |
| brand-package-creator | suno-brand-audio | Parallel chain | Brand identity -> audio brief | Per brand package (if audio add-on) |
| social-content.sh | social-cross-post.sh | Sequential chain | Source markdown -> platform-specific posts | Daily (4 AM -> 5:30 AM) |
| blog-autopilot.sh | seo-report.sh | Data accumulation | Published posts -> monthly metrics | Weekly -> Monthly |
| gbp-poster.sh | seo-report.sh | Data accumulation | GBP posts -> monthly metrics | Weekly -> Monthly |
| social-cross-post.sh | seo-report.sh | Data accumulation | Cross-posts -> monthly metrics | Daily -> Monthly |
| client-pipeline.sh | client-followup.sh | Data sharing | Pipeline status -> follow-up triggers | Twice daily -> Daily |
| skill-improve | skill-metrics | Bidirectional | Metrics inform improvements, improvements update metrics | Weekly |
| quality-loop | anti-ai-language | Embedded chain | Draft -> quality iterate -> AI filter | Every creative output |
| feedback-pipeline | quality-loop | Learning loop | User corrections -> updated preferences -> better quality | Continuous |
| invoice-tracker | banking-system | Financial chain | Invoice -> payment processing -> ledger | Per payment |
| banking-system (B-06 AR) | client-followup (late reminders) | Alert chain | Overdue invoices -> Gmail draft reminders | At 7/14/21/30 day marks |
| morning-briefing | meeting-prep | Data enrichment | Calendar events -> meeting prep briefs | Daily AM |
| competitor-watch | revenue-scanner | Intelligence feed | Competitor gaps -> opportunity signals | Daily -> Twice weekly |
| geo-monitor | seo-automation | Recommendation feed | Visibility gaps -> content/schema actions | Weekly |
| brand-consistency-check | client-followup | Risk feed | Low-score clients -> proactive outreach | Monthly -> Daily |
| codebase-health | portfolio-update | Health gate | Build status -> portfolio readiness | Daily -> Bi-monthly |
| vinyl-release | record-1-production | Project breakdown | Master timeline -> Record 1 tasks | Milestone-driven |
| vinyl-release | record-2-production | Project breakdown | Master timeline -> Record 2 tasks | Milestone-driven |
| record-1/2-production | daw-mastery | Knowledge reference | Production question -> DAW guidance | Per session |
| phone-agent | client-onboarding | Lead capture | Call transcript -> new client intake | Per qualified call |

### MCP Bridge Architecture Connections

| Source | Target | Connection Type | Data Flow | Frequency |
|--------|--------|----------------|-----------|-----------|
| Claude Code | Gmail MCP Server | MCP protocol | Tool calls -> Gmail API -> responses | 50+ calls/day |
| Claude Code | Google Calendar MCP Server | MCP protocol | Tool calls -> Calendar API -> responses | 10+ calls/day |
| mcp-bridge skill | Ghidra backend (planned) | HTTP REST | Tool calls -> Ghidra plugin -> analysis | On demand |
| mcp-bridge skill | Nmap backend (planned) | Subprocess | Tool calls -> nmap CLI -> scan results | On demand |
| mcp-bridge skill | Nuclei backend (planned) | Subprocess | Tool calls -> nuclei CLI -> vuln reports | On demand |
| mcp-bridge skill | Burp Suite backend (planned) | HTTP REST | Tool calls -> Burp API -> scan results | On demand |
| mcp-bridge skill | Firebase backend (planned) | Firebase SDK | Tool calls -> Firestore -> documents | Continuous |
| ~/mcp-bridges/.venv | All Python MCP servers | Runtime | Python 3.12 venv with google-cloud-firestore installed | Persistent |

---

## APPENDIX A: FULL SKILL DIRECTORY (190+ Skills by Category)

### Business/XELA (30)
`brand-package-creator` `client-onboarding` `content-monetize` `firefly-brand-character` `invoice-tracker` `linkedin-strategy` `payment-system` `phone-agent` `proposal-generator` `site-personalization` `xela-ab-test` `xela-analytics` `xela-attention` `xela-brand-blueprint` `xela-brand-checker` `xela-brand-generate` `xela-brand-voice` `xela-branding-packages` `xela-business-card` `xela-client-pipeline` `xela-competitor-analysis` `xela-cross-sell-engine` `xela-full-package` `xela-intake-optimizer` `xela-launch-checklist` `xela-learn-from-user` `xela-logo-generate` `xela-marketing-copy` `xela-operations` `xela-output-template` `xela-prompt-enhance` `xela-prompt-refine` `xela-quality-gate` `xela-skill-evolve` `xela-upscale` `xela-video-ad`

### Security (60+)
`anti-fraud-pipeline` `api-pentest` `arsenal` `blue-team-detect` `bug-hunt` `client-side-attack` `cloud-security` `comms-security` `container-escape` `counter-surveillance` `crypto-audit` `detect-ai-fraud` `detect-api-abuse` `detect-business-fraud` `detect-cloud-metadata` `detect-ddos` `detect-deepfake` `detect-dns-covert` `detect-identity-theft` `detect-insider-threat` `detect-lateral-movement` `detect-mobile-malware` `detect-persistence` `detect-privilege-esc` `detect-ransomware` `detect-rce-deserial` `detect-supply-chain` `detect-voice-fraud` `digital-fortress` `ethical-ai-doctrine` `evidence-vault` `exploit-dev` `financial-fortress` `financial-security` `fraud-investigation` `fraud-report-contacts` `frida-script-gen` `ghidra-auto` `ghidra-script` `guardian-doctrine` `hardening-guide` `identity-armor` `incident-response` `influence-tactics` `ios-re` `ir-automation` `log-forensics` `malware-analysis` `manipulation-defense` `mobile-hack` `network-recon` `network-trust-map` `oauth-hack` `osint` `passive-counter-intel` `phishing-analysis` `prompt-injection` `protobuf-attack` `red-team-full` `red-team-plan` `reverse-engineer` `safe-speech` `safety-eval` `security-research-suite` `siem-pipeline` `signal-analysis` `silent-alarm` `situational-awareness` `snowden-audit` `social-engineer` `supply-chain-audit` `threat-model` `web-security-pipeline` `web-vuln-audit`

### Music/Audio (12)
`audio-branding` `cryo-mix-service` `daw-mastery` `freebeat-music-video` `music-prompt-engineer` `record-1-production` `record-2-production` `ripx-note-edit` `suno-brand-audio` `suno-studio-workstation` `vinyl-release` `voice-model-trainer`

### AI/ML (15)
`ai-video-4k` `cost-optimize` `data-gen` `differential-fuzz` `eval-pipeline` `failure-analysis` `knowledge-extract` `llm-factory` `model-deploy` `prompt-engineer` `reward-model` `training-orchestrator` `ai-hack-assist` `ai-literacy` `safety-eval`

### Meta/Self-Improvement (20)
`_automations` `_metrics` `agent-identity` `agent-modes` `agent-orchestrate` `bridge-ops` `cognitive-load-guard` `context-engine` `context-manage` `feedback-pipeline` `meta-skill-suite` `pipeline-executor` `pulse-trigger-system` `quality-loop` `quick-commands` `reflexion-loop` `skill-compose` `skill-dependency-map` `skill-improve` `skill-metrics`

### Content/Creative (15)
`anti-ai-language` `content-intelligence-suite` `deception-detect` `love-writing-suite` `news-to-feature` `pattern-recognition` `people-strategy-suite` `report-writer` `sos-content-engine` `sos-doctrine` `sos-proof-system` `story-engine` `temporal-truth` `youtube-research` `ask-interview`

### SEO/Marketing (5)
`geo-optimization` `seo-automation` `morning-briefing` `friday-email-recap` `meeting-prep`

### DevOps/Systems (10)
`android-exploit-chain` `android-re` `arm-assembly` `c-cpp-safety` `concurrency-audit` `governance-graph` `jni-native-bridge` `legal-shield` `recon-methodology` `world-model`

### Banking (1 composite)
`banking-system` (contains all 30 banking agent definitions)

### Education (5)
`ai-literacy` `curriculum-design` `cs-deep-dive` `learning-teaching-suite` `behavior-profile`

### Business Strategy (5)
`exit-strategy` `financial-evaluator-suite` `master-commands` `tri-agent-rectifier` `auto-unpack`

---

## APPENDIX B: AUTOMATION SCRIPT DIRECTORY

| Script | Path | Purpose |
|--------|------|---------|
| morning-briefing.sh | ~/automation/ | Daily 6 AM briefing with Gmail + Calendar + WebSearch |
| friday-email-recap.sh | ~/automation/ | Friday 7 AM email digest with urgency ranking |
| social-content.sh | ~/automation/ | Daily 4 AM social content generation (3 platforms) |
| competitor-watch.sh | ~/automation/ | Daily 5 AM competitive intelligence scan |
| client-pipeline.sh | ~/automation/ | Twice-daily pipeline status (Firebase + Gmail) |
| client-followup.sh | ~/automation/ | Daily 9 AM client lifecycle automation |
| revenue-scanner.sh | ~/automation/ | Twice-weekly revenue opportunity scan |
| brand-consistency-check.sh | ~/automation/ | Monthly brand audit across all clients |
| geo-monitor.sh | ~/automation/ | Weekly GEO visibility audit |
| portfolio-update.sh | ~/automation/ | Bi-monthly portfolio scan and build check |
| codebase-health.sh | ~/automation/ | Daily 2 AM security + build + dependency check |
| skills-improvement.sh | ~/automation/ | Weekly recursive skill ecosystem review |
| blog-autopilot.sh | ~/automation/seo-workflows/ | Weekly blog post from topic queue |
| gbp-poster.sh | ~/automation/seo-workflows/ | Weekly GBP post from template rotation |
| social-cross-post.sh | ~/automation/seo-workflows/ | Daily reformatting for 4 social platforms |
| seo-report.sh | ~/automation/seo-workflows/ | Monthly SEO performance report |
| review-request.sh | ~/automation/seo-workflows/ | Manual review request generator + Gmail draft |
| install-cron.sh | ~/automation/ | Cron installer (pipeline, competitor, social, friday) |
| install-skills-cron.sh | ~/automation/ | Cron installer (skills improvement) |
| setup-cron.sh | ~/automation/ | Cron installer (competitor watch) |
| setup-revenue-cron.sh | ~/automation/ | Cron installer (revenue scanner) |
| install-crons.sh | ~/automation/seo-workflows/ | Cron installer (blog, GBP, social-cross, SEO report) |
| check-status.sh | ~/automation/ | Status checker for all automations |
| test-pipeline.sh | ~/automation/ | Pipeline test runner |
| xela-aliases.sh | ~/automation/ | Shell aliases for quick commands |

---

*This matrix is the single source of truth for the XELA Elite AI Creative Studio ecosystem. Every agent, tool, skill, cron job, and workflow is cross-referenced here. Update this document when adding new components.*
