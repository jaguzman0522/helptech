import React from 'react';
import { useForm } from 'react-hook-form';
import { useMutation, useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { 
  FileText, 
  MapPin, 
  User as UserIcon, 
  Clock, 
  AlertCircle, 
  CheckCircle2 
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';

interface RoundFormData {
  area: string;
  responsible_name: string;
  technician_name: string;
  has_incident: boolean;
  incident_description?: string;
  action_taken?: string;
  visit_time: string;
}

interface Props {
  onSuccess?: () => void;
  onCancel?: () => void;
}

export default function SupportRoundForm({ onSuccess, onCancel }: Props) {
  const { token } = useAuth();
  const { showNotification } = useNotification();
  
  const { data: company } = useQuery({
    queryKey: ['company-settings'],
    queryFn: async () => {
      const res = await axios.get('http://localhost:8001/api/v1/settings/company', {
        headers: { Authorization: `Bearer ${token}` }
      });
      return res.data;
    }
  });

  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<RoundFormData>({
    defaultValues: {
      has_incident: false,
      visit_time: new Date().toISOString().slice(0, 16),
    }
  });

  const hasIncident = watch('has_incident');

  const mutation = useMutation({
    mutationFn: (data: RoundFormData) => {
      const payload = {
        ...data,
        incident_description: data.has_incident ? data.incident_description : null,
        action_taken: data.has_incident ? data.action_taken : null,
      };
      return axios.post('http://localhost:8001/api/v1/rounds/', payload, {
        headers: { Authorization: `Bearer ${token}` }
      });
    },
    onSuccess: () => {
      showNotification('success', 'Ronda Registrada', 'La inspección técnica ha sido guardada correctamente.');
      if (onSuccess) onSuccess();
    },
    onError: (error: any) => {
      const msg = error.response?.data?.detail || 'No se pudo guardar la ronda de soporte.';
      showNotification('error', 'Error al guardar', msg);
    }
  });

  const onSubmit = (data: RoundFormData) => {
    mutation.mutate(data);
  };

  return (
    <div className="bg-white rounded-[40px] border border-slate-100 shadow-2xl overflow-hidden print:shadow-none print:border-none print:m-0 print:p-0">
      {/* Header Estilo Reporte */}
      <div className="p-8 md:p-10 border-b-2 border-slate-900 print:p-4 print:border-b-2">
        <div className="flex justify-between items-start">
          <div className="space-y-1">
            <h1 className="text-3xl font-black text-slate-900 uppercase tracking-tighter">Reporte de Rondas de Soportes</h1>
            <p className="text-sm font-bold text-slate-500 uppercase tracking-widest">{company?.name && company.id !== 0 ? company.name : 'DEPARTAMENTO TÉCNICO'}</p>
          </div>
          <div className="text-right space-y-1">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">ID Doc: <span className="text-slate-900">RND-{new Date().getFullYear()}-{Math.random().toString(36).substring(7).toUpperCase()}</span></p>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Impresión: <span className="text-slate-900">{new Date().toLocaleString()}</span></p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="p-8 md:p-10 space-y-10 print:p-4 print:space-y-6">
        {/* 1. DATOS DE UBICACIÓN Y TIEMPO */}
        <section className="space-y-6">
          <h2 className="text-xs font-black text-slate-900 uppercase tracking-[0.2em] border-b border-slate-100 pb-2">1. Datos de Ubicación y Tiempo</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
            <div className="space-y-1">
              <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Institución:</label>
              <p className="text-sm font-black uppercase text-slate-900">{company?.name && company.id !== 0 ? company.name : 'SISTEMA DE GESTIÓN TÉCNICA'}</p>
            </div>
            <div className="space-y-1">
              <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Área Visitada:</label>
              <input
                {...register('area', { required: true })}
                className="w-full p-0 bg-transparent border-none text-sm font-black uppercase text-slate-900 outline-none placeholder:text-slate-200 print:placeholder:text-transparent"
                placeholder="Ej: FARMACIA EMERGENCIA"
              />
              <div className="h-[1px] bg-slate-100 print:hidden"></div>
            </div>
            <div className="space-y-1">
              <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Fecha de Ronda:</label>
              <input
                type="datetime-local"
                {...register('visit_time', { required: true })}
                className="w-full p-0 bg-transparent border-none text-sm font-black text-slate-900 outline-none print:appearance-none"
              />
              <div className="h-[1px] bg-slate-100 print:hidden"></div>
            </div>
            <div className="space-y-1">
              <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Hora de Registro:</label>
              <p className="text-sm font-black text-slate-900">{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })}</p>
            </div>
          </div>
        </section>

        {/* 2. PERSONAL INVOLUCRADO */}
        <section className="space-y-6">
          <h2 className="text-xs font-black text-slate-900 uppercase tracking-[0.2em] border-b border-slate-100 pb-2">2. Personal Involucrado</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
            <div className="space-y-1">
              <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Técnico Responsable:</label>
              <input
                {...register('technician_name', { required: true })}
                className="w-full p-0 bg-transparent border-none text-sm font-black uppercase text-slate-900 outline-none placeholder:text-slate-200"
                placeholder="NOMBRE DEL TÉCNICO"
              />
              <div className="h-[1px] bg-slate-100 print:hidden"></div>
            </div>
            <div className="space-y-1">
              <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Recibido por:</label>
              <input
                {...register('responsible_name', { required: true })}
                className="w-full p-0 bg-transparent border-none text-sm font-black uppercase text-slate-900 outline-none placeholder:text-slate-200"
                placeholder="NOMBRE DE QUIEN RECIBE"
              />
              <div className="h-[1px] bg-slate-100 print:hidden"></div>
            </div>
          </div>
        </section>

        {/* 3. ESTADO OPERATIVO E INCIDENCIAS */}
        <section className="space-y-6">
          <h2 className="text-xs font-black text-slate-900 uppercase tracking-[0.2em] border-b border-slate-100 pb-2">3. Estado Operativo e Incidencias</h2>
          
          <div className="flex gap-4 print:hidden">
            <button 
              type="button"
              onClick={() => setValue('has_incident', true)}
              className={`flex items-center gap-3 px-6 py-3 rounded-2xl border transition-all ${
                hasIncident === true ? 'bg-amber-600 border-amber-600 text-white' : 'bg-white border-slate-200 text-slate-600 hover:border-amber-500'
              }`}
            >
              <AlertCircle className="w-4 h-4" />
              <span className="text-[10px] font-black uppercase tracking-widest">Atención Requerida</span>
            </button>
            <button 
              type="button"
              onClick={() => setValue('has_incident', false)}
              className={`flex items-center gap-3 px-6 py-3 rounded-2xl border transition-all ${
                hasIncident === false ? 'bg-emerald-600 border-emerald-600 text-white' : 'bg-white border-slate-200 text-slate-600 hover:border-emerald-500'
              }`}
            >
              <CheckCircle2 className="w-4 h-4" />
              <span className="text-[10px] font-black uppercase tracking-widest">Operativo</span>
            </button>
          </div>

          <div className="space-y-6">
            <div className="space-y-1">
              <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Clasificación General:</label>
              <p className={`text-sm font-black uppercase ${hasIncident ? 'text-amber-600' : 'text-emerald-600'}`}>
                {hasIncident ? '⚠ ATENCIÓN REQUERIDA (REQUERIMIENTO / SOPORTE)' : '✅ ÁREA 100% OPERATIVA'}
              </p>
            </div>

            <div className={`space-y-6 ${!hasIncident && 'opacity-30 print:opacity-100'}`}>
              <div className="space-y-1">
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Detalle de Falla/Requerimiento:</label>
                <textarea
                  {...register('incident_description', { required: hasIncident })}
                  rows={2}
                  className="w-full p-3 bg-slate-50 border border-slate-100 rounded-xl text-xs font-bold text-slate-700 outline-none focus:border-amber-500 transition-all print:bg-white print:p-0 print:border-none"
                  placeholder={hasIncident ? "DESCRIBA EL HALLAZGO..." : "SIN NOVEDADES RELEVANTES"}
                />
              </div>
              <div className="space-y-1">
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Acción Tomada / Solución:</label>
                <textarea
                  {...register('action_taken', { required: hasIncident })}
                  rows={2}
                  className="w-full p-3 bg-slate-50 border border-slate-100 rounded-xl text-xs font-bold text-slate-700 outline-none focus:border-emerald-500 transition-all print:bg-white print:p-0 print:border-none"
                  placeholder={hasIncident ? "DESCRIBA LA ACCIÓN..." : "N/A"}
                />
              </div>
            </div>
          </div>
        </section>

        {/* 4. CONFORMIDAD Y CIERRE */}
        <section className="pt-20 space-y-16">
          <h2 className="text-xs font-black text-slate-900 uppercase tracking-[0.3em] text-center">4. Conformidad y Cierre</h2>
          
          <div className="grid grid-cols-2 gap-32">
            <div className="text-center space-y-3">
              <div className="border-t-2 border-slate-900 pt-3">
                <p className="text-xs font-black uppercase text-slate-900">{watch('responsible_name') || 'NOMBRE RESPONSABLE'}</p>
                <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">Firma Responsable(s) Área</p>
              </div>
            </div>
            <div className="text-center space-y-3">
              <div className="border-t-2 border-slate-900 pt-3">
                <p className="text-xs font-black uppercase text-slate-900">{watch('technician_name') || 'NOMBRE TÉCNICO'}</p>
                <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">Firma Técnico Soporte</p>
              </div>
            </div>
          </div>
          
          <p className="text-[9px] text-center italic text-slate-400 mt-10">
            Este documento certifica la visita técnica presencial en la instalación indicada. Guardar como constancia física o digital.
          </p>
        </section>

        <div className="flex justify-end gap-4 pt-6 print:hidden">
          <button
            type="button"
            onClick={onCancel}
            className="px-8 py-4 bg-slate-100 text-slate-600 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-slate-200 transition-all"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={mutation.isPending}
            className="flex items-center gap-3 px-8 py-4 bg-slate-900 text-white rounded-2xl font-black uppercase tracking-widest text-xs shadow-2xl hover:bg-slate-800 transition-all active:scale-95 disabled:opacity-50"
          >
            {mutation.isPending ? 'Guardando...' : 'Finalizar y Guardar Registro'}
          </button>
        </div>
      </form>
    </div>
  );
}
