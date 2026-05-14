import React, { useState, useEffect } from 'react';
import { X, User as UserIcon, Mail, Lock, Shield, Save, AtSign, CheckCircle, XCircle } from 'lucide-react';

interface Role {
  id: number;
  name: string;
}

interface User {
  id?: number;
  full_name: string;
  email: string;
  username: string;
  password?: string;
  role_id: number;
  is_active: boolean;
}

interface UserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (user: User) => void;
  user?: User | null;
  roles: Role[];
}

export default function UserModal({ isOpen, onClose, onSave, user, roles }: UserModalProps) {
  const [formData, setFormData] = useState<User>({
    full_name: '',
    email: '',
    username: '',
    password: '',
    role_id: roles[0]?.id || 0,
    is_active: true
  });

  useEffect(() => {
    if (user) {
      setFormData({
        ...user,
        password: '' // No cargar el hash de la contraseña
      });
    } else {
      setFormData({
        full_name: '',
        email: '',
        username: '',
        password: '',
        role_id: roles[0]?.id || 0,
        is_active: true
      });
    }
  }, [user, isOpen, roles]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-2xl rounded-[32px] shadow-2xl border border-slate-100 overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-slate-900 p-6 text-white flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-600 rounded-xl">
              <UserIcon className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold">{user ? 'Editar Usuario' : 'Nuevo Usuario'}</h2>
              <p className="text-blue-200 text-xs">{user ? `ID: ${user.id}` : 'Creando nueva identidad'}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-xl transition-all">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-8 space-y-6">
          {/* Fila 1: Nombre y Email */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Nombre Completo</label>
              <div className="relative group">
                <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-blue-600" />
                <input 
                  value={formData.full_name}
                  onChange={(e) => setFormData({...formData, full_name: e.target.value})}
                  className="w-full pl-10 pr-4 py-3 rounded-2xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none font-medium text-slate-700"
                  placeholder="Ej. Juan Pérez"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Correo Electrónico</label>
              <div className="relative group">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-blue-600" />
                <input 
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="w-full pl-10 pr-4 py-3 rounded-2xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none font-medium text-slate-700"
                  placeholder="admin@empresa.com"
                />
              </div>
            </div>
          </div>

          {/* Fila 2: Username y Password */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Nombre de Usuario (Login)</label>
              <div className="relative group">
                <AtSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-blue-600" />
                <input 
                  value={formData.username}
                  onChange={(e) => setFormData({...formData, username: e.target.value})}
                  className="w-full pl-10 pr-4 py-3 rounded-2xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none font-bold text-blue-600"
                  placeholder="ej: jperez"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Contraseña {user && '(Dejar en blanco para no cambiar)'}</label>
              <div className="relative group">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-blue-600" />
                <input 
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                  className="w-full pl-10 pr-4 py-3 rounded-2xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none font-medium text-slate-700"
                  placeholder="••••••••"
                />
              </div>
            </div>
          </div>

          {/* Fila 3: Rol y Estado */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Rol Asignado</label>
              <div className="relative group">
                <Shield className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-blue-600" />
                <select 
                  value={formData.role_id}
                  onChange={(e) => setFormData({...formData, role_id: parseInt(e.target.value)})}
                  className="w-full pl-10 pr-4 py-3 rounded-2xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none font-bold text-slate-700 appearance-none bg-white"
                >
                  {roles.map(role => (
                    <option key={role.id} value={role.id}>{role.name}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Estado de Cuenta</label>
              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => setFormData({...formData, is_active: true})}
                  className={`flex-1 flex items-center justify-center gap-2 p-3 rounded-2xl border transition-all font-bold text-sm ${formData.is_active ? 'bg-emerald-50 border-emerald-500 text-emerald-700 shadow-sm' : 'bg-white border-slate-200 text-slate-400'}`}
                >
                  <CheckCircle className="w-4 h-4" /> Activo
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({...formData, is_active: false})}
                  className={`flex-1 flex items-center justify-center gap-2 p-3 rounded-2xl border transition-all font-bold text-sm ${!formData.is_active ? 'bg-red-50 border-red-500 text-red-700 shadow-sm' : 'bg-white border-slate-200 text-slate-400'}`}
                >
                  <XCircle className="w-4 h-4" /> Inactivo
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 bg-slate-50 border-t border-slate-100 flex justify-end gap-4">
          <button 
            onClick={onClose}
            className="px-6 py-3 rounded-2xl text-xs font-bold text-slate-500 hover:bg-slate-200 transition-all uppercase tracking-widest"
          >
            Cancelar
          </button>
          <button 
            onClick={() => onSave(formData)}
            className="px-10 py-3 bg-blue-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-blue-700 shadow-xl shadow-blue-100 transition-all flex items-center gap-2"
          >
            <Save className="w-4 h-4" /> {user ? 'Actualizar Usuario' : 'Crear Usuario'}
          </button>
        </div>
      </div>
    </div>
  );
}
