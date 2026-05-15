import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API_URL } from '../api/config';
import { 
  Building2, 
  Mail, 
  Lock, 
  User, 
  Phone, 
  Globe, 
  CheckCircle2, 
  ChevronRight, 
  Zap, 
  ShieldCheck, 
  Cpu,
  ArrowRight,
  Loader2
} from 'lucide-react';
import toast from 'react-hot-toast';

const RegisterCompany = () => {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    admin_email: '',
    admin_name: '',
    password: '',
    phone: '',
    plan_id: 'pro'
  });
  const [verificationCode, setVerificationCode] = useState('');
  const navigate = useNavigate();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => {
      const newData = { ...prev, [name]: value };
      if (name === 'name') {
        newData.slug = value.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '');
      }
      return newData;
    });
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await axios.post(`${API_URL}/auth/register-company`, formData);
      toast.success('¡Empresa registrada con éxito!');
      console.log("Token de verificación:", response.data.verification_token);
      setStep(2);
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Error al registrar la empresa');
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();
    if (verificationCode.length === 6) {
      setStep(3);
    } else {
      toast.error('Ingresa los 6 dígitos');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 md:p-8 font-sans selection:bg-blue-500 selection:text-white">
      <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
        
        {/* Left Side: Plan Summary (Dynamic) */}
        <div className="lg:col-span-5 hidden lg:flex flex-col justify-between p-10 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-[2.5rem] shadow-2xl shadow-blue-900/20 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-20 -mt-20"></div>
          
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-10">
              <div className="p-3 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20">
                <Cpu className="w-8 h-8" />
              </div>
              <h2 className="text-2xl font-black tracking-tighter uppercase">HelpDesk 360</h2>
            </div>

            <div className="space-y-8">
              <h1 className="text-5xl font-black leading-[1.1] tracking-tight">
                Impulsa tu <br /> Gestión <span className="text-blue-200">TI</span>
              </h1>
              <p className="text-blue-100 text-lg font-medium leading-relaxed max-w-sm">
                Al activar tu mesa de ayuda, configuramos automáticamente roles, departamentos y categorías para que empieces hoy mismo.
              </p>

              <div className="space-y-4 pt-6">
                {[
                  { icon: Zap, text: 'Configuración Zero-Touch' },
                  { icon: ShieldCheck, text: 'Seguridad Multi-inquilino' },
                  { icon: Globe, text: 'Acceso Global 24/7' }
                ].map((item, idx) => (
                  <div key={idx} className="flex items-center gap-4 group">
                    <div className="p-2 bg-white/10 rounded-xl group-hover:bg-white/20 transition-colors">
                      <item.icon className="w-5 h-5 text-blue-200" />
                    </div>
                    <span className="font-bold tracking-wide">{item.text}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-12 p-6 bg-white/10 backdrop-blur-md rounded-3xl border border-white/10 relative z-10">
            <p className="text-xs font-black uppercase tracking-widest text-blue-200 mb-2">Plan Seleccionado</p>
            <div className="flex items-end justify-between">
              <div>
                <h3 className="text-3xl font-black uppercase">{formData.plan_id}</h3>
                <p className="text-sm font-medium text-blue-100">Prueba gratuita de 30 días</p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-black">$0</p>
                <p className="text-[10px] font-black uppercase text-blue-200">Hoy</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Form Content */}
        <div className="lg:col-span-7 bg-white/5 backdrop-blur-xl border border-white/10 rounded-[2.5rem] shadow-2xl p-8 md:p-12 flex flex-col justify-center">
          
          {step === 1 && (
            <div className="animate-in fade-in slide-in-from-right duration-500">
              <div className="mb-10 text-center lg:text-left">
                <h2 className="text-4xl font-black text-white tracking-tight mb-3">Registra tu Empresa</h2>
                <p className="text-slate-400 font-medium">Completa los datos para activar tu plataforma en segundos.</p>
              </div>

              <form onSubmit={handleRegister} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Nombre Comercial</label>
                    <div className="relative group">
                      <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-blue-500 transition-colors" />
                      <input 
                        required
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        placeholder="Ej: Tech Solutions"
                        className="w-full pl-12 pr-6 py-4 bg-slate-900 border border-slate-800 rounded-2xl text-white placeholder:text-slate-600 focus:ring-2 focus:ring-blue-500 outline-none transition-all font-medium"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">URL Personalizada (Slug)</label>
                    <div className="relative group">
                      <Globe className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-blue-500 transition-colors" />
                      <input 
                        required
                        name="slug"
                        value={formData.slug}
                        onChange={handleInputChange}
                        placeholder="tech-solutions"
                        className="w-full pl-12 pr-6 py-4 bg-slate-900 border border-slate-800 rounded-2xl text-blue-400 font-bold focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Admin Email</label>
                    <div className="relative group">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-blue-500 transition-colors" />
                      <input 
                        required
                        type="email"
                        name="admin_email"
                        value={formData.admin_email}
                        onChange={handleInputChange}
                        placeholder="admin@tuempresa.com"
                        className="w-full pl-12 pr-6 py-4 bg-slate-900 border border-slate-800 rounded-2xl text-white placeholder:text-slate-600 focus:ring-2 focus:ring-blue-500 outline-none transition-all font-medium"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Nombre Completo</label>
                    <div className="relative group">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-blue-500 transition-colors" />
                      <input 
                        required
                        name="admin_name"
                        value={formData.admin_name}
                        onChange={handleInputChange}
                        placeholder="Juan Pérez"
                        className="w-full pl-12 pr-6 py-4 bg-slate-900 border border-slate-800 rounded-2xl text-white placeholder:text-slate-600 focus:ring-2 focus:ring-blue-500 outline-none transition-all font-medium"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Contraseña de Administrador</label>
                  <div className="relative group">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-blue-500 transition-colors" />
                    <input 
                      required
                      type="password"
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      placeholder="••••••••"
                      className="w-full pl-12 pr-6 py-4 bg-slate-900 border border-slate-800 rounded-2xl text-white placeholder:text-slate-600 focus:ring-2 focus:ring-blue-500 outline-none transition-all font-medium"
                    />
                  </div>
                </div>

                <div className="pt-6">
                  <button 
                    type="submit"
                    disabled={loading}
                    className="w-full py-5 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-black uppercase tracking-widest text-sm flex items-center justify-center gap-3 transition-all shadow-xl shadow-blue-600/20 active:scale-[0.98]"
                  >
                    {loading ? (
                      <Loader2 className="w-6 h-6 animate-spin" />
                    ) : (
                      <>
                        Activar Mi Mesa de Ayuda
                        <ChevronRight className="w-5 h-5" />
                      </>
                    )}
                  </button>
                </div>

                <div className="text-center">
                  <p className="text-slate-500 text-xs font-bold">
                    ¿Ya tienes una empresa? <Link to="/login" className="text-blue-400 hover:text-blue-300">Inicia Sesión</Link>
                  </p>
                </div>
              </form>
            </div>
          )}

          {step === 2 && (
            <div className="animate-in fade-in zoom-in duration-500 text-center space-y-8">
              <div className="inline-flex p-6 bg-blue-500/10 rounded-full border border-blue-500/20">
                <ShieldCheck className="w-12 h-12 text-blue-400" />
              </div>
              <div>
                <h2 className="text-4xl font-black text-white tracking-tight mb-3">Verifica tu Identidad</h2>
                <p className="text-slate-400 font-medium">Hemos enviado un código de 6 dígitos a <span className="text-blue-400">{formData.admin_email}</span></p>
              </div>

              <form onSubmit={handleVerify} className="max-w-xs mx-auto space-y-8">
                <input 
                  autoFocus
                  maxLength={6}
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, ''))}
                  className="w-full bg-slate-900 border-2 border-slate-800 rounded-3xl py-6 text-center text-5xl font-black tracking-[1rem] text-blue-400 focus:border-blue-500 outline-none transition-all"
                  placeholder="000000"
                />
                
                <button 
                  type="submit"
                  className="w-full py-5 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-black uppercase tracking-widest text-sm transition-all active:scale-[0.98]"
                >
                  Verificar Ahora
                </button>
              </form>

              <p className="text-slate-500 text-xs font-bold">
                ¿No recibiste el código? <button onClick={() => setStep(1)} className="text-blue-400">Reintentar registro</button>
              </p>
            </div>
          )}

          {step === 3 && (
            <div className="animate-in fade-in zoom-in duration-700 text-center space-y-10">
              <div className="relative mx-auto w-32 h-32">
                <div className="absolute inset-0 bg-emerald-500/20 blur-3xl animate-pulse"></div>
                <div className="relative flex items-center justify-center w-32 h-32 bg-emerald-500 rounded-full shadow-2xl shadow-emerald-500/20">
                  <CheckCircle2 className="w-16 h-16 text-white animate-in zoom-in spin-in-12 duration-500" />
                </div>
              </div>

              <div className="space-y-4">
                <h2 className="text-5xl font-black text-white tracking-tight">¡Todo Listo!</h2>
                <p className="text-xl text-slate-400 font-medium">
                  Tu empresa <span className="text-white font-bold">{formData.name}</span> ha sido activada con éxito.
                </p>
              </div>

              <div className="p-8 bg-slate-900/50 rounded-3xl border border-white/5 space-y-4 text-left">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-blue-500/20 rounded-xl flex items-center justify-center">
                    <Zap className="w-5 h-5 text-blue-400" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Siguiente Paso</p>
                    <p className="text-sm font-bold text-white">Inicia sesión para configurar tu mesa de ayuda</p>
                  </div>
                </div>
              </div>

              <button 
                onClick={() => navigate('/login')}
                className="w-full py-5 bg-white text-slate-950 rounded-2xl font-black uppercase tracking-widest text-sm flex items-center justify-center gap-3 transition-all hover:bg-blue-50 active:scale-[0.98]"
              >
                Comenzar Ahora
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default RegisterCompany;
