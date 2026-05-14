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
  Tag,
  Book,
  Info,
  CheckSquare,
  Code2,
  Plus,
  Trash2,
  X,
  Edit
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
  const [selectedLang, setSelectedLang] = useState('js');

  const codeSnippets: Record<string, string> = {
    js: `async function sendTicket() {
  const response = await fetch('http://localhost:8001/api/v1/external/tickets', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Client-ID': 'CLI-XXXX-XXXX',
      'X-API-Key': 'sk_live_xxxxxx'
    },
    body: JSON.stringify({
      subject: "Fallo en el sistema",
      description: "El cliente reporta error 500",
      priority: "high",
      requester_email: "cliente@app.com"
    })
  });
  const data = await response.json();
  console.log("Ticket ID:", data.ticket_id);
}`,
    python: `import requests

def send_ticket():
    url = "http://localhost:8001/api/v1/external/tickets"
    headers = {
        "Content-Type": "application/json",
        "X-Client-ID": "CLI-XXXX-XXXX",
        "X-API-Key": "sk_live_xxxxxx"
    }
    payload = {
        "subject": "Fallo en el sistema",
        "description": "El cliente reporta error 500",
        "priority": "high",
        "requester_email": "cliente@app.com"
    }
    
    response = requests.post(url, json=payload, headers=headers)
    data = response.json()
    print(f"Ticket ID: {data['ticket_id']}")`,
    php: `<?php
$curl = curl_init();

curl_setopt_array($curl, [
  CURLOPT_URL => "http://localhost:8001/api/v1/external/tickets",
  CURLOPT_RETURNTRANSFER => true,
  CURLOPT_CUSTOMREQUEST => "POST",
  CURLOPT_POSTFIELDS => json_encode([
    "subject" => "Fallo en el sistema",
    "description" => "El cliente reporta error 500",
    "priority" => "high",
    "requester_email" => "cliente@app.com"
  ]),
  CURLOPT_HTTPHEADER => [
    "Content-Type: application/json",
    "X-API-Key: sk_live_xxxxxx",
    "X-Client-ID: CLI-XXXX-XXXX"
  ],
]);

$response = curl_exec($curl);
curl_close($curl);
$data = json_decode($response, true);
echo "Ticket ID: " . $data['ticket_id'];
?>`
  };

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

  const [selectedDept, setSelectedDept] = useState<any>(null);
  const [newDeptName, setNewDeptName] = useState('');
  const [newCatName, setNewCatName] = useState('');

  const { data: activeCategories, refetch: refetchCats } = useQuery({
    queryKey: ['dept-categories', selectedDept?.id],
    queryFn: async () => {
      if (!selectedDept) return [];
      const res = await axios.get(`http://localhost:8001/api/v1/settings/categories/${selectedDept.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return res.data;
    },
    enabled: !!selectedDept
  });

  const createDeptMutation = useMutation({
    mutationFn: async (name: string) => {
      await axios.post('http://localhost:8001/api/v1/settings/departments', { name }, {
        headers: { Authorization: `Bearer ${token}` }
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings-departments'] });
      showNotification('Departamento creado', 'success');
      setNewDeptName('');
    }
  });

  const deleteDeptMutation = useMutation({
    mutationFn: async (id: number) => {
      await axios.delete(`http://localhost:8001/api/v1/settings/departments/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings-departments'] });
      showNotification('Departamento eliminado', 'success');
    }
  });

  const createCatMutation = useMutation({
    mutationFn: async (data: { name: string, department_id: number }) => {
      await axios.post('http://localhost:8001/api/v1/settings/categories', data, {
        headers: { Authorization: `Bearer ${token}` }
      });
    },
    onSuccess: () => {
      refetchCats();
      showNotification('Categoría añadida', 'success');
      setNewCatName('');
    }
  });

  const deleteCatMutation = useMutation({
    mutationFn: async (id: number) => {
      await axios.delete(`http://localhost:8001/api/v1/settings/categories/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
    },
    onSuccess: () => {
      refetchCats();
      showNotification('Categoría eliminada', 'success');
    }
  });

  const updateCompanyMutation = useMutation({
    mutationFn: async (updates: any) => {
      await axios.patch('http://localhost:8001/api/v1/settings/company', updates, {
        headers: { Authorization: `Bearer ${token}` }
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['company-settings'] });
      showNotification('Configuración guardada', 'success');
    }
  });

  const { data: automatedTasks } = useQuery({
    queryKey: ['automated-tasks'],
    queryFn: async () => {
      const res = await axios.get('http://localhost:8001/api/v1/settings/automated-tasks', {
        headers: { Authorization: `Bearer ${token}` }
      });
      return res.data;
    }
  });

  const updateTaskMutation = useMutation({
    mutationFn: async ({ id, ...updates }: any) => {
      await axios.patch(`http://localhost:8001/api/v1/settings/automated-tasks/${id}`, updates, {
        headers: { Authorization: `Bearer ${token}` }
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['automated-tasks'] });
      showNotification('Tarea actualizada', 'success');
    }
  });

  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [newTaskData, setNewTaskData] = useState({
    name: '',
    description: '',
    schedule_type: 'daily',
    day_of_week: 'Monday',
    day_of_month: 1,
    scheduled_time: '09:00'
  });

  const [companyForm, setCompanyForm] = useState({
    name: '',
    tax_id: '',
    phone: '',
    address: ''
  });

  React.useEffect(() => {
    if (company) {
      setCompanyForm({
        name: company.name || '',
        tax_id: company.tax_id || '',
        phone: company.phone || '',
        address: company.address || ''
      });
    }
  }, [company]);

  const createTaskMutation = useMutation({
    mutationFn: async (data: any) => {
      await axios.post('http://localhost:8001/api/v1/settings/automated-tasks', data, {
        headers: { Authorization: `Bearer ${token}` }
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['automated-tasks'] });
      showNotification('Tarea programada con éxito', 'success');
      setIsTaskModalOpen(false);
      setNewTaskData({
        name: '',
        description: '',
        schedule_type: 'daily',
        day_of_week: 'Monday',
        day_of_month: 1,
        scheduled_time: '09:00'
      });
    }
  });

  const deleteTaskMutation = useMutation({
    mutationFn: async (id: number) => {
      await axios.delete(`http://localhost:8001/api/v1/settings/automated-tasks/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['automated-tasks'] });
      showNotification('Tarea eliminada', 'success');
    }
  });

  const { user } = useAuth();
  const isSuperAdmin = user?.role_name?.toLowerCase() === 'superadmin' || user?.role?.name?.toLowerCase() === 'superadmin';

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      {/* Modal de Gestión de Departamento */}
      {selectedDept && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-[32px] w-full max-w-lg shadow-2xl overflow-hidden animate-in zoom-in duration-300">
            <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <div>
                <h2 className="text-xl font-black text-slate-900">{selectedDept.name}</h2>
                <p className="text-xs text-slate-500 font-medium">Gestión de categorías de servicio</p>
              </div>
              <button onClick={() => setSelectedDept(null)} className="p-2 hover:bg-white rounded-xl transition-colors">
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>
            
            <div className="p-8 space-y-6">
              <div className="space-y-4">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Nueva Categoría</p>
                <div className="flex gap-2">
                  <input 
                    placeholder="Ej: Falla de Software" 
                    value={newCatName}
                    onChange={(e) => setNewCatName(e.target.value)}
                    className="flex-1 px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button 
                    onClick={() => createCatMutation.mutate({ name: newCatName, department_id: selectedDept.id })}
                    disabled={!newCatName}
                    className="p-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 transition-all"
                  >
                    <Plus className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div className="space-y-3">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Categorías Activas</p>
                <div className="max-h-60 overflow-y-auto space-y-2 pr-2">
                  {activeCategories?.map((cat: any) => (
                    <div key={cat.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl group">
                      <span className="text-sm font-bold text-slate-700">{cat.name}</span>
                      <button 
                        onClick={() => deleteCatMutation.mutate(cat.id)}
                        className="p-2 text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                  {activeCategories?.length === 0 && (
                    <p className="text-xs text-slate-400 italic text-center py-4">No hay categorías configuradas.</p>
                  )}
                </div>
              </div>
            </div>
            
            <div className="p-6 bg-slate-50 border-t border-slate-100 flex justify-between">
              <button 
                onClick={() => { if(confirm('¿Borrar departamento?')) { deleteDeptMutation.mutate(selectedDept.id); setSelectedDept(null); } }}
                className="text-xs font-bold text-red-500 hover:underline"
              >
                Eliminar Departamento
              </button>
              <button 
                onClick={() => setSelectedDept(null)}
                className="px-6 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

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
                  <div className="w-20 h-20 bg-white rounded-2xl border border-slate-200 flex items-center justify-center shadow-inner overflow-hidden">
                    {company?.logo_url ? <img src={company.logo_url} alt="Logo" className="w-full h-full object-contain p-2" /> : <Building2 className="w-8 h-8 text-slate-300" />}
                  </div>
                  <div>
                    <label className="cursor-pointer bg-white text-slate-900 border border-slate-200 px-4 py-2 rounded-xl text-xs font-bold hover:bg-slate-50 transition-all shadow-sm inline-block">
                      Subir Nuevo Logo
                      <input 
                        type="file" 
                        className="hidden" 
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onloadend = () => {
                              updateCompanyMutation.mutate({ logo_url: reader.result });
                            };
                            reader.readAsDataURL(file);
                          }
                        }}
                      />
                    </label>
                    <p className="text-[10px] text-slate-400 mt-2">Formatos: PNG, JPG, SVG (Max 2MB). Recomendado fondo transparente.</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Nombre Comercial</label>
                    <input 
                      value={companyForm.name}
                      onChange={(e) => setCompanyForm({...companyForm, name: e.target.value})}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none font-medium" 
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">RNC / Identificación</label>
                    <input 
                      value={companyForm.tax_id}
                      onChange={(e) => setCompanyForm({...companyForm, tax_id: e.target.value})}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none font-medium" 
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Teléfono</label>
                    <input 
                      value={companyForm.phone}
                      onChange={(e) => setCompanyForm({...companyForm, phone: e.target.value})}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none font-medium" 
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Dirección</label>
                    <input 
                      value={companyForm.address}
                      onChange={(e) => setCompanyForm({...companyForm, address: e.target.value})}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none font-medium" 
                    />
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'estructura' && (
              <div className="p-8 space-y-8 animate-in slide-in-from-bottom-4 duration-500">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                    <Workflow className="w-6 h-6 text-amber-600" /> Estructura Organizacional
                  </h3>
                </div>
                
                <div className="space-y-6">
                  <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100">
                    <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Añadir Nuevo Departamento</p>
                    <div className="flex gap-2">
                      <input 
                        placeholder="Nombre del departamento..." 
                        value={newDeptName}
                        onChange={(e) => setNewDeptName(e.target.value)}
                        className="flex-1 px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <button 
                        onClick={() => createDeptMutation.mutate(newDeptName)}
                        disabled={!newDeptName}
                        className="px-6 py-3 bg-slate-900 text-white rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-slate-800 disabled:opacity-50"
                      >
                        Crear
                      </button>
                    </div>
                  </div>

                  <div>
                    <p className="text-sm font-bold text-slate-900 mb-4">Departamentos Configurados</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {departments?.map((dept: any) => (
                        <button 
                          key={dept.id} 
                          onClick={() => setSelectedDept(dept)}
                          className="flex items-center justify-between p-6 border border-slate-100 bg-white rounded-[24px] hover:shadow-xl hover:shadow-slate-100 transition-all text-left group"
                        >
                          <div>
                            <p className="text-base font-bold text-slate-900 group-hover:text-blue-600 transition-colors">{dept.name}</p>
                            <p className="text-[10px] text-slate-400 font-bold uppercase mt-1 flex items-center gap-1">
                              <Tag className="w-3 h-3" /> Ver Categorías
                            </p>
                          </div>
                          <div className="p-2 bg-slate-50 rounded-xl text-slate-400 group-hover:bg-blue-50 group-hover:text-blue-600 transition-all">
                            <Plus className="w-5 h-5" />
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'automatizacion' && (
              <div className="p-8 space-y-8 animate-in fade-in duration-500">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                    <Zap className="w-6 h-6 text-emerald-600" /> IA y Automatización (Cron)
                  </h3>
                  <button 
                    onClick={() => setIsTaskModalOpen(true)}
                    className="text-xs font-bold text-blue-600 hover:underline"
                  >
                    + Nueva Tarea Personalizada
                  </button>
                </div>

                {/* Modal de Nueva Tarea */}
                {isTaskModalOpen && (
                  <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
                    <div className="bg-white rounded-[32px] w-full max-w-xl shadow-2xl overflow-hidden animate-in zoom-in duration-300">
                      <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                        <div>
                          <h2 className="text-xl font-black text-slate-900">Nueva Tarea Automática</h2>
                          <p className="text-xs text-slate-500 font-medium">Configura una regla de ejecución automática</p>
                        </div>
                        <button onClick={() => setIsTaskModalOpen(false)} className="p-2 hover:bg-white rounded-xl transition-colors">
                          <X className="w-5 h-5 text-slate-400" />
                        </button>
                      </div>

                      <div className="p-8 space-y-6 max-h-[70vh] overflow-y-auto">
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Nombre de la Tarea</label>
                            <input 
                              placeholder="Ej: Reporte de Ventas" 
                              value={newTaskData.name}
                              onChange={(e) => setNewTaskData({...newTaskData, name: e.target.value})}
                              className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          </div>

                          <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Frecuencia</label>
                            <select 
                              value={newTaskData.schedule_type}
                              onChange={(e) => setNewTaskData({...newTaskData, schedule_type: e.target.value})}
                              className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500 font-bold"
                            >
                              <option value="daily">Diaria</option>
                              <option value="weekly">Semanal</option>
                              <option value="monthly">Mensual</option>
                            </select>
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            {newTaskData.schedule_type === 'weekly' && (
                              <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Día de la Semana</label>
                                <select 
                                  value={newTaskData.day_of_week || 'Monday'}
                                  onChange={(e) => setNewTaskData({...newTaskData, day_of_week: e.target.value})}
                                  className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                  {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(d => (
                                    <option key={d} value={d}>{d}</option>
                                  ))}
                                </select>
                              </div>
                            )}

                            {newTaskData.schedule_type === 'monthly' && (
                              <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Día del Mes</label>
                                <input 
                                  type="number"
                                  min="1" max="31"
                                  value={newTaskData.day_of_month}
                                  onChange={(e) => setNewTaskData({...newTaskData, day_of_month: parseInt(e.target.value)})}
                                  className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500"
                                />
                              </div>
                            )}

                            <div className="space-y-2">
                              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Hora de Ejecución</label>
                              <input 
                                type="time"
                                value={newTaskData.scheduled_time}
                                onChange={(e) => setNewTaskData({...newTaskData, scheduled_time: e.target.value})}
                                className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500 font-bold"
                              />
                            </div>
                          </div>

                          <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Descripción / Objetivo</label>
                            <textarea 
                              placeholder="Describe qué debe hacer el sistema..."
                              value={newTaskData.description}
                              onChange={(e) => setNewTaskData({...newTaskData, description: e.target.value})}
                              className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500 min-h-[80px]"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="p-6 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
                        <button 
                          onClick={() => setIsTaskModalOpen(false)}
                          className="px-6 py-3 text-slate-500 font-bold text-sm"
                        >
                          Cancelar
                        </button>
                        <button 
                          onClick={() => createTaskMutation.mutate(newTaskData)}
                          disabled={!newTaskData.name || createTaskMutation.isPending}
                          className="px-8 py-3 bg-blue-600 text-white rounded-2xl text-sm font-bold shadow-lg shadow-blue-100 hover:bg-blue-700 disabled:opacity-50"
                        >
                          {createTaskMutation.isPending ? 'Guardando...' : 'Crear Tarea'}
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {automatedTasks?.map((task: any) => {
                    const canEdit = !task.is_system || isSuperAdmin;
                    
                    return (
                      <div key={task.id} className="flex items-center justify-between p-5 bg-slate-50 rounded-3xl border border-slate-100 relative group">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-bold text-slate-900">{task.name}</p>
                            {task.is_system && <Lock className="w-3 h-3 text-amber-500" title="Tarea de Sistema Protegida" />}
                          </div>
                          <p className="text-[10px] text-slate-400 font-medium">{task.description}</p>
                        </div>
                        
                        <div className="flex items-center gap-3">
                          {!task.is_system && (
                            <button 
                              onClick={() => { if(confirm('¿Eliminar tarea?')) deleteTaskMutation.mutate(task.id); }}
                              className="p-2 text-slate-300 hover:text-red-500 transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                          <button 
                            disabled={!canEdit}
                            onClick={() => updateTaskMutation.mutate({ id: task.id, is_active: !task.is_active })}
                            className={`w-10 h-6 rounded-full p-1 transition-colors relative ${!canEdit ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'} ${task.is_active ? 'bg-blue-600' : 'bg-slate-300'}`}
                          >
                            <div className={`w-4 h-4 bg-white rounded-full transition-transform ${task.is_active ? 'translate-x-4' : ''}`} />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
                
                {!isSuperAdmin && (
                  <div className="p-4 bg-amber-50 rounded-2xl border border-amber-100 flex items-center gap-3">
                    <Info className="w-5 h-5 text-amber-500" />
                    <p className="text-xs text-amber-700 font-medium">Las tareas marcadas con <Lock className="w-3 h-3 inline text-amber-500" /> solo pueden ser gestionadas por el SuperAdmin del sistema.</p>
                  </div>
                )}
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

            {activeTab === 'seguridad' && (
              <div className="p-8 space-y-8 animate-in slide-in-from-right-4 duration-300">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                    <ShieldCheck className="w-6 h-6 text-blue-600" /> Seguridad y Control de Accesos
                  </h3>
                </div>

                <div className="p-8 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-[32px] text-white shadow-xl shadow-blue-100 flex flex-col md:flex-row items-center gap-8 group">
                  <div className="flex-1 space-y-4">
                    <h4 className="text-2xl font-bold">Gestión de Identidades (RBAC)</h4>
                    <p className="text-blue-100 text-sm leading-relaxed">
                      Administra quién tiene acceso al sistema, crea nuevos técnicos y define roles personalizados.
                    </p>
                    <button 
                      onClick={() => window.location.href = '/dashboard/access'}
                      className="bg-white text-blue-600 px-8 py-3 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-blue-50 transition-all flex items-center gap-2"
                    >
                      <Users className="w-4 h-4" /> Gestionar Usuarios y Roles
                    </button>
                  </div>
                  <div className="w-32 h-32 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center border border-white/20">
                    <ShieldCheck className="w-16 h-16 text-white" />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="p-6 bg-white border border-slate-100 rounded-3xl shadow-sm space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-amber-50 rounded-xl text-amber-600"><Lock className="w-5 h-5" /></div>
                      <p className="font-bold text-slate-900">Políticas de Acceso</p>
                    </div>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-3 bg-slate-50 rounded-2xl">
                        <span className="text-xs font-semibold text-slate-600">Doble Factor (2FA)</span>
                        <div className="w-8 h-4 bg-slate-200 rounded-full"></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'apis' && (
              <div className="p-8 space-y-10 animate-in fade-in duration-500">
                {/* Requisitos antes de generar */}
                <div className="p-8 bg-blue-50/50 rounded-[40px] border border-blue-100 relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-8 opacity-10">
                    <Info className="w-32 h-32 text-blue-600" />
                  </div>
                  <h3 className="text-xl font-black text-slate-900 mb-6 flex items-center gap-2">
                    <CheckSquare className="w-6 h-6 text-blue-600" /> Requisitos de Integración
                  </h3>
                  <p className="text-sm text-slate-500 mb-6 max-w-xl font-medium">
                    Antes de generar una API Key, asegúrese de que su aplicación de terceros cumpla con los siguientes estándares de seguridad y rendimiento:
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[
                      "Certificado SSL/TLS 1.2 o superior obligatorio.",
                      "Almacenamiento seguro de secretos (Variables de Entorno).",
                      "Endpoint de Webhook validado (si aplica).",
                      "Manejo de Reintentos con Backoff Exponencial.",
                      "Cumplimiento con el límite de 100 req/min por Client ID.",
                      "User-Agent descriptivo en cada petición."
                    ].map((req, i) => (
                      <div key={i} className="flex items-center gap-3 bg-white p-4 rounded-2xl shadow-sm border border-blue-100/30">
                        <div className="w-5 h-5 rounded-full bg-blue-600 flex items-center justify-center text-[10px] text-white font-bold">{i+1}</div>
                        <span className="text-xs font-bold text-slate-700">{req}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Documentación Técnica Avanzada */}
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl font-black text-slate-900 flex items-center gap-2">
                      <Code2 className="w-6 h-6 text-indigo-600" /> Consola de Integración
                    </h3>
                    <div className="flex gap-2 bg-slate-100 p-1 rounded-xl">
                      <button 
                        onClick={() => setSelectedLang('js')}
                        className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase transition-all ${selectedLang === 'js' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-400'}`}
                      >
                        JavaScript
                      </button>
                      <button 
                        onClick={() => setSelectedLang('python')}
                        className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase transition-all ${selectedLang === 'python' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-400'}`}
                      >
                        Python
                      </button>
                      <button 
                        onClick={() => setSelectedLang('php')}
                        className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase transition-all ${selectedLang === 'php' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-400'}`}
                      >
                        PHP
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                    {/* Ejemplo Dinámico */}
                    <div className="space-y-3">
                      <p className="text-xs font-bold text-slate-500 ml-1 italic">// Integración Nativa ({selectedLang.toUpperCase()})</p>
                      <div className="p-6 bg-slate-900 rounded-[32px] text-slate-300 font-mono text-[11px] shadow-2xl relative group/code">
                        <pre className="overflow-x-auto">
                          {codeSnippets[selectedLang]}
                        </pre>
                        <button 
                          onClick={() => { navigator.clipboard.writeText(codeSnippets[selectedLang]); showNotification('Código copiado', 'success'); }}
                          className="absolute top-4 right-4 p-2 bg-white/10 rounded-lg hover:bg-white/20 opacity-0 group-hover/code:opacity-100 transition-all"
                        >
                          <Save className="w-4 h-4 text-white" />
                        </button>
                      </div>
                    </div>

                    {/* Estructura JSON Comentada */}
                    <div className="space-y-3">
                      <p className="text-xs font-bold text-slate-500 ml-1 italic">// Estructura del Payload (Body)</p>
                      <div className="p-6 bg-slate-800 rounded-[32px] text-emerald-400 font-mono text-[11px] shadow-2xl relative group/code">
                        <pre className="overflow-x-auto">
{`{
  "subject": "Título del ticket",         // Requerido (String)
  "description": "Detalle técnico",     // Requerido (String)
  "priority": "high",                    // low, normal, high
  "requester_email": "user@app.com",     // Email del cliente final
  "metadata": {                          // Opcional (JSON Object)
    "source": "App Móvil",
    "version": "1.0.2"
  }
}`}
                        </pre>
                        <button className="absolute top-4 right-4 p-2 bg-white/10 rounded-lg hover:bg-white/20 opacity-0 group-hover/code:opacity-100 transition-all">
                          <Save className="w-4 h-4 text-white" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Sección de Mensajería y Seguimiento */}
                <div className="p-8 bg-indigo-900 rounded-[40px] text-white relative overflow-hidden">
                  <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                    <div className="space-y-6">
                      <div className="p-3 bg-indigo-500/30 rounded-2xl w-fit">
                        <Zap className="w-8 h-8 text-indigo-300" />
                      </div>
                      <h3 className="text-3xl font-black leading-tight">Canal de Seguimiento <br/> y Mensajería</h3>
                      <p className="text-indigo-200 text-sm font-medium leading-relaxed">
                        Para establecer un canal de comunicación bidireccional, su sistema debe consultar el estado del ticket o suscribirse a actualizaciones mediante nuestro sistema de Polling o Webhooks.
                      </p>
                      <div className="space-y-4">
                        <div className="flex gap-4">
                          <div className="w-1 bg-indigo-400 rounded-full"></div>
                          <div>
                            <p className="font-bold text-sm">Consultar Mensajes</p>
                            <p className="text-xs text-indigo-300">GET /api/v1/external/tickets/{'{ticket_id}'}/messages</p>
                          </div>
                        </div>
                        <div className="flex gap-4">
                          <div className="w-1 bg-emerald-400 rounded-full"></div>
                          <div>
                            <p className="font-bold text-sm">Enviar Respuesta del Cliente</p>
                            <p className="text-xs text-indigo-300">POST /api/v1/external/tickets/{'{ticket_id}'}/reply</p>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-[32px] p-6 space-y-4 shadow-2xl">
                       <h4 className="text-xs font-black text-indigo-300 uppercase tracking-widest">Vista Previa de Respuesta</h4>
                       <div className="space-y-3">
                         <div className="bg-white/10 p-3 rounded-2xl rounded-tl-none mr-8">
                           <p className="text-[11px] text-indigo-100">Hola, ¿en qué podemos ayudarte con el error 500?</p>
                           <span className="text-[9px] text-indigo-400 mt-1 block">Técnico HelpDesk • 10:45 AM</span>
                         </div>
                         <div className="bg-indigo-600 p-3 rounded-2xl rounded-tr-none ml-8">
                           <p className="text-[11px] text-white">Sigue persistiendo al intentar guardar la venta.</p>
                           <span className="text-[9px] text-indigo-300 mt-1 block">Tú (Cliente) • 10:46 AM</span>
                         </div>
                       </div>
                       <div className="pt-4 border-t border-white/10 flex gap-2">
                         <div className="flex-1 h-8 bg-white/5 rounded-lg"></div>
                         <div className="w-8 h-8 bg-indigo-500 rounded-lg"></div>
                       </div>
                    </div>
                  </div>
                </div>

                {/* Constructor de JSON (Para clientes sin soporte técnico) */}
                <div className="p-8 bg-slate-900 rounded-[40px] shadow-2xl relative overflow-hidden group">
                  <div className="relative z-10 flex flex-col lg:flex-row gap-8">
                    <div className="flex-1 space-y-6">
                      <h3 className="text-xl font-black text-white flex items-center gap-2">
                        <Zap className="w-6 h-6 text-yellow-400" /> Constructor de Payload JSON
                      </h3>
                      <p className="text-slate-400 text-xs font-medium">
                        Use esta herramienta si su sistema no puede generar el JSON automáticamente. Llene los campos y copie el resultado.
                      </p>
                      
                      <div className="space-y-4">
                        <input type="text" placeholder="Asunto del Ticket" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:border-blue-500 outline-none transition-all" />
                        <textarea placeholder="Descripción del problema..." className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:border-blue-500 outline-none transition-all h-24" />
                        <div className="grid grid-cols-2 gap-4">
                          <select className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white outline-none">
                            <option value="low">Prioridad Baja</option>
                            <option value="normal">Prioridad Normal</option>
                            <option value="high">Prioridad Alta</option>
                          </select>
                          <input type="email" placeholder="Email del Solicitante" className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white outline-none" />
                        </div>
                      </div>
                    </div>

                    <div className="w-full lg:w-80 flex flex-col">
                      <div className="bg-black/40 rounded-2xl p-6 font-mono text-[10px] text-emerald-400 border border-white/5 h-full relative group/code">
                        <p className="mb-2 text-slate-500">// Resultado JSON</p>
                        {"{"}<br/>
                        &nbsp;&nbsp;"subject": "...",<br/>
                        &nbsp;&nbsp;"description": "...",<br/>
                        &nbsp;&nbsp;"priority": "normal",<br/>
                        &nbsp;&nbsp;"requester_email": "..."<br/>
                        {"}"}
                        <button className="absolute top-4 right-4 bg-white/10 p-2 rounded-lg hover:bg-white/20 text-white transition-all opacity-0 group-hover/code:opacity-100">
                          <Save className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                  <div className="absolute -right-20 -bottom-20 w-64 h-64 bg-blue-600/10 rounded-full blur-3xl group-hover:bg-blue-600/20 transition-all duration-700"></div>
                </div>

                {/* Gestión de Llaves */}
                <div className="space-y-4 pt-6 border-t border-slate-100">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-xl font-black text-slate-900">Mis Credenciales API</h3>
                      <p className="text-xs text-slate-400 font-medium">Gestiona los accesos de tus aplicaciones externas.</p>
                    </div>
                    <button className="bg-slate-900 text-white px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-800 transition-all flex items-center gap-2">
                      <Plus className="w-4 h-4" /> Generar Nueva Credencial
                    </button>
                  </div>
                  
                  <div className="bg-white rounded-[32px] border border-slate-100 overflow-hidden shadow-sm">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-slate-50/50 border-b border-slate-100">
                          <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">App / Integración</th>
                          <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Client ID</th>
                          <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Estado</th>
                          <th className="px-6 py-4"></th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-50">
                        <tr className="hover:bg-slate-50/50 transition-colors">
                          <td className="px-6 py-4">
                            <p className="text-sm font-bold text-slate-900">VentaSmart POS</p>
                            <p className="text-[10px] text-slate-400">Creada el 12 May 2026</p>
                          </td>
                          <td className="px-6 py-4 font-mono text-xs text-blue-600 font-bold">CLI-VNT-9821</td>
                          <td className="px-6 py-4">
                            <span className="px-2 py-1 bg-emerald-50 text-emerald-600 text-[10px] font-bold rounded-lg uppercase tracking-tight">Activa</span>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <button className="p-2 text-slate-300 hover:text-red-500 transition-all">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="flex justify-end">
            <button 
              onClick={() => updateCompanyMutation.mutate(companyForm)}
              disabled={updateCompanyMutation.isPending}
              className="bg-blue-600 text-white px-10 py-4 rounded-3xl font-black uppercase tracking-widest text-xs hover:bg-blue-700 transition-all shadow-xl shadow-blue-100 flex items-center gap-2 disabled:opacity-50"
            >
              {updateCompanyMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} 
              Guardar Cambios Globales
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
