"use client";
import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '../supabase';
import { 
  LayoutDashboard, 
  Bot, 
  Database, 
  HelpCircle, 
  ThumbsUp, 
  Users, 
  LogOut, 
  UserCheck,
  MessageSquare,
  Menu,
  X,
  Map,
  Hotel,
  Utensils,
  Calendar,
  ShieldAlert,
  BookOpen,
  FileText
} from 'lucide-react';

export default function DashboardLayout({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activePath, setActivePath] = useState(pathname);

  useEffect(() => {
    const checkActivePath = () => {
      if (pathname === '/dashboard/knowledge/add') {
        if (typeof window !== 'undefined') {
          const search = window.location.search;
          const params = new URLSearchParams(search);
          const type = params.get('type');
          if (type === 'hotel') return '/dashboard/hotel';
          if (type === 'restoran') return '/dashboard/resto';
          if (type === 'kuliner') return '/dashboard/kuliner';
          if (type === 'event') return '/dashboard/event';
          if (type === 'darurat') return '/dashboard/info';
        }
        return '/dashboard/destinasi';
      }
      
      if (pathname.startsWith('/dashboard/knowledge/edit/')) {
        const id = pathname.split('/').pop() || '';
        if (id.startsWith('HTL-')) return '/dashboard/hotel';
        if (id.startsWith('FOOD-')) return '/dashboard/kuliner';
        if (id.startsWith('CUL-')) return '/dashboard/resto';
        if (id.startsWith('EVT-')) return '/dashboard/event';
        if (id.startsWith('EMG-')) return '/dashboard/info';
        if (id.startsWith('DST-') || id.startsWith('NAT-') || id.startsWith('REL-') || id.startsWith('TRN-')) {
          return '/dashboard/destinasi';
        }
      }
      return pathname;
    };

    setActivePath(checkActivePath());
  }, [pathname]);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          router.replace('/login');
          return;
        }

        const currentUser = session.user;
        setUser(currentUser);

        const { data: roleData, error: roleError } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', currentUser.id);

        if (roleError || !roleData || roleData.length === 0) {
          await supabase.auth.signOut();
          router.replace('/login');
          return;
        }

        setRole(roleData[0].role);
        setLoading(false);
      } catch (err) {
        console.error("Kesalahan autentikasi dashboard:", err);
        router.replace('/login');
      }
    };

    checkAuth();
  }, [router]);

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      router.replace('/login');
    } catch (err) {
      console.error("Gagal logout:", err);
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center space-y-4">
          <div className="h-9 w-9 animate-spin rounded-full border-[3px] border-[#F35A05] border-t-transparent"></div>
          <p className="text-[10px] font-bold text-slate-500 tracking-widest pl-1">Memuat Antarmuka Admin...</p>
        </div>
      </div>
    );
  }

  const menuItems = [];

  menuItems.push({
    name: "Dashboard",
    path: "/dashboard",
    icon: LayoutDashboard,
    allowed: ["super_admin", "admin_konten", "validator", "admin_bot", "analyst"],
    category: "Navigasi Utama"
  });

  menuItems.push({
    name: "Pengaturan Bot",
    path: "/dashboard/bot",
    icon: Bot,
    allowed: ["super_admin", "admin_bot"],
    category: "Konfigurasi Bot"
  });

  menuItems.push({
    name: "Greetings & FAQ",
    path: "/dashboard/faq",
    icon: HelpCircle,
    allowed: ["super_admin", "admin_konten", "admin_bot"],
    category: "Konfigurasi Bot"
  });

  menuItems.push({
    name: "Pengujian Bot",
    path: "/dashboard/sandbox",
    icon: MessageSquare,
    allowed: ["super_admin", "validator", "admin_bot"],
    category: "Konfigurasi Bot"
  });

  menuItems.push({
    name: "Tempat Wisata",
    path: "/dashboard/destinasi",
    icon: Map,
    allowed: ["super_admin", "admin_konten"],
    category: "Basis Pengetahuan RAG"
  });

  menuItems.push({
    name: "Hotel & Akomodasi",
    path: "/dashboard/hotel",
    icon: Hotel,
    allowed: ["super_admin", "admin_konten"],
    category: "Basis Pengetahuan RAG"
  });

  menuItems.push({
    name: "Restoran & Cafe",
    path: "/dashboard/resto",
    icon: Utensils,
    allowed: ["super_admin", "admin_konten"],
    category: "Basis Pengetahuan RAG"
  });

  menuItems.push({
    name: "Kuliner Tradisional",
    path: "/dashboard/kuliner",
    icon: Database,
    allowed: ["super_admin", "admin_konten"],
    category: "Basis Pengetahuan RAG"
  });

  menuItems.push({
    name: "Event & Ritual Adat",
    path: "/dashboard/event",
    icon: Calendar,
    allowed: ["super_admin", "admin_konten"],
    category: "Basis Pengetahuan RAG"
  });

  menuItems.push({
    name: "Informasi & Darurat",
    path: "/dashboard/info",
    icon: ShieldAlert,
    allowed: ["super_admin", "admin_konten"],
    category: "Basis Pengetahuan RAG"
  });

  menuItems.push({
    name: "Audit Feedback",
    path: "/dashboard/feedback",
    icon: ThumbsUp,
    allowed: ["super_admin", "validator", "analyst"],
    category: "Keamanan & Analitik"
  });

  menuItems.push({
    name: "Manajemen Tim",
    path: "/dashboard/users",
    icon: Users,
    allowed: ["super_admin"],
    category: "Keamanan & Analitik"
  });

  menuItems.push({
    name: "Dokumentasi Console",
    path: "/dashboard/documentation",
    icon: BookOpen,
    allowed: ["super_admin", "admin_konten", "validator", "admin_bot", "analyst"],
    category: "Informasi & Rilis"
  });

  menuItems.push({
    name: "Catatan Rilis",
    path: "/dashboard/changelog",
    icon: FileText,
    allowed: ["super_admin", "admin_konten", "validator", "admin_bot", "analyst"],
    category: "Informasi & Rilis"
  });

  const filteredMenu = menuItems.filter(item => item.allowed.includes(role));

  const getRoleLabel = (r) => {
    switch (r) {
      case 'super_admin': return 'Super-Admin';
      case 'admin_konten': return 'Admin Konten';
      case 'validator': return 'Validator';
      case 'admin_bot': return 'Admin Bot';
      case 'analyst': return 'Analyst';
      default: return 'Admin';
    }
  };

  const getRoleBadgeStyle = (r) => {
    switch (r) {
      case 'super_admin': return 'bg-orange-50 text-[#F35A05] border-orange-100';
      case 'admin_konten': return 'bg-blue-50 text-blue-600 border-blue-100';
      case 'validator': return 'bg-emerald-50 text-emerald-600 border-emerald-100';
      case 'admin_bot': return 'bg-purple-50 text-purple-600 border-purple-100';
      case 'analyst': return 'bg-amber-50 text-amber-600 border-amber-100';
      default: return 'bg-slate-100 text-slate-600 border-slate-400';
    }
  };

  const matchingMenuItem = menuItems.find(item => {
    if (item.path === '/dashboard') {
      return pathname === '/dashboard';
    }
    return pathname.startsWith(item.path);
  });

  const isAllowed = !matchingMenuItem || matchingMenuItem.allowed.includes(role);

  if (!loading && !isAllowed) {
    return (
      <div className="min-h-screen w-full flex flex-col items-center justify-center bg-gray-50 px-4 font-sans antialiased text-slate-900">
        <div className="w-full max-w-md bg-white border border-slate-200 rounded-2xl p-8 space-y-6 flex flex-col items-center">
          <div className="w-16 h-16 rounded-2xl bg-red-50 border border-red-100 flex items-center justify-center text-red-500 text-3xl">
            ⚠️
          </div>
          <div className="space-y-2 text-center">
            <h2 className="text-sm font-bold text-slate-800 tracking-widest pl-1">Akses Halaman Ditolak</h2>
            <p className="text-xs text-slate-500 font-medium leading-relaxed">
              Peran Anda ({getRoleLabel(role)}) tidak memiliki izin untuk mengakses halaman ini.
            </p>
          </div>
          <button 
            onClick={() => router.replace('/dashboard')}
            className="w-full bg-[#F35A05] hover:bg-[#d94f04] text-white rounded-xl py-3.5 text-xs font-bold transition active:scale-[0.98]"
          >
            Kembali ke Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen w-full bg-white overflow-hidden font-sans text-slate-900">
      
      {/* Mobile Overlay */}
      {mobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/50 z-20 md:hidden backdrop-blur-sm"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* SIDEBAR LEFT */}
      <aside className={`fixed md:static inset-y-0 left-0 w-64 bg-white border-r border-slate-200/80 flex flex-col justify-between h-full z-30 transition-transform duration-300 ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
        
        <div>
          <div className="px-6 py-6 border-b border-slate-100/80 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="text-[#F35A05] font-black text-xl tracking-tighter">Siulu'</span>
              <span className="h-1.5 w-1.5 rounded-full bg-[#F35A05] animate-pulse"></span>
              <span className="text-[9px] px-2 py-0.5 rounded-full bg-orange-50 text-[#F35A05] font-bold tracking-wider ml-1 border border-orange-100 hidden md:block">Console</span>
            </div>
            <button 
              className="md:hidden p-2 -mr-2 text-slate-400 hover:text-slate-600"
              onClick={() => setMobileMenuOpen(false)}
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <nav className="p-4 space-y-4 overflow-y-auto max-h-[calc(100vh-160px)] no-scrollbar">
            {[
              { name: "Navigasi Utama" },
              { name: "Basis Pengetahuan RAG" },
              { name: "Konfigurasi Bot" },
              { name: "Keamanan & Analitik" },
              { name: "Informasi & Rilis" }
            ].map((cat, catIdx) => {
              const catItems = filteredMenu.filter(item => item.category === cat.name);
              if (catItems.length === 0) return null;
              return (
                <div key={catIdx} className="space-y-1">
                  <span className="block text-[9px] font-black text-slate-400 tracking-wider pl-4">
                    {cat.name}
                  </span>
                  <div className="space-y-0.5">
                    {catItems.map((item, idx) => {
                      const IconComp = item.icon;
                      const isActive = activePath === item.path;
                      return (
                        <Link 
                          key={idx} 
                          href={item.path}
                          className={`flex items-center space-x-3 px-4 py-2 rounded-xl text-xs font-semibold transition cursor-pointer border ${
                            isActive 
                              ? 'bg-orange-50/60 text-[#F35A05] border-orange-100/50' 
                              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50 border-transparent'
                          }`}
                        >
                          <IconComp className={`w-4 h-4 ${isActive ? 'text-[#F35A05]' : 'text-slate-400'}`} />
                          <span>{item.name}</span>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </nav>
        </div>

        <div className="p-4 border-t border-slate-100/80 space-y-3">
          <div className="flex items-center space-x-3 px-2">
            <div className="w-9 h-9 rounded-full bg-slate-50 border border-slate-200/80 flex items-center justify-center">
              <UserCheck className="w-4 h-4 text-slate-500" />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-[10px] font-bold text-slate-800 truncate leading-tight tracking-wider">
                {user?.email.split('@')[0]}
              </h4>
              <span className={`inline-block text-[8px] font-bold px-1.5 py-0.5 rounded border mt-1 leading-none ${getRoleBadgeStyle(role)}`}>
                {getRoleLabel(role)}
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between px-2 pt-1 text-[9px] font-bold text-slate-400">
            <span>Siulu' Console</span>
            <span className="px-1.5 py-0.5 rounded bg-slate-50 border border-slate-200/60 text-slate-500">v1.4.0</span>
          </div>

          <button 
            onClick={handleSignOut}
            className="w-full flex items-center space-x-3 px-4 py-2.5 rounded-xl text-xs font-semibold text-red-500 hover:bg-red-50/50 border border-transparent hover:border-red-100/30 transition cursor-pointer active:scale-[0.98]"
          >
            <LogOut className="w-4.5 h-4.5 text-red-400" />
            <span>Keluar Sesi</span>
          </button>
        </div>

      </aside>

      {/* RIGHT MAIN CONTENT */}
      <main className="flex-1 flex flex-col h-full overflow-hidden bg-white">
        
        <header className="h-16 bg-white/80 backdrop-blur-sm border-b border-slate-200/60 px-5 md:px-8 flex items-center justify-between z-10">
          <div className="flex items-center space-x-3">
            <button 
              className="md:hidden p-2 -mr-2 text-slate-500 hover:text-[#F35A05] transition"
              onClick={() => setMobileMenuOpen(true)}
            >
              <Menu className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-[10px] font-bold text-slate-500 tracking-widest leading-none hidden sm:block">
                Konsol Manajemen
              </h1>
              <h2 className="text-sm font-bold text-slate-800 sm:mt-1.5 leading-none">
              {pathname === '/dashboard' ? 'Ringkasan Sistem' :
               pathname === '/dashboard/bot' ? 'Konfigurasi Virtual Assistant' :
               pathname === '/dashboard/sandbox' ? 'Pengujian Bot (Sandbox)' :
               pathname === '/dashboard/faq' ? 'Greetings & FAQ 0-Token' :
               pathname === '/dashboard/feedback' ? 'Audit Evaluasi & Feedback' :
               pathname === '/dashboard/users' ? 'Manajemen Hak Akses Tim' :
               pathname === '/dashboard/documentation' ? 'Dokumentasi Panduan Console' :
               pathname === '/dashboard/changelog' ? 'Catatan Rilis & Versi' : 'Manajemen RAG'}
            </h2>
          </div>
          </div>

          <div className="flex items-center space-x-3">
            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[9px] font-bold bg-emerald-50 text-emerald-600 border border-emerald-100/60 tracking-wider">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1.5 animate-pulse"></span>
              Connected
            </span>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-8 no-scrollbar">
          {children}
        </div>

      </main>

    </div>
  );
}
