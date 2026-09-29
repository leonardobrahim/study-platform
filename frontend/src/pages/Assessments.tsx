import { useEffect, useState } from "react";
import { api } from "../services/api";
import { assessmentService } from "../services/assessmentService";
import type { Assessment } from "../types/assessment";
import type { Subject, Topic } from "../types/subject";
import {
  Calendar,
  FileText,
  Plus,
  Pencil,
  Trash2,
  X,
  Target,
} from "lucide-react";

interface AssessmentFormData {
  title: string;
  type: "PROVA" | "TRABALHO";
  date: string;
  subject_id: string;
  topic_ids: string[];
}

const emptyForm: AssessmentFormData = {
  title: "",
  type: "PROVA",
  date: "",
  subject_id: "",
  topic_ids: [],
};

export function Assessments() {
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);

  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<AssessmentFormData>(emptyForm);
  const [modalTopics, setModalTopics] = useState<Topic[]>([]);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");

  useEffect(() => {
    fetchAssessments();
    fetchSubjects();
  }, []);

  async function fetchAssessments() {
    try {
      const data = await assessmentService.getAssessments();
      setAssessments(data);
    } catch (error) {
      console.error("Erro ao buscar avaliações", error);
    } finally {
      setLoading(false);
    }
  }

  async function fetchSubjects() {
    try {
      const response = await api.get<Subject[]>("/subjects/");
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
      const response = await api.get<Topic[]>(`/topics/?subject_id=${subjectId}`);
      setModalTopics(response.data);
    } catch (error) {
      console.error("Erro ao buscar conteúdos", error);
      setModalTopics([]);
    }
  }

  async function handleDeleteAssessment(id: string) {
    if (!confirm("Tem certeza que deseja excluir esta avaliação?")) return;
    try {
      await assessmentService.deleteAssessment(id);
      setAssessments((prev) => prev.filter((a) => a.id !== id));
    } catch (error) {
      console.error("Erro ao excluir avaliação", error);
      alert("Não foi possível excluir a avaliação.");
    }
  }

  function openCreateModal() {
    setEditingId(null);
    setForm(emptyForm);
    setModalTopics([]);
    setFormError("");
    setShowModal(true);
  }

  async function openEditModal(assessment: Assessment) {
    setEditingId(assessment.id);
    setForm({
      title: assessment.title,
      type: assessment.type,
      date: assessment.date ? assessment.date.slice(0, 10) : "",
      subject_id: assessment.subject_id,
      topic_ids: assessment.topics.map((t) => t.id),
    });
    setFormError("");
    setShowModal(true);

    if (assessment.subject_id) {
      await fetchTopicsForSubject(assessment.subject_id);
    } else {
      setModalTopics([]);
    }
  }

  async function handleSubjectChange(subjectId: string) {
    setForm({ ...form, subject_id: subjectId, topic_ids: [] });
    await fetchTopicsForSubject(subjectId);
  }

  function toggleTopicSelection(topicId: string) {
    setForm((prev) => {
      if (prev.topic_ids.includes(topicId)) {
        return { ...prev, topic_ids: prev.topic_ids.filter((id) => id !== topicId) };
      } else {
        return { ...prev, topic_ids: [...prev.topic_ids, topicId] };
      }
    });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormError("");
    setSaving(true);

    const payload = {
      title: form.title,
      type: form.type,
      date: form.date || null,
      subject_id: form.subject_id,
      topic_ids: form.topic_ids,
    };

    try {
      if (editingId) {
        const data = await assessmentService.updateAssessment(editingId, payload);
        setAssessments((prev) => prev.map((a) => (a.id === editingId ? data : a)));
      } else {
        const data = await assessmentService.createAssessment(payload);
        setAssessments((prev) => [...prev, data]);
      }
      setShowModal(false);
    } catch (error) {
      console.error("Erro ao salvar avaliação", error);
      setFormError("Não foi possível salvar. Verifique os dados e tente novamente.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <div className="text-indigo-600 font-bold">Carregando avaliações...</div>;
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const upcoming = assessments.filter((a) => {
    if (!a.date) return true; // if no date, put in upcoming
    const d = new Date(a.date);
    d.setHours(0, 0, 0, 0);
    return d >= today;
  }).sort((a, b) => {
    if (!a.date) return 1;
    if (!b.date) return -1;
    return new Date(a.date).getTime() - new Date(b.date).getTime();
  });

  const past = assessments.filter((a) => {
    if (!a.date) return false;
    const d = new Date(a.date);
    d.setHours(0, 0, 0, 0);
    return d < today;
  }).sort((a, b) => new Date(b.date!).getTime() - new Date(a.date!).getTime());

  const getSubjectName = (subjectId: string) => {
    return subjects.find((s) => s.id === subjectId)?.name || "Desconhecida";
  };

  const calculatePreparation = (topics: Topic[]) => {
    if (topics.length === 0) return 0;
    const completed = topics.filter((t) => t.status === "COMPLETED").length;
    return Math.round((completed / topics.length) * 100);
  };

  const renderAssessmentCard = (assessment: Assessment) => {
    const prep = calculatePreparation(assessment.topics);
    return (
      <div
        key={assessment.id}
        className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm hover:border-indigo-300 hover:shadow-md transition-all flex flex-col gap-3"
      >
        <div className="flex justify-between items-start">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className={`text-xs font-bold px-2 py-1 rounded-md ${assessment.type === "PROVA" ? "bg-red-100 text-red-700" : "bg-blue-100 text-blue-700"}`}>
                {assessment.type === "PROVA" ? "Prova" : "Trabalho"}
              </span>
              <h3 className="text-lg font-bold text-gray-900">{assessment.title}</h3>
            </div>
            <p className="text-sm font-medium text-gray-600 mb-2">
              Disciplina: {getSubjectName(assessment.subject_id)}
            </p>
            {assessment.date && (
              <span className="flex items-center gap-1 text-sm text-gray-500">
                <Calendar size={14} />
                {new Date(assessment.date).toLocaleDateString("pt-BR", { timeZone: "UTC" })}
              </span>
            )}
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => openEditModal(assessment)}
              className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors cursor-pointer"
              title="Editar"
            >
              <Pencil size={18} />
            </button>
            <button
              onClick={() => handleDeleteAssessment(assessment.id)}
              className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
              title="Excluir"
            >
              <Trash2 size={18} />
            </button>
          </div>
        </div>

        <div className="mt-2 p-3 bg-gray-50 rounded-lg border border-gray-100">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-gray-500 flex items-center gap-1">
              <FileText size={14} /> Conteúdos ({assessment.topics.length})
            </span>
            <span className="text-xs font-bold flex items-center gap-1 text-indigo-600">
              <Target size={14} /> Preparação: {prep}%
            </span>
          </div>
          
          <div className="w-full bg-gray-200 rounded-full h-1.5 mb-3">
            <div
              className={`bg-indigo-600 h-1.5 rounded-full transition-all ${prep === 100 ? "bg-green-500" : ""}`}
              style={{ width: `${prep}%` }}
            ></div>
          </div>

          <ul className="space-y-1">
            {assessment.topics.map((t) => (
              <li key={t.id} className="text-sm flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${t.status === "COMPLETED" ? "bg-green-500" : t.status === "IN_PROGRESS" ? "bg-yellow-400" : "bg-gray-300"}`}></span>
                <span className={t.status === "COMPLETED" ? "text-gray-400 line-through" : "text-gray-700"}>{t.name}</span>
              </li>
            ))}
            {assessment.topics.length === 0 && (
              <li className="text-xs text-gray-400 italic">Nenhum conteúdo vinculado.</li>
            )}
          </ul>
        </div>
      </div>
    );
  };

  const renderSection = (title: string, list: Assessment[], colorClass: string) => {
    if (list.length === 0) return null;
    return (
      <div className="mb-8 last:mb-0">
        <h2 className={`text-lg font-bold mb-4 ${colorClass}`}>{title} ({list.length})</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {list.map(renderAssessmentCard)}
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Avaliações</h1>
          <p className="text-gray-500">Gerencie suas provas e trabalhos.</p>
        </div>
        <button
          onClick={openCreateModal}
          className="flex items-center gap-2 bg-indigo-600 text-white font-semibold px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors cursor-pointer"
        >
          <Plus size={18} />
          Nova Avaliação
        </button>
      </div>

      <div>
        {assessments.length === 0 ? (
          <div className="bg-white p-8 rounded-xl border border-gray-100 text-center">
            <p className="text-gray-500">Você não tem nenhuma avaliação cadastrada ainda.</p>
          </div>
        ) : (
          <>
            {renderSection("Próximas Avaliações", upcoming, "text-indigo-600")}
            {renderSection("Avaliações Passadas", past, "text-gray-500")}
          </>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-md p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-gray-900">
                {editingId ? "Editar Avaliação" : "Nova Avaliação"}
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
                <label className="block text-sm font-medium text-gray-700 mb-1">Título</label>
                <input
                  type="text"
                  required
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-colors"
                  placeholder="Ex: Prova 1"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tipo</label>
                  <select
                    value={form.type}
                    onChange={(e) => setForm({ ...form, type: e.target.value as any })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-colors"
                  >
                    <option value="PROVA">Prova</option>
                    <option value="TRABALHO">Trabalho</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Data</label>
                  <input
                    type="date"
                    value={form.date}
                    onChange={(e) => setForm({ ...form, date: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Disciplina</label>
                <select
                  required
                  value={form.subject_id}
                  onChange={(e) => handleSubjectChange(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-colors"
                >
                  <option value="">Selecione...</option>
                  {subjects.map((subject) => (
                    <option key={subject.id} value={subject.id}>
                      {subject.name}
                    </option>
                  ))}
                </select>
              </div>

              {form.subject_id && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Conteúdos Cobrados</label>
                  <div className="border border-gray-200 rounded-lg p-3 max-h-48 overflow-y-auto space-y-2 bg-gray-50">
                    {modalTopics.length === 0 ? (
                      <p className="text-xs text-gray-500">Esta disciplina não possui conteúdos cadastrados.</p>
                    ) : (
                      modalTopics.map((topic) => (
                        <label key={topic.id} className="flex items-start gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={form.topic_ids.includes(topic.id)}
                            onChange={() => toggleTopicSelection(topic.id)}
                            className="mt-1 text-indigo-600 focus:ring-indigo-500 rounded"
                          />
                          <span className="text-sm text-gray-800">{topic.name}</span>
                        </label>
                      ))
                    )}
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={saving}
                className="w-full bg-indigo-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed mt-2"
              >
                {saving ? "Salvando..." : editingId ? "Salvar alterações" : "Criar avaliação"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
