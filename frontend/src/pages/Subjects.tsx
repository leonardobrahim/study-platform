import { useEffect, useState } from "react";
import { api } from "../services/api";
import type { Subject, Topic } from "../types/subject";
import {
  BookOpen,
  ChevronDown,
  ChevronUp,
  CheckCircle,
  Circle,
} from "lucide-react";

export function Subjects() {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
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
    fetchSubjects();
  }, []);

  const toggleSubject = async (subjectId: string) => {
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
  };

  const toggleTopicStatus = async (topic: Topic) => {
    const newStatus =
      topic.status === "COMPLETED" ? "NOT_STARTED" : "COMPLETED";

    setTopics(
      topics.map((t) => (t.id === topic.id ? { ...t, status: newStatus } : t)),
    );

    try {
      await api.patch(`/topics/${topic.id}`, { status: newStatus });
    } catch (error) {
      console.error("Erro ao atualizar tópico", error);
      setTopics(
        topics.map((t) =>
          t.id === topic.id ? { ...t, status: topic.status } : t,
        ),
      );
    }
  };

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
              {/* Card da Disciplina */}
              <button
                onClick={() => toggleSubject(subject.id)}
                className="w-full flex items-center justify-between p-6 hover:bg-gray-50 transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-4">
                  <div
                    className="p-3 rounded-lg text-white"
                    style={{ backgroundColor: subject.color || "#4f46e5" }}
                  >
                    <BookOpen size={24} />
                  </div>
                  <div className="text-left">
                    <h2 className="text-lg font-bold text-gray-900">
                      {subject.name}
                    </h2>
                    <p className="text-sm text-gray-500">
                      {subject.code} • Prof: {subject.professor}
                    </p>
                  </div>
                </div>
                <div className="text-gray-400">
                  {expandedId === subject.id ? (
                    <ChevronUp size={24} />
                  ) : (
                    <ChevronDown size={24} />
                  )}
                </div>
              </button>

              {/* Lista de Tópicos */}
              {expandedId === subject.id && (
                <div className="bg-gray-50 p-6 border-t border-gray-100">
                  <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wider mb-4">
                    Conteúdos
                  </h3>

                  {topics.length === 0 ? (
                    <p className="text-sm text-gray-500">
                      Nenhum conteúdo cadastrado.
                    </p>
                  ) : (
                    <div className="space-y-3">
                      {topics.map((topic) => {
                        const isCompleted = topic.status === "COMPLETED";

                        return (
                          // Transformado em botão, usando 'group' para hover e cursor-pointer
                          <button
                            key={topic.id}
                            onClick={() => toggleTopicStatus(topic)}
                            className={`w-full text-left flex items-center gap-3 p-4 rounded-lg border transition-all cursor-pointer group ${
                              isCompleted
                                ? "bg-gray-100 border-gray-200 opacity-75 hover:opacity-100 hover:bg-gray-200"
                                : "bg-white border-gray-200 shadow-sm hover:border-indigo-300 hover:shadow-md"
                            }`}
                          >
                            <div className="shrink-0 text-gray-400 transition-colors">
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
                            </div>
                            <div>
                              <p
                                className={`font-medium transition-colors ${
                                  isCompleted
                                    ? "text-gray-500 line-through"
                                    : "text-gray-800 group-hover:text-indigo-700"
                                }`}
                              >
                                {topic.name}
                              </p>
                              {topic.description && (
                                <p className="text-sm text-gray-500 mt-0.5">
                                  {topic.description}
                                </p>
                              )}
                            </div>
                          </button>
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
    </div>
  );
}
