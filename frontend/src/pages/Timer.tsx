import { useState, useEffect } from "react";
import { api } from "../services/api";
import type { Subject } from "../types/subject";
import { Play, Pause, Square, BookOpen, Clock, PlusCircle, X, Calendar } from "lucide-react";

export function Timer() {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [selectedSubject, setSelectedSubject] = useState("");

  // Estados do Cronômetro e da Sessão API
  const [time, setTime] = useState(0); // Tempo em segundos
  const [isRunning, setIsRunning] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null); // Guarda o ID do backend

  // Estados do Registro Manual
  const [showManualModal, setShowManualModal] = useState(false);
  const [manualSubjectId, setManualSubjectId] = useState("");
  const [manualMinutes, setManualMinutes] = useState(60);
  const [manualDate, setManualDate] = useState(() => new Date().toISOString().split("T")[0]);
  const [manualNotes, setManualNotes] = useState("");
  const [isSavingManual, setIsSavingManual] = useState(false);

  useEffect(() => {
    async function fetchSubjects() {
      try {
        const response = await api.get("/subjects/");
        setSubjects(response.data);
      } catch (error) {
        console.error("Erro ao buscar disciplinas", error);
      }
    }
    fetchSubjects();
  }, []);

  useEffect(() => {
    async function restoreActiveSession() {
      try {
        const response = await api.get("/sessions/?active_only=true");
        const activeSession = response.data[0];

        if (activeSession) {
          setSessionId(activeSession.id);
          setSelectedSubject(activeSession.subject_id);

          const elapsedSeconds = Math.floor(
            (Date.now() - new Date(activeSession.start_time).getTime()) / 1000,
          );
          setTime(Math.max(0, elapsedSeconds));
        }
      } catch (error) {
        console.error("Erro ao recuperar a sessão ativa", error);
      }
    }

    restoreActiveSession();
  }, []);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;

    if (isRunning) {
      interval = setInterval(() => {
        setTime((prev) => prev + 1);
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [isRunning]);

  // Função de Iniciar/Pausar com chamada à API
  const toggleTimer = async () => {
    if (!selectedSubject) {
      alert("Por favor, selecione uma disciplina antes de iniciar.");
      return;
    }

    // Se está começando do zero, avisa o backend (START)
    if (!isRunning && time === 0 && !sessionId) {
      try {
        const response = await api.post("/sessions/start", {
          subject_id: selectedSubject,
        });

        // Salva o ID que o backend gerou para usarmos depois
        setSessionId(response.data.id);
        setIsRunning(true);
      } catch (error: any) {
        console.error("Erro ao iniciar a sessão na API", error);
        alert(
          error.response?.data?.detail ||
            "Erro ao comunicar com o servidor. Verifique sua conexão.",
        );
        return; // Interrompe para não iniciar o relógio se a API falhar
      }
    } else {
      // Se já iniciou, apenas pausa ou despausa localmente
      setIsRunning(!isRunning);
    }
  };

  // Função para Finalizar (PATCH)
  const handleFinish = async () => {
    if (time === 0 || !sessionId) return;

    setIsRunning(false);

    try {
      // Envia o tempo para a rota de FINISH usando o ID da sessão
      await api.patch(`/sessions/${sessionId}/finish`, {
        duration: time,
      });

      alert("Parabéns! 🎉 Sessão concluída e salva com sucesso!");

      // Reseta tudo
      setTime(0);
      setSessionId(null);
      setSelectedSubject("");
    } catch (error: any) {
      console.error("Erro ao salvar sessão", error);
      const detail = error.response?.data?.detail;
      const message = Array.isArray(detail)
        ? detail.map((item: any) => item.msg).join("; ")
        : detail;
      alert(
        message ||
          "Erro ao finalizar a sessão. Verifique o terminal do backend.",
      );
    }
  };

  const handleSaveManual = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualSubjectId) {
      alert("Por favor, selecione uma disciplina.");
      return;
    }
    if (!manualMinutes || manualMinutes <= 0) {
      alert("A duração deve ser maior que zero minutos.");
      return;
    }

    try {
      setIsSavingManual(true);
      await api.post("/sessions/manual", {
        subject_id: manualSubjectId,
        duration_minutes: Number(manualMinutes),
        session_date: manualDate ? new Date(`${manualDate}T12:00:00Z`).toISOString() : null,
        notes: manualNotes || null
      });

      alert("🎉 Sessão registrada manualmente com sucesso! Vá ao Dashboard para conferir as estatísticas.");
      setShowManualModal(false);
      setManualNotes("");
      setManualMinutes(60);
    } catch (error: any) {
      console.error("Erro ao registrar sessão manual", error);
      alert(error.response?.data?.detail || "Erro ao registrar sessão manual.");
    } finally {
      setIsSavingManual(false);
    }
  };

  const formatTime = (totalSeconds: number) => {
    const h = String(Math.floor(totalSeconds / 3600)).padStart(2, "0");
    const m = String(Math.floor((totalSeconds % 3600) / 60)).padStart(2, "0");
    const s = String(totalSeconds % 60).padStart(2, "0");
    return `${h}:${m}:${s}`;
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Timer de Estudos</h1>
          <p className="text-gray-500">
            Concentre-se, acompanhe seu tempo e evolua.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowManualModal(true)}
            className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors cursor-pointer border border-indigo-100"
          >
            <PlusCircle size={18} />
            Registrar Manualmente
          </button>
          <div className="bg-indigo-100 p-3 rounded-full text-indigo-600">
            <Clock size={24} />
          </div>
        </div>
      </div>

      <div className="bg-white p-10 rounded-2xl shadow-sm border border-gray-100 text-center flex flex-col items-center">
        <div className="w-full max-w-md mb-10 text-left">
          <label className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
            <BookOpen size={16} /> O que vamos estudar agora?
          </label>
          <select
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
            disabled={isRunning || time > 0}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-colors disabled:bg-gray-100 disabled:cursor-not-allowed cursor-pointer"
          >
            <option value="">Selecione uma disciplina...</option>
            {subjects.map((subject) => (
              <option key={subject.id} value={subject.id}>
                {subject.name}
              </option>
            ))}
          </select>
        </div>

        <div className="text-7xl md:text-9xl font-bold text-gray-800 font-mono tracking-wider mb-12 select-none">
          {formatTime(time)}
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={toggleTimer}
            className={`flex items-center gap-2 px-8 py-4 rounded-full font-bold text-lg transition-all cursor-pointer ${
              isRunning
                ? "bg-yellow-100 text-yellow-700 hover:bg-yellow-200"
                : "bg-indigo-600 text-white hover:bg-indigo-700 shadow-md hover:shadow-lg"
            }`}
          >
            {isRunning ? (
              <>
                <Pause size={24} /> Pausar
              </>
            ) : (
              <>
                <Play size={24} /> {time > 0 ? "Continuar" : "Iniciar"}
              </>
            )}
          </button>

          {time > 0 && (
            <button
              onClick={handleFinish}
              className="flex items-center gap-2 px-8 py-4 rounded-full font-bold text-lg bg-green-100 text-green-700 hover:bg-green-200 transition-all cursor-pointer"
            >
              <Square size={24} /> Finalizar
            </button>
          )}
        </div>
      </div>

      {/* Modal de Registro Manual */}
      {showManualModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-gray-100 space-y-5">
            <div className="flex justify-between items-center pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <Clock className="text-indigo-600" size={22} />
                <h3 className="text-lg font-bold text-gray-900">Registrar Sessão Manual</h3>
              </div>
              <button
                onClick={() => setShowManualModal(false)}
                className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveManual} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Disciplina *
                </label>
                <select
                  value={manualSubjectId}
                  onChange={(e) => setManualSubjectId(e.target.value)}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-sm"
                >
                  <option value="">Selecione uma disciplina...</option>
                  {subjects.map((subject) => (
                    <option key={subject.id} value={subject.id}>
                      {subject.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Duração (minutos) *
                </label>
                <div className="flex gap-2 mb-2">
                  {[25, 45, 60, 90].map((mins) => (
                    <button
                      key={mins}
                      type="button"
                      onClick={() => setManualMinutes(mins)}
                      className={`flex-1 py-1.5 text-xs font-semibold rounded-md border transition-all ${
                        manualMinutes === mins
                          ? "bg-indigo-50 border-indigo-500 text-indigo-700"
                          : "border-gray-200 text-gray-600 hover:bg-gray-50"
                      }`}
                    >
                      {mins}m
                    </button>
                  ))}
                </div>
                <input
                  type="number"
                  min="1"
                  max="1440"
                  value={manualMinutes}
                  onChange={(e) => setManualMinutes(Number(e.target.value))}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-sm"
                  placeholder="Ex: 60"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1.5">
                  <Calendar size={14} className="text-gray-400" />
                  Data da Sessão
                </label>
                <input
                  type="date"
                  value={manualDate}
                  onChange={(e) => setManualDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Anotações (opcional)
                </label>
                <textarea
                  value={manualNotes}
                  onChange={(e) => setManualNotes(e.target.value)}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-sm resize-none"
                  placeholder="Ex: Resolução de exercícios do capítulo 3..."
                />
              </div>

              <div className="flex gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowManualModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-200 text-gray-600 rounded-lg hover:bg-gray-50 font-medium text-sm transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSavingManual}
                  className="flex-1 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium text-sm transition-colors disabled:opacity-50"
                >
                  {isSavingManual ? "Salvando..." : "Salvar Sessão"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
