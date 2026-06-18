import { Transaction, Category, EMISSION_FACTORS } from "../types";

export async function processTransactions(raw: Transaction[]): Promise<Transaction[]> {
  // Batch up the requests to AI
  const res = await fetch("/api/categorize", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ transactions: raw }),
  });

  if (!res.ok) {
    throw new Error("Classification failed");
  }

  const categoryMappings: { id: string; category: Category }[] = await res.json();
  const map = new Map(categoryMappings.map(item => [item.id, item.category]));

  return raw.map(t => {
    // Default to 'Others' if AI didn't catch it
    const cat = map.get(t.id) || "Others";
    return {
      ...t,
      category: cat,
      co2: Number((t.amount * (EMISSION_FACTORS[cat] || EMISSION_FACTORS["Others"])).toFixed(2))
    };
  });
}

export async function processPdfTransaction(file: File): Promise<Transaction[]> {
  const base64 = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
  });

  const base64Data = base64.split(",")[1];

  const res = await fetch("/api/process-pdf", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ pdfBase64: base64Data }),
  });

  if (!res.ok) {
    throw new Error("PDF processing failed");
  }

  const transactions: Transaction[] = await res.json();
  
  return transactions.map(t => {
     const cat = t.category || "Others";
     return {
       ...t,
       id: t.id || crypto.randomUUID(),
       category: cat,
       co2: Number((t.amount * (EMISSION_FACTORS[cat] || EMISSION_FACTORS["Others"])).toFixed(2))
     }
  });
}
