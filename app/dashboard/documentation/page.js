"use client";
import { useState } from 'react';
import { 
  BookOpen, 
  Database, 
  HelpCircle, 
  Shield, 
  Zap, 
  Layers,
  ArrowRight,
  ChevronRight
} from 'lucide-react';

export default function DocumentationPage() {
  const [activeSection, setActiveSection] = useState('pengenalan');

  const sections = [
    { id: 'pengenalan', name: 'Pengenalan', icon: BookOpen },
    { id: 'rag', name: 'Manajemen Data RAG', icon: Database },
    { id: 'faq', name: 'Greetings & FAQ', icon: Zap },
    { id: 'rbac', name: 'Hak Akses & Peran', icon: Shield },
  ];

  return (
    <div className="flex flex-col lg:flex-row w-full font-sans pb-10 gap-8 h-[calc(100vh-80px)] overflow-hidden">
      
      {/* Sidebar Navigasi Dokumentasi */}
      <aside className="w-full lg:w-64 flex flex-col space-y-1.5 shrink-0 border-b lg:border-b-0 lg:border-r border-slate-200/80 pb-4 lg:pb-0 pr-0 lg:pr-6 overflow-y-auto">
        <div className="space-y-1">
          <span className="block text-[9px] font-black text-slate-400 tracking-wider pl-4">
            Dokumentasi Console
          </span>
          <div className="space-y-0.5">
            {sections.map((sec) => {
              const IconComp = sec.icon;
              const isActive = activeSection === sec.id;
              return (
                <button
                  key={sec.id}
                  onClick={() => setActiveSection(sec.id)}
                  className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl text-xs font-semibold transition cursor-pointer border ${
                    isActive 
                      ? 'bg-orange-50/60 text-[#F35A05] border-orange-100/50' 
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50 border-transparent'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <IconComp className={`w-4 h-4 ${isActive ? 'text-[#F35A05]' : 'text-slate-400'}`} />
                    <span>{sec.name}</span>
                  </div>
                  <ChevronRight className={`w-3.5 h-3.5 transition-transform ${isActive ? 'text-[#F35A05] translate-x-0.5' : 'text-slate-300'}`} />
                </button>
              );
            })}
          </div>
        </div>
      </aside>

      {/* Konten Dokumentasi (Vite/Laravel Docs Style) */}
      <main className="flex-1 overflow-y-auto pr-0 lg:pr-6 no-scrollbar pb-10 space-y-8">
        
        {activeSection === 'pengenalan' && (
          <div className="space-y-6 max-w-3xl">
            <div className="space-y-2">
              <span className="text-[10px] font-black text-[#F35A05] tracking-wider pl-1">Panduan Pengguna</span>
              <h1 className="text-3xl font-black text-slate-800 tracking-tight">Pengenalan Siulu' Console</h1>
              <p className="text-xs text-slate-500 leading-relaxed">
                Selamat datang di konsol administrasi **Siulu' Tour Guide & Mebali AI Assistant**. Portal ini dirancang khusus untuk mengelola basis pengetahuan (knowledge base) pariwisata Tana Toraja, melatih kecerdasan buatan chatbot, serta memonitor keamanan sistem.
              </p>
            </div>

            <div className="p-4 bg-orange-50/20 border border-orange-100/60 rounded-xl space-y-2">
              <h3 className="text-xs font-bold text-[#F35A05] flex items-center space-x-2">
                <Layers className="w-4 h-4" />
                <span>Bagaimana Sistem Ini Bekerja?</span>
              </h3>
              <p className="text-[11px] text-slate-600 leading-relaxed">
                Konsol ini menggunakan teknik **Retrieval-Augmented Generation (RAG)**. Setiap dokumen pariwisata yang Anda tambahkan (wisata, hotel, resep makanan, event) akan secara otomatis dikonversi oleh backend FastAPI menjadi representasi vektor (embeddings) 512 dimensi dan disimpan di database Supabase. Saat wisatawan berdiskusi dengan AI di PWA, sistem akan menyaring dokumen yang paling relevan untuk diumpankan sebagai bekal pengetahuan bagi model kecerdasan buatan Google Gemini atau Alibaba Qwen.
              </p>
            </div>

            <div className="space-y-3">
              <h2 className="text-sm font-bold text-slate-800">Alur Utama Pengoperasian</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-white border border-slate-200/80 rounded-xl space-y-2">
                  <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-xs">1</div>
                  <h4 className="text-xs font-bold text-slate-800">Input Data Berkualitas</h4>
                  <p className="text-[11px] text-slate-500 leading-relaxed">Admin mengunggah data pariwisata yang presisi melalui CMS. Semakin lengkap tulisan deskripsi, semakin pintar asisten AI dalam menjawab kueri wisatawan.</p>
                </div>
                <div className="p-4 bg-white border border-slate-200/80 rounded-xl space-y-2">
                  <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-xs">2</div>
                  <h4 className="text-xs font-bold text-slate-800">Uji Coba Sandbox</h4>
                  <p className="text-[11px] text-slate-500 leading-relaxed">Sebelum dilepas ke publik, uji performa bot dan akurasi dokumen RAG di halaman Sandbox untuk memastikan AI menjawab dengan sopan dan benar.</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeSection === 'rag' && (
          <div className="space-y-6 max-w-3xl">
            <div className="space-y-2">
              <span className="text-[10px] font-black text-blue-600 tracking-wider pl-1">Panduan Pengguna</span>
              <h1 className="text-3xl font-black text-slate-800 tracking-tight">Manajemen Data RAG</h1>
              <p className="text-xs text-slate-500 leading-relaxed">
                Modul ini digunakan untuk mengisi ingatan atau basis pengetahuan asisten virtual. Data pariwisata dikelompokkan menjadi 6 kategori utama dengan struktur formulir yang dinamis.
              </p>
            </div>

            <div className="space-y-4">
              <h2 className="text-sm font-bold text-slate-800">Perbedaan Form Berdasarkan Kategori</h2>
              <div className="space-y-3">
                <div className="flex items-start space-x-3 p-3 bg-slate-50/50 border border-slate-200/60 rounded-xl">
                  <div className="w-2 h-2 rounded-full bg-[#F35A05] mt-1.5 shrink-0" />
                  <div>
                    <h4 className="text-xs font-bold text-slate-800">Wisata & Akomodasi</h4>
                    <p className="text-[11px] text-slate-500 leading-relaxed">Memerlukan nama tempat, koordinat GPS lengkap, fasilitas, serta tips berkunjung. Data ini akan ditampilkan dalam bentuk katalog peta di PWA.</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3 p-3 bg-slate-50/50 border border-slate-200/60 rounded-xl">
                  <div className="w-2 h-2 rounded-full bg-amber-500 mt-1.5 shrink-0" />
                  <div>
                    <h4 className="text-xs font-bold text-slate-800">Kuliner Tradisional (Resep & Makanan)</h4>
                    <p className="text-[11px] text-slate-500 leading-relaxed">Formulir 1 kolom penuh vertikal yang dikustomisasi. Jam buka, kontak telepon, dan GPS disembunyikan secara otomatis karena objek ini adalah kuliner non-fisik (resep). Lokasi kedai penjual dihubungkan menggunakan pemetaan ID fasilitas restoran.</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3 p-3 bg-slate-50/50 border border-slate-200/60 rounded-xl">
                  <div className="w-2 h-2 rounded-full bg-red-500 mt-1.5 shrink-0" />
                  <div>
                    <h4 className="text-xs font-bold text-slate-800">Info Darurat & Umum (Layanan Fisik vs Pengetahuan RAG)</h4>
                    <p className="text-[11px] text-slate-600 leading-relaxed">Gunakan pilihan **Tipe Informasi** untuk memisahkan Layanan Fisik (seperti RSUD atau Polres) yang memerlukan GPS, telepon, dan foto untuk ditampilkan di PWA, dengan Pengetahuan Umum (seperti Sejarah Tana Toraja atau profil Bupati) yang hanya disimpan sebagai basis ingatan AI chatbot (RAG-only).</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeSection === 'faq' && (
          <div className="space-y-6 max-w-3xl">
            <div className="space-y-2">
              <span className="text-[10px] font-black text-indigo-600 tracking-wider pl-1">Panduan Pengguna</span>
              <h1 className="text-3xl font-black text-slate-800 tracking-tight">Greetings & FAQ (0-Token Bypass)</h1>
              <p className="text-xs text-slate-500 leading-relaxed">
                Greetings dan FAQ lokal digunakan sebagai saringan utama obrolan. Setiap kueri awal dari wisatawan akan dicocokkan dengan pola (pattern) yang terdaftar di halaman ini sebelum diteruskan ke mesin AI Gemini.
              </p>
            </div>

            <div className="p-4 bg-indigo-50/10 border border-indigo-100/50 rounded-xl space-y-2">
              <h3 className="text-xs font-bold text-indigo-600">Keuntungan Utama FAQ Lokal:</h3>
              <ul className="list-disc pl-4 text-[11px] text-slate-600 space-y-1.5 leading-relaxed">
                <li>**Respons Instan**: Jawaban dikirim langsung dari database Supabase dalam hitungan milidetik tanpa waktu tunggu pemrosesan AI.</li>
                <li>**Akurasi Mutlak**: Menjamin jawaban kritis (seperti kontak darurat penting atau hak cipta) bebas dari risiko halusinasi AI.</li>
                <li>**Hemat Biaya API**: Menghindari konsumsi token API Gemini/Qwen untuk percakapan ringan sehari-hari yang bersifat repetitif.</li>
              </ul>
            </div>

            <div className="space-y-2">
              <h3 className="text-xs font-bold text-slate-800">Format Penulisan Pola (Regex)</h3>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                Gunakan simbol pipa (`|`) untuk mendaftarkan beberapa variasi kata kunci sekaligus. Hindari menggunakan huruf kapital (pola akan otomatis dicocokkan secara tidak sensitif huruf kapital).
              </p>
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-3.5 font-mono text-[10px] text-slate-700">
                Pola: halo | hi | hai | selamat pagi<br />
                Balasan: Selamat pagi Sangmane! Selamat datang di Tana Toraja. Ada yang bisa asisten Siulu' bantu hari ini?
              </div>
            </div>
          </div>
        )}

        {activeSection === 'rbac' && (
          <div className="space-y-6 max-w-3xl">
            <div className="space-y-2">
              <span className="text-[10px] font-black text-emerald-600 tracking-wider pl-1">Panduan Pengguna</span>
              <h1 className="text-3xl font-black text-slate-800 tracking-tight">Matriks Hak Akses Peran (RBAC)</h1>
              <p className="text-xs text-slate-500 leading-relaxed">
                Sistem Console ini dilengkapi dengan Role-Based Access Control (RBAC) ketat untuk menjaga keamanan integrasi model AI dan database.
              </p>
            </div>

            <div className="w-full overflow-x-auto border border-slate-200/80 rounded-xl font-sans">
              <table className="w-full text-left border-collapse text-[11px]">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50/50 text-slate-500 font-bold">
                    <th className="py-3 px-4 font-medium">Peran Pengguna</th>
                    <th className="py-3 px-4 font-medium">Dashboard</th>
                    <th className="py-3 px-4 font-medium">Data RAG</th>
                    <th className="py-3 px-4 font-medium">Greetings & FAQ</th>
                    <th className="py-3 px-4 font-medium">Bot Settings & Sandbox</th>
                    <th className="py-3 px-4 font-medium">Users</th>
                  </tr>
                </thead>
                <tbody className="text-slate-700 font-medium">
                  <tr className="border-b border-slate-100">
                    <td className="py-3 px-4 text-slate-900 font-bold">Super-Admin</td>
                    <td className="py-3 px-4 text-emerald-600">✓ Ya</td>
                    <td className="py-3 px-4 text-emerald-600">✓ Ya</td>
                    <td className="py-3 px-4 text-emerald-600">✓ Ya</td>
                    <td className="py-3 px-4 text-emerald-600">✓ Ya</td>
                    <td className="py-3 px-4 text-emerald-600">✓ Ya</td>
                  </tr>
                  <tr className="border-b border-slate-100">
                    <td className="py-3 px-4 text-slate-900 font-bold">Admin Konten</td>
                    <td className="py-3 px-4 text-emerald-600">✓ Ya</td>
                    <td className="py-3 px-4 text-emerald-600">✓ Ya</td>
                    <td className="py-3 px-4 text-emerald-600">✓ Ya</td>
                    <td className="py-3 px-4 text-rose-500">✗ Tidak</td>
                    <td className="py-3 px-4 text-rose-500">✗ Tidak</td>
                  </tr>
                  <tr className="border-b border-slate-100">
                    <td className="py-3 px-4 text-slate-900 font-bold">Admin Bot</td>
                    <td className="py-3 px-4 text-emerald-600">✓ Ya</td>
                    <td className="py-3 px-4 text-rose-500">✗ Tidak</td>
                    <td className="py-3 px-4 text-emerald-600">✓ Ya</td>
                    <td className="py-3 px-4 text-emerald-600">✓ Ya</td>
                    <td className="py-3 px-4 text-rose-500">✗ Tidak</td>
                  </tr>
                  <tr className="border-b border-slate-100">
                    <td className="py-3 px-4 text-slate-900 font-bold">Validator</td>
                    <td className="py-3 px-4 text-emerald-600">✓ Ya</td>
                    <td className="py-3 px-4 text-rose-500">✗ Tidak</td>
                    <td className="py-3 px-4 text-rose-500">✗ Tidak</td>
                    <td className="py-3 px-4 text-emerald-600">✓ Sandbox Only</td>
                    <td className="py-3 px-4 text-rose-500">✗ Tidak</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 text-slate-900 font-bold">Analyst</td>
                    <td className="py-3 px-4 text-emerald-600">✓ Ya</td>
                    <td className="py-3 px-4 text-rose-500">✗ Tidak</td>
                    <td className="py-3 px-4 text-rose-500">✗ Tidak</td>
                    <td className="py-3 px-4 text-rose-500">✗ Tidak</td>
                    <td className="py-3 px-4 text-rose-500">✗ Tidak</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="p-4 bg-red-50/10 border border-red-100/60 rounded-xl space-y-2">
              <h3 className="text-xs font-bold text-red-600">Penjagaan Keamanan Halaman (Route Guards)</h3>
              <p className="text-[11px] text-slate-600 leading-relaxed">
                Console ini dilengkapi dengan perlindungan URL berlapis. Jika ada pengguna yang mencoba memotong jalur menu dengan mengetikkan alamat URL secara langsung (misal: admin konten mengetik `/dashboard/bot`), sistem Next.js akan langsung memblokir render halaman dan mengalihkan ke layar warning **"Akses Halaman Ditolak"**.
              </p>
            </div>
          </div>
        )}

      </main>

    </div>
  );
}
