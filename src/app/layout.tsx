import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Hanimyx",
  description: "Minimalist Hentai Streaming",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} min-h-screen flex flex-col`}>
        <header className="sticky top-0 z-50 w-full border-b border-white/10 bg-black/50 backdrop-blur">
          <div className="container mx-auto px-4 h-16 flex items-center justify-between">
            <div className="flex items-center gap-8">
              <a href="/" className="text-xl font-bold tracking-tighter text-white">
                HANIMYX
              </a>
              <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-white/60">
                <a href="/recent" className="hover:text-white transition-colors">Recent</a>
                <a href="/popular" className="hover:text-white transition-colors">Popular</a>
                <a href="/tags" className="hover:text-white transition-colors">Tags</a>
              </nav>
            </div>
            <div className="flex-1 max-w-sm mx-4">
              <input 
                type="search" 
                placeholder="Search..." 
                className="w-full bg-white/5 border border-white/10 rounded-full px-4 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-white/20"
              />
            </div>
          </div>
        </header>
        <main className="flex-1">
          {children}
        </main>
        <footer className="border-t border-white/10 py-8 text-center text-sm text-white/40">
          <p>© {new Date().getFullYear()} Hanimyx. Built with Next.js.</p>
        </footer>
      </body>
    </html>
  );
}
