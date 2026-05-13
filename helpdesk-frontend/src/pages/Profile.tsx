import React, { useState } from 'react';
import { User, Mail, Shield, PenTool, Upload, Save, Loader2, CheckCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import axios from 'axios';

export default function Profile() {
  const { user, token, updateProfile } = useAuth();
  const { showNotification } = useNotification();
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({
    full_name: user?.full_name || '',
    email: user?.email || '',
  });

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Endpoint imaginario para actualizar perfil básico
      await axios.patch('http://localhost:8001/api/v1/users/me', formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      showNotification('success', 'Perfil Actualizado', 'Tus datos se han guardado correctamente.');
    } catch (error) {
      showNotification('error', 'Error', 'No pudimos actualizar tu perfil.');
    } finally {
      setLoading(false);
    }
  };

  const handleSignatureUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const uploadData = new FormData();
    uploadData.append('file', file);

    try {
      const response = await axios.post('http://localhost:8001/api/v1/profile/process-signature', uploadData, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });
      
      showNotification('success', 'Firma Procesada', 'Tu firma digital ha sido optimizada y guardada.');
      // Simular actualización local del usuario
      if (user) {
        // updateProfile logic here
      }
    } catch (error) {
      showNotification('error', 'Error al procesar', 'La imagen de la firma no pudo ser procesada.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Mi Perfil</h1>
        <p className="text-slate-500 mt-1">Gestiona tu información personal y firma digital para reportes.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Lado Izquierdo: Datos Básicos */}
        <div className="md:col-span-2 space-y-6">
          <form onSubmit={handleUpdateProfile} className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm space-y-6">
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2 mb-4">
              <User className="w-5 h-5 text-blue-600" /> Información Personal
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">Nombre Completo</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    value={formData.full_name}
                    onChange={(e) => setFormData({...formData, full_name: e.target.value})}
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">Correo Electrónico</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="email"
                    disabled
                    value={formData.email}
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-500 outline-none cursor-not-allowed"
                  />
                </div>
              </div>
            </div>

            <div className="pt-4">
              <button
                type="submit"
                disabled={loading}
                className="bg-blue-600 text-white px-8 py-3 rounded-xl font-bold shadow-lg shadow-blue-100 hover:bg-blue-700 transition-all flex items-center gap-2 disabled:opacity-50"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                Guardar Cambios
              </button>
            </div>
          </form>

          {/* Seguridad / Rol */}
          <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2 mb-4">
              <Shield className="w-5 h-5 text-emerald-600" /> Seguridad y Rol
            </h3>
            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl">
              <div>
                <p className="text-sm font-bold text-slate-900 capitalize">{user?.role?.name || user?.role_name}</p>
                <p className="text-xs text-slate-500">Nivel de acceso actual en la plataforma.</p>
              </div>
              <div className="px-3 py-1 bg-emerald-100 text-emerald-700 text-[10px] font-black uppercase rounded-full">
                Activo
              </div>
            </div>
          </div>
        </div>

        {/* Lado Derecho: Firma Digital */}
        <div className="space-y-6">
          <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm text-center">
            <div className="p-4 bg-blue-50 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <PenTool className="w-8 h-8 text-blue-600" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">Firma Digital</h3>
            <p className="text-xs text-slate-500 mt-2">Sube una foto de tu firma en papel blanco para digitalizarla profesionalmente.</p>
            
            <div className="mt-6 aspect-video rounded-2xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center p-4 relative overflow-hidden group">
              {user?.signature_url ? (
                <img src={user.signature_url} alt="Firma Digital" className="max-h-full object-contain" />
              ) : (
                <>
                  <Upload className="w-8 h-8 text-slate-300 group-hover:text-blue-400 transition-colors" />
                  <p className="text-[10px] font-bold text-slate-400 mt-2 uppercase tracking-widest">Subir Imagen</p>
                </>
              )}
              <input
                type="file"
                onChange={handleSignatureUpload}
                accept="image/*"
                className="absolute inset-0 opacity-0 cursor-pointer"
              />
              {uploading && (
                <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center">
                  <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
                </div>
              )}
            </div>

            <p className="text-[10px] text-slate-400 mt-4 leading-tight">
              Nuestro sistema eliminará automáticamente el fondo y optimizará el contraste.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
