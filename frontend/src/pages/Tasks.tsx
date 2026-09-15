import { useEffect, useState } from "react";
import { api } from "../services/api";
import type { Task } from "../types/task";
import type { Subject, Topic } from "../types/subject";
import {
  CheckCircle,
  Circle,
  Calendar,
  AlertCircle,
  Plus,
  Pencil,
  X,
} from "lucide-react";

interface TaskFormData {
  title: string;
  description: string;
  due_date: string;
  estimated_duration: string;
  priority: "LOW" | "MEDIUM" | "HIGH";
  status: "PENDING" | "COMPLETED";
  subject_id: string;
  topic_id: string;
}

const emptyForm: TaskFormData = {
  title: "",
  description: "",
  due_date: "",
  estimated_duration: "",
  priority: "MEDIUM",
  status: "PENDING",
  subject_id: "",
  topic_id: "",
};

export function Tasks() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);

  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<TaskFormData>(emptyForm);
  const [modalTopics, setModalTopics] = useState<Topic[]>([]);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");

  useEffect(() => {
    fetchTasks();
    fetchSubjects();
  }, []);

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

  async function fetchSubjects() {
    try {
      const response = await api.get("/subjects/");
      setSubjects(response.data);
    } catch (error) {
      console.error("Erro ao buscar disciplinas", error);
    }
  }

  async function fetchTopicsForSubject(subjectId: string) {
    if (!subjectId) {
      setModalTopics([]);
      return;
    }
    try {
      const response = await api.get(`/topics/?subject_id=${subjectId}`);
      setModalTopics(response.data);
    } catch (error) {
      console.error("Erro ao buscar conteúdos", error);
      setModalTopics([]);
    }
  }

  const toggleTaskStatus = async (task: Task) => {
    const newStatus = task.status === "COMPLETED" ? "PENDING" : "COMPLETED";
    setTasks(
      tasks.map((t) => (t.id === task.id ? { ...t, status: newStatus } : t)),
    );
    try {
      await api.patch(`/tasks/${task.id}`, { status: newStatus });
    } catch (error) {
      console.error("Erro ao atualizar tarefa", error);
      setTasks(
        tasks.map((t) =>
          t.id === task.id ? { ...t, status: task.status } : t,
        ),
      );
    }
  };

  function openCreateModal() {
    setEditingId(null);
    setForm(emptyForm);
    setModalTopics([]);
    setFormError("");
    setShowModal(true);
  }

  async function openEditModal(task: Task) {
    setEditingId(task.id);
    setForm({
      title: task.title,
      description: task.description ?? "",
      due_date: task.due_date ? task.due_date.slice(0, 10) : "",
      estimated_duration: task.estimated_duration
        ? String(task.estimated_duration)
        : "",
      priority: task.priority,
      status: task.status,
      subject_id: task.subject_id ?? "",
      topic_id: task.topic_id ?? "",
    });
    setFormError("");
    setShowModal(true);

    if (task.subject_id) {
      await fetchTopicsForSubject(task.subject_id);
    } else {
      setModalTopics([]);
    }
  }

  async function handleSubjectChange(subjectId: string) {
    setForm({ ...form, subject_id: subjectId, topic_id: "" });
    await fetchTopicsForSubject(subjectId);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormError("");
    setSaving(true);

    const payload = {
      title: form.title,
      description: form.description || null,
      due_date: form.due_date || null,
      estimated_duration: form.estimated_duration
        ? Number(form.estimated_duration)
        : null,
      priority: form.priority,
      status: form.status,
      subject_id: form.subject_id || null,
      topic_id: form.topic_id || null,
    };

    try {
      if (editingId) {
        const response = await api.patch(`/tasks/${editingId}`, payload);
        setTasks((prev) =>
          prev.map((t) => (t.id === editingId ? response.data : t)),
        );
      } else {
        const response = await api.post("/tasks/", payload);
        setTasks((prev) => [response.data, ...prev]);
      }
      setShowModal(false);
    } catch (error) {
      console.error("Erro ao salvar tarefa", error);
      setFormError(
        "Não foi possível salvar. Verifique os dados e tente novamente.",
      );
    } finally {
      setSaving(false);
    }
  }

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
        <button
          onClick={openCreateModal}
          className="flex items-center gap-2 bg-indigo-600 text-white font-semibold px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors cursor-pointer"
        >
          <Plus size={18} />
          Nova Tarefa
        </button>
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
              <div
                key={task.id}
                className={`w-full flex items-start gap-4 p-4 rounded-xl border transition-all group ${
                  isCompleted
                    ? "bg-gray-50 border-gray-200 opacity-75 hover:opacity-100 hover:bg-gray-100"
                    : "bg-white border-gray-200 shadow-sm hover:border-indigo-300 hover:shadow-md"
                }`}
              >
                <button
                  onClick={() => toggleTaskStatus(task)}
                  className="shrink-0 mt-1 text-gray-400 transition-colors cursor-pointer"
                >
                  {isCompleted ? (
                    <CheckCircle
                      className="text-green-500 group-hover:text-green-600"
                      size={24}
                    />
                  ) : (
                    <Circle className="group-hover:text-indigo-500" size={24} />
                  )}
                </button>

                <button
                  onClick={() => toggleTaskStatus(task)}
                  className="flex-1 text-left cursor-pointer"
                >
                  <div className="flex items-center gap-3 mb-1">
                    <p
                      className={`font-bold text-lg transition-colors ${isCompleted ? "text-gray-500 line-through" : "text-gray-900 group-hover:text-indigo-700"}`}
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
                </button>

                <button
                  onClick={() => openEditModal(task)}
                  className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors cursor-pointer"
                  title="Editar tarefa"
                >
                  <Pencil size={18} />
                </button>
              </div>
            );
          })
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-md p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-gray-900">
                {editingId ? "Editar Tarefa" : "Nova Tarefa"}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600 cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            {formError && (
              <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm mb-4">
                {formError}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Título
                </label>
                <input
                  type="text"
                  required
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-colors"
                  placeholder="Ex: Lista de exercícios SQL"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Descrição
                </label>
                <textarea
                  value={form.description}
                  onChange={(e) =>
                    setForm({ ...form, description: e.target.value })
                  }
                  rows={2}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-colors resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Disciplina
                </label>
                <select
                  value={form.subject_id}
                  onChange={(e) => handleSubjectChange(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-colors"
                >
                  <option value="">Nenhuma</option>
                  {subjects.map((subject) => (
                    <option key={subject.id} value={subject.id}>
                      {subject.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Conteúdo
                </label>
                <select
                  value={form.topic_id}
                  onChange={(e) =>
                    setForm({ ...form, topic_id: e.target.value })
                  }
                  disabled={!form.subject_id}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-colors disabled:bg-gray-100 disabled:cursor-not-allowed"
                >
                  <option value="">Nenhum</option>
                  {modalTopics.map((topic) => (
                    <option key={topic.id} value={topic.id}>
                      {topic.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Prazo
                  </label>
                  <input
                    type="date"
                    value={form.due_date}
                    onChange={(e) =>
                      setForm({ ...form, due_date: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Duração (min)
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={form.estimated_duration}
                    onChange={(e) =>
                      setForm({ ...form, estimated_duration: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-colors"
                    placeholder="Ex: 60"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Prioridade
                  </label>
                  <select
                    value={form.priority}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        priority: e.target.value as TaskFormData["priority"],
                      })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-colors"
                  >
                    <option value="LOW">Baixa</option>
                    <option value="MEDIUM">Média</option>
                    <option value="HIGH">Alta</option>
                  </select>
                </div>

                {editingId && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Status
                    </label>
                    <select
                      value={form.status}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          status: e.target.value as TaskFormData["status"],
                        })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-colors"
                    >
                      <option value="PENDING">Pendente</option>
                      <option value="COMPLETED">Concluída</option>
                    </select>
                  </div>
                )}
              </div>

              <button
                type="submit"
                disabled={saving}
                className="w-full bg-indigo-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving
                  ? "Salvando..."
                  : editingId
                    ? "Salvar alterações"
                    : "Criar tarefa"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
