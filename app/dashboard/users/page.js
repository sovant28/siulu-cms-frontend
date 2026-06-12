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
  ChevronRight
} from 'lucide-react';

export default function UsersList() {
  const router = useRouter();
  const [role, setRole] = useState(null);
  const [team, setTeam] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  useEffect(() => {
    const initPage = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          const { data: roleData } = await supabase
            .from('user_roles')
            .select('role')
            .eq('user_id', session.user.id)
            .single();
          setRole(roleData?.role);
        }
        await fetchTeam();
      } catch (err) {
        console.error("Gagal menginisialisasi manajemen tim:", err);
      } finally {
        setLoading(false);
      }
    };
    initPage();
  }, []);

  const fetchTeam = async () => {
    try {
      const { data, error: fetchErr } = await supabase
        .from('user_roles')
        .select('*')
        .order('created_at', { ascending: false });

      if (!fetchErr && data) {
        setTeam(data);
      }
    } catch (err) {
      console.error("Gagal mengambil data tim admin:", err);
    }
  };

  const handleDeleteAdminRole = async (targetUserId, targetEmail) => {
    if (role !== 'super_admin') {
      alert("Akses ditolak: Hanya Super-Admin yang diizinkan mencabut hak akses tim!");
      return;
    }
    
    const { data: { session } } = await supabase.auth.getSession();
    if (session && session.user.id === targetUserId) {
      alert("Operasi ilegal: Anda tidak dapat mencabut peran akun Anda sendiri!");
      return;
    }

    if (!confirm(`Apakah Anda yakin ingin mencabut seluruh hak akses administrasi untuk '${targetEmail}' secara permanen?`)) return;

    try {
      const { error: deleteErr } = await supabase
        .from('user_roles')
        .delete()
        .eq('user_id', targetUserId);

      if (!deleteErr) {
        alert("Akses admin berhasil dicabut!");
        await fetchTeam();
      } else {
        alert(`Gagal mencabut akses: ${deleteErr.message}`);
      }
    } catch (err) {
      console.error(err);
    }
  };

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
      case 'super_admin': return 'bg-orange-50 text-[#F35A05]';
      case 'admin_konten': return 'bg-sky-50 text-sky-600';
      case 'validator': return 'bg-emerald-50 text-emerald-600';
      default: return 'bg-slate-50 text-slate-600';
    }
  };

  const filteredTeam = team.filter(t => {
    const q = searchQuery.toLowerCase();
    return (
      t.email.toLowerCase().includes(q) ||
      getRoleLabel(t.role).toLowerCase().includes(q)
    );
  });

  const totalPages = Math.ceil(filteredTeam.length / itemsPerPage) || 1;
  const paginatedTeam = filteredTeam.slice(
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
          <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest pl-1">Menyelaraskan Tim Admin...</p>
        </div>
      </div>
    );
  }

  if (role !== 'super_admin') {
    return (
      <div className="h-[60vh] flex flex-col items-center justify-center text-center space-y-4 max-w-md mx-auto">
        <div className="w-16 h-16 rounded-lg bg-red-50 border border-red-150 flex items-center justify-center text-red-500 text-2xl">
          ⚠️
        </div>
        <div className="space-y-1">
          <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider">Akses Terbatas</h4>
          <p className="text-[11px] text-slate-500 font-semibold leading-relaxed">
            Halaman ini hanya dapat diakses oleh akun dengan tingkat wewenang **Super-Admin**.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col w-full font-sans pb-10 space-y-8">
      
      {/* Title */}
      <div>
        <h2 className="text-2xl font-black text-slate-800 tracking-tight">Anggota Tim</h2>
      </div>

      {/* Tabs */}
      <div className="flex items-center space-x-6 border-b border-slate-200">
        <div className="pb-3 border-b-2 border-[#F35A05] text-[#F35A05] font-bold text-sm">
          Semua Pengguna ({team.length})
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
              placeholder="Cari email atau role..."
              className="w-72 bg-white border border-slate-300 rounded-lg pl-9 pr-4 py-2 text-xs text-slate-800 font-medium placeholder-slate-400 focus:outline-none focus:border-[#F35A05] transition"
            />
          </div>
          <button className="flex items-center space-x-2 px-4 py-2 bg-white border border-slate-300 rounded-lg text-xs font-bold text-slate-700 hover:bg-slate-50 transition">
            <Filter className="w-3.5 h-3.5" />
            <span>Filter</span>
          </button>
        </div>
        
        <button 
          onClick={() => router.push('/dashboard/users/add')}
          className="flex items-center space-x-2 bg-[#F35A05] hover:bg-[#d94200] text-white px-5 py-2.5 rounded-lg text-xs font-bold transition active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>New User</span>
        </button>
      </div>

      {/* Clean Table */}
      <div className="w-full overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b border-slate-200 text-slate-500 font-bold">
              <th className="pb-3 px-2 font-medium w-[300px]">Email</th>
              <th className="pb-3 px-2 font-medium w-[150px]">Role / Akses</th>
              <th className="pb-3 px-2 font-medium">Tanggal Bergabung</th>
              <th className="pb-3 px-2 font-medium text-right w-[100px]">Action</th>
            </tr>
          </thead>
          <tbody className="text-slate-700">
            {paginatedTeam.length === 0 ? (
              <tr>
                <td colSpan="4" className="py-12 text-center text-slate-500 italic border-b border-slate-200">
                  Tidak ditemukan tim yang cocok.
                </td>
              </tr>
            ) : (
              paginatedTeam.map((member) => (
                <tr key={member.id} className="border-b border-slate-200 hover:bg-slate-50/50 transition group">
                  <td className="py-4 px-2">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center font-bold">
                        {member.email.charAt(0).toUpperCase()}
                      </div>
                      <div className="font-bold text-slate-800 text-sm">{member.email}</div>
                    </div>
                  </td>
                  <td className="py-4 px-2">
                    <span className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-bold ${getRoleBadgeStyle(member.role)}`}>
                      {getRoleLabel(member.role)}
                    </span>
                  </td>
                  <td className="py-4 px-2 text-slate-500 font-medium">
                    {new Date(member.created_at).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })}
                  </td>
                  <td className="py-4 px-2 text-right">
                    <div className="flex items-center justify-end space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => handleDeleteAdminRole(member.user_id, member.email)}
                        className="p-1.5 text-slate-400 hover:text-red-500 transition"
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
      {filteredTeam.length > 0 && (
        <div className="flex items-center justify-between text-xs text-slate-500 mt-2">
          <div>
            Showing {((currentPage - 1) * itemsPerPage) + 1} - {Math.min(currentPage * itemsPerPage, filteredTeam.length)} of {filteredTeam.length}
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
