import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { LogIn, Mail, Lock, Loader2, BrainCircuit } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { useNotification } from '../context/NotificationContext';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const { showNotification } = useNotification();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8001/api/v1';
      const response = await axios.post(`${apiUrl}/auth/login`, {
        username: email,
        password: password
      }, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      await login(response.data.access_token);
      showNotification('success', '¡Bienvenido de nuevo!', 'Iniciando sesión en tu panel de control...');
      navigate('/dashboard');
    } catch (err: any) {
      console.error('Login error:', err.response?.data);
      const detail = err.response?.data?.detail;
      const errorMessage = Array.isArray(detail) 
        ? "Formato de datos inválido" 
        : (typeof detail === 'string' ? detail : 'Error al iniciar sesión. Verifica tus credenciales.');
      
      showNotification('error', 'Acceso Denegado', errorMessage);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-screen flex flex-col md:flex-row mesh-background overflow-hidden">
      {/* Left Side: Branding & Hero */}
      <div className="hidden md:flex md:w-3/5 flex-col justify-center p-20 space-y-12 relative overflow-hidden">
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-100/50 rounded-full text-blue-700 text-xs font-bold mb-6 backdrop-blur-sm border border-blue-200">
            <span className="flex h-2 w-2 rounded-full bg-blue-600 animate-pulse"></span>
            NUEVA ERA DE SOPORTE IA
          </div>
          <h1 className="text-6xl lg:text-7xl font-black text-slate-900 leading-tight">
            Gestión de <span className="text-blue-600">Soporte</span> <br />
            Impulsada por IA.
          </h1>
          <p className="text-xl text-slate-600 mt-6 max-w-lg leading-relaxed">
            Optimiza tu infraestructura multi-tenant con nuestro motor predictivo local y análisis 360° de activos.
          </p>
          
          <div className="flex gap-10 mt-16">
            <div className="flex flex-col">
              <span className="text-3xl font-black text-slate-900">12ms</span>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Respuesta IA</span>
            </div>
            <div className="flex flex-col">
              <span className="text-3xl font-black text-slate-900">100%</span>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Trazabilidad</span>
            </div>
            <div className="flex flex-col">
              <span className="text-3xl font-black text-slate-900">SaaS</span>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Multi-tenant</span>
            </div>
          </div>
        </div>

        {/* Floating Brain Icon */}
        <div className="absolute top-1/2 -right-20 transform -translate-y-1/2 animate-float opacity-20 lg:opacity-100">
          <div className="p-20 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-full blur-[120px] absolute inset-0"></div>
          <BrainCircuit className="w-80 h-80 text-blue-600 relative z-10" />
        </div>
      </div>

      {/* Right Side: Login Form */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12 z-20">
        <div className="glass-card w-full max-w-md p-10 rounded-[40px] border-white/40">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-black text-slate-900">Portal Maestro</h2>
            <p className="text-slate-500 mt-2 font-medium">Bienvenido al cerebro de tu empresa.</p>
          </div>

          <form className="space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="p-4 text-sm text-red-600 bg-red-50/50 backdrop-blur-sm border border-red-100 rounded-2xl animate-shake">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Correo o Usuario</label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
                <input
                  type="text"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-100 focus:border-blue-600 outline-none transition-all font-medium"
                  placeholder="ej: aguzman o admin@empresa.com"
                />
              </div>
            </div>

            <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Clave Maestra</label>
                <div className="mt-1 relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-slate-300 group-focus-within:text-blue-500 transition-colors" />
                  </div>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="block w-full pl-12 pr-4 py-4 bg-slate-50/50 border border-slate-200/50 rounded-2xl leading-5 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/50 focus:bg-white transition-all duration-300"
                    placeholder="••••••••"
                  />
                </div>
              </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center items-center py-4 px-6 border border-transparent text-sm font-black rounded-2xl text-white bg-blue-600 hover:bg-blue-700 hover:scale-[1.02] active:scale-[0.98] focus:outline-none focus:ring-4 focus:ring-blue-500/20 transition-all duration-300 disabled:opacity-50 shadow-xl shadow-blue-200"
            >
              {loading ? (
                <Loader2 className="w-6 h-6 animate-spin" />
              ) : (
                <>
                  <LogIn className="w-5 h-5 mr-3" />
                  ACCEDER AL PANEL
                </>
              )}
            </button>

            <div className="pt-6 text-center space-y-4">
              <Link to="/register-company" className="block w-full py-4 border-2 border-slate-100 text-slate-600 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-slate-50 hover:border-slate-200 transition-all">
                Registrar Nueva Empresa
              </Link>
              <a href="#" className="inline-block text-xs font-bold text-slate-400 hover:text-blue-600 transition-colors">¿Olvidaste tu clave maestra?</a>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
