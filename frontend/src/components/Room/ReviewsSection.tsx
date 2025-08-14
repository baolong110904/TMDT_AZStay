"use client";

import Image from "next/image";
import { FaSprayCan, FaCheckCircle, FaKey, FaCommentDots, FaMapMarkedAlt, FaTag } from "react-icons/fa";
import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import leftImg from "../../assets/left.jpg";
import rightImg from "../../assets/right.jpg";

interface Review {
  id: string;
  userName: string;
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
  reviews: Review[];
}

export default function ReviewsSection({
  overallRating = 5.0,
  totalReviews,
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
  reviews,
}: ReviewsSectionProps) {
  const [showAllReviews, setShowAllReviews] = useState(false);
  const [showLearnPopover, setShowLearnPopover] = useState(false);
  const popoverRef = useRef<HTMLDivElement | null>(null);
  const learnBtnRef = useRef<HTMLButtonElement | null>(null);
  const [popoverPosition, setPopoverPosition] = useState<'top' | 'bottom'>('bottom');

  useEffect(() => {
    if (!showLearnPopover) return;
    function handleClick(e: MouseEvent) {
      if (
        popoverRef.current &&
        !popoverRef.current.contains(e.target as Node) &&
        learnBtnRef.current &&
        !learnBtnRef.current.contains(e.target as Node)
      ) {
        setShowLearnPopover(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [showLearnPopover]);

  useEffect(() => {
    if (!showLearnPopover) return;
    if (!learnBtnRef.current) return;
    const btnRect = learnBtnRef.current.getBoundingClientRect();
    const popoverHeight = 320;
    const spaceBelow = window.innerHeight - btnRect.bottom;
    const spaceAbove = btnRect.top;
    if (spaceBelow < popoverHeight && spaceAbove > popoverHeight) {
      setPopoverPosition('top');
    } else {
      setPopoverPosition('bottom');
    }
  }, [showLearnPopover]);

  const getInitials = (name: string) => name.charAt(0).toUpperCase();
  const [expandedComments, setExpandedComments] = useState<{ [id: string]: boolean }>({});
  const displayedReviews = showAllReviews ? reviews : reviews.slice(0, 4);

  return (
    <motion.div
      className="bg-white rounded-xl shadow-lg p-6 mt-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Header */}
      <div className="text-center mb-8">
        <div className="flex items-center justify-center gap-2 sm:gap-4 mb-2">
          <Image src={leftImg} alt="Left laurel" width={220} height={220} priority className="h-20 w-auto sm:h-28 select-none" />
          <span className="font-bold leading-none text-6xl sm:text-7xl md:text-8xl">
            {overallRating.toFixed(1)}
          </span>
          <Image src={rightImg} alt="Right laurel" width={220} height={220} priority className="h-20 w-auto sm:h-28 select-none" />
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

      {/* Ratings breakdown */}
      <div className="mb-8 w-full flex flex-col lg:flex-row items-stretch justify-between gap-0 border-b border-gray-200 pb-8">
        {/* Stars */}
        <div className="flex flex-col justify-center items-start min-w-[160px] max-w-[180px] pr-4 border-r border-gray-200">
          <span className="text-base font-semibold mb-2">Overall rating</span>
          <div className="w-full">
            {[5, 4, 3, 2, 1].map((star) => (
              <div key={star} className="flex items-center mb-1">
                <span className="text-xs w-3 text-gray-700 font-medium">{star}</span>
                <div className="flex-1 bg-gray-200 rounded-full h-1 mx-1">
                  <div
                    className="bg-black rounded-full h-1"
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

        {/* Category Ratings */}
        <div className="flex-1 grid grid-cols-6 divide-x divide-gray-200">
          {Object.entries(ratings).map(([key, value]) => {
            const iconMap = {
              cleanliness: <FaSprayCan className="text-xl text-gray-700" />,
              accuracy: <FaCheckCircle className="text-xl text-gray-700" />,
              checkin: <FaKey className="text-xl text-gray-700" />,
              communication: <FaCommentDots className="text-xl text-gray-700" />,
              location: <FaMapMarkedAlt className="text-xl text-gray-700" />,
              value: <FaTag className="text-xl text-gray-700" />,
            };
            type RatingKey = keyof typeof iconMap;
            return (
              <div key={key} className="flex flex-col items-center justify-center px-2">
                <span className="font-semibold text-base mb-0.5">{key.charAt(0).toUpperCase() + key.slice(1)}</span>
                <span className="text-xl font-bold mb-0.5">{value}</span>
                {iconMap[key as RatingKey]}
              </div>
            );
          })}
        </div>
      </div>

      {/* Reviews */}
      <div className="mb-8">
        <h4 className="text-xl font-semibold mb-6">Reviews ({typeof totalReviews === 'number' ? totalReviews : reviews.length})</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-8">
          {displayedReviews.map((review, index) => (
            <motion.div
              key={review.id}
              className="flex flex-col border-b border-gray-100 pb-6 last:border-b-0"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              <div className="flex items-start gap-4">
                {review.avatar ? (
                  <img src={review.avatar} alt={review.userName} className="w-12 h-12 rounded-full object-cover" />
                ) : (
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                    {getInitials(review.userName)}
                  </div>
                )}
                <div className="flex-1">
                  {/* THÊM LẠI TÊN USER */}
                  <div className="text-base font-semibold text-gray-900">{review.userName}</div>
                  
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-black text-sm font-medium">
                      {"★".repeat(Math.round(review.rating))}{"☆".repeat(5 - Math.round(review.rating))}
                    </span>
                    <span className="text-gray-700 text-sm font-medium">{review.date}</span>
                    {review.tripType && (
                      <span className="text-gray-500 text-sm">• {review.tripType}</span>
                    )}
                  </div>
                  <div className="text-gray-800 text-base leading-relaxed mb-2">
                    {review.comment.length > 140 && !expandedComments[review.id] ? (
                      <>
                        {review.comment.slice(0, 140)} ...
                        <span
                          className="font-semibold underline cursor-pointer ml-1"
                          onClick={() => setExpandedComments((prev) => ({ ...prev, [review.id]: true }))}
                        >
                          Show more
                        </span>
                      </>
                    ) : review.comment.length > 140 && expandedComments[review.id] ? (
                      <>
                        {review.comment}
                        <span
                          className="font-semibold underline cursor-pointer ml-1"
                          onClick={() => setExpandedComments((prev) => ({ ...prev, [review.id]: false }))}
                        >
                          Show less
                        </span>
                      </>
                    ) : (
                      review.comment
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Show more/less */}
      {reviews.length > 2 && (
        <div className="flex items-center justify-start gap-4 mt-6 relative">
          <button
            onClick={() => setShowAllReviews(!showAllReviews)}
            className="px-6 py-3 rounded-xl bg-gray-100 text-base font-medium border border-gray-200 hover:bg-gray-200 transition-colors"
          >
            {showAllReviews ? `Show less reviews` : `Show all ${typeof totalReviews === 'number' ? totalReviews : reviews.length} reviews`}
          </button>
          <button
            type="button"
            className="text-gray-600 text-base underline hover:text-gray-800 whitespace-nowrap focus:outline-none"
            ref={learnBtnRef}
            onClick={() => setShowLearnPopover(true)}
          >
            Learn how reviews work
          </button>
          {showLearnPopover && (
            <div
              ref={popoverRef}
              className={`absolute left-1/2 z-50 w-[370px] max-w-[95vw] -translate-x-1/2 bg-white rounded-xl shadow-2xl border border-gray-300 p-6 text-base animate-fadein`}
              style={popoverPosition === 'top' ? { bottom: '110%' } : { top: '110%' }}
            >
              <div
                className={
                  popoverPosition === 'top'
                    ? 'absolute left-1/2 translate-x-[-50%] bottom-[-14px] border-l-[14px] border-l-transparent border-r-[14px] border-r-transparent border-t-[14px] border-t-white drop-shadow-lg'
                    : 'absolute left-1/2 translate-x-[-50%] top-[-14px] border-l-[14px] border-l-transparent border-r-[14px] border-r-transparent border-b-[14px] border-b-white drop-shadow-lg'
                }
              />
              <button
                className="absolute top-3 right-3 text-gray-500 hover:text-black text-xl font-bold"
                onClick={() => setShowLearnPopover(false)}
              >
                ×
              </button>
              <div className="text-gray-900 leading-relaxed text-base">
                <p className="mb-4">Reviews from past guests help our community learn more about each home...</p>
                <a href="#" className="underline font-semibold text-black hover:text-blue-700">Learn more in our Help Center</a>
              </div>
            </div>
          )}
        </div>
      )}
    </motion.div>
  );
}
