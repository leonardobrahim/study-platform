export interface SubjectProgress {
  subject_id: string;
  name: string;
  color: string | null;
  progress_percentage: number;
}

export interface TaskSummary {
  id: string;
  title: string;
  due_date: string | null;
}

export interface SessionSummary {
  id: string;
  subject_name: string;
  duration: number | null;
  start_time: string;
}

export interface DashboardData {
  total_time_studied_seconds: number;
  pending_tasks_count: number;
  overall_progress_percentage: number;
  subjects_progress: SubjectProgress[];
  next_tasks: TaskSummary[];
  recent_sessions: SessionSummary[];
}
