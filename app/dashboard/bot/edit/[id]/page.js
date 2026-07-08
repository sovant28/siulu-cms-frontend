"use client";
import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../../../supabase';
import { Bot, ChevronLeft, Save } from 'lucide-react';

export default function EditBot({ params }) {
  const unwrappedParams = use(params);
  const router = useRouter();
  const [role, setRole] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  const [botName, setBotName] = useState('');
  const [botDesc, setBotDesc] = useState('');
  const [botInstruction, setBotInstruction] = useState('');
  const [botModel, setBotModel] = useState('');
  const [botProvider, setBotProvider] = useState('');
  const [botTemp, setBotTemp] = useState(0.7);
  const [botApiKey, setBotApiKey] = useState('');
  const [botBaseUrl, setBotBaseUrl] = useState('');
  const [botGreetingsModel, setBotGreetingsModel] = useState('');
  const [fetchedModels, setFetchedModels] = useState([]);
  const [fetchingModels, setFetchingModels] = useState(false);
  const [formLoading, setFormLoading] = useState(false);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api';

  useEffect(() => {
    const initPage = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        let currentToken = null;
        if (session) {
          setToken(session.access_token);
          currentToken = session.access_token;
          const { data: roleData } = await supabase
            .from('user_roles')
            .select('role')
            .eq('user_id', session.user.id)
            .single();
          setRole(roleData?.role);
          
          if (roleData?.role !== 'super_admin') {
            alert("Akses ditolak: Hanya Super-Admin yang bisa mengelola bot!");
            router.push('/dashboard/bot');
            return;
          }
        }

        if (unwrappedParams.id && currentToken) {
          const res = await fetch(`${API_URL}/bots/`);
          if (res.ok) {
            const data = await res.json();
            const bot = data.find(b => b.id === unwrappedParams.id);
            if (bot) {
              setBotName(bot.name);
              setBotDesc(bot.description || '');
              setBotInstruction(bot.system_instruction);
              setBotModel(bot.model);
              setBotProvider(bot.provider);
              setBotTemp(bot.temperature);
              setBotApiKey(bot.api_key || '');
              setBotBaseUrl(bot.base_url || '');
              setBotGreetingsModel(bot.greetings_model || '');
            } else {
              alert("Bot tidak ditemukan.");
              router.push('/dashboard/bot');
            }
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    initPage();
  }, [unwrappedParams.id, router]);

  const handleFetchModels = async () => {
    if (!botApiKey || !botBaseUrl) {
      alert("Masukkan Custom API Key dan Custom Base URL terlebih dahulu.");
      return;
    }
    setFetchingModels(true);
    try {
      const res = await fetch(`${API_URL}/bots/fetch-models`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          api_key: botApiKey,
          base_url: botBaseUrl
        })
      });
      if (res.ok) {
        const data = await res.json();
        if (data.models && data.models.length > 0) {
          setFetchedModels(data.models);
          alert(`Berhasil mengambil ${data.models.length} model!`);
        } else {
          alert("Tidak ada model yang ditemukan dari API provider.");
        }
      } else {
        const err = await res.json();
        alert(`Gagal mengambil model: ${err.detail || 'Error'}`);
      }
    } catch (e) {
      console.error(e);
      alert("Kesalahan koneksi saat mengambil model.");
    } finally {
      setFetchingModels(false);
    }
  };

  const handleSaveBot = async (e) => {
    e.preventDefault();
    setFormLoading(true);

    const payload = {
      name: botName,
      description: botDesc || null,
      system_instruction: botInstruction,
      model: botModel,
      temperature: parseFloat(botTemp),
      provider: botProvider,
      api_key: botApiKey || null,
      base_url: botBaseUrl || null,
      greetings_model: botGreetingsModel || null
    };

    try {
      const res = await fetch(`${API_URL}/bots/${unwrappedParams.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        alert("Bot berhasil diperbarui!");
        router.push('/dashboard/bot');
      } else {
        const errData = await res.json();
        alert(`Gagal menyimpan bot: ${errData.detail || 'Error'}`);
      }
    } catch (err) {
      console.error(err);
      alert("Kesalahan koneksi saat menyimpan bot.");
    } finally {
      setFormLoading(false);
    }
  };

  if (loading) return null;

  return (
    <div className="flex flex-col w-full font-sans pb-10 space-y-8">
      
      <div className="flex items-center space-x-4">
        <button 
          onClick={() => router.push('/dashboard/bot')}
          className="p-2 bg-slate-50 hover:bg-slate-100 border border-slate-300 rounded-lg text-slate-500 hover:text-slate-800 transition"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <div>
          <h2 className="text-2xl font-black text-slate-800 tracking-tight">Edit Bot</h2>
        </div>
      </div>

      <div className="max-w-4xl bg-white border border-slate-200 rounded-xl p-8 shadow-sm">
        <form onSubmit={handleSaveBot} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-700">Nama Bot *</label>
              <input 
                type="text" required 
                value={botName} onChange={(e) => setBotName(e.target.value)}
                placeholder="Contoh: Mebali AI"
                className="w-full bg-white border border-slate-300 rounded-lg px-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:border-[#F35A05] transition"
              />
            </div>
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-700">Deskripsi Singkat</label>
              <input 
                type="text" 
                value={botDesc} onChange={(e) => setBotDesc(e.target.value)}
                placeholder="Pemandu adat Rambu Solo'"
                className="w-full bg-white border border-slate-300 rounded-lg px-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:border-[#F35A05] transition"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-700">System Instruction (Persona) *</label>
            <textarea 
              required rows={5}
              value={botInstruction} onChange={(e) => setBotInstruction(e.target.value)}
              placeholder="Anda adalah asisten virtual pariwisata Tana Toraja..."
              className="w-full bg-white border border-slate-300 rounded-lg px-4 py-3 text-sm text-slate-900 focus:outline-none focus:border-[#F35A05] transition resize-y"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-700">Provider *</label>
              <select 
                value={botProvider} onChange={(e) => setBotProvider(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-lg px-3.5 py-2.5 text-sm text-slate-900 focus:outline-none focus:border-[#F35A05] transition"
              >
                <option value="gemini">Google Gemini</option>
                <option value="qwen">Alibaba Qwen</option>
                <option value="openai">OpenAI</option>
                <option value="anthropic">Anthropic</option>
                <option value="custom">Custom (Lokal/Lainnya)</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-700">Temperature (0.0 - 2.0) *</label>
              <input 
                type="number" step="0.1" min="0" max="2" required
                value={botTemp} onChange={(e) => setBotTemp(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-lg px-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:border-[#F35A05] transition"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="block text-xs font-bold text-slate-700">Model Name *</label>
                {fetchedModels.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setFetchedModels([])}
                    className="text-[10px] font-bold text-[#F35A05] hover:underline"
                  >
                    Masukkan Manual
                  </button>
                )}
              </div>
              {fetchedModels.length > 0 ? (
                <select
                  value={botModel}
                  onChange={(e) => setBotModel(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-lg px-3.5 py-2.5 text-sm text-slate-900 focus:outline-none focus:border-[#F35A05] transition"
                >
                  <option value="">Pilih Model Utama...</option>
                  {fetchedModels.map((m) => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
              ) : (
                <input 
                  type="text" required 
                  value={botModel} onChange={(e) => setBotModel(e.target.value)}
                  placeholder="gemini-3.1-flash-lite"
                  className="w-full bg-white border border-slate-300 rounded-lg px-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:border-[#F35A05] transition"
                />
              )}
            </div>
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-700">Preset Cepat (Opsional)</label>
              <select 
                onChange={(e) => {
                  if (e.target.value) {
                    setBotModel(e.target.value);
                    setBotProvider(e.target.options[e.target.selectedIndex].getAttribute('data-provider'));
                  }
                }}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3.5 py-2.5 text-sm text-slate-900 focus:outline-none focus:border-[#F35A05] transition"
              >
                <option value="">Pilih Preset...</option>
                <option value="gemini-3.1-flash-lite" data-provider="gemini">Gemini 3.1 Flash-Lite</option>
                <option value="gemini-3.1-pro" data-provider="gemini">Gemini 3.1 Pro</option>
                <option value="qwen2.5-72b-instruct" data-provider="qwen">Qwen 2.5 72B</option>
                <option value="gpt-4o-mini" data-provider="openai">GPT-4o Mini</option>
                <option value="claude-3-5-sonnet-20240620" data-provider="anthropic">Claude 3.5 Sonnet</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-100">
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-700">Custom API Key (Opsional)</label>
              <input 
                type="password" 
                value={botApiKey} onChange={(e) => setBotApiKey(e.target.value)}
                placeholder="Biarkan kosong jika pakai dari .env"
                className="w-full bg-white border border-slate-300 rounded-lg px-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:border-[#F35A05] transition"
              />
            </div>
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-700">Custom Base URL (Opsional)</label>
              <div className="flex space-x-2">
                <input 
                  type="text" 
                  value={botBaseUrl} onChange={(e) => setBotBaseUrl(e.target.value)}
                  placeholder="https://api.openai.com/v1"
                  className="flex-1 bg-white border border-slate-300 rounded-lg px-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:border-[#F35A05] transition"
                />
                <button
                  type="button"
                  onClick={handleFetchModels}
                  disabled={fetchingModels}
                  className="px-4 py-2.5 bg-slate-800 hover:bg-slate-950 text-white font-bold rounded-lg text-xs transition flex items-center space-x-1"
                >
                  {fetchingModels ? (
                    <span className="animate-spin h-3.5 w-3.5 border-2 border-white border-t-transparent rounded-full"></span>
                  ) : <span>Ambil Model</span>}
                </button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-100">
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-700">Greetings Model Name (Opsional)</label>
              {fetchedModels.length > 0 ? (
                <select
                  value={botGreetingsModel}
                  onChange={(e) => setBotGreetingsModel(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-lg px-3.5 py-2.5 text-sm text-slate-900 focus:outline-none focus:border-[#F35A05] transition"
                >
                  <option value="">Gunakan Default / Pilih Model Greetings...</option>
                  {fetchedModels.map((m) => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
              ) : (
                <input 
                  type="text" 
                  value={botGreetingsModel} onChange={(e) => setBotGreetingsModel(e.target.value)}
                  placeholder="Model murah untuk sapaan (misal: qwen-turbo)"
                  className="w-full bg-white border border-slate-300 rounded-lg px-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:border-[#F35A05] transition"
                />
              )}
            </div>
            <div className="flex items-end text-xs text-slate-500 pb-3">
              Model ini digunakan khusus menjawab sapaan basa-basi (greetings) untuk menghemat token model utama.
            </div>
          </div>

          <div className="pt-6 mt-6 border-t border-slate-200">
            <button 
              type="submit" disabled={formLoading}
              className="px-6 py-2.5 bg-[#F35A05] hover:bg-[#d94200] text-white font-bold rounded-lg text-sm transition flex items-center space-x-2"
            >
              {formLoading ? (
                <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></span>
              ) : <Save className="w-4 h-4" />}
              <span>Simpan Perubahan</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
