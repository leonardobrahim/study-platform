import { api } from './api';
import type { Review, ReviewUpdate } from '../types/review';

export const reviewService = {
  getReviews: async (status?: string): Promise<Review[]> => {
    const params = status ? { status } : {};
    const response = await api.get('/reviews/', { params });
    return response.data;
  },

  updateReview: async (id: string, data: ReviewUpdate): Promise<Review> => {
    const response = await api.patch(`/reviews/${id}`, data);
    return response.data;
  },
};
