import { useState } from "react";
import { StatementUploader } from "./components/UploadPhase";
import { Dashboard } from "./components/Dashboard";
import { Recommendations } from "./components/Recommendations";
import { processPdfTransaction } from "./lib/api";
import { Transaction } from "./types";
import { Leaf, Loader2 } from "lucide-react";

export default function App() {
  const [phase, setPhase] = useState<"upload" | "processing" | "dashboard">("upload");
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [error, setError] = useState<string | null>(null);

  const handleFileSelected = async (file: File) => {
    setPhase("processing");
    setError(null);
    try {
      const categorized = await processPdfTransaction(file);
      setTransactions(categorized);
      setPhase("dashboard");
    } catch (err: any) {
      setError(err.message || "Failed to analyze PDF with AI.");
      setPhase("upload");
    }
  };

  return (
    <div className="min-h-screen bg-brutal-white font-sans text-brutal-black selection:bg-neon selection:text-brutal-black flex flex-col lg:h-screen lg:overflow-hidden p-2 md:p-6">
      <div className="flex-1 brutal-border bg-brutal-white flex flex-col relative overflow-hidden">
        
        {/* Navbar */}
        <nav className="border-b-[4px] border-brutal-black bg-brutal-white z-50 flex items-center justify-between px-6 h-20 shrink-0">
          <div className="flex items-center space-x-4">
            <span className="font-display text-4xl uppercase tracking-wider text-brutal-black mt-1">
              CHHAYA
            </span>
            <div className="hidden md:flex ml-4 gap-2 items-center">
               <div className="font-mono text-xs font-bold bg-brutal-black text-neon px-2 py-1">[ PROJECT: FOOTPRINT ]</div>
               <div className="font-mono text-xs font-bold border-2 border-brutal-black px-2 py-1 uppercase">Active</div>
            </div>
          </div>
          {phase === "dashboard" && (
            <button
              onClick={() => {
                setTransactions([]);
                setPhase("upload");
              }}
              className="font-mono text-sm font-bold uppercase bg-brutal-black text-brutal-white hover:bg-neon hover:text-brutal-black border-2 border-transparent hover:border-brutal-black transition-colors px-4 py-2"
            >
              Restart
            </button>
          )}
        </nav>


        {/* Rails & Main Content Layout */}
        <div className="flex flex-1 relative overflow-hidden">
          {/* Left Rail */}
          <aside className="w-[80px] border-r-[2px] border-brutal-black flex-col justify-between items-center py-6 h-full bg-brutal-white relative shrink-0 hidden lg:flex">
            <div className="writing-vertical-rl rotate-180 font-mono text-[10px] tracking-widest uppercase font-bold text-gray-500 whitespace-nowrap">CREATIVE_ENGINE_V1.04</div>
            <div className="writing-vertical-rl rotate-180 font-mono text-[10px] tracking-widest uppercase font-bold text-brutal-black whitespace-nowrap">BUILD_MODE_ACTIVE</div>
            <div className="writing-vertical-rl rotate-180 font-mono text-[10px] tracking-widest uppercase font-bold text-neon bg-brutal-black py-2 px-1 whitespace-nowrap mt-4">SYSTEM_NOMINAL</div>
          </aside>
          
          {/* Main Scroller */}
          <main className="flex-1 overflow-y-auto w-full relative">
            <div className="p-6 md:p-12 mb-12">
              {phase === "upload" && (
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 max-w-4xl">
                  <div className="mb-12 space-y-6">
                    <h1 className="font-display text-6xl md:text-8xl leading-[0.85] uppercase tracking-tight text-brutal-black mb-6">
                      See your<br/>shadow.
                    </h1>
                    <div className="font-mono text-sm max-w-lg border-l-[4px] border-neon pl-5 uppercase font-bold text-brutal-black leading-relaxed">
                      Zero manual logging. Upload your UPI/Bank statement and instantly see both the financial and carbon cost of your life.
                    </div>
                  </div>
                  
                  {error && (
                    <div className="max-w-xl mb-6 p-4 bg-brutal-black text-neon text-sm font-mono font-bold brutal-border-light uppercase">
                      Error: {error}
                    </div>
                  )}
                  
                  <StatementUploader onFileSelected={handleFileSelected} />
                </div>
              )}

              {phase === "processing" && (
                <div className="min-h-[50vh] flex flex-col items-start justify-center space-y-6 animate-in fade-in duration-500 max-w-lg">
                  <div className="w-24 h-24 bg-neon brutal-border brutal-shadow flex items-center justify-center animate-pulse">
                     <Loader2 className="w-12 h-12 text-brutal-black animate-spin" />
                  </div>
                  <div className="space-y-4 bg-brutal-black text-brutal-white p-6 brutal-border-light w-full">
                    <h2 className="text-2xl font-display uppercase tracking-widest text-neon">COMPILING ASSETS...</h2>
                    <p className="text-sm font-mono tracking-tight text-gray-300 uppercase">Applying India-specific emission factors</p>
                    <div className="w-full bg-brutal-black border-2 border-brutal-white h-4 overflow-hidden mt-4">
                      <div className="h-full bg-neon w-2/3 animate-pulse"></div>
                    </div>
                  </div>
                </div>
              )}

              {phase === "dashboard" && (
                <div className="max-w-6xl">
                   <Dashboard transactions={transactions} />
                   <Recommendations transactions={transactions} />
                </div>
              )}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
