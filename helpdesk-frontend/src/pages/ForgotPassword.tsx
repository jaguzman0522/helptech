import React, { useState } from 'react';
import axios from 'axios';
import { Mail, Lock, Loader2, BrainCircuit, ShieldCheck, KeyRound, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { useNotification } from '../context/NotificationContext';

export default function ForgotPasswordPage() {
  const [step, setStep] = useState(1); // 1: Request, 2: Reset
  const [email, setEmail] = useState('');
  const [token, setToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { showNotification } = useNotification();
  const navigate = useNavigate();

  const handleRequestToken = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8010/api/v1';
      await axios.post(`${apiUrl}/auth/forgot-password`, { email: email.trim() });
      showNotification('success', 'Código Enviado', 'Revisa tu bandeja de entrada (o consola local).');
      setStep(2);
    } catch (err: any) {
      showNotification('error', 'Error', 'No se pudo enviar el código. Verifica tu conexión.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8010/api/v1';
      await axios.post(`${apiUrl}/auth/reset-password`, {
        email: email.trim(),
        token: token.trim(),
        new_password: newPassword
      });
      showNotification('success', '¡Clave Actualizada!', 'Ya puedes iniciar sesión con tu nueva contraseña.');
      navigate('/login');
    } catch (err: any) {
      showNotification('error', 'Error', err.response?.data?.detail || 'Código inválido o expirado.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-screen flex items-center justify-center bg-slate-950 overflow-hidden relative p-6">
      {/* Decorative background elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-blue-600/10 rounded-full blur-[100px]"></div>
        <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-indigo-600/5 rounded-full blur-[120px]"></div>
      </div>

      <div className="w-full max-w-md space-y-8 relative z-20">
        <div className="bg-slate-900/50 backdrop-blur-2xl p-10 rounded-[45px] border border-slate-800 shadow-2xl">
          <div className="text-center mb-10">
            <Link to="/login" className="inline-flex items-center gap-2 text-slate-500 hover:text-white transition-colors mb-6 text-xs font-bold uppercase tracking-widest group">
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> Volver al Login
            </Link>
            <div className="inline-flex p-4 bg-indigo-600 rounded-3xl shadow-lg shadow-indigo-600/20 mb-6">
              {step === 1 ? <KeyRound className="w-8 h-8 text-white" /> : <ShieldCheck className="w-8 h-8 text-white" />}
            </div>
            <h2 className="text-3xl font-black text-white">
              {step === 1 ? 'Recuperar Clave' : 'Nueva Contraseña'}
            </h2>
            <p className="text-slate-500 mt-2 font-medium">
              {step === 1 
                ? 'Ingresa tu correo para recibir un código maestro' 
                : 'Ingresa el código de 6 dígitos y tu nueva clave'}
            </p>
          </div>

          {step === 1 ? (
            <form className="space-y-6" onSubmit={handleRequestToken}>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-2">Correo Electrónico</label>
                <div className="relative group">
                  <Mail className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-600 group-focus-within:text-blue-500 transition-colors" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-14 pr-6 py-5 bg-slate-950/50 border border-slate-800 rounded-3xl text-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500/50 outline-none transition-all font-bold"
                    placeholder="tu@email.com"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-5 px-6 border border-transparent text-sm font-black rounded-3xl text-white bg-indigo-600 hover:bg-indigo-500 transition-all duration-300 disabled:opacity-50 shadow-xl shadow-indigo-900/20"
              >
                {loading ? <Loader2 className="w-6 h-6 animate-spin mx-auto" /> : 'ENVIAR CÓDIGO DE MAESTRO'}
              </button>
            </form>
          ) : (
            <form className="space-y-6" onSubmit={handleResetPassword}>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-2">Código de 6 dígitos</label>
                <div className="relative group">
                  <KeyRound className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-600 group-focus-within:text-blue-500 transition-colors" />
                  <input
                    type="text"
                    required
                    maxLength={6}
                    value={token}
                    onChange={(e) => setToken(e.target.value)}
                    className="w-full pl-14 pr-6 py-5 bg-slate-950/50 border border-slate-800 rounded-3xl text-white tracking-[1em] text-center focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500/50 outline-none transition-all font-black text-xl"
                    placeholder="000000"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-2">Nueva Clave Maestra</label>
                <div className="relative group">
                  <Lock className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-600 group-focus-within:text-blue-500 transition-colors" />
                  <input
                    type="password"
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full pl-14 pr-6 py-5 bg-slate-950/50 border border-slate-800 rounded-3xl text-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500/50 outline-none transition-all font-bold"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-5 px-6 border border-transparent text-sm font-black rounded-3xl text-white bg-blue-600 hover:bg-blue-500 transition-all duration-300 disabled:opacity-50 shadow-xl shadow-blue-900/20"
              >
                {loading ? <Loader2 className="w-6 h-6 animate-spin mx-auto" /> : 'REABLECER CONTRASEÑA'}
              </button>
            </form>
          )}
        </div>
        
        <p className="text-center text-[10px] font-bold text-slate-700 uppercase tracking-widest">
          Infraestructura Segura v2.0 • HelpDesk Tech
        </p>
      </div>
    </div>
  );
}
