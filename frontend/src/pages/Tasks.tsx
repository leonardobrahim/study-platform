import { useEffect, useState } from "react";
import { api } from "../services/api";
import type { Task } from "../types/task";
import { CheckCircle, Circle, Calendar, AlertCircle } from "lucide-react";

export function Tasks() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchTasks() {
      try {
        const response = await api.get("/tasks/");
        setTasks(response.data);
      } catch (error) {
        console.error("Erro ao buscar tarefas", error);
      } finally {
        setLoading(false);
      }
    }
    fetchTasks();
  }, []);

  const toggleTaskStatus = async (task: Task) => {
    const newStatus = task.status === "COMPLETED" ? "PENDING" : "COMPLETED";

    // Atualização otimista na tela
    setTasks(
      tasks.map((t) => (t.id === task.id ? { ...t, status: newStatus } : t)),
    );

    try {
      await api.patch(`/tasks/${task.id}`, { status: newStatus });
    } catch (error) {
      console.error("Erro ao atualizar tarefa", error);
      // Reverte em caso de erro
      setTasks(
        tasks.map((t) =>
          t.id === task.id ? { ...t, status: task.status } : t,
        ),
      );
    }
  };

  // Função para renderizar a etiqueta de prioridade com cores diferentes
  const renderPriorityBadge = (priority: string) => {
    switch (priority) {
      case "HIGH":
        return (
          <span className="flex items-center gap-1 bg-red-100 text-red-700 text-xs font-bold px-2 py-1 rounded-md">
            <AlertCircle size={14} /> Alta
          </span>
        );
      case "MEDIUM":
        return (
          <span className="bg-yellow-100 text-yellow-700 text-xs font-bold px-2 py-1 rounded-md">
            Média
          </span>
        );
      case "LOW":
        return (
          <span className="bg-blue-100 text-blue-700 text-xs font-bold px-2 py-1 rounded-md">
            Baixa
          </span>
        );
      default:
        return null;
    }
  };

  if (loading)
    return (
      <div className="text-indigo-600 font-bold">Carregando tarefas...</div>
    );

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Tarefas</h1>
          <p className="text-gray-500">
            Acompanhe seus exercícios, trabalhos e metas de estudo.
          </p>
        </div>
      </div>

      <div className="space-y-3">
        {tasks.length === 0 ? (
          <div className="bg-white p-8 rounded-xl border border-gray-100 text-center">
            <p className="text-gray-500">
              Você não tem nenhuma tarefa cadastrada ainda.
            </p>
          </div>
        ) : (
          tasks.map((task) => {
            const isCompleted = task.status === "COMPLETED";

            return (
              <button
                key={task.id}
                onClick={() => toggleTaskStatus(task)}
                className={`w-full text-left flex items-start gap-4 p-4 rounded-xl border transition-all cursor-pointer group ${
                  isCompleted
                    ? "bg-gray-50 border-gray-200 opacity-75 hover:opacity-100 hover:bg-gray-100"
                    : "bg-white border-gray-200 shadow-sm hover:border-indigo-300 hover:shadow-md"
                }`}
              >
                {/* Ícone de Check */}
                <div className="flex-shrink-0 mt-1 text-gray-400 transition-colors">
                  {isCompleted ? (
                    <CheckCircle
                      className="text-green-500 group-hover:text-green-600"
                      size={24}
                    />
                  ) : (
                    <Circle className="group-hover:text-indigo-500" size={24} />
                  )}
                </div>

                {/* Conteúdo da Tarefa */}
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-1">
                    <p
                      className={`font-bold text-lg transition-colors ${
                        isCompleted
                          ? "text-gray-500 line-through"
                          : "text-gray-900 group-hover:text-indigo-700"
                      }`}
                    >
                      {task.title}
                    </p>
                    {!isCompleted && renderPriorityBadge(task.priority)}
                  </div>

                  {task.description && (
                    <p
                      className={`text-sm mb-3 ${isCompleted ? "text-gray-400" : "text-gray-600"}`}
                    >
                      {task.description}
                    </p>
                  )}

                  {/* Informações Extras (Data, Duração) */}
                  <div className="flex items-center gap-4 text-xs font-medium text-gray-500">
                    {task.due_date && (
                      <span className="flex items-center gap-1">
                        <Calendar size={14} />
                        Prazo:{" "}
                        {new Date(task.due_date).toLocaleDateString("pt-BR")}
                      </span>
                    )}
                    {task.estimated_duration && (
                      <span className="bg-gray-100 px-2 py-1 rounded">
                        ⏱ {task.estimated_duration} min
                      </span>
                    )}
                  </div>
                </div>
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}
