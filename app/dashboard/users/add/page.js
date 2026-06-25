"use client";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../../supabase';
import { createClient } from '@supabase/supabase-js';
import { ChevronLeft, Save } from 'lucide-react';

export default function AddUser() {
  const router = useRouter();
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [adminRole, setAdminRole] = useState('admin_konten');
  const [formLoading, setFormLoading] = useState(false);
  const [error, setError] = useState('');

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
          
          if (roleData?.role !== 'super_admin') {
            alert("Akses ditolak: Hanya Super-Admin yang diizinkan mendaftarkan admin baru!");
            router.push('/dashboard/users');
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

  const handleRegisterAdmin = async (e) => {
    e.preventDefault();
    setFormLoading(true);
    setError('');

    try {
      // Create a temporary isolated client to register the new auth user.
      // This prevents the new signup from hijacking/disrupting the logged-in super_admin's session.
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://dummy-url.supabase.co';
      const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'dummy-key';
      const tempSupabase = createClient(supabaseUrl, supabaseAnonKey, {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
          detectSessionInUrl: false
        }
      });

      const { data: authData, error: authErr } = await tempSupabase.auth.signUp({
        email: email.trim(),
        password: password,
      });

      if (authErr) {
        setError(`Gagal mendaftarkan autentikasi: ${authErr.message}`);
        setFormLoading(false);
        return;
      }

      if (!authData || !authData.user) {
        setError("Respon kosong saat pendaftaran auth.");
        setFormLoading(false);
        return;
      }

      const newUserId = authData.user.id;

      const { error: roleErr } = await supabase
        .from('user_roles')
        .insert({
          user_id: newUserId,
          email: email.trim(),
          role: adminRole
        });

      if (roleErr) {
        setError(`Gagal menyimpan peran (role): ${roleErr.message}`);
        setFormLoading(false);
        return;
      }

      alert(`Sukses! Akun admin '${email}' berhasil didaftarkan.`);
      router.push('/dashboard/users');
    } catch (err) {
      console.error(err);
      setError("Terjadi kesalahan sistem saat mendaftarkan user.");
    } finally {
      setFormLoading(false);
    }
  };

  if (loading) return null;

  return (
    <div className="flex flex-col w-full font-sans pb-10 space-y-8">
      
      <div className="flex items-center space-x-4">
        <button 
          onClick={() => router.push('/dashboard/users')}
          className="p-2 bg-slate-50 hover:bg-slate-100 border border-slate-300 rounded-lg text-slate-500 hover:text-slate-800 transition"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <div>
          <h2 className="text-2xl font-black text-slate-800 tracking-tight">Tambah Anggota Tim</h2>
        </div>
      </div>

      <div className="max-w-xl bg-white border border-slate-200/80 rounded-xl p-8">
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-100 text-red-600 rounded-lg text-sm font-bold leading-normal">
            {error}
          </div>
        )}

        <form onSubmit={handleRegisterAdmin} className="space-y-6">
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-700">Email Anggota Baru *</label>
            <input 
              type="email" required 
              value={email} onChange={(e) => setEmail(e.target.value)}
              placeholder="nama@mebali.ai"
              className="w-full bg-white border border-slate-300 rounded-lg px-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:border-[#F35A05] transition"
            />
          </div>
          
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-700">Kata Sandi Sementara *</label>
            <input 
              type="password" required minLength={6}
              value={password} onChange={(e) => setPassword(e.target.value)}
              placeholder="Minimal 6 karakter"
              className="w-full bg-white border border-slate-300 rounded-lg px-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:border-[#F35A05] transition"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-700">Hak Akses (Role) *</label>
            <select 
              value={adminRole} onChange={(e) => setAdminRole(e.target.value)}
              className="w-full bg-white border border-slate-300 rounded-lg px-3.5 py-2.5 text-sm text-slate-900 focus:outline-none focus:border-[#F35A05] transition"
            >
              <option value="admin_konten">Admin Konten</option>
              <option value="validator">Validator</option>
              <option value="admin_bot">Admin Bot</option>
              <option value="analyst">Analyst</option>
              <option value="super_admin">Super-Admin</option>
            </select>
          </div>

          <div className="pt-6 mt-6 border-t border-slate-200">
            <button 
              type="submit" disabled={formLoading}
              className="px-6 py-2.5 bg-[#F35A05] hover:bg-[#d94200] text-white font-bold rounded-lg text-sm transition flex items-center space-x-2"
            >
              {formLoading ? (
                <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></span>
              ) : <Save className="w-4 h-4" />}
              <span>Daftarkan Anggota</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
