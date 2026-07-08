"use client";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../supabase';
import { 
  Trash2, 
  Search,
  Plus,
  Filter,
  ChevronLeft,
  ChevronRight,
  Pencil
} from 'lucide-react';

export default function FaqList() {
  const router = useRouter();
  const [role, setRole] = useState(null);
  const [token, setToken] = useState(null);
  const [greetings, setGreetings] = useState([]);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Edit Greeting States
  const [editingGreeting, setEditingGreeting] = useState(null);
  const [editPattern, setEditPattern] = useState('');
  const [editReply, setEditReply] = useState('');
  const [editLoading, setEditLoading] = useState(false);
  
  const [activeTab, setActiveTab] = useState('greetings'); // greetings | logs
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
        const savedSession = localStorage.getItem('chat_session_id'); // Wait, auth is supabase session
        await fetchGreetings();
        await fetchLogs();
      } catch (err) {
        console.error("Gagal menginisialisasi FAQ console:", err);
      } finally {
        setLoading(false);
      }
    };
    initPage();
  }, []);

  const handleOpenEdit = (item) => {
    setEditingGreeting(item);
    setEditPattern(item.pattern);
    setEditReply(item.reply);
  };

  const handleUpdateGreeting = async (e) => {
    e.preventDefault();
    if (!editPattern.trim() || !editReply.trim()) {
      alert("Pola dan balasan tidak boleh kosong!");
      return;
    }
    setEditLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const currentToken = session?.access_token || token;
      const res = await fetch(`${API_URL}/greetings/${editingGreeting.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${currentToken}`
        },
        body: JSON.stringify({
          pattern: editPattern,
          reply: editReply
        })
      });
      if (res.ok) {
        await fetchGreetings();
        setEditingGreeting(null);
      } else {
        const errData = await res.json();
        alert(errData.detail || "Gagal memperbarui sapaan");
      }
    } catch (err) {
      console.error(err);
      alert("Terjadi kesalahan koneksi server");
    } finally {
      setEditLoading(false);
    }
  };

  const fetchGreetings = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const currentToken = session?.access_token || token;

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

      const res = await fetchWithTimeout(`${API_URL}/greetings/`, {
        headers: { 'Authorization': `Bearer ${currentToken}` }
      });
      if (res.ok) {
        const data = await res.json();
        setGreetings(data);
        return;
      }
    } catch (err) {
      console.warn("Gagal mengambil data sapaan dari API, mencoba fallback Supabase:", err);
    }

    // Fallback: Ambil data langsung dari Supabase
    try {
      const { data, error } = await supabase
        .from('greetings_faq')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setGreetings(data || []);
    } catch (dbErr) {
      console.error("Gagal memuat sapaan via Supabase fallback:", dbErr);
    }
  };

  const fetchLogs = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const currentToken = session?.access_token || token;

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

      const res = await fetchWithTimeout(`${API_URL}/greetings/logs`, {
        headers: { 'Authorization': `Bearer ${currentToken}` }
      });
      if (res.ok) {
        const data = await res.json();
        setLogs(data);
        return;
      }
    } catch (err) {
      console.warn("Gagal mengambil logs dari API, mencoba fallback Supabase:", err);
    }

    // Fallback: Ambil data langsung dari Supabase
    try {
      const { data, error } = await supabase
        .from('chat_logs_temporary')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      setLogs(data || []);
    } catch (dbErr) {
      console.error("Gagal memuat logs via Supabase fallback:", dbErr);
    }
  };

  const handleDeleteGreeting = async (id) => {
    if (role !== 'super_admin' && role !== 'admin_konten') {
      alert("Akses ditolak!");
      return;
    }
    if (!confirm("Hapus pola sapaan ini?")) return;
    try {
      const { error } = await supabase
        .from('greetings_faq')
        .delete()
        .eq('id', id);

      if (!error) {
        await fetchGreetings();
      } else {
        alert(`Gagal menghapus sapaan: ${error.message}`);
      }
    } catch (err) {
      console.error(err);
      alert("Terjadi kesalahan koneksi database.");
    }
  };

  const filteredData = activeTab === 'greetings' 
    ? greetings.filter(g => (g.pattern || '').toLowerCase().includes(searchQuery.toLowerCase()) || (g.reply || '').toLowerCase().includes(searchQuery.toLowerCase()))
    : logs.filter(l => (l.user_query || '').toLowerCase().includes(searchQuery.toLowerCase()) || (l.ai_response || '').toLowerCase().includes(searchQuery.toLowerCase()));

  const totalPages = Math.ceil(filteredData.length / itemsPerPage) || 1;
  const paginatedData = filteredData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, activeTab]);

  if (loading) {
    return (
      <div className="flex h-[60vh] w-full items-center justify-center">
        <div className="flex flex-col items-center space-y-3">
          <div className="h-7 w-7 animate-spin rounded-full border-[3px] border-[#F35A05] border-t-transparent"></div>
          <p className="text-[9px] font-bold text-slate-500 tracking-widest pl-1">Memuat Data FAQ...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col w-full font-sans pb-10 space-y-8">
      
      {/* Title */}
      <div>
        <h2 className="text-2xl font-black text-slate-800 tracking-tight">Sapaan & FAQ</h2>
      </div>

      {/* Tabs */}
      <div className="flex items-center space-x-6 border-b border-slate-200">
        <button 
          onClick={() => setActiveTab('greetings')}
          className={`pb-3 font-bold text-sm transition ${activeTab === 'greetings' ? 'border-b-2 border-[#F35A05] text-[#F35A05]' : 'text-slate-500 hover:text-slate-800'}`}
        >
          Sapaan Cepat ({greetings.length})
        </button>
        <button 
          onClick={() => setActiveTab('logs')}
          className={`pb-3 font-bold text-sm transition ${activeTab === 'logs' ? 'border-b-2 border-[#F35A05] text-[#F35A05]' : 'text-slate-500 hover:text-slate-800'}`}
        >
          Log Interaksi ({logs.length})
        </button>
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
              placeholder="Cari pesan atau balasan..."
              className="w-72 bg-white border border-slate-300 rounded-lg pl-9 pr-4 py-2 text-xs text-slate-800 font-medium placeholder-slate-400 focus:outline-none focus:border-[#F35A05] transition"
            />
          </div>
          <button className="flex items-center space-x-2 px-4 py-2 bg-white border border-slate-300 rounded-lg text-xs font-bold text-slate-700 hover:bg-slate-50 transition">
            <Filter className="w-3.5 h-3.5" />
            <span>Filter</span>
          </button>
        </div>
        
        {activeTab === 'greetings' && (
          <button 
            onClick={() => router.push('/dashboard/faq/add')}
            className="flex items-center space-x-2 bg-[#F35A05] hover:bg-[#d94200] text-white px-5 py-2.5 rounded-lg text-xs font-bold transition active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>New Greeting</span>
          </button>
        )}
      </div>

      {/* Clean Table */}
      <div className="w-full overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b border-slate-200 text-slate-500 font-bold">
              {activeTab === 'greetings' ? (
                <>
                  <th className="pb-3 px-2 font-medium w-[200px]">Pola Pesan User (Regex)</th>
                  <th className="pb-3 px-2 font-medium">Balasan Statis Bot</th>
                  <th className="pb-3 px-2 font-medium w-[150px]">Tanggal Dibuat</th>
                  <th className="pb-3 px-2 font-medium text-right w-[100px]">Action</th>
                </>
              ) : (
                <>
                  <th className="pb-3 px-2 font-medium w-[250px]">Pesan User</th>
                  <th className="pb-3 px-2 font-medium">Balasan Bot / RAG</th>
                  <th className="pb-3 px-2 font-medium w-[150px]">Status AI</th>
                  <th className="pb-3 px-2 font-medium w-[150px]">Waktu</th>
                </>
              )}
            </tr>
          </thead>
          <tbody className="text-slate-700">
            {paginatedData.length === 0 ? (
              <tr>
                <td colSpan="4" className="py-12 text-center text-slate-500 italic border-b border-slate-200">
                  Tidak ada data yang ditemukan.
                </td>
              </tr>
            ) : (
              paginatedData.map((item) => (
                <tr key={item.id} className="border-b border-slate-200 hover:bg-slate-50/50 transition group">
                  {activeTab === 'greetings' ? (
                    <>
                      <td className="py-4 px-2 font-mono text-slate-600 bg-slate-50/30">
                        {item.pattern}
                      </td>
                      <td className="py-4 px-2 text-slate-800 font-medium">
                        {item.reply}
                      </td>
                      <td className="py-4 px-2 text-slate-500">
                        {new Date(item.created_at).toLocaleDateString('id-ID', { year: 'numeric', month: 'short', day: 'numeric' })}
                      </td>
                      <td className="py-4 px-2 text-right">
                        <div className="flex items-center justify-end space-x-2">
                          <button 
                            onClick={() => handleOpenEdit(item)}
                            className="p-1.5 text-slate-400 hover:text-[#F35A05] transition"
                            title="Edit"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => handleDeleteGreeting(item.id)}
                            className="p-1.5 text-slate-400 hover:text-red-500 transition"
                            title="Hapus"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </>
                  ) : (
                    <>
                      <td className="py-4 px-2 font-medium text-slate-800">
                        {item.user_query}
                      </td>
                      <td className="py-4 px-2 text-slate-600 truncate max-w-sm">
                        {item.ai_response}
                      </td>
                      <td className="py-4 px-2">
                        <span className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-bold ${
                          item.tokens_used > 0 ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
                        }`}>
                          {item.tokens_used > 0 ? 'RAG Active' : 'Static / Base'}
                        </span>
                      </td>
                      <td className="py-4 px-2 text-slate-500">
                        {new Date(item.created_at).toLocaleString('id-ID')}
                      </td>
                    </>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Bottom Right */}
      {filteredData.length > 0 && (
        <div className="flex items-center justify-between text-xs text-slate-500 mt-2">
          <div>
            Showing {((currentPage - 1) * itemsPerPage) + 1} - {Math.min(currentPage * itemsPerPage, filteredData.length)} of {filteredData.length}
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

      {/* EDIT GREETING MODAL */}
      {editingGreeting && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full border border-slate-200 flex flex-col space-y-4 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-lg font-black text-slate-800 tracking-tight">Edit Sapaan Cepat</h3>
              <button 
                onClick={() => setEditingGreeting(null)}
                className="text-slate-400 hover:text-slate-600 font-bold transition text-sm"
              >
                ✕
              </button>
            </div>
            
            <form onSubmit={handleUpdateGreeting} className="space-y-4">
              <div className="flex flex-col space-y-1">
                <label className="text-[10px] font-black text-slate-500 tracking-wider">Pola Pesan User (Regex)</label>
                <input 
                  type="text"
                  value={editPattern}
                  onChange={(e) => setEditPattern(e.target.value)}
                  placeholder="Contoh: selamat malam | malam"
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2.5 text-xs text-slate-800 font-semibold focus:outline-none focus:border-[#F35A05] transition"
                  required
                />
              </div>
              
              <div className="flex flex-col space-y-1">
                <label className="text-[10px] font-black text-slate-500 tracking-wider">Balasan Statis Bot</label>
                <textarea 
                  rows={4}
                  value={editReply}
                  onChange={(e) => setEditReply(e.target.value)}
                  placeholder="Tulis balasan instan di sini..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2.5 text-xs text-slate-800 font-semibold focus:outline-none focus:border-[#F35A05] transition resize-none"
                  required
                ></textarea>
              </div>
              
              <div className="flex justify-end space-x-2 pt-2 border-t border-slate-100">
                <button 
                  type="button"
                  onClick={() => setEditingGreeting(null)}
                  className="px-4 py-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg text-xs font-bold text-slate-500 transition"
                  disabled={editLoading}
                >
                  Batal
                </button>
                <button 
                  type="submit"
                  className="px-4 py-2 bg-[#F35A05] hover:bg-[#d94200] text-white rounded-lg text-xs font-bold transition flex items-center justify-center"
                  disabled={editLoading}
                >
                  {editLoading ? 'Menyimpan...' : 'Simpan Perubahan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
