import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { 
  Ticket, 
  Clock, 
  CheckCircle2, 
  AlertCircle,
  TrendingUp,
  ArrowRight,
  Loader2
} from 'lucide-react';
import { Link } from 'react-router-dom';

interface DashboardStats {
  open: number;
  in_progress: number;
  resolved: number;
  total: number;
}

interface RecentTicket {
  id: number;
  code: string;
  title: string;
  status: string;
}

export default function DashboardPage() {
  const { user, token } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentTickets, setRecentTickets] = useState<RecentTicket[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token) {
      fetchDashboardData();
      
      // Real-time listener for updates
      const ws = new WebSocket(`ws://localhost:8001/api/v1/ws/${user?.id}`);
      ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        if (data.type === 'ticket_update' || data.type === 'new_ticket') {
          fetchDashboardData();
        }
      };
      return () => ws.close();
    }
  }, [token, user]);

  const fetchDashboardData = async () => {
    try {
      const [statsRes, ticketsRes] = await Promise.all([
        axios.get('http://localhost:8001/api/v1/tickets/summary/stats', {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get('http://localhost:8001/api/v1/tickets/', {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);
      setStats(statsRes.data);
      setRecentTickets(ticketsRes.data.slice(0, 5));
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    { label: 'Tickets Abiertos', value: stats?.open || 0, icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50' },
    { label: 'En Progreso', value: stats?.in_progress || 0, icon: AlertCircle, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Resueltos', value: stats?.resolved || 0, icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { label: 'Total Tickets', value: stats?.total || 0, icon: TrendingUp, color: 'text-indigo-600', bg: 'bg-indigo-50' },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Bienvenido, {user?.full_name.split(' ')[0]} 👋</h1>
        <p className="text-slate-500 mt-1">Aquí tienes un resumen del estado del soporte técnico hoy.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat) => (
          <div key={stat.label} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className={`p-2 rounded-xl ${stat.bg}`}>
                <stat.icon className={`w-6 h-6 ${stat.color}`} />
              </div>
            </div>
            <p className="text-sm font-medium text-slate-500">{stat.label}</p>
            <p className="text-2xl font-bold text-slate-900 mt-1">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-slate-900">Tickets Recientes</h3>
            <Link to="/dashboard/tickets" className="text-sm font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1">
              Ver todos <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="space-y-4">
            {recentTickets.length === 0 ? (
              <p className="text-sm text-slate-400 text-center py-4">No hay tickets recientes.</p>
            ) : (
              recentTickets.map((ticket) => (
                <div key={ticket.id} className="flex items-center justify-between p-4 rounded-xl border border-slate-50 hover:bg-slate-50 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-400 uppercase">
                      {ticket.title.charAt(0)}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-900">{ticket.title}</p>
                      <p className="text-xs text-slate-500 font-medium">{ticket.code}</p>
                    </div>
                  </div>
                  <span className={`px-3 py-1 text-[10px] font-bold uppercase rounded-full ${
                    ticket.status === 'open' ? 'bg-blue-100 text-blue-700' : 
                    ticket.status === 'in_progress' ? 'bg-amber-100 text-amber-700' : 
                    'bg-emerald-100 text-emerald-700'
                  }`}>
                    {ticket.status.replace('_', ' ')}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-600 to-indigo-700 p-8 rounded-2xl shadow-xl text-white relative overflow-hidden">
          <div className="relative z-10">
            <h3 className="text-xl font-bold mb-2">Agente de IA Activo</h3>
            <p className="text-blue-100 text-sm mb-6 max-w-xs">
              La inteligencia artificial clasifica automáticamente tus tickets por categoría y prioridad para acelerar el soporte técnico.
            </p>
            <Link to="/dashboard/tickets" className="bg-white inline-block text-blue-600 px-6 py-2 rounded-xl font-bold text-sm hover:bg-blue-50 transition-colors">
              Crear Ticket con IA
            </Link>
          </div>
          <div className="absolute right-[-20px] bottom-[-20px] opacity-10">
            <Ticket className="w-48 h-48" />
          </div>
        </div>
      </div>
    </div>
  );
}
