import React, { useState } from "react";
import { UploadCloud, CheckCircle, AlertCircle } from "lucide-react";

interface Props {
  onFileSelected: (file: File) => void;
}

export function StatementUploader({ onFileSelected }: Props) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== "application/pdf") {
      setError("Please upload a PDF file.");
      return;
    }

    setIsProcessing(true);
    setError(null);
    onFileSelected(file);
    setIsProcessing(false);
  };

  return (
    <div className="w-full max-w-xl mx-auto p-8 bg-brutal-white brutal-border brutal-shadow flex flex-col items-center justify-center space-y-8 text-center mt-8">
      <div className="h-20 w-20 bg-neon text-brutal-black flex items-center justify-center brutal-border-light shadow-[4px_4px_0px_#080808]">
        <UploadCloud className="h-10 w-10" />
      </div>
      
      <div className="space-y-4 w-full">
        <h2 className="text-3xl font-display uppercase tracking-wider text-brutal-black">Upload Statement</h2>
        <p className="text-sm font-mono border-l-[4px] border-neon pl-4 text-left max-w-sm mx-auto font-bold text-gray-700">
          Upload a PDF statement. Data is processed ethereally—no raw transactions are saved.
        </p>
      </div>

      <div className="relative w-full px-4">
        <input
          type="file"
          accept=".pdf"
          onChange={handleFileUpload}
          disabled={isProcessing}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed z-10"
        />
        <button 
          disabled={isProcessing}
          className="brutal-btn w-full text-lg tracking-widest"
        >
          {isProcessing ? "PROCESSING..." : "SELECT PDF FILE"}
        </button>
      </div>

      {error && (
        <div className="text-neon bg-brutal-black font-mono font-bold p-3 brutal-border-light w-full flex items-center justify-center space-x-2 text-sm uppercase">
          <AlertCircle className="w-5 h-5" />
          <span>{error}</span>
        </div>
      )}
      
      <div className="text-[10px] text-brutal-black font-mono tracking-widest flex items-center space-x-2 pt-2 pb-2 font-bold uppercase border-t-2 border-brutal-black w-full justify-center">
        <CheckCircle className="w-4 h-4 text-neon bg-brutal-black rounded-full" />
        <span>Privacy-preserving analysis</span>
      </div>
    </div>
  );
}
