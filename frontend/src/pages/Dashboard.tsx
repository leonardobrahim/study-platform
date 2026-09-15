import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../services/api";
import type { DashboardData } from "../types/dashboard";
import { Clock, CheckSquare, BookOpen, TrendingUp, LogOut } from "lucide-react";

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
    return `${hours}h ${minutes}m`;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 text-indigo-600 font-bold">
        Carregando seus dados...
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div className="flex justify-between items-center bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Meu Painel</h1>
          <p className="text-gray-500">Resumo das suas atividades de estudo.</p>
        </div>
        <button className="flex items-center gap-2 text-gray-500 hover:text-red-600 transition-colors">
          <LogOut size={20} />
          Sair
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="bg-indigo-100 p-4 rounded-lg">
            <Clock className="w-8 h-8 text-indigo-600" />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">
              Tempo Total Estudado
            </p>
            <h2 className="text-3xl font-bold text-gray-900">
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
            <h2 className="text-3xl font-bold text-gray-900">
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
            <h2 className="text-3xl font-bold text-gray-900">
              {data.overall_progress_percentage}%
            </h2>
          </div>
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
              <div key={subject.subject_id} className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="font-medium text-gray-700">
                    {subject.name}
                  </span>
                  <span className="text-gray-500">
                    {subject.progress_percentage}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div
                    className="bg-indigo-600 h-2.5 rounded-full transition-all duration-500"
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
