import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { 
  Package, 
  Tag, 
  Hash, 
  Smartphone, 
  Cpu, 
  Save, 
  X,
  Loader2,
  Barcode
} from 'lucide-react';
import { useNotification } from '../../context/NotificationContext';
import { useAuth } from '../../context/AuthContext';

const productSchema = z.object({
  nombre: z.string().min(2, 'El nombre debe tener al menos 2 caracteres').max(120),
  descripcion: z.string().optional(),
  tipo: z.enum(['REPUESTO', 'ACTIVO_FIJO', 'ELECTRONICO', 'TELEFONO', 'ROPA', 'ALIMENTO', 'SERVICIO']),
  stock: z.number().min(0, 'El stock no puede ser negativo'),
  stockMinimo: z.number().min(0).default(5),
  categoriaId: z.string().min(1, 'La categoría es obligatoria'),
  proveedorId: z.string().optional(),
  numeroSerie: z.string().optional(),
  specs: z.object({
    marca: z.string().optional(),
    modelo: z.string().optional(),
    imei: z.string().optional(),
  }).optional(),
});

type ProductFormData = z.infer<typeof productSchema>;

interface Props {
  onSuccess?: () => void;
  onCancel?: () => void;
}

export default function NuevoProductoForm({ onSuccess, onCancel }: Props) {
  const { token } = useAuth();
  const { showNotification } = useNotification();
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
    setValue
  } = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      tipo: 'ACTIVO_FIJO',
      stock: 0,
      stockMinimo: 5,
    }
  });

  const tipoSeleccionado = watch('tipo');

  const mutation = useMutation({
    mutationFn: (data: ProductFormData) => {
      return axios.post('http://localhost:8001/api/v1/inventory/', data, {
        headers: { Authorization: `Bearer ${token}` }
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      showNotification('success', '¡Producto Registrado!', 'El activo ha sido añadido al inventario con éxito.');
      if (onSuccess) onSuccess();
    },
    onError: () => {
      showNotification('error', 'Error al Guardar', 'No pudimos registrar el producto. Revisa los datos.');
    }
  });

  const onSubmit = (data: ProductFormData) => {
    mutation.mutate(data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 bg-white p-8 rounded-2xl border border-slate-100 shadow-sm">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
          <Package className="w-6 h-6 text-blue-600" /> Nuevo Producto / Activo
        </h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Nombre */}
        <div className="space-y-1">
          <label className="text-sm font-bold text-slate-700">Nombre del Producto</label>
          <div className="relative">
            <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              {...register('nombre')}
              className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              placeholder="Ej: Laptop Dell Latitude 5420"
            />
          </div>
          {errors.nombre && <p className="text-[10px] text-red-500 font-bold uppercase">{errors.nombre.message}</p>}
        </div>

        {/* Tipo */}
        <div className="space-y-1">
          <label className="text-sm font-bold text-slate-700">Tipo de Activo</label>
          <select
            {...register('tipo')}
            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none transition-all bg-white"
          >
            <option value="ACTIVO_FIJO">Activo Fijo</option>
            <option value="REPUESTO">Repuesto</option>
            <option value="ELECTRONICO">Electrónico</option>
            <option value="TELEFONO">Teléfono / Móvil</option>
            <option value="SERVICIO">Servicio</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Categoría */}
        <div className="space-y-1">
          <label className="text-sm font-bold text-slate-700">Categoría ID</label>
          <input
            {...register('categoriaId')}
            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
            placeholder="ID de categoría"
          />
        </div>

        {/* Stock Inicial */}
        <div className="space-y-1">
          <label className="text-sm font-bold text-slate-700">Stock Inicial</label>
          <input
            type="number"
            {...register('stock', { valueAsNumber: true })}
            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
          />
        </div>

        {/* Stock Mínimo */}
        <div className="space-y-1">
          <label className="text-sm font-bold text-slate-700">Alerta Stock Mínimo</label>
          <input
            type="number"
            {...register('stockMinimo', { valueAsNumber: true })}
            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
          />
        </div>
      </div>

      {/* Sección Dinámica: Especificaciones Técnicas */}
      {(tipoSeleccionado === 'ELECTRONICO' || tipoSeleccionado === 'TELEFONO') && (
        <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100 space-y-4 animate-in fade-in zoom-in duration-300">
          <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Cpu className="w-4 h-4 text-blue-600" /> Especificaciones Técnicas
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-[10px] font-bold text-slate-500 uppercase">Marca</label>
              <input
                {...register('specs.marca')}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm mt-1"
                placeholder="Ej: Apple, Dell"
              />
            </div>
            <div>
              <label className="text-[10px] font-bold text-slate-500 uppercase">Modelo</label>
              <input
                {...register('specs.modelo')}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm mt-1"
                placeholder="Ej: iPhone 13"
              />
            </div>
            {tipoSeleccionado === 'TELEFONO' && (
              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase">IMEI / Identificador</label>
                <div className="relative mt-1">
                  <Smartphone className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-400" />
                  <input
                    {...register('specs.imei')}
                    className="w-full pl-7 pr-3 py-2 rounded-lg border border-slate-200 text-sm"
                    placeholder="15 dígitos"
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      <div>
        <label className="text-sm font-bold text-slate-700">Número de Serie / Código Interno</label>
        <div className="relative mt-1">
          <Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            {...register('numeroSerie')}
            className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
            placeholder="SN-XXXXXXX"
          />
        </div>
      </div>

      <div className="flex gap-4 pt-4">
        <button
          type="submit"
          disabled={mutation.isPending}
          className="flex-1 bg-blue-600 text-white font-bold py-4 rounded-2xl shadow-lg shadow-blue-100 flex items-center justify-center gap-2 hover:bg-blue-700 transition-all disabled:opacity-50"
        >
          {mutation.isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
          Guardar Producto en VentaSmart
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-8 py-4 bg-white border border-slate-200 text-slate-600 font-bold rounded-2xl hover:bg-slate-50 transition-all flex items-center gap-2"
          >
            <X className="w-5 h-5" /> Cancelar
          </button>
        )}
      </div>
    </form>
  );
}
