import React, { useState } from 'react';
import { Shield, Trash2, Printer, Cpu, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { useNotification } from '../context/NotificationContext';

export default function LocalMaintenance() {
  const [loading, setLoading] = useState<string | null>(null);
  const { showNotification } = useNotification();

  const isElectron = !!(window as any).electronAPI;

  if (!isElectron) return null;

  const handleAction = async (action: 'clean' | 'spooler' | 'ram') => {

    setLoading(action);
    try {
      const result = await (window as any).electronAPI.executeAction(action);
      showNotification('success', 'Éxito', result.message);
    } catch (error: any) {
      showNotification('error', 'Error de Sistema', error.message || 'No se pudo completar la acción.');
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
      <div className="flex items-center gap-3 mb-8">
        <div className="p-3 bg-indigo-50 rounded-2xl">
          <Shield className="w-6 h-6 text-indigo-600" />
        </div>
        <div>
          <h2 className="text-xl font-black text-slate-900">Mantenimiento de Equipo Local</h2>
          <p className="text-sm text-slate-500 font-medium">Herramientas administrativas de diagnóstico rápido.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Acción: Limpieza */}
        <button
          onClick={() => handleAction('clean')}
          disabled={loading !== null}
          className="group p-6 bg-slate-50 hover:bg-white border border-transparent hover:border-slate-200 rounded-2xl transition-all duration-300 text-left relative overflow-hidden"
        >
          <div className="relative z-10">
            <Trash2 className="w-8 h-8 text-rose-500 mb-4 group-hover:scale-110 transition-transform" />
            <h3 className="font-bold text-slate-900">Limpiar Temporales</h3>
            <p className="text-xs text-slate-500 mt-2">Elimina archivos de caché y temporales de Windows.</p>
          </div>
          {loading === 'clean' && (
            <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center">
              <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
          )}
        </button>

        {/* Acción: Spooler */}
        <button
          onClick={() => handleAction('spooler')}
          disabled={loading !== null}
          className="group p-6 bg-slate-50 hover:bg-white border border-transparent hover:border-slate-200 rounded-2xl transition-all duration-300 text-left relative overflow-hidden"
        >
          <div className="relative z-10">
            <Printer className="w-8 h-8 text-amber-500 mb-4 group-hover:scale-110 transition-transform" />
            <h3 className="font-bold text-slate-900">Reset Impresoras</h3>
            <p className="text-xs text-slate-500 mt-2">Reinicia la cola y limpia documentos atascados.</p>
          </div>
          {loading === 'spooler' && (
            <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center">
              <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
          )}
        </button>

        {/* Acción: RAM */}
        <button
          onClick={() => handleAction('ram')}
          disabled={loading !== null}
          className="group p-6 bg-slate-50 hover:bg-white border border-transparent hover:border-slate-200 rounded-2xl transition-all duration-300 text-left relative overflow-hidden"
        >
          <div className="relative z-10">
            <Cpu className="w-8 h-8 text-emerald-500 mb-4 group-hover:scale-110 transition-transform" />
            <h3 className="font-bold text-slate-900">Optimizar RAM</h3>
            <p className="text-xs text-slate-500 mt-2">Finaliza procesos que no responden.</p>
          </div>
          {loading === 'ram' && (
            <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center">
              <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
          )}
        </button>
      </div>
    </div>
  );
}
