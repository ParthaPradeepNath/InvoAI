import { google } from "@ai-sdk/google";
import { generateObject } from "ai";
import { z } from "zod";
import { protect } from "../middlewares/auth.js";
import { Router } from "express";

const router = Router();

router.use(protect);

const itemSchema = z.object({
  description: z.string(),
  quantity: z.number().positive(),
  unitPrice: z.number().nonnegative(),
});

const invoiceSchema = z.object({
  clientName: z.string(),
  clientEmail: z.string().email(),
  clientAddress: z.string().optional(),
  currency: z.string().default("USD"),
  items: z.array(itemSchema).min(1),
  notes: z.string().optional(),
});

async function requireModel(req, res) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    res.status(503).json({
      success: false,
      message:
        "Gemini API key not configured. Set GEMINI_API_KEY in the backend .env to enable AI features.",
    });
    return null;
  }
  return google("gemini-1.5-flash", { apiKey });
}

router.post("/generate", async (req, res) => {
  try {
    const { promptItems } = req.body || {};
    if (!promptItems || !promptItems.length) {
      return res
        .status(400)
        .json({ success: false, message: "No line items provided to describe" });
    }

    const model = await requireModel(req, res);
    if (!model) return;

    const result = await generateObject({
      model,
      schema: z.object({
        items: z.array(
          z.object({
            original: z.string(),
            description: z.string(),
            quantity: z.number().nonnegative(),
            unitPrice: z.number().nonnegative(),
          }),
        ),
      }),
      prompt: `You are an invoicing assistant. For each raw line item provided, produce a professional, concise item description suitable for an invoice, and infer a reasonable quantity and unit price if not obvious. Return one entry per input item preserving order.

Line items:
${promptItems.map((p, i) => `${i + 1}. ${p}`).join("\n")}

Rules:
- description should be 2 to 8 words, professional and clear.
- quantity defaults to 1 if not clear.
- unitPrice should be a sensible estimated price in the given currency; use 0 if truly unknown.`,
    });

    return res.json({ success: true, items: result.object.items });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: "AI generation failed" });
  }
});

router.post("/draft", async (req, res) => {
  try {
    const { text, currency = "USD" } = req.body || {};
    if (!text || !text.trim()) {
      return res.status(400).json({ success: false, message: "Description text is required" });
    }

    const model = await requireModel(req, res);
    if (!model) return;

    const result = await generateObject({
      model,
      schema: z.object({
        clientName: z.string(),
        clientEmail: z.string().email(),
        clientAddress: z.string().optional(),
        notes: z.string().optional(),
        items: z.array(
          z.object({
            description: z.string(),
            quantity: z.number().positive(),
            unitPrice: z.number().nonnegative(),
          }),
        ),
      }),
      prompt: `Extract invoice information from the following free-text description. Infer a client name, email, address, line items (with quantity and unit price), and any notes. Use currency ${currency}. If something is missing, make a reasonable placeholder.

Text:
${text}`,
    });

    return res.json({ success: true, draft: { ...result.object, currency } });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: "AI draft generation failed" });
  }
});

export default router;
