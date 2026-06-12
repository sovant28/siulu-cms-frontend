import { Plus_Jakarta_Sans, Outfit } from "next/font/google";
import "./globals.css";

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-plus-jakarta",
  display: "swap",
});

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
  display: "swap",
});

export const metadata = {
  title: "Siulu' Console - Mebali AI CMS",
  description: "Konsol Manajemen Bot, Basis Pengetahuan RAG Supabase, Sapaan FAQ, & Audit Feedback Pariwisata.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="id" className={`${plusJakarta.variable} ${outfit.variable} h-full antialiased`}>
      <head>
        <link rel="icon" href="data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>🤖</text></svg>" />
      </head>
      <body className="min-h-full flex flex-col font-sans bg-gray-50 text-slate-900">
        {children}
      </body>
    </html>
  );
}
