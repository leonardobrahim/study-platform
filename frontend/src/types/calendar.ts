export interface CalendarEvent {
  id: string;
  title: string;
  type: 'TASK' | 'SESSION' | 'ASSESSMENT' | 'REVIEW';
  date: string;
  end_date?: string | null;
  status?: string | null;
  subject_name?: string | null;
  color?: string | null;
}
