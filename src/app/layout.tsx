import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Analytics } from "@vercel/analytics/react";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Hanimyx - Hanime & Free Uncensored Hentai Streaming",
  description: "Watch high-quality, free, and uncensored hentai anime online. Experience the best alternative to Hanime and Hentai Haven with no ads and no clutter.",
  keywords: ["hanime", "hentai", "free hentai", "uncensored hentai", "hentai streaming", "anime hentai", "hentai haven", "hanime tv", "watch hentai"],
  verification: {
    google: "pLfXVZxvjfiWq1XbUzRT-Leq2__OY0Bxjl-UITvYX_s",
  },
  manifest: "/manifest.json",
  openGraph: {
    title: "Hanimyx - Hanime & Free Uncensored Hentai Streaming",
    description: "Watch high-quality, free, and uncensored hentai anime online. Experience the best alternative to Hanime and Hentai Haven with no ads and no clutter.",
    url: "https://hanimyx.vercel.app",
    siteName: "Hanimyx",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} min-h-screen flex flex-col bg-[#0d0d0d] text-[#ededed]`}>
        <header className="sticky top-0 z-50 w-full border-b border-white/5 bg-[#0d0d0d]/80 backdrop-blur-xl">
          <div className="container mx-auto px-4 h-16 flex items-center justify-between">
            <div className="flex items-center gap-10">
              <a href="/" className="flex items-center gap-2 group">
                <div className="w-8 h-8 bg-[#e53333] rounded flex items-center justify-center font-black text-white italic transition-transform group-hover:scale-110">H</div>
                <span className="text-xl font-black tracking-tighter text-white uppercase italic">
                  Hanimyx
                </span>
              </a>
              <nav className="hidden lg:flex items-center gap-8 text-[11px] font-black uppercase tracking-[0.2em] text-white/40">
                <a href="/" className="hover:text-[#e53333] transition-colors">Home</a>
                <a href="/popular" className="hover:text-[#e53333] transition-colors">Popular</a>
                <a href="/trending" className="hover:text-[#e53333] transition-colors">Trending</a>
                <a href="/tags" className="hover:text-[#e53333] transition-colors">Tags</a>
                <a href="/brands" className="hover:text-[#e53333] transition-colors">Brands</a>
              </nav>
            </div>
            <div className="flex-1 max-w-md ml-10">
              <form action="/search" method="GET" className="relative group">
                <input 
                  type="search" 
                  name="q"
                  placeholder="Search Hentai..." 
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-xs font-bold focus:outline-none focus:border-[#e53333]/50 focus:bg-white/10 transition-all placeholder:text-white/20"
                />
                <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-[#e53333] transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
                </button>
              </form>
            </div>
          </div>
        </header>
        <main className="flex-1">
          {children}
        </main>
        <footer className="bg-[#0a0a0a] border-t border-white/5 py-12">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
              <div className="col-span-2">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-6 h-6 bg-[#e53333] rounded flex items-center justify-center font-black text-xs text-white italic">H</div>
                  <span className="text-lg font-black tracking-tighter text-white uppercase italic">Hanimyx</span>
                </div>
                <p className="text-xs font-bold text-white/20 leading-relaxed max-w-sm uppercase tracking-wider">
                  The ultimate minimalist experience for high-quality hentai streaming. No ads, no clutter, just content.
                </p>
              </div>
              <div>
                <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-white mb-4">Explore</h4>
                <ul className="space-y-2 text-[10px] font-bold text-white/40 uppercase tracking-widest">
                  <li><a href="/" className="hover:text-[#e53333] transition-colors">Home</a></li>
                  <li><a href="/popular" className="hover:text-[#e53333] transition-colors">Popular</a></li>
                  <li><a href="/tags" className="hover:text-[#e53333] transition-colors">All Tags</a></li>
                </ul>
              </div>
              <div>
                <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-white mb-4">Support</h4>
                <ul className="space-y-2 text-[10px] font-bold text-white/40 uppercase tracking-widest">
                  <li><a href="#" className="hover:text-[#e53333] transition-colors">Privacy</a></li>
                  <li><a href="#" className="hover:text-[#e53333] transition-colors">DMCA</a></li>
                  <li><a href="#" className="hover:text-[#e53333] transition-colors">Contact</a></li>
                </ul>
              </div>
            </div>
            <div className="text-[9px] font-black uppercase tracking-[0.3em] text-center text-white/10 border-t border-white/5 pt-8">
              © {new Date().getFullYear()} Hanimyx. Internal Development Prototype.
            </div>
          </div>
        </footer>
        <Analytics />
      </body>
    </html>
  );
}
