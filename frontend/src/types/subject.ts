export interface Subject {
  id: string;
  name: string;
  semester_id: string;
  code: string | null;
  professor: string | null;
  description: string | null;
  color: string | null;
}

export interface Topic {
  id: string;
  name: string;
  description: string | null;
  difficulty: "EASY" | "MEDIUM" | "HARD";
  status: "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED";
  subject_id: string;
}
