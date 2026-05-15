import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { API_URL, WS_URL } from '../api/config';
import { 
  Ticket as TicketIcon, 
  Plus, 
  Search, 
  Filter,
  MoreVertical,
  Clock,
  AlertCircle,
  Radio,
  Eye,
  Printer,
  Bot
} from 'lucide-react';
import { Link } from 'react-router-dom';

interface Ticket {
  id: number;
  code: string;
  title: string;
  status: string;
  priority: string;
  category?: string;
  created_at: string;
  external_source?: string;
}

const statusStyles: Record<string, string> = {
  OPEN: 'bg-blue-50 text-blue-700 border-blue-100',
  IN_PROGRESS: 'bg-amber-50 text-amber-700 border-amber-100',
  RESOLVED: 'bg-emerald-50 text-emerald-700 border-emerald-100',
  CLOSED: 'bg-slate-50 text-slate-700 border-slate-100',
};

const priorityIcons: Record<string, any> = {
  LOW: { icon: Clock, color: 'text-slate-400' },
  MEDIUM: { icon: AlertCircle, color: 'text-blue-500' },
  HIGH: { icon: AlertCircle, color: 'text-amber-500' },
  CRITICAL: { icon: AlertCircle, color: 'text-red-500' },
};

export default function TicketsPage() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    status: '',
    origin: '',
    source: ''
  });
  const { token, user, hasPermission } = useAuth();

  useEffect(() => {
    if (token) {
      fetchTickets();
      setupWebSocket();
    }
  }, [token, filters]); // Refetch when filters change

  const setupWebSocket = () => {
    if (!user) return;
    const ws = new WebSocket(`${WS_URL}/ws/${user.id}`);
    
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === 'ticket_update' || data.type === 'new_ticket') {
        fetchTickets();
      }
    };

    return () => ws.close();
  };

  const fetchTickets = async () => {
    try {
      const params = new URLSearchParams();
      if (filters.status) params.append('status', filters.status);
      if (filters.origin) params.append('origin', filters.origin);
      if (filters.source) params.append('source', filters.source);

      const response = await axios.get(`${API_URL}/tickets/?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTickets(response.data);
    } catch (error) {
      console.error('Error fetching tickets:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Tickets de Soporte</h1>
          <p className="text-slate-500 text-sm">Gestiona y realiza seguimiento a todas las solicitudes.</p>
        </div>
        <Link 
          to="/dashboard/tickets/new"
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-xl font-bold text-sm hover:bg-blue-700 transition-all shadow-lg shadow-blue-100"
        >
          <Plus className="w-4 h-4" /> Nuevo Ticket
        </Link>
      </div>

      <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input 
            type="text" 
            placeholder="Buscar por código o título..." 
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="flex gap-2 w-full md:w-auto">
          <select 
            value={filters.status}
            onChange={(e) => setFilters({...filters, status: e.target.value})}
            className="px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-600 outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Todos los Estados</option>
            <option value="OPEN">Abiertos</option>
            <option value="IN_PROGRESS">En Proceso</option>
            <option value="RESOLVED">Resueltos</option>
          </select>
          
          <select 
            value={filters.origin}
            onChange={(e) => setFilters({...filters, origin: e.target.value})}
            className="px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-600 outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Todos los Orígenes</option>
            <option value="INTERNAL">App Interna</option>
            <option value="EXTERNAL">API Externa</option>
          </select>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/50 border-b border-slate-100">
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Ticket</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Estado</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Prioridad</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Fecha</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {loading ? (
              [1, 2, 3].map((i) => (
                <tr key={i} className="animate-pulse">
                  <td colSpan={5} className="px-6 py-4">
                    <div className="h-4 bg-slate-100 rounded w-3/4"></div>
                  </td>
                </tr>
              ))
            ) : tickets.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-slate-400">
                  <TicketIcon className="w-12 h-12 mx-auto mb-2 opacity-20" />
                  <p>No se encontraron tickets.</p>
                </td>
              </tr>
            ) : (
              tickets.map((ticket) => (
                <tr key={ticket.id} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="px-6 py-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <Link to={`/dashboard/tickets/${ticket.id}`} className="font-bold text-slate-900 hover:text-blue-600 transition-colors">
                          {ticket.title}
                        </Link>
                        {ticket.external_source && (
                          <span className="flex items-center gap-1 px-2 py-0.5 bg-indigo-50 text-indigo-600 text-[8px] font-black uppercase rounded-md border border-indigo-100">
                            <Radio className="w-2 h-2" /> {ticket.external_source}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-500 font-medium">{ticket.code}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase border ${statusStyles[ticket.status]}`}>
                      {ticket.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      {React.createElement(priorityIcons[ticket.priority]?.icon || AlertCircle, {
                        className: `w-4 h-4 ${priorityIcons[ticket.priority]?.color || 'text-slate-400'}`
                      })}
                      <span className="text-sm text-slate-600 capitalize">{ticket.priority}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm text-slate-600">
                      {new Date(ticket.created_at).toLocaleDateString('es-ES', { day: '2-digit', month: 'short' })}
                    </p>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      {hasPermission('tickets', 'ver') && (
                        <Link 
                          to={`/dashboard/tickets/${ticket.id}`}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Ver Detalle"
                        >
                          <Eye className="w-4 h-4" />
                        </Link>
                      )}
                      
                      {hasPermission('tickets', 'imprimir') && (
                        <button 
                          className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                          title="Imprimir"
                        >
                          <Printer className="w-4 h-4" />
                        </button>
                      )}

                      {hasPermission('tickets', 'ia') && (
                        <button 
                          className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                          title="Análisis IA"
                        >
                          <Bot className="w-4 h-4" />
                        </button>
                      )}

                      <button className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">
                        <MoreVertical className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
