import { useState } from "react";
import { MessageSquare, Send, X, Bot } from "lucide-react";
import { Transaction } from "../types";

export function ChatWidget({ transactions }: { transactions: Transaction[] }) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{role: "user" | "assistant", content: string}[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const totalSpend = transactions.reduce((sum, t) => sum + t.amount, 0);
  const totalCO2 = transactions.reduce((sum, t) => sum + (t.co2 || 0), 0);

  const userContext = {
    totalSpend,
    totalCO2,
    transactionCount: transactions.length,
    topCategories: transactions.slice(0, 5).map(t => t.category),
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;
    const newMsg = { role: "user" as const, content: input.trim() };
    const chatHistory = [...messages, newMsg];
    setMessages(chatHistory);
    setInput("");
    setIsLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: chatHistory, userContext })
      });
      const data = await res.json();
      if (res.ok && data.reply) {
        setMessages([...chatHistory, { role: "assistant", content: data.reply }]);
      } else {
         setMessages([...chatHistory, { role: "assistant", content: "Error communicating to core." }]);
      }
    } catch {
       setMessages([...chatHistory, { role: "assistant", content: "Comms failure." }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Floating Action Button */}
      {!isOpen && (
         <button 
           onClick={() => setIsOpen(true)}
           className="fixed bottom-6 right-6 w-16 h-16 bg-neon text-brutal-black brutal-border brutal-shadow flex items-center justify-center hover:scale-105 transition-transform z-50"
         >
            <MessageSquare className="w-8 h-8" />
         </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 w-96 h-[500px] bg-brutal-white brutal-border brutal-shadow flex flex-col z-50 flex-shrink-0 max-w-[calc(100vw-3rem)]">
          {/* Header */}
          <div className="bg-brutal-black text-neon p-4 flex justify-between items-center brutal-border-b border-brutal-black shrink-0 relative">
             <div className="flex items-center space-x-3">
               <Bot className="w-6 h-6" />
               <span className="font-display uppercase tracking-widest text-lg">AI INTERPRETER</span>
             </div>
             <button onClick={() => setIsOpen(false)} className="text-brutal-white hover:text-red-500 transition-colors">
               <X className="w-6 h-6" />
             </button>
             {/* Adding Gamified Badge text for the chatter */}
             <div className="absolute top-full lg:left-0 lg:-ml-2 mt-2 font-mono text-[10px] bg-neon text-brutal-black px-2 py-1 uppercase font-bold border-2 border-brutal-black pointer-events-none hidden lg:block">
               LVL_01 CO2 COACH
             </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#f8f8f8]">
            {messages.length === 0 && (
              <div className="text-center text-sm font-mono uppercase font-bold text-gray-500 mt-10">
                INITIATE QUERY.<br/>ASK ABOUT YOUR SPEND OR CARBON FOOTPRINT.
              </div>
            )}
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                 <div className={`max-w-[80%] p-3 font-mono text-sm uppercase ${
                    m.role === "user" 
                      ? "bg-brutal-black text-brutal-white" 
                      : "bg-neon text-brutal-black border-2 border-brutal-black shadow-[4px_4px_0_0_#000]"
                 }`}>
                   {m.content}
                 </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                 <div className="max-w-[80%] p-3 font-mono text-sm uppercase bg-neon text-brutal-black border-2 border-brutal-black shadow-[4px_4px_0_0_#000] animate-pulse">
                   PROCESSING...
                 </div>
              </div>
            )}
          </div>

          {/* Input */}
          <div className="p-4 bg-brutal-white border-t-2 border-brutal-black flex space-x-2 shrink-0">
             <input 
               type="text" 
               className="flex-1 bg-transparent brutal-border px-3 py-2 font-mono text-sm uppercase focus:outline-none focus:ring-2 focus:ring-neon"
               placeholder="QUERY..."
               value={input}
               onChange={e => setInput(e.target.value)}
               onKeyDown={e => e.key === "Enter" && handleSend()}
               autoFocus
             />
             <button 
               onClick={handleSend}
               disabled={isLoading || !input.trim()}
               className="bg-brutal-black text-brutal-white px-4 py-2 hover:bg-neon hover:text-brutal-black border-2 border-brutal-black transition-colors disabled:opacity-50"
             >
               <Send className="w-5 h-5" />
             </button>
          </div>
        </div>
      )}
    </>
  );
}
