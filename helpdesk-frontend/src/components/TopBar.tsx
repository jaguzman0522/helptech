import React, { useState } from 'react';
import { 
  Bell, 
  Globe, 
  Search, 
  Menu,
  ChevronDown,
  Mail,
  User as UserIcon,
  Settings as SettingsIcon
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function TopBar() {
  const { user } = useAuth();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showLanguage, setShowLanguage] = useState(false);
  const [language, setLanguage] = useState('ES');

  const notifications = [
    { id: 1, title: 'Nuevo Ticket', message: 'Se ha asignado un nuevo ticket #TK-102', time: '5m' },
    { id: 2, title: 'Mensaje nuevo', message: 'El técnico ha respondido a tu consulta', time: '1h' },
  ];

  return (
    <header className="h-20 bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-40 px-8 flex items-center justify-between">
      <div className="flex items-center gap-4 flex-1">
        <div className="relative max-w-md w-full hidden md:block">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input 
            type="text" 
            placeholder="Buscar en el sistema..." 
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-blue-500 transition-all"
          />
        </div>
      </div>

      <div className="flex items-center gap-2 lg:gap-6">
        {/* Language Selector */}
        <div className="relative">
          <button 
            onClick={() => setShowLanguage(!showLanguage)}
            className="flex items-center gap-2 px-3 py-2 hover:bg-slate-50 rounded-xl transition-colors"
          >
            <Globe className="w-5 h-5 text-slate-500" />
            <span className="text-sm font-bold text-slate-700">{language}</span>
            <ChevronDown className="w-4 h-4 text-slate-400" />
          </button>

          {showLanguage && (
            <div className="absolute right-0 mt-2 w-32 bg-white rounded-2xl shadow-2xl border border-slate-100 p-2 animate-in fade-in zoom-in duration-200">
              {['ES', 'EN', 'FR'].map((lang) => (
                <button
                  key={lang}
                  onClick={() => { setLanguage(lang); setShowLanguage(false); }}
                  className="w-full text-left px-4 py-2 text-sm font-medium text-slate-600 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-colors"
                >
                  {lang === 'ES' ? 'Español' : lang === 'EN' ? 'English' : 'Français'}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Notifications */}
        <div className="relative">
          <button 
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2.5 hover:bg-blue-50 text-slate-500 hover:text-blue-600 rounded-xl transition-all relative group"
          >
            <Bell className="w-5 h-5" />
            <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden animate-in fade-in slide-in-from-top-4 duration-200">
              <div className="p-4 bg-slate-50 border-b border-slate-100 flex justify-between items-center">
                <span className="text-sm font-bold text-slate-900">Notificaciones</span>
                <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest bg-blue-100 px-2 py-0.5 rounded-full">2 Nuevas</span>
              </div>
              <div className="max-h-96 overflow-y-auto">
                {notifications.map((n) => (
                  <div key={n.id} className="p-4 border-b border-slate-50 hover:bg-slate-50 transition-colors cursor-pointer">
                    <p className="text-xs font-bold text-slate-900">{n.title}</p>
                    <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-2">{n.message}</p>
                    <p className="text-[10px] text-slate-400 mt-2 flex items-center gap-1 font-medium">
                      <Clock className="w-3 h-3" /> {n.time}
                    </p>
                  </div>
                ))}
              </div>
              <button className="w-full p-3 text-xs font-bold text-blue-600 hover:bg-blue-50 transition-colors border-t border-slate-100">
                Ver todas las notificaciones
              </button>
            </div>
          )}
        </div>

        <div className="h-8 w-px bg-slate-200 hidden lg:block"></div>

        {/* User Info */}
        <div className="flex items-center gap-3 pl-2">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-bold text-slate-900 leading-none">{user?.full_name}</p>
            <p className="text-[10px] font-bold text-blue-600 uppercase tracking-widest mt-1">{user?.role?.name || user?.role_name}</p>
          </div>
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-black shadow-lg shadow-blue-100">
            {user?.full_name?.charAt(0)}
          </div>
        </div>
      </div>
    </header>
  );
}

function Clock({ className }: { className?: string }) {
  return (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
  );
}
