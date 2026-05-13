import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { 
  ChevronLeft, 
  Send, 
  User, 
  Clock, 
  MapPin, 
  Camera, 
  CheckCircle2,
  Loader2,
  ShieldAlert,
  Package
} from 'lucide-react';

import MaterialConsumptionModal from '../components/tickets/MaterialConsumptionModal';

interface Message {
  id: number;
  user_id: number;
  message: string;
  created_at: string;
}

export default function TicketDetailPage() {
  const { id } = useParams();
  const { user, token } = useAuth();
  const [ticket, setTicket] = useState<any>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [showMaterialModal, setShowMaterialModal] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchTicketData();
    const interval = setInterval(fetchMessages, 5000); // Poll messages every 5s
    return () => clearInterval(interval);
  }, [id]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchTicketData = async () => {
    try {
      const [ticketRes, messagesRes] = await Promise.all([
        axios.get(`http://localhost:8001/api/v1/tickets/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get(`http://localhost:8001/api/v1/tickets/${id}/messages`, {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);
      setTicket(ticketRes.data);
      setMessages(messagesRes.data);
    } catch (error) {
      console.error("Error fetching ticket detail:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async () => {
    try {
      const res = await axios.get(`http://localhost:8001/api/v1/tickets/${id}/messages`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMessages(res.data);
    } catch (error) {
      console.error("Error fetching messages:", error);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;
    setSending(true);
    try {
      await axios.post(`http://localhost:8001/api/v1/tickets/${id}/messages`, {
        message: newMessage
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setNewMessage('');
      fetchMessages();
    } catch (error) {
      console.error("Error sending message:", error);
    } finally {
      setSending(false);
    }
  };

  const handleUploadEvidence = async (type: 'before' | 'after', file?: File) => {
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    try {
      await axios.post(`http://localhost:8001/api/v1/tickets/${id}/evidence?type=${type}`, formData, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });
      fetchTicketData(); // Refresh to show the image
    } catch (error) {
      console.error("Error uploading evidence:", error);
      alert("Error al subir la imagen. Verifica el tamaño (máx 5MB).");
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8 h-[calc(100vh-160px)]">
      {/* Left: Ticket Info */}
      <div className="lg:col-span-1 space-y-6 overflow-y-auto pr-2">
        <Link to="/dashboard/tickets" className="flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-slate-700 transition-colors mb-4">
          <ChevronLeft className="w-4 h-4" /> Volver a la lista
        </Link>
        
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-6">
          <div>
            <span className={`px-3 py-1 text-[10px] font-bold uppercase rounded-full ${
              ticket.status === 'ABIERTO' ? 'bg-blue-100 text-blue-700' : 'bg-emerald-100 text-emerald-700'
            }`}>
              {ticket.status}
            </span>
            <h1 className="text-xl font-bold text-slate-900 mt-3">{ticket.title}</h1>
            <p className="text-xs text-slate-400 font-medium">{ticket.code}</p>
          </div>

          <div className="space-y-4 border-t border-slate-50 pt-4">
            <div className="flex items-center gap-3">
              <User className="w-4 h-4 text-slate-400" />
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase">Solicitante</p>
                <p className="text-sm font-semibold text-slate-700">{ticket.requester_name}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Clock className="w-4 h-4 text-slate-400" />
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase">Creado el</p>
                <p className="text-sm font-semibold text-slate-700">{new Date(ticket.created_at).toLocaleString()}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <ShieldAlert className="w-4 h-4 text-slate-400" />
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase">Prioridad</p>
                <p className="text-sm font-semibold text-slate-700">{ticket.priority}</p>
              </div>
            </div>
          </div>

          <div className="bg-slate-50 p-4 rounded-xl">
            <p className="text-xs font-bold text-slate-400 uppercase mb-2">Descripción</p>
            <p className="text-sm text-slate-600 leading-relaxed">{ticket.description}</p>
          </div>

          {/* Evidence Section */}
          <div className="space-y-4 border-t border-slate-50 pt-4">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Evidencias Fotográficas</p>
            <div className="grid grid-cols-2 gap-3">
              {/* Foto Antes */}
              <div className="space-y-2">
                <p className="text-[10px] font-bold text-slate-500 uppercase text-center">Antes</p>
                {ticket.photo_before ? (
                  <img 
                    src={`http://localhost:8001${ticket.photo_before}`} 
                    className="w-full h-24 object-cover rounded-xl border border-slate-200"
                  />
                ) : (
                  <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-dashed border-slate-200 rounded-xl hover:bg-slate-50 cursor-pointer transition-all">
                    <Camera className="w-6 h-6 text-slate-300" />
                    <span className="text-[8px] font-bold text-slate-400 mt-1">SUBIR</span>
                    <input type="file" accept="image/*" capture="environment" className="hidden" onChange={(e) => handleUploadEvidence('before', e.target.files?.[0])} />
                  </label>
                )}
              </div>
              {/* Foto Después */}
              <div className="space-y-2">
                <p className="text-[10px] font-bold text-slate-500 uppercase text-center">Después</p>
                {ticket.photo_after ? (
                  <img 
                    src={`http://localhost:8001${ticket.photo_after}`} 
                    className="w-full h-24 object-cover rounded-xl border border-slate-200"
                  />
                ) : (
                  <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-dashed border-slate-200 rounded-xl hover:bg-slate-50 cursor-pointer transition-all">
                    <CheckCircle2 className="w-6 h-6 text-slate-300" />
                    <span className="text-[8px] font-bold text-slate-400 mt-1">SUBIR</span>
                    <input type="file" accept="image/*" capture="environment" className="hidden" onChange={(e) => handleUploadEvidence('after', e.target.files?.[0])} />
                  </label>
                )}
              </div>
            </div>
          </div>

          <button 
            onClick={() => setShowMaterialModal(true)}
            className="w-full flex items-center justify-center gap-2 py-3 bg-slate-900 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-black transition-all shadow-lg shadow-slate-100"
          >
            <Package className="w-4 h-4 text-blue-400" /> Consumir Material
          </button>
        </div>
      </div>

      {/* Right: Chat Window */}
      <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 shadow-sm flex flex-col overflow-hidden">
        <div className="p-4 border-b border-slate-50 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold">
              AI
            </div>
            <div>
              <p className="text-sm font-bold text-slate-900">Chat del Ticket</p>
              <p className="text-[10px] text-emerald-600 font-bold flex items-center gap-1">
                <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span> Canal Seguro Activo
              </p>
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-50/30">
          {messages.map((msg) => (
            <div key={msg.id} className={`flex ${msg.user_id === user?.id ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[70%] p-4 rounded-2xl shadow-sm ${
                msg.user_id === user?.id 
                  ? 'bg-blue-600 text-white rounded-tr-none' 
                  : 'bg-white text-slate-700 border border-slate-100 rounded-tl-none'
              }`}>
                <p className="text-sm">{msg.message}</p>
                <p className={`text-[10px] mt-2 opacity-60 ${msg.user_id === user?.id ? 'text-blue-100' : 'text-slate-400'}`}>
                  {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
          ))}
          <div ref={chatEndRef} />
        </div>

        {/* Input */}
        <div className="p-4 bg-white border-t border-slate-100">
          <form onSubmit={handleSendMessage} className="flex gap-2">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Escribe un mensaje para el técnico..."
              className="flex-1 px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
            />
            <button
              type="submit"
              disabled={sending || !newMessage.trim()}
              className="p-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all disabled:opacity-50"
            >
              {sending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
            </button>
          </form>
        </div>
      </div>
      {showMaterialModal && (
        <MaterialConsumptionModal 
          ticketId={Number(id)} 
          onClose={() => {
            setShowMaterialModal(false);
            fetchTicketData(); // Refresh to see changes if any
          }} 
        />
      )}
    </div>
  );
}
