"use client";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../supabase';
import { 
  Bot, 
  Trash2, 
  Edit3, 
  Search,
  Plus,
  Filter,
  ChevronLeft,
  ChevronRight,
  Star,
  Copy
} from 'lucide-react';

export default function BotList() {
  const router = useRouter();
  const [role, setRole] = useState(null);
  const [token, setToken] = useState(null);
  const [bots, setBots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api';

  useEffect(() => {
    const initPage = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          setToken(session.access_token);
          const { data: roleData } = await supabase
            .from('user_roles')
            .select('role')
            .eq('user_id', session.user.id)
            .single();
          setRole(roleData?.role);
        }
        await fetchBots();
      } catch (err) {
        console.error("Gagal menginisialisasi halaman bot:", err);
      } finally {
        setLoading(false);
      }
    };
    initPage();
  }, []);

  const fetchBots = async () => {
    try {
      const fetchWithTimeout = async (url, options = {}, timeout = 2500) => {
        const controller = new AbortController();
        const id = setTimeout(() => controller.abort(), timeout);
        try {
          const response = await fetch(url, { ...options, signal: controller.signal });
          clearTimeout(id);
          return response;
        } catch (e) {
          clearTimeout(id);
          throw e;
        }
      };

      const res = await fetchWithTimeout(`${API_URL}/bots/`);
      if (res.ok) {
        const data = await res.json();
        setBots(data);
        return;
      }
    } catch (err) {
      console.warn("Gagal mengambil data bot dari API, mencoba fallback Supabase:", err);
    }

    // Fallback: Ambil data langsung dari Supabase
    try {
      const { data, error } = await supabase
        .from('bots')
        .select('*')
        .order('name', { ascending: true });

      if (error) throw error;
      setBots(data || []);
    } catch (dbErr) {
      console.error("Gagal memuat bot via Supabase fallback:", dbErr);
    }
  };

  const handleDeleteBot = async (botId) => {
    if (role !== 'super_admin') {
      alert("Akses ditolak: Hanya Super-Admin yang bisa menghapus bot!");
      return;
    }
    if (!confirm("Apakah Anda yakin ingin menghapus chatbot ini beserta seluruh datanya?")) return;

    try {
      const { error } = await supabase
        .from('bots')
        .delete()
        .eq('id', botId);

      if (!error) {
        alert("Bot berhasil dihapus!");
        await fetchBots();
      } else {
        alert(`Gagal menghapus bot: ${error.message}`);
      }
    } catch (err) {
      console.error(err);
      alert("Terjadi kesalahan koneksi database.");
    }
  };

  const handleActivateBot = async (botId) => {
    if (role !== 'super_admin') {
      alert("Akses ditolak: Hanya Super-Admin yang bisa mengaktifkan bot!");
      return;
    }
    
    try {
      const res = await fetch(`${API_URL}/bots/${botId}/activate`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (res.ok) {
        // Optimistically update UI or re-fetch
        await fetchBots();
      } else {
        alert("Gagal mengaktifkan bot.");
      }
    } catch (err) {
      console.error(err);
      alert("Terjadi kesalahan koneksi saat mengaktifkan bot.");
    }
  };

  const handleDuplicateBot = async (bot) => {
    if (role !== 'super_admin') {
      alert("Akses ditolak: Hanya Super-Admin yang bisa menduplikasi bot!");
      return;
    }
    
    if (!confirm(`Duplikasi chatbot "${bot.name}"?`)) return;

    const payload = {
      name: `${bot.name} (Copy)`,
      description: bot.description,
      system_instruction: bot.system_instruction,
      model: bot.model,
      temperature: bot.temperature,
      provider: bot.provider,
      api_key: bot.api_key,
      base_url: bot.base_url,
      is_active: false
    };

    try {
      const res = await fetch(`${API_URL}/bots/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        alert("Bot berhasil diduplikasi!");
        await fetchBots();
      } else {
        const errData = await res.json();
        alert(`Gagal menduplikasi bot: ${errData.detail || 'Error'}`);
      }
    } catch (err) {
      console.error(err);
      alert("Terjadi kesalahan koneksi saat menduplikasi bot.");
    }
  };

  const filteredBots = (bots || []).filter(bot => {
    if (!bot) return false;
    const q = searchQuery.toLowerCase();
    const name = bot.name || '';
    const desc = bot.description || '';
    const model = bot.model || '';
    const provider = bot.provider || '';
    
    return (
      name.toLowerCase().includes(q) ||
      desc.toLowerCase().includes(q) ||
      model.toLowerCase().includes(q) ||
      provider.toLowerCase().includes(q)
    );
  });

  const totalPages = Math.ceil(filteredBots.length / itemsPerPage) || 1;
  const paginatedBots = filteredBots.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  if (loading) {
    return (
      <div className="flex h-[60vh] w-full items-center justify-center">
        <div className="flex flex-col items-center space-y-3">
          <div className="h-7 w-7 animate-spin rounded-full border-[3px] border-[#F35A05] border-t-transparent"></div>
          <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest pl-1">Memuat Data Bot...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col w-full font-sans pb-10 space-y-8">
      
      {/* Title */}
      <div>
        <h2 className="text-2xl font-black text-slate-800 tracking-tight">Daftar Bot</h2>
      </div>

      {/* Tabs */}
      <div className="flex items-center space-x-6 border-b border-slate-200">
        <div className="pb-3 border-b-2 border-[#F35A05] text-[#F35A05] font-bold text-sm">
          Semua Bot ({bots.length})
        </div>
        <div className="pb-3 text-slate-400 font-bold text-sm cursor-not-allowed">
          Diarsipkan (0)
        </div>
      </div>

      {/* Action Row */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input 
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari bot berdasarkan nama..."
              className="w-72 bg-white border border-slate-300 rounded-lg pl-9 pr-4 py-2 text-xs text-slate-800 font-medium placeholder-slate-400 focus:outline-none focus:border-[#F35A05] transition"
            />
          </div>
          <button className="flex items-center space-x-2 px-4 py-2 bg-white border border-slate-300 rounded-lg text-xs font-bold text-slate-700 hover:bg-slate-50 transition">
            <Filter className="w-3.5 h-3.5" />
            <span>Filter</span>
          </button>
        </div>
        
        <button 
          onClick={() => router.push('/dashboard/bot/add')}
          className="flex items-center space-x-2 bg-[#F35A05] hover:bg-[#d94200] text-white px-5 py-2.5 rounded-lg text-xs font-bold transition active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>New Bot</span>
        </button>
      </div>

      {/* Clean Table */}
      <div className="w-full overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b border-slate-200 text-slate-500 font-bold">
              <th className="pb-3 px-2 font-medium w-[250px]">Name & Desc</th>
              <th className="pb-3 px-2 font-medium">Model</th>
              <th className="pb-3 px-2 font-medium">Provider</th>
              <th className="pb-3 px-2 font-medium">Temp</th>
              <th className="pb-3 px-2 font-medium text-center w-[120px]">Status</th>
              <th className="pb-3 px-2 font-medium text-right w-[140px]">Action</th>
            </tr>
          </thead>
          <tbody className="text-slate-700">
            {paginatedBots.length === 0 ? (
              <tr>
                <td colSpan="5" className="py-12 text-center text-slate-500 italic border-b border-slate-200">
                  Tidak ditemukan bot yang cocok.
                </td>
              </tr>
            ) : (
              paginatedBots.map((bot) => (
                <tr key={bot.id} className="border-b border-slate-200 hover:bg-slate-50/50 transition group">
                  <td className="py-4 px-2">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 rounded-full bg-orange-50 text-[#F35A05] flex items-center justify-center font-bold">
                        {bot.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="font-bold text-slate-800 text-sm">{bot.name}</div>
                        <div className="text-slate-500 text-[10px] mt-0.5 max-w-[200px] truncate">{bot.description || 'Tidak ada deskripsi'}</div>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-2">
                    <span className="inline-block px-2.5 py-1 bg-slate-100 text-slate-600 rounded-full text-[10px] font-bold">
                      {bot.model}
                    </span>
                  </td>
                  <td className="py-4 px-2">
                    <span className="inline-block px-2.5 py-1 bg-emerald-50 text-emerald-600 rounded-full text-[10px] font-bold capitalize">
                      {bot.provider}
                    </span>
                  </td>
                  <td className="py-4 px-2">
                    <span className="bg-slate-100 text-slate-600 px-2 py-1 rounded text-[10px] font-bold tracking-wide">
                      {bot.temperature}
                    </span>
                  </td>
                  <td className="py-4 px-2 text-center">
                    {bot.is_active ? (
                      <span className="bg-green-100 text-green-700 px-2 py-1 rounded text-[10px] font-bold tracking-wide flex items-center justify-center w-max mx-auto space-x-1">
                        <Star className="w-3 h-3 fill-current" />
                        <span>ACTIVE</span>
                      </span>
                    ) : (
                      <span className="bg-slate-100 text-slate-400 px-2 py-1 rounded text-[10px] font-bold tracking-wide">
                        INACTIVE
                      </span>
                    )}
                  </td>
                  <td className="py-4 px-2 text-right">
                    <div className="flex items-center justify-end space-x-2 opacity-0 group-hover:opacity-100 transition">
                      {!bot.is_active && (
                        <button 
                          onClick={() => handleActivateBot(bot.id)}
                          className="p-1.5 text-slate-400 hover:text-green-600 hover:bg-green-50 rounded transition"
                          title="Set as Active Bot"
                        >
                          <Star className="w-4 h-4" />
                        </button>
                      )}
                      <button 
                        onClick={() => handleDuplicateBot(bot)}
                        className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded transition"
                        title="Duplikasi Bot"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => router.push(`/dashboard/bot/edit/${bot.id}`)}
                        className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded transition"
                        title="Edit Bot"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleDeleteBot(bot.id)}
                        className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition"
                        title="Hapus Bot"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Bottom Right */}
      {filteredBots.length > 0 && (
        <div className="flex items-center justify-between text-xs text-slate-500 mt-2">
          <div>
            Showing {((currentPage - 1) * itemsPerPage) + 1} - {Math.min(currentPage * itemsPerPage, filteredBots.length)} of {filteredBots.length}
          </div>
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-1">
              <button 
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="w-8 h-8 flex items-center justify-center rounded-md border border-slate-300 disabled:opacity-50 hover:bg-slate-50 transition"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <div className="w-8 h-8 flex items-center justify-center rounded-md border border-slate-300 font-bold text-slate-800 bg-white">
                {currentPage}
              </div>
              <button 
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="w-8 h-8 flex items-center justify-center rounded-md border border-slate-300 disabled:opacity-50 hover:bg-slate-50 transition"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
            <select 
              value={itemsPerPage}
              onChange={(e) => {
                setItemsPerPage(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="border border-slate-300 rounded-md px-2 py-1.5 font-medium focus:outline-none"
            >
              <option value={10}>10 / page</option>
              <option value={20}>20 / page</option>
              <option value={50}>50 / page</option>
            </select>
          </div>
        </div>
      )}

    </div>
  );
}
