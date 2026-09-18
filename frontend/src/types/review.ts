export interface ReviewTopic {
  id: string;
  name: string;
}

export interface Review {
  id: string;
  user_id: string;
  topic_id: string;
  topic: ReviewTopic;
  due_date: string;
  completed_at: string | null;
  status: 'PENDING' | 'COMPLETED';
  review_number: number;
  created_at: string;
}

export interface ReviewUpdate {
  status?: 'PENDING' | 'COMPLETED';
  completed_at?: string | null;
}
