import { motion } from "motion/react";
import { Link } from "react-router-dom";
import { FileText, Cpu, Trophy, ArrowRight } from "lucide-react";

export function LandingPage() {
  return (
    <div className="min-h-screen bg-brutal-white font-sans text-brutal-black selection:bg-neon selection:text-brutal-black flex flex-col pt-8">
      
      {/* Navbar Minimal */}
      <nav className="border-b-[4px] border-brutal-black bg-brutal-white z-50 flex items-center justify-between px-6 h-20 fixed top-0 w-full">
        <div className="flex items-center space-x-4">
          <span className="font-display text-4xl uppercase tracking-wider text-brutal-black mt-1">
            CHHAYA
          </span>
        </div>
        <Link
          to="/app"
          className="font-mono text-sm font-bold uppercase bg-brutal-black text-brutal-white hover:bg-neon hover:text-brutal-black border-2 border-transparent transition-colors px-6 py-3 shadow-[4px_4px_0px_#080808]"
        >
          Launch App
        </Link>
      </nav>

      {/* Hero Section */}
      <section className="min-h-screen pt-32 pb-16 px-6 md:px-12 flex flex-col justify-center">
        <motion.div 
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-5xl"
        >
          <h1 className="font-display text-7xl md:text-9xl leading-[0.85] uppercase tracking-tighter text-brutal-black mb-8">
            See your<br/><span className="text-neon bg-brutal-black px-4 inline-block mt-4">shadow.</span>
          </h1>
          <p className="font-mono text-lg md:text-xl max-w-2xl border-l-[6px] border-neon pl-6 uppercase font-bold text-gray-700 leading-relaxed mb-12">
            The invisible cost of convenience. Instantly translate your raw UPI and bank statements into your true financial and carbon footprint. No manual entry. No greenwashing.
          </p>
          <Link
            to="/app"
            className="inline-flex items-center space-x-4 font-display text-3xl uppercase tracking-widest bg-brutal-black text-brutal-white px-8 py-6 hover:bg-neon hover:text-brutal-black border-4 border-transparent hover:border-brutal-black transition-all shadow-[8px_8px_0px_#080808] hover:translate-y-1 hover:translate-x-1 hover:shadow-[4px_4px_0px_#080808]"
          >
            <span>Analyze Statement</span>
            <ArrowRight className="w-8 h-8" />
          </Link>
        </motion.div>
      </section>

      {/* Stats Band */}
      <section className="border-y-[4px] border-brutal-black bg-neon py-8 overflow-hidden">
        <div className="flex gap-16 px-6 overflow-x-auto no-scrollbar font-display text-4xl uppercase whitespace-nowrap items-center">
          <span>1,248 Transactions Parsed</span>
          <span className="text-2xl font-mono opacity-50">///</span>
          <span>482 kg CO₂ Exposed</span>
          <span className="text-2xl font-mono opacity-50">///</span>
          <span>Zero Data Stored</span>
          <span className="text-2xl font-mono opacity-50">///</span>
          <span>Ethereal Processing Active</span>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 px-6 md:px-12 bg-brutal-white">
        <div className="max-w-7xl mx-auto">
          <motion.h2 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="font-display text-5xl md:text-7xl uppercase mb-16"
          >
            Core Functions
          </motion.h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <FeatureCard 
              icon={<FileText className="w-12 h-12" />}
              title="UPI Auto-Parse"
              desc="Drop your standard PDF statement. We extract the raw merchant data locally."
              delay={0}
            />
            <FeatureCard 
              icon={<Cpu className="w-12 h-12" />}
              title="Gemini Categorization"
              desc="AI intelligently identifies the merchant context and estimates corresponding emissions."
              delay={0.2}
            />
            <FeatureCard 
              icon={<Trophy className="w-12 h-12" />}
              title="Impact Streaks"
              desc="Unlock brutalist badges by reducing your carbon intensity week over week."
              delay={0.4}
            />
          </div>
        </div>
      </section>

      {/* How it Works / Steps */}
      <section className="py-24 px-6 md:px-12 bg-brutal-black text-brutal-white">
        <div className="max-w-7xl mx-auto">
          <motion.h2 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="font-display text-5xl md:text-7xl text-neon uppercase mb-16"
          >
            Execution Flow
          </motion.h2>
          
          <div className="space-y-12 max-w-4xl font-mono text-xl uppercase font-bold">
            <Step number="01" text="Generate PDF statement from your bank or UPI app." />
            <div className="h-12 border-l-[4px] border-gray-700 ml-8"></div>
            <Step number="02" text="Upload via the portal. Payload gets routed to Gemini API." />
            <div className="h-12 border-l-[4px] border-gray-700 ml-8"></div>
            <Step number="03" text="Receive instant categorization, footprint profile, and AI trade-off analysis." />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t-[4px] border-brutal-black py-8 px-6 text-center font-mono text-sm font-bold uppercase">
        [ CHHAYA CORE SYSTEM v1.0 ]
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, desc, delay }: { icon: React.ReactNode, title: string, desc: string, delay: number }) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay }}
      className="bg-brutal-white border-[4px] border-brutal-black p-8 shadow-[8px_8px_0px_#080808] hover:bg-neon transition-colors group relative"
    >
      <div className="text-brutal-black mb-6 group-hover:scale-110 transition-transform origin-left">
        {icon}
      </div>
      <h3 className="font-display text-3xl uppercase tracking-wide mb-4">{title}</h3>
      <p className="font-mono text-sm leading-relaxed font-bold text-gray-700 group-hover:text-brutal-black uppercase">{desc}</p>
    </motion.div>
  );
}

function Step({ number, text }: { number: string, text: string }) {
  return (
    <motion.div 
      initial={{ opacity: 0, x: -20 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      className="flex items-start space-x-6"
    >
      <div className="bg-neon text-brutal-black px-4 py-2 text-2xl border-[4px] border-brutal-black">
        {number}
      </div>
      <div className="pt-2">
        {text}
      </div>
    </motion.div>
  );
}
