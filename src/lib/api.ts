import { Transaction, Category } from "../types";

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
