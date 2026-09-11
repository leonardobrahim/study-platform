import { useState, useEffect } from "react";
import { api } from "../services/api";
import type { Subject } from "../types/subject";
import { Play, Pause, Square, BookOpen, Clock } from "lucide-react";

export function Timer() {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [selectedSubject, setSelectedSubject] = useState("");

  // Estados do Cronômetro e da Sessão API
  const [time, setTime] = useState(0); // Tempo em segundos
  const [isRunning, setIsRunning] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null); // Guarda o ID do backend

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
        <div className="bg-indigo-100 p-3 rounded-full text-indigo-600">
          <Clock size={28} />
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
    </div>
  );
}
