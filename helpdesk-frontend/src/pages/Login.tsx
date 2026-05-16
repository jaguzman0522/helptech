import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { LogIn, Mail, Lock, Loader2, BrainCircuit, ShieldCheck, AlertCircle } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { useNotification } from '../context/NotificationContext';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, token } = useAuth();
  const { showNotification } = useNotification();
  const navigate = useNavigate();

  // Redirect if already logged in
  useEffect(() => {
    if (token) navigate('/dashboard');
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8010/api/v1';
      
      const response = await axios.post(`${apiUrl}/auth/login`, {
        username: email.trim(),
        password: password
      }, {
        headers: { 'Content-Type': 'application/json' },
        timeout: 10000 // 10s timeout to avoid infinite hanging
      });

      if (response.data.access_token) {
        await login(response.data.access_token);
        showNotification('success', '¡Acceso Concedido!', 'Bienvenido a la consola de administración.');
        navigate('/dashboard');
      } else {
        throw new Error('No se recibió el token de acceso');
      }
    } catch (err: any) {
      console.error('Detailed Login error:', err);
      
      let errorMessage = 'Error de conexión con el servidor';
      
      if (err.response) {
        // Server responded with error
        const detail = err.response.data?.detail;
        errorMessage = typeof detail === 'string' ? detail : 'Credenciales inválidas o cuenta inactiva';
        
        if (err.response.status === 401) errorMessage = 'Correo o clave incorrectos';
        if (err.response.status === 404) errorMessage = 'El servidor de autenticación no responde';
      } else if (err.request) {
        // Request made but no response (Network error)
        errorMessage = 'No hay conexión con el servidor técnico (8010)';
      }

      showNotification('error', 'Error de Autenticación', errorMessage);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-screen flex flex-col md:flex-row bg-slate-950 overflow-hidden relative">
      {/* Decorative background elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-blue-600/10 rounded-full blur-[100px] animate-pulse"></div>
        <div className="absolute top-1/2 -right-48 w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-[120px]"></div>
      </div>

      {/* Left Side: Branding & Hero */}
      <div className="hidden md:flex md:w-1/2 lg:w-3/5 flex-col justify-center p-20 space-y-12 relative z-10">
        <div className="space-y-6">
          <div className="inline-flex items-center gap-3 px-4 py-2 bg-blue-500/10 rounded-2xl text-blue-400 text-xs font-black tracking-widest uppercase backdrop-blur-md border border-blue-500/20">
            <ShieldCheck className="w-4 h-4" />
            Infraestructura Protegida v2.0
          </div>
          <h1 className="text-6xl lg:text-8xl font-black text-white leading-tight tracking-tighter">
            HelpDesk <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-500">Inteligente.</span>
          </h1>
          <p className="text-xl text-slate-400 max-w-lg leading-relaxed font-medium">
            Sistema multi-tenant normalizado bajo estándares internacionales. Gestión técnica con trazabilidad total.
          </p>
        </div>

        <div className="grid grid-cols-3 gap-8 pt-12 border-t border-slate-800/50 max-w-md">
          <div className="space-y-1">
            <p className="text-3xl font-black text-white">SSL</p>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Seguridad</p>
          </div>
          <div className="space-y-1">
            <p className="text-3xl font-black text-white">256b</p>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Encriptación</p>
          </div>
          <div className="space-y-1">
            <p className="text-3xl font-black text-white">SLA</p>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Disponibilidad</p>
          </div>
        </div>
      </div>

      {/* Right Side: Login Form */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12 relative z-20">
        <div className="w-full max-w-md space-y-8">
          <div className="bg-slate-900/50 backdrop-blur-2xl p-10 rounded-[45px] border border-slate-800 shadow-2xl">
            <div className="text-center mb-10">
              <div className="inline-flex p-4 bg-blue-600 rounded-3xl shadow-lg shadow-blue-600/20 mb-6 transform -rotate-3">
                <BrainCircuit className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-3xl font-black text-white">Portal Maestro</h2>
              <p className="text-slate-500 mt-2 font-medium">Ingresa tus credenciales técnicas</p>
            </div>

            <form className="space-y-6" onSubmit={handleSubmit}>
              {error && (
                <div className="p-4 flex items-center gap-3 text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-2xl animate-shake">
                  <AlertCircle className="w-5 h-5 shrink-0" />
                  <span className="font-bold">{error}</span>
                </div>
              )}

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-2">Correo Electrónico</label>
                <div className="relative group">
                  <Mail className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-600 group-focus-within:text-blue-500 transition-colors" />
                  <input
                    type="text"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-14 pr-6 py-5 bg-slate-950/50 border border-slate-800 rounded-3xl text-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500/50 outline-none transition-all font-bold placeholder-slate-700"
                    placeholder="admin@guzman-tech.com"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-2">Clave Maestra</label>
                <div className="relative group">
                  <Lock className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-600 group-focus-within:text-blue-500 transition-colors" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-14 pr-6 py-5 bg-slate-950/50 border border-slate-800 rounded-3xl text-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500/50 outline-none transition-all font-bold placeholder-slate-700"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full group relative flex justify-center items-center py-5 px-6 border border-transparent text-sm font-black rounded-3xl text-white bg-blue-600 hover:bg-blue-500 transition-all duration-300 disabled:opacity-50 shadow-2xl shadow-blue-900/20 active:scale-95"
              >
                {loading ? (
                  <Loader2 className="w-6 h-6 animate-spin" />
                ) : (
                  <>
                    <LogIn className="w-5 h-5 mr-3 group-hover:translate-x-1 transition-transform" />
                    ACCEDER A LA CONSOLA
                  </>
                )}
              </button>

              <div className="pt-6 flex flex-col gap-4">
                <Link 
                  to="/register-company" 
                  className="w-full py-4 text-center text-[10px] font-black text-slate-400 uppercase tracking-widest border border-slate-800 rounded-2xl hover:bg-slate-800 hover:text-white transition-all"
                >
                  Registrar Nueva Instancia
                </Link>
                <button type="button" className="text-[10px] font-bold text-slate-600 hover:text-blue-500 transition-colors uppercase tracking-widest">
                  ¿Olvidaste tu acceso? Contacta a soporte
                </button>
              </div>
            </form>
          </div>
          
          <p className="text-center text-[10px] font-bold text-slate-700 uppercase tracking-widest">
            © 2026 HelpDesk Tech • Secure Session Powered by JWT
          </p>
        </div>
      </div>
    </div>
  );
}
