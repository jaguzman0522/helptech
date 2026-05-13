import React, { useState } from 'react';
import { 
  Search, 
  QrCode, 
  Package, 
  History, 
  Wrench, 
  User, 
  Calendar,
  AlertCircle,
  ArrowRight,
  TrendingDown,
  ArrowUpRight,
  Plus
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';

export default function AssetLookup() {
  const { token } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [searchTrigger, setSearchTrigger] = useState('');

  const { data: asset, isLoading, error } = useQuery({
    queryKey: ['asset-360', searchTrigger],
    queryFn: async () => {
      if (!searchTrigger) return null;
      const res = await axios.get(`http://localhost:8001/api/v1/inventory/assets/${searchTrigger}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return res.data;
    },
    enabled: !!searchTrigger
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchTrigger(searchTerm);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Consulta Global de Activos</h1>
        <p className="text-slate-500 mt-1">Escanea un código de barras o busca por ID para ver la radiografía 360°.</p>
      </div>

      {/* Search Bar */}
      <form onSubmit={handleSearch} className="flex gap-4">
        <div className="relative flex-1 group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
          <input 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Escanear Código o Ingresar ID (Ej: LAP-001)..."
            className="w-full pl-12 pr-4 py-4 bg-white border border-slate-200 rounded-3xl shadow-sm outline-none focus:ring-4 focus:ring-blue-50 focus:border-blue-500 transition-all font-medium"
          />
        </div>
        <button type="submit" className="px-8 py-4 bg-slate-900 text-white rounded-3xl font-bold hover:bg-black transition-all shadow-lg flex items-center gap-2">
          <QrCode className="w-5 h-5" /> Consultar
        </button>
      </form>

      {isLoading && (
        <div className="flex flex-col items-center justify-center py-20 text-slate-400 space-y-4">
          <div className="w-12 h-12 border-4 border-slate-100 border-t-blue-600 rounded-full animate-spin" />
          <p className="font-bold text-sm uppercase tracking-widest">Obteniendo Radiografía 360°...</p>
        </div>
      )}

      {asset && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Info Card */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm relative overflow-hidden">
              <div className="flex items-start justify-between relative z-10">
                <div>
                  <span className="px-3 py-1 bg-blue-50 text-blue-600 text-[10px] font-black uppercase rounded-full tracking-wider">
                    {asset.product.category_id || 'Activo Fijo'}
                  </span>
                  <h2 className="text-4xl font-black text-slate-900 mt-2">{asset.product.name}</h2>
                  <div className="flex items-center gap-4 mt-4">
                    <div className="text-xs font-bold text-slate-400 flex items-center gap-1">
                      <Package className="w-3 h-3" /> ID: {asset.product.code}
                    </div>
                    <div className="text-xs font-bold text-slate-400 flex items-center gap-1">
                      <QrCode className="w-3 h-3" /> QR: {asset.product.barcode || 'N/A'}
                    </div>
                  </div>
                </div>
                <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100">
                  <p className="text-[10px] font-black text-emerald-600 uppercase mb-1">Estado Actual</p>
                  <p className="text-lg font-black text-emerald-700">ASIGNADO</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-12 pt-8 border-t border-slate-50">
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase">Costo Adquisición</p>
                  <p className="text-lg font-bold text-slate-900">${asset.product.purchase_price || '0.00'}</p>
                </div>
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase">Garantía Hasta</p>
                  <p className="text-lg font-bold text-slate-900">2025-12-01</p>
                </div>
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase">Mantenimientos</p>
                  <p className="text-lg font-bold text-slate-900">{asset.tickets.length}</p>
                </div>
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase">Ubicación</p>
                  <p className="text-lg font-bold text-slate-900">Piso 4 - Of. 402</p>
                </div>
              </div>

              <Package className="absolute -right-10 -bottom-10 w-64 h-64 text-slate-50/50 -rotate-12" />
            </div>

            {/* Timelines */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Service History */}
              <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
                <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest flex items-center gap-2 mb-6">
                  <Wrench className="w-4 h-4 text-blue-600" /> Historial Técnico (Tickets)
                </h3>
                <div className="space-y-4">
                  {asset.tickets.map((t: any) => (
                    <div key={t.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-100 group hover:bg-white transition-all cursor-pointer">
                      <div className="flex justify-between items-start">
                        <p className="text-xs font-bold text-slate-900">{t.title}</p>
                        <span className="text-[8px] font-black px-2 py-0.5 bg-white border border-slate-200 rounded-md">{t.code}</span>
                      </div>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-[9px] text-slate-400 font-bold uppercase">{new Date(t.created_at).toLocaleDateString()}</span>
                        <span className="text-[9px] text-emerald-600 font-bold uppercase">{t.status}</span>
                      </div>
                    </div>
                  ))}
                  {asset.tickets.length === 0 && <p className="text-xs text-slate-400 text-center py-4">Sin reportes técnicos registrados.</p>}
                </div>
              </div>

              {/* Movement History */}
              <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
                <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest flex items-center gap-2 mb-6">
                  <History className="w-4 h-4 text-amber-600" /> Kardex (Movimientos)
                </h3>
                <div className="space-y-4">
                  {asset.movements.map((m: any) => (
                    <div key={m.id} className="flex gap-4">
                      <div className="flex flex-col items-center">
                        <div className={`w-2 h-2 rounded-full mt-1 ${m.type === 'ENTRY' ? 'bg-emerald-500' : 'bg-red-500'}`} />
                        <div className="w-0.5 flex-1 bg-slate-100 my-1" />
                      </div>
                      <div className="pb-4">
                        <p className="text-xs font-bold text-slate-900">{m.type === 'ENTRY' ? 'Entrada Inicial' : 'Ajuste Stock'}</p>
                        <p className="text-[10px] text-slate-400">{new Date(m.created_at).toLocaleDateString()} - Cant: {m.quantity}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar Actions & Assignment */}
          <div className="space-y-6">
            {/* Current Assignment Card */}
            <div className="bg-slate-900 p-8 rounded-[40px] text-white">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center">
                  <User className="w-6 h-6 text-blue-400" />
                </div>
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Responsable Actual</p>
                  <p className="text-lg font-bold">{asset.current_assignment.user}</p>
                </div>
              </div>
              <div className="space-y-4 pt-6 border-t border-white/10">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-400">Asignado el</span>
                  <span className="font-bold">{asset.current_assignment.date}</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-400">Condición</span>
                  <span className="font-bold text-emerald-400">{asset.current_assignment.condition}</span>
                </div>
              </div>
              <button className="w-full mt-8 py-3 bg-white text-slate-900 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-blue-50 transition-all flex items-center justify-center gap-2">
                Reasignar Activo <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            {/* Quick Actions */}
            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-3">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Acciones de Campo</p>
              <Link 
                to={`/dashboard/tickets/new?asset_id=${asset.product.id}`}
                className="w-full flex items-center justify-between p-4 bg-slate-50 rounded-2xl hover:bg-blue-50 hover:text-blue-600 transition-all group"
              >
                <div className="flex items-center gap-3">
                  <Plus className="w-4 h-4" />
                  <span className="text-xs font-bold">Reportar Falla</span>
                </div>
                <ArrowUpRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-all" />
              </Link>
              <button className="w-full flex items-center justify-between p-4 bg-slate-50 rounded-2xl hover:bg-amber-50 hover:text-amber-600 transition-all group">
                <div className="flex items-center gap-3">
                  <Wrench className="w-4 h-4" />
                  <span className="text-xs font-bold">Programar Mantenimiento</span>
                </div>
                <ArrowUpRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-all" />
              </button>
              <button className="w-full flex items-center justify-between p-4 bg-slate-50 rounded-2xl hover:bg-red-50 hover:text-red-600 transition-all group">
                <div className="flex items-center gap-3">
                  <TrendingDown className="w-4 h-4" />
                  <span className="text-xs font-bold">Baja Técnica / Retiro</span>
                </div>
                <ArrowUpRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-all" />
              </button>
            </div>
          </div>
        </div>
      )}

      {!asset && !isLoading && searchTrigger && (
        <div className="bg-white p-12 rounded-[40px] border border-slate-100 shadow-sm text-center">
          <AlertCircle className="w-16 h-16 text-slate-200 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-slate-900">Activo no encontrado</h3>
          <p className="text-slate-500 mt-2">Verifica el código e intenta de nuevo o realiza un alta manual.</p>
          <button 
            onClick={() => setSearchTrigger('')}
            className="mt-6 text-sm font-bold text-blue-600 hover:underline"
          >
            Limpiar búsqueda
          </button>
        </div>
      )}
    </div>
  );
}
