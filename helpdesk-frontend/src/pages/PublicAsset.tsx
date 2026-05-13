import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Shield, AlertTriangle, CheckCircle2, MapPin, Send, Loader2, Camera, ShieldAlert } from 'lucide-react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8001/api/v1';

export default function PublicAsset() {
  const { token } = useParams();
  const [asset, setAsset] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [reporting, setReporting] = useState(false);
  const [description, setDescription] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [reportSuccess, setReportSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchAsset();
  }, [token]);

  const fetchAsset = async () => {
    try {
      const response = await axios.get(`${API_URL}/public/asset/${token}`);
      if (response.data.error) {
        setError(response.data.message);
      } else {
        setAsset(response.data.data);
      }
    } catch (err: any) {
      setError('No pudimos encontrar este equipo. Por favor, verifica el código QR.');
    } finally {
      setLoading(false);
    }
  };

  const handleReport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) return;

    setReporting(true);
    const formData = new FormData();
    formData.append('description', description);
    if (file) formData.append('file', file);

    try {
      await axios.post(`${API_URL}/public/asset/${token}/report?description=${description}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setReportSuccess(true);
    } catch (err) {
      alert('Error al enviar el reporte. Inténtalo de nuevo.');
    } finally {
      setReporting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-blue-500 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-950 p-6 flex items-center justify-center text-center">
        <div className="max-w-md">
          <div className="bg-rose-500/10 border border-rose-500/20 p-8 rounded-3xl mb-6">
            <ShieldAlert className="w-16 h-16 text-rose-500 mx-auto mb-4" />
            <h1 className="text-2xl font-black text-white mb-2">ACCESO RESTRINGIDO</h1>
            <p className="text-slate-400 font-medium">{error}</p>
          </div>
          <p className="text-slate-600 text-sm">Si crees que esto es un error, contacta al departamento de IT.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-sans selection:bg-blue-500/30">
      {/* Header / Brand */}
      <div className="p-6 flex items-center justify-between border-b border-slate-900 bg-slate-950/50 backdrop-blur-md sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center font-black text-white shadow-lg shadow-blue-900/20">
            H
          </div>
          <div>
            <h1 className="text-sm font-black text-white uppercase tracking-tighter">HelpDesk IA</h1>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{asset.company.name}</p>
          </div>
        </div>
        <div className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full flex items-center gap-2">
          <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
          <span className="text-[10px] font-black text-emerald-500 uppercase">Activo Verificado</span>
        </div>
      </div>

      <div className="p-6 max-w-2xl mx-auto space-y-8">
        {/* Asset Identity Card */}
        <div className="relative group">
          <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-[2rem] blur opacity-25 group-hover:opacity-40 transition duration-1000"></div>
          <div className="relative bg-slate-900 border border-slate-800 rounded-[2rem] overflow-hidden">
            <img 
              src={asset.photo_url} 
              alt={asset.name}
              className="w-full h-48 object-cover opacity-80"
            />
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h2 className="text-2xl font-black text-white tracking-tight">{asset.name}</h2>
                  <p className="text-blue-400 font-bold text-sm">{asset.code}</p>
                </div>
                <div className={`px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                  asset.status === 'OPERATIVO' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'
                }`}>
                  {asset.status}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mt-6">
                <div className="bg-slate-950/50 p-4 rounded-2xl border border-slate-800/50">
                  <Shield className="w-5 h-5 text-blue-500 mb-2" />
                  <p className="text-[10px] text-slate-500 font-bold uppercase">Garantía Activa</p>
                  <p className="text-xs font-bold text-white">{new Date(asset.warranty_until).toLocaleDateString()}</p>
                </div>
                <div className="bg-slate-950/50 p-4 rounded-2xl border border-slate-800/50">
                  <MapPin className="w-5 h-5 text-indigo-500 mb-2" />
                  <p className="text-[10px] text-slate-500 font-bold uppercase">Ubicación</p>
                  <p className="text-xs font-bold text-white">Sede Central</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Report Section */}
        {!reportSuccess ? (
          <div className="bg-slate-900 border border-slate-800 rounded-[2rem] p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-rose-500/10 rounded-2xl">
                <AlertTriangle className="w-6 h-6 text-rose-500" />
              </div>
              <div>
                <h3 className="text-lg font-black text-white">Reportar Falla Técnica</h3>
                <p className="text-xs text-slate-500 font-medium">No necesitas cuenta. Reporta y nosotros nos encargamos.</p>
              </div>
            </div>

            <form onSubmit={handleReport} className="space-y-4">
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe el problema de forma breve... (ej: La pantalla no enciende)"
                className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 text-sm text-white placeholder:text-slate-700 focus:ring-2 focus:ring-blue-500 outline-none transition-all h-32 resize-none"
              ></textarea>
              
              <div className="flex gap-4">
                <label className="flex-1 bg-slate-950 border border-slate-800 rounded-2xl p-4 flex items-center justify-center gap-3 cursor-pointer hover:bg-slate-900 transition-all">
                  <Camera className={`w-6 h-6 ${file ? 'text-emerald-500' : 'text-slate-500'}`} />
                  <span className="text-xs font-bold text-slate-400">
                    {file ? 'FOTO CAPTURADA' : 'AÑADIR FOTO'}
                  </span>
                  <input 
                    type="file" 
                    accept="image/*" 
                    capture="environment" 
                    className="hidden" 
                    onChange={(e) => setFile(e.target.files?.[0] || null)} 
                  />
                </label>
              </div>

              {file && (
                <div className="relative rounded-2xl overflow-hidden border border-slate-800">
                  <img 
                    src={URL.createObjectURL(file)} 
                    className="w-full h-32 object-cover opacity-50" 
                    alt="Preview" 
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <CheckCircle2 className="w-8 h-8 text-emerald-500" />
                  </div>
                </div>
              )}
              
              <button
                type="submit"
                disabled={reporting || !description.trim()}
                className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-black py-4 rounded-2xl flex items-center justify-center gap-2 transition-all shadow-xl shadow-blue-900/20"
              >
                {reporting ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <Send className="w-5 h-5" />
                    ENVIAR REPORTE A IT
                  </>
                )}
              </button>
            </form>
          </div>
        ) : (
          <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-[2rem] p-8 text-center animate-in zoom-in duration-300">
            <CheckCircle2 className="w-16 h-16 text-emerald-500 mx-auto mb-4" />
            <h3 className="text-xl font-black text-white mb-2">¡Reporte Enviado!</h3>
            <p className="text-slate-400 text-sm mb-6">Hemos asignado un técnico a este equipo inmediatamente. Tu ticket está en proceso.</p>
            <button 
              onClick={() => setReportSuccess(false)}
              className="text-emerald-500 font-black text-xs uppercase tracking-widest hover:underline"
            >
              Hacer otro reporte
            </button>
          </div>
        )}

        <div className="text-center pb-10">
          <p className="text-[10px] text-slate-600 font-bold uppercase tracking-widest">Powered by HelpDesk IA Infrastructure</p>
        </div>
      </div>
    </div>
  );
}
