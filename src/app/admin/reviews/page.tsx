"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Star,
  MessageSquare,
  Globe,
  Package,
  Reply,
  Loader2,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import Image from "next/image";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  getAllReviewsAdmin,
  toggleReviewVisibility,
  replyToReview,
} from "@/app/actions/reviews";

type ReviewData = {
  id: number;
  rating: number;
  reviewText: string;
  adminReply: string | null;
  showOnWebsite: boolean;
  createdAt: string;
  productId: number | null;
  userName: string | null;
  productName: string | null;
  productSlug: string | null;
  productImage: string | null;
};

const CustomToggle = ({
  checked,
  onChange,
  disabled,
}: {
  checked: boolean;
  onChange: () => void;
  disabled?: boolean;
}) => (
  <button
    onClick={onChange}
    disabled={disabled}
    className={`w-10 h-5 rounded-full relative transition-colors duration-300 flex items-center px-0.5 ${checked ? "bg-primary" : "bg-secondary-foreground/20"} ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
  >
    <motion.div
      layout
      className="w-4 h-4 bg-white rounded-full shadow-sm"
      animate={{ x: checked ? 20 : 0 }}
      transition={{ type: "spring", stiffness: 500, damping: 30 }}
    />
  </button>
);

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState<ReviewData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"All" | "Product" | "Website">(
    "All",
  );

  const [replyDialogOpen, setReplyDialogOpen] = useState(false);
  const [activeReviewId, setActiveReviewId] = useState<number | null>(null);
  const [replyText, setReplyText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchReviews = async () => {
    setIsLoading(true);
    const data = await getAllReviewsAdmin();
    setReviews(data as ReviewData[]);
    setIsLoading(false);
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const handleToggleWebsiteVisibility = async (
    id: number,
    currentStatus: boolean,
  ) => {
    setReviews(
      reviews.map((r) =>
        r.id === id ? { ...r, showOnWebsite: !currentStatus } : r,
      ),
    );
    const res = await toggleReviewVisibility(id, !currentStatus);
    if (res.success) {
      toast.success(
        !currentStatus
          ? "Review visible on website"
          : "Review hidden from website",
      );
    } else {
      toast.error("Failed to update status");
      fetchReviews();
    }
  };

  const openReplyDialog = (review: ReviewData) => {
    setActiveReviewId(review.id);
    setReplyText(review.adminReply || "");
    setReplyDialogOpen(true);
  };

  const handleReplySubmit = async () => {
    if (!activeReviewId || !replyText.trim()) return;
    setIsSubmitting(true);
    const res = await replyToReview(activeReviewId, replyText);
    if (res.success) {
      toast.success("Reply submitted successfully");
      setReviews(
        reviews.map((r) =>
          r.id === activeReviewId ? { ...r, adminReply: replyText } : r,
        ),
      );
      setReplyDialogOpen(false);
    } else {
      toast.error("Failed to submit reply");
    }
    setIsSubmitting(false);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const filteredReviews = reviews.filter((r) => {
    if (activeTab === "Product") return r.productId !== null;
    if (activeTab === "Website") return r.productId === null;
    return true;
  });

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-10">
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">
            Customer Reviews
          </h2>
          <p className="text-muted-foreground mt-1">
            Monitor feedback, toggle website visibility, and reply to your
            customers.
          </p>
        </div>

        <div className="flex p-1 bg-secondary/30 rounded-full w-fit border border-border/50 shadow-sm">
          {["All", "Product", "Website"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as any)}
              className="relative px-6 py-2.5 text-sm font-semibold rounded-full transition-colors z-10"
            >
              {activeTab === tab && (
                <motion.div
                  layoutId="adminReviewsTab"
                  className="absolute inset-0 bg-background shadow-sm rounded-full border border-border/50 -z-10"
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}
              <span
                className={
                  activeTab === tab
                    ? "text-foreground"
                    : "text-muted-foreground hover:text-foreground/80"
                }
              >
                {tab}
              </span>
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-40">
          <Loader2 className="animate-spin text-primary" size={32} />
        </div>
      ) : filteredReviews.length === 0 ? (
        <div className="text-center p-20 bg-secondary/10 border border-dashed rounded-md text-muted-foreground">
          No reviews found in this category.
        </div>
      ) : (
        // FIX: Grid updated to show 4 cards in a row on large screens
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          <AnimatePresence>
            {filteredReviews.map((review) => (
              <motion.div
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                key={review.id}
                className="bg-background border border-border rounded-xl p-5 flex flex-col justify-between shadow-sm hover:border-primary/20 transition-all duration-300"
              >
                <div>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 shrink-0 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold shadow-sm">
                        {review.userName
                          ? review.userName.charAt(0).toUpperCase()
                          : "U"}
                      </div>
                      <div className="min-w-0">
                        {/* FIX: Displays Real User Name */}
                        <h4 className="font-semibold text-sm text-foreground truncate">
                          {review.userName || "Unknown User"}
                        </h4>
                        <div className="flex items-center gap-2 mt-0.5">
                          <div className="flex text-amber-500 shrink-0">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                size={12}
                                fill={
                                  i < review.rating ? "currentColor" : "none"
                                }
                              />
                            ))}
                          </div>
                          <span className="text-xs text-muted-foreground shrink-0">
                            {formatDate(review.createdAt)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {review.productId && (
                    <div className="flex items-center gap-3 p-2.5 mb-4 bg-secondary/20 rounded-lg border border-border/40 relative group/item">
                      {review.productImage && (
                        <div className="relative w-12 h-15 bg-background rounded-md overflow-hidden border border-border/60 shrink-0">
                          <Image
                            src={review.productImage}
                            alt="Product preview"
                            fill
                            className="object-cover"
                          />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wide">
                          Product Review
                        </p>
                        <h5 className="text-sm font-semibold text-foreground truncate mt-0.5">
                          {review.productName}
                        </h5>
                      </div>

                      {review.productSlug && (
                        <a
                          href={`/product/${review.productSlug}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 shrink-0 bg-background hover:bg-primary/10 text-muted-foreground hover:text-primary rounded-md border border-border/60 shadow-sm transition-colors flex items-center gap-1.5 text-xs font-semibold"
                        >
                          <ExternalLink size={13} />
                        </a>
                      )}
                    </div>
                  )}

                  <p className="text-sm text-foreground/90 leading-relaxed mb-4 whitespace-pre-wrap">
                    {review.reviewText}
                  </p>

                  {review.adminReply && (
                    <div className="mb-4 bg-secondary/20 p-3 rounded-md border-l-2 border-primary">
                      <p className="text-xs font-bold text-primary flex items-center gap-1.5 mb-1">
                        <MessageSquare size={14} /> Your Response
                      </p>
                      <p className="text-xs text-foreground/80">
                        {review.adminReply}
                      </p>
                    </div>
                  )}
                </div>

                <div>
                  <Separator className="my-4" />
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      {review.productId === null ? (
                        <div className="flex items-center gap-2">
                          <CustomToggle
                            checked={review.showOnWebsite}
                            onChange={() =>
                              handleToggleWebsiteVisibility(
                                review.id,
                                review.showOnWebsite,
                              )
                            }
                          />
                          <span className="text-xs font-medium text-muted-foreground">
                            {review.showOnWebsite ? "Visible" : "Hidden"}
                          </span>
                        </div>
                      ) : null}
                    </div>

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => openReplyDialog(review)}
                      className="h-8 text-xs bg-secondary/50 hover:bg-primary/10 hover:text-primary transition-colors rounded-md ml-auto"
                    >
                      <Reply size={14} className="mr-1.5" />{" "}
                      {review.adminReply ? "Edit Reply" : "Add Reply"}
                    </Button>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      <Dialog
        open={replyDialogOpen}
        onOpenChange={(open) => !isSubmitting && setReplyDialogOpen(open)}
      >
        <DialogContent className="rounded-md sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-bold text-lg">
              Reply to Customer
            </DialogTitle>
            <DialogDescription>
              Write a helpful and polite response. This will be visible publicly
              under the review.
            </DialogDescription>
          </DialogHeader>

          <div className="py-4">
            <textarea
              rows={4}
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              placeholder="Thank you for your feedback! We appreciate your support..."
              className="w-full bg-background border border-border rounded-md p-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
              disabled={isSubmitting}
            />
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => setReplyDialogOpen(false)}
              disabled={isSubmitting}
              className="rounded-md"
            >
              Cancel
            </Button>
            <Button
              onClick={handleReplySubmit}
              disabled={!replyText.trim() || isSubmitting}
              className="rounded-md"
            >
              {isSubmitting ? (
                <Loader2 size={16} className="animate-spin mr-2" />
              ) : null}
              Submit Reply
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
