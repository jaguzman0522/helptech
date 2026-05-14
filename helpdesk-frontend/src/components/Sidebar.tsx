import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Ticket, 
  Package, 
  Calendar as CalendarIcon, 
  BarChart3,
  Settings as SettingsIcon, 
  LogOut, 
  BrainCircuit,
  ChevronRight,
  User,
  X,
  Globe,
  MessageSquare,
  ShieldCheck,
  QrCode,
  Building2,
  ClipboardList
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const menuItems = [
  { icon: LayoutDashboard, label: 'Dashboard', href: '/dashboard' },
  { icon: Ticket, label: 'Tickets', href: '/dashboard/tickets' },
  { icon: MessageSquare, label: 'Mensajería', href: '/dashboard/messages' },
  { icon: Package, label: 'Inventario', href: '/dashboard/inventory' },
  { icon: QrCode, label: 'Consulta 360°', href: '/dashboard/assets/lookup' },
  { icon: CalendarIcon, label: 'Agenda', href: '/dashboard/calendar' },
  { icon: BarChart3, label: 'Reportes', href: '/dashboard/reports' },
  { icon: ShieldCheck, label: 'Accesos', href: '/dashboard/access' },
  { icon: ClipboardList, label: 'Rondas Técnicas', href: '/dashboard/rounds' },
  { icon: SettingsIcon, label: 'Configuración', href: '/dashboard/settings' },
  { icon: User, label: 'Perfil', href: '/dashboard/profile' },
];

const superAdminItems = [
  { icon: Globe, label: 'Panel Maestro', href: '/superadmin' },
  { icon: Building2, label: 'Empresas', href: '/superadmin/companies' },
];

export default function Sidebar() {
  const location = useLocation();
  const { logout, user } = useAuth();
  const [isOpen, setIsOpen] = React.useState(false);

  return (
    <>
      {/* Mobile Toggle Button */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="lg:hidden fixed top-4 right-4 z-[60] p-3 bg-blue-600 text-white rounded-2xl shadow-lg"
      >
        {isOpen ? <X className="w-6 h-6" /> : <LayoutDashboard className="w-6 h-6" />}
      </button>

      {/* Sidebar Container */}
      <div className={cn(
        "w-64 h-screen bg-white border-r border-slate-200 flex flex-col fixed left-0 top-0 z-50 transition-transform duration-300 lg:translate-x-0",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="p-6 flex items-center gap-3">
          <div className="p-2 bg-blue-600 rounded-lg shadow-lg shadow-blue-100">
            <BrainCircuit className="w-6 h-6 text-white" />
          </div>
          <span className="font-bold text-xl text-slate-900 tracking-tight">HelpDesk IA</span>
        </div>

      <nav className="flex-1 px-4 mt-4 space-y-1">
        {menuItems.map((item) => {
          const isActive = location.pathname === item.href;
          return (
            <Link
              key={item.href}
              to={item.href}
              className={cn(
                "flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 group",
                isActive 
                  ? "bg-blue-50 text-blue-600" 
                  : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
              )}
            >
              <div className="flex items-center gap-3">
                <item.icon className={cn("w-5 h-5", isActive ? "text-blue-600" : "text-slate-400 group-hover:text-slate-600")} />
                {item.label}
              </div>
              {isActive && <ChevronRight className="w-4 h-4" />}
            </Link>
          );
        })}

        {/* SuperAdmin Specific Section */}
        {user?.company_id === 1 && (
          <div className="pt-6 mt-6 border-t border-slate-100">
            <p className="px-4 mb-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">Administración Global</p>
            {superAdminItems.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.href}
                  to={item.href}
                  className={cn(
                    "flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 group",
                    isActive 
                      ? "bg-slate-900 text-white" 
                      : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <item.icon className={cn("w-5 h-5", isActive ? "text-white" : "text-slate-400 group-hover:text-slate-600")} />
                    {item.label}
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </nav>

      <div className="p-4 border-t border-slate-100">
        <div className="mb-4 px-4 py-3 bg-slate-50 rounded-xl">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Usuario</p>
          <p className="text-sm font-bold text-slate-900 truncate">{user?.full_name || 'Cargando...'}</p>
          <p className="text-[10px] text-slate-500 uppercase font-medium">{user?.role?.name || user?.role_name}</p>
        </div>
        
        <button
          onClick={logout}
          className="flex items-center gap-3 w-full px-4 py-3 text-sm font-medium text-red-500 hover:bg-red-50 rounded-xl transition-all duration-200"
        >
          <LogOut className="w-5 h-5" />
          Cerrar Sesión
        </button>
      </div>
    </div>
      
    {/* Overlay for mobile */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
}
