"use client";

import Image from "next/image";
import { useState } from "react";
import { motion } from "framer-motion";

interface Review {
  id: string;
  userName: string;
  userLocation: string;
  rating: number;
  date: string;
  tripType?: string;
  comment: string;
  avatar?: string;
}

interface ReviewsSectionProps {
  overallRating?: number;
  totalReviews?: number;
  isTopPercentage?: boolean;
  percentageRank?: number;
  ratings?: {
    cleanliness: number;
    accuracy: number;
    checkin: number;
    communication: number;
    location: number;
    value: number;
  };
  reviews?: Review[];
}

export default function ReviewsSection({
  overallRating = 5.0,
  totalReviews = 127,
  isTopPercentage = true,
  percentageRank = 5,
  ratings = {
    cleanliness: 4.9,
    accuracy: 5.0,
    checkin: 5.0,
    communication: 5.0,
    location: 5.0,
    value: 5.0,
  },
  reviews = [
    {
      id: "1",
      userName: "Bic",
      userLocation: "Manalapan Township, New Jersey",
      rating: 5,
      date: "June 2025",
      comment:
        "This apartment is one of the best Airbnb that we have stayed at anywhere so far. The host is very responsive and nice. The place is beautiful decorated and spacious and at center...",
    },
    {
      id: "2",
      userName: "Van",
      userLocation: "Colbert, Washington",
      rating: 5,
      date: "1 day ago",
      tripType: "Group trip",
      comment:
        "Uyển place was wonderful. Walking distance to city center and night market, he exactly as described, quite and peaceful. The rooms were comfortable and clean. Uyển is...",
    },
  ],
}: ReviewsSectionProps) {
  const [showAllReviews, setShowAllReviews] = useState(false);

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, index) => (
      <span key={index} className={index < rating ? "text-yellow-400" : "text-gray-300"}>
        ⭐
      </span>
    ));
  };

  const getInitials = (name: string) => {
    return name.charAt(0).toUpperCase();
  };

  const displayedReviews = showAllReviews ? reviews : reviews.slice(0, 2);

  return (
    <motion.div
      className="bg-white rounded-xl shadow-lg p-6 mt-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Top badge + rating (matches screenshot) */}
      <div className="text-center mb-8">
        <div className="flex items-center justify-center gap-4 sm:gap-6 mb-2">
          <Image
            src="/left.jpg"
            alt="Left laurel"
            width={120}
            height={120}
            priority
            className="h-16 w-auto sm:h-20 select-none"
          />
          <span className="font-bold leading-none text-6xl sm:text-7xl md:text-8xl">
            {overallRating.toFixed(1)}
          </span>
          <Image
            src="/asset/right.jpg"
            alt="Right laurel"
            width={120}
            height={120}
            priority
            className="h-16 w-auto sm:h-20 select-none"
          />
        </div>

        <h3 className="text-2xl font-semibold mb-2">Guest favorite</h3>
        {isTopPercentage && (
          <p className="text-gray-600">
            This home is in the <strong>top {percentageRank}%</strong> of eligible listings
            <br />
            based on ratings, reviews, and reliability
          </p>
        )}
      </div>

      {/* Overall Rating Breakdown */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <span className="text-lg font-semibold">Overall rating</span>
          <span className="text-lg font-semibold">{overallRating.toFixed(1)}</span>
        </div>
        <div className="space-y-2">
          {[5, 4, 3, 2, 1].map((star) => (
            <div key={star} className="flex items-center space-x-2">
              <span className="text-sm w-2">{star}</span>
              <div className="flex-1 bg-gray-200 rounded-full h-2">
                <div
                  className="bg-black rounded-full h-2"
                  style={{
                    width:
                      star === 5 ? "95%" : star === 4 ? "3%" : star === 3 ? "1%" : star === 2 ? "0.5%" : "0.5%",
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Rating Categories (icons aligned like screenshot) */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <div className="text-center">
          <div className="text-3xl mb-2">🧽</div>
          <div className="font-medium text-sm">Cleanliness</div>
          <div className="text-xl font-bold">{ratings.cleanliness}</div>
        </div>
        <div className="text-center">
          <div className="text-3xl mb-2">✅</div>
          <div className="font-medium text-sm">Accuracy</div>
          <div className="text-xl font-bold">{ratings.accuracy}</div>
        </div>
        <div className="text-center">
          <div className="text-3xl mb-2">🔑</div>
          <div className="font-medium text-sm">Check-in</div>
          <div className="text-xl font-bold">{ratings.checkin}</div>
        </div>
        <div className="text-center">
          <div className="text-3xl mb-2">💬</div>
          <div className="font-medium text-sm">Communication</div>
          <div className="text-xl font-bold">{ratings.communication}</div>
        </div>
        <div className="text-center">
          <div className="text-3xl mb-2">📍</div>
          <div className="font-medium text-sm">Location</div>
          <div className="text-xl font-bold">{ratings.location}</div>
        </div>
        <div className="text-center">
          <div className="text-3xl mb-2">🏷️</div>
          <div className="font-medium text-sm">Value</div>
          <div className="text-xl font-bold">{ratings.value}</div>
        </div>
      </div>

      {/* Reviews List */}
      <div className="space-y-6">
        <h4 className="text-xl font-semibold">Reviews ({totalReviews})</h4>

        {displayedReviews.map((review, index) => (
          <motion.div
            key={review.id}
            className="border-b border-gray-100 pb-6 last:border-b-0"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
          >
            <div className="flex items-start space-x-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                {getInitials(review.userName)}
              </div>
              <div className="flex-1">
                <div className="flex items-center flex-wrap gap-2 mb-2">
                  <span className="font-semibold text-lg">{review.userName}</span>
                  <div className="flex">{renderStars(review.rating)}</div>
                  <span className="text-gray-500 text-sm">
                    {review.date}
                    {review.tripType && ` • ${review.tripType}`}
                  </span>
                </div>
                <p className="text-gray-600 text-sm mb-2">{review.userLocation}</p>
                <p className="text-gray-800 leading-relaxed">{review.comment}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Show More/Less Button */}
      {reviews.length > 2 && (
        <button
          onClick={() => setShowAllReviews(!showAllReviews)}
          className="w-full mt-6 py-3 border-2 border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium"
        >
          {showAllReviews ? `Show less reviews` : `Show all ${totalReviews} reviews`}
        </button>
      )}

      {/* Add Review Button */}
      <div className="mt-6 pt-6 border-t border-gray-200">
        <button className="w-full py-3 bg-gradient-to-r from-pink-500 to-red-500 text-white rounded-lg hover:from-pink-600 hover:to-red-600 transition-all font-medium">
          Write a Review
        </button>
      </div>
    </motion.div>
  );
}
