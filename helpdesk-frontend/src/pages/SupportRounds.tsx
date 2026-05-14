import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { 
  ClipboardList, 
  Plus, 
  Search, 
  Printer, 
  CheckCircle2, 
  AlertCircle,
  Clock,
  MapPin,
  User as UserIcon,
  Filter,
  ArrowRight
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import SupportRoundForm from '../components/rounds/SupportRoundForm';
import RoundReportPrint from '../components/rounds/RoundReportPrint';

export default function SupportRounds() {
  const { token, user } = useAuth();
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRoundForPrint, setSelectedRoundForPrint] = useState<any>(null);

  const { data: company } = useQuery({
    queryKey: ['company-settings'],
    queryFn: async () => {
      const res = await axios.get('http://localhost:8001/api/v1/settings/company', {
        headers: { Authorization: `Bearer ${token}` }
      });
      return res.data;
    }
  });

  const { data: rounds, isLoading, refetch } = useQuery({
    queryKey: ['support-rounds'],
    queryFn: async () => {
      const res = await axios.get('http://localhost:8001/api/v1/rounds/', {
        headers: { Authorization: `Bearer ${token}` }
      });
      return res.data;
    }
  });

  const filteredRounds = rounds?.filter((r: any) => 
    r.area.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.technician_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Rondas Técnicas</h1>
          <p className="text-slate-500 mt-1 font-medium">Verificación preventiva y control de estado por áreas.</p>
        </div>
        <button 
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 bg-blue-600 text-white px-6 py-4 rounded-[20px] font-black uppercase tracking-widest text-xs shadow-xl shadow-blue-100 hover:bg-blue-700 transition-all hover:scale-[1.02] active:scale-[0.98]"
        >
          <Plus className="w-5 h-5" /> Nueva Ronda de Soporte
        </button>
      </div>

      {showForm ? (
        <div className="max-w-4xl mx-auto">
          <SupportRoundForm 
            onSuccess={() => { setShowForm(false); refetch(); }} 
            onCancel={() => setShowForm(false)} 
          />
        </div>
      ) : (
        <>
          {/* Filters & Search */}
          <div className="bg-white p-4 rounded-[24px] border border-slate-100 shadow-sm flex flex-col md:flex-row gap-4 items-center">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input 
                type="text" 
                placeholder="Buscar por área o técnico..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold outline-none focus:ring-4 focus:ring-blue-500/10 focus:bg-white transition-all"
              />
            </div>
            <div className="flex items-center gap-2">
              <button className="p-3 bg-slate-50 text-slate-400 rounded-xl hover:bg-slate-100 transition-colors">
                <Filter className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Lista de Rondas (Compacta) */}
          <div className="bg-white rounded-[32px] border border-slate-100 shadow-xl shadow-slate-200/20 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-slate-50/50 border-b border-slate-100">
                    <th className="px-6 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Estado</th>
                    <th className="px-6 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Área / Ubicación</th>
                    <th className="px-6 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Técnico Responsable</th>
                    <th className="px-6 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Fecha y Hora</th>
                    <th className="px-6 py-4 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {filteredRounds?.map((round: any) => (
                    <tr key={round.id} className="hover:bg-blue-50/30 transition-colors group">
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                          round.has_incident 
                            ? 'bg-red-50 text-red-600' 
                            : 'bg-emerald-50 text-emerald-600'
                        }`}>
                          {round.has_incident ? <AlertCircle className="w-3 h-3" /> : <CheckCircle2 className="w-3 h-3" />}
                          {round.has_incident ? 'Incidencia' : 'Operativo'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-slate-50 rounded-xl group-hover:bg-white transition-colors">
                            <MapPin className="w-4 h-4 text-slate-400 group-hover:text-blue-600" />
                          </div>
                          <span className="text-sm font-black text-slate-900">{round.area}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-sm font-bold text-slate-600">
                          <UserIcon className="w-4 h-4 text-blue-500" />
                          {round.technician_name}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm font-bold text-slate-400">
                        {new Date(round.visit_time).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 text-right">
                          <button 
                            onClick={() => {
                              setSelectedRoundForPrint(round);
                              setTimeout(() => window.print(), 100);
                            }} 
                            className="p-3 bg-slate-50 text-slate-400 rounded-xl hover:bg-slate-900 hover:text-white transition-all shadow-sm"
                            title="Imprimir Acta"
                          >
                            <Printer className="w-4 h-4" />
                          </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Componente de Impresión Oculto */}
              <RoundReportPrint round={selectedRoundForPrint} company={company} />

              {filteredRounds?.length === 0 && (
                <div className="p-20 text-center">
                  <div className="inline-flex p-6 bg-slate-50 rounded-full mb-4">
                    <ClipboardList className="w-12 h-12 text-slate-300" />
                  </div>
                  <h3 className="text-xl font-black text-slate-900">No hay rondas registradas</h3>
                  <p className="text-slate-500 mt-2 font-medium">Comienza por realizar tu primera inspección técnica de áreas.</p>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
