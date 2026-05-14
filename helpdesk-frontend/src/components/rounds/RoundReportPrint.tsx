import React from 'react';
import { FileText, MapPin, User as UserIcon, Clock, AlertCircle, CheckCircle2 } from 'lucide-react';

interface Props {
  round: any;
  company?: any;
}

export default function RoundReportPrint({ round, company }: Props) {
  if (!round) return null;

  return (
    <div className="hidden print:block fixed inset-0 bg-white z-[9999] p-10 font-sans text-slate-900 overflow-visible">
      <div className="pdf-card">
        {/* Header Estilo Reporte */}
        <div className="pdf-header flex justify-between items-center">
          <div className="flex items-center gap-8">
            {company?.logo_url ? (
              <img src={company.logo_url} alt="Logo" className="h-20 w-auto" />
            ) : (
              <div className="w-20 h-20 bg-slate-100 rounded-xl flex items-center justify-center">
                <FileText className="w-10 h-10 text-slate-300" />
              </div>
            )}
            <div>
              <p className="text-lg font-black uppercase tracking-[0.4em] text-slate-800 leading-none font-outfit">Reporte de Ronda Técnica</p>
              <div className="h-1 w-20 bg-blue-600 mt-2"></div>
            </div>
          </div>
          <div className="text-right">
            <p className="text-[9px] font-black uppercase text-slate-300 tracking-widest">ID Documento</p>
            <p className="text-xs font-bold font-mono text-slate-800">{company?.prefix || 'RND'}-{new Date(round.created_at).getFullYear()}-{round.id.toString().padStart(4, '0')}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-x-12 gap-y-8 pt-10">
          <div><p className="pdf-section-title">Institución / Sede</p><p className="pdf-data uppercase">{company?.name || 'SISTEMA DE GESTIÓN'}</p></div>
          <div><p className="pdf-section-title">Fecha y Hora</p><p className="pdf-data uppercase">{new Date(round.visit_time).toLocaleString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</p></div>
          <div><p className="pdf-section-title">Departamento / Área</p><p className="pdf-data uppercase">{round.area}</p></div>
          <div><p className="pdf-section-title">Técnico Responsable</p><p className="pdf-data uppercase">{round.technician_name}</p></div>
        </div>

        <div className="mt-12 py-6 px-8 bg-slate-50 rounded-2xl border border-slate-100 text-center">
          <p className={`font-black uppercase text-[11px] tracking-[0.2em] ${round.has_incident ? 'text-amber-600' : 'text-emerald-600'}`}>
            {round.has_incident ? '⚠ Atención Requerida (Requerimiento / Soporte)' : '✅ Área 100% Operativa'}
          </p>
        </div>

        {round.has_incident && (
          <div className="mt-8 space-y-8 p-8 border border-slate-100 rounded-3xl bg-slate-50/50">
            <div className="grid grid-cols-4 gap-8">
              <div className="col-span-1"><p className="pdf-section-title">Categoría</p><p className="font-black text-xs uppercase text-blue-600 mt-1">Soporte Técnico</p></div>
              <div className="col-span-3"><p className="pdf-section-title">Hallazgo Técnico</p><p className="text-xs font-medium italic mt-1 leading-relaxed uppercase">{round.incident_description}</p></div>
            </div>
            <div><p className="pdf-section-title">Acción / Solución Aplicada</p><p className="text-xs font-bold leading-relaxed mt-1 uppercase">{round.action_taken}</p></div>
          </div>
        )}

        <div className="mt-12">
          <p className="pdf-section-title mb-4">Personal de la Institución que Recibe</p>
          <div className="text-[13px] font-bold text-slate-700 h-20 border-b border-slate-200 whitespace-pre-wrap italic uppercase">{round.responsible_name}</div>
        </div>

        <div className="grid grid-cols-2 gap-24 mt-24">
          <div className="text-center border-t-2 border-slate-800 pt-6">
            <p className="text-[10px] font-black uppercase text-slate-800">{round.responsible_name}</p>
            <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mt-1">Firma Autorizada Sede</p>
          </div>
          <div className="text-center border-t-2 border-slate-800 pt-6">
            <p className="text-[10px] font-black uppercase text-slate-800">{round.technician_name}</p>
            <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mt-1">Firma Técnico de Soporte</p>
          </div>
        </div>
        
        <div className="mt-16 pt-6 border-t border-slate-100 flex justify-between items-center text-[7px] font-bold text-slate-300 uppercase tracking-widest">
          <p>Generado digitalmente por Plataforma de Gestión de Rondas</p>
          <p>{new Date().toLocaleString()}</p>
        </div>
      </div>
    </div>
  );
}
