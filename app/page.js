"use client";
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from './supabase';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    const checkSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          router.replace('/dashboard');
        } else {
          router.replace('/login');
        }
      } catch (error) {
        console.error("Gagal memvalidasi sesi awal:", error);
        router.replace('/login');
      }
    };
    checkSession();
  }, [router]);

  return (
    <div className="flex h-screen w-full items-center justify-center bg-gray-50">
      <div className="flex flex-col items-center space-y-4">
        <div className="h-9 w-9 animate-spin rounded-full border-[3px] border-[#F35A05] border-t-transparent"></div>
        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest pl-1">Memeriksa Sesi Siulu'...</p>
      </div>
    </div>
  );
}
