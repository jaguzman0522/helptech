import React from 'react';
import { 
  Users, 
  Building2, 
  CreditCard, 
  Activity, 
  ArrowUpRight, 
  TrendingUp,
  AlertTriangle,
  Globe,
  Radio
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';

export default function SuperAdminDashboard() {
  const { token } = useAuth();

  const { data: stats } = useQuery({
    queryKey: ['superadmin-stats'],
    queryFn: async () => {
      const res = await axios.get('http://localhost:8001/api/v1/superadmin/stats/global', {
        headers: { Authorization: `Bearer ${token}` }
      });
      return res.data;
    }
  });

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight flex items-center gap-3">
            <span className="p-2 bg-slate-900 text-white rounded-xl"><Globe className="w-6 h-6" /></span>
            Panel Maestro SuperAdmin
          </h1>
          <p className="text-slate-500 mt-1">Control global de infraestructura multi-tenant y KPIs de negocio.</p>
        </div>
        <button className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-2xl font-bold shadow-lg shadow-blue-100 hover:bg-blue-700 transition-all">
          <Radio className="w-5 h-5 animate-pulse" /> Broadcast Global
        </button>
      </div>

      {/* Global KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm border-l-4 border-l-blue-600">
          <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Empresas Activas</p>
          <p className="text-3xl font-black text-slate-900">{stats?.active_companies || 0} / {stats?.total_companies || 0}</p>
          <div className="flex items-center gap-1 mt-2 text-emerald-600 text-xs font-bold">
            <ArrowUpRight className="w-3 h-3" /> +2 este mes
          </div>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm border-l-4 border-l-emerald-600">
          <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">MRR Estimado</p>
          <p className="text-3xl font-black text-slate-900">${stats?.mrr_estimate?.toFixed(2) || '0.00'}</p>
          <div className="flex items-center gap-1 mt-2 text-emerald-600 text-xs font-bold">
            <TrendingUp className="w-3 h-3" /> Basado en planes Pro
          </div>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm border-l-4 border-l-amber-600">
          <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Tickets Totales (Global)</p>
          <p className="text-3xl font-black text-slate-900">{stats?.total_tickets_system || 0}</p>
          <div className="flex items-center gap-1 mt-2 text-slate-400 text-xs font-bold">
            Tráfico total del sistema
          </div>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm border-l-4 border-l-slate-900">
          <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Salud del Sistema</p>
          <p className="text-3xl font-black text-emerald-600">99.9%</p>
          <div className="flex items-center gap-1 mt-2 text-emerald-600 text-xs font-bold">
            <Activity className="w-3 h-3" /> Operativo
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Distribución de Planes Chart */}
        <div className="lg:col-span-2 bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
          <h3 className="text-lg font-bold text-slate-900 mb-8 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-blue-600" /> Crecimiento de Tenants
          </h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={[
                { month: 'Ene', empresas: 4 },
                { month: 'Feb', empresas: 7 },
                { month: 'Mar', empresas: 12 },
                { month: 'Abr', empresas: 18 },
                { month: 'May', empresas: stats?.total_companies || 20 },
              ]}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                <Tooltip 
                  contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}}
                  cursor={{fill: '#f8fafc'}}
                />
                <Bar dataKey="empresas" fill="#0f172a" radius={[6, 6, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Cuentas Pendientes/Alertas */}
        <div className="bg-slate-900 p-8 rounded-3xl text-white">
          <h3 className="text-lg font-bold mb-6 flex items-center gap-2 text-amber-400">
            <AlertTriangle className="w-5 h-5" /> Alertas Críticas
          </h3>
          <div className="space-y-4">
            <div className="p-4 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 transition-all cursor-pointer group">
              <p className="text-sm font-bold group-hover:text-amber-400">2 Empresas sin pago</p>
              <p className="text-[10px] text-slate-400 mt-1 uppercase tracking-wider">Mora superior a 5 días</p>
            </div>
            <div className="p-4 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 transition-all cursor-pointer group">
              <p className="text-sm font-bold group-hover:text-blue-400">Nueva Solicitud Enterprise</p>
              <p className="text-[10px] text-slate-400 mt-1 uppercase tracking-wider">Hospital General (Santo Domingo)</p>
            </div>
          </div>
          <button className="w-full mt-8 py-3 border border-white/20 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-white hover:text-slate-900 transition-all">
            Ver todas las alertas
          </button>
        </div>
      </div>
    </div>
  );
}
