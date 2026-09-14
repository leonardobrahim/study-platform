import { useEffect, useState } from "react";
import { api } from "../services/api";
import type { Semester } from "../types/semester";
import {
  Plus,
  Pencil,
  Archive,
  ArchiveRestore,
  ChevronDown,
  ChevronUp,
  X,
  Calendar,
} from "lucide-react";

interface SemesterFormData {
  name: string;
  year: number;
  period: number;
}

const emptyForm: SemesterFormData = {
  name: "",
  year: new Date().getFullYear(),
  period: 1,
};

export function Semesters() {
  const [semesters, setSemesters] = useState<Semester[]>([]);
  const [loading, setLoading] = useState(true);
  const [showArchived, setShowArchived] = useState(false);

  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<SemesterFormData>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");

  useEffect(() => {
    fetchSemesters();
  }, []);

  async function fetchSemesters() {
    try {
      const response = await api.get("/semesters/");
      setSemesters(response.data);
    } catch (error) {
      console.error("Erro ao buscar semestres", error);
    } finally {
      setLoading(false);
    }
  }

  function openCreateModal() {
    setEditingId(null);
    setForm(emptyForm);
    setFormError("");
    setShowModal(true);
  }

  function openEditModal(semester: Semester) {
    setEditingId(semester.id);
    setForm({
      name: semester.name,
      year: semester.year,
      period: semester.period,
    });
    setFormError("");
    setShowModal(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormError("");
    setSaving(true);

    try {
      if (editingId) {
        const response = await api.patch(`/semesters/${editingId}`, form);
        setSemesters((prev) =>
          prev.map((s) => (s.id === editingId ? response.data : s)),
        );
      } else {
        const response = await api.post("/semesters/", form);
        setSemesters((prev) => [...prev, response.data]);
      }
      setShowModal(false);
    } catch (error) {
      console.error("Erro ao salvar semestre", error);
      setFormError(
        "Não foi possível salvar. Verifique os dados e tente novamente.",
      );
    } finally {
      setSaving(false);
    }
  }

  async function toggleArchiveStatus(semester: Semester) {
    const newStatus = semester.status === "ACTIVE" ? "ARCHIVED" : "ACTIVE";

    // Atualização otimista
    setSemesters((prev) =>
      prev.map((s) => (s.id === semester.id ? { ...s, status: newStatus } : s)),
    );

    try {
      await api.patch(`/semesters/${semester.id}`, { status: newStatus });
    } catch (error) {
      console.error("Erro ao atualizar status do semestre", error);
      // Reverte em caso de erro
      setSemesters((prev) =>
        prev.map((s) =>
          s.id === semester.id ? { ...s, status: semester.status } : s,
        ),
      );
    }
  }

  const activeSemesters = semesters.filter((s) => s.status === "ACTIVE");
  const archivedSemesters = semesters.filter((s) => s.status === "ARCHIVED");

  if (loading)
    return (
      <div className="text-indigo-600 font-bold">Carregando semestres...</div>
    );

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Semestres</h1>
          <p className="text-gray-500">Organize seus períodos acadêmicos.</p>
        </div>
        <button
          onClick={openCreateModal}
          className="flex items-center gap-2 bg-indigo-600 text-white font-semibold px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors cursor-pointer"
        >
          <Plus size={18} />
          Novo Semestre
        </button>
      </div>

      {/* Semestres Ativos */}
      <div className="space-y-3">
        {activeSemesters.length === 0 ? (
          <div className="bg-white p-8 rounded-xl border border-gray-100 text-center">
            <p className="text-gray-500">
              Nenhum semestre ativo. Crie o primeiro para começar.
            </p>
          </div>
        ) : (
          activeSemesters.map((semester) => (
            <div
              key={semester.id}
              className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between"
            >
              <div className="flex items-center gap-4">
                <div className="bg-indigo-100 p-3 rounded-lg text-indigo-600">
                  <Calendar size={20} />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900">{semester.name}</h3>
                  <p className="text-sm text-gray-500">
                    {semester.year}.{semester.period}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => openEditModal(semester)}
                  className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors cursor-pointer"
                  title="Editar"
                >
                  <Pencil size={18} />
                </button>
                <button
                  onClick={() => toggleArchiveStatus(semester)}
                  className="p-2 text-gray-400 hover:text-yellow-600 hover:bg-yellow-50 rounded-lg transition-colors cursor-pointer"
                  title="Arquivar"
                >
                  <Archive size={18} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Semestres Arquivados */}
      {archivedSemesters.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <button
            onClick={() => setShowArchived(!showArchived)}
            className="w-full flex items-center justify-between p-5 hover:bg-gray-50 transition-colors cursor-pointer"
          >
            <span className="font-medium text-gray-700">
              Arquivados ({archivedSemesters.length})
            </span>
            {showArchived ? (
              <ChevronUp size={20} className="text-gray-400" />
            ) : (
              <ChevronDown size={20} className="text-gray-400" />
            )}
          </button>

          {showArchived && (
            <div className="border-t border-gray-100 divide-y divide-gray-100">
              {archivedSemesters.map((semester) => (
                <div
                  key={semester.id}
                  className="p-5 flex items-center justify-between bg-gray-50"
                >
                  <div>
                    <h3 className="font-medium text-gray-600">
                      {semester.name}
                    </h3>
                    <p className="text-sm text-gray-400">
                      {semester.year}.{semester.period}
                    </p>
                  </div>
                  <button
                    onClick={() => toggleArchiveStatus(semester)}
                    className="flex items-center gap-2 text-sm text-indigo-600 hover:text-indigo-700 font-medium cursor-pointer"
                  >
                    <ArchiveRestore size={16} />
                    Reativar
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Modal de Criar/Editar */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-gray-900">
                {editingId ? "Editar Semestre" : "Novo Semestre"}
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
                  Nome
                </label>
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-colors"
                  placeholder="Ex: 2026.2"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Ano
                  </label>
                  <input
                    type="number"
                    required
                    value={form.year}
                    onChange={(e) =>
                      setForm({ ...form, year: Number(e.target.value) })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Período
                  </label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={form.period}
                    onChange={(e) =>
                      setForm({ ...form, period: Number(e.target.value) })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-colors"
                  />
                </div>
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
                    : "Criar semestre"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
