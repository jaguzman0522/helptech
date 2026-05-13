import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { 
  Package, 
  Plus, 
  Minus, 
  Search, 
  X, 
  Save, 
  Loader2,
  AlertTriangle
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';

export default function MaterialConsumptionModal({ ticketId, onClose }: { ticketId: number, onClose: () => void }) {
  const { token } = useAuth();
  const { showNotification } = useNotification();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [quantity, setQuantity] = useState(1);

  const { data: products, isLoading } = useQuery({
    queryKey: ['inventory-products'],
    queryFn: async () => {
      const res = await axios.get('http://localhost:8001/api/v1/inventory/', {
        headers: { Authorization: `Bearer ${token}` }
      });
      return res.data;
    }
  });

  const mutation = useMutation({
    mutationFn: (data: any) => {
      return axios.post('http://localhost:8001/api/v1/inventory/movements', data, {
        headers: { Authorization: `Bearer ${token}` }
      });
    },
    onSuccess: () => {
      showNotification('success', 'Material Consumido', 'El stock se ha actualizado y el costo se ha cargado al ticket.');
      queryClient.invalidateQueries({ queryKey: ['ticket', ticketId] });
      queryClient.invalidateQueries({ queryKey: ['inventory-products'] });
      onClose();
    }
  });

  const filteredProducts = products?.filter((p: any) => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.barcode?.includes(searchTerm)
  );

  const handleConsume = () => {
    if (!selectedProduct) return;
    mutation.mutate({
      product_id: selectedProduct.id,
      quantity: quantity,
      type: 'OUT',
      reason: `Consumo en Ticket #${ticketId}`,
      ticket_id: ticketId,
      warehouse_id: 1 // Default warehouse for now
    });
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-600 rounded-xl">
              <Package className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900">Consumir Material</h3>
              <p className="text-xs text-slate-500">Asignar repuestos al Ticket #{ticketId}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white rounded-xl transition-all">
            <X className="w-5 h-5 text-slate-400" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Search */}
          {!selectedProduct ? (
            <div className="space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input 
                  autoFocus
                  placeholder="Buscar por nombre o código de barras..."
                  className="w-full pl-10 pr-4 py-3 rounded-2xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none text-sm font-medium"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="max-h-60 overflow-y-auto space-y-2 pr-2">
                {filteredProducts?.map((p: any) => (
                  <button
                    key={p.id}
                    onClick={() => setSelectedProduct(p)}
                    className="w-full flex items-center justify-between p-3 rounded-xl border border-slate-100 hover:border-blue-200 hover:bg-blue-50/30 transition-all text-left group"
                  >
                    <div>
                      <p className="text-sm font-bold text-slate-900 group-hover:text-blue-600 transition-colors">{p.name}</p>
                      <p className="text-[10px] text-slate-400 uppercase font-black tracking-wider">{p.barcode}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-bold text-slate-700">{p.stock} disp.</p>
                      <p className="text-[10px] text-emerald-600 font-bold">${p.cost}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
              <div className="p-4 bg-blue-50 rounded-2xl border border-blue-100 flex items-center justify-between">
                <div>
                  <p className="text-xs font-black text-blue-600 uppercase tracking-widest mb-1">Producto Seleccionado</p>
                  <p className="font-bold text-slate-900">{selectedProduct.name}</p>
                </div>
                <button onClick={() => setSelectedProduct(null)} className="text-xs font-bold text-blue-600 hover:underline">Cambiar</button>
              </div>

              <div className="space-y-3">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Cantidad a utilizar</label>
                <div className="flex items-center gap-4">
                  <button 
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="p-3 bg-slate-100 rounded-xl hover:bg-slate-200 transition-all"
                  >
                    <Minus className="w-5 h-5" />
                  </button>
                  <div className="flex-1 text-center py-3 bg-white border border-slate-200 rounded-xl text-xl font-black">
                    {quantity}
                  </div>
                  <button 
                    onClick={() => setQuantity(Math.min(selectedProduct.stock, quantity + 1))}
                    className="p-3 bg-slate-100 rounded-xl hover:bg-slate-200 transition-all"
                  >
                    <Plus className="w-5 h-5" />
                  </button>
                </div>
                {quantity >= selectedProduct.stock && (
                  <p className="text-[10px] text-amber-600 font-bold flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3" /> Stock máximo alcanzado
                  </p>
                )}
              </div>

              <div className="pt-4 flex gap-3">
                <button 
                  onClick={handleConsume}
                  disabled={mutation.isPending}
                  className="flex-1 bg-slate-900 text-white py-4 rounded-2xl font-bold hover:bg-black transition-all flex items-center justify-center gap-2"
                >
                  {mutation.isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                  Confirmar Consumo
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
