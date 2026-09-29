import type { Subject, Topic } from "./subject";

export interface Assessment {
  id: string;
  title: string;
  type: "PROVA" | "TRABALHO";
  date: string | null;
  subject_id: string;
  user_id: string;
  topics: Topic[];
  subject?: Subject;
  created_at: string;
}
