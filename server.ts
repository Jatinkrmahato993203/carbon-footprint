import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Middleware to parse JSON bodies
  app.use(express.json({ limit: "50mb" }));

  // API constraints & logic
  app.post("/api/categorize", async (req, res) => {
    try {
      const { transactions } = req.body;
      if (!transactions || !Array.isArray(transactions)) {
        return res.status(400).json({ error: "Invalid transactions payload" });
      }

      // We ask Gemini to categorize an array of transactions.
      const prompt = `You are a financial and environmental data categorization AI for the "Chhaya" platform in India.
Your task is to take a batch of transaction descriptions and amounts from an Indian UPI/Bank statement, and classify each into one of the following exact categories:
- "Food & Dining"
- "Transport"
- "Shopping & E-commerce"
- "Utilities & Bills"
- "Groceries"
- "Others"

Try to identify the merchant from typical Indian payment gateways/vendors (e.g. Swiggy, Zomato, Uber, Ola, Bescom, Amazon, Flipkart, Blinkit, Zepto, Paytm).
Return a JSON array where each object has these fields:
"id" (exact string from input),
"category" (one of the exact categories above).

Input Transactions:
${JSON.stringify(
  transactions.map((t) => ({ id: t.id, description: t.description, amount: t.amount })),
  null,
  2
)}`;

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                id: { type: Type.STRING },
                category: { type: Type.STRING },
              },
              required: ["id", "category"],
            },
          },
          temperature: 0.1,
        },
      });

      const text = response.text;
      if (!text) throw new Error("Empty response from AI");

      const parsed = JSON.parse(text);
      res.json(parsed);
    } catch (error: any) {
      console.error("AI Request Failed:", error);
      res.status(500).json({ error: "Failed to categorize transactions" });
    }
  });

  app.post("/api/process-pdf", async (req, res) => {
    try {
      const { pdfBase64 } = req.body;
      if (!pdfBase64) {
        return res.status(400).json({ error: "Missing pdf base64 data" });
      }

      const prompt = `You are a financial and environmental data categorization AI for the "Chhaya" platform in India.
Your task is to extract all the transaction debits (withdrawals) from the provided bank statement PDF.
Ignore credits/deposits.
For each transaction, classify it into one of the following exact categories:
- "Food & Dining"
- "Transport"
- "Shopping & E-commerce"
- "Utilities & Bills"
- "Groceries"
- "Others"

Try to identify the merchant from typical Indian payment gateways/vendors (e.g. Swiggy, Zomato, Uber, Ola, Bescom, Amazon, Flipkart, Blinkit, Zepto, Paytm).
Return a JSON array of objects where each object has these fields:
"id" (generate a unique string or use a reference number),
"date" (string representing the transaction date),
"description" (string, the merchant or narration),
"amount" (number, positive decimal value),
"category" (one of the exact categories above).

Output ONLY JSON array.`;

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: [
          {
            role: "user",
            parts: [
              { text: prompt },
              {
                inlineData: {
                  data: pdfBase64,
                  mimeType: "application/pdf"
                }
              }
            ]
          }
        ],
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                id: { type: Type.STRING },
                date: { type: Type.STRING },
                description: { type: Type.STRING },
                amount: { type: Type.NUMBER },
                category: { type: Type.STRING },
              },
              required: ["id", "date", "description", "amount", "category"],
            },
          },
          temperature: 0.1,
        },
      });

      const text = response.text;
      if (!text) throw new Error("Empty response from AI");

      const parsed = JSON.parse(text);
      res.json(parsed);
    } catch (error: any) {
      console.error("AI Request Failed:", error);
      res.status(500).json({ error: "Failed to categorize PDF transactions" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer();
