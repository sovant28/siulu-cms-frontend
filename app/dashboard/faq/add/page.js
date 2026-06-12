"use client";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../../supabase';
import { ChevronLeft, Save } from 'lucide-react';

export default function AddGreeting() {
  const router = useRouter();
  const [role, setRole] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  const [greetPattern, setGreetPattern] = useState('');
  const [greetReply, setGreetReply] = useState('');
  const [formLoading, setFormLoading] = useState(false);

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
          
          if (roleData?.role !== 'super_admin' && roleData?.role !== 'admin_konten') {
            alert("Akses ditolak: Anda tidak diizinkan mengelola pola sapaan!");
            router.push('/dashboard/faq');
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    initPage();
  }, [router]);

  const handleSaveGreeting = async (e) => {
    e.preventDefault();
    setFormLoading(true);

    const payload = {
      pattern: greetPattern,
      reply: greetReply
    };

    try {
      const res = await fetch(`${API_URL}/greetings/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        alert("Pola sapaan baru berhasil dibuat!");
        router.push('/dashboard/faq');
      } else {
        const errData = await res.json();
        alert(`Gagal menyimpan: ${errData.detail || 'Error'}`);
      }
    } catch (err) {
      console.error(err);
      alert("Kesalahan koneksi saat menyimpan.");
    } finally {
      setFormLoading(false);
    }
  };

  if (loading) return null;

  return (
    <div className="flex flex-col w-full font-sans pb-10 space-y-8">
      
      <div className="flex items-center space-x-4">
        <button 
          onClick={() => router.push('/dashboard/faq')}
          className="p-2 bg-slate-50 hover:bg-slate-100 border border-slate-300 rounded-lg text-slate-500 hover:text-slate-800 transition"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <div>
          <h2 className="text-2xl font-black text-slate-800 tracking-tight">Tambah Pola Sapaan</h2>
        </div>
      </div>

      <div className="max-w-2xl bg-white border border-slate-200 rounded-xl p-8 shadow-sm">
        <form onSubmit={handleSaveGreeting} className="space-y-6">
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-700">Pola Sapaan (Regex) *</label>
            <input 
              type="text" required 
              value={greetPattern} onChange={(e) => setGreetPattern(e.target.value)}
              placeholder="Contoh: halo|hai|selamat pagi"
              className="w-full bg-white border border-slate-300 rounded-lg px-4 py-2.5 text-sm text-slate-900 font-mono focus:outline-none focus:border-[#F35A05] transition"
            />
            <p className="text-[10px] text-slate-500 font-medium">Gunakan Regex untuk mencocokkan berbagai variasi pesan pengguna. Pipa (|) berarti "atau".</p>
          </div>
          
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-700">Balasan Statis Bot *</label>
            <textarea 
              required rows={4}
              value={greetReply} onChange={(e) => setGreetReply(e.target.value)}
              placeholder="Halo! Saya Mebali AI, asisten wisata virtual Tana Toraja. Ada yang bisa saya bantu hari ini?"
              className="w-full bg-white border border-slate-300 rounded-lg px-4 py-3 text-sm text-slate-900 focus:outline-none focus:border-[#F35A05] transition resize-y"
            />
            <p className="text-[10px] text-slate-500 font-medium">Balasan ini akan dikirim jika pesan pengguna cocok dengan pola di atas. Proses RAG tidak akan dijalankan.</p>
          </div>

          <div className="pt-6 mt-6 border-t border-slate-200">
            <button 
              type="submit" disabled={formLoading}
              className="px-6 py-2.5 bg-[#F35A05] hover:bg-[#d94200] text-white font-bold rounded-lg text-sm transition flex items-center space-x-2"
            >
              {formLoading ? (
                <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></span>
              ) : <Save className="w-4 h-4" />}
              <span>Simpan Sapaan</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
