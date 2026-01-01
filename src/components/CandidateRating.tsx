import { useState } from 'react';
import { Star } from 'lucide-react';

interface Rating {
  id: string;
  reviewerId: string;
  reviewerName: string;
  rating: number;
  category?: string;
  createdAt: string;
}

interface CandidateRatingProps {
  applicationId: string;
  ratings: Rating[];
  onAddRating: (rating: number, category?: string) => void;
  showCategories?: boolean;
}

const RATING_CATEGORIES = [
  { id: 'technical', label: 'Technical Skills', weight: 30 },
  { id: 'experience', label: 'Experience', weight: 25 },
  { id: 'communication', label: 'Communication', weight: 20 },
  { id: 'culture_fit', label: 'Culture Fit', weight: 15 },
  { id: 'overall', label: 'Overall Impression', weight: 10 },
];

export function CandidateRating({
  applicationId,
  ratings,
  onAddRating,
  showCategories = false,
}: CandidateRatingProps) {
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [selectedCategory, setSelectedCategory] = useState<string>('overall');
  const [showRatingDialog, setShowRatingDialog] = useState(false);

  // Calculate average rating
  const averageRating = ratings.length > 0
    ? ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length
    : 0;

  // Get category-specific ratings
  const getCategoryRatings = (category: string) => {
    return ratings.filter((r) => r.category === category);
  };

  const getCategoryAverage = (category: string) => {
    const categoryRatings = getCategoryRatings(category);
    if (categoryRatings.length === 0) return 0;
    return categoryRatings.reduce((sum, r) => sum + r.rating, 0) / categoryRatings.length;
  };

  const handleStarClick = (rating: number) => {
    onAddRating(rating, showCategories ? selectedCategory : undefined);
    setShowRatingDialog(false);
  };

  const renderStars = (rating: number, interactive: boolean = false, size: 'sm' | 'md' | 'lg' = 'md') => {
    const sizeClass = size === 'sm' ? 'w-4 h-4' : size === 'md' ? 'w-5 h-5' : 'w-6 h-6';
    
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => {
          const filled = star <= (interactive ? (hoverRating || rating) : rating);
          const halfFilled = !filled && star - 0.5 <= rating;

          return (
            <button
              key={star}
              type="button"
              disabled={!interactive}
              onClick={() => interactive && handleStarClick(star)}
              onMouseEnter={() => interactive && setHoverRating(star)}
              onMouseLeave={() => interactive && setHoverRating(0)}
              className={`${interactive ? 'cursor-pointer hover:scale-110' : 'cursor-default'} transition-transform`}
            >
              {halfFilled ? (
                <div className="relative">
                  <Star className={`${sizeClass} text-gray-300`} />
                  <div className="absolute top-0 left-0 overflow-hidden w-1/2">
                    <Star className={`${sizeClass} fill-yellow-400 text-yellow-400`} />
                  </div>
                </div>
              ) : (
                <Star
                  className={`${sizeClass} ${
                    filled ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
                  }`}
                />
              )}
            </button>
          );
        })}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Overall Rating Display */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-500 mb-2">Overall Rating</p>
          <div className="flex items-center gap-3">
            {renderStars(averageRating, false, 'lg')}
            <span className="text-2xl text-gray-900">
              {averageRating > 0 ? averageRating.toFixed(1) : 'Not rated'}
            </span>
          </div>
          {ratings.length > 0 && (
            <p className="text-sm text-gray-500 mt-1">
              Based on {ratings.length} {ratings.length === 1 ? 'review' : 'reviews'}
            </p>
          )}
        </div>
        <button
          onClick={() => setShowRatingDialog(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Add Rating
        </button>
      </div>

      {/* Category Ratings */}
      {showCategories && (
        <div className="border-t border-gray-200 pt-6">
          <h4 className="text-gray-900 mb-4">Rating Breakdown</h4>
          <div className="space-y-3">
            {RATING_CATEGORIES.map((category) => {
              const categoryAvg = getCategoryAverage(category.id);
              const categoryRatings = getCategoryRatings(category.id);
              
              return (
                <div key={category.id} className="flex items-center gap-4">
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm text-gray-700">{category.label}</span>
                      <span className="text-sm text-gray-500">
                        {categoryAvg > 0 ? categoryAvg.toFixed(1) : '-'}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      {renderStars(categoryAvg, false, 'sm')}
                      <span className="text-xs text-gray-400">
                        ({categoryRatings.length} {categoryRatings.length === 1 ? 'rating' : 'ratings'})
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Individual Ratings */}
      {ratings.length > 0 && (
        <div className="border-t border-gray-200 pt-6">
          <h4 className="text-gray-900 mb-4">Individual Ratings</h4>
          <div className="space-y-3">
            {ratings.map((rating) => (
              <div key={rating.id} className="flex items-start justify-between py-2 border-b border-gray-100 last:border-0">
                <div>
                  <p className="text-gray-900">{rating.reviewerName}</p>
                  <p className="text-xs text-gray-500">{rating.createdAt}</p>
                  {rating.category && (
                    <p className="text-xs text-gray-500 mt-1">
                      {RATING_CATEGORIES.find((c) => c.id === rating.category)?.label || rating.category}
                    </p>
                  )}
                </div>
                {renderStars(rating.rating, false, 'sm')}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Rating Dialog */}
      {showRatingDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-6 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6">
            <h3 className="text-gray-900 mb-4">Rate this candidate</h3>
            
            {showCategories && (
              <div className="mb-6">
                <label className="block text-sm text-gray-700 mb-2">Category</label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                >
                  {RATING_CATEGORIES.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.label}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="mb-6">
              <label className="block text-sm text-gray-700 mb-3">Your Rating</label>
              <div className="flex justify-center">
                {renderStars(0, true, 'lg')}
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowRatingDialog(false)}
                className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
