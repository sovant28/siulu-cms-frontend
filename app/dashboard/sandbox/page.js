"use client";
import { useState, useEffect, useRef } from 'react';
import { supabase } from '../../supabase';
import { 
  Bot, 
  RefreshCw, 
  Send, 
  CornerDownRight, 
  RefreshCw as ResetIcon,
  MessageSquare
} from 'lucide-react';

export default function SandboxPage() {
  const [role, setRole] = useState(null);
  const [token, setToken] = useState(null);
  const [bots, setBots] = useState([]);
  const [activeBot, setActiveBot] = useState(null);
  const [loading, setLoading] = useState(true);

  const [chatHistory, setChatHistory] = useState([]);
  const [userInput, setUserInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const [sessionId, setSessionId] = useState('');
  const messagesEndRef = useRef(null);

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
        await fetchBots();
      } catch (err) {
        console.error("Gagal menginisialisasi halaman sandbox:", err);
      } finally {
        setLoading(false);
      }
    };
    initPage();
    generateNewSession();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory]);

  const generateNewSession = () => {
    setSessionId('sess_' + Math.random().toString(36).substring(2, 15));
    setChatHistory([]);
  };

  const fetchBots = async () => {
    try {
      const res = await fetch(`${API_URL}/bots/`);
      if (res.ok) {
        const data = await res.json();
        setBots(data);
        if (data.length > 0 && !activeBot) {
          setActiveBot(data[0]);
        }
      }
    } catch (err) {
      console.error("Gagal mengambil data bot:", err);
    }
  };

  const handleSelectBotForChat = (e) => {
    const botId = e.target.value;
    const bot = bots.find(b => b.id === parseInt(botId) || b.id === botId);
    if (bot) {
      setActiveBot(bot);
      generateNewSession();
    }
  };

  const handleSendSandboxMessage = async (e, customQuery = null) => {
    if (e) e.preventDefault();
    if (!activeBot) return;

    const queryText = customQuery || userInput;
    if (!queryText.trim()) return;

    const newHistory = [...chatHistory, { role: 'user', content: queryText }];
    setChatHistory(newHistory);
    setUserInput('');
    setChatLoading(true);

    try {
      const endpoint = `${API_URL}/bots/${activeBot.id}/chat-rag`;

      const formattedHistory = chatHistory.map(msg => ({
        role: msg.role === 'user' ? 'user' : 'model',
        content: msg.content
      }));

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          message: queryText,
          history: formattedHistory,
          session_id: sessionId
        })
      });

      if (res.ok) {
        const data = await res.json();
        setChatHistory([
          ...newHistory,
          { 
            role: 'model', 
            content: data.response,
            model_used: data.model_used,
            sources: data.sources 
          }
        ]);
      } else {
        const errData = await res.json();
        setChatHistory([
          ...newHistory,
          { role: 'model', content: `⚠️ Error Backend: ${errData.detail || 'Gagal memproses AI'}` }
        ]);
      }
    } catch (err) {
      console.error(err);
      setChatHistory([
        ...newHistory,
        { role: 'model', content: "⚠️ Kesalahan Koneksi: Pastikan API FastAPI Anda sudah menyala." }
      ]);
    } finally {
      setChatLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-[60vh] w-full items-center justify-center">
        <div className="flex flex-col items-center space-y-3">
          <div className="h-7 w-7 animate-spin rounded-full border-[3px] border-[#F35A05] border-t-transparent"></div>
          <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest pl-1">Menyiapkan Sandbox...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col font-sans h-[calc(100vh-4rem)] overflow-hidden -m-8">
      
      <section className="bg-white flex flex-col h-full overflow-hidden relative w-full">
        
        <div className="px-8 py-6 border-b border-slate-400 flex justify-between items-center z-10 bg-white">
          <div className="flex items-center space-x-4">
            <div className="w-10 h-10 rounded-lg bg-orange-50 border border-orange-100 flex items-center justify-center text-[#F35A05]">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[8.5px] font-bold text-[#F35A05] uppercase tracking-widest leading-none block mb-1.5">
                Pilih Bot untuk Diuji
              </span>
              <select 
                value={activeBot ? activeBot.id : ''}
                onChange={handleSelectBotForChat}
                className="bg-slate-50 border border-slate-400 text-slate-800 text-xs rounded-lg px-3 py-1.5 focus:outline-none focus:border-[#F35A05] font-bold min-w-[200px]"
              >
                {bots.length === 0 && <option value="">Tidak ada bot tersedia</option>}
                {bots.map(bot => (
                  <option key={bot.id} value={bot.id}>{bot.name} ({bot.model})</option>
                ))}
              </select>
            </div>
          </div>

          <button 
            onClick={generateNewSession}
            className="flex items-center space-x-1.5 px-3 py-1.5 bg-white hover:bg-slate-50 border border-slate-400 rounded-lg text-[10px] font-bold text-slate-500 transition cursor-pointer active:scale-95"
          >
            <ResetIcon className="w-3.5 h-3.5" />
            <span>Reset Sesi Chat</span>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-8 space-y-4 no-scrollbar bg-white">
          {chatHistory.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center space-y-4 max-w-sm mx-auto">
              <div className="w-16 h-16 rounded-xl bg-slate-50 border border-slate-400 flex items-center justify-center text-[#F35A05]">
                <Bot className="w-8 h-8" />
              </div>
              <div className="space-y-1">
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Mulai Menguji {activeBot?.name || 'Bot'}</h4>
                <p className="text-[10.5px] text-slate-500 font-medium leading-relaxed">
                  Tulis pesan di bawah untuk menguji respon dari konfigurasi persona, model AI, dan parameter RAG.
                </p>
              </div>
              
              <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
                <button 
                  onClick={() => handleSendSandboxMessage(null, "Tunjukkan jadwal pelaksanaan upacara adat Rambu Solo terdekat")}
                  className="px-3 py-1.5 bg-white border border-slate-400 hover:border-[#F35A05]/30 rounded-full text-[10px] font-bold text-slate-600 transition cursor-pointer shadow-sm"
                >
                  🐃 Jadwal Rambu Solo'
                </button>
                <button 
                  onClick={() => handleSendSandboxMessage(null, "Bagaimana aturan dan tata krama menghadiri Rambu Solo?")}
                  className="px-3 py-1.5 bg-white border border-slate-400 hover:border-[#F35A05]/30 rounded-full text-[10px] font-bold text-slate-600 transition cursor-pointer shadow-sm"
                >
                  👔 Etiket Rambu Solo'
                </button>
              </div>
            </div>
          ) : (
            chatHistory.map((msg, idx) => {
              const isUser = msg.role === 'user';
              return (
                <div key={idx} className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} space-y-1`}>
                  <div className={`max-w-[85%] rounded-xl px-4 py-3 text-xs leading-relaxed ${
                    isUser 
                      ? 'bg-[#F35A05] text-white font-medium rounded-tr-none shadow-sm' 
                      : 'bg-white border border-slate-400 text-slate-800 font-medium rounded-tl-none shadow-sm'
                  }`}>
                    {msg.content}
                  </div>

                  {!isUser && (
                    <div className="w-[85%] pl-1 space-y-1 text-slate-500 mt-1">
                      <div className="flex items-center space-x-2 text-[8px] font-bold uppercase tracking-wider">
                        <span>Engine: {msg.model_used || activeBot?.model}</span>
                        {msg.sources && msg.sources.length > 0 && (
                          <span className="text-[#F35A05]">• {msg.sources.length} RAG Sources</span>
                        )}
                      </div>
                      
                      {msg.sources && msg.sources.length > 0 && (
                        <div className="p-2.5 bg-white border border-slate-400 rounded-lg space-y-1.5 text-[9px] font-medium text-slate-500 shadow-sm mt-1.5">
                          <span className="font-bold text-[8px] uppercase tracking-wider block text-[#F35A05]">Dokumen RAG Terambil:</span>
                          {msg.sources.map((src, sIdx) => (
                            <div key={sIdx} className="flex items-start space-x-1 border-b border-slate-50 pb-1.5 last:border-0 last:pb-0">
                              <CornerDownRight className="w-3 h-3 text-orange-400 flex-shrink-0 mt-0.5" />
                              <span className="leading-relaxed">
                                <strong className="text-slate-700">{src.nama_tempat}</strong> ({src.lokasi_wilayah}): {src.content_chunk.substring(0, 100)}...
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })
          )}

          {chatLoading && (
            <div className="flex items-center space-x-2.5 p-3 bg-white border border-slate-400 shadow-sm rounded-xl rounded-tl-none w-[200px] text-xs font-medium text-slate-500 mt-2">
              <span className="animate-spin h-4 w-4 border-[2px] border-[#F35A05] border-t-transparent rounded-full"></span>
              <span>Bot sedang berpikir...</span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        <form onSubmit={handleSendSandboxMessage} className="px-8 py-6 border-t border-slate-400 flex items-center space-x-3 z-10 bg-white">
          <input 
            type="text"
            disabled={chatLoading || !activeBot}
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            placeholder={activeBot ? `Kirim kueri uji coba ke ${activeBot.name}...` : 'Pilih bot terlebih dahulu'}
            className="flex-1 bg-white border border-slate-400 rounded-lg px-4 py-3 text-xs text-slate-900 font-medium placeholder-slate-400 focus:outline-none focus:border-[#F35A05] transition disabled:bg-slate-50 shadow-sm"
          />
          <button 
            type="submit"
            disabled={chatLoading || !userInput.trim() || !activeBot}
            className="w-11 h-11 bg-[#F35A05] hover:bg-[#d94200] disabled:bg-orange-300 text-white rounded-lg flex items-center justify-center transition active:scale-95 flex-shrink-0 cursor-pointer shadow-sm"
          >
            <Send className="w-5 h-5" />
          </button>
        </form>

      </section>

    </div>
  );
}
