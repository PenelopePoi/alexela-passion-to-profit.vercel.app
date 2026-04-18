#!/usr/bin/env node
/**
 * XELA Creative Branding Studio — MCP Server
 *
 * Exposes internal business operations as MCP tools for AI agents.
 * Runs on stdio transport for Claude Code integration.
 *
 * Environment variables:
 *   FIREBASE_PROJECT_ID          — Firebase project ID
 *   FIREBASE_CLIENT_EMAIL        — Service account email
 *   FIREBASE_PRIVATE_KEY         — Service account private key (newlines as \n)
 *   FIREBASE_DATABASE_ID         — Firestore database ID (optional, defaults to "(default)")
 *   GEMINI_API_KEY               — Google Gemini API key
 *   STRIPE_SECRET_KEY            — Stripe secret key
 */

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import * as admin from "firebase-admin";
import { GoogleGenAI } from "@google/genai";
import Stripe from "stripe";
import * as fs from "node:fs";
import * as path from "node:path";

// ─── Firebase Admin Init ────────────────────────────────────────────────────

let db: admin.firestore.Firestore;

function initFirebase(): void {
  if (admin.apps.length > 0) {
    db = admin.firestore();
    return;
  }

  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n");

  if (projectId && clientEmail && privateKey) {
    admin.initializeApp({
      credential: admin.credential.cert({ projectId, clientEmail, privateKey }),
    });
  } else {
    // Fall back to application default credentials
    admin.initializeApp({ projectId: projectId || "inner-lightning-484702-r4" });
  }

  const databaseId = process.env.FIREBASE_DATABASE_ID || "(default)";
  db = admin.firestore();
  if (databaseId !== "(default)") {
    db.settings({ databaseId } as any);
  }
}

// ─── Gemini Init ────────────────────────────────────────────────────────────

let genai: GoogleGenAI | null = null;

function getGenAI(): GoogleGenAI {
  if (!genai) {
    const key = process.env.GEMINI_API_KEY;
    if (!key) throw new Error("GEMINI_API_KEY environment variable is required");
    genai = new GoogleGenAI({ apiKey: key });
  }
  return genai;
}

// ─── Stripe Init ────────────────────────────────────────────────────────────

let stripe: Stripe | null = null;

function getStripe(): Stripe {
  if (!stripe) {
    const key = process.env.STRIPE_SECRET_KEY;
    if (!key) throw new Error("STRIPE_SECRET_KEY environment variable is required");
    stripe = new Stripe(key);
  }
  return stripe;
}

// ─── Helpers ────────────────────────────────────────────────────────────────

function safeParseJSON<T>(text: string | undefined, fallback: T): T {
  try {
    return JSON.parse(text || JSON.stringify(fallback));
  } catch {
    return fallback;
  }
}

function toISO(timestamp: admin.firestore.Timestamp | number | null | undefined): string | null {
  if (!timestamp) return null;
  if (typeof timestamp === "number") return new Date(timestamp).toISOString();
  if (timestamp instanceof admin.firestore.Timestamp) return timestamp.toDate().toISOString();
  return null;
}

// ─── Service Catalog ────────────────────────────────────────────────────────

const SERVICE_CATALOG = {
  brandingPackages: [
    {
      tier: "Budget",
      name: "Starter Brand Package",
      price: "$97",
      deliverables: [
        "Business name consultation",
        "3 tagline options",
        "Color palette",
        "Typography recommendation",
        "Brand voice guide",
        "1 social media post idea",
      ],
      timeline: "24-48 hours",
    },
    {
      tier: "Premium",
      name: "Professional Brand Package",
      price: "$497",
      deliverables: [
        "Everything in Starter",
        "Full brand strategy document",
        "5 logo concepts",
        "Business card design",
        "Social media kit (5 posts)",
        "30-day content calendar",
        "Email templates (3)",
        "Competitor analysis",
        "Brand guidelines PDF",
      ],
      timeline: "3-5 business days",
    },
    {
      tier: "Elite",
      name: "Elite Brand Package",
      price: "$1,497-$2,000",
      deliverables: [
        "Everything in Professional",
        "10 logo concepts with revisions",
        "Full print suite (cards, flyers, door hangers)",
        "60-day content calendar",
        "Email sequence (6 templates)",
        "Social media kit (15 posts)",
        "Brand voice analysis",
        "SEO keyword research",
        "Google Business Profile setup",
        "QR code assets",
        "Brand story narrative",
        "Flyer & classified ad copy",
      ],
      timeline: "5-10 business days",
    },
  ],
  seoServices: [
    { name: "Google Stack Setup", price: "$99-$399", description: "Google entity stack for local SEO authority" },
    { name: "SEO Retainer - Starter", price: "$149/month", description: "Monthly SEO maintenance and reporting" },
    { name: "SEO Retainer - Growth", price: "$299/month", description: "Full SEO management with content creation" },
  ],
  monthlyRetainers: [
    { name: "Social Media Management", price: "$99-$199/month", description: "Content creation and scheduling" },
    { name: "Brand Maintenance", price: "$199-$399/month", description: "Ongoing brand updates, new assets, consulting" },
  ],
  audioBranding: [
    { name: "Audio Logo", price: "$49", description: "3-5 second sonic brand identity" },
    { name: "Jingle Package", price: "$99", description: "Full jingle with variations for ads, socials, phone" },
    { name: "Full Sonic Identity", price: "$149", description: "Audio logo + jingle + hold music + social clips" },
  ],
  consulting: [
    { name: "Brand Strategy Session", price: "$199/session", description: "60-minute deep dive on brand direction" },
    { name: "Marketing Audit", price: "$299/session", description: "Full audit of current marketing with action plan" },
  ],
  printDesign: [
    { name: "Business Card Design", price: "$25-$75", description: "Professional business card with print-ready files" },
    { name: "Flyer Design", price: "$50-$150", description: "Marketing flyer, single or double-sided" },
    { name: "Door Hanger Design", price: "$50-$100", description: "Door hanger for local marketing" },
  ],
};

// ─── MCP Server ─────────────────────────────────────────────────────────────

const server = new McpServer({
  name: "xela-studio",
  version: "1.0.0",
});

// ═══════════════════════════════════════════════════════════════════════════
// BRAND TOOLS
// ═══════════════════════════════════════════════════════════════════════════

server.tool(
  "generate_brand_strategy",
  "Generate a comprehensive brand strategy using Gemini AI. Returns taglines, mission/vision statements, color palette, typography, social media ideas, brand story, and more.",
  {
    companyName: z.string().describe("The company/business name"),
    industry: z.string().describe("Industry or business type (e.g., 'Bakery', 'Tech Startup', 'Tree Service')"),
    vibe: z.string().describe("Brand vibe/aesthetic (e.g., 'Modern', 'Rustic', 'Luxury', 'Playful')"),
    location: z.string().describe("Business location (e.g., 'Melbourne, FL')"),
    audience: z.string().describe("Target audience description"),
    additionalNotes: z.string().optional().describe("Any additional context or preferences"),
  },
  async ({ companyName, industry, vibe, location, audience, additionalNotes }) => {
    try {
      const ai = getGenAI();
      const prompt = `Create a comprehensive brand strategy for:
Company: ${companyName}
Industry: ${industry}
Vibe: ${vibe}
Location: ${location}
Target Audience: ${audience}
Additional Notes: ${additionalNotes || "N/A"}

Return a JSON object with these fields:
{
  "taglines": ["5 tagline options"],
  "missionStatement": "1-2 sentence mission",
  "visionStatement": "1-2 sentence vision",
  "brandVoice": "Description of brand voice and tone",
  "colorPalette": {
    "primary": "#hex",
    "secondary": "#hex",
    "accent": "#hex",
    "background": "#hex",
    "explanation": "Why these colors work"
  },
  "typographyRecommendation": {
    "headingFont": "Font name",
    "bodyFont": "Font name",
    "reasoning": "Why these fonts"
  },
  "socialMediaPostIdeas": [
    {"platform": "Instagram", "caption": "...", "visualIdea": "..."},
    {"platform": "Facebook", "caption": "...", "visualIdea": "..."},
    {"platform": "TikTok", "caption": "...", "visualIdea": "..."}
  ],
  "brandStory": "2-3 paragraph brand narrative",
  "flyerCopy": {
    "headline": "...",
    "hook": "...",
    "callToAction": "..."
  },
  "classifiedAdCopy": {
    "title": "...",
    "body": "..."
  }
}`;

      const response = await ai.models.generateContent({
        model: "gemini-2.0-flash",
        contents: prompt,
        config: { responseMimeType: "application/json" },
      });

      const strategy = safeParseJSON(response.text, null);
      if (!strategy) {
        return { content: [{ type: "text" as const, text: "Failed to parse brand strategy from Gemini. Raw response: " + (response.text || "(empty)") }] };
      }

      return {
        content: [{ type: "text" as const, text: JSON.stringify(strategy, null, 2) }],
      };
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      return { content: [{ type: "text" as const, text: `Error generating brand strategy: ${msg}` }], isError: true };
    }
  }
);

server.tool(
  "generate_business_names",
  "Generate 10 creative business name suggestions using Gemini AI based on industry, vibe, and location.",
  {
    industry: z.string().describe("Industry or business type"),
    vibe: z.string().describe("Brand vibe/aesthetic"),
    location: z.string().describe("Business location"),
    keywords: z.string().optional().describe("Optional keywords to incorporate"),
  },
  async ({ industry, vibe, location, keywords }) => {
    try {
      const ai = getGenAI();
      const prompt = `Brainstorm 10 creative, memorable, and available-sounding business names for a new company.
Industry: ${industry}
Vibe: ${vibe}
Location: ${location}
Keywords: ${keywords || "N/A"}

Return ONLY a JSON array of strings.`;

      const response = await ai.models.generateContent({
        model: "gemini-2.0-flash",
        contents: prompt,
        config: { responseMimeType: "application/json" },
      });

      const names = safeParseJSON<string[]>(response.text, []);
      return {
        content: [{ type: "text" as const, text: JSON.stringify(names, null, 2) }],
      };
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      return { content: [{ type: "text" as const, text: `Error generating names: ${msg}` }], isError: true };
    }
  }
);

server.tool(
  "generate_logo_concepts",
  "Generate detailed logo concept descriptions using Gemini AI. Returns text descriptions that can be used as prompts for image generation.",
  {
    companyName: z.string().describe("The company name"),
    industry: z.string().describe("Industry or business type"),
    vibe: z.string().describe("Brand vibe/aesthetic"),
    colorPreferences: z.string().optional().describe("Preferred colors or palette"),
    additionalNotes: z.string().optional().describe("Any additional context"),
  },
  async ({ companyName, industry, vibe, colorPreferences, additionalNotes }) => {
    try {
      const ai = getGenAI();
      const prompt = `Create 5 detailed logo concept descriptions for:
Company: ${companyName}
Industry: ${industry}
Vibe: ${vibe}
Color Preferences: ${colorPreferences || "Open to suggestions"}
Notes: ${additionalNotes || "N/A"}

For each concept, return a JSON array of objects with:
{
  "conceptName": "Name of the concept",
  "description": "Detailed visual description of the logo",
  "style": "Minimalist/Emblem/Wordmark/Lettermark/Abstract/Mascot",
  "colors": ["#hex1", "#hex2"],
  "imagePrompt": "A detailed prompt that could be used with an AI image generator to create this logo",
  "reasoning": "Why this concept works for the brand"
}`;

      const response = await ai.models.generateContent({
        model: "gemini-2.0-flash",
        contents: prompt,
        config: { responseMimeType: "application/json" },
      });

      const concepts = safeParseJSON(response.text, []);
      return {
        content: [{ type: "text" as const, text: JSON.stringify(concepts, null, 2) }],
      };
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      return { content: [{ type: "text" as const, text: `Error generating logo concepts: ${msg}` }], isError: true };
    }
  }
);

// ═══════════════════════════════════════════════════════════════════════════
// CLIENT / CRM TOOLS
// ═══════════════════════════════════════════════════════════════════════════

server.tool(
  "list_clients",
  "List all clients from the CRM. Returns client contacts with name, email, company, status, and revenue data.",
  {
    status: z.enum(["lead", "prospect", "active", "inactive", "vip", "churned", "all"]).optional().describe("Filter by client status"),
    search: z.string().optional().describe("Search by name, company, or email"),
  },
  async ({ status, search }) => {
    try {
      const clientsRef = db.collection("crm_clients");
      const snapshot = await clientsRef.get();
      let clients = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

      if (status && status !== "all") {
        clients = clients.filter((c: any) => c.status === status);
      }
      if (search) {
        const s = search.toLowerCase();
        clients = clients.filter((c: any) =>
          (c.firstName || "").toLowerCase().includes(s) ||
          (c.lastName || "").toLowerCase().includes(s) ||
          (c.companyName || "").toLowerCase().includes(s) ||
          (c.email || "").toLowerCase().includes(s)
        );
      }

      const result = clients.map((c: any) => ({
        id: c.id,
        name: `${c.firstName || ""} ${c.lastName || ""}`.trim(),
        companyName: c.companyName || "",
        email: c.encrypted ? "(encrypted)" : c.email || "",
        phone: c.encrypted ? "(encrypted)" : c.phone || "",
        status: c.status || "unknown",
        totalRevenue: c.totalRevenue || 0,
        tags: c.tags || [],
        createdAt: toISO(c.createdAt),
      }));

      return {
        content: [{ type: "text" as const, text: JSON.stringify({ count: result.length, clients: result }, null, 2) }],
      };
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      return { content: [{ type: "text" as const, text: `Error listing clients: ${msg}` }], isError: true };
    }
  }
);

server.tool(
  "get_client",
  "Get detailed information about a specific client by their ID.",
  {
    clientId: z.string().describe("The client's document ID"),
  },
  async ({ clientId }) => {
    try {
      const doc = await db.collection("crm_clients").doc(clientId).get();
      if (!doc.exists) {
        return { content: [{ type: "text" as const, text: `Client ${clientId} not found.` }], isError: true };
      }

      const data = doc.data()!;
      const client = {
        id: doc.id,
        name: `${data.firstName || ""} ${data.lastName || ""}`.trim(),
        companyName: data.companyName || "",
        email: data.encrypted ? "(encrypted)" : data.email || "",
        phone: data.encrypted ? "(encrypted)" : data.phone || "",
        status: data.status || "unknown",
        source: data.source || "",
        totalRevenue: data.totalRevenue || 0,
        tags: data.tags || [],
        notes: data.encrypted ? "(encrypted)" : data.notes || "",
        lastContactedAt: toISO(data.lastContactedAt),
        nextFollowUp: toISO(data.nextFollowUp),
        createdAt: toISO(data.createdAt),
        updatedAt: toISO(data.updatedAt),
      };

      return {
        content: [{ type: "text" as const, text: JSON.stringify(client, null, 2) }],
      };
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      return { content: [{ type: "text" as const, text: `Error getting client: ${msg}` }], isError: true };
    }
  }
);

server.tool(
  "create_client",
  "Create a new client record in the CRM.",
  {
    firstName: z.string().describe("Client's first name"),
    lastName: z.string().describe("Client's last name"),
    companyName: z.string().describe("Client's company/business name"),
    email: z.string().describe("Client's email address"),
    phone: z.string().optional().describe("Client's phone number"),
    source: z.enum(["website", "referral", "social_media", "cold_outreach", "google", "walk_in", "other"]).optional().describe("How the client found us"),
    status: z.enum(["lead", "prospect", "active"]).optional().describe("Initial client status (defaults to 'lead')"),
    notes: z.string().optional().describe("Initial notes about the client"),
    tags: z.array(z.string()).optional().describe("Tags for categorization"),
  },
  async ({ firstName, lastName, companyName, email, phone, source, status, notes, tags }) => {
    try {
      const id = db.collection("crm_clients").doc().id;
      const now = Date.now();

      const clientData = {
        id,
        firstName,
        lastName,
        companyName,
        email,
        phone: phone || "",
        source: source || "other",
        status: status || "lead",
        notes: notes || "",
        tags: tags || [],
        totalRevenue: 0,
        encrypted: false,
        createdAt: now,
        updatedAt: now,
        lastContactedAt: null,
        nextFollowUp: null,
        address: "",
        socialLinks: {},
      };

      await db.collection("crm_clients").doc(id).set(clientData);

      return {
        content: [{ type: "text" as const, text: JSON.stringify({ success: true, clientId: id, client: clientData }, null, 2) }],
      };
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      return { content: [{ type: "text" as const, text: `Error creating client: ${msg}` }], isError: true };
    }
  }
);

// ═══════════════════════════════════════════════════════════════════════════
// INVOICE TOOLS
// ═══════════════════════════════════════════════════════════════════════════

server.tool(
  "create_invoice",
  "Create a new invoice for a client. Amounts are in cents (e.g., 9700 = $97.00).",
  {
    clientId: z.string().describe("Client ID from the CRM"),
    clientName: z.string().describe("Client's display name"),
    clientEmail: z.string().describe("Client's email for sending invoice"),
    lineItems: z.array(z.object({
      description: z.string().describe("Line item description"),
      quantity: z.number().describe("Quantity"),
      unitPrice: z.number().describe("Unit price in cents"),
      taxRate: z.number().optional().describe("Tax rate as percentage (e.g., 7 for 7%)"),
    })).describe("Invoice line items"),
    dueDate: z.string().optional().describe("Due date as ISO string (defaults to Net 30)"),
    notes: z.string().optional().describe("Notes to include on the invoice"),
    terms: z.string().optional().describe("Payment terms"),
  },
  async ({ clientId, clientName, clientEmail, lineItems, dueDate, notes, terms }) => {
    try {
      const id = db.collection("invoices").doc().id;
      const now = Date.now();
      const dueDateMs = dueDate ? new Date(dueDate).getTime() : now + 30 * 24 * 60 * 60 * 1000;

      const items = lineItems.map((item) => ({
        ...item,
        taxRate: item.taxRate || 0,
        total: Math.round(item.quantity * item.unitPrice * (1 + (item.taxRate || 0) / 100)),
      }));

      const subtotal = items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
      const taxTotal = items.reduce((sum, item) => sum + Math.round(item.quantity * item.unitPrice * (item.taxRate / 100)), 0);
      const total = subtotal + taxTotal;

      const invoiceNumber = `XELA-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 9999)).padStart(4, "0")}`;

      const invoiceData = {
        id,
        invoiceNumber,
        clientId,
        clientName,
        clientEmail,
        clientAddress: null,
        lineItems: items,
        subtotal,
        taxTotal,
        total,
        amountPaid: 0,
        amountDue: total,
        status: "draft",
        dueDate: admin.firestore.Timestamp.fromMillis(dueDateMs),
        issuedDate: admin.firestore.Timestamp.fromMillis(now),
        paidDate: null,
        paymentMethod: null,
        stripeInvoiceId: null,
        notes: notes || null,
        terms: terms || "Net 30. Payment due upon receipt of invoice.",
        createdAt: admin.firestore.Timestamp.fromMillis(now),
        updatedAt: admin.firestore.Timestamp.fromMillis(now),
      };

      await db.collection("invoices").doc(id).set(invoiceData);

      return {
        content: [{
          type: "text" as const,
          text: JSON.stringify({
            success: true,
            invoiceId: id,
            invoiceNumber,
            total: `$${(total / 100).toFixed(2)}`,
            status: "draft",
            dueDate: new Date(dueDateMs).toISOString(),
          }, null, 2),
        }],
      };
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      return { content: [{ type: "text" as const, text: `Error creating invoice: ${msg}` }], isError: true };
    }
  }
);

server.tool(
  "list_invoices",
  "List invoices with optional status filter.",
  {
    status: z.enum(["draft", "sent", "viewed", "paid", "partially_paid", "overdue", "cancelled", "all"]).optional().describe("Filter by invoice status"),
    clientId: z.string().optional().describe("Filter by client ID"),
  },
  async ({ status, clientId }) => {
    try {
      let ref: admin.firestore.Query = db.collection("invoices");

      if (status && status !== "all") {
        ref = ref.where("status", "==", status);
      }
      if (clientId) {
        ref = ref.where("clientId", "==", clientId);
      }

      const snapshot = await ref.get();
      const invoices = snapshot.docs.map((doc) => {
        const d = doc.data();
        return {
          id: doc.id,
          invoiceNumber: d.invoiceNumber,
          clientName: d.clientName,
          clientEmail: d.clientEmail,
          total: d.total,
          totalFormatted: `$${((d.total || 0) / 100).toFixed(2)}`,
          amountPaid: d.amountPaid,
          amountDue: d.amountDue,
          amountDueFormatted: `$${((d.amountDue || 0) / 100).toFixed(2)}`,
          status: d.status,
          dueDate: toISO(d.dueDate),
          issuedDate: toISO(d.issuedDate),
          paidDate: toISO(d.paidDate),
        };
      });

      return {
        content: [{ type: "text" as const, text: JSON.stringify({ count: invoices.length, invoices }, null, 2) }],
      };
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      return { content: [{ type: "text" as const, text: `Error listing invoices: ${msg}` }], isError: true };
    }
  }
);

server.tool(
  "get_invoice",
  "Get detailed information about a specific invoice.",
  {
    invoiceId: z.string().describe("The invoice document ID"),
  },
  async ({ invoiceId }) => {
    try {
      const doc = await db.collection("invoices").doc(invoiceId).get();
      if (!doc.exists) {
        return { content: [{ type: "text" as const, text: `Invoice ${invoiceId} not found.` }], isError: true };
      }

      const d = doc.data()!;
      const invoice = {
        id: doc.id,
        invoiceNumber: d.invoiceNumber,
        clientId: d.clientId,
        clientName: d.clientName,
        clientEmail: d.clientEmail,
        clientAddress: d.clientAddress,
        lineItems: d.lineItems,
        subtotal: d.subtotal,
        subtotalFormatted: `$${((d.subtotal || 0) / 100).toFixed(2)}`,
        taxTotal: d.taxTotal,
        total: d.total,
        totalFormatted: `$${((d.total || 0) / 100).toFixed(2)}`,
        amountPaid: d.amountPaid,
        amountDue: d.amountDue,
        amountDueFormatted: `$${((d.amountDue || 0) / 100).toFixed(2)}`,
        status: d.status,
        dueDate: toISO(d.dueDate),
        issuedDate: toISO(d.issuedDate),
        paidDate: toISO(d.paidDate),
        paymentMethod: d.paymentMethod,
        stripeInvoiceId: d.stripeInvoiceId,
        notes: d.notes,
        terms: d.terms,
        createdAt: toISO(d.createdAt),
        updatedAt: toISO(d.updatedAt),
      };

      return {
        content: [{ type: "text" as const, text: JSON.stringify(invoice, null, 2) }],
      };
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      return { content: [{ type: "text" as const, text: `Error getting invoice: ${msg}` }], isError: true };
    }
  }
);

// ═══════════════════════════════════════════════════════════════════════════
// FINANCIAL TOOLS
// ═══════════════════════════════════════════════════════════════════════════

server.tool(
  "get_revenue_report",
  "Get a revenue breakdown for a date range. Shows total revenue, breakdown by source, and transaction details.",
  {
    startDate: z.string().describe("Start date as ISO string (e.g., '2026-01-01')"),
    endDate: z.string().describe("End date as ISO string (e.g., '2026-04-13')"),
  },
  async ({ startDate, endDate }) => {
    try {
      const startMs = new Date(startDate).getTime();
      const endMs = new Date(endDate).getTime();

      if (startMs >= endMs) {
        return { content: [{ type: "text" as const, text: "Start date must be before end date." }], isError: true };
      }

      const txRef = db.collection("transactions");
      const snapshot = await txRef
        .where("type", "==", "revenue")
        .where("createdAt", ">=", admin.firestore.Timestamp.fromMillis(startMs))
        .where("createdAt", "<=", admin.firestore.Timestamp.fromMillis(endMs))
        .get();

      const transactions = snapshot.docs.map((doc) => doc.data());
      const totalRevenue = transactions.reduce((sum, tx) => sum + (tx.amount || 0), 0);

      // Group by category/description
      const breakdown: Record<string, number> = {};
      for (const tx of transactions) {
        const key = tx.category || tx.description || "Uncategorized";
        breakdown[key] = (breakdown[key] || 0) + (tx.amount || 0);
      }

      return {
        content: [{
          type: "text" as const,
          text: JSON.stringify({
            period: { startDate, endDate },
            totalRevenue,
            totalRevenueFormatted: `$${(totalRevenue / 100).toFixed(2)}`,
            transactionCount: transactions.length,
            breakdown: Object.entries(breakdown).map(([category, amount]) => ({
              category,
              amount,
              formatted: `$${(amount / 100).toFixed(2)}`,
            })),
          }, null, 2),
        }],
      };
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      return { content: [{ type: "text" as const, text: `Error getting revenue report: ${msg}` }], isError: true };
    }
  }
);

server.tool(
  "get_profit_loss",
  "Get a profit and loss report for a date range. Shows revenue, expenses, and net profit.",
  {
    startDate: z.string().describe("Start date as ISO string"),
    endDate: z.string().describe("End date as ISO string"),
  },
  async ({ startDate, endDate }) => {
    try {
      const startMs = new Date(startDate).getTime();
      const endMs = new Date(endDate).getTime();

      if (startMs >= endMs) {
        return { content: [{ type: "text" as const, text: "Start date must be before end date." }], isError: true };
      }

      const txRef = db.collection("transactions");
      const snapshot = await txRef
        .where("createdAt", ">=", admin.firestore.Timestamp.fromMillis(startMs))
        .where("createdAt", "<=", admin.firestore.Timestamp.fromMillis(endMs))
        .get();

      const transactions = snapshot.docs.map((doc) => doc.data());

      let totalRevenue = 0;
      let totalExpenses = 0;
      let totalRefunds = 0;
      const revenueByCategory: Record<string, number> = {};
      const expenseByCategory: Record<string, number> = {};

      for (const tx of transactions) {
        const amount = tx.amount || 0;
        const category = tx.category || tx.description || "Uncategorized";

        switch (tx.type) {
          case "revenue":
            totalRevenue += amount;
            revenueByCategory[category] = (revenueByCategory[category] || 0) + amount;
            break;
          case "expense":
            totalExpenses += amount;
            expenseByCategory[category] = (expenseByCategory[category] || 0) + amount;
            break;
          case "refund":
            totalRefunds += amount;
            break;
        }
      }

      const netProfit = totalRevenue - totalExpenses - totalRefunds;
      const profitMargin = totalRevenue > 0 ? ((netProfit / totalRevenue) * 100).toFixed(1) : "0.0";

      return {
        content: [{
          type: "text" as const,
          text: JSON.stringify({
            period: { startDate, endDate },
            revenue: {
              total: totalRevenue,
              formatted: `$${(totalRevenue / 100).toFixed(2)}`,
              breakdown: Object.entries(revenueByCategory).map(([cat, amt]) => ({
                category: cat,
                amount: amt,
                formatted: `$${(amt / 100).toFixed(2)}`,
              })),
            },
            expenses: {
              total: totalExpenses,
              formatted: `$${(totalExpenses / 100).toFixed(2)}`,
              breakdown: Object.entries(expenseByCategory).map(([cat, amt]) => ({
                category: cat,
                amount: amt,
                formatted: `$${(amt / 100).toFixed(2)}`,
              })),
            },
            refunds: { total: totalRefunds, formatted: `$${(totalRefunds / 100).toFixed(2)}` },
            netProfit,
            netProfitFormatted: `$${(netProfit / 100).toFixed(2)}`,
            profitMargin: `${profitMargin}%`,
          }, null, 2),
        }],
      };
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      return { content: [{ type: "text" as const, text: `Error getting P&L report: ${msg}` }], isError: true };
    }
  }
);

server.tool(
  "record_transaction",
  "Record a financial transaction. Amounts in cents (e.g., 9700 = $97.00).",
  {
    type: z.enum(["revenue", "expense", "refund", "tax_payment", "transfer", "adjustment"]).describe("Transaction type"),
    amount: z.number().describe("Amount in cents (always positive)"),
    description: z.string().describe("Transaction description"),
    clientId: z.string().optional().describe("Associated client ID (if applicable)"),
    category: z.string().optional().describe("Category (e.g., 'branding_package', 'software', 'advertising')"),
    metadata: z.record(z.string()).optional().describe("Additional key-value metadata"),
  },
  async ({ type, amount, description, clientId, category, metadata }) => {
    try {
      if (amount <= 0) {
        return { content: [{ type: "text" as const, text: "Amount must be positive (in cents)." }], isError: true };
      }

      const id = db.collection("transactions").doc().id;
      const now = admin.firestore.Timestamp.now();

      const txData = {
        id,
        type,
        amount,
        currency: "usd",
        description: description.trim(),
        clientId: clientId || null,
        invoiceId: null,
        stripePaymentIntentId: null,
        paymentMethod: null,
        category: category || null,
        metadata: metadata || {},
        createdAt: now,
        updatedAt: now,
      };

      await db.collection("transactions").doc(id).set(txData);

      return {
        content: [{
          type: "text" as const,
          text: JSON.stringify({
            success: true,
            transactionId: id,
            type,
            amount,
            amountFormatted: `$${(amount / 100).toFixed(2)}`,
            description,
          }, null, 2),
        }],
      };
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      return { content: [{ type: "text" as const, text: `Error recording transaction: ${msg}` }], isError: true };
    }
  }
);

// ═══════════════════════════════════════════════════════════════════════════
// PORTFOLIO TOOLS
// ═══════════════════════════════════════════════════════════════════════════

server.tool(
  "list_portfolio",
  "List all portfolio gallery images from the public gallery directory. Returns filenames of all work samples.",
  {},
  async () => {
    try {
      const galleryDir = path.resolve(
        process.env.XELA_PROJECT_ROOT || path.join(process.cwd()),
        "public/gallery"
      );

      if (!fs.existsSync(galleryDir)) {
        return {
          content: [{
            type: "text" as const,
            text: JSON.stringify({ count: 0, images: [], note: "Gallery directory not found at " + galleryDir }, null, 2),
          }],
        };
      }

      const files = fs.readdirSync(galleryDir).filter((f) =>
        /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(f)
      );

      const images = files.map((filename) => {
        const stats = fs.statSync(path.join(galleryDir, filename));
        return {
          filename,
          path: `/gallery/${filename}`,
          sizeKB: Math.round(stats.size / 1024),
          modified: stats.mtime.toISOString(),
          category: filename.startsWith("before-") ? "before" : filename.startsWith("work-") ? "work" : "other",
        };
      });

      return {
        content: [{
          type: "text" as const,
          text: JSON.stringify({
            count: images.length,
            categories: {
              work: images.filter((i) => i.category === "work").length,
              before: images.filter((i) => i.category === "before").length,
              other: images.filter((i) => i.category === "other").length,
            },
            images,
          }, null, 2),
        }],
      };
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      return { content: [{ type: "text" as const, text: `Error listing portfolio: ${msg}` }], isError: true };
    }
  }
);

server.tool(
  "get_services",
  "Get the complete XELA Creative Branding Studio service catalog with pricing for all tiers and categories.",
  {},
  async () => {
    return {
      content: [{
        type: "text" as const,
        text: JSON.stringify({
          studio: "XELA Creative Branding Studio",
          location: "Brevard County / Space Coast, Florida",
          phone: "(321) 375-9685",
          tagline: "We are your marketing team. Digital, print, everything.",
          services: SERVICE_CATALOG,
        }, null, 2),
      }],
    };
  }
);

// ═══════════════════════════════════════════════════════════════════════════
// START SERVER
// ═══════════════════════════════════════════════════════════════════════════

async function main() {
  try {
    initFirebase();
  } catch (err) {
    // Firebase init may fail without credentials — tools that need it will error individually
    console.error("Firebase init warning:", err instanceof Error ? err.message : err);
  }

  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("XELA Creative Branding Studio MCP server running on stdio");
}

main().catch((err) => {
  console.error("Fatal error starting MCP server:", err);
  process.exit(1);
});
