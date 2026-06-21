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
