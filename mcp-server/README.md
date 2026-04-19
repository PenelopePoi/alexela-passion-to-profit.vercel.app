# XELA Creative Branding Studio — MCP Server

Exposes XELA's internal business operations as MCP (Model Context Protocol) tools that can be called by AI agents, including Claude Code.

## Tools Available

### Brand Tools
- **generate_brand_strategy** — Full brand strategy via Gemini AI (taglines, mission, colors, typography, social posts, brand story)
- **generate_business_names** — 10 creative name suggestions for a new business
- **generate_logo_concepts** — Detailed logo concept descriptions with image generation prompts

### Client/CRM Tools
- **list_clients** — List all CRM clients with optional status/search filters
- **get_client** — Get detailed client info by ID
- **create_client** — Create a new client record

### Invoice Tools
- **create_invoice** — Create a draft invoice with line items
- **list_invoices** — List invoices with optional status/client filter
- **get_invoice** — Get full invoice details by ID

### Financial Tools
- **get_revenue_report** — Revenue breakdown for a date range
- **get_profit_loss** — P&L report for a date range
- **record_transaction** — Record a financial transaction

### Portfolio Tools
- **list_portfolio** — List all gallery images from public/gallery/
- **get_services** — Full service catalog with pricing

## Setup

### 1. Install dependencies

```bash
cd mcp-server
npm install
```

### 2. Set environment variables

Create a `.env` file or set these in your shell:

```bash
# Firebase Admin (service account)
export FIREBASE_PROJECT_ID="inner-lightning-484702-r4"
export FIREBASE_CLIENT_EMAIL="your-service-account@project.iam.gserviceaccount.com"
export FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
export FIREBASE_DATABASE_ID="ai-studio-8499b0e1-24a0-4430-b8b8-946386504716"

# Gemini AI
export GEMINI_API_KEY="your-gemini-api-key"

# Stripe
export STRIPE_SECRET_KEY="sk_live_or_test_..."
```

### 3. Claude Code Integration

The MCP config is at `~/.claude/projects/-Users-TroubleshootGuest-xela-creative-branding-studio/.mcp.json`.

Restart Claude Code to pick up the new MCP server. The tools will appear automatically.

### 4. Run standalone (for testing)

```bash
cd mcp-server
npx tsx src/index.ts
```

## Architecture

- **Transport:** stdio (standard for Claude Code MCP servers)
- **Firebase:** Uses firebase-admin SDK with service account credentials
- **Gemini:** Uses @google/genai SDK (gemini-2.0-flash model)
- **Stripe:** Uses stripe SDK for payment operations
- **Schema validation:** zod for all tool input schemas

## Notes

- All monetary amounts are in **cents** (e.g., 9700 = $97.00)
- Encrypted client fields show "(encrypted)" — decryption requires client-side keys
- The portfolio tool reads directly from the filesystem (public/gallery/)
- Firebase credentials can fall back to Application Default Credentials if env vars are not set
