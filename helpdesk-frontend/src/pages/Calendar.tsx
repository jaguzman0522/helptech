import React, { useState } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  Calendar as CalendarIcon, 
  Clock, 
  Settings, 
  AlertCircle,
  Plus,
  Users,
  Search,
  CheckCircle2
} from 'lucide-react';
import { 
  format, 
  addMonths, 
  subMonths, 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek, 
  isSameMonth, 
  isSameDay, 
  addDays, 
  eachDayOfInterval 
} from 'date-fns';
import { es } from 'date-fns/locale';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

export default function Calendar() {
  const { token } = useAuth();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());

  const { data: events, isLoading } = useQuery({
    queryKey: ['calendar-events', format(currentMonth, 'yyyy-MM')],
    queryFn: async () => {
      const res = await axios.get('http://localhost:8001/api/v1/calendar/', {
        headers: { Authorization: `Bearer ${token}` }
      });
      return res.data;
    }
  });

  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
  const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));

  // Calendar Logic
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart);
  const endDate = endOfWeek(monthEnd);
  const calendarDays = eachDayOfInterval({ start: startDate, end: endDate });

  const getEventsForDay = (day: Date) => {
    if (!events) return [];
    return events.filter((event: any) => {
      try {
        const eventDate = new Date(event.start_time);
        return isSameDay(eventDate, day);
      } catch (e) {
        return false;
      }
    });
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-blue-600 rounded-2xl shadow-lg shadow-blue-100">
            <CalendarIcon className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Agenda Corporativa</h1>
            <p className="text-sm text-slate-500 font-medium">Gestiona mantenimientos y eventos de {format(currentMonth, 'MMMM yyyy', { locale: es })}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 bg-slate-50 p-1.5 rounded-2xl border border-slate-100">
          <button onClick={prevMonth} className="p-2 hover:bg-white hover:shadow-sm rounded-xl transition-all">
            <ChevronLeft className="w-5 h-5 text-slate-600" />
          </button>
          <span className="px-4 text-sm font-black text-slate-700 min-w-[140px] text-center capitalize">
            {format(currentMonth, 'MMMM yyyy', { locale: es })}
          </span>
          <button onClick={nextMonth} className="p-2 hover:bg-white hover:shadow-sm rounded-xl transition-all">
            <ChevronRight className="w-5 h-5 text-slate-600" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
        {/* Main Calendar Grid */}
        <div className="xl:col-span-3 bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="grid grid-cols-7 bg-slate-50 border-b border-slate-100">
            {['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'].map(day => (
              <div key={day} className="py-4 text-center text-[10px] font-black text-slate-400 uppercase tracking-widest">
                {day}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7">
            {calendarDays.map((day, idx) => {
              const dayEvents = getEventsForDay(day);
              const isCurrentMonth = isSameMonth(day, monthStart);
              const isToday = isSameDay(day, new Date());

              return (
                <div 
                  key={idx}
                  className={`min-h-[120px] p-2 border-r border-b border-slate-50 transition-all ${
                    !isCurrentMonth ? 'bg-slate-50/30' : 'bg-white hover:bg-slate-50/50 cursor-pointer'
                  }`}
                  onClick={() => setSelectedDate(day)}
                >
                  <div className="flex justify-between items-center mb-2">
                    <span className={`text-xs font-bold w-7 h-7 flex items-center justify-center rounded-full ${
                      isToday ? 'bg-blue-600 text-white shadow-lg shadow-blue-100' : 
                      isCurrentMonth ? 'text-slate-900' : 'text-slate-300'
                    }`}>
                      {format(day, 'd')}
                    </span>
                    {dayEvents.length > 0 && (
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
                    )}
                  </div>
                  <div className="space-y-1">
                    {dayEvents.slice(0, 3).map((event: any) => (
                      <div 
                        key={event.id}
                        className={`px-2 py-1 rounded-lg text-[9px] font-bold truncate border shadow-sm ${
                          event.type === 'MANTENIMIENTO' 
                            ? 'bg-amber-50 border-amber-100 text-amber-700' 
                            : 'bg-blue-50 border-blue-100 text-blue-700'
                        }`}
                      >
                        {event.title}
                      </div>
                    ))}
                    {dayEvents.length > 3 && (
                      <p className="text-[8px] text-slate-400 font-bold pl-1">+{dayEvents.length - 3} más...</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Sidebar: Event Details / Upcoming */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
            <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-4 flex items-center gap-2">
              <Clock className="w-4 h-4 text-blue-600" /> Eventos del Día
            </h3>
            <p className="text-xs text-slate-500 mb-6 font-medium">
              {format(selectedDate, "eeee, d 'de' MMMM", { locale: es })}
            </p>
            
            <div className="space-y-4">
              {getEventsForDay(selectedDate).length > 0 ? (
                getEventsForDay(selectedDate).map((event: any) => (
                  <div key={event.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-100 group hover:border-blue-200 transition-all cursor-pointer">
                    <div className="flex items-center gap-2 mb-2">
                      <div className={`w-2 h-2 rounded-full ${
                        event.priority === 'ALTA' ? 'bg-red-500' : 'bg-blue-500'
                      }`} />
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">{event.type}</span>
                    </div>
                    <p className="text-sm font-bold text-slate-900 group-hover:text-blue-600 transition-colors">{event.title}</p>
                    <div className="flex items-center gap-2 mt-3 text-slate-500">
                      <Clock className="w-3.5 h-3.5" />
                      <span className="text-[11px] font-medium">{format(new Date(event.start_time), 'HH:mm')}</span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-12 text-center">
                  <div className="p-4 bg-slate-50 rounded-full inline-block mb-3">
                    <CheckCircle2 className="w-8 h-8 text-slate-300" />
                  </div>
                  <p className="text-sm font-bold text-slate-900">Día sin eventos</p>
                  <p className="text-xs text-slate-400 mt-1">No hay tareas programadas.</p>
                </div>
              )}
            </div>
            
            <button className="w-full mt-6 py-3 bg-slate-900 text-white rounded-xl text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-black transition-all">
              <Plus className="w-4 h-4" /> Crear Evento
            </button>
          </div>

          {/* Quick Filters / Legends */}
          <div className="p-6 bg-slate-900 rounded-3xl text-white">
            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Leyenda</h4>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-amber-400" />
                <span className="text-xs font-bold">Mantenimiento</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-blue-400" />
                <span className="text-xs font-bold">Reunión / Capacitación</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-red-500" />
                <span className="text-xs font-bold">Prioridad Alta</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
