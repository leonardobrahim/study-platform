import { useEffect, useState } from "react";
import { api } from "../services/api";
import type { Subject, Topic } from "../types/subject";
import type { Semester } from "../types/semester";
import {
  BookOpen,
  ChevronDown,
  ChevronUp,
  CheckCircle,
  Circle,
  Plus,
  Pencil,
  Trash2,
  X,
} from "lucide-react";

interface SubjectFormData {
  name: string;
  semester_id: string;
  code: string;
  professor: string;
  description: string;
  color: string;
}

const emptySubjectForm: SubjectFormData = {
  name: "",
  semester_id: "",
  code: "",
  professor: "",
  description: "",
  color: "#4f46e5",
};

interface TopicFormData {
  name: string;
  description: string;
  difficulty: "EASY" | "MEDIUM" | "HARD";
  status: "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED";
}

const emptyTopicForm: TopicFormData = {
  name: "",
  description: "",
  difficulty: "MEDIUM",
  status: "NOT_STARTED",
};

export function Subjects() {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [semesters, setSemesters] = useState<Semester[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [loading, setLoading] = useState(true);

  const [showSubjectModal, setShowSubjectModal] = useState(false);
  const [editingSubjectId, setEditingSubjectId] = useState<string | null>(null);
  const [subjectForm, setSubjectForm] =
    useState<SubjectFormData>(emptySubjectForm);
  const [savingSubject, setSavingSubject] = useState(false);
  const [subjectError, setSubjectError] = useState("");

  const [showTopicModal, setShowTopicModal] = useState(false);
  const [editingTopicId, setEditingTopicId] = useState<string | null>(null);
  const [topicTargetSubjectId, setTopicTargetSubjectId] = useState("");
  const [topicForm, setTopicForm] = useState<TopicFormData>(emptyTopicForm);
  const [savingTopic, setSavingTopic] = useState(false);
  const [topicError, setTopicError] = useState("");

  useEffect(() => {
    fetchSubjects();
    fetchSemesters();
  }, []);

  async function fetchSubjects() {
    try {
      const response = await api.get("/subjects/");
      setSubjects(response.data);
    } catch (error) {
      console.error("Erro ao buscar disciplinas", error);
    } finally {
      setLoading(false);
    }
  }

  async function fetchSemesters() {
    try {
      const response = await api.get("/semesters/");
      setSemesters(response.data);
    } catch (error) {
      console.error("Erro ao buscar semestres", error);
    }
  }

  async function toggleSubject(subjectId: string) {
    if (expandedId === subjectId) {
      setExpandedId(null);
      return;
    }
    setExpandedId(subjectId);
    try {
      const response = await api.get(`/topics/?subject_id=${subjectId}`);
      setTopics(response.data);
    } catch (error) {
      console.error("Erro ao buscar tópicos", error);
    }
  }

  async function toggleTopicStatus(topic: Topic) {
    const newStatus =
      topic.status === "COMPLETED" ? "NOT_STARTED" : "COMPLETED";
    setTopics((prev) =>
      prev.map((t) => (t.id === topic.id ? { ...t, status: newStatus } : t)),
    );
    try {
      await api.patch(`/topics/${topic.id}`, { status: newStatus });
    } catch (error) {
      console.error("Erro ao atualizar tópico", error);
      setTopics((prev) =>
        prev.map((t) =>
          t.id === topic.id ? { ...t, status: topic.status } : t,
        ),
      );
    }
  }

  async function handleDeleteSubject(subjectId: string) {
    if (!confirm("Tem certeza que deseja excluir esta disciplina e todos os seus conteúdos?")) return;
    try {
      await api.delete(`/subjects/${subjectId}`);
      setSubjects((prev) => prev.filter((s) => s.id !== subjectId));
      if (expandedId === subjectId) {
        setExpandedId(null);
      }
    } catch (error) {
      console.error("Erro ao excluir disciplina", error);
      alert("Não foi possível excluir a disciplina.");
    }
  }

  async function handleDeleteTopic(topicId: string) {
    if (!confirm("Tem certeza que deseja excluir este conteúdo?")) return;
    try {
      await api.delete(`/topics/${topicId}`);
      setTopics((prev) => prev.filter((t) => t.id !== topicId));
    } catch (error) {
      console.error("Erro ao excluir conteúdo", error);
      alert("Não foi possível excluir o conteúdo.");
    }
  }

  function openCreateSubjectModal() {
    setEditingSubjectId(null);
    setSubjectForm({
      ...emptySubjectForm,
      semester_id: semesters[0]?.id ?? "",
    });
    setSubjectError("");
    setShowSubjectModal(true);
  }

  function openEditSubjectModal(subject: Subject) {
    setEditingSubjectId(subject.id);
    setSubjectForm({
      name: subject.name,
      semester_id: subject.semester_id,
      code: subject.code ?? "",
      professor: subject.professor ?? "",
      description: subject.description ?? "",
      color: subject.color ?? "#4f46e5",
    });
    setSubjectError("");
    setShowSubjectModal(true);
  }

  async function handleSubjectSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubjectError("");

    if (!subjectForm.semester_id) {
      setSubjectError("Selecione um semestre.");
      return;
    }

    setSavingSubject(true);
    const payload = {
      name: subjectForm.name,
      semester_id: subjectForm.semester_id,
      code: subjectForm.code || null,
      professor: subjectForm.professor || null,
      description: subjectForm.description || null,
      color: subjectForm.color || null,
    };

    try {
      if (editingSubjectId) {
        const response = await api.patch(
          `/subjects/${editingSubjectId}`,
          payload,
        );
        setSubjects((prev) =>
          prev.map((s) => (s.id === editingSubjectId ? response.data : s)),
        );
      } else {
        const response = await api.post("/subjects/", payload);
        setSubjects((prev) => [...prev, response.data]);
      }
      setShowSubjectModal(false);
    } catch (error) {
      console.error("Erro ao salvar disciplina", error);
      setSubjectError(
        "Não foi possível salvar. Verifique os dados e tente novamente.",
      );
    } finally {
      setSavingSubject(false);
    }
  }

  function openCreateTopicModal(subjectId: string) {
    setEditingTopicId(null);
    setTopicTargetSubjectId(subjectId);
    setTopicForm(emptyTopicForm);
    setTopicError("");
    setShowTopicModal(true);
  }

  function openEditTopicModal(topic: Topic) {
    setEditingTopicId(topic.id);
    setTopicTargetSubjectId(topic.subject_id);
    setTopicForm({
      name: topic.name,
      description: topic.description ?? "",
      difficulty: topic.difficulty,
      status: topic.status,
    });
    setTopicError("");
    setShowTopicModal(true);
  }

  async function handleTopicSubmit(e: React.FormEvent) {
    e.preventDefault();
    setTopicError("");
    setSavingTopic(true);

    try {
      if (editingTopicId) {
        const response = await api.patch(`/topics/${editingTopicId}`, {
          name: topicForm.name,
          description: topicForm.description || null,
          difficulty: topicForm.difficulty,
          status: topicForm.status,
        });
        setTopics((prev) =>
          prev.map((t) => (t.id === editingTopicId ? response.data : t)),
        );
      } else {
        const response = await api.post("/topics/", {
          name: topicForm.name,
          subject_id: topicTargetSubjectId,
          description: topicForm.description || null,
          difficulty: topicForm.difficulty,
          status: topicForm.status,
        });
        if (expandedId === topicTargetSubjectId) {
          setTopics((prev) => [...prev, response.data]);
        }
      }
      setShowTopicModal(false);
    } catch (error) {
      console.error("Erro ao salvar conteúdo", error);
      setTopicError(
        "Não foi possível salvar. Verifique os dados e tente novamente.",
      );
    } finally {
      setSavingTopic(false);
    }
  }

  if (loading)
    return (
      <div className="text-indigo-600 font-bold">Carregando disciplinas...</div>
    );

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Disciplinas</h1>
          <p className="text-gray-500">
            Gerencie suas matérias e conteúdos de estudo.
          </p>
        </div>
        <button
          onClick={openCreateSubjectModal}
          disabled={semesters.length === 0}
          title={semesters.length === 0 ? "Crie um semestre primeiro" : ""}
          className="flex items-center gap-2 bg-indigo-600 text-white font-semibold px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
        >
          <Plus size={18} />
          Nova Disciplina
        </button>
      </div>

      <div className="space-y-4">
        {subjects.length === 0 ? (
          <p className="text-gray-500 text-center py-8">
            Nenhuma disciplina cadastrada.
          </p>
        ) : (
          subjects.map((subject) => (
            <div
              key={subject.id}
              className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden"
            >
              <div className="flex items-center justify-between p-6 hover:bg-gray-50 transition-colors">
                <button
                  onClick={() => toggleSubject(subject.id)}
                  className="flex items-center gap-4 flex-1 text-left cursor-pointer"
                >
                  <div
                    className="p-3 rounded-lg text-white"
                    style={{ backgroundColor: subject.color || "#4f46e5" }}
                  >
                    <BookOpen size={24} />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-gray-900">
                      {subject.name}
                    </h2>
                    <p className="text-sm text-gray-500">
                      {subject.code} • Prof: {subject.professor}
                    </p>
                  </div>
                </button>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => openEditSubjectModal(subject)}
                    className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors cursor-pointer"
                    title="Editar disciplina"
                  >
                    <Pencil size={18} />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteSubject(subject.id);
                    }}
                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                    title="Excluir disciplina"
                  >
                    <Trash2 size={18} />
                  </button>
                  <button
                    onClick={() => toggleSubject(subject.id)}
                    className="text-gray-400 cursor-pointer p-2"
                  >
                    {expandedId === subject.id ? (
                      <ChevronUp size={24} />
                    ) : (
                      <ChevronDown size={24} />
                    )}
                  </button>
                </div>
              </div>

              {expandedId === subject.id && (
                <div className="bg-gray-50 p-6 border-t border-gray-100">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wider">
                      Conteúdos
                    </h3>
                    <button
                      onClick={() => openCreateTopicModal(subject.id)}
                      className="flex items-center gap-1 text-sm text-indigo-600 hover:text-indigo-700 font-medium cursor-pointer"
                    >
                      <Plus size={16} />
                      Novo Conteúdo
                    </button>
                  </div>

                  {topics.length === 0 ? (
                    <p className="text-sm text-gray-500">
                      Nenhum conteúdo cadastrado.
                    </p>
                  ) : (
                    <div className="space-y-3">
                      {topics.map((topic) => {
                        const isCompleted = topic.status === "COMPLETED";
                        return (
                          <div
                            key={topic.id}
                            className={`w-full flex items-center gap-3 p-4 rounded-lg border transition-all group ${
                              isCompleted
                                ? "bg-gray-100 border-gray-200"
                                : "bg-white border-gray-200 shadow-sm hover:border-indigo-300"
                            }`}
                          >
                            <button
                              onClick={() => toggleTopicStatus(topic)}
                              className="shrink-0 text-gray-400 transition-colors cursor-pointer"
                            >
                              {isCompleted ? (
                                <CheckCircle
                                  className="text-green-500 group-hover:text-green-600"
                                  size={24}
                                />
                              ) : (
                                <Circle
                                  className="group-hover:text-indigo-500"
                                  size={24}
                                />
                              )}
                            </button>
                            <button
                              onClick={() => toggleTopicStatus(topic)}
                              className="flex-1 text-left cursor-pointer"
                            >
                              <p
                                className={`font-medium transition-colors ${isCompleted ? "text-gray-500 line-through" : "text-gray-800 group-hover:text-indigo-700"}`}
                              >
                                {topic.name}
                              </p>
                              {topic.description && (
                                <p className="text-sm text-gray-500 mt-0.5">
                                  {topic.description}
                                </p>
                              )}
                            </button>
                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => openEditTopicModal(topic)}
                                className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors cursor-pointer"
                                title="Editar conteúdo"
                              >
                                <Pencil size={16} />
                              </button>
                              <button
                                onClick={() => handleDeleteTopic(topic.id)}
                                className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                                title="Excluir conteúdo"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {showSubjectModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-md p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-gray-900">
                {editingSubjectId ? "Editar Disciplina" : "Nova Disciplina"}
              </h2>
              <button
                onClick={() => setShowSubjectModal(false)}
                className="text-gray-400 hover:text-gray-600 cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            {subjectError && (
              <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm mb-4">
                {subjectError}
              </div>
            )}

            <form onSubmit={handleSubjectSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nome
                </label>
                <input
                  type="text"
                  required
                  value={subjectForm.name}
                  onChange={(e) =>
                    setSubjectForm({ ...subjectForm, name: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-colors"
                  placeholder="Ex: Banco de Dados"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Semestre
                </label>
                <select
                  required
                  value={subjectForm.semester_id}
                  onChange={(e) =>
                    setSubjectForm({
                      ...subjectForm,
                      semester_id: e.target.value,
                    })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-colors"
                >
                  <option value="">Selecione...</option>
                  {semesters.map((sem) => (
                    <option key={sem.id} value={sem.id}>
                      {sem.name} ({sem.year}.{sem.period}
                      {sem.status === "ARCHIVED" ? " • arquivado" : ""})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Código
                  </label>
                  <input
                    type="text"
                    value={subjectForm.code}
                    onChange={(e) =>
                      setSubjectForm({ ...subjectForm, code: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-colors"
                    placeholder="Ex: BD101"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Cor
                  </label>
                  <input
                    type="color"
                    value={subjectForm.color}
                    onChange={(e) =>
                      setSubjectForm({ ...subjectForm, color: e.target.value })
                    }
                    className="w-full h-10.5 px-2 border border-gray-300 rounded-lg cursor-pointer"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Professor
                </label>
                <input
                  type="text"
                  value={subjectForm.professor}
                  onChange={(e) =>
                    setSubjectForm({
                      ...subjectForm,
                      professor: e.target.value,
                    })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-colors"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Descrição
                </label>
                <textarea
                  value={subjectForm.description}
                  onChange={(e) =>
                    setSubjectForm({
                      ...subjectForm,
                      description: e.target.value,
                    })
                  }
                  rows={2}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-colors resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={savingSubject}
                className="w-full bg-indigo-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {savingSubject
                  ? "Salvando..."
                  : editingSubjectId
                    ? "Salvar alterações"
                    : "Criar disciplina"}
              </button>
            </form>
          </div>
        </div>
      )}

      {showTopicModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-md p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-gray-900">
                {editingTopicId ? "Editar Conteúdo" : "Novo Conteúdo"}
              </h2>
              <button
                onClick={() => setShowTopicModal(false)}
                className="text-gray-400 hover:text-gray-600 cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            {topicError && (
              <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm mb-4">
                {topicError}
              </div>
            )}

            <form onSubmit={handleTopicSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nome
                </label>
                <input
                  type="text"
                  required
                  value={topicForm.name}
                  onChange={(e) =>
                    setTopicForm({ ...topicForm, name: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-colors"
                  placeholder="Ex: Normalização"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Descrição
                </label>
                <textarea
                  value={topicForm.description}
                  onChange={(e) =>
                    setTopicForm({ ...topicForm, description: e.target.value })
                  }
                  rows={2}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-colors resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Dificuldade
                  </label>
                  <select
                    value={topicForm.difficulty}
                    onChange={(e) =>
                      setTopicForm({
                        ...topicForm,
                        difficulty: e.target
                          .value as TopicFormData["difficulty"],
                      })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-colors"
                  >
                    <option value="EASY">Fácil</option>
                    <option value="MEDIUM">Médio</option>
                    <option value="HARD">Difícil</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Status
                  </label>
                  <select
                    value={topicForm.status}
                    onChange={(e) =>
                      setTopicForm({
                        ...topicForm,
                        status: e.target.value as TopicFormData["status"],
                      })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-colors"
                  >
                    <option value="NOT_STARTED">Não iniciado</option>
                    <option value="IN_PROGRESS">Em andamento</option>
                    <option value="COMPLETED">Concluído</option>
                  </select>
                </div>
              </div>

              <button
                type="submit"
                disabled={savingTopic}
                className="w-full bg-indigo-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {savingTopic
                  ? "Salvando..."
                  : editingTopicId
                    ? "Salvar alterações"
                    : "Criar conteúdo"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
