import React from "react";
import { Transaction } from "../types";
import { Sparkles, ArrowRight, Zap } from "lucide-react";

interface Props {
  transactions: Transaction[];
}

export function Recommendations({ transactions }: Props) {
  const totalTransport = transactions
    .filter(t => t.category === "Transport")
    .reduce((sum, t) => sum + t.amount, 0);

  const totalFood = transactions
    .filter(t => t.category === "Food & Dining")
    .reduce((sum, t) => sum + t.amount, 0);

  // Generate dynamic recommendations based on AI categorization
  const insights = [];

  if (totalTransport > 2000) {
    insights.push({
      title: "Switch to Metro vs Cabs",
      text: "You spent heavily on transport. Moving 50% of these to the metro reduces your footprint significantly.",
      savings: `₹${(totalTransport * 0.4).toFixed(0)}`,
      co2Savings: `${(totalTransport * 0.08 * 0.7).toFixed(1)} kg CO₂` // Metro is 70% cleaner roughly
    });
  }

  if (totalFood > 3000) {
    insights.push({
        title: "Home Cooked Meals",
        text: "Replacing just 3 food deliveries a week with home-cooked meals provides massive dual savings.",
        savings: "₹1,200",
        co2Savings: "5.2 kg CO₂"
    });
  }

  if (insights.length === 0) {
    insights.push({
        title: "Optimize Utility Usage",
        text: "A 10% reduction in electricity (turning off ACs an hour early) benefits both grids and wallets.",
        savings: "₹250",
        co2Savings: "3.5 kg CO₂"
    });
  }

  return (
    <div className="mt-8 mb-16 space-y-4">
      <h3 className="text-2xl font-display uppercase tracking-wider text-brutal-black flex items-center gap-2 border-b-[4px] border-brutal-black pb-2 mb-6">
        <Sparkles className="w-8 h-8 text-brutal-black bg-neon brutal-border-light p-1" />
        AI Trade-offs
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {insights.map((insight, idx) => (
          <div key={idx} className="bg-brutal-white brutal-border brutal-shadow p-6 relative group hover:bg-neon transition-colors">
            <div className="absolute top-0 right-0 bg-brutal-black text-neon text-xs font-mono font-bold px-2 py-1 brutal-border-b brutal-border-l border-brutal-black uppercase hidden sm:block">
              REC_0{idx + 1}
            </div>
            
            <h4 className="text-xl font-display uppercase text-brutal-black mt-2">{insight.title}</h4>
            <p className="text-sm font-mono text-brutal-black mt-4 max-w-[90%] leading-relaxed border-l-[4px] border-brutal-black pl-4 font-bold">
               {insight.text}
            </p>
            
            <div className="mt-6 flex flex-wrap gap-4 border-t-[2px] border-brutal-black pt-4">
               <div className="bg-brutal-black text-brutal-white px-3 py-2 brutal-border-light font-mono border-brutal-black text-sm w-full sm:w-auto flex-1">
                 <p className="text-[10px] text-gray-400 mb-1 uppercase">Monthly Savings</p>
                 <p className="font-bold">{insight.savings}</p>
               </div>
               <div className="bg-neon text-brutal-black px-3 py-2 brutal-border-light font-mono border-brutal-black text-sm w-full sm:w-auto flex-1 group-hover:bg-brutal-white transition-colors">
                 <p className="text-[10px] text-brutal-black opacity-70 mb-1 uppercase">Emission Savings</p>
                 <p className="font-bold flex items-center gap-1">
                   <Zap className="w-4 h-4 fill-brutal-black" />
                   {insight.co2Savings}
                 </p>
               </div>
            </div>
            
            <div className="absolute right-4 bottom-4 p-2 bg-brutal-black rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer hidden md:block border-2 border-brutal-black shadow-[2px_2px_0px_#F5F5F5]">
               <ArrowRight className="w-4 h-4 text-neon" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
