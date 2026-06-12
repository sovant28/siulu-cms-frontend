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
  X
} from 'lucide-react';

export default function DashboardLayout({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest pl-1">Memuat Antarmuka Admin...</p>
        </div>
      </div>
    );
  }

  const menuItems = [];

  menuItems.push({
    name: "Dashboard",
    path: "/dashboard",
    icon: LayoutDashboard,
    allowed: ["super_admin", "admin_konten", "validator"]
  });

  menuItems.push({
    name: "Pengaturan Bot",
    path: "/dashboard/bot",
    icon: Bot,
    allowed: ["super_admin", "admin_konten"]
  });

  menuItems.push({
    name: "Pengujian Bot",
    path: "/dashboard/sandbox",
    icon: MessageSquare,
    allowed: ["super_admin", "admin_konten", "validator"]
  });

  menuItems.push({
    name: "Memori Wisata (RAG)",
    path: "/dashboard/knowledge",
    icon: Database,
    allowed: ["super_admin", "admin_konten"]
  });

  menuItems.push({
    name: "Greetings & FAQ",
    path: "/dashboard/faq",
    icon: HelpCircle,
    allowed: ["super_admin", "admin_konten"]
  });

  menuItems.push({
    name: "Audit Feedback",
    path: "/dashboard/feedback",
    icon: ThumbsUp,
    allowed: ["super_admin", "validator"]
  });

  menuItems.push({
    name: "Manajemen Tim",
    path: "/dashboard/users",
    icon: Users,
    allowed: ["super_admin"]
  });

  const filteredMenu = menuItems.filter(item => item.allowed.includes(role));

  const getRoleLabel = (r) => {
    switch (r) {
      case 'super_admin': return 'Super-Admin';
      case 'admin_konten': return 'Admin Konten';
      case 'validator': return 'Validator';
      default: return 'Admin';
    }
  };

  const getRoleBadgeStyle = (r) => {
    switch (r) {
      case 'super_admin': return 'bg-orange-50 text-[#F35A05] border-orange-100';
      case 'admin_konten': return 'bg-blue-50 text-blue-600 border-blue-100';
      case 'validator': return 'bg-emerald-50 text-emerald-600 border-emerald-100';
      default: return 'bg-slate-100 text-slate-600 border-slate-400';
    }
  };

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
      <aside className={`fixed md:static inset-y-0 left-0 w-64 bg-white border-r border-slate-400 flex flex-col justify-between h-full z-30 transition-transform duration-300 ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
        
        <div>
          <div className="px-6 py-6 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="text-[#F35A05] font-black text-xl tracking-tighter">Siulu'</span>
              <span className="h-1.5 w-1.5 rounded-full bg-[#F35A05] animate-pulse"></span>
              <span className="text-[9px] px-2 py-0.5 rounded-full bg-orange-50 text-[#F35A05] font-bold uppercase tracking-wider ml-1 border border-orange-100 hidden md:block">Console</span>
            </div>
            <button 
              className="md:hidden p-2 -mr-2 text-slate-400 hover:text-slate-600"
              onClick={() => setMobileMenuOpen(false)}
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <nav className="p-4 space-y-1">
            {filteredMenu.map((item, idx) => {
              const IconComp = item.icon;
              const isActive = pathname === item.path;
              return (
                <Link 
                  key={idx} 
                  href={item.path}
                  className={`flex items-center space-x-3 px-4 py-3 rounded-lg text-xs font-medium transition cursor-pointer relative ${
                    isActive 
                      ? 'bg-orange-50/50 text-[#F35A05] font-bold' 
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  {isActive && (
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-[#F35A05] rounded-r-full"></div>
                  )}
                  <IconComp className={`w-4.5 h-4.5 ${isActive ? 'text-[#F35A05]' : 'text-slate-400'}`} />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="p-4 border-t border-slate-100 space-y-3">
          <div className="flex items-center space-x-3 px-2">
            <div className="w-9 h-9 rounded-full bg-slate-50 border border-slate-400 flex items-center justify-center">
              <UserCheck className="w-4 h-4 text-slate-500" />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-[10px] font-bold text-slate-800 truncate leading-tight uppercase tracking-wider">
                {user?.email.split('@')[0]}
              </h4>
              <span className={`inline-block text-[8px] font-bold uppercase px-1.5 py-0.5 rounded border mt-1 leading-none ${getRoleBadgeStyle(role)}`}>
                {getRoleLabel(role)}
              </span>
            </div>
          </div>

          <button 
            onClick={handleSignOut}
            className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-xs font-medium text-red-500 hover:bg-red-50 transition cursor-pointer active:scale-[0.98]"
          >
            <LogOut className="w-4.5 h-4.5 text-red-400" />
            <span>Keluar Sesi</span>
          </button>
        </div>

      </aside>

      {/* RIGHT MAIN CONTENT */}
      <main className="flex-1 flex flex-col h-full overflow-hidden bg-white">
        
        <header className="h-16 bg-white/80 backdrop-blur-sm border-b border-slate-400 px-5 md:px-8 flex items-center justify-between z-10">
          <div className="flex items-center space-x-3">
            <button 
              className="md:hidden p-2 -ml-2 text-slate-500 hover:text-[#F35A05] transition"
              onClick={() => setMobileMenuOpen(true)}
            >
              <Menu className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest leading-none hidden sm:block">
                Konsol Manajemen
              </h1>
              <h2 className="text-sm font-bold text-slate-800 sm:mt-1.5 leading-none">
              {pathname === '/dashboard' ? 'Ringkasan Sistem' :
               pathname === '/dashboard/bot' ? 'Konfigurasi Virtual Assistant' :
               pathname === '/dashboard/sandbox' ? 'Pengujian Bot (Sandbox)' :
               pathname === '/dashboard/knowledge' ? 'Basis Pengetahuan (AI RAG)' :
               pathname === '/dashboard/faq' ? 'Greetings & FAQ 0-Token' :
               pathname === '/dashboard/feedback' ? 'Audit Evaluasi & Feedback' :
               pathname === '/dashboard/users' ? 'Manajemen Hak Akses Tim' : 'Dashboard'}
            </h2>
          </div>
          </div>

          <div className="flex items-center space-x-3">
            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[9px] font-bold uppercase bg-emerald-50 text-emerald-600 border border-emerald-100 tracking-wider">
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
