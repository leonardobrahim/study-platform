export interface Subject {
  id: string;
  name: string;
  color: string | null;
  code: string | null;
  professor: string | null;
}

export interface Topic {
  id: string;
  name: string;
  description: string | null;
  difficulty: "EASY" | "MEDIUM" | "HARD";
  status: "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED";
  subject_id: string;
}
