import "./globals.css";

export const metadata = {
  title: "Siulu' Console - Mebali AI CMS",
  description: "Konsol Manajemen Bot, Basis Pengetahuan RAG Supabase, Sapaan FAQ, & Audit Feedback Pariwisata.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="id" className="h-full antialiased">
      <body className="min-h-full flex flex-col font-sans bg-gray-50 text-slate-900">
        {children}
      </body>
    </html>
  );
}
