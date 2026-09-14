export interface Semester {
  id: string;
  name: string;
  year: number;
  period: number;
  status: "ACTIVE" | "ARCHIVED";
  created_at: string;
}
