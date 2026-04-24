'use client';

import React, { useEffect, useState } from 'react';
import { Star, CheckCircle, ThumbsUp } from 'lucide-react';
import axios from 'axios';
import { useSession } from 'next-auth/react';
import { toast } from 'react-toastify';

import { Progress } from './ui/progress';
import { Button } from './ui/button';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Badge } from './ui/badge';
import { Skeleton } from './ui/skeleton';

interface Review {
  _id: string;
  rating: number;
  comment: string;
  userId: {
    _id: string;
    name: string;
    image?: string;
  };
  helpfulCount: number;
  helpfulUsers: string[];
  replies: {
    _id: string;
    userId: {
      _id: string;
      name: string;
      image?: string;
    };
    text: string;
    createdAt: string;
  }[];
  isVerified: boolean;
  createdAt: string;
  hasMoreReplies?: boolean;
  totalReplies?: number;
}

export function ReviewsSection({ carId }: Readonly<{ carId: string }>) {
  const { data: session } = useSession();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [replyText, setReplyText] = useState<{ [key: string]: string }>({});
  const [showReplyForm, setShowReplyForm] = useState<{
    [key: string]: boolean;
  }>({});
  const [expandedReplies, setExpandedReplies] = useState<{
    [key: string]: boolean;
  }>({});
  const [loadingReplies, setLoadingReplies] = useState<{
    [key: string]: boolean;
  }>({});
  const [filterRating, setFilterRating] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const pageSize = carId ? 2 : 3;

  const fetchFullReplies = async (reviewId: string) => {
    if (loadingReplies[reviewId]) {
      return;
    }

    try {
      setLoadingReplies((prev) => ({ ...prev, [reviewId]: true }));
      // Fetch all replies from server-side for security and consistency
      const { data } = await axios.get(`/api/reviews/${reviewId}/replies?page=1&limit=100`);

      setReviews((prev) =>
        prev.map((r) =>
          r._id === reviewId ? { ...r, replies: data.replies, hasMoreReplies: false } : r
        )
      );

      setExpandedReplies((prev) => ({ ...prev, [reviewId]: true }));
    } catch (error) {
      console.error('Failed to fetch replies', error);
      toast.error('Failed to load replies');
    } finally {
      setLoadingReplies((prev) => ({ ...prev, [reviewId]: false }));
    }
  };

  const isUserHelpful = (review: Review) => {
    if (!session?.user) {
      return false;
    }
    const userId = session.user._id || session.user.id;
    return review.helpfulUsers?.some((id) => id.toString() === userId?.toString());
  };

  const updateHelpfulState = (
    prev: Review[],
    reviewId: string,
    data: { isHelpful: boolean; helpfulCount: number },
    userId: string,
    userIdStr: string
  ) =>
    prev.map((r) => {
      if (r._id !== reviewId) {
        return r;
      }

      let newHelpfulUsers = r.helpfulUsers || [];
      if (data.isHelpful) {
        newHelpfulUsers = [...newHelpfulUsers, userId];
      } else {
        newHelpfulUsers = newHelpfulUsers.filter((id) => id.toString() !== userIdStr);
      }

      return {
        ...r,
        helpfulCount: data.helpfulCount,
        helpfulUsers: newHelpfulUsers,
      };
    });

  const handleHelpful = async (reviewId: string) => {
    if (!session?.user) {
      toast.error('Please login to vote');
      return;
    }
    try {
      const { data } = await axios.post<{
        isHelpful: boolean;
        helpfulCount: number;
      }>(`/api/reviews/${reviewId}/helpful`);
      const userId = (session.user._id || session.user.id)?.toString();
      const userIdStr = userId;

      if (userId) {
        setReviews((prev) => updateHelpfulState(prev, reviewId, data, userId, userIdStr));
      }
    } catch (error) {
      console.error('Helpful update error:', error);
      toast.error('Failed to update helpful status');
    }
  };

  const handleReplySubmit = async (reviewId: string) => {
    if (!session) {
      toast.error('Please login to reply');
      return;
    }
    if (!replyText[reviewId]?.trim()) {
      return;
    }

    try {
      const { data } = await axios.post(`/api/reviews/${reviewId}/reply`, {
        text: replyText[reviewId],
      });
      setReviews((prev) =>
        prev.map((r) => (r._id === reviewId ? { ...r, replies: [...r.replies, data] } : r))
      );
      setReplyText((prev) => ({ ...prev, [reviewId]: '' }));
      setShowReplyForm((prev: { [key: string]: boolean }) => ({
        ...prev,
        [reviewId]: false,
      }));
      toast.success('Reply posted!');
    } catch (error) {
      console.error('Reply submit error:', error);
      toast.error('Failed to post reply');
    }
  };

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        setLoading(true);
        const ratingQuery = filterRating ? `&rating=${filterRating}` : '';
        const url = `/api/reviews?carId=${carId}&page=${currentPage}&limit=${pageSize}${ratingQuery}`;
        const { data } = await axios.get(url);
        setReviews(data.reviews);
        setTotalPages(data.pagination.totalPages);
        setTotalCount(data.pagination.total);
      } catch (error) {
        console.error('Failed to fetch reviews', error);
      } finally {
        setLoading(false);
      }
    };
    fetchReviews();
  }, [carId, currentPage, filterRating, pageSize]);

  const averageRating =
    totalCount > 0
      ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1)
      : '0.0';

  const ratingCounts = [5, 4, 3, 2, 1].map((star) => ({
    star,
    count: reviews.filter((r) => r.rating === star).length, // This is local only, but fine for percentages UI
    percentage:
      totalCount > 0 ? (reviews.filter((r) => r.rating === star).length / reviews.length) * 100 : 0,
  }));

  if (loading && reviews.length === 0) {
    return (
      <div className="mt-16 bg-white dark:bg-slate-900 rounded-3xl p-8 border border-gray-100 dark:border-slate-800 shadow-sm animate-pulse">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Left Skeleton */}
          <div className="lg:col-span-4 space-y-6">
            <div className="space-y-2">
              <Skeleton className="h-8 w-48" />
              <div className="flex items-end gap-4">
                <Skeleton className="h-16 w-20" />
                <div className="pb-2 space-y-2">
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Skeleton key={s} className="h-5 w-5 rounded-full" />
                    ))}
                  </div>
                  <Skeleton className="h-4 w-24" />
                </div>
              </div>
            </div>
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex items-center gap-4">
                  <Skeleton className="h-4 w-12" />
                  <Skeleton className="h-2 flex-1" />
                  <Skeleton className="h-4 w-10" />
                </div>
              ))}
            </div>
          </div>
          {/* Right Skeleton */}
          <div className="lg:col-span-8 space-y-8">
            <div className="flex justify-between items-center">
              <Skeleton className="h-7 w-40" />
              <Skeleton className="h-4 w-32" />
            </div>
            <div className="space-y-6">
              {[1, 2].map((i) => (
                <div key={i} className="bg-gray-50 dark:bg-slate-800/50 rounded-3xl p-6 space-y-4">
                  <div className="flex items-center gap-4">
                    <Skeleton className="h-12 w-12 rounded-full" />
                    <div className="space-y-2">
                      <Skeleton className="h-5 w-32" />
                      <Skeleton className="h-4 w-24" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-5/6" />
                  </div>
                  <div className="flex justify-between items-center pt-2">
                    <div className="flex gap-4">
                      <Skeleton className="h-4 w-20" />
                      <Skeleton className="h-4 w-20" />
                    </div>
                    <Skeleton className="h-4 w-24" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!loading && reviews.length === 0 && !filterRating) {
    return null;
  }

  return (
    <div className="mt-16 bg-white dark:bg-slate-900 rounded-3xl p-8 border border-gray-100 dark:border-slate-800 shadow-sm">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* Left Section: Community Feedback */}
        <div className="lg:col-span-4 space-y-6">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Community Feedback
            </h2>
            <div className="flex items-end gap-4">
              <span className="text-6xl font-bold text-gray-900 dark:text-white">
                {averageRating}
              </span>
              <div className="pb-2">
                <div className="flex mb-1">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star
                      key={s}
                      className={`h-5 w-5 ${s <= Math.round(Number(averageRating)) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-200'}`}
                    />
                  ))}
                </div>
                <p className="text-sm text-muted-foreground">
                  {totalCount.toLocaleString()} Reviews
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            {ratingCounts.map((rc) => (
              <button
                key={rc.star}
                onClick={() => {
                  setFilterRating(filterRating === rc.star ? null : rc.star);
                  setCurrentPage(1);
                }}
                className={`w-full flex items-center gap-4 hover:bg-gray-100 dark:hover:bg-slate-800 p-2 rounded-xl transition-colors ${
                  filterRating === rc.star ? 'bg-primary/5 ring-1 ring-primary/20' : ''
                }`}
              >
                <span
                  className={`text-sm font-medium w-12 ${filterRating === rc.star ? 'text-primary' : ''}`}
                >
                  {rc.star} star
                </span>
                <Progress value={rc.percentage} className="h-2 flex-1" />
                <span className="text-sm text-muted-foreground w-10 text-right">
                  {Math.round(rc.percentage)}%
                </span>
              </button>
            ))}
            {Boolean(filterRating) && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setFilterRating(null);
                  setCurrentPage(1);
                }}
                className="w-full text-xs text-primary underline"
              >
                Clear filter
              </Button>
            )}
          </div>
        </div>

        {/* Right Section: Top Perspectives */}
        <div className="lg:col-span-8 space-y-8">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-bold">
              {filterRating ? `${filterRating} Star Reviews` : 'Top Perspectives'}
            </h3>
            <div className="flex gap-2 text-sm text-muted-foreground">
              {loading ? (
                <Skeleton className="h-4 w-32" />
              ) : (
                <>
                  Showing {reviews.length} of {totalCount} reviews
                </>
              )}
            </div>
          </div>

          <div className="space-y-6">
            {loading
              ? [1, 2].map((i) => (
                  <div
                    key={`skeleton-${i}`}
                    className="bg-gray-50 dark:bg-slate-800/50 rounded-3xl p-6 space-y-4 animate-pulse"
                  >
                    <div className="flex items-center gap-4">
                      <Skeleton className="h-12 w-12 rounded-full" />
                      <div className="space-y-2">
                        <Skeleton className="h-5 w-32" />
                        <Skeleton className="h-4 w-24" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-5/6" />
                    </div>
                    <div className="flex justify-between items-center pt-2">
                      <div className="flex gap-4">
                        <Skeleton className="h-4 w-20" />
                        <Skeleton className="h-4 w-20" />
                      </div>
                      <Skeleton className="h-4 w-24" />
                    </div>
                  </div>
                ))
              : null}

            {!loading && reviews.length === 0 && (
              <div className="py-12 bg-gray-50 dark:bg-slate-800/50 rounded-2xl text-center text-muted-foreground italic">
                {filterRating
                  ? `No ${filterRating} star reviews found.`
                  : 'No reviews yet. Be the first to review this car!'}
              </div>
            )}

            {!loading &&
              reviews.length > 0 &&
              reviews.map((review) => (
                <div
                  key={review._id}
                  className="bg-gray-50 dark:bg-slate-800/50 rounded-3xl p-6 relative"
                >
                  {review.rating >= 4 && (
                    <Badge className="absolute top-4 right-4 bg-blue-100 text-blue-700 hover:bg-blue-100 border-none px-3 py-1 text-[10px] font-bold tracking-wider uppercase flex gap-1 items-center">
                      <CheckCircle className="w-3 h-3" /> HIGHLY RATED
                    </Badge>
                  )}
                  <div className="flex items-center gap-4 mb-4">
                    <Avatar className="h-12 w-12 border-2 border-white dark:border-slate-700">
                      <AvatarImage src={review.userId?.image} />
                      <AvatarFallback>{review.userId?.name?.charAt(0) || 'U'}</AvatarFallback>
                    </Avatar>
                    <div>
                      <h4 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        {review.userId?.name}
                        {review.isVerified ? (
                          <Badge
                            variant="secondary"
                            className="text-[10px] font-medium h-5 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400"
                          >
                            VERIFIED BUYER
                          </Badge>
                        ) : null}
                      </h4>
                      <div className="flex">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <Star
                            key={s}
                            className={`h-4 w-4 ${s <= review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-200'}`}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                  <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                    {review.comment}
                  </p>
                  <div className="mt-4 flex flex-col gap-4">
                    <div className="flex justify-between items-center text-xs text-muted-foreground">
                      <div className="flex gap-4">
                        <button
                          onClick={() => handleHelpful(review._id)}
                          className={`font-medium flex items-center gap-1.5 transition-colors ${
                            isUserHelpful(review)
                              ? 'text-primary cursor-pointer bg-primary/10 px-2 py-0.5 rounded-full'
                              : 'text-muted-foreground hover:text-primary cursor-pointer'
                          }`}
                        >
                          <ThumbsUp
                            className={`w-3.5 h-3.5 ${
                              isUserHelpful(review) ? 'fill-primary text-primary' : ''
                            }`}
                          />
                          Helpful ({review.helpfulCount || 0})
                        </button>
                        <button
                          onClick={() =>
                            setShowReplyForm((prev: { [key: string]: boolean }) => ({
                              ...prev,
                              [review._id]: !prev[review._id],
                            }))
                          }
                          className="text-muted-foreground hover:text-primary cursor-pointer font-medium flex items-center gap-1 transition-colors"
                        >
                          Reply ({review.replies?.length || 0})
                        </button>
                      </div>
                      <span>Posted {new Date(review.createdAt).toLocaleDateString()}</span>
                    </div>

                    {/* Replies */}
                    {review.replies?.length > 0 && (
                      <div className="pl-6 space-y-4 border-l-2 border-gray-100 dark:border-slate-700 mt-2">
                        {(expandedReplies[review._id]
                          ? review.replies
                          : review.replies.slice(0, 2)
                        ).map((reply) => (
                          <div key={reply._id} className="text-sm">
                            <div className="flex items-center gap-2 mb-1">
                              <Avatar className="h-6 w-6">
                                <AvatarImage src={reply.userId?.image} />
                                <AvatarFallback>
                                  {reply.userId?.name?.charAt(0) || 'U'}
                                </AvatarFallback>
                              </Avatar>
                              <span className="font-semibold">{reply.userId?.name}</span>
                              <span className="text-xs text-muted-foreground">
                                {new Date(reply.createdAt).toLocaleDateString()}
                              </span>
                            </div>
                            <p className="text-gray-600 dark:text-gray-400">{reply.text}</p>
                          </div>
                        ))}
                        {Boolean(review.totalReplies && review.totalReplies > 2) && (
                          <button
                            onClick={() => {
                              if (review.hasMoreReplies) {
                                fetchFullReplies(review._id);
                              } else {
                                setExpandedReplies((prev) => ({
                                  ...prev,
                                  [review._id]: !prev[review._id],
                                }));
                              }
                            }}
                            className="text-xs font-semibold text-primary hover:underline cursor-pointer disabled:opacity-50"
                            disabled={loadingReplies[review._id]}
                          >
                            {loadingReplies[review._id] ? 'Loading...' : null}
                            {!loadingReplies[review._id] && expandedReplies[review._id]
                              ? 'Hide replies'
                              : ''}
                            {!loadingReplies[review._id] && !expandedReplies[review._id]
                              ? `Show all ${review.totalReplies} replies`
                              : ''}
                          </button>
                        )}
                      </div>
                    )}

                    {/* Reply Form */}
                    {showReplyForm[review._id] ? (
                      <div className="mt-2 pl-6">
                        <textarea
                          value={replyText[review._id] || ''}
                          onChange={(e) =>
                            setReplyText((prev) => ({
                              ...prev,
                              [review._id]: e.target.value,
                            }))
                          }
                          placeholder="Write a reply..."
                          className="w-full text-sm bg-background border rounded-lg p-3 focus:outline-none focus:ring-1 focus:ring-primary"
                          rows={2}
                        />
                        <div className="flex justify-end gap-2 mt-2">
                          <button
                            onClick={() =>
                              setShowReplyForm((prev: { [key: string]: boolean }) => ({
                                ...prev,
                                [review._id]: false,
                              }))
                            }
                            className="text-xs font-medium px-3 py-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={() => handleReplySubmit(review._id)}
                            className="text-xs font-medium px-3 py-1.5 bg-primary text-primary-foreground rounded-md hover:opacity-90 transition-opacity"
                          >
                            Post Reply
                          </button>
                        </div>
                      </div>
                    ) : null}
                  </div>
                </div>
              ))}

            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-4 pt-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1 || loading}
                  className="rounded-xl px-4 h-10 border-gray-200"
                >
                  Previous
                </Button>

                <div className="flex gap-2">
                  {Array.from({ length: totalPages }).map((_, i) => (
                    <button
                      key={i + 1}
                      onClick={() => setCurrentPage(i + 1)}
                      disabled={loading}
                      className={`w-10 h-10 rounded-xl text-sm font-medium transition-all ${
                        currentPage === i + 1
                          ? 'bg-primary text-primary-foreground shadow-md'
                          : 'bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 hover:border-primary/50'
                      } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      {i + 1}
                    </button>
                  ))}
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages || loading}
                  className="rounded-xl px-4 h-10 border-gray-200"
                >
                  Next
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
