import { useEffect, useState } from "react";
import { api } from "../services/api";
import type { StudySession } from "../types/session";
import type { Subject, Topic } from "../types/subject";
import { Clock, BookOpen } from "lucide-react";

export function Sessions() {
  const [sessions, setSessions] = useState<StudySession[]>([]);
  const [subjectMap, setSubjectMap] = useState<Record<string, Subject>>({});
  const [topicMap, setTopicMap] = useState<Record<string, Topic>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchAll() {
      try {
        const [sessionsRes, subjectsRes, topicsRes] = await Promise.all([
          api.get("/sessions/"),
          api.get("/subjects/"),
          api.get("/topics/"),
        ]);

        setSessions(sessionsRes.data);

        const sMap: Record<string, Subject> = {};
        subjectsRes.data.forEach((s: Subject) => (sMap[s.id] = s));
        setSubjectMap(sMap);

        const tMap: Record<string, Topic> = {};
        topicsRes.data.forEach((t: Topic) => (tMap[t.id] = t));
        setTopicMap(tMap);
      } catch (error) {
        console.error("Erro ao buscar histórico de sessões", error);
      } finally {
        setLoading(false);
      }
    }
    fetchAll();
  }, []);

  const formatDuration = (totalSeconds: number) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    if (hours === 0) return `${minutes}min`;
    return `${hours}h${minutes > 0 ? ` ${minutes}min` : ""}`;
  };

  const formatDayLabel = (dateStr: string) => {
    const date = new Date(dateStr);
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);

    const isSameDay = (a: Date, b: Date) =>
      a.getFullYear() === b.getFullYear() &&
      a.getMonth() === b.getMonth() &&
      a.getDate() === b.getDate();

    if (isSameDay(date, today)) return "Hoje";
    if (isSameDay(date, yesterday)) return "Ontem";
    return date.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "long",
      year: today.getFullYear() !== date.getFullYear() ? "numeric" : undefined,
    });
  };

  // Só sessões finalizadas entram no histórico
  const finishedSessions = sessions
    .filter((s) => s.end_time && s.duration)
    .sort(
      (a, b) =>
        new Date(b.start_time).getTime() - new Date(a.start_time).getTime(),
    );

  // Agrupa por dia
  const groups: { label: string; sessions: StudySession[] }[] = [];
  finishedSessions.forEach((session) => {
    const label = formatDayLabel(session.start_time);
    const existingGroup = groups.find((g) => g.label === label);
    if (existingGroup) {
      existingGroup.sessions.push(session);
    } else {
      groups.push({ label, sessions: [session] });
    }
  });

  const totalSeconds = finishedSessions.reduce(
    (sum, s) => sum + (s.duration ?? 0),
    0,
  );

  if (loading)
    return (
      <div className="text-indigo-600 font-bold">Carregando histórico...</div>
    );

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Histórico de Sessões
          </h1>
          <p className="text-gray-500">
            Tudo o que você já estudou, organizado por dia.
          </p>
        </div>
        <div className="flex items-center gap-2 bg-indigo-50 text-indigo-700 font-bold px-4 py-2 rounded-lg">
          <Clock size={18} />
          {formatDuration(totalSeconds)} no total
        </div>
      </div>

      {groups.length === 0 ? (
        <div className="bg-white p-8 rounded-xl border border-gray-100 text-center">
          <p className="text-gray-500">
            Nenhuma sessão finalizada ainda. Vá até o Timer e comece a primeira!
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {groups.map((group) => {
            const groupSeconds = group.sessions.reduce(
              (sum, s) => sum + (s.duration ?? 0),
              0,
            );
            return (
              <div key={group.label}>
                <div className="flex items-center justify-between mb-3 px-1">
                  <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wider">
                    {group.label}
                  </h2>
                  <span className="text-sm font-medium text-gray-400">
                    {formatDuration(groupSeconds)}
                  </span>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-100 divide-y divide-gray-100">
                  {group.sessions.map((session) => {
                    const subject = subjectMap[session.subject_id];
                    const topic = session.topic_id
                      ? topicMap[session.topic_id]
                      : null;

                    return (
                      <div
                        key={session.id}
                        className="p-4 flex items-center gap-4"
                      >
                        <div
                          className="p-3 rounded-lg text-white shrink-0"
                          style={{
                            backgroundColor: subject?.color || "#4f46e5",
                          }}
                        >
                          <BookOpen size={20} />
                        </div>
                        <div className="flex-1">
                          <p className="font-bold text-gray-900">
                            {subject?.name ?? "Disciplina removida"}
                          </p>
                          {topic && (
                            <p className="text-sm text-gray-500">
                              {topic.name}
                            </p>
                          )}
                          {session.notes && (
                            <p className="text-sm text-gray-400 mt-1 italic">
                              "{session.notes}"
                            </p>
                          )}
                        </div>
                        <div className="text-right shrink-0">
                          <p className="font-bold text-indigo-600">
                            {formatDuration(session.duration ?? 0)}
                          </p>
                          <p className="text-xs text-gray-400">
                            {new Date(session.start_time).toLocaleTimeString(
                              "pt-BR",
                              {
                                hour: "2-digit",
                                minute: "2-digit",
                              },
                            )}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
