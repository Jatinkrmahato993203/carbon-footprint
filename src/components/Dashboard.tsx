import React from "react";
import { Transaction, Category } from "../types";
import { IndianRupee, Leaf, CloudRain, ShieldCheck } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend } from "recharts";

interface Props {
  transactions: Transaction[];
}

const COLORS = ['#10B981', '#3B82F6', '#F59E0B', '#EF4444', '#8B5CF6', '#6B7280'];

export function Dashboard({ transactions }: Props) {
  if (!transactions || transactions.length === 0) {
    return (
      <div className="w-full max-w-xl mx-auto p-8 bg-brutal-white brutal-border brutal-shadow flex flex-col items-center justify-center space-y-6 text-center mt-8 pt-12 pb-12">
        <div className="h-16 w-16 bg-neon text-brutal-black flex items-center justify-center brutal-border-light shadow-[4px_4px_0px_#080808]">
          <ShieldCheck className="h-8 w-8" />
        </div>
        <div className="space-y-4">
          <h2 className="text-2xl font-display uppercase tracking-wider text-brutal-black">No Transactions Found</h2>
          <p className="text-sm font-mono font-bold text-gray-700 max-w-md">
            The AI could not identify any valid debit transactions from your document.
          </p>
        </div>
      </div>
    );
  }

  const totalSpend = transactions.reduce((sum, t) => sum + t.amount, 0);
  const totalCO2 = transactions.reduce((sum, t) => sum + (t.co2 || 0), 0);

  // Group by category
  const breakdownMap = transactions.reduce((acc, t) => {
    const cat = t.category || "Others";
    if (!acc[cat]) acc[cat] = { category: cat, spend: 0, co2: 0 };
    acc[cat].spend += t.amount;
    acc[cat].co2 += (t.co2 || 0);
    return acc;
  }, {} as Record<string, { category: string; spend: number; co2: number }>);

  const breakdownData = Object.values(breakdownMap).sort((a, b) => b.co2 - a.co2);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
      
      {/* Top Level Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="p-6 bg-brutal-white brutal-border brutal-shadow flex items-start space-x-6">
          <div className="p-4 bg-neon text-brutal-black brutal-border-light">
            <IndianRupee className="w-8 h-8" />
          </div>
          <div>
            <div className="inline-block bg-brutal-black text-neon text-[10px] font-mono font-bold uppercase px-2 py-1 mb-2">Total Spend</div>
            <h3 className="text-5xl font-display tracking-tight text-brutal-black mt-1">₹{totalSpend.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</h3>
          </div>
        </div>

        <div className="p-6 bg-brutal-black text-brutal-white brutal-border brutal-shadow flex items-start space-x-6">
          <div className="p-4 bg-neon text-brutal-black brutal-border-light">
            <CloudRain className="w-8 h-8" />
          </div>
          <div>
            <div className="inline-block bg-neon text-brutal-black text-[10px] font-mono font-bold uppercase px-2 py-1 mb-2">Footprint</div>
            <h3 className="text-5xl font-display tracking-tight text-brutal-white mt-1">{totalCO2.toFixed(1)} <span className="text-xl font-mono text-neon">kg CO₂</span></h3>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Cost vs Carbon Pie */}
        <div className="p-6 bg-brutal-white brutal-border brutal-shadow space-y-6">
          <div className="border-b-[4px] border-brutal-black pb-2 flex justify-between items-end">
            <h3 className="text-2xl font-display uppercase text-brutal-black">Emissions Breakdown</h3>
            <span className="font-mono text-xs uppercase text-gray-500 font-bold">[CATEGORY_DIST]</span>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={breakdownData}
                  dataKey="co2"
                  nameKey="category"
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                >
                  {breakdownData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="#080808" strokeWidth={2} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: 0, border: '2px solid #080808', boxShadow: '4px 4px 0px #080808', fontFamily: 'JetBrains Mono', fontSize: '12px', fontWeight: 'bold' }} formatter={(value: number) => [`${value.toFixed(1)} kg`, `CO₂`]} />
                <Legend iconType="square" wrapperStyle={{ fontFamily: 'JetBrains Mono', fontSize: '11px', fontWeight: 'bold' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Dual Cost Breakdown Bar Chart */}
        <div className="p-6 bg-brutal-white brutal-border brutal-shadow space-y-6">
          <div className="border-b-[4px] border-brutal-black pb-2 flex justify-between items-end">
            <h3 className="text-2xl font-display uppercase tracking-wider text-brutal-black">Dual Cost Graph</h3>
            <span className="font-mono text-xs uppercase text-gray-500 font-bold">[₹_VS_CO2]</span>
          </div>
          <div className="h-64 w-full">
             <ResponsiveContainer width="100%" height="100%">
                <BarChart data={breakdownData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#080808" />
                  <XAxis dataKey="category" tick={{ fontSize: 10, fill: '#080808', fontFamily: 'JetBrains Mono', fontWeight: 'bold' }} />
                  <YAxis yAxisId="left" orientation="left" stroke="#080808" tickFormatter={(v) => `₹${v}`} tick={{ fontFamily: 'JetBrains Mono', fontSize: 10, fontWeight: 'bold' }} />
                  <YAxis yAxisId="right" orientation="right" stroke="#080808" tickFormatter={(v) => `${v}kg`} tick={{ fontFamily: 'JetBrains Mono', fontSize: 10, fontWeight: 'bold' }} />
                  <Tooltip contentStyle={{ borderRadius: 0, border: '2px solid #080808', boxShadow: '4px 4px 0px #080808', fontFamily: 'JetBrains Mono', fontSize: '12px', fontWeight: 'bold' }} />
                  <Bar yAxisId="left" dataKey="spend" name="Spend (₹)" fill="#080808" radius={[0, 0, 0, 0]} />
                  <Bar yAxisId="right" dataKey="co2" name="Footprint (kg)" fill="#BDFF00" stroke="#080808" strokeWidth={2} radius={[0, 0, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Transaction Feed */}
      <div className="bg-brutal-white brutal-border brutal-shadow overflow-hidden mt-8">
        <div className="p-6 border-b-[4px] border-brutal-black flex justify-between items-center bg-neon">
          <h3 className="text-2xl font-display uppercase text-brutal-black">Ledger</h3>
          <div className="inline-block bg-brutal-black text-neon font-mono text-[10px] font-bold uppercase px-2 py-1">
            [ AI ASSIGNED ]
          </div>
        </div>
        <div className="divide-y-[2px] divide-brutal-black max-h-96 overflow-y-auto">
          {transactions.map((t) => (
            <div key={t.id} className="p-4 hover:bg-brutal-black hover:text-white flex items-center justify-between transition-colors group">
              <div className="flex flex-col">
                <span className="text-sm font-mono font-bold uppercase line-clamp-1 truncate max-w-[200px] md:max-w-xs">{t.description}</span>
                <span className="text-xs font-mono font-bold opacity-50 group-hover:text-neon uppercase">{t.date} // {t.category}</span>
              </div>
              <div className="text-right flex flex-col">
                <span className="text-sm font-mono font-bold uppercase">₹{t.amount.toFixed(2)}</span>
                <span className="text-xs font-mono font-bold text-gray-500 group-hover:text-neon uppercase mt-1">{t.co2?.toFixed(2)} kg CO₂</span>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
