"use client";
import { useState, useEffect, Fragment } from 'react';
import { supabase } from '../../supabase';
import { 
  ThumbsUp, 
  ThumbsDown, 
  Trash2, 
  Search, 
  Filter,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

export default function FeedbackList() {
  const [role, setRole] = useState(null);
  const [token, setToken] = useState(null);
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedId, setExpandedId] = useState(null);

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
        await fetchFeedbacks();
      } catch (err) {
        console.error("Gagal menginisialisasi feedback console:", err);
      } finally {
        setLoading(false);
      }
    };
    initPage();
  }, []);

  const fetchFeedbacks = async () => {
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

      const res = await fetchWithTimeout(`${API_URL}/bots/feedback`, {
        headers: { 'Authorization': `Bearer ${currentToken}` }
      });
      if (res.ok) {
        const data = await res.json();
        setFeedbacks(data);
        return;
      }
    } catch (err) {
      console.warn("Gagal mengambil data feedback dari API, mencoba fallback Supabase:", err);
    }

    // Fallback: Ambil data langsung dari Supabase
    try {
      const { data, error } = await supabase
        .from('chat_logs_temporary')
        .select('*')
        .not('feedback_type', 'is', null)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const formatted = (data || []).map(item => ({
        id: item.id,
        is_positive: item.feedback_type === 'up',
        user_message: item.user_query,
        bot_response: item.ai_response,
        komentar: item.feedback_note,
        created_at: item.created_at,
        model_used: item.model_used,
        rag_sources: item.rag_sources
      }));
      setFeedbacks(formatted);
    } catch (dbErr) {
      console.error("Gagal memuat feedback via Supabase fallback:", dbErr);
    }
  };

  const handleDeleteFeedback = async (id) => {
    if (role !== 'super_admin' && role !== 'admin_konten') {
      alert("Akses ditolak: Hanya admin yang diizinkan menghapus feedback!");
      return;
    }
    if (!confirm("Apakah Anda yakin ingin menghapus data feedback ini permanen?")) return;

    try {
      const res = await fetch(`${API_URL}/bots/feedback/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        await fetchFeedbacks();
      } else {
        alert("Gagal menghapus feedback.");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const filteredFeedbacks = feedbacks.filter(f => {
    const q = searchQuery.toLowerCase();
    return (
      (f.user_message || '').toLowerCase().includes(q) ||
      (f.bot_response || '').toLowerCase().includes(q) ||
      (f.komentar || '').toLowerCase().includes(q)
    );
  });

  const totalPages = Math.ceil(filteredFeedbacks.length / itemsPerPage) || 1;
  const paginatedFeedbacks = filteredFeedbacks.slice(
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
          <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest pl-1">Menyelaraskan Feedback...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col w-full font-sans pb-10 space-y-8">
      
      {/* Title */}
      <div>
        <h2 className="text-2xl font-black text-slate-800 tracking-tight">Umpan Balik Pengguna</h2>
      </div>

      {/* Tabs */}
      <div className="flex items-center space-x-6 border-b border-slate-200">
        <div className="pb-3 border-b-2 border-[#F35A05] text-[#F35A05] font-bold text-sm">
          Semua Umpan Balik ({feedbacks.length})
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
              placeholder="Cari pesan atau komentar..."
              className="w-72 bg-white border border-slate-300 rounded-lg pl-9 pr-4 py-2 text-xs text-slate-800 font-medium placeholder-slate-400 focus:outline-none focus:border-[#F35A05] transition"
            />
          </div>
          <button className="flex items-center space-x-2 px-4 py-2 bg-white border border-slate-300 rounded-lg text-xs font-bold text-slate-700 hover:bg-slate-50 transition">
            <Filter className="w-3.5 h-3.5" />
            <span>Filter</span>
          </button>
        </div>
      </div>

      {/* Clean Table */}
      <div className="w-full overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b border-slate-200 text-slate-500 font-bold">
              <th className="pb-3 px-2 w-[40px]"></th>
              <th className="pb-3 px-2 font-medium w-[80px]">Rating</th>
              <th className="pb-3 px-2 font-medium w-[250px]">Konteks Percakapan</th>
              <th className="pb-3 px-2 font-medium">Komentar Tambahan</th>
              <th className="pb-3 px-2 font-medium w-[150px]">Tanggal</th>
              <th className="pb-3 px-2 font-medium text-right w-[80px]">Action</th>
            </tr>
          </thead>
          <tbody className="text-slate-700">
            {paginatedFeedbacks.length === 0 ? (
              <tr>
                <td colSpan="6" className="py-12 text-center text-slate-500 italic border-b border-slate-200">
                  Belum ada umpan balik yang masuk.
                </td>
              </tr>
            ) : (
              paginatedFeedbacks.map((item) => {
                const isExpanded = expandedId === item.id;
                return (
                  <Fragment key={item.id}>
                    <tr 
                      className="border-b border-slate-200 hover:bg-slate-50/50 transition group cursor-pointer"
                      onClick={() => setExpandedId(isExpanded ? null : item.id)}
                    >
                      <td className="py-4 px-2 text-slate-400">
                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </td>
                      <td className="py-4 px-2">
                        {item.is_positive ? (
                          <div className="flex items-center space-x-1.5 text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full w-max">
                            <ThumbsUp className="w-3.5 h-3.5" />
                            <span className="text-[10px] font-bold">Positif</span>
                          </div>
                        ) : (
                          <div className="flex items-center space-x-1.5 text-rose-600 bg-rose-50 px-2.5 py-1 rounded-full w-max">
                            <ThumbsDown className="w-3.5 h-3.5" />
                            <span className="text-[10px] font-bold">Negatif</span>
                          </div>
                        )}
                      </td>
                      <td className="py-4 px-2">
                        <div className="space-y-1 max-w-[250px]">
                          <div className="text-[10px] font-bold text-slate-400">User:</div>
                          <div className="text-slate-800 font-medium truncate">{item.user_message || '(Tidak ada pesan)'}</div>
                          <div className="text-[10px] font-bold text-slate-400 mt-2">Bot:</div>
                          <div className="text-slate-600 text-[10px] truncate">{item.bot_response || '(Tidak ada respon)'}</div>
                        </div>
                      </td>
                      <td className="py-4 px-2 font-medium text-slate-800 max-w-sm">
                        {item.komentar ? `"${item.komentar}"` : <span className="text-slate-400 italic">Tidak ada komentar</span>}
                      </td>
                      <td className="py-4 px-2 text-slate-500 font-medium">
                        {new Date(item.created_at).toLocaleString('id-ID')}
                      </td>
                      <td className="py-4 px-2 text-right">
                        <div className="flex items-center justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteFeedback(item.id);
                            }}
                            className="p-1.5 text-slate-400 hover:text-red-500 transition"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                    
                    {isExpanded && (
                      <tr className="bg-slate-50/80">
                        <td colSpan="6" className="p-5 border-b border-slate-200">
                          <div className="bg-white rounded-xl border border-slate-200/80 p-5 space-y-5 shadow-sm animate-in fade-in slide-in-from-top-2 duration-200">
                            
                            {/* Header Info */}
                            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
                              <div className="flex items-center space-x-2.5">
                                <span className="text-xs font-bold text-slate-400">Model AI:</span>
                                <span className="px-2.5 py-1 bg-slate-100 text-slate-800 font-semibold rounded-md text-[10px]">
                                  {item.model_used || "Tidak tercatat (Normal Mode)"}
                                </span>
                              </div>
                              <div className="text-[10px] text-slate-400 font-medium">
                                ID Log: <code className="bg-slate-50 px-1 py-0.5 rounded border text-[9px]">{item.id}</code>
                              </div>
                            </div>

                            {/* Percakapan Penuh */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div className="bg-slate-50/50 rounded-xl p-3.5 border border-slate-100">
                                <div className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1">Pesan Pengguna (Kueri Lengkap)</div>
                                <div className="text-slate-800 text-xs font-medium whitespace-pre-wrap leading-relaxed">
                                  {item.user_message}
                                </div>
                              </div>
                              <div className="bg-slate-50/50 rounded-xl p-3.5 border border-slate-100">
                                <div className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1">Respons AI Lengkap</div>
                                <div className="text-slate-800 text-xs font-medium whitespace-pre-wrap leading-relaxed">
                                  {item.bot_response}
                                </div>
                              </div>
                            </div>

                            {/* RAG Sources Audit */}
                            <div>
                              <div className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-3">Analisis Dokumen RAG Terambil (Vector Search Chunks)</div>
                              
                              {item.rag_sources && item.rag_sources.length > 0 ? (
                                <div className="space-y-3">
                                  {item.rag_sources.map((src, srcIdx) => {
                                    const similarity = src.similarity || 0;
                                    let scoreColor = "bg-rose-50 text-rose-700 border-rose-200";
                                    let scoreLabel = "Rendah (Low)";
                                    if (similarity >= 0.60) {
                                      scoreColor = "bg-emerald-50 text-emerald-700 border-emerald-200";
                                      scoreLabel = "Tinggi (High)";
                                    } else if (similarity >= 0.50) {
                                      scoreColor = "bg-amber-50 text-amber-700 border-amber-200";
                                      scoreLabel = "Sedang (Medium)";
                                    }

                                    return (
                                      <div key={srcIdx} className="border border-slate-200 rounded-xl overflow-hidden bg-white">
                                        {/* Source Header */}
                                        <div className="bg-slate-50 px-3.5 py-2 border-b border-slate-200 flex items-center justify-between flex-wrap gap-2 text-[10px]">
                                          <div className="flex items-center space-x-2 font-bold text-slate-800">
                                            <span className="w-5 h-5 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center text-[9px]">{srcIdx + 1}</span>
                                            <span>{src.nama_tempat}</span>
                                            <span className="text-slate-400 font-normal">({src.lokasi_wilayah} • {src.kategori})</span>
                                          </div>
                                          <div className="flex items-center space-x-2">
                                            {src.google_maps_url && (
                                              <a 
                                                href={src.google_maps_url} 
                                                target="_blank" 
                                                rel="noopener noreferrer"
                                                className="text-[#F35A05] font-bold hover:underline mr-2"
                                                onClick={(e) => e.stopPropagation()}
                                              >
                                                Peta Lokasi ↗
                                              </a>
                                            )}
                                            <span className={`px-2 py-0.5 border rounded-full font-bold text-[9px] ${scoreColor}`}>
                                              Similarity: {similarity.toFixed(4)} ({scoreLabel})
                                            </span>
                                          </div>
                                        </div>
                                        {/* Source Content */}
                                        <div className="p-3 text-xs text-slate-600 bg-slate-50/20 font-mono whitespace-pre-wrap leading-relaxed border-t border-slate-100">
                                          {src.content_chunk}
                                        </div>
                                      </div>
                                    );
                                  })}
                                </div>
                              ) : (
                                <div className="bg-rose-50 border border-rose-100 rounded-xl p-4 text-xs text-rose-800 flex flex-col space-y-1">
                                  <span className="font-bold">⚠️ RAG Kosong (Database Not Hit)</span>
                                  <span>Tidak ada potongan dokumen pengetahuan yang berhasil ditarik dari database untuk kueri ini.</span>
                                </div>
                              )}
                            </div>

                            {/* Auto Diagnostics Box (Only for negative feedback) */}
                            {!item.is_positive && (
                              <div className="bg-amber-50/50 border border-amber-200/80 rounded-xl p-4 space-y-2.5">
                                <div className="flex items-center space-x-2 text-xs font-bold text-amber-800">
                                  <span>💡 Asisten Diagnosis Rekomendasi Solusi</span>
                                </div>
                                <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-line">
                                  {(!item.rag_sources || item.rag_sources.length === 0) ? (
                                    "Analisis: Pertanyaan wisatawan tidak menemukan dokumen relevan di database (0 match). \nTindakan: Pastikan pengetahuan terkait sudah diinput di menu CMS 'Kelola Pengetahuan', dan pastikan kata kunci kueri relevan."
                                  ) : item.rag_sources.every(s => (s.similarity || 0) < 0.55) ? (
                                    "Analisis: Dokumen ditemukan, namun tingkat kemiripan vektor sangat rendah (< 0.55). Hal ini memicu jawaban kurang akurat. \nTindakan: Tambahkan variasi kalimat pada konten dokumen di CMS agar pencarian vektor lebih sensitif, atau sesuaikan parameter threshold jika dirasa perlu."
                                  ) : (
                                    "Analisis: Dokumen RAG terambil dengan kemiripan tinggi, namun respons AI salah/menolak. Ini mengindikasikan adanya halusinasi LLM atau instruksi yang terlalu kaku. \nTindakan: Periksa instruksi sistem (system prompt) bot Anda untuk melonggarkan batas pemrosesan konteks RAG tanpa memicu halusinasi."
                                  )}
                                </p>
                              </div>
                            )}

                          </div>
                        </td>
                      </tr>
                    )}
                  </Fragment>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Bottom Right */}
      {filteredFeedbacks.length > 0 && (
        <div className="flex items-center justify-between text-xs text-slate-500 mt-2">
          <div>
            Showing {((currentPage - 1) * itemsPerPage) + 1} - {Math.min(currentPage * itemsPerPage, filteredFeedbacks.length)} of {filteredFeedbacks.length}
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
