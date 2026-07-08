"use client";
import { 
  GitCommit, 
  Calendar, 
  Tag, 
  ChevronRight,
  Sparkles,
  Lock,
  Layers,
  Settings
} from 'lucide-react';

export default function ChangelogPage() {
  const changelogs = [
    {
      version: 'v1.4.0',
      date: '2026-07-08',
      title: 'CMS Dynamic Fields & Customization Compliance',
      description: 'Rilis ini meluncurkan formulir dinamis adaptif untuk kuliner tradisional dan informasi umum, sterilisasi emoji sapaan, serta penataan ulang dashboard sesuai pedoman desain premium datar.',
      changes: [
        {
          category: 'CMS (Panel Admin)',
          items: [
            'Selektor Tipe Informasi Darurat: Menambahkan pilihan Layanan Fisik (RSUD, Polres) vs Pengetahuan RAG (Sejarah, Bupati) dengan form dinamis.',
            'Pembersihan Gaya Datar: Menghilangkan semua bayangan (drop shadow) dan huruf kapital (uppercase) dari antarmuka dashboard untuk mematuhi regulasi proyek.',
            'Sidebar Terkategori: Mengelompokkan navigasi sidebar ke dalam 5 bagian terstruktur (Navigasi Utama, Basis Pengetahuan RAG, Konfigurasi Bot, Keamanan & Analitik, Informasi & Rilis).',
            'Sapaan Berbahasa Indonesia: Melokalkan bahasa pembuka dashboard menjadi Selamat Datang Kembali.'
          ]
        },
        {
          category: 'Backend API & AI Chatbot',
          items: [
            'Sterilisasi Emoji Greetings: Menghapus emoji cuaca, robot, doa, dan penunjuk arah dari balasan sapaan dinamis backend (chat.py) untuk menjaga kesan profesional.',
            'Integrasi Versi Sidebar: Menampilkan penanda versi aktif v1.4.0 secara langsung di pojok kiri bawah sidebar.'
          ]
        }
      ]
    },
    {
      version: 'v1.3.0',
      date: '2026-07-05',
      title: 'UI/UX Refinement & Lazy-Load Performance',
      description: 'Rilis ini berfokus pada pemolesan antarmuka pengguna agar terasa lebih responsif, peningkatan tipografi, penataan ruang layar, serta optimalisasi kecepatan render.',
      changes: [
        {
          category: 'PWA (Aplikasi Wisatawan)',
          items: [
            'Tipografi UI Premium: Mengganti font sistem bawaan browser dengan font Inter secara global di globals.css.',
            'Emulator View (Desktop Screen): Batasi lebar maksimal max-w-md mx-auto agar di desktop tampil di tengah seperti smartphone.',
            'Penyelarasan Spasi (Grid & Spacing): Merapikan margin samping horizontal ke angka presisi px-5 (20px).',
            'Lazy-Load Objek Wisata: Membatasi render objek wisata awal hanya 6 item dengan tombol Muat Lebih Banyak.'
          ]
        }
      ]
    },
    {
      version: 'v1.2.0',
      date: '2026-06-20',
      title: 'Security Guard Rails & Anti-Spam Protections',
      description: 'Rilis ini memperkenalkan pertahanan keamanan siber dan perlindungan anti-spam guna mengamankan konsumsi kuota API Gemini dan membersihkan database dari data sampah.',
      changes: [
        {
          category: 'Backend API & Keamanan',
          items: [
            'Dual-Tier Rate Limiting: Membatasi laju request per IP client (Minute-limit maks 10 kueri, Daily-limit maks 150 kueri).',
            'Proxy-Aware IP Detection: Membaca header X-Forwarded-For secara aman untuk mengidentifikasi alamat IP asli.'
          ]
        },
        {
          category: 'PWA (Aplikasi Wisatawan)',
          items: [
            'Disposable Email Blacklist: Memblokir registrasi akun PWA yang menggunakan penyedia email sampah/sekali pakai.',
            'Batas Sesi Obrolan Tamu: Pengguna tamu dibatasi maksimal 10x berkirim pesan sebelum diwajibkan mendaftar akun.'
          ]
        }
      ]
    },
    {
      version: 'v1.1.0',
      date: '2026-06-10',
      title: 'CMS RBAC Expansion & Authorization Guards',
      description: 'Rilis ini memperluas fungsionalitas panel admin (CMS) dengan meluncurkan matriks hak akses tim yang ketat menggunakan sistem Role-Based Access Control (RBAC).',
      changes: [
        {
          category: 'CMS (Panel Admin)',
          items: [
            'Perluasan Peran (Expanded Roles): Mengimplementasikan 5 peran pengguna baru (super_admin, admin_konten, validator, admin_bot, analyst).',
            'Otorisasi Sidebar Menu: Menyembunyikan menu Sandbox, Bot Settings, dan User Management dari visual admin konten.',
            'Route Guards: Jika admin mencoba mengakses URL terlarang secara manual, halaman akan diblokir dengan pesan Akses Halaman Ditolak.'
          ]
        }
      ]
    },
    {
      version: 'v1.0.0',
      date: '2026-05-30',
      title: 'Core RAG Backend & Chatbot Launch',
      description: 'Peluncuran versi dasar pertama (MVP) platform pemandu wisata Tana Toraja Siulu\'.',
      changes: [
        {
          category: 'Fitur Utama',
          items: [
            'FastAPI Backend: Setup server berbasis Python ASGI menggunakan uvicorn.',
            'Pencarian Vektor RAG: Integrasi modul pgvector 512 dimensi (Matryoshka Embeddings) dikombinasikan dengan pencarian kesamaan kosinus.',
            'FAQ Bypass (0-Token): Deteksi otomatis pola kalimat sapaan lokal Toraja untuk langsung memberikan jawaban cepat tanpa memanggil API LLM.'
          ]
        }
      ]
    }
  ];

  return (
    <div className="flex flex-col w-full font-sans pb-10 space-y-8 max-w-4xl overflow-y-auto no-scrollbar h-[calc(100vh-80px)] pr-4">
      
      {/* Header */}
      <div className="flex flex-col space-y-1">
        <span className="text-[10px] font-black text-[#F35A05] tracking-wider pl-1">Riwayat Pengembangan</span>
        <h1 className="text-3xl font-black text-slate-800 tracking-tight">Catatan Rilis & Versi</h1>
        <p className="text-xs text-slate-500 leading-relaxed max-w-2xl">
          Pantau riwayat pembaruan, perbaikan bug, dan penambahan fitur yang diterapkan secara berkala pada sistem Siulu' Console dan Mebali AI Assistant.
        </p>
      </div>

      {/* Timeline */}
      <div className="relative border-l border-slate-200 pl-6 ml-4 space-y-10 py-2">
        {changelogs.map((log, idx) => (
          <div key={idx} className="relative space-y-3">
            {/* Timeline bullet dot */}
            <div className="absolute -left-[31px] top-1 w-4 h-4 rounded-full bg-white border-2 border-[#F35A05] flex items-center justify-center">
              <div className="w-1.5 h-1.5 rounded-full bg-[#F35A05]"></div>
            </div>

            {/* Version Badge & Date Row */}
            <div className="flex items-center space-x-3">
              <span className="inline-flex items-center px-2 py-0.5 rounded bg-orange-50 text-[#F35A05] border border-orange-100/50 text-[10px] font-bold tracking-wider">
                {log.version}
              </span>
              <div className="flex items-center space-x-1.5 text-slate-400 text-[11px] font-semibold">
                <Calendar className="w-3.5 h-3.5" />
                <span>{log.date}</span>
              </div>
            </div>

            {/* Version Title */}
            <div className="space-y-1">
              <h3 className="text-base font-bold text-slate-800 leading-tight">
                {log.title}
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed font-medium">
                {log.description}
              </p>
            </div>

            {/* Detailed Changes Grouped by Category */}
            <div className="bg-slate-50/50 border border-slate-200/60 rounded-xl p-5 space-y-4">
              {log.changes.map((change, cIdx) => (
                <div key={cIdx} className="space-y-2">
                  <h4 className="text-[10px] font-black text-slate-400 tracking-wider">
                    {change.category}
                  </h4>
                  <ul className="space-y-1.5">
                    {change.items.map((item, iIdx) => (
                      <li key={iIdx} className="flex items-start space-x-2 text-[11px] leading-relaxed text-slate-600 font-medium">
                        <ChevronRight className="w-3.5 h-3.5 text-slate-400 mt-0.5 shrink-0" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

    </div>
  );
}
