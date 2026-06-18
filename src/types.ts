export type Category = 
  | "Food & Dining"
  | "Transport"
  | "Shopping & E-commerce"
  | "Utilities & Bills"
  | "Groceries"
  | "Others";

export interface Transaction {
  id: string; // unique string id
  date: string;
  description: string;
  amount: number;
  category?: Category;
  co2?: number; // computed kg CO2 footprint
}

export interface EmissionFactor {
  category: Category;
  factorPerINR: number; // e.g. 0.05 means 0.05 kg CO2 per Rupee spent
}

// Hardcoded for now based on PRD requirements (India specific averages).
// In a real app we'd map this more deeply to MCC codes or finer AI reasoning.
export const EMISSION_FACTORS: Record<Category, number> = {
  "Food & Dining": 0.05,
  "Transport": 0.08,
  "Shopping & E-commerce": 0.04,
  "Utilities & Bills": 0.12,
  "Groceries": 0.06,
  "Others": 0.03,
};
