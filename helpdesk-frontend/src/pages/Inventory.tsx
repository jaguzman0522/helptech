import React, { useState } from 'react';
import { Package, Plus, Search, Filter, ArrowUpRight, ArrowDownLeft, Settings, History, Tag, ShoppingCart, Edit, QrCode } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { API_URL } from '../api/config';
import { useAuth } from '../context/AuthContext';
import NuevoProductoForm from '../components/inventory/NuevoProductoForm';
import MovementModal from '../components/inventory/MovementModal';
import PurchaseOrderForm from '../components/inventory/PurchaseOrderForm';

export default function Inventory() {
  const { token, hasPermission } = useAuth();
  const [showNewForm, setShowNewForm] = useState(false);
  const [showPOForm, setShowPOForm] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);

  const { data: products, isLoading } = useQuery({
    queryKey: ['products'],
    queryFn: async () => {
      const res = await axios.get(`${API_URL}/inventory/`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return res.data;
    }
  });

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Inventario y Activos</h1>
          <p className="text-slate-500 mt-1">Gestiona productos, repuestos y activos fijos de la empresa.</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setShowPOForm(true)}
            className="flex items-center gap-2 bg-slate-900 text-white px-6 py-3 rounded-2xl font-bold shadow-lg shadow-slate-200 hover:bg-black transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <ShoppingCart className="w-5 h-5 text-emerald-400" /> Nueva Orden
          </button>
          <button 
            onClick={() => setShowNewForm(true)}
            className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-2xl font-bold shadow-lg shadow-blue-100 hover:bg-blue-700 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <Plus className="w-5 h-5" /> Registrar Producto
          </button>
        </div>
      </div>

      {showNewForm ? (
        <div className="max-w-4xl mx-auto">
          <NuevoProductoForm 
            onSuccess={() => setShowNewForm(false)} 
            onCancel={() => setShowNewForm(false)} 
          />
        </div>
      ) : showPOForm ? (
        <PurchaseOrderForm 
          onSuccess={() => setShowPOForm(false)} 
          onCancel={() => setShowPOForm(false)} 
        />
      ) : (
        <>
          {/* Stats Summary */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 bg-white rounded-3xl border border-slate-100 shadow-sm flex items-center gap-4">
              <div className="p-4 bg-emerald-50 rounded-2xl">
                <Package className="w-6 h-6 text-emerald-600" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-500 uppercase tracking-wider">Total Productos</p>
                <p className="text-2xl font-black text-slate-900">{products?.length || 0}</p>
              </div>
            </div>
            <div className="p-6 bg-white rounded-3xl border border-slate-100 shadow-sm flex items-center gap-4">
              <div className="p-4 bg-amber-50 rounded-2xl">
                <ArrowDownLeft className="w-6 h-6 text-amber-600" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-500 uppercase tracking-wider">Stock Bajo</p>
                <p className="text-2xl font-black text-slate-900">
                  {products?.filter((p: any) => p.stock <= p.stock_minimo).length || 0}
                </p>
              </div>
            </div>
            <div className="p-6 bg-white rounded-3xl border border-slate-100 shadow-sm flex items-center gap-4">
              <div className="p-4 bg-blue-50 rounded-2xl">
                <ArrowUpRight className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-500 uppercase tracking-wider">Categorías</p>
                <p className="text-2xl font-black text-slate-900">3</p>
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-50 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input 
                  type="text" 
                  placeholder="Buscar por nombre, código o serie..." 
                  className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-100 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                />
              </div>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/50">
                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Producto</th>
                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Tipo</th>
                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Stock Actual</th>
                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {products?.map((product: any) => (
                    <tr key={product.id} className="hover:bg-slate-50/50 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-slate-100 rounded-lg group-hover:bg-white transition-colors">
                            <Tag className="w-4 h-4 text-slate-400" />
                          </div>
                          <div>
                            <p className="text-sm font-bold text-slate-900">{product.name}</p>
                            <p className="text-[10px] text-slate-400 font-medium">{product.code}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-2 py-1 bg-slate-100 text-slate-600 text-[10px] font-bold rounded-md uppercase">
                          {product.type}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full font-bold text-sm ${
                          product.stock <= product.stock_minimo 
                            ? 'bg-red-50 text-red-600' 
                            : 'bg-emerald-50 text-emerald-600'
                        }`}>
                          {product.stock}
                          <span className="text-[10px] opacity-60">u.</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          {hasPermission('inventario', 'editar') && (
                            <button 
                              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                              title="Editar Activo"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                          )}
                          
                          {hasPermission('inventario', 'movimientos') && (
                            <button 
                              onClick={() => setSelectedProduct(product)}
                              className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all"
                              title="Registrar Movimiento"
                            >
                              <History className="w-4 h-4" />
                            </button>
                          )}

                          {hasPermission('inventario', 'qr') && (
                            <button 
                              className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-all"
                              title="Generar Etiqueta QR"
                            >
                              <QrCode className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                  {products?.length === 0 && (
                    <tr>
                      <td colSpan={4} className="p-12 text-center">
                        <div className="inline-flex p-6 bg-slate-50 rounded-full mb-4">
                          <Package className="w-12 h-12 text-slate-300" />
                        </div>
                        <h3 className="text-lg font-bold text-slate-900">No hay productos registrados</h3>
                        <p className="text-slate-500 mt-1 max-w-sm mx-auto">Comienza por añadir tu primer activo o repuesto al sistema.</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {selectedProduct && (
        <MovementModal 
          productoId={selectedProduct.id}
          productoNombre={selectedProduct.name}
          stockActual={selectedProduct.stock}
          onSuccess={() => setSelectedProduct(null)}
          onCancel={() => setSelectedProduct(null)}
        />
      )}
    </div>
  );
}
