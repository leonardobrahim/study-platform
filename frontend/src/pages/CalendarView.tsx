import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Clock, BookOpen, Award, CheckSquare } from "lucide-react";
import { calendarService } from "../services/calendarService";
import type { CalendarEvent } from "../types/calendar";

export function CalendarView() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);

  // Constants
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = new Date(year, month, 1).getDay(); // 0 is Sunday

  useEffect(() => {
    async function fetchEvents() {
      try {
        setLoading(true);
        // We fetch a generous range, from beginning of month to end of month
        const start = new Date(year, month, 1);
        const end = new Date(year, month + 1, 0, 23, 59, 59);
        const fetchedEvents = await calendarService.getEvents(start.toISOString(), end.toISOString());
        setEvents(fetchedEvents);
      } catch (error) {
        console.error("Erro ao carregar eventos do calendário:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchEvents();
  }, [year, month]);

  const handlePrevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const handleNextMonth = () => setCurrentDate(new Date(year, month + 1, 1));
  const handleToday = () => setCurrentDate(new Date());

  const monthNames = [
    "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
    "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
  ];
  const weekDays = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

  // Prepare grid cells
  const daysArray = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const blanksArray = Array.from({ length: firstDayOfMonth }, (_, i) => i);

  // Helper to group events by day
  const eventsByDay = (day: number) => {
    return events.filter(e => {
      const eDate = new Date(e.date);
      return eDate.getDate() === day && eDate.getMonth() === month && eDate.getFullYear() === year;
    });
  };

  const getEventIcon = (type: string) => {
    switch (type) {
      case "TASK": return <CheckSquare size={12} />;
      case "SESSION": return <Clock size={12} />;
      case "ASSESSMENT": return <Award size={12} />;
      default: return <BookOpen size={12} />;
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12">
      {/* Header */}
      <div className="flex justify-between items-center bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <div className="flex items-center gap-3">
          <div className="bg-indigo-100 p-3 rounded-lg text-indigo-600">
            <CalendarIcon size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Calendário</h1>
            <p className="text-gray-500">Acompanhe suas Tarefas, Provas e Sessões.</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <button 
            onClick={handleToday}
            className="px-4 py-2 text-sm font-medium text-indigo-600 bg-indigo-50 rounded-lg hover:bg-indigo-100 transition"
          >
            Hoje
          </button>
          <div className="flex items-center gap-2 bg-gray-100 rounded-lg p-1">
            <button onClick={handlePrevMonth} className="p-2 hover:bg-white rounded-md transition text-gray-600">
              <ChevronLeft size={20} />
            </button>
            <span className="w-32 text-center font-semibold text-gray-800">
              {monthNames[month]} {year}
            </span>
            <button onClick={handleNextMonth} className="p-2 hover:bg-white rounded-md transition text-gray-600">
              <ChevronRight size={20} />
            </button>
          </div>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {/* Days of week header */}
        <div className="grid grid-cols-7 border-b border-gray-200 bg-gray-50">
          {weekDays.map(day => (
            <div key={day} className="py-3 text-center text-sm font-semibold text-gray-600">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar body */}
        <div className="grid grid-cols-7 min-h-[600px]">
          {blanksArray.map(blank => (
            <div key={`blank-${blank}`} className="border-r border-b border-gray-100 bg-gray-50/50 p-2 min-h-[120px]" />
          ))}

          {daysArray.map(day => {
            const dayEvents = eventsByDay(day);
            const isToday = day === new Date().getDate() && month === new Date().getMonth() && year === new Date().getFullYear();
            
            return (
              <div key={day} className="border-r border-b border-gray-100 p-2 min-h-[120px] transition-colors hover:bg-gray-50/50">
                <div className="flex justify-between items-start mb-2">
                  <span className={`w-7 h-7 flex items-center justify-center rounded-full text-sm font-medium ${
                    isToday ? "bg-indigo-600 text-white" : "text-gray-700"
                  }`}>
                    {day}
                  </span>
                </div>
                
                <div className="space-y-1.5 mt-1 overflow-y-auto max-h-[150px] pr-1 custom-scrollbar">
                  {dayEvents.map(event => (
                    <div 
                      key={event.id} 
                      className="text-xs p-1.5 rounded-md flex flex-col gap-1 shadow-sm border opacity-95 hover:opacity-100 transition"
                      style={{ 
                        backgroundColor: event.color ? `${event.color}15` : '#f3f4f6', 
                        borderColor: event.color ? `${event.color}40` : '#e5e7eb',
                        color: event.color || '#374151',
                        borderLeftWidth: '3px',
                        borderLeftColor: event.color || '#9ca3af'
                      }}
                      title={event.title}
                    >
                      <div className="flex items-center gap-1 font-semibold truncate">
                        {getEventIcon(event.type)}
                        <span className="truncate">{event.title}</span>
                      </div>
                      <div className="flex items-center justify-between text-[10px] opacity-80">
                        <span>
                          {new Date(event.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                        </span>
                        {event.type === 'TASK' && event.status === 'COMPLETED' && (
                          <span className="bg-green-500 text-white px-1 rounded-sm">Feito</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
