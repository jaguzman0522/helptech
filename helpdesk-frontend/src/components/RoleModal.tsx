import React, { useState, useEffect } from 'react';
import { X, Shield, Save, CheckSquare, Square, Info, Lock } from 'lucide-react';

interface Role {
  id?: number;
  name: string;
  description: string;
  permissions: Record<string, string[]>;
  is_system?: boolean;
}

interface RoleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (role: Role) => void;
  role?: Role | null;
  currentUserEmail?: string;
}

const MODULOS = [
  { id: 'dashboard', label: 'Dashboard', actions: ['ver', 'metricas_globales'] },
  { id: 'tickets', label: 'Tickets', actions: ['ver', 'crear', 'editar', 'eliminar', 'asignar', 'comentar'] },
  { id: 'inventario', label: 'Inventario', actions: ['ver', 'crear', 'editar', 'eliminar', 'ajustar_stock'] },
  { id: 'reportes', label: 'Reportes', actions: ['ver', 'exportar_pdf', 'exportar_excel'] },
  { id: 'usuarios', label: 'Gestión de Usuarios', actions: ['ver', 'crear', 'editar', 'eliminar'] },
  { id: 'configuracion', label: 'Configuración', actions: ['ver', 'editar_empresa', 'api_keys'] },
];

export default function RoleModal({ isOpen, onClose, onSave, role, currentUserEmail }: RoleModalProps) {
  const isSuperAdmin = currentUserEmail === "aguzman0522@gmail.com";
  
  const [formData, setFormData] = useState<Role>({
    name: '',
    description: '',
    permissions: {}
  });

  useEffect(() => {
    if (role) {
      setFormData({
        ...role,
        permissions: role.permissions || {}
      });
    } else {
      setFormData({
        name: '',
        description: '',
        permissions: {}
      });
    }
  }, [role, isOpen]);

  const togglePermission = (modulo: string, accion: string) => {
    const currentPerms = { ...formData.permissions };
    const moduloPerms = currentPerms[modulo] || [];

    if (moduloPerms.includes(accion)) {
      currentPerms[modulo] = moduloPerms.filter(a => a !== accion);
      if (currentPerms[modulo].length === 0) delete currentPerms[modulo];
    } else {
      currentPerms[modulo] = [...moduloPerms, accion];
    }

    setFormData({ ...formData, permissions: currentPerms });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-4xl rounded-[32px] shadow-2xl border border-slate-100 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-slate-900 p-6 text-white flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-600 rounded-xl">
              <Shield className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold">{role ? 'Editar Rol' : 'Nuevo Rol'}</h2>
              <p className="text-blue-200 text-xs">{formData.name || 'Definiendo permisos...'}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-xl transition-all">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-8 space-y-8">
          {/* Info Básica */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Nombre del Rol</label>
              <input 
                value={formData.name || ''}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                disabled={formData.is_system}
                className="w-full px-4 py-3 rounded-2xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none font-bold text-slate-800 disabled:bg-slate-50"
                placeholder="Ej. Técnico de Campo"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Descripción</label>
              <input 
                value={formData.description || ''}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                disabled={formData.is_system}
                className="w-full px-4 py-3 rounded-2xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none font-medium text-slate-600 disabled:bg-slate-50"
                placeholder="Breve explicación de las responsabilidades"
              />
            </div>
          </div>

          {/* Matriz de Permisos */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-900">Matriz de Permisos</h3>
              <div className="flex items-center gap-2 text-[10px] font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-full uppercase">
                <Info className="w-3 h-3" /> Cambios se aplican al instante tras guardar
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4">
              {MODULOS.map((mod) => (
                <div key={mod.id} className="p-6 bg-slate-50 rounded-[24px] border border-slate-100">
                  <div className="flex items-center justify-between mb-4">
                    <p className="font-black text-slate-900 text-sm uppercase tracking-tighter">{mod.label}</p>
                    <span className="text-[10px] font-bold text-slate-400 italic">{mod.id}</span>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    {mod.actions.map((action) => {
                      const isSelected = formData.permissions[mod.id]?.includes(action);
                      const isSystemReadOnly = formData.is_system && !isSuperAdmin;
                      return (
                        <button
                          key={action}
                          disabled={isSystemReadOnly}
                          onClick={() => togglePermission(mod.id, action)}
                          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                            isSelected 
                              ? 'bg-blue-600 text-white shadow-md shadow-blue-100' 
                              : 'bg-white text-slate-400 border border-slate-200 hover:border-blue-400 hover:text-blue-600'
                          } ${isSystemReadOnly ? 'opacity-70 cursor-not-allowed' : ''}`}
                        >
                          {isSelected ? <CheckSquare className="w-4 h-4" /> : <Square className="w-4 h-4" />}
                          {action.replace('_', ' ').toUpperCase()}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 bg-slate-50 border-t border-slate-100 flex justify-end gap-4">
          <button 
            onClick={onClose}
            className="px-6 py-3 rounded-2xl text-xs font-bold text-slate-500 hover:bg-slate-200 transition-all uppercase tracking-widest"
          >
            {formData.is_system && !isSuperAdmin ? 'Cerrar' : 'Cancelar'}
          </button>
          {(!formData.is_system || isSuperAdmin) && (
            <button 
              onClick={() => onSave(formData)}
              className="px-10 py-3 bg-blue-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-blue-700 shadow-xl shadow-blue-100 transition-all flex items-center gap-2"
            >
              <Save className="w-4 h-4" /> Guardar Cambios
            </button>
          )}
          {formData.is_system && !isSuperAdmin && (
            <div className="px-6 py-3 bg-slate-200 text-slate-500 rounded-2xl font-bold text-xs uppercase tracking-widest flex items-center gap-2">
              <Lock className="w-4 h-4" /> Rol de Sistema (Solo Lectura)
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
