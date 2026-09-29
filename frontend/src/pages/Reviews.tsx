import { useState, useEffect } from "react";
import { CheckCircle, Clock, Calendar, RotateCw, AlertCircle } from "lucide-react";
import { reviewService } from "../services/reviewService";
import type { Review } from "../types/review";

export function Reviews() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      // Fetch only pending reviews
      const data = await reviewService.getReviews("PENDING");
      setReviews(data);
    } catch (error) {
      console.error("Erro ao carregar revisões:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const handleComplete = async (id: string) => {
    try {
      await reviewService.updateReview(id, { status: "COMPLETED" });
      setReviews(reviews.filter((r) => r.id !== id));
    } catch (error) {
      console.error("Erro ao concluir revisão:", error);
    }
  };

  // Grouping logic
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const todayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);

  const overdue = reviews.filter(r => new Date(r.due_date) < todayStart);
  const today = reviews.filter(r => {
    const d = new Date(r.due_date);
    return d >= todayStart && d <= todayEnd;
  });
  const upcoming = reviews.filter(r => new Date(r.due_date) > todayEnd);

  const renderReviewCard = (review: Review, isOverdue: boolean) => (
    <div key={review.id} className={`bg-white border rounded-xl p-4 shadow-sm flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between ${isOverdue ? 'border-red-200 bg-red-50/30' : 'border-gray-200'}`}>
      <div className="flex items-start gap-4">
        <div className={`p-3 rounded-lg ${isOverdue ? 'bg-red-100 text-red-600' : 'bg-indigo-100 text-indigo-600'}`}>
          <RotateCw size={24} />
        </div>
        <div>
          <h3 className="font-semibold text-gray-900 line-clamp-1">{review.topic.name}</h3>
          <div className="flex items-center gap-3 text-sm text-gray-500 mt-1">
            <span className="flex items-center gap-1">
              <Calendar size={14} />
              Revisão {review.review_number}/3
            </span>
            <span className="flex items-center gap-1">
              <Clock size={14} />
              {new Date(review.due_date).toLocaleDateString()}
            </span>
          </div>
        </div>
      </div>
      
      <button 
        onClick={() => handleComplete(review.id)}
        className="w-full sm:w-auto px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition flex items-center justify-center gap-2 font-medium"
      >
        <CheckCircle size={18} />
        Concluir Revisão
      </button>
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-12">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Revisões Espaçadas</h1>
          <p className="text-gray-500 mt-2">Mantenha seu conhecimento fresco com revisões no tempo certo.</p>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <RotateCw className="animate-spin text-indigo-600" size={32} />
        </div>
      ) : (
        <div className="space-y-8">
          {/* Overdue Section */}
          {overdue.length > 0 && (
            <section className="space-y-4">
              <div className="flex items-center gap-2 text-red-600">
                <AlertCircle size={20} />
                <h2 className="text-lg font-bold">Atrasadas</h2>
                <span className="bg-red-100 text-red-700 text-xs py-1 px-2 rounded-full font-semibold">
                  {overdue.length}
                </span>
              </div>
              <div className="grid gap-4">
                {overdue.map(r => renderReviewCard(r, true))}
              </div>
            </section>
          )}

          {/* Today Section */}
          <section className="space-y-4">
            <div className="flex items-center gap-2 text-gray-900">
              <CheckCircle size={20} className="text-green-600" />
              <h2 className="text-lg font-bold">Para Hoje</h2>
              <span className="bg-gray-100 text-gray-700 text-xs py-1 px-2 rounded-full font-semibold">
                {today.length}
              </span>
            </div>
            {today.length === 0 ? (
              <div className="text-center py-8 bg-gray-50 rounded-xl border border-gray-200 border-dashed">
                <p className="text-gray-500">Nenhuma revisão programada para hoje. Tudo em dia! 🎉</p>
              </div>
            ) : (
              <div className="grid gap-4">
                {today.map(r => renderReviewCard(r, false))}
              </div>
            )}
          </section>

          {/* Upcoming Section */}
          {upcoming.length > 0 && (
            <section className="space-y-4 pt-4 border-t border-gray-200">
              <div className="flex items-center gap-2 text-gray-600">
                <Calendar size={20} />
                <h2 className="text-lg font-bold">Próximas Revisões</h2>
                <span className="bg-gray-100 text-gray-700 text-xs py-1 px-2 rounded-full font-semibold">
                  {upcoming.length}
                </span>
              </div>
              <div className="grid gap-4 opacity-75">
                {upcoming.map(r => renderReviewCard(r, false))}
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  );
}
