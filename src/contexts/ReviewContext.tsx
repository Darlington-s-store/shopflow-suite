import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Review, ReviewStatus } from '@/types';
import { mockReviews } from '@/data/mockData';
import { useAuth } from './AuthContext';

interface ReviewContextType {
  reviews: Review[];
  allReviews: Review[];
  getProductReviews: (productId: string, onlyApproved?: boolean) => Review[];
  getUserReviews: () => Review[];
  submitReview: (data: SubmitReviewData) => Promise<void>;
  updateReviewStatus: (reviewId: string, status: ReviewStatus) => void;
  deleteReview: (reviewId: string) => void;
  canReviewProduct: (productId: string) => boolean;
}

interface SubmitReviewData {
  productId: string;
  rating: number;
  title?: string;
  comment: string;
  orderId?: string;
}

const ReviewContext = createContext<ReviewContextType | undefined>(undefined);

const REVIEWS_KEY = 'techmart_reviews';

export function ReviewProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [reviews, setReviews] = useState<Review[]>([]);

  useEffect(() => {
    const savedReviews = localStorage.getItem(REVIEWS_KEY);
    if (savedReviews) {
      setReviews(JSON.parse(savedReviews));
    } else {
      // Initialize with mock reviews
      localStorage.setItem(REVIEWS_KEY, JSON.stringify(mockReviews));
      setReviews(mockReviews);
    }
  }, []);

  const saveReviews = (newReviews: Review[]) => {
    localStorage.setItem(REVIEWS_KEY, JSON.stringify(newReviews));
    setReviews(newReviews);
  };

  const getProductReviews = (productId: string, onlyApproved = true) => {
    return reviews.filter(r => 
      r.productId === productId && 
      (!onlyApproved || r.status === 'APPROVED')
    );
  };

  const getUserReviews = () => {
    if (!user) return [];
    return reviews.filter(r => r.userId === user.id);
  };

  const submitReview = async (data: SubmitReviewData) => {
    if (!user) throw new Error('Must be logged in to submit review');

    // Check if user already reviewed this product
    const existingReview = reviews.find(
      r => r.productId === data.productId && r.userId === user.id
    );
    if (existingReview) {
      throw new Error('You have already reviewed this product');
    }

    const newReview: Review = {
      id: `rev-${Date.now()}`,
      productId: data.productId,
      userId: user.id,
      userName: `${user.firstName} ${user.lastName.charAt(0)}.`,
      orderId: data.orderId,
      rating: data.rating,
      title: data.title,
      comment: data.comment,
      status: 'PENDING',
      isVerifiedPurchase: !!data.orderId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    saveReviews([...reviews, newReview]);
  };

  const updateReviewStatus = (reviewId: string, status: ReviewStatus) => {
    const updated = reviews.map(r =>
      r.id === reviewId
        ? { ...r, status, updatedAt: new Date().toISOString() }
        : r
    );
    saveReviews(updated);
  };

  const deleteReview = (reviewId: string) => {
    saveReviews(reviews.filter(r => r.id !== reviewId));
  };

  const canReviewProduct = (productId: string): boolean => {
    if (!user) return false;
    return !reviews.some(r => r.productId === productId && r.userId === user.id);
  };

  const value: ReviewContextType = {
    reviews,
    allReviews: reviews,
    getProductReviews,
    getUserReviews,
    submitReview,
    updateReviewStatus,
    deleteReview,
    canReviewProduct,
  };

  return <ReviewContext.Provider value={value}>{children}</ReviewContext.Provider>;
}

export function useReviews() {
  const context = useContext(ReviewContext);
  if (context === undefined) {
    throw new Error('useReviews must be used within a ReviewProvider');
  }
  return context;
}
