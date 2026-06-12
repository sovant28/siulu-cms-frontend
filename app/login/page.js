"use client";
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../supabase';

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) {
        let IndonesianError = authError.message;
        if (authError.message.toLowerCase().includes('invalid login credentials')) {
          IndonesianError = 'Email atau password yang Anda masukkan salah.';
        } else if (authError.message.toLowerCase().includes('rate limit')) {
          IndonesianError = 'Terlalu banyak percobaan login. Silakan coba beberapa saat lagi.';
        }
        setError(IndonesianError);
        setLoading(false);
        return;
      }

      const { data: roleData, error: roleError } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', data.user.id);

      if (roleError || !roleData || roleData.length === 0) {
        await supabase.auth.signOut();
        setError('Akun Anda berhasil terverifikasi, tetapi tidak memiliki peran (role) tim admin di sistem. Hubungi Super-Admin.');
        setLoading(false);
        return;
      }

      router.replace('/dashboard');
    } catch (err) {
      console.error("Login Error:", err);
      setError('Terjadi kesalahan koneksi sistem. Pastikan koneksi internet Anda stabil.');
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-gray-50 px-4 font-sans antialiased text-slate-900">
      
      <div className="w-full max-w-md bg-white border border-slate-200 rounded-2xl p-8 space-y-6 shadow-sm">
        
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center space-x-1.5">
            <span className="text-[#F35A05] font-black text-2xl tracking-tighter">Siulu'</span>
            <span className="h-1.5 w-1.5 rounded-full bg-[#F35A05] animate-pulse"></span>
            <span className="text-[9px] px-2 py-0.5 rounded-full bg-orange-50 text-[#F35A05] font-bold uppercase tracking-widest ml-1 border border-orange-100">Console</span>
          </div>
          <h2 className="text-xs font-bold text-slate-700 uppercase tracking-widest mt-2">Masuk ke Konsol Tim Admin</h2>
          <p className="text-[11px] text-slate-500 font-medium leading-relaxed">Pengelolaan Bot & AI Knowledge Base Mebali AI</p>
        </div>

        {error && (
          <div className="p-3.5 bg-red-50 border border-red-100 text-red-600 rounded-xl text-xs font-medium leading-normal">
            <div className="flex items-start space-x-2">
              <span>⚠️</span>
              <span>{error}</span>
            </div>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-1">
            <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-widest pl-1">Email Karyawan</label>
            <input 
              type="email" 
              required 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@mebali.ai"
              className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3.5 text-xs text-slate-900 font-medium placeholder-slate-400 focus:outline-none focus:border-[#F35A05] transition"
            />
          </div>

          <div className="space-y-1">
            <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-widest pl-1">Kata Sandi</label>
            <input 
              type="password" 
              required 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3.5 text-xs text-slate-900 font-medium placeholder-slate-400 focus:outline-none focus:border-[#F35A05] transition"
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full py-3.5 px-4 bg-[#F35A05] hover:bg-[#d94200] disabled:bg-orange-300 text-white font-bold rounded-xl text-xs tracking-wider uppercase transition active:scale-[0.98] flex items-center justify-center space-x-2 cursor-pointer shadow-sm"
          >
            {loading ? (
              <>
                <span className="animate-spin h-4.5 w-4.5 border-[2px] border-white border-t-transparent rounded-full"></span>
                <span>Memproses...</span>
              </>
            ) : (
              <span>Masuk Sekarang</span>
            )}
          </button>
        </form>

        <div className="text-center pt-2 border-t border-slate-100">
          <p className="text-[9.5px] text-slate-500 font-medium leading-normal">
            Lupa kata sandi atau butuh akses akun baru?<br/>
            Hubungi Super-Admin sistem pariwisata Tana Toraja.
          </p>
        </div>

      </div>
    </div>
  );
}
