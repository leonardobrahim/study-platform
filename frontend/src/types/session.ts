export interface StudySession {
  id: string;
  subject_id: string;
  topic_id: string | null;
  start_time: string;
  end_time: string | null;
  duration: number | null;
  notes: string | null;
  created_at: string;
}
