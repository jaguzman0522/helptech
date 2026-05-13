import React, { useState, useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useMutation, useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { 
  ShoppingCart, 
  Plus, 
  Trash2, 
  DollarSign, 
  Truck, 
  Save, 
  X,
  Loader2,
  Calculator
} from 'lucide-react';
import { useNotification } from '../../context/NotificationContext';
import { useAuth } from '../../context/AuthContext';

const poSchema = z.object({
  proveedorId: z.number().min(1, 'El proveedor es obligatorio'),
  items: z.array(z.object({
    id: z.number(),
    nombre: z.string(),
    cantidad: z.number().min(1, 'Mínimo 1'),
    costo: z.number().min(0.01, 'Mínimo 0.01'),
  })).min(1, 'Debe añadir al menos un producto'),
});

type POFormData = z.infer<typeof poSchema>;

export default function PurchaseOrderForm({ onSuccess, onCancel }: { onSuccess?: () => void, onCancel?: () => void }) {
  const { token } = useAuth();
  const { showNotification } = useNotification();
  
  const { control, register, handleSubmit, watch, setValue, formState: { errors } } = useForm<POFormData>({
    resolver: zodResolver(poSchema),
    defaultValues: { items: [] }
  });

  const { fields, append, remove } = useFieldArray({ control, name: "items" });
  
  const items = watch('items');
  const total = items?.reduce((acc, item) => acc + (item.cantidad * item.costo), 0) || 0;

  // Fetch products for selection
  const { data: products } = useQuery({
    queryKey: ['products'],
    queryFn: async () => {
      const res = await axios.get('http://localhost:8001/api/v1/inventory/', {
        headers: { Authorization: `Bearer ${token}` }
      });
      return res.data;
    }
  });

  const mutation = useMutation({
    mutationFn: (data: POFormData) => {
      return axios.post('http://localhost:8001/api/v1/inventory/purchase-orders', { ...data, total }, {
        headers: { Authorization: `Bearer ${token}` }
      });
    },
    onSuccess: () => {
      showNotification('success', 'Orden de Compra Generada', 'La orden ha sido enviada al proveedor y está pendiente de recepción.');
      if (onSuccess) onSuccess();
    }
  });

  const handleAddProduct = (productId: number) => {
    const product = products?.find((p: any) => p.id === productId);
    if (product) {
      append({ id: product.id, nombre: product.name, cantidad: 1, costo: product.cost || 0 });
    }
  };

  return (
    <form onSubmit={handleSubmit((data) => mutation.mutate(data))} className="space-y-6 bg-white p-8 rounded-3xl border border-slate-100 shadow-xl max-w-4xl mx-auto">
      <div className="flex items-center justify-between border-b border-slate-50 pb-6">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-slate-900 rounded-2xl">
            <ShoppingCart className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-slate-900">Nueva Orden de Compra</h3>
            <p className="text-sm text-slate-500">Abastecimiento de repuestos y activos.</p>
          </div>
        </div>
        <button type="button" onClick={onCancel} className="p-2 hover:bg-slate-50 rounded-xl transition-all">
          <X className="w-5 h-5 text-slate-400" />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Proveedor</label>
          <div className="relative">
            <Truck className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <select
              {...register('proveedorId', { valueAsNumber: true })}
              className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none bg-white font-medium"
            >
              <option value="">Seleccionar Proveedor...</option>
              <option value="1">Proveedor de Prueba (Global Tech)</option>
            </select>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Añadir Producto</label>
          <select
            onChange={(e) => handleAddProduct(Number(e.target.value))}
            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none bg-slate-50 font-medium"
          >
            <option value="">Buscar en Inventario...</option>
            {products?.map((p: any) => (
              <option key={p.id} value={p.id}>{p.name} (Stock: {p.stock})</option>
            ))}
          </select>
        </div>
      </div>

      {/* Items Table */}
      <div className="border border-slate-100 rounded-2xl overflow-hidden">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-slate-50">
              <th className="px-4 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">Producto</th>
              <th className="px-4 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest w-24">Cant.</th>
              <th className="px-4 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest w-32">Costo Unit.</th>
              <th className="px-4 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest w-32">Subtotal</th>
              <th className="px-4 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest w-12"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {fields.map((field, index) => (
              <tr key={field.id} className="hover:bg-slate-50/50 transition-colors">
                <td className="px-4 py-4">
                  <p className="text-sm font-bold text-slate-900">{field.nombre}</p>
                </td>
                <td className="px-4 py-4">
                  <input
                    type="number"
                    {...register(`items.${index}.cantidad` as const, { valueAsNumber: true })}
                    className="w-full px-2 py-1.5 border border-slate-200 rounded-lg text-sm font-bold focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </td>
                <td className="px-4 py-4">
                  <div className="relative">
                    <DollarSign className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-400" />
                    <input
                      type="number"
                      step="0.01"
                      {...register(`items.${index}.costo` as const, { valueAsNumber: true })}
                      className="w-full pl-6 pr-2 py-1.5 border border-slate-200 rounded-lg text-sm font-bold focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>
                </td>
                <td className="px-4 py-4">
                  <p className="text-sm font-black text-slate-900">
                    ${((items[index]?.cantidad || 0) * (items[index]?.costo || 0)).toFixed(2)}
                  </p>
                </td>
                <td className="px-4 py-4">
                  <button type="button" onClick={() => remove(index)} className="text-red-300 hover:text-red-500 transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
            {fields.length === 0 && (
              <tr>
                <td colSpan={5} className="py-12 text-center text-slate-400 text-sm font-medium">
                  No hay productos en la orden. Usa el selector de arriba para añadir.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Footer / Total */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-6 pt-6 border-t border-slate-50">
        <div className="p-4 bg-blue-50 rounded-2xl flex items-center gap-4 border border-blue-100">
          <div className="p-2 bg-blue-600 rounded-xl">
            <Calculator className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest leading-none mb-1">Total de la Orden</p>
            <p className="text-2xl font-black text-blue-900">${total.toFixed(2)}</p>
          </div>
        </div>

        <button
          type="submit"
          disabled={mutation.isPending || fields.length === 0}
          className="w-full md:w-auto px-12 py-4 bg-slate-900 text-white font-bold rounded-2xl shadow-xl hover:bg-black transition-all flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {mutation.isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
          Generar Orden de Compra
        </button>
      </div>
    </form>
  );
}
