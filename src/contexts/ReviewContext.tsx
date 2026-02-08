import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Review, ReviewStatus } from '@/types';
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

export function ReviewProvider({ children }: { children: ReactNode }) {
  const { user, token } = useAuth();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [allReviews, setAllReviews] = useState<Review[]>([]);
  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

  // Load reviews from backend
  useEffect(() => {
    const loadReviews = async () => {
      try {
        // Only load all reviews if user is admin
        if (user?.role === 'ADMIN' && token) {
          const response = await fetch(`${apiUrl}/admin/reviews`, {
            headers: {
              'Authorization': `Bearer ${token}`,
            },
          });
          if (response.ok) {
            const data = await response.json();
            const reviewsData = Array.isArray(data) ? data : data.reviews || [];
            setAllReviews(reviewsData);
          }
        } else if (user && token) {
          // For regular users, just load product reviews which are public
          // (product reviews will be fetched by productId when needed)
          setReviews([]);
        }
      } catch (error) {
        console.error('Failed to load reviews:', error);
      }
    };

    loadReviews();
  }, [user, token, apiUrl]);

  const getProductReviews = (productId: string, onlyApproved = true) => {
    return allReviews.filter(r =>
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
    if (!token) throw new Error('No authentication token');

    // Check if user already reviewed this product
    const existingReview = reviews.find(
      r => r.productId === data.productId && r.userId === user.id
    );
    if (existingReview) {
      throw new Error('You have already reviewed this product');
    }

    try {
      const response = await fetch(`${apiUrl}/reviews`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          productId: data.productId,
          rating: data.rating,
          title: data.title,
          comment: data.comment,
          orderId: data.orderId,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to submit review');
      }

      const result = await response.json();
      const newReview = result.review || result.data;

      setReviews(prev => [...prev, newReview]);
      setAllReviews(prev => [...prev, newReview]);
    } catch (error) {
      console.error('Submit review error:', error);
      throw error;
    }
  };

  const updateReviewStatus = async (reviewId: string, status: ReviewStatus) => {
    if (!token) return;

    try {
      const response = await fetch(`${apiUrl}/reviews/${reviewId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ status }),
      });

      if (response.ok) {
        const result = await response.json();
        const updatedReview = result.review || result.data;

        setReviews(prev => prev.map(r => r.id === reviewId ? updatedReview : r));
        setAllReviews(prev => prev.map(r => r.id === reviewId ? updatedReview : r));
      }
    } catch (error) {
      console.error('Update review status error:', error);
    }
  };

  const deleteReview = async (reviewId: string) => {
    if (!token) return;

    try {
      await fetch(`${apiUrl}/reviews/${reviewId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      setReviews(prev => prev.filter(r => r.id !== reviewId));
      setAllReviews(prev => prev.filter(r => r.id !== reviewId));
    } catch (error) {
      console.error('Delete review error:', error);
    }
  };

  const canReviewProduct = (productId: string): boolean => {
    if (!user) return false;
    return !allReviews.some(r => r.productId === productId && r.userId === user.id);
  };

  const value: ReviewContextType = {
    reviews,
    allReviews,
    getProductReviews,
    getUserReviews,
    submitReview,
    updateReviewStatus,
    deleteReview,
    canReviewProduct,
  };

  return <ReviewContext.Provider value={value}>{children}</ReviewContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useReviews() {
  const context = useContext(ReviewContext);
  if (context === undefined) {
    throw new Error('useReviews must be used within a ReviewProvider');
  }
  return context;
}
