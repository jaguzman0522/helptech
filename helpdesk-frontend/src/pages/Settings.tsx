import React, { useState } from 'react';
import { 
  Building2, 
  Users, 
  Cpu, 
  Hash, 
  ShieldCheck, 
  Settings as SettingsIcon,
  Save,
  Loader2,
  Database,
  Globe,
  Key,
  CreditCard,
  History,
  Workflow,
  Zap,
  Lock,
  Tag
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';

export default function Settings() {
  const { token } = useAuth();
  const { showNotification } = useNotification();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('identidad');

  const { data: company } = useQuery({
    queryKey: ['company-settings'],
    queryFn: async () => {
      const res = await axios.get('http://localhost:8001/api/v1/settings/company', {
        headers: { Authorization: `Bearer ${token}` }
      });
      return res.data;
    }
  });

  const { data: departments } = useQuery({
    queryKey: ['settings-departments'],
    queryFn: async () => {
      const res = await axios.get('http://localhost:8001/api/v1/settings/departments', {
        headers: { Authorization: `Bearer ${token}` }
      });
      return res.data;
    }
  });

  const { data: externalApps, refetch: refetchApps } = useQuery({
    queryKey: ['external-apps'],
    queryFn: async () => {
      const res = await axios.get('http://localhost:8001/api/v1/settings/external-apps', {
        headers: { Authorization: `Bearer ${token}` }
      });
      return res.data;
    }
  });

  const [newApp, setNewApp] = useState({ name: '', prefix: 'EXT' });
  const [createdApp, setCreatedApp] = useState<any>(null);
  const [isCreating, setIsCreating] = useState(false);

  const handleCreateApp = async () => {
    setIsCreating(true);
    try {
      const res = await axios.post('http://localhost:8001/api/v1/settings/external-apps', newApp, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCreatedApp(res.data);
      refetchApps();
      showNotification('Aplicación creada con éxito', 'success');
    } catch (error) {
      showNotification('Error al crear la aplicación', 'error');
    } finally {
      setIsCreating(false);
    }
  };

  const tabs = [
    { id: 'identidad', label: 'General y Marca', icon: Building2 },
    { id: 'estructura', label: 'Organización', icon: Users },
    { id: 'automatizacion', label: 'IA y Tareas', icon: Cpu },
    { id: 'integracion', label: 'Integraciones', icon: Zap },
    { id: 'seguridad', label: 'Seguridad y RBAC', icon: ShieldCheck },
    { id: 'facturacion', label: 'Suscripción', icon: CreditCard },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Centro de Configuración</h1>
        <p className="text-slate-500 mt-1">Define las reglas de negocio, identidad y automatización de tu empresa.</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar Tabs */}
        <div className="lg:w-72 space-y-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold transition-all ${
                activeTab === tab.id 
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-100' 
                  : 'text-slate-500 hover:bg-white hover:text-slate-900'
              }`}
            >
              <tab.icon className="w-5 h-5" />
              {tab.label}
            </button>
          ))}
          
          <div className="pt-6 mt-6 border-t border-slate-100">
            <div className="px-4 py-3 bg-slate-50 rounded-2xl">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <History className="w-3 h-3" /> Changelog v1.8.0
              </p>
              <p className="text-xs text-slate-600 mt-1">Sistema estable. Módulo de IA actualizado.</p>
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 space-y-6">
          <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
            {activeTab === 'identidad' && (
              <div className="p-8 space-y-8">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                    <Globe className="w-6 h-6 text-blue-600" /> Identidad Corporativa
                  </h3>
                  <span className="text-[10px] font-black bg-blue-50 text-blue-600 px-3 py-1 rounded-full uppercase tracking-tighter">White Label</span>
                </div>
                
                <div className="flex items-center gap-6 p-6 bg-slate-50 rounded-2xl border border-slate-100">
                  <div className="w-20 h-20 bg-white rounded-2xl border border-slate-200 flex items-center justify-center shadow-sm">
                    {company?.logo_url ? <img src={company.logo_url} alt="Logo" className="w-full h-full object-contain" /> : <Building2 className="w-8 h-8 text-slate-300" />}
                  </div>
                  <div>
                    <button className="bg-white text-slate-900 border border-slate-200 px-4 py-2 rounded-xl text-xs font-bold hover:bg-slate-50 transition-all shadow-sm">
                      Subir Nuevo Logo
                    </button>
                    <p className="text-[10px] text-slate-400 mt-2">Formatos: PNG, JPG, SVG (Max 2MB). Recomendado fondo transparente.</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Nombre Comercial</label>
                    <input defaultValue={company?.name} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none font-medium" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">RNC / Identificación</label>
                    <input defaultValue={company?.rnc} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none font-medium" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Teléfono</label>
                    <input defaultValue={company?.phone} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none font-medium" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Dirección</label>
                    <input defaultValue={company?.address} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none font-medium" />
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'estructura' && (
              <div className="p-8 space-y-8">
                <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                  <Workflow className="w-6 h-6 text-amber-600" /> Estructura Organizacional
                </h3>
                
                <div className="space-y-6">
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <p className="text-sm font-bold text-slate-900">Departamentos y Categorías</p>
                      <button className="text-xs font-bold text-blue-600 hover:underline">+ Añadir Departamento</button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {departments?.map((dept: any) => (
                        <div key={dept.id} className="p-4 border border-slate-100 bg-slate-50 rounded-2xl">
                          <p className="text-sm font-bold text-slate-900">{dept.name}</p>
                          <p className="text-[10px] text-slate-400 font-bold uppercase mt-1">3 Categorías vinculadas</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'automatizacion' && (
              <div className="p-8 space-y-8">
                <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                  <Zap className="w-6 h-6 text-emerald-600" /> IA y Automatización (Cron)
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    { label: 'Auto-Cierre de Tickets', desc: 'Resueltos sin actividad por 5 días', active: true },
                    { label: 'Analista de Mantenimiento', desc: 'Predice fallas vía IA Gemini', active: true },
                    { label: 'Check de Stock Mínimo', desc: 'Alerta automática de compras', active: false },
                  ].map((job, i) => (
                    <div key={i} className="flex items-center justify-between p-5 bg-slate-50 rounded-3xl border border-slate-100">
                      <div>
                        <p className="text-sm font-bold text-slate-900">{job.label}</p>
                        <p className="text-[10px] text-slate-400 font-medium">{job.desc}</p>
                      </div>
                      <div className={`w-10 h-6 rounded-full p-1 transition-colors cursor-pointer ${job.active ? 'bg-blue-600' : 'bg-slate-300'}`}>
                        <div className={`w-4 h-4 bg-white rounded-full transition-transform ${job.active ? 'translate-x-4' : ''}`} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'integracion' && (
              <div className="p-8 space-y-8">
                <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                  <Key className="w-6 h-6 text-indigo-600" /> API y Conectividad Externa
                </h3>
                
                {createdApp && (
                  <div className="p-6 bg-emerald-50 rounded-3xl border border-emerald-100 animate-in zoom-in duration-300">
                    <p className="text-xs font-black text-emerald-600 uppercase tracking-widest mb-2">¡Nueva Credencial Generada!</p>
                    <p className="text-[10px] text-emerald-500 mb-4 font-medium">Copia esta clave ahora, no se volverá a mostrar por seguridad.</p>
                    <div className="flex items-center gap-2">
                      <code className="flex-1 bg-white p-3 rounded-xl text-xs font-mono border border-emerald-200">
                        {createdApp.api_key}
                      </code>
                      <button 
                        onClick={() => { navigator.clipboard.writeText(createdApp.api_key); showNotification('Copiado', 'success'); }}
                        className="px-4 py-2 bg-emerald-600 text-white rounded-xl font-bold text-xs"
                      >
                        Copiar
                      </button>
                    </div>
                    <button onClick={() => setCreatedApp(null)} className="mt-4 text-[10px] font-bold text-emerald-600 underline">Cerrar aviso</button>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100 space-y-4">
                    <p className="text-sm font-bold text-slate-900">Registrar Nueva Aplicación</p>
                    <div className="space-y-3">
                      <input 
                        placeholder="Nombre (ej: VentaSmart POS)" 
                        value={newApp.name}
                        onChange={(e) => setNewApp({...newApp, name: e.target.value})}
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:ring-2 focus:ring-blue-500" 
                      />
                      <input 
                        placeholder="Prefijo de Tickets (ej: VNT)" 
                        value={newApp.prefix}
                        onChange={(e) => setNewApp({...newApp, prefix: e.target.value})}
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:ring-2 focus:ring-blue-500" 
                      />
                      <button 
                        onClick={handleCreateApp}
                        disabled={!newApp.name || isCreating}
                        className="w-full py-3 bg-indigo-600 text-white rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-indigo-700 disabled:opacity-50"
                      >
                        {isCreating ? 'Generando...' : 'Generar Credenciales'}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <p className="text-sm font-bold text-slate-900">Aplicaciones Conectadas</p>
                    <div className="space-y-3">
                      {externalApps?.map((app: any) => (
                        <div key={app.id} className="p-4 bg-white border border-slate-100 rounded-2xl flex items-center justify-between shadow-sm">
                          <div>
                            <p className="text-sm font-bold text-slate-800">{app.name}</p>
                            <p className="text-[10px] text-slate-400 font-mono">{app.client_id}</p>
                          </div>
                          <span className="px-2 py-1 bg-indigo-50 text-indigo-600 text-[10px] font-bold rounded-lg uppercase">
                            {app.prefix}
                          </span>
                        </div>
                      ))}
                      {(!externalApps || externalApps.length === 0) && (
                        <p className="text-xs text-slate-400 text-center py-4 italic">No hay aplicaciones externas vinculadas.</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'facturacion' && (
              <div className="p-8 space-y-8">
                <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                  <CreditCard className="w-6 h-6 text-slate-900" /> Suscripción y Plan
                </h3>
                <div className="bg-slate-900 text-white p-8 rounded-[40px] relative overflow-hidden">
                  <div className="relative z-10">
                    <p className="text-xs font-black text-blue-400 uppercase tracking-widest mb-2">Plan Actual</p>
                    <p className="text-4xl font-black italic">ENTERPRISE</p>
                    <div className="flex items-center gap-4 mt-8">
                      <button className="bg-white text-slate-900 px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-blue-50 transition-all">
                        Mejorar Plan
                      </button>
                      <button className="text-xs font-bold text-slate-400 hover:text-white transition-all underline">
                        Gestionar con Stripe
                      </button>
                    </div>
                  </div>
                  <Building2 className="absolute -right-10 -bottom-10 w-64 h-64 text-white/5 rotate-12" />
                </div>
              </div>
            )}
          </div>

          <div className="flex justify-end">
            <button className="bg-blue-600 text-white px-10 py-4 rounded-3xl font-black uppercase tracking-widest text-xs hover:bg-blue-700 transition-all shadow-xl shadow-blue-100 flex items-center gap-2">
              <Save className="w-4 h-4" /> Guardar Cambios Globales
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
