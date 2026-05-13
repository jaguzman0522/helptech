import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { 
  Users, 
  ShieldCheck, 
  Plus, 
  Edit, 
  Trash2, 
  CheckCircle, 
  XCircle,
  Search,
  Lock
} from 'lucide-react';

interface Role {
  id: number;
  name: string;
  description: string;
  permissions: Record<string, string[]>;
  is_system: boolean;
}

interface User {
  id: number;
  user_code: string;
  full_name: string;
  email: string;
  role_name: string;
  is_active: boolean;
}

export default function AccessControl() {
  const [activeTab, setActiveTab] = useState<'users' | 'roles'>('users');
  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const { token, hasPermission } = useAuth();

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const endpoint = activeTab === 'users' ? '/users/' : '/roles/';
      const response = await axios.get(`http://localhost:8001/api/v1${endpoint}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (activeTab === 'users') setUsers(response.data);
      else setRoles(response.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 text-premium">Control de Accesos</h1>
          <p className="text-slate-500 text-sm">Gestiona usuarios, roles y la matriz de permisos del sistema.</p>
        </div>
        <button className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-xl font-bold text-sm hover:bg-blue-700 transition-all shadow-lg shadow-blue-100">
          <Plus className="w-4 h-4" /> 
          {activeTab === 'users' ? 'Nuevo Usuario' : 'Nuevo Rol'}
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-slate-100 p-1 rounded-2xl w-fit">
        <button 
          onClick={() => setActiveTab('users')}
          className={`flex items-center gap-2 px-6 py-2 rounded-xl text-sm font-bold transition-all ${activeTab === 'users' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
        >
          <Users className="w-4 h-4" /> Usuarios
        </button>
        <button 
          onClick={() => setActiveTab('roles')}
          className={`flex items-center gap-2 px-6 py-2 rounded-xl text-sm font-bold transition-all ${activeTab === 'roles' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
        >
          <ShieldCheck className="w-4 h-4" /> Roles y Permisos
        </button>
      </div>

      {/* Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input 
            type="text" 
            placeholder={`Buscar ${activeTab === 'users' ? 'usuarios' : 'roles'}...`}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/50 border-b border-slate-100">
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">
                {activeTab === 'users' ? 'Usuario' : 'Rol'}
              </th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">
                {activeTab === 'users' ? 'Rol / Dept' : 'Descripción'}
              </th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Estado</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {loading ? (
              [1, 2, 3].map(i => (
                <tr key={i} className="animate-pulse">
                  <td colSpan={4} className="px-6 py-6"><div className="h-4 bg-slate-100 rounded w-full"></div></td>
                </tr>
              ))
            ) : activeTab === 'users' ? (
              users.map(user => (
                <tr key={user.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 font-bold">
                        {user.full_name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-bold text-slate-900">{user.full_name}</p>
                        <p className="text-xs text-slate-500">{user.user_code} • {user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600">
                    <span className="font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded-md text-[10px] uppercase">{user.role_name}</span>
                  </td>
                  <td className="px-6 py-4">
                    {user.is_active ? (
                      <span className="flex items-center gap-1 text-emerald-600 text-xs font-bold"><CheckCircle className="w-3 h-3" /> Activo</span>
                    ) : (
                      <span className="flex items-center gap-1 text-slate-400 text-xs font-bold"><XCircle className="w-3 h-3" /> Inactivo</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Editar Usuario">
                      <Edit className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              roles.map(role => (
                <tr key={role.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <p className="font-bold text-slate-900">{role.name}</p>
                      {role.is_system && <Lock className="w-3 h-3 text-slate-400" title="Rol de Sistema" />}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-500">{role.description || 'Sin descripción'}</td>
                  <td className="px-6 py-4">
                    <span className="text-xs font-bold text-blue-600">
                      {Object.keys(role.permissions).length} Módulos
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Editar Matriz de Permisos">
                        <Edit className="w-4 h-4" />
                      </button>
                      {!role.is_system && (
                        <button className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Eliminar Rol">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
