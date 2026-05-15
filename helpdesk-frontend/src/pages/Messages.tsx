import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { 
  Search, 
  MessageSquare, 
  Clock, 
  ChevronRight,
  User,
  Loader2,
  Filter
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface ChatSummary {
  ticket_id: number;
  ticket_code: string;
  ticket_title: string;
  last_message: string;
  last_activity: string;
  status: string;
}

export default function MessagesPage() {
  const { token } = useAuth();
  const [chats, setChats] = useState<ChatSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchChats();
  }, []);

  const fetchChats = async () => {
    try {
      const res = await axios.get('http://localhost:8001/api/v1/tickets/recent-chats', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setChats(res.data);
    } catch (error) {
      console.error("Error fetching chats:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredChats = chats.filter(chat => 
    chat.ticket_title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    chat.ticket_code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Mensajería</h1>
          <p className="text-slate-500 font-medium">Conversaciones activas de soporte técnico</p>
        </div>
        
        <div className="flex items-center gap-2">
          <div className="relative group">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 group-focus-within:text-blue-500 transition-colors" />
            <input 
              type="text" 
              placeholder="Buscar por ticket o asunto..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none w-64 transition-all"
            />
          </div>
          <button className="p-2.5 bg-white border border-slate-200 rounded-xl text-slate-500 hover:bg-slate-50">
            <Filter className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-slate-100 shadow-xl shadow-slate-200/50 overflow-hidden">
        <div className="grid grid-cols-1 divide-y divide-slate-50">
          {filteredChats.length === 0 ? (
            <div className="p-20 text-center space-y-4">
              <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto">
                <MessageSquare className="w-8 h-8 text-slate-300" />
              </div>
              <p className="text-slate-400 font-medium">No se encontraron conversaciones activas.</p>
            </div>
          ) : (
            filteredChats.map((chat) => (
              <button 
                key={chat.ticket_id}
                onClick={() => navigate(`/dashboard/tickets/${chat.ticket_id}`)}
                className="w-full flex items-center gap-4 p-6 hover:bg-slate-50/80 transition-all text-left group"
              >
                <div className="relative">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-black text-lg shadow-lg shadow-blue-100">
                    {chat.ticket_title.charAt(0)}
                  </div>
                  <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${
                    chat.status === 'OPEN' ? 'bg-amber-500' : 
                    chat.status === 'IN_PROGRESS' ? 'bg-blue-500' : 'bg-emerald-500'
                  }`} />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest">{chat.ticket_code}</p>
                    <div className="flex items-center gap-1.5 text-slate-400">
                      <Clock className="w-3.5 h-3.5" />
                      <span className="text-[10px] font-bold">{new Date(chat.last_activity).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <h3 className="text-base font-bold text-slate-900 truncate group-hover:text-blue-600 transition-colors">{chat.ticket_title}</h3>
                  <p className="text-sm text-slate-500 truncate mt-0.5">{chat.last_message}</p>
                </div>

                <ChevronRight className="w-5 h-5 text-slate-300 group-hover:translate-x-1 transition-transform" />
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
