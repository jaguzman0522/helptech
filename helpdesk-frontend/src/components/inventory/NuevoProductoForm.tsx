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
  Barcode,
  Layers,
  Box
} from 'lucide-react';
import { useNotification } from '../../context/NotificationContext';
import { useAuth } from '../../context/AuthContext';

const productSchema = z.object({
  nombre: z.string().min(2, 'El nombre debe tener al menos 2 caracteres').max(120),
  descripcion: z.string().optional(),
  tipo: z.enum(['ACTIVO', 'REPUESTO', 'SERVICIO']),
  categoria: z.string().min(1, 'La categoría es obligatoria'),
  stock: z.number().min(0, 'El stock no puede ser negativo'),
  stockMinimo: z.number().min(0).default(5),
  marca: z.string().optional(),
  modelo: z.string().optional(),
  numeroSerie: z.string().optional(),
  specs: z.record(z.any()).optional(),
});

type ProductFormData = z.infer<typeof productSchema>;

interface Props {
  onSuccess?: () => void;
  onCancel?: () => void;
}

const CATEGORIES_BY_TYPE: Record<string, string[]> = {
  ACTIVO: ['ELECTRÓNICO', 'MÓVIL / TABLET', 'MUEBLES', 'HERRAMIENTAS', 'VEHÍCULO'],
  REPUESTO: ['COMPONENTES PC', 'CABLEADO', 'ACCESORIOS', 'PANTALLAS', 'BATERÍAS'],
  SERVICIO: ['INSTALACIÓN', 'REPARACIÓN', 'MANTENIMIENTO', 'LICENCIA']
};

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
      tipo: 'ACTIVO',
      stock: 0,
      stockMinimo: 5,
    }
  });

  const tipoSeleccionado = watch('tipo');
  const categoriaSeleccionada = watch('categoria');

  const mutation = useMutation({
    mutationFn: (data: ProductFormData) => {
      // Adaptamos la data para el backend (mapeamos categoria string a categoriaId mock o specs)
      const payload = {
        nombre: data.nombre,
        descripcion: data.descripcion,
        tipo: data.tipo,
        stock: data.stock,
        stockMinimo: data.stockMinimo,
        numeroSerie: data.numeroSerie,
        categoriaId: 1, // Mock por ahora
        specs: {
          marca: data.marca,
          modelo: data.modelo,
          categoria_nombre: data.categoria
        }
      };
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8001/api/v1';
      return axios.post(`${apiUrl}/inventory/`, payload, {
        headers: { Authorization: `Bearer ${token}` }
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      showNotification('success', '¡Producto Registrado!', 'El item ha sido añadido al inventario con éxito.');
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
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 bg-white p-8 rounded-[32px] border border-slate-100 shadow-xl shadow-slate-200/50">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-xl font-black text-slate-900 flex items-center gap-3">
          <div className="p-3 bg-blue-600 rounded-2xl shadow-lg shadow-blue-100">
            <Box className="w-6 h-6 text-white" />
          </div>
          Nuevo Registro de Inventario
        </h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Nombre */}
        <div className="space-y-2">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Nombre del Producto / Servicio</label>
          <div className="relative group">
            <Tag className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
            <input
              {...register('nombre')}
              className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-[20px] text-sm font-bold outline-none focus:ring-4 focus:ring-blue-500/10 focus:bg-white focus:border-blue-500 transition-all"
              placeholder='Ej: Monitor Gamer LG 27"'
            />
          </div>
          {errors.nombre && <p className="text-[10px] text-red-500 font-bold uppercase ml-1">{errors.nombre.message}</p>}
        </div>

        {/* Tipo de Producto */}
        <div className="space-y-2">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Tipo de Producto</label>
          <div className="relative">
            <Layers className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <select
              {...register('tipo')}
              className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-[20px] text-sm font-bold outline-none focus:ring-4 focus:ring-blue-500/10 focus:bg-white focus:border-blue-500 transition-all appearance-none cursor-pointer"
            >
              <option value="ACTIVO">Activo Fijo</option>
              <option value="REPUESTO">Repuesto / Consumible</option>
              <option value="SERVICIO">Servicio Técnico</option>
            </select>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Categoría Dinámica */}
        <div className="space-y-2">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Categoría</label>
          <select
            {...register('categoria')}
            className="w-full px-4 py-4 bg-slate-50 border border-slate-100 rounded-[20px] text-sm font-bold outline-none focus:ring-4 focus:ring-blue-500/10 focus:bg-white focus:border-blue-500 transition-all cursor-pointer"
          >
            <option value="">Seleccionar Categoría...</option>
            {CATEGORIES_BY_TYPE[tipoSeleccionado]?.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
          {errors.categoria && <p className="text-[10px] text-red-500 font-bold uppercase ml-1">{errors.categoria.message}</p>}
        </div>

        {/* Marca / Modelo (Siempre visibles) */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Marca</label>
            <input
              {...register('marca')}
              className="w-full px-4 py-4 bg-slate-50 border border-slate-100 rounded-[20px] text-sm font-bold outline-none focus:ring-4 focus:ring-blue-500/10 focus:bg-white focus:border-blue-500 transition-all"
              placeholder="Ej: HP, Apple, LG"
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Modelo</label>
            <input
              {...register('modelo')}
              className="w-full px-4 py-4 bg-slate-50 border border-slate-100 rounded-[20px] text-sm font-bold outline-none focus:ring-4 focus:ring-blue-500/10 focus:bg-white focus:border-blue-500 transition-all"
              placeholder="Ej: EliteBook, iPhone 15"
            />
          </div>
        </div>
      </div>

      {/* Campos Extra según Categoría */}
      {categoriaSeleccionada === 'MÓVIL / TABLET' && (
        <div className="p-6 bg-blue-50/50 rounded-[24px] border border-blue-100 animate-in slide-in-from-top-2 duration-300">
          <div className="flex items-center gap-2 mb-4">
            <Smartphone className="w-4 h-4 text-blue-600" />
            <h4 className="text-xs font-black text-blue-900 uppercase tracking-widest">Datos de Dispositivo</h4>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-blue-400 uppercase tracking-tight">IMEI / Identificador</label>
              <input 
                {...register('specs.imei')}
                className="w-full px-4 py-3 bg-white border border-blue-100 rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-blue-500" 
                placeholder="Ej: 351234567890123"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-blue-400 uppercase tracking-tight">Capacidad (GB)</label>
              <input 
                {...register('specs.capacity')}
                className="w-full px-4 py-3 bg-white border border-blue-100 rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-blue-500" 
                placeholder="Ej: 128GB, 256GB"
              />
            </div>
          </div>
        </div>
      )}

      {categoriaSeleccionada === 'ELECTRÓNICO' && (
        <div className="p-6 bg-slate-50 rounded-[24px] border border-slate-100 animate-in slide-in-from-top-2 duration-300">
          <div className="flex items-center gap-2 mb-4">
            <Cpu className="w-4 h-4 text-slate-600" />
            <h4 className="text-xs font-black text-slate-900 uppercase tracking-widest">Especificaciones Eléctricas</h4>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">Voltaje</label>
              <input 
                {...register('specs.voltage')}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm font-bold" 
                placeholder="110v / 220v"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">Consumo (W)</label>
              <input 
                {...register('specs.power')}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm font-bold" 
                placeholder="Ej: 65W"
              />
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Stock Inicial */}
        <div className="space-y-2">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Stock Inicial</label>
          <input
            type="number"
            {...register('stock', { valueAsNumber: true })}
            disabled={tipoSeleccionado === 'SERVICIO'}
            className="w-full px-4 py-4 bg-slate-50 border border-slate-100 rounded-[20px] text-sm font-bold outline-none focus:ring-4 focus:ring-blue-500/10 focus:bg-white focus:border-blue-500 transition-all disabled:opacity-30"
          />
        </div>

        {/* Stock Mínimo */}
        <div className="space-y-2">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Stock Mínimo</label>
          <input
            type="number"
            {...register('stockMinimo', { valueAsNumber: true })}
            disabled={tipoSeleccionado === 'SERVICIO'}
            className="w-full px-4 py-4 bg-slate-50 border border-slate-100 rounded-[20px] text-sm font-bold outline-none focus:ring-4 focus:ring-blue-500/10 focus:bg-white focus:border-blue-500 transition-all disabled:opacity-30"
          />
        </div>

        {/* Serie (Solo para Activos) */}
        <div className={`space-y-2 transition-all ${tipoSeleccionado !== 'ACTIVO' ? 'opacity-30' : ''}`}>
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Número de Serie</label>
          <div className="relative">
            <Hash className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              {...register('numeroSerie')}
              disabled={tipoSeleccionado !== 'ACTIVO'}
              className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-[20px] text-sm font-bold outline-none focus:ring-4 focus:ring-blue-500/10 focus:bg-white focus:border-blue-500 transition-all disabled:cursor-not-allowed"
              placeholder="SN-XXXXXXX"
            />
          </div>
        </div>
      </div>

      <div className="flex gap-4 pt-6">
        <button
          type="submit"
          disabled={mutation.isPending}
          className="flex-1 bg-blue-600 text-white font-black text-xs uppercase tracking-widest py-5 rounded-[24px] shadow-2xl shadow-blue-200 flex items-center justify-center gap-3 hover:bg-blue-700 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
        >
          {mutation.isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
          Guardar Registro en Sistema
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-10 py-5 bg-white border border-slate-200 text-slate-600 font-bold rounded-[24px] hover:bg-slate-50 transition-all flex items-center gap-2"
          >
            <X className="w-5 h-5" /> Cancelar
          </button>
        )}
      </div>
    </form>
  );
}
