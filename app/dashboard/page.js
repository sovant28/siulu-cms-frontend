"use client";
import { useState, useEffect } from 'react';
import { supabase } from '../supabase';
import { 
  Bot, 
  Database, 
  Zap,
  TrendingUp,
  Activity,
  ArrowRight,
  MessageSquare,
  ThumbsUp,
  ThumbsDown,
  Calendar,
  MoreHorizontal
} from 'lucide-react';
import Link from 'next/link';

export default function DashboardHome() {
  const [stats, setStats] = useState({
    botsCount: 0,
    knowledgeCount: 0,
    greetingsCount: 0,
    feedbackCount: 0,
    positiveFeedback: 0,
    negativeFeedback: 0
  });
  const [recentFeedback, setRecentFeedback] = useState([]);
  const [loading, setLoading] = useState(true);
  const [adminEmail, setAdminEmail] = useState('');
  const [systemStatus, setSystemStatus] = useState({
    fastapi: 'Loading...',
    supabase: 'Loading...',
    supabasePing: null,
    embedding: 'Matryoshka 512',
    llmProvider: 'Google Gemini',
    allSystemsGo: true
  });

  // Conversations per day over the last 7 days (dynamically loaded)
  const [chartData, setChartData] = useState([
    { day: 'Mon', value: 0, height: '10%' },
    { day: 'Tue', value: 0, height: '10%' },
    { day: 'Wed', value: 0, height: '10%' },
    { day: 'Thu', value: 0, height: '10%' },
    { day: 'Fri', value: 0, height: '10%' },
    { day: 'Sat', value: 0, height: '10%' },
    { day: 'Sun', value: 0, height: '10%' },
  ]);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const startTime = performance.now();
        
        const { data: { session } } = await supabase.auth.getSession();
        if (session && session.user) {
          setAdminEmail(session.user.email);
        }
        
        const { count: botsCount } = await supabase
          .from('bots')
          .select('*', { count: 'exact', head: true });
          
        const { count: knowledgeCount } = await supabase
          .from('destinasi_wisata')
          .select('*', { count: 'exact', head: true });

        const { count: greetingsCount } = await supabase
          .from('greetings_faq')
          .select('*', { count: 'exact', head: true });

        const { data: feedbackData } = await supabase
          .from('chat_feedback')
          .select('id, rating, user_query, ai_response, created_at')
          .order('created_at', { ascending: false })
          .limit(5);

        // Calculate all feedback for satisfaction rate
        const { data: allFeedback } = await supabase
          .from('chat_feedback')
          .select('rating');

        const endTime = performance.now();
        const dbLatency = Math.round(endTime - startTime);

        let pos = 0;
        let neg = 0;
        if (allFeedback) {
          allFeedback.forEach(item => {
            if (item.rating === 1) pos++;
            else if (item.rating === -1) neg++;
          });
        }

        setRecentFeedback(feedbackData || []);

        setStats({
          botsCount: botsCount || 0,
          knowledgeCount: knowledgeCount || 0,
          greetingsCount: greetingsCount || 0,
          feedbackCount: allFeedback?.length || 0,
          positiveFeedback: pos,
          negativeFeedback: neg
        });

        // Test FastAPI connection and get active LLM provider
        let fastapiStatus = 'Offline';
        let activeLLM = 'Google Gemini';
        try {
          const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api';
          const apiRes = await fetch(`${apiBaseUrl}/bots/active`);
          if (apiRes.ok) {
            fastapiStatus = 'Connected';
            const activeBot = await apiRes.json();
            if (activeBot) {
              if (activeBot.provider === 'qwen') {
                activeLLM = 'Alibaba Qwen';
              } else {
                activeLLM = 'Google Gemini';
              }
            }
          }
        } catch (apiErr) {
          console.error("Gagal tes FastAPI status:", apiErr);
        }

        setSystemStatus({
          fastapi: fastapiStatus,
          supabase: 'Online',
          supabasePing: dbLatency,
          embedding: 'Matryoshka 512',
          llmProvider: activeLLM,
          allSystemsGo: fastapiStatus === 'Connected'
        });

        // 5. Query chat logs of the last 7 days for the dynamic chart
        try {
          const sevenDaysAgo = new Date();
          sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
          const { data: logsData } = await supabase
            .from('chat_logs_temporary')
            .select('created_at')
            .gte('created_at', sevenDaysAgo.toISOString());

          const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
          const last7Days = [];
          for (let i = 6; i >= 0; i--) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            last7Days.push({
              dateStr: d.toDateString(),
              dayLabel: daysOfWeek[d.getDay()],
              count: 0
            });
          }

          if (logsData) {
            logsData.forEach(log => {
              const logDateStr = new Date(log.created_at).toDateString();
              const dayObj = last7Days.find(day => day.dateStr === logDateStr);
              if (dayObj) {
                dayObj.count++;
              }
            });
          }

          const maxCount = Math.max(...last7Days.map(d => d.count), 1);
          const dynamicChartData = last7Days.map(day => {
            const percentage = Math.round((day.count / maxCount) * 100);
            return {
              day: day.dayLabel,
              value: day.count,
              height: `${Math.max(percentage, 8)}%` // minimum 8% for aesthetic visibility
            };
          });

          setChartData(dynamicChartData);
        } catch (chartErr) {
          console.error("Gagal memuat chart data:", chartErr);
        }

        setLoading(false);
      } catch (err) {
        console.error("Gagal memuat statistik dashboard:", err);
        setSystemStatus(prev => ({
          ...prev,
          supabase: 'Offline',
          allSystemsGo: false
        }));
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex h-[60vh] w-full items-center justify-center">
        <div className="flex flex-col items-center space-y-3">
          <div className="h-7 w-7 animate-spin rounded-full border-[3px] border-[#F35A05] border-t-transparent"></div>
          <p className="text-[9px] font-bold text-slate-500 tracking-widest pl-1">Menghitung Statistik...</p>
        </div>
      </div>
    );
  }

  const satisfactionRate = stats.feedbackCount > 0 
    ? Math.round((stats.positiveFeedback / stats.feedbackCount) * 100)
    : 100;

  const statCards = [
    { label: 'Total Bot AI', value: stats.botsCount, sub: 'Bot Terkonfigurasi', icon: Bot, color: 'orange' },
    { label: 'Memori RAG', value: stats.knowledgeCount, sub: 'Dokumen Wisata', icon: Database, color: 'blue' },
    { label: 'FAQ Instan', value: stats.greetingsCount, sub: 'Pola Regex Sapaan', icon: Zap, color: 'indigo' },
    { label: 'Skor Kepuasan', value: `${satisfactionRate}%`, sub: `${stats.positiveFeedback} Positif / ${stats.negativeFeedback} Negatif`, icon: TrendingUp, color: 'emerald' },
  ];

  const getCardIconStyle = (color) => {
    const map = {
      orange: 'bg-orange-50 text-[#F35A05]',
      blue: 'bg-blue-50 text-blue-600',
      indigo: 'bg-indigo-50 text-indigo-600',
      emerald: 'bg-emerald-50 text-emerald-600',
    };
    return map[color];
  };

  const todayStr = new Date().toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  return (
    <div className="flex flex-col w-full font-sans pb-10 space-y-8">
      
      {/* Personalized Header Section */}
      <div className="flex flex-col space-y-1">
        <h2 className="text-3xl font-black text-slate-800 tracking-tight">
          Selamat Datang Kembali, {adminEmail ? adminEmail.split('@')[0] : 'Admin'}! 👋
        </h2>
        <div className="flex items-center space-x-2 text-slate-500 text-sm font-medium">
          <Calendar className="w-4 h-4" />
          <span>{todayStr}</span>
        </div>
      </div>

      {/* Premium Stat Cards (Flat, clean outline) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card, idx) => {
          const IconComp = card.icon;
          return (
            <div key={idx} className="bg-white rounded-2xl p-6 border border-slate-200/80 flex items-start justify-between group hover:border-[#F35A05]/50 transition duration-300">
              <div className="space-y-3">
                <span className="text-xs font-bold text-slate-500">{card.label}</span>
                <h3 className="text-4xl font-black text-slate-800 tracking-tight">{card.value}</h3>
                <p className="text-[10px] font-bold text-slate-400 tracking-wider">{card.sub}</p>
              </div>
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${getCardIconStyle(card.color)}`}>
                <IconComp className="w-6 h-6" />
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column (Chart & Feedback) */}
        <div className="lg:col-span-8 space-y-8">
          
          {/* CSS Chart Section (Flat) */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200/80 flex flex-col h-[320px]">
            <div className="flex items-center justify-between mb-8">
              <div className="space-y-1">
                <h3 className="text-sm font-bold text-slate-800">Aktivitas Percakapan</h3>
                <p className="text-xs text-slate-500 font-medium">Interaksi pengguna dengan bot 7 hari terakhir</p>
              </div>
              <button className="p-2 hover:bg-slate-50 rounded-lg text-slate-400 transition">
                <MoreHorizontal className="w-5 h-5" />
              </button>
            </div>
            
            {/* Simple CSS Bar Chart */}
            <div className="flex-1 flex items-end justify-between px-2 pb-2">
              {chartData.map((data, idx) => (
                <div key={idx} className="flex flex-col items-center space-y-3 w-full group cursor-pointer">
                  <div className="w-full flex justify-center">
                    <span className="text-[10px] font-bold text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity translate-y-2 group-hover:-translate-y-1">
                      {data.value}
                    </span>
                  </div>
                  <div className="w-10 bg-slate-100 rounded-t-lg flex items-end justify-center overflow-hidden transition-all duration-500 h-[150px]">
                    <div 
                      className="w-full bg-[#F35A05]/80 group-hover:bg-[#F35A05] transition-all rounded-t-lg"
                      style={{ height: data.height }}
                    ></div>
                  </div>
                  <span className="text-xs font-bold text-slate-500">{data.day}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Feedback Mini Table */}
          <div className="bg-white space-y-4">
            <div className="flex items-center justify-between px-1">
              <h3 className="text-sm font-bold text-slate-800">Umpan Balik Terbaru</h3>
              <Link href="/dashboard/feedback" className="text-xs font-bold text-[#F35A05] hover:text-[#d94200] flex items-center space-x-1 group transition">
                <span>Lihat Semua</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition" />
              </Link>
            </div>

            <div className="w-full overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-500 font-bold">
                    <th className="pb-3 px-2 font-medium w-[80px]">Rating</th>
                    <th className="pb-3 px-2 font-medium w-[300px]">Percakapan</th>
                    <th className="pb-3 px-2 font-medium text-right w-[100px]">Waktu</th>
                  </tr>
                </thead>
                <tbody className="text-slate-700">
                  {recentFeedback.length === 0 ? (
                    <tr>
                      <td colSpan="3" className="py-8 text-center text-slate-500 italic border-b border-slate-200">
                        Belum ada umpan balik yang masuk.
                      </td>
                    </tr>
                  ) : (
                    recentFeedback.map((item) => (
                      <tr key={item.id} className="border-b border-slate-200 hover:bg-slate-50/50 transition">
                        <td className="py-3 px-2">
                          {item.rating === 1 ? (
                            <div className="w-6 h-6 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center">
                              <ThumbsUp className="w-3 h-3" />
                            </div>
                          ) : (
                            <div className="w-6 h-6 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center">
                              <ThumbsDown className="w-3 h-3" />
                            </div>
                          )}
                        </td>
                        <td className="py-3 px-2">
                          <div className="space-y-0.5">
                            <div className="font-bold text-slate-800 truncate max-w-[300px]">Q: {item.user_query}</div>
                            <div className="font-medium text-slate-500 text-[10px] truncate max-w-[300px]">A: {item.ai_response}</div>
                          </div>
                        </td>
                        <td className="py-3 px-2 text-right text-slate-400 font-medium">
                          {new Date(item.created_at).toLocaleDateString('id-ID', { month: 'short', day: 'numeric' })}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Column (System Status & Quick Actions) */}
        <div className="lg:col-span-4 space-y-8">
                  {/* Quick Actions (Flat) */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200/80 space-y-5">
            <h3 className="text-sm font-bold text-slate-800">Akses Cepat</h3>
            <div className="space-y-3">
              <Link href="/dashboard/knowledge/add?type=destinasi" className="flex items-center space-x-3 p-3 bg-white border border-slate-200 rounded-xl hover:border-[#F35A05] transition group">
                <div className="w-10 h-10 rounded-lg bg-orange-50 text-[#F35A05] flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Database className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <div className="text-xs font-bold text-slate-800 group-hover:text-[#F35A05] transition">Tambah Data Wisata</div>
                  <div className="text-[10px] text-slate-500 font-medium">Inject artikel RAG baru</div>
                </div>
              </Link>
              <Link href="/dashboard/faq" className="flex items-center space-x-3 p-3 bg-white border border-slate-200 rounded-xl hover:border-[#F35A05] transition group">
                <div className="w-10 h-10 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Zap className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <div className="text-xs font-bold text-slate-800 group-hover:text-[#F35A05] transition">Buat Sapaan Cepat</div>
                  <div className="text-[10px] text-slate-500 font-medium">Kelola pola regex sapaan & FAQ</div>
                </div>
              </Link>
              <Link href="/dashboard/sandbox" className="flex items-center space-x-3 p-3 bg-white border border-slate-200 rounded-xl hover:border-[#F35A05] transition group">
                <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <MessageSquare className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <div className="text-xs font-bold text-slate-800 group-hover:text-[#F35A05] transition">Uji Coba Sandbox</div>
                  <div className="text-[10px] text-slate-500 font-medium">Test performa bot & RAG</div>
                </div>
              </Link>
            </div>
          </div>

          {/* System Status (Flat) */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200/80 space-y-5">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-800">Status Operasional</h3>
              <div className={`flex items-center space-x-1.5 px-2 py-1 rounded-full ${
                systemStatus.allSystemsGo 
                  ? 'bg-emerald-50 text-emerald-600' 
                  : 'bg-rose-50 text-rose-600'
              }`}>
                <span className="relative flex h-2 w-2">
                  <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                    systemStatus.allSystemsGo ? 'bg-emerald-400' : 'bg-rose-400'
                  }`}></span>
                  <span className={`relative inline-flex rounded-full h-2 w-2 ${
                    systemStatus.allSystemsGo ? 'bg-emerald-500' : 'bg-rose-500'
                  }`}></span>
                </span>
                <span className="text-[9px] font-bold tracking-wider">
                  {systemStatus.allSystemsGo ? 'Sistem Aktif' : 'Gangguan Sistem'}
                </span>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="flex justify-between items-center text-xs">
                <div className="flex items-center space-x-2">
                  <div className={`w-1.5 h-1.5 rounded-full ${
                    systemStatus.fastapi === 'Connected' ? 'bg-emerald-500' : 'bg-rose-500'
                  }`}></div>
                  <span className="text-slate-500 font-medium">FastAPI Engine</span>
                </div>
                <span className={`font-bold ${
                  systemStatus.fastapi === 'Connected' ? 'text-emerald-600' : 'text-rose-600'
                }`}>{systemStatus.fastapi}</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <div className="flex items-center space-x-2">
                  <div className={`w-1.5 h-1.5 rounded-full ${
                    systemStatus.supabase === 'Online' ? 'bg-emerald-500' : 'bg-rose-500'
                  }`}></div>
                  <span className="text-slate-500 font-medium">Supabase Database</span>
                </div>
                <span className={`font-bold ${
                  systemStatus.supabase === 'Online' ? 'text-emerald-600' : 'text-rose-600'
                }`}>
                  {systemStatus.supabase} {systemStatus.supabasePing ? `${systemStatus.supabasePing}ms` : ''}
                </span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <div className="flex items-center space-x-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                  <span className="text-slate-500 font-medium">Embedding Service</span>
                </div>
                <span className="font-bold text-[#F35A05]">{systemStatus.embedding}</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <div className="flex items-center space-x-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>
                  <span className="text-slate-500 font-medium">LLM Provider</span>
                </div>
                <span className="font-bold text-slate-800">{systemStatus.llmProvider}</span>
              </div>
            </div>
          </div>

        </div>
      </div>

    </div>
  );
}
