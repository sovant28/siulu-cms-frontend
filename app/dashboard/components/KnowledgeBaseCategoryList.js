"use client";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../supabase';
import { 
  Trash2, 
  Edit3, 
  Search, 
  Plus, 
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

export default function KnowledgeBaseCategoryList({ 
  title, 
  description,
  defaultType, 
  filterFn 
}) {
  const router = useRouter();
  const [role, setRole] = useState(null);
  const [token, setToken] = useState(null);
  const [destinations, setDestinations] = useState([]);
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
        await fetchDestinations();
      } catch (err) {
        console.error("Gagal menginisialisasi RAG console:", err);
      } finally {
        setLoading(false);
      }
    };
    initPage();
  }, []);

  const fetchDestinations = async () => {
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

      const res = await fetchWithTimeout(`${API_URL}/knowledge/destinasi`, {
        headers: { 'Authorization': `Bearer ${currentToken}` }
      });
      
      if (res.ok) {
        const data = await res.json();
        setDestinations(data);
        return;
      }
    } catch (err) {
      console.warn("Gagal mengambil RAG dari API, mencoba fallback Supabase:", err);
    }

    // Fallback: Ambil data langsung dari Supabase untuk menghindari cek CORS API yang tersangkut
    try {
      const { data, error } = await supabase
        .from('destinasi_wisata')
        .select('*')
        .order('terakhir_diperbarui', { ascending: false });

      if (error) throw error;

      const formatted = (data || []).map(item => {
        let gps = item.koordinat_gps;
        if (typeof gps === 'string' && gps.startsWith("POINT")) {
          try {
            const parts = gps.replace("POINT(", "").replace(")", "").split(" ");
            gps = [parseFloat(parts[1]), parseFloat(parts[0])];
          } catch (e) {}
        }
        return {
          ...item,
          koordinat_gps: gps
        };
      });
      setDestinations(formatted);
    } catch (dbErr) {
      console.error("Gagal memuat RAG via Supabase fallback:", dbErr);
    }
  };

  const handleDeleteDestination = async (id) => {
    if (role !== 'super_admin' && role !== 'admin_konten') {
      alert("Akses ditolak: Peran Anda tidak diizinkan mengelola pengetahuan RAG!");
      return;
    }
    if (!confirm("Apakah Anda yakin ingin menghapus data ini beserta seluruh data RAG-nya?")) return;

    try {
      const { error } = await supabase
        .from('destinasi_wisata')
        .delete()
        .eq('id', id);

      if (!error) {
        alert("Dokumen berhasil dihapus secara permanen!");
        await fetchDestinations();
      } else {
        alert(`Gagal menghapus dokumen: ${error.message}`);
      }
    } catch (err) {
      console.error(err);
      alert("Terjadi kesalahan koneksi database.");
    }
  };

  const getCategoryBadge = (cat) => {
    switch (cat) {
      case 'alam': return 'bg-emerald-50 text-emerald-600';
      case 'budaya_religi': return 'bg-purple-50 text-purple-600';
      case 'kuliner': return 'bg-amber-50 text-amber-600';
      case 'event': return 'bg-rose-50 text-rose-600';
      case 'darurat': return 'bg-red-50 text-red-600';
      case 'transportasi': return 'bg-blue-50 text-blue-600';
      case 'akomodasi': return 'bg-indigo-50 text-indigo-600';
      default: return 'bg-slate-50 text-slate-600';
    }
  };

  const formatCategoryText = (cat) => {
    if (!cat) return '';
    return cat.split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  };

  // Filter based on parent filterFn and search query
  const categoryFiltered = (destinations || []).filter(item => {
    return item && filterFn(item);
  });
  
  const finalFiltered = categoryFiltered.filter(dest => {
    if (!dest) return false;
    const q = searchQuery.toLowerCase();
    const id = dest.id || '';
    const nama = dest.nama_tempat || '';
    const kat = dest.kategori || '';
    const wilayah = dest.lokasi_wilayah || '';
    
    return (
      id.toLowerCase().includes(q) ||
      nama.toLowerCase().includes(q) ||
      kat.toLowerCase().includes(q) ||
      wilayah.toLowerCase().includes(q)
    );
  });

  const totalPages = Math.ceil(finalFiltered.length / itemsPerPage) || 1;
  const paginatedDestinations = finalFiltered.slice(
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
          <p className="text-[9px] font-bold text-slate-500 tracking-widest pl-1">Memuat Data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col w-full font-sans pb-10 space-y-8">
      
      {/* Title */}
      <div className="flex flex-col space-y-1">
        <h2 className="text-2xl font-black text-slate-800 tracking-tight">{title}</h2>
        {description && <p className="text-xs font-semibold text-slate-500">{description}</p>}
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
              placeholder="Cari ID, nama tempat, wilayah..."
              className="w-72 bg-white border border-slate-300 rounded-lg pl-9 pr-4 py-2 text-xs text-slate-800 font-medium placeholder-slate-400 focus:outline-none focus:border-[#F35A05] transition"
            />
          </div>
        </div>
        
        <button 
          onClick={() => router.push(`/dashboard/knowledge/add?type=${defaultType}`)}
          className="flex items-center space-x-2 bg-[#F35A05] hover:bg-[#d94200] text-white px-5 py-2.5 rounded-lg text-xs font-bold transition active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>New Document</span>
        </button>
      </div>

      {/* Clean Table */}
      <div className="w-full overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b border-slate-200 text-slate-500 font-bold">
              <th className="pb-3 px-2 font-medium w-[120px]">ID</th>
              <th className="pb-3 px-2 font-medium">Nama Tempat</th>
              <th className="pb-3 px-2 font-medium w-[150px]">Kategori</th>
              <th className="pb-3 px-2 font-medium w-[200px]">Wilayah</th>
              <th className="pb-3 px-2 font-medium text-right w-[100px]">Action</th>
            </tr>
          </thead>
          <tbody className="text-slate-700">
            {paginatedDestinations.length === 0 ? (
              <tr>
                <td colSpan="5" className="py-12 text-center text-slate-500 italic border-b border-slate-200">
                  Tidak ditemukan dokumen yang cocok.
                </td>
              </tr>
            ) : (
              paginatedDestinations.map((dest) => (
                <tr key={dest.id} className="border-b border-slate-200 hover:bg-slate-50/50 transition group">
                  <td className="py-4 px-2 text-slate-500 font-mono">
                    {dest.id}
                  </td>
                  <td className="py-4 px-2">
                    <div className="font-bold text-slate-800 text-sm truncate max-w-[250px]">
                      {dest.nama_tempat}
                    </div>
                  </td>
                  <td className="py-4 px-2">
                    <span className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-bold ${getCategoryBadge(dest.kategori)}`}>
                      {formatCategoryText(dest.kategori)}
                    </span>
                  </td>
                  <td className="py-4 px-2 text-slate-500 font-medium">
                    {dest.lokasi_wilayah}
                  </td>
                  <td className="py-4 px-2 text-right">
                    <div className="flex items-center justify-end space-x-1">
                      <button 
                        onClick={() => router.push(`/dashboard/knowledge/edit/${dest.id}`)}
                        className="p-1.5 text-slate-400 hover:text-[#F35A05] transition"
                        title="Edit Dokumen"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleDeleteDestination(dest.id)}
                        className="p-1.5 text-slate-400 hover:text-red-500 transition"
                        title="Hapus Dokumen"
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
      {finalFiltered.length > 0 && (
        <div className="flex items-center justify-between text-xs text-slate-500 mt-2">
          <div>
            Showing {((currentPage - 1) * itemsPerPage) + 1} - {Math.min(currentPage * itemsPerPage, finalFiltered.length)} of {finalFiltered.length}
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
