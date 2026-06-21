import { Transaction, Category } from "../types";

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

  const categoryMappings: { id: string; category: Category; co2?: number }[] = await res.json();
  const catMap = new Map(categoryMappings.map(item => [item.id, item.category]));
  const co2Map = new Map(categoryMappings.map(item => [item.id, item.co2 || 0]));

  return raw.map(t => {
    // Default to 'Others' if AI didn't catch it
    const cat = catMap.get(t.id) || "Others";
    return {
      ...t,
      category: cat,
      // Fallback co2 calculation removed since we expect it from API, but we'll use 0 if categorization fails
      co2: co2Map.get(t.id) || 0
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
       co2: t.co2 || 0
     }
  });
}
