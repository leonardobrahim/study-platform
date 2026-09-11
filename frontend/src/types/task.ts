export interface Task {
  id: string;
  title: string;
  description: string | null;
  due_date: string | null;
  estimated_duration: number | null;
  status: "PENDING" | "COMPLETED";
  priority: "LOW" | "MEDIUM" | "HIGH";
  subject_id: string | null;
  topic_id: string | null;
  created_at: string;
  completed_at: string | null;
}
