import React from 'react';
import { 
  Building2, 
  Search, 
  Filter, 
  MoreVertical, 
  ShieldCheck, 
  ShieldAlert, 
  Power,
  ExternalLink,
  Loader2
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';

export default function SuperAdminCompanies() {
  const { token } = useAuth();
  const { showNotification } = useNotification();
  const queryClient = useQueryClient();

  const { data: companies, isLoading } = useQuery({
    queryKey: ['superadmin-companies'],
    queryFn: async () => {
      const res = await axios.get('http://localhost:8001/api/v1/superadmin/companies', {
        headers: { Authorization: `Bearer ${token}` }
      });
      return res.data;
    }
  });

  const toggleMutation = useMutation({
    mutationFn: (id: number) => {
      return axios.post(`http://localhost:8001/api/v1/superadmin/companies/${id}/toggle-status`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
    },
    onSuccess: (data) => {
      showNotification('success', 'Estado Actualizado', `La empresa ha sido ${data.data.is_active ? 'activada' : 'suspendida'} correctamente.`);
      queryClient.invalidateQueries({ queryKey: ['superadmin-companies'] });
    }
  });

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Gestión de Tenants</h1>
          <p className="text-slate-500 mt-1">Control total sobre las empresas registradas y su estado de servicio.</p>
        </div>
        <button className="px-6 py-3 bg-slate-900 text-white rounded-2xl font-bold shadow-lg hover:bg-black transition-all">
          Registrar Nueva Empresa
        </button>
      </div>

      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-50 flex items-center justify-between bg-slate-50/50">
          <div className="relative w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              placeholder="Buscar por nombre, RNC o ID..."
              className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none text-sm"
            />
          </div>
          <button className="flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-slate-900 px-4 py-2 rounded-xl hover:bg-white transition-all">
            <Filter className="w-4 h-4" /> Filtros Avanzados
          </button>
        </div>

        <table className="w-full text-left">
          <thead>
            <tr className="bg-slate-50">
              <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Empresa</th>
              <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Plan</th>
              <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Estado</th>
              <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">ID / RNC</th>
              <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {companies?.map((company: any) => (
              <tr key={company.id} className="hover:bg-slate-50/50 transition-colors group">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-500 font-bold">
                      {company.name.charAt(0)}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-900">{company.name}</p>
                      <p className="text-[10px] text-slate-400 font-medium">Registrada en {new Date(company.created_at || Date.now()).toLocaleDateString()}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className="px-3 py-1 bg-blue-50 text-blue-600 text-[10px] font-black uppercase rounded-full">
                    Enterprise
                  </span>
                </td>
                <td className="px-6 py-4">
                  {company.is_active ? (
                    <div className="flex items-center gap-2 text-emerald-600 font-bold text-xs">
                      <ShieldCheck className="w-4 h-4" /> Activa
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-red-500 font-bold text-xs">
                      <ShieldAlert className="w-4 h-4" /> Suspendida
                    </div>
                  )}
                </td>
                <td className="px-6 py-4">
                  <p className="text-sm font-bold text-slate-900">ID: {company.id}</p>
                  <p className="text-[10px] text-slate-400 font-medium tracking-wider">RNC: {company.rnc || 'N/A'}</p>
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button 
                      onClick={() => toggleMutation.mutate(company.id)}
                      disabled={toggleMutation.isPending}
                      className={`p-2 rounded-xl transition-all ${
                        company.is_active 
                          ? 'text-red-400 hover:bg-red-50 hover:text-red-600' 
                          : 'text-emerald-400 hover:bg-emerald-50 hover:text-emerald-600'
                      }`}
                      title={company.is_active ? "Suspender Servicio" : "Activar Servicio"}
                    >
                      {toggleMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Power className="w-4 h-4" />}
                    </button>
                    <button className="p-2 text-slate-400 hover:bg-slate-100 rounded-xl transition-all">
                      <ExternalLink className="w-4 h-4" />
                    </button>
                    <button className="p-2 text-slate-400 hover:bg-slate-100 rounded-xl transition-all">
                      <MoreVertical className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
