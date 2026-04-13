export default function Loading() {
  return (
    <div className="min-h-[80vh] bg-[#0d0d0d] flex flex-col items-center justify-center">
      <div className="w-16 h-16 border-4 border-white/5 border-t-[#e53333] rounded-full animate-spin mb-6"></div>
      <p className="text-[10px] font-black text-white/40 uppercase tracking-[0.3em] animate-pulse">Syncing Uplink...</p>
    </div>
  );
}