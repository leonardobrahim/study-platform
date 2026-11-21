import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { dashboardService } from "../services/dashboardService";
import type { DashboardData } from "../types/dashboard";
import { formatTimeShort } from "../utils/date";
import {
  Clock,
  CheckSquare,
  BookOpen,
  TrendingUp,
  CalendarCheck,
  Play,
  RefreshCw,
  Calendar,
  History,
} from "lucide-react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
} from "recharts";

export function Dashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchDashboard = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const summary = await dashboardService.getSummary();
      setData(summary);
    } catch {
      setError("Não foi possível carregar os dados do painel agora.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchDashboard();
  }, [fetchDashboard]);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center text-indigo-600 font-bold">
        Carregando seus dados...
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="max-w-md mx-auto mt-16 bg-white p-6 rounded-xl shadow-sm border border-gray-100 text-center space-y-4">
        <p className="text-gray-700 font-medium">
          {error || "Nenhum dado encontrado."}
        </p>
        <button
          onClick={() => void fetchDashboard()}
          className="inline-flex items-center gap-2 bg-indigo-600 text-white font-semibold px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors cursor-pointer"
        >
          <RefreshCw size={16} />
          Tentar novamente
        </button>
      </div>
    );
  }

  const pieData = data.study_time_by_subject.map((item) => ({
    name: item.subject_name,
    value: Math.floor(item.time_seconds / 60),
    seconds: item.time_seconds,
    color: item.color || "#4f46e5",
  }));

  const barData = data.study_time_last_7_days.map((item) => ({
    name: item.date,
    value: Math.floor(item.time_seconds / 60),
    seconds: item.time_seconds,
  }));

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Meu Painel</h1>
          <p className="text-gray-500">
            Acompanhe seu desempenho e estatísticas de estudo.
          </p>
        </div>
        <Link
          to="/timer"
          className="inline-flex items-center gap-2 bg-indigo-600 text-white font-semibold px-4 py-2.5 rounded-lg hover:bg-indigo-700 transition-colors"
        >
          <Play size={18} />
          Iniciar estudo
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="bg-indigo-100 p-4 rounded-lg">
            <Clock className="w-8 h-8 text-indigo-600" />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Tempo Estudado</p>
            <h2 className="text-2xl font-bold text-gray-900">
              {formatTimeShort(data.total_time_studied_seconds)}
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
            <p className="text-sm text-gray-500 font-medium">
              Revisões para Hoje
            </p>
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
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col justify-between">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-lg font-bold text-gray-900">
              Tempo por Disciplina
            </h3>
            <span className="text-xs text-gray-400 font-medium">
              {pieData.length}{" "}
              {pieData.length === 1 ? "disciplina" : "disciplinas"} com tempo
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
                      {pieData.map((entry) => (
                        <Cell key={entry.name} fill={entry.color} />
                      ))}
                    </Pie>
                    <RechartsTooltip
                      formatter={(value, name) => [
                        formatTimeShort(Number(value ?? 0) * 60),
                        String(name ?? ""),
                      ]}
                    />
                    <Legend
                      verticalAlign="bottom"
                      iconType="circle"
                      iconSize={8}
                      formatter={(value) => (
                        <span className="text-xs text-gray-700 font-medium mr-2">
                          {value}
                        </span>
                      )}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="mt-4 pt-3 border-t border-gray-100 flex flex-wrap gap-2">
                {pieData.map((entry) => (
                  <div
                    key={entry.name}
                    className="flex items-center gap-1.5 text-xs bg-gray-50 hover:bg-gray-100 px-2.5 py-1 rounded-lg border border-gray-100 transition-colors"
                  >
                    <span
                      className="w-2.5 h-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: entry.color }}
                    />
                    <span className="font-semibold text-gray-800">
                      {entry.name}:
                    </span>
                    <span className="text-gray-500 font-medium">
                      {formatTimeShort(entry.seconds)}
                    </span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col justify-between">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-lg font-bold text-gray-900">
              Ritmo de Estudos (Últimos 7 dias)
            </h3>
            <span className="text-xs text-gray-400 font-medium">
              tempo diário
            </span>
          </div>

          <div className="h-60">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={barData}
                margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#f3f4f6"
                />
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#9ca3af", fontSize: 12 }}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#9ca3af", fontSize: 12 }}
                  tickFormatter={(value) => {
                    const numericValue = Number(value);
                    const hours = Math.floor(numericValue / 60);
                    const mins = numericValue % 60;
                    if (hours > 0 && mins > 0) return `${hours}h ${mins}m`;
                    if (hours > 0) return `${hours}h`;
                    return `${mins}m`;
                  }}
                />
                <RechartsTooltip
                  cursor={{ fill: "#f3f4f6" }}
                  formatter={(value) => [
                    formatTimeShort(Number(value ?? 0) * 60),
                    "Tempo Estudado",
                  ]}
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <CheckSquare className="text-indigo-600" size={20} />
              <h3 className="text-lg font-bold text-gray-900">
                Próximas Tarefas
              </h3>
            </div>
            <Link
              to="/tasks"
              className="text-xs font-semibold text-indigo-600 hover:underline"
            >
              Ver todas
            </Link>
          </div>

          {data.next_tasks.length === 0 ? (
            <p className="text-sm text-gray-500">Nenhuma tarefa pendente.</p>
          ) : (
            <ul className="divide-y divide-gray-100">
              {data.next_tasks.map((task) => (
                <li
                  key={task.id}
                  className="py-3 flex items-center justify-between gap-3"
                >
                  <span className="text-sm font-medium text-gray-800 truncate">
                    {task.title}
                  </span>
                  {task.due_date && (
                    <span className="inline-flex items-center gap-1 text-xs text-gray-500 shrink-0">
                      <Calendar size={13} />
                      {new Date(task.due_date).toLocaleDateString("pt-BR")}
                    </span>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <History className="text-indigo-600" size={20} />
              <h3 className="text-lg font-bold text-gray-900">
                Sessões Recentes
              </h3>
            </div>
            <Link
              to="/sessions"
              className="text-xs font-semibold text-indigo-600 hover:underline"
            >
              Ver histórico
            </Link>
          </div>

          {data.recent_sessions.length === 0 ? (
            <p className="text-sm text-gray-500">
              Nenhuma sessão registrada ainda.
            </p>
          ) : (
            <ul className="divide-y divide-gray-100">
              {data.recent_sessions.map((session) => (
                <li
                  key={session.id}
                  className="py-3 flex items-center justify-between gap-3"
                >
                  <div>
                    <p className="text-sm font-semibold text-gray-800">
                      {session.subject_name}
                    </p>
                    <p className="text-xs text-gray-400">
                      {new Date(session.start_time).toLocaleDateString("pt-BR")}
                    </p>
                  </div>
                  <span className="text-sm font-bold text-indigo-600 shrink-0">
                    {session.duration
                      ? formatTimeShort(session.duration)
                      : "Em andamento"}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

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
                    <span
                      className="w-3.5 h-3.5 rounded-full shrink-0 border border-black/10"
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
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
