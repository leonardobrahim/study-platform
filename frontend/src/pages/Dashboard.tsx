import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../services/api";
import type { DashboardData } from "../types/dashboard";
import { Clock, CheckSquare, BookOpen, TrendingUp, LogOut, CalendarCheck } from "lucide-react";
import { 
  PieChart, Pie, Cell, Tooltip as RechartsTooltip, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend
} from 'recharts';

export function Dashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchDashboard() {
      try {
        const response = await api.get("/dashboard/");
        setData(response.data);
      } catch (error) {
        console.error("Erro ao carregar dashboard", error);
        localStorage.removeItem("@StudyPlatform:token");
        navigate("/login");
      } finally {
        setLoading(false);
      }
    }
    fetchDashboard();
  }, [navigate]);

  const formatTime = (totalSeconds: number) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 text-indigo-600 font-bold">
        Carregando seus dados...
      </div>
    );
  }

  if (!data) return null;

  // Prepare data for Pie Chart
  const pieData = data.study_time_by_subject.map(item => ({
    name: item.subject_name,
    value: Math.floor(item.time_seconds / 60), // em minutos
    seconds: item.time_seconds,
    color: item.color || '#4f46e5'
  }));

  // Prepare data for Bar Chart
  const barData = data.study_time_last_7_days.map(item => ({
    name: item.date,
    value: Math.floor(item.time_seconds / 60), // em minutos
    seconds: item.time_seconds
  }));

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500 pb-12">
      <div className="flex justify-between items-center bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Meu Painel</h1>
          <p className="text-gray-500">Acompanhe seu desempenho e estatísticas de estudo.</p>
        </div>
        <button 
          onClick={() => {
            localStorage.removeItem("@StudyPlatform:token");
            navigate("/login");
          }}
          className="flex items-center gap-2 text-gray-500 hover:text-red-600 transition-colors"
        >
          <LogOut size={20} />
          Sair
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="bg-indigo-100 p-4 rounded-lg">
            <Clock className="w-8 h-8 text-indigo-600" />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">
              Tempo Estudado
            </p>
            <h2 className="text-2xl font-bold text-gray-900">
              {formatTime(data.total_time_studied_seconds)}
            </h2>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="bg-green-100 p-4 rounded-lg">
            <CheckSquare className="w-8 h-8 text-green-600" />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">
              Tarefas Pendentes
            </p>
            <h2 className="text-2xl font-bold text-gray-900">
              {data.pending_tasks_count}
            </h2>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="bg-purple-100 p-4 rounded-lg">
            <TrendingUp className="w-8 h-8 text-purple-600" />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Progresso Geral</p>
            <h2 className="text-2xl font-bold text-gray-900">
              {data.overall_progress_percentage}%
            </h2>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="bg-orange-100 p-4 rounded-lg">
            <CalendarCheck className="w-8 h-8 text-orange-600" />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Revisões para Hoje</p>
            <h2 className="text-2xl font-bold text-gray-900 flex items-end gap-2">
              {data.reviews_summary.pending_today}
              {data.reviews_summary.overdue > 0 && (
                <span className="text-xs text-red-500 font-semibold mb-1">
                  +{data.reviews_summary.overdue} atrasadas
                </span>
              )}
            </h2>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gráfico de Pizza - Tempo por Disciplina */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col justify-between">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-lg font-bold text-gray-900">Tempo por Disciplina</h3>
            <span className="text-xs text-gray-400 font-medium">
              {pieData.length} {pieData.length === 1 ? "disciplina" : "disciplinas"} com tempo
            </span>
          </div>

          {pieData.length === 0 ? (
            <div className="flex items-center justify-center h-64 text-gray-400">
              Nenhum tempo registrado ainda.
            </div>
          ) : (
            <>
              <div className="h-60">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={75}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <RechartsTooltip 
                      formatter={(value: any, name: any) => [
                        formatTime(Number(value) * 60),
                        name
                      ]}
                    />
                    <Legend 
                      verticalAlign="bottom" 
                      iconType="circle"
                      iconSize={8}
                      formatter={(value) => (
                        <span className="text-xs text-gray-700 font-medium mr-2">{value}</span>
                      )}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Legenda detalhada com chips de tempo */}
              <div className="mt-4 pt-3 border-t border-gray-100 flex flex-wrap gap-2">
                {pieData.map((entry, index) => (
                  <div 
                    key={index} 
                    className="flex items-center gap-1.5 text-xs bg-gray-50 hover:bg-gray-100 px-2.5 py-1 rounded-lg border border-gray-100 transition-colors"
                  >
                    <span 
                      className="w-2.5 h-2.5 rounded-full flex-shrink-0 shadow-xs" 
                      style={{ backgroundColor: entry.color }} 
                    />
                    <span className="font-semibold text-gray-800">{entry.name}:</span>
                    <span className="text-gray-500 font-medium">{formatTime(entry.seconds)}</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Gráfico de Barras - Ritmo Semanal */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col justify-between">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-lg font-bold text-gray-900">Ritmo de Estudos (Últimos 7 dias)</h3>
            <span className="text-xs text-gray-400 font-medium">tempo diário</span>
          </div>

          <div className="h-60">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 12}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 12}} />
                <RechartsTooltip 
                  cursor={{fill: '#f3f4f6'}}
                  formatter={(value: any) => [formatTime(Number(value) * 60), 'Tempo Estudado']}
                />
                <Bar dataKey="value" fill="#4f46e5" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-4 pt-3 border-t border-gray-100 text-xs text-gray-400 text-center">
            Mantenha a frequência de estudos para não quebrar sua sequência!
          </div>
        </div>
      </div>

      {/* Progresso por Disciplina */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <div className="flex items-center gap-2 mb-6">
          <BookOpen className="text-indigo-600" />
          <h3 className="text-lg font-bold text-gray-900">
            Progresso por Disciplina
          </h3>
        </div>

        {data.subjects_progress.length === 0 ? (
          <p className="text-gray-500">Nenhuma disciplina cadastrada ainda.</p>
        ) : (
          <div className="space-y-4">
            {data.subjects_progress.map((subject) => (
              <div key={subject.subject_id} className="space-y-1.5">
                <div className="flex justify-between items-center text-sm">
                  <div className="flex items-center gap-2.5">
                    {/* Badge de cor da disciplina (sempre visível, mesmo com 0% de progresso) */}
                    <span
                      className="w-3.5 h-3.5 rounded-full flex-shrink-0 shadow-xs border border-black/10"
                      style={{ backgroundColor: subject.color || "#4f46e5" }}
                      title={`Cor: ${subject.name}`}
                    />
                    <span className="font-semibold text-gray-800">
                      {subject.name}
                    </span>
                  </div>
                  <span className="text-gray-500 font-semibold text-xs">
                    {subject.progress_percentage}%
                  </span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
                  <div
                    className="h-2.5 rounded-full transition-all duration-500"
                    style={{
                      width: `${subject.progress_percentage}%`,
                      backgroundColor: subject.color || "#4f46e5",
                    }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
