import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { API_URL } from '../api/config';
import { 
  Send, 
  Brain, 
  Camera, 
  User, 
  Building2, 
  AlertTriangle,
  Loader2,
  ChevronLeft,
  Briefcase
} from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { useNotification } from '../context/NotificationContext';

interface Department {
  id: number;
  name: string;
}

interface Category {
  id: number;
  name: string;
}

export default function NewTicketPage() {
  const { user, token } = useAuth();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(false);
  const [classifying, setClassifying] = useState(false);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    department_id: '',
    category_id: '',
    priority: 'MEDIUM',
    photo_before: ''
  });

  useEffect(() => {
    fetchMetadata();
  }, []);

  const fetchMetadata = async () => {
    try {
      const res = await axios.get(`${API_URL}/settings/departments`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setDepartments(res.data);
    } catch (error) {
      console.error("Error fetching departments:", error);
    }
  };

  const fetchCategories = async (deptId: string) => {
    if (!deptId) {
      setCategories([]);
      return;
    }
    try {
      const res = await axios.get(`${API_URL}/settings/categories/${deptId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCategories(res.data);
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  const handleAutoClassify = async () => {
    if (!formData.description) return;
    setClassifying(true);
    try {
      // This would call an endpoint that returns suggested dept/cat/priority
      // Simulate delay
      await new Promise(r => setTimeout(r, 1500));
      setFormData(prev => ({
        ...prev,
        priority: 'HIGH' // Mocked AI suggestion
      }));
    } finally {
      setClassifying(false);
    }
  };

  const { showNotification } = useNotification();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.post(`${API_URL}/tickets/`, {
        ...formData,
        department_id: formData.department_id ? parseInt(formData.department_id) : null,
        category_id: formData.category_id ? parseInt(formData.category_id) : null,
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      showNotification('success', '¡Ticket Creado!', 'Tu requerimiento ha sido registrado y el equipo técnico ya está al tanto.');
      navigate('/dashboard/tickets');
    } catch (error: any) {
      const detail = error.response?.data?.detail;
      if (detail && detail.includes('department_id')) {
        showNotification('error', 'Departamento no encontrado', 'Parece que el departamento seleccionado aún no está configurado en el sistema.');
      } else {
        showNotification('error', '¡Ups! Algo salió mal', 'No pudimos procesar tu ticket. Por favor, verifica que todos los campos estén correctos.');
      }
      console.error("Error creating ticket:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link to="/dashboard/tickets" className="p-2 hover:bg-slate-100 rounded-full transition-colors">
          <ChevronLeft className="w-6 h-6 text-slate-600" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Crear Nuevo Ticket</h1>
          <p className="text-slate-500">Completa los detalles del requerimiento técnico.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Requester Info - Read Only */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-100">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white rounded-lg shadow-sm">
              <User className="w-4 h-4 text-slate-400" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase">Solicitante</p>
              <p className="text-sm font-semibold text-slate-700">{user?.full_name}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white rounded-lg shadow-sm">
              <Building2 className="w-4 h-4 text-slate-400" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase">Departamento</p>
              <p className="text-sm font-semibold text-slate-700">Guzman Tech</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm space-y-6">
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Asunto del Problema</label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({...formData, title: e.target.value})}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
              placeholder="Ej: Mi computadora no enciende"
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-sm font-bold text-slate-700">Descripción Detallada</label>
              <button
                type="button"
                onClick={handleAutoClassify}
                disabled={classifying || !formData.description}
                className="flex items-center gap-2 text-xs font-bold text-blue-600 hover:text-blue-700 disabled:opacity-50"
              >
                {classifying ? <Loader2 className="w-3 h-3 animate-spin" /> : <Brain className="w-3 h-3" />}
                Auto-Clasificar con IA
              </button>
            </div>
            <textarea
              required
              rows={4}
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all resize-none"
              placeholder="Describe el problema con el mayor detalle posible..."
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Departamento Destino</label>
              <div className="relative">
                <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <select
                  value={formData.department_id}
                  onChange={(e) => {
                    const val = e.target.value;
                    setFormData({...formData, department_id: val, category_id: ''});
                    fetchCategories(val);
                  }}
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 appearance-none bg-white"
                >
                  <option value="">Seleccionar Departamento</option>
                  {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Categoría Técnica</label>
              <select
                value={formData.category_id}
                onChange={(e) => setFormData({...formData, category_id: e.target.value})}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 appearance-none bg-white"
              >
                <option value="">Seleccionar Categoría</option>
                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Prioridad</label>
              <div className="grid grid-cols-4 gap-2">
                {['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'].map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setFormData({...formData, priority: p})}
                    className={`py-2 text-[10px] font-bold rounded-lg border transition-all ${
                      formData.priority === p 
                        ? 'bg-blue-600 border-blue-600 text-white shadow-md shadow-blue-100' 
                        : 'border-slate-200 text-slate-500 hover:bg-slate-50'
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Evidencia Fotográfica (Antes)</label>
              <div className="flex items-center gap-4">
                <input
                  type="file"
                  id="photo-upload"
                  className="hidden"
                  accept="image/*"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    
                    const formDataUpload = new FormData();
                    formDataUpload.append('file', file);
                    
                    try {
                      showNotification('success', 'Optimizando...', 'Estamos procesando tu imagen para mayor fluidez.');
                      const res = await axios.post(`${API_URL}/tickets/upload-evidence`, formDataUpload, {
                        headers: { 
                          'Authorization': `Bearer ${token}`,
                          'Content-Type': 'multipart/form-data'
                        }
                      });
                      setFormData({...formData, photo_before: res.data.url});
                      showNotification('success', 'Imagen Lista', 'La foto ha sido optimizada y cargada.');
                    } catch (err) {
                      showNotification('error', 'Error', 'No pudimos procesar la imagen.');
                    }
                  }}
                />
                <label
                  htmlFor="photo-upload"
                  className="flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl border-2 border-dashed border-slate-200 text-slate-500 hover:border-blue-500 hover:text-blue-600 transition-all cursor-pointer"
                >
                  <Camera className="w-5 h-5" />
                  <span className="text-xs font-bold">
                    {formData.photo_before ? 'Foto Cargada (WebP)' : 'Subir y Optimizar'}
                  </span>
                </label>
                {formData.photo_before && (
                  <div className="w-12 h-12 rounded-lg border border-emerald-200 overflow-hidden">
                    <img src={formData.photo_before} alt="Preview" className="w-full h-full object-cover" />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="flex gap-4">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-2xl shadow-lg shadow-blue-100 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
            Enviar Requerimiento
          </button>
          <Link
            to="/dashboard/tickets"
            className="px-8 py-4 bg-white border border-slate-200 text-slate-600 font-bold rounded-2xl hover:bg-slate-50 transition-all"
          >
            Cancelar
          </Link>
        </div>
      </form>
    </div>
  );
}
