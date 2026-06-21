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
Crucially, also estimate a specific realistic carbon footprint (kg CO2) for EACH transaction based on the nature of the description or merchant, rather than using a flat category multiplier. For example, a flight will have a massive CO2 footprint compared to an auto-rickshaw ride, even if both are "Transport". Meat-heavy restaurants might have a higher footprint than a coffee shop, etc. Make an educated guess as the \`co2\` field.

Return a JSON array of objects where each object has these fields:
"id" (generate a unique string or use a reference number),
"date" (string representing the transaction date),
"description" (string, the merchant or narration),
"amount" (number, positive decimal value),
"category" (one of the exact categories above),
"co2" (number, the estimated kg CO2 for this specific transaction).

Output ONLY JSON array.`;

      const delay = (ms: number) => new Promise(res => setTimeout(res, ms));
      const callGenAIWithRetry = async (fn: () => Promise<any>, retries = 3): Promise<any> => {
        for (let i = 0; i < retries; i++) {
          try {
            return await fn();
          } catch (err: any) {
             if (i === retries - 1) throw err;
             if (err?.message?.includes("503") || err?.status === 503 || err?.status === "UNAVAILABLE") {
               const sleepTime = Math.pow(2, i) * 1000 + Math.random() * 1000;
               console.log(`Gemini API 503 Unavailable. Retrying in ${Math.round(sleepTime)}ms...`);
               await delay(sleepTime);
             } else {
               throw err;
             }
          }
        }
      };

      const response = await callGenAIWithRetry(() => ai.models.generateContent({
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
                co2: { type: Type.NUMBER },
              },
              required: ["id", "date", "description", "amount", "category", "co2"],
            },
          },
          temperature: 0.1,
        },
      }));

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
