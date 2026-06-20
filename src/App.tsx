import { useState, useEffect } from "react";
import { StatementUploader } from "./components/UploadPhase";
import { Dashboard } from "./components/Dashboard";
import { Recommendations } from "./components/Recommendations";
import { processPdfTransaction } from "./lib/api";
import { Transaction } from "./types";
import { Leaf, Loader2 } from "lucide-react";
import { auth, signInWithGoogle, db, setUpRecaptcha, sendOTP, verifyOTP } from "./lib/firebase";
import { onAuthStateChanged, User, signOut, ConfirmationResult } from "firebase/auth";
import { collection, doc, setDoc, query, onSnapshot, orderBy } from "firebase/firestore";

import { importFromGmail } from "./lib/gmail";

export default function App() {
  const [phase, setPhase] = useState<"upload" | "processing" | "dashboard">("upload");
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isAuthLoaded, setIsAuthLoaded] = useState(false);
  
  // Auth state
  const [isLoadingAuth, setIsLoadingAuth] = useState(false);
  const [showPhoneAuth, setShowPhoneAuth] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setIsAuthLoaded(true);
    });
    return () => unsub();
  }, []);

  const handleGoogleSignIn = async () => {
    setIsLoadingAuth(true);
    setError(null);
    try {
      await signInWithGoogle();
    } catch (error: any) {
      if (error.code !== 'auth/popup-closed-by-user') {
        setError(error.message || "Failed to sign in with Google.");
      }
    } finally {
      setIsLoadingAuth(false);
    }
  };

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phoneNumber) return;
    setIsLoadingAuth(true);
    setError(null);
    try {
      const appVerifier = setUpRecaptcha("recaptcha-container");
      let formattedPhone = phoneNumber;
      if (!formattedPhone.startsWith("+")) {
        formattedPhone = `+91${formattedPhone}`; // Default to India prefix if none provided
      }
      const result = await sendOTP(formattedPhone, appVerifier);
      setConfirmationResult(result);
      setOtpSent(true);
    } catch (error: any) {
      setError(error.message || "Failed to send OTP.");
    } finally {
      setIsLoadingAuth(false);
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp || !confirmationResult) return;
    setIsLoadingAuth(true);
    setError(null);
    try {
      await verifyOTP(confirmationResult, otp);
    } catch (error: any) {
      setError(error.message || "Invalid OTP.");
    } finally {
      setIsLoadingAuth(false);
    }
  };

  // Listen to Firestore for real-time sync of transactions
  useEffect(() => {
    if (!user) return;
    const q = query(
      collection(db, `users/${user.uid}/transactions`)
    );
    const unsub = onSnapshot(q, (snapshot) => {
      const txns: Transaction[] = [];
      snapshot.forEach((doc) => {
        txns.push(doc.data() as Transaction);
      });
      // Sort by date inside the client for now to avoid needing a composite index
      txns.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      
      setTransactions(txns);
      if (txns.length > 0 && phase === "upload") {
        setPhase("dashboard");
      }
    });
    return () => unsub();
  }, [user]);

  const saveTransactionsToDb = async (txns: Transaction[]) => {
    if (!user) return;
    const batch = txns.map(async (t) => {
      const docRef = doc(db, `users/${user.uid}/transactions`, t.id);
      await setDoc(docRef, t);
    });
    await Promise.all(batch);
  };

  const handleFileSelected = async (file: File) => {
    setPhase("processing");
    setError(null);
    try {
      const categorized = await processPdfTransaction(file);
      await saveTransactionsToDb(categorized);
      setPhase("dashboard");
    } catch (err: any) {
      setError(err.message || "Failed to analyze PDF with AI.");
      setPhase("upload");
    }
  };

  const handleGmailSync = async () => {
    setPhase("processing");
    setError(null);
    try {
      // Re-authenticate and fetch emails
      const rawTxns = await importFromGmail();
      if (rawTxns.length === 0) {
        setError("No recent receipts found in your Gmail.");
        setPhase("upload");
        return;
      }
      
      await saveTransactionsToDb(rawTxns);
      setPhase("dashboard");
    } catch (err: any) {
      setError(err.message || "Failed to sync receipts from Gmail.");
      setPhase("upload");
    }
  };

  if (!isAuthLoaded) {
    return (
      <div className="min-h-screen bg-brutal-white flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-brutal-black animate-spin" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-brutal-white font-sans text-brutal-black selection:bg-neon selection:text-brutal-black flex flex-col items-center justify-center p-6">
        <div className="mb-12 space-y-6 text-center max-w-2xl">
          <h1 className="font-display text-6xl md:text-8xl leading-[0.85] uppercase tracking-tight text-brutal-black mb-6">
            CHHAYA<br/>CORE.
          </h1>
          <p className="font-mono text-sm uppercase font-bold border-l-[4px] border-neon pl-4 text-left inline-block">
            AUTHENTICATION REQUIRED TO ACCESS PLATFORM RESOURCES. <br/> FIREBASE INFRASTRUCTURE ONLINE.
          </p>
        </div>

        {error && (
          <div className="max-w-xl mb-6 p-4 bg-brutal-black text-neon text-sm font-mono font-bold brutal-border-light uppercase">
            Error: {error}
          </div>
        )}

        {showPhoneAuth ? (
          <div className="w-full max-w-sm space-y-4">
            {!otpSent ? (
              <form onSubmit={handleSendOTP} className="space-y-4">
                <input
                  type="tel"
                  placeholder="+91 9876543210"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className="w-full brutal-border px-4 py-3 bg-brutal-white font-mono uppercase focus:outline-none focus:ring-4 focus:ring-neon disabled:opacity-50"
                  disabled={isLoadingAuth}
                />
                <button
                  type="submit"
                  disabled={isLoadingAuth || !phoneNumber}
                  className="brutal-btn w-full text-lg tracking-widest bg-brutal-black text-brutal-white disabled:opacity-50"
                >
                  {isLoadingAuth ? "SENDING..." : "SEND OTP"}
                </button>
                <div id="recaptcha-container"></div>
              </form>
            ) : (
              <form onSubmit={handleVerifyOTP} className="space-y-4">
                <input
                  type="text"
                  placeholder="Enter 6-digit OTP"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  className="w-full brutal-border px-4 py-3 bg-brutal-white font-mono uppercase focus:outline-none focus:ring-4 focus:ring-neon disabled:opacity-50"
                  disabled={isLoadingAuth}
                />
                <button
                  type="submit"
                  disabled={isLoadingAuth || !otp}
                  className="brutal-btn w-full text-lg tracking-widest bg-neon text-brutal-black disabled:opacity-50"
                >
                  {isLoadingAuth ? "VERIFYING..." : "VERIFY OTP"}
                </button>
              </form>
            )}
            <button
              onClick={() => {
                setShowPhoneAuth(false);
                setOtpSent(false);
                setError(null);
              }}
              className="font-mono text-xs font-bold uppercase text-gray-500 w-full hover:text-brutal-black mt-4"
              disabled={isLoadingAuth}
            >
              Back to options
            </button>
          </div>
        ) : (
          <div className="w-full max-w-sm space-y-4">
            <button 
              onClick={handleGoogleSignIn}
              disabled={isLoadingAuth}
              className="brutal-btn w-full text-lg tracking-widest flex items-center justify-center space-x-3 bg-white border-2 border-brutal-black shadow-[4px_4px_0_0_#000] hover:translate-y-[2px] hover:translate-x-[2px] hover:shadow-[2px_2px_0_0_#000] transition-all disabled:opacity-50"
            >
              <span>SIGN IN WITH GOOGLE</span>
            </button>
            <button 
              onClick={() => setShowPhoneAuth(true)}
              disabled={isLoadingAuth}
              className="brutal-btn w-full text-lg tracking-widest flex items-center justify-center space-x-3 bg-brutal-black text-white hover:bg-gray-800 disabled:opacity-50"
            >
              <span>LOGIN WITH PHONE OTP</span>
            </button>
          </div>
        )}
      </div>
    );
  }

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
               <div className="font-mono text-xs font-bold bg-brutal-black text-neon px-2 py-1">[ USER: {user.displayName || "ANONYMOUS"} ]</div>
               <div className="font-mono text-xs font-bold border-2 border-brutal-black px-2 py-1 uppercase bg-neon text-brutal-black">Auth: Firebase</div>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            {phase === "dashboard" && (
              <button
                onClick={() => {
                  setTransactions([]);
                  setPhase("upload");
                }}
                className="font-mono text-xs font-bold uppercase border-2 border-brutal-black text-brutal-black hover:bg-neon transition-colors px-3 py-1"
              >
                Restart
              </button>
            )}
            <button
               onClick={() => signOut(auth)}
               className="font-mono text-xs font-bold uppercase bg-brutal-black text-brutal-white hover:bg-red-500 hover:text-white border-2 border-transparent transition-colors px-3 py-1"
            >
              Sign Out
            </button>
          </div>
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
                  
                  <StatementUploader onFileSelected={handleFileSelected} onGmailSync={handleGmailSync} />
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
