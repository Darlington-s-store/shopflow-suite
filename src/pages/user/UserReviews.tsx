import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Star, MessageSquare, Clock, CheckCircle, XCircle, Edit2, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useReviews } from '@/contexts/ReviewContext';
import { useProductManagement } from '@/contexts/ProductManagementContext';
import { toast } from 'sonner';
import { ReviewStatus } from '@/types';

const statusConfig: Record<ReviewStatus, { label: string; color: string; icon: typeof Clock }> = {
    PENDING: { label: 'Pending', color: 'bg-yellow-500/10 text-yellow-600', icon: Clock },
    APPROVED: { label: 'Approved', color: 'bg-green-500/10 text-green-600', icon: CheckCircle },
    REJECTED: { label: 'Rejected', color: 'bg-red-500/10 text-red-600', icon: XCircle },
    HIDDEN: { label: 'Hidden', color: 'bg-gray-500/10 text-gray-600', icon: XCircle },
};

export default function UserReviews() {
    const { getUserReviews, deleteReview } = useReviews();
    const { products } = useProductManagement();
    const navigate = useNavigate();
    const [deleteId, setDeleteId] = useState<string | null>(null);

    const reviews = getUserReviews();

    const getProductDetails = (productId: string) => {
        return products.find(p => p.id === productId);
    };

    const handleDelete = () => {
        if (deleteId) {
            deleteReview(deleteId);
            toast.success('Review deleted successfully');
            setDeleteId(null);
        }
    };

    const stats = {
        total: reviews.length,
        approved: reviews.filter(r => r.status === 'APPROVED').length,
        pending: reviews.filter(r => r.status === 'PENDING').length,
        avgRating: reviews.length > 0
            ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
            : '0.0',
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold">My Reviews</h1>
                <p className="text-muted-foreground">Reviews you've written for products</p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card className="border-0 shadow-soft bg-card/80">
                    <CardContent className="p-4 flex items-center gap-4">
                        <div className="h-12 w-12 rounded-xl bg-blue-500/10 flex items-center justify-center">
                            <MessageSquare className="h-6 w-6 text-blue-500" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold">{stats.total}</p>
                            <p className="text-sm text-muted-foreground">Total Reviews</p>
                        </div>
                    </CardContent>
                </Card>
                <Card className="border-0 shadow-soft bg-card/80">
                    <CardContent className="p-4 flex items-center gap-4">
                        <div className="h-12 w-12 rounded-xl bg-yellow-500/10 flex items-center justify-center">
                            <Star className="h-6 w-6 text-yellow-500 fill-yellow-500" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold">{stats.avgRating}</p>
                            <p className="text-sm text-muted-foreground">Avg Rating</p>
                        </div>
                    </CardContent>
                </Card>
                <Card className="border-0 shadow-soft bg-card/80">
                    <CardContent className="p-4 flex items-center gap-4">
                        <div className="h-12 w-12 rounded-xl bg-green-500/10 flex items-center justify-center">
                            <CheckCircle className="h-6 w-6 text-green-500" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold">{stats.approved}</p>
                            <p className="text-sm text-muted-foreground">Approved</p>
                        </div>
                    </CardContent>
                </Card>
                <Card className="border-0 shadow-soft bg-card/80">
                    <CardContent className="p-4 flex items-center gap-4">
                        <div className="h-12 w-12 rounded-xl bg-orange-500/10 flex items-center justify-center">
                            <Clock className="h-6 w-6 text-orange-500" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold">{stats.pending}</p>
                            <p className="text-sm text-muted-foreground">Pending</p>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Reviews List */}
            {reviews.length === 0 ? (
                <Card className="border-0 shadow-soft bg-card/80">
                    <CardContent className="py-16 text-center">
                        <Star className="h-16 w-16 mx-auto text-muted-foreground/30 mb-4" />
                        <h3 className="text-lg font-medium mb-2">No reviews yet</h3>
                        <p className="text-muted-foreground mb-4">
                            You haven't written any product reviews
                        </p>
                        <Button onClick={() => navigate('/dashboard/orders')}>
                            View Orders to Review
                        </Button>
                    </CardContent>
                </Card>
            ) : (
                <div className="space-y-4">
                    {reviews.map((review) => {
                        const product = getProductDetails(review.productId);
                        const config = statusConfig[review.status];
                        const StatusIcon = config.icon;

                        return (
                            <Card
                                key={review.id}
                                className="border-0 shadow-soft bg-card/80 overflow-hidden hover:shadow-lg transition-shadow"
                            >
                                <CardContent className="p-0">
                                    <div className="flex flex-col md:flex-row">
                                        {/* Product Image */}
                                        <div
                                            className="w-full md:w-48 h-48 md:h-auto bg-muted cursor-pointer"
                                            onClick={() => product && navigate(`/product/${product.slug}`)}
                                        >
                                            {product?.images[0] ? (
                                                <img
                                                    src={product.images[0].url}
                                                    alt={product.name}
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center">
                                                    <MessageSquare className="h-12 w-12 text-muted-foreground/30" />
                                                </div>
                                            )}
                                        </div>

                                        {/* Review Content */}
                                        <div className="flex-1 p-4 md:p-6 space-y-4">
                                            <div className="flex items-start justify-between gap-4">
                                                <div>
                                                    <h3
                                                        className="font-semibold text-lg cursor-pointer hover:text-primary transition-colors"
                                                        onClick={() => product && navigate(`/product/${product.slug}`)}
                                                    >
                                                        {product?.name || 'Unknown Product'}
                                                    </h3>
                                                    <div className="flex items-center gap-2 mt-1">
                                                        <div className="flex items-center">
                                                            {[...Array(5)].map((_, i) => (
                                                                <Star
                                                                    key={i}
                                                                    className={`h-4 w-4 ${i < review.rating
                                                                        ? 'text-yellow-400 fill-yellow-400'
                                                                        : 'text-muted stroke-muted-foreground'
                                                                        }`}
                                                                />
                                                            ))}
                                                        </div>
                                                        <span className="text-sm text-muted-foreground">
                                                            {new Date(review.createdAt).toLocaleDateString()}
                                                        </span>
                                                    </div>
                                                </div>
                                                <Badge variant="outline" className={config.color}>
                                                    <StatusIcon className="h-3 w-3 mr-1" />
                                                    {config.label}
                                                </Badge>
                                            </div>

                                            {review.title && (
                                                <h4 className="font-medium">{review.title}</h4>
                                            )}

                                            <p className="text-muted-foreground">{review.comment}</p>

                                            {review.isVerifiedPurchase && (
                                                <Badge variant="secondary" className="gap-1">
                                                    <CheckCircle className="h-3 w-3" />
                                                    Verified Purchase
                                                </Badge>
                                            )}

                                            <div className="flex items-center gap-2 pt-2">
                                                <Button variant="outline" size="sm" disabled>
                                                    <Edit2 className="h-4 w-4 mr-2" />
                                                    Edit
                                                </Button>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    className="text-destructive hover:text-destructive"
                                                    onClick={() => setDeleteId(review.id)}
                                                >
                                                    <Trash2 className="h-4 w-4 mr-2" />
                                                    Delete
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>
            )}

            {/* Delete Confirmation */}
            <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Review</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to delete this review? This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
