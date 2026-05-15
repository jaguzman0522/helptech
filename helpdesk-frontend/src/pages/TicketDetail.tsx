import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { API_URL, BASE_URL } from '../api/config';
import { 
  ChevronLeft, 
  Send, 
  User, 
  Camera, 
  ShieldAlert, 
  Package, 
  CheckCircle, 
  UserCheck, 
  Printer as PrinterIcon, 
  Calendar, 
  MapPin, 
  Clock, 
  CheckCircle2 as CheckIcon, 
  Circle, 
  ArrowRight, 
  Loader2,
  Ticket as TicketIcon,
  Bot
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
  const [technicians, setTechnicians] = useState<any[]>([]);
  const [updating, setUpdating] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchTicketData();
    fetchTechnicians();
    const interval = setInterval(fetchMessages, 5000); // Poll messages every 5s
    return () => clearInterval(interval);
  }, [id]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
    }
  };

  const fetchTicketData = async () => {
    try {
      const [ticketRes, messagesRes] = await Promise.all([
        axios.get(`${API_URL}/tickets/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get(`${API_URL}/tickets/${id}/messages`, {
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

  const fetchTechnicians = async () => {
    try {
      const res = await axios.get(`${API_URL}/users/`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTechnicians(res.data);
    } catch (error) {
      console.error("Error fetching technicians:", error);
    }
  };

  const handleUpdateStatus = async (newStatus: string) => {
    setUpdating(true);
    const data: any = { status: newStatus };
    const now = new Date().toISOString();
    
    // Auto-fill timeline dates
    if (newStatus === 'ON_WAY' || newStatus === 'IN_PROGRESS') {
      if (!ticket.attended_at) data.attended_at = now;
    } else if (newStatus === 'RESOLVED') {
      if (!ticket.resolved_at) data.resolved_at = now;
    }

    try {
      await axios.patch(`${API_URL}/tickets/${id}`, data, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchTicketData();
    } catch (error) {
      console.error("Error updating status:", error);
    } finally {
      setUpdating(false);
    }
  };

  const handleSaveResolution = async (text: string) => {
    setUpdating(true);
    try {
      await axios.patch(`${API_URL}/tickets/${id}`, { resolution_text: text }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchTicketData();
    } catch (error) {
      console.error("Error saving resolution:", error);
    } finally {
      setUpdating(false);
    }
  };

  const handleAssign = async (technicianId: number) => {
    setUpdating(true);
    try {
      await axios.patch(`${API_URL}/tickets/${id}`, { assigned_to_id: technicianId }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchTicketData();
    } catch (error) {
      console.error("Error assigning ticket:", error);
    } finally {
      setUpdating(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const fetchMessages = async () => {
    try {
      const res = await axios.get(`${API_URL}/tickets/${id}/messages`, {
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
      await axios.post(`${API_URL}/tickets/${id}/messages`, {
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
      await axios.post(`${API_URL}/tickets/${id}/evidence?type=${type}`, formData, {
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
    <div className="max-w-7xl mx-auto space-y-6 pb-20">
      {/* 1. Header & Identity */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 print:hidden">
        <div className="flex items-center gap-4">
          <Link to="/dashboard/tickets" className="p-2 hover:bg-white rounded-full transition-all border border-transparent hover:border-slate-200">
            <ChevronLeft className="w-6 h-6 text-slate-500" />
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <span className="text-2xl font-black text-slate-900 tracking-tight">{ticket.code}</span>
              <span className={`px-3 py-1 text-[10px] font-black uppercase rounded-lg border shadow-sm ${
                ticket.status === 'ABIERTO' ? 'bg-blue-50 text-blue-700 border-blue-100' : 
                ticket.status === 'EN_PROGRESO' ? 'bg-amber-50 text-amber-700 border-amber-100' : 
                'bg-emerald-50 text-emerald-700 border-emerald-100'
              }`}>
                {ticket.status.replace('_', ' ')}
              </span>
            </div>
            <h1 className="text-lg font-bold text-slate-600 mt-1">{ticket.title}</h1>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <button 
            onClick={handlePrint}
            className="flex items-center gap-2 px-6 py-3 bg-white text-slate-600 border border-slate-200 rounded-2xl text-xs font-bold hover:bg-slate-50 transition-all shadow-sm"
          >
            <PrinterIcon className="w-4 h-4" /> Generar Acta
          </button>
        </div>
      </div>

      {/* 2. Quick Action Status Bar */}
      <div className="bg-white p-2 rounded-3xl border border-slate-100 shadow-sm flex flex-wrap gap-2 print:hidden">
        {[
          { id: 'ABIERTO', label: 'Abierto', color: 'bg-blue-600', icon: TicketIcon },
          { id: 'EN_CAMINO', label: 'En Camino', color: 'bg-indigo-600', icon: MapPin },
          { id: 'EN_PROGRESO', label: 'En Progreso', color: 'bg-amber-600', icon: Clock },
          { id: 'RESUELTO', label: 'Resuelto', color: 'bg-emerald-600', icon: CheckIcon },
          { id: 'CERRADO', label: 'Cerrado', color: 'bg-slate-900', icon: ShieldAlert },
        ].map((btn) => (
          <button
            key={btn.id}
            onClick={() => handleUpdateStatus(btn.id)}
            disabled={updating || ticket.status === btn.id}
            className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-2xl text-[11px] font-black uppercase tracking-wider transition-all ${
              ticket.status === btn.id 
                ? `${btn.color} text-white shadow-lg` 
                : 'bg-slate-50 text-slate-400 hover:bg-white hover:text-slate-600 border border-transparent hover:border-slate-100'
            }`}
          >
            <btn.icon className="w-4 h-4" />
            {btn.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Info & Timeline */}
        <div className="lg:col-span-1 space-y-6">
          {/* Master Info Cards */}
          <div className="grid grid-cols-1 gap-4">
            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-5">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-50 rounded-2xl">
                  <User className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Solicitante</p>
                  <p className="text-base font-bold text-slate-900">{ticket.requester_name}</p>
                </div>
              </div>

              <div className="flex items-center gap-4 border-t border-slate-50 pt-5">
                <div className="p-3 bg-amber-50 rounded-2xl">
                  <UserCheck className="w-6 h-6 text-amber-600" />
                </div>
                <div className="flex-1">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest text-right md:text-left">Responsable</p>
                  <select 
                    value={ticket.assigned_to_id || ''}
                    onChange={(e) => handleAssign(Number(e.target.value))}
                    disabled={updating}
                    className="w-full text-base font-bold text-slate-900 bg-transparent border-none p-0 outline-none focus:ring-0 cursor-pointer"
                  >
                    <option value="">Sin Asignar</option>
                    {technicians.map(tech => (
                      <option key={tech.id} value={tech.id}>{tech.full_name}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Timeline Visual */}
            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-6">Trazabilidad Temporal</h3>
              <div className="space-y-6">
                {[
                  { label: 'Creado', date: ticket.created_at, icon: TicketIcon, active: true, color: 'text-blue-500', bg: 'bg-blue-500' },
                  { label: 'En Atención', date: ticket.attended_at, icon: Clock, active: !!ticket.attended_at, color: 'text-amber-500', bg: 'bg-amber-500' },
                  { label: 'Resuelto', date: ticket.resolved_at, icon: CheckIcon, active: !!ticket.resolved_at, color: 'text-emerald-500', bg: 'bg-emerald-500' },
                ].map((step, idx, arr) => (
                  <div key={step.label} className="relative flex items-start gap-4">
                    {idx !== arr.length - 1 && (
                      <div className={`absolute left-[11px] top-7 w-[2px] h-10 ${step.active && arr[idx+1].active ? step.bg : 'bg-slate-100'}`}></div>
                    )}
                    <div className={`relative z-10 w-6 h-6 rounded-full flex items-center justify-center ${step.active ? step.bg : 'bg-slate-100'}`}>
                      {step.active ? <step.icon className="w-3 h-3 text-white" /> : <Circle className="w-3 h-3 text-slate-300" />}
                    </div>
                    <div>
                      <p className={`text-xs font-black uppercase tracking-wider ${step.active ? 'text-slate-900' : 'text-slate-300'}`}>{step.label}</p>
                      <p className="text-[10px] font-bold text-slate-400 mt-0.5">
                        {step.date ? new Date(step.date).toLocaleString('es-ES', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }) : 'Pendiente'}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <button 
            onClick={() => setShowMaterialModal(true)}
            className="w-full flex items-center justify-center gap-3 py-4 bg-slate-900 text-white rounded-3xl text-xs font-black uppercase tracking-widest hover:bg-black transition-all shadow-xl shadow-slate-200"
          >
            <Package className="w-5 h-5 text-blue-400" /> Gestionar Repuestos
          </button>
        </div>

        {/* Right Column: Work & Chat */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm space-y-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-1.5 h-6 bg-blue-600 rounded-full"></div>
                <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">Descripción del Usuario</h3>
              </div>
              <p className="text-base text-slate-600 leading-relaxed bg-slate-50/50 p-6 rounded-2xl border border-slate-100 italic">
                "{ticket.description}"
              </p>
            </div>

            {/* Evidence Block */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Evidencia Inicial (Antes)</p>
                {ticket.photo_before ? (
                  <div className="relative group overflow-hidden rounded-2xl border border-slate-200">
                    <img src={`${BASE_URL}${ticket.photo_before}`} className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-500" />
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-slate-200 rounded-2xl hover:bg-slate-50 cursor-pointer transition-all group">
                    <Camera className="w-8 h-8 text-slate-300 group-hover:text-blue-500 transition-colors" />
                    <span className="text-[10px] font-black text-slate-400 mt-2">SUBIR FOTO ANTES</span>
                    <input type="file" accept="image/*" capture="environment" className="hidden" onChange={(e) => handleUploadEvidence('before', e.target.files?.[0])} />
                  </label>
                )}
              </div>
              <div className="space-y-3">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Evidencia de Cierre (Después)</p>
                {ticket.photo_after ? (
                  <div className="relative group overflow-hidden rounded-2xl border border-slate-200">
                    <img src={`${BASE_URL}${ticket.photo_after}`} className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-500" />
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-slate-200 rounded-2xl hover:bg-slate-50 cursor-pointer transition-all group">
                    <CheckIcon className="w-8 h-8 text-slate-300 group-hover:text-emerald-500 transition-colors" />
                    <span className="text-[10px] font-black text-slate-400 mt-2">SUBIR FOTO DESPUÉS</span>
                    <input type="file" accept="image/*" capture="environment" className="hidden" onChange={(e) => handleUploadEvidence('after', e.target.files?.[0])} />
                  </label>
                )}
              </div>
            </div>

            {/* Technical Resolution */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-6 bg-emerald-600 rounded-full"></div>
                  <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">Resolución Técnica</h3>
                </div>
                {updating && <Loader2 className="w-4 h-4 animate-spin text-blue-600" />}
              </div>
              <textarea 
                placeholder="Describe aquí la solución técnica aplicada..."
                className="w-full p-6 bg-slate-900 text-slate-100 rounded-3xl border-none outline-none focus:ring-2 focus:ring-emerald-500 transition-all font-mono text-sm leading-relaxed"
                rows={4}
                defaultValue={ticket.resolution_text || ''}
                onBlur={(e) => handleSaveResolution(e.target.value)}
              />
              <p className="text-[10px] text-slate-400 font-bold italic">* Los cambios en la resolución se guardan automáticamente al salir del campo.</p>
            </div>
          </div>

          {/* Chat Window */}
          <div className="bg-white rounded-3xl border border-slate-100 shadow-sm flex flex-col h-[500px] overflow-hidden">
            <div className="p-5 border-b border-slate-50 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-100">
                  <Bot className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-sm font-black text-slate-900 uppercase tracking-widest">Canal de Comunicación</p>
                  <p className="text-[10px] text-emerald-600 font-black flex items-center gap-1">
                    <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span> CONEXIÓN SEGURA
                  </p>
                </div>
              </div>
            </div>

            <div 
              ref={messagesContainerRef}
              className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50/30"
            >
              {messages.map((msg) => (
                <div key={msg.id} className={`flex ${msg.user_id === user?.id ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[80%] p-4 rounded-2xl shadow-sm ${
                    msg.user_id === user?.id 
                      ? 'bg-blue-600 text-white rounded-tr-none' 
                      : 'bg-white text-slate-700 border border-slate-100 rounded-tl-none'
                  }`}>
                    <p className="text-sm font-medium">{msg.message}</p>
                    <div className={`flex items-center gap-2 mt-3 opacity-60 text-[9px] font-black uppercase ${msg.user_id === user?.id ? 'text-blue-100' : 'text-slate-400'}`}>
                      <Clock className="w-3 h-3" />
                      {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                </div>
              ))}
              <div ref={chatEndRef} />
            </div>

            <div className="p-4 bg-white border-t border-slate-100">
              <form onSubmit={handleSendMessage} className="flex gap-3">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Escribe un mensaje..."
                  className="flex-1 px-6 py-4 rounded-2xl bg-slate-50 border-none outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm font-medium"
                />
                <button
                  type="submit"
                  disabled={sending || !newMessage.trim()}
                  className="p-4 bg-blue-600 text-white rounded-2xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-100 disabled:opacity-50"
                >
                  <Send className="w-5 h-5" />
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
      {showMaterialModal && (
        <MaterialConsumptionModal 
          ticketId={Number(id)} 
          onClose={() => {
            setShowMaterialModal(false);
            fetchTicketData();
          }} 
        />
      )}
    </div>
  );
}
