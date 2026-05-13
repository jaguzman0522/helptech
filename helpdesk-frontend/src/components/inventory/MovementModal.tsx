import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { 
  ArrowUpRight, 
  ArrowDownLeft, 
  Settings, 
  MessageSquare, 
  Save, 
  X,
  Loader2
} from 'lucide-react';
import { useNotification } from '../../context/NotificationContext';
import { useAuth } from '../../context/AuthContext';

const movementSchema = z.object({
  productoId: z.number().min(1, 'El producto es obligatorio'),
  almacenId: z.number().min(1, 'El almacén es obligatorio'),
  tipo: z.enum(['ENTRADA', 'SALIDA']),
  cantidad: z.number().min(1, 'La cantidad mínima es 1'),
  motivo: z.string().min(3, 'El motivo debe ser más descriptivo'),
  ticketId: z.number().optional(),
});

type MovementFormData = z.infer<typeof movementSchema>;

interface Props {
  productoId: number;
  productoNombre: string;
  stockActual: number;
  ticketId?: number;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export default function MovementModal({ productoId, productoNombre, stockActual, ticketId, onSuccess, onCancel }: Props) {
  const { token } = useAuth();
  const { showNotification } = useNotification();
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors }
  } = useForm<MovementFormData>({
    resolver: zodResolver(movementSchema),
    defaultValues: {
      productoId,
      almacenId: 1, // Defaulting for now
      tipo: 'SALIDA',
      cantidad: 1,
      ticketId,
      motivo: ticketId ? `Repuesto utilizado en Ticket TK-${ticketId}` : ''
    }
  });

  const tipo = watch('tipo');
  const cantidad = watch('cantidad');

  const mutation = useMutation({
    mutationFn: (data: MovementFormData) => {
      return axios.post('http://localhost:8001/api/v1/inventory/movements', data, {
        headers: { Authorization: `Bearer ${token}` }
      });
    },
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      showNotification('success', 'Movimiento Registrado', `Se actualizó el stock. Nuevo saldo: ${res.data.new_stock}`);
      if (onSuccess) onSuccess();
    },
    onError: (err: any) => {
      const msg = err.response?.data?.detail || 'No pudimos procesar el movimiento.';
      showNotification('error', 'Error en Inventario', msg);
    }
  });

  const onSubmit = (data: MovementFormData) => {
    mutation.mutate(data);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl border border-slate-100 overflow-hidden animate-in zoom-in-95 duration-300">
        <div className="p-6 border-b border-slate-50 flex items-center justify-between bg-slate-50/50">
          <div>
            <h3 className="text-lg font-bold text-slate-900">Registrar Movimiento</h3>
            <p className="text-xs text-slate-500 font-medium">Producto: {productoNombre}</p>
          </div>
          <button onClick={onCancel} className="p-2 hover:bg-white rounded-xl transition-all shadow-sm border border-transparent hover:border-slate-100">
            <X className="w-5 h-5 text-slate-400" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-8 space-y-6">
          <div className="flex gap-4">
            <label className={`flex-1 flex items-center justify-center gap-2 p-4 rounded-2xl border-2 cursor-pointer transition-all ${tipo === 'SALIDA' ? 'bg-red-50 border-red-200 text-red-700' : 'bg-white border-slate-100 text-slate-400 hover:border-slate-200'}`}>
              <input {...register('tipo')} type="radio" value="SALIDA" className="hidden" />
              <ArrowUpRight className="w-5 h-5" />
              <span className="font-bold text-sm uppercase tracking-wider">Salida</span>
            </label>
            <label className={`flex-1 flex items-center justify-center gap-2 p-4 rounded-2xl border-2 cursor-pointer transition-all ${tipo === 'ENTRADA' ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-white border-slate-100 text-slate-400 hover:border-slate-200'}`}>
              <input {...register('tipo')} type="radio" value="ENTRADA" className="hidden" />
              <ArrowDownLeft className="w-5 h-5" />
              <span className="font-bold text-sm uppercase tracking-wider">Entrada</span>
            </label>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Cantidad</label>
              <input
                type="number"
                {...register('cantidad', { valueAsNumber: true })}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none font-bold"
              />
              {errors.cantidad && <p className="text-[10px] text-red-500 font-bold ml-1">{errors.cantidad.message}</p>}
            </div>
            <div className="space-y-1 text-right">
              <label className="text-[10px] font-black text-slate-400 uppercase mr-1">Stock Resultante</label>
              <div className="py-3 pr-2 text-xl font-black text-slate-900">
                {tipo === 'SALIDA' ? stockActual - (cantidad || 0) : stockActual + (cantidad || 0)}
              </div>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Motivo / Descripción</label>
            <div className="relative">
              <MessageSquare className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
              <textarea
                {...register('motivo')}
                rows={3}
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none text-sm transition-all"
                placeholder="Describe por qué se realiza este movimiento..."
              />
            </div>
            {errors.motivo && <p className="text-[10px] text-red-500 font-bold ml-1">{errors.motivo.message}</p>}
          </div>

          {ticketId && (
            <div className="p-4 bg-blue-50 rounded-2xl border border-blue-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-600 rounded-lg">
                  <Settings className="w-4 h-4 text-white" />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-blue-600 uppercase tracking-widest">Vinculado a Ticket</p>
                  <p className="text-sm font-black text-blue-900">TK-{ticketId.toString().padStart(6, '0')}</p>
                </div>
              </div>
              <div className="px-3 py-1 bg-white text-blue-600 text-[10px] font-black rounded-full border border-blue-100 shadow-sm">
                TRAZABILIDAD OK
              </div>
            </div>
          )}

          <div className="pt-4">
            <button
              type="submit"
              disabled={mutation.isPending}
              className="w-full bg-slate-900 text-white font-bold py-4 rounded-2xl shadow-xl hover:bg-black transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {mutation.isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5 text-emerald-400" />}
              Confirmar Movimiento
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
