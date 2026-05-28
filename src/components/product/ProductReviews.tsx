"use client";

import { useState, useMemo, useEffect } from "react";
import { Star, Edit, Trash2, MessageSquareReply, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  getProductReviews,
  submitProductReview,
  updateProductReview,
  deleteProductReview,
} from "@/app/actions/reviews";

type ReviewData = {
  id: number;
  userId: string | null;
  userName: string | null;
  rating: number;
  reviewText: string;
  createdAt: string;
  adminReply: string | null;
  showOnWebsite: boolean;
};

interface DBUser {
  id: string;
  phone: string | null;
  email: string | null;
  fullName: string | null;
  role: "admin" | "user";
  createdAt: Date;
}

interface ProductReviewsProps {
  productId: number;
  currentUser: DBUser | null;
}

const formatCount = (num: number): string => {
  if (num >= 1000000)
    return (num / 1000000).toFixed(1).replace(/\.0$/, "") + "M";
  if (num >= 1000) return (num / 1000).toFixed(1).replace(/\.0$/, "") + "k";
  return num.toString();
};

const formatDate = (isoString: string): string => {
  const date = new Date(isoString);
  return date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

export function ProductReviews({
  productId,
  currentUser,
}: ProductReviewsProps) {
  const router = useRouter();
  const [reviews, setReviews] = useState<ReviewData[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const [ratingInput, setRatingInput] = useState<number>(0);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [reviewText, setReviewText] = useState<string>("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const activeUser = currentUser || null;
  const isLoggedIn = !!activeUser;

  const displayUserName = activeUser?.fullName || "";

  const [authDialogOpen, setAuthDialogOpen] = useState<boolean>(false);

  const fetchReviews = async () => {
    setIsLoading(true);
    const data = await getProductReviews(productId);
    const typedData = data as ReviewData[];
    setReviews(typedData.filter((r: ReviewData) => r.showOnWebsite));
    setIsLoading(false);
  };

  useEffect(() => {
    fetchReviews();
  }, [productId]);

  const stats = useMemo(() => {
    const total = reviews.length;
    const average =
      total > 0
        ? (reviews.reduce((acc, r) => acc + r.rating, 0) / total).toFixed(1)
        : "0.0";
    const counts = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };

    reviews.forEach((r) => {
      if (r.rating >= 1 && r.rating <= 5) {
        counts[r.rating as keyof typeof counts]++;
      }
    });

    return { total, average, counts };
  }, [reviews]);

  const handleSubmit = async () => {
    if (!isLoggedIn) {
      setAuthDialogOpen(true);
      return;
    }

    if (ratingInput === 0) {
      toast.error("Please select a rating.");
      return;
    }
    if (reviewText.trim().length < 5) {
      toast.error("Review must be at least 5 characters.");
      return;
    }

    setIsSubmitting(true);

    if (editingId) {
      const res = await updateProductReview(editingId, ratingInput, reviewText);
      if (res.success) {
        toast.success("Review updated successfully");
        setReviews(
          reviews.map((r) =>
            r.id === editingId
              ? { ...r, rating: ratingInput, reviewText: reviewText }
              : r,
          ),
        );
        setEditingId(null);
        setRatingInput(0);
        setReviewText("");
      } else {
        toast.error("Failed to update review");
      }
    } else {
      const res = await submitProductReview(
        productId,
        ratingInput,
        reviewText,
        activeUser.id,
        displayUserName,
      );
      if (res.success && res.id) {
        toast.success("Review submitted successfully!");

        const newReview: ReviewData = {
          id: res.id,
          userId: activeUser.id,
          userName: displayUserName,
          rating: ratingInput,
          reviewText: reviewText,
          createdAt: new Date().toISOString(),
          adminReply: null,
          showOnWebsite: true,
        };
        setReviews([newReview, ...reviews]);

        setRatingInput(0);
        setReviewText("");
      } else {
        toast.error("Failed to submit review");
      }
    }

    setIsSubmitting(false);
  };

  const handleEdit = (r: ReviewData) => {
    setEditingId(r.id);
    setRatingInput(r.rating);
    setReviewText(r.reviewText);
    const formElement = document.getElementById("review-form");
    if (formElement) {
      window.scrollTo({ top: formElement.offsetTop - 100, behavior: "smooth" });
    }
  };

  const handleDelete = async (id: number) => {
    const res = await deleteProductReview(id);
    if (res.success) {
      setReviews(reviews.filter((r) => r.id !== id));
      toast.success("Review deleted");
      if (editingId === id) {
        setEditingId(null);
        setRatingInput(0);
        setReviewText("");
      }
    } else {
      toast.error("Failed to delete review");
    }
  };

  const sortedReviews = useMemo(() => {
    return [...reviews].sort((a, b) => {
      const aIsMine = activeUser !== null && a.userId === activeUser.id;
      const bIsMine = activeUser !== null && b.userId === activeUser.id;
      if (aIsMine && !bIsMine) return -1;
      if (!aIsMine && bIsMine) return 1;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }, [reviews, activeUser]);

  return (
    <div className="py-8" id="reviews-section">
      <h2 className="text-2xl sm:text-3xl font-medium tracking-tight text-foreground mb-8">
        Customer Reviews
      </h2>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        <div className="lg:col-span-7 xl:col-span-8 space-y-8">
          <div className="bg-secondary/10 border border-border/50 rounded-xl p-6 flex flex-col sm:flex-row gap-8 items-center sm:items-stretch">
            <div className="flex flex-col items-center justify-center space-y-2 sm:pr-8 sm:border-r border-border/60">
              <span className="text-5xl font-extrabold text-foreground">
                {stats.average}
              </span>
              <div className="flex text-amber-500">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    size={18}
                    fill={
                      i < Math.round(Number(stats.average))
                        ? "currentColor"
                        : "none"
                    }
                  />
                ))}
              </div>
              <span className="text-sm font-medium text-muted-foreground">
                {formatCount(stats.total)} Reviews
              </span>
            </div>

            <div className="flex-1 w-full space-y-2">
              {[5, 4, 3, 2, 1].map((star) => {
                const count = stats.counts[star as keyof typeof stats.counts];
                const percentage =
                  stats.total > 0 ? (count / stats.total) * 100 : 0;
                return (
                  <div key={star} className="flex items-center gap-3 text-sm">
                    <span className="w-10 font-medium text-muted-foreground flex items-center justify-end gap-1">
                      {star}{" "}
                      <Star
                        size={12}
                        fill="currentColor"
                        className="text-amber-500"
                      />
                    </span>
                    <Progress
                      value={percentage}
                      className="h-2 flex-1 bg-secondary"
                    />
                    <span className="w-12 text-right text-muted-foreground">
                      {formatCount(count)}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          <Separator />

          <div className="space-y-6">
            {isLoading ? (
              <div className="flex justify-center py-10">
                <Loader2 className="animate-spin text-primary" size={32} />
              </div>
            ) : sortedReviews.length === 0 ? (
              <div className="text-center py-10 text-muted-foreground">
                No reviews yet. Be the first to review!
              </div>
            ) : (
              <AnimatePresence>
                {sortedReviews.map((review, index) => {
                  // Security Validation Check: Strict comparison with active session ID
                  const isMyReview =
                    activeUser !== null && review.userId === activeUser.id;
                  return (
                    <motion.div
                      key={review.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="space-y-4"
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                            {review.userName
                              ? review.userName.charAt(0).toUpperCase()
                              : "U"}
                          </div>
                          <div>
                            <p className="font-semibold text-foreground text-sm flex items-center gap-2">
                              {review.userName || "Customer"}
                              {isMyReview && (
                                <span className="text-[10px] bg-secondary px-2 py-0.5 rounded-full text-muted-foreground">
                                  You
                                </span>
                              )}
                            </p>
                            <div className="flex items-center gap-2 mt-0.5">
                              <div className="flex text-amber-500">
                                {[...Array(5)].map((_, i) => (
                                  <Star
                                    key={i}
                                    size={12}
                                    fill={
                                      i < review.rating
                                        ? "currentColor"
                                        : "none"
                                    }
                                  />
                                ))}
                              </div>
                              <span className="text-xs text-muted-foreground">
                                • {formatDate(review.createdAt)}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Authorization Check: Nodes are only exposed to the original review author */}
                        {isMyReview && (
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleEdit(review)}
                              className="p-1.5 text-muted-foreground hover:text-primary transition-colors bg-secondary/50 rounded-md"
                            >
                              <Edit size={14} />
                            </button>
                            <button
                              onClick={() => handleDelete(review.id)}
                              className="p-1.5 text-muted-foreground hover:text-destructive transition-colors bg-secondary/50 rounded-md"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        )}
                      </div>

                      <p className="text-sm text-foreground/90 leading-relaxed">
                        {review.reviewText}
                      </p>

                      {review.adminReply && (
                        <div className="mt-3 ml-6 bg-secondary/20 p-3 rounded-md border-l-2 border-primary">
                          <p className="text-xs font-bold text-primary flex items-center gap-1.5 mb-1">
                            <MessageSquareReply size={14} /> Admin Reply
                          </p>
                          <p className="text-xs text-foreground/80">
                            {review.adminReply}
                          </p>
                        </div>
                      )}

                      {index !== sortedReviews.length - 1 && (
                        <Separator className="mt-6" />
                      )}
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            )}
          </div>
        </div>

        <div
          className="lg:col-span-5 xl:col-span-4 sticky top-24"
          id="review-form"
        >
          <div className="bg-background border border-border shadow-sm rounded-xl p-6">
            <h3 className="text-lg font-bold text-foreground mb-1">
              {editingId ? "Edit your Review" : "Write a Review"}
            </h3>
            <p className="text-sm text-muted-foreground mb-6">
              Share your thoughts and experiences with other customers.
            </p>

            <div className="space-y-5">
              <div className="space-y-2">
                <label className="text-sm font-semibold">
                  Your Rating <span className="text-destructive">*</span>
                </label>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      onClick={() => setRatingInput(star)}
                      className="p-1 transition-transform hover:scale-110 focus:outline-none"
                    >
                      <Star
                        size={28}
                        className={
                          (hoverRating || ratingInput) >= star
                            ? "text-amber-500 fill-amber-500"
                            : "text-border"
                        }
                      />
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold">
                  Your Review <span className="text-destructive">*</span>
                </label>
                <textarea
                  rows={4}
                  value={reviewText}
                  onChange={(e) => setReviewText(e.target.value)}
                  placeholder="What did you like or dislike? How is the fit and quality?"
                  className="w-full bg-transparent border border-border rounded-md p-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
                  disabled={isSubmitting}
                />
              </div>

              <div className="space-y-3 pt-2">
                <Button
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="w-full h-11 rounded-md font-bold uppercase tracking-wider"
                >
                  {isSubmitting ? (
                    <Loader2 className="animate-spin mr-2" size={16} />
                  ) : null}
                  {editingId ? "Update Review" : "Submit Review"}
                </Button>
                <p className="text-[10px] text-center text-muted-foreground">
                  By submitting, you agree to our Terms & Conditions.
                </p>
              </div>

              {editingId && (
                <Button
                  variant="ghost"
                  className="w-full h-8 text-xs text-muted-foreground"
                  onClick={() => {
                    setEditingId(null);
                    setRatingInput(0);
                    setReviewText("");
                  }}
                  disabled={isSubmitting}
                >
                  Cancel Edit
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Validation Dialog for Unauthenticated Users */}
      <AlertDialog open={authDialogOpen} onOpenChange={setAuthDialogOpen}>
        <AlertDialogContent className="rounded-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-bold">
              Authentication Required
            </AlertDialogTitle>
            <AlertDialogDescription>
              You must be signed in to submit a review for this product.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex flex-row justify-end gap-3 sm:gap-3 mt-4">
            <Button
              variant="outline"
              onClick={() => setAuthDialogOpen(false)}
              className="rounded-md m-0"
            >
              Cancel
            </Button>
            <Button
              onClick={() => {
                setAuthDialogOpen(false);
                router.push("/login");
              }}
              className="rounded-md m-0"
            >
              Yes, understand
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
