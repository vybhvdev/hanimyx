'use client';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="min-h-[80vh] bg-[#0d0d0d] flex flex-col items-center justify-center space-y-6 px-4 text-center">
      <div className="w-16 h-16 bg-[#e53333]/10 rounded-full flex items-center justify-center text-[#e53333] mb-2">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg>
      </div>
      <div>
        <h2 className="text-xl font-black uppercase tracking-[0.2em] text-white">Signal Lost</h2>
        <p className="text-xs font-bold text-white/40 uppercase tracking-widest mt-2 max-w-sm">
          {error.message || "Failed to establish secure connection"}
        </p>
      </div>
      <button 
        onClick={() => reset()} 
        className="bg-white/5 border border-white/10 hover:border-[#e53333] hover:bg-[#e53333] px-8 py-3 rounded-full font-black text-[10px] text-white uppercase tracking-[0.2em] transition-all transform active:scale-95"
      >
        Retry Connection
      </button>
    </div>
  );
}