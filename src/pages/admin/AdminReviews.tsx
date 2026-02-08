import { useState, useEffect, useCallback } from 'react';
import {
    Search, Star, Check, X, Eye, EyeOff, Trash2, Filter,
    MessageSquare, User, Calendar, ThumbsUp, ThumbsDown, MoreVertical, RefreshCw
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';

type ReviewStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'HIDDEN';

interface Review {
    id: string;
    productId: string;
    productName: string;
    productImage: string;
    userId: string;
    userName: string;
    userEmail: string;
    rating: number;
    title: string;
    comment: string;
    status: ReviewStatus;
    isVerifiedPurchase: boolean;
    helpfulCount: number;
    createdAt: string;
    moderatedAt?: string;
    moderatedBy?: string;
    rejectionReason?: string;
}

const statusColors: Record<ReviewStatus, string> = {
    PENDING: 'bg-yellow-100 text-yellow-700 border-0',
    APPROVED: 'bg-green-100 text-green-700 border-0',
    REJECTED: 'bg-red-100 text-red-700 border-0',
    HIDDEN: 'bg-slate-100 text-slate-700 border-0',
};

export default function AdminReviews() {
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
    const { token } = useAuth();
    const [reviews, setReviews] = useState<Review[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [ratingFilter, setRatingFilter] = useState('all');
    const [selectedReview, setSelectedReview] = useState<Review | null>(null);
    const [detailOpen, setDetailOpen] = useState(false);
    const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
    const [rejectionReason, setRejectionReason] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    // Load reviews from backend
    const loadReviews = useCallback(async () => {
        setIsLoading(true);
        try {
            const response = await fetch(`${apiUrl}/reviews`, {
                credentials: 'include',
            });

            if (response.ok) {
                const data = await response.json();
                setReviews(data.reviews || []);
            } else {
                toast.error('Failed to load reviews');
            }
        } catch (error) {
            console.error('Error loading reviews:', error);
            toast.error('Failed to load reviews');
        } finally {
            setIsLoading(false);
        }
    }, [apiUrl, token]);

    useEffect(() => {
        loadReviews();
    }, [loadReviews]);

    const filteredReviews = reviews.filter(r => {
        const matchesSearch = r.productName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            r.userName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            r.comment?.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus = statusFilter === 'all' || r.status === statusFilter;
        const matchesRating = ratingFilter === 'all' || r.rating === parseInt(ratingFilter);
        return matchesSearch && matchesStatus && matchesRating;
    });

    const stats = {
        pending: reviews.filter(r => r.status === 'PENDING').length,
        approved: reviews.filter(r => r.status === 'APPROVED').length,
        rejected: reviews.filter(r => r.status === 'REJECTED').length,
        avgRating: reviews.length > 0 ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1) : '0',
    };

    const handleApprove = async (review: Review) => {
        try {
            const response = await fetch(`${apiUrl}/reviews/${review.id}/status`, {
                method: 'PUT',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ status: 'APPROVED' }),
            });

            if (response.ok) {
                await loadReviews(); // Reload to get updated data
                toast.success('Review approved');
                setDetailOpen(false);
            } else {
                toast.error('Failed to approve review');
            }
        } catch (error) {
            console.error('Error approving review:', error);
            toast.error('Failed to approve review');
        }
    };

    const handleReject = async () => {
        if (!selectedReview) return;

        try {
            const response = await fetch(`${apiUrl}/reviews/${selectedReview.id}/status`, {
                method: 'PUT',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    status: 'REJECTED',
                    rejectionReason
                }),
            });

            if (response.ok) {
                await loadReviews();
                toast.success('Review rejected');
                setRejectDialogOpen(false);
                setDetailOpen(false);
                setRejectionReason('');
            } else {
                toast.error('Failed to reject review');
            }
        } catch (error) {
            console.error('Error rejecting review:', error);
            toast.error('Failed to reject review');
        }
    };

    const handleHide = async (review: Review) => {
        try {
            const response = await fetch(`${apiUrl}/reviews/${review.id}/status`, {
                method: 'PUT',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ status: 'HIDDEN' }),
            });

            if (response.ok) {
                await loadReviews();
                toast.success('Review hidden');
            } else {
                toast.error('Failed to hide review');
            }
        } catch (error) {
            console.error('Error hiding review:', error);
            toast.error('Failed to hide review');
        }
    };

    const handleDelete = async (review: Review) => {
        if (!confirm('Are you sure you want to delete this review? This action cannot be undone.')) {
            return;
        }

        try {
            const response = await fetch(`${apiUrl}/reviews/${review.id}`, {
                method: 'DELETE',
                credentials: 'include',
            });

            if (response.ok) {
                await loadReviews();
                toast.success('Review deleted');
                setDetailOpen(false);
            } else {
                toast.error('Failed to delete review');
            }
        } catch (error) {
            console.error('Error deleting review:', error);
            toast.error('Failed to delete review');
        }
    };

    const openRejectDialog = (review: Review) => {
        setSelectedReview(review);
        setRejectDialogOpen(true);
    };

    const renderStars = (rating: number) => {
        return Array.from({ length: 5 }).map((_, i) => (
            <Star key={i} className={`h-4 w-4 ${i < rating ? 'text-yellow-400 fill-yellow-400' : 'text-slate-300'}`} />
        ));
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Reviews Management</h1>
                    <p className="text-slate-500">Moderate and manage customer reviews</p>
                </div>
                <Button
                    onClick={loadReviews}
                    variant="outline"
                    className="gap-2"
                    disabled={isLoading}
                >
                    <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                    Refresh
                </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <Card className="bg-white border-slate-200 shadow-sm">
                    <CardContent className="p-4">
                        <p className="text-3xl font-bold text-yellow-600">{stats.pending}</p>
                        <p className="text-sm text-slate-500">Pending Review</p>
                    </CardContent>
                </Card>
                <Card className="bg-white border-slate-200 shadow-sm">
                    <CardContent className="p-4">
                        <p className="text-3xl font-bold text-green-600">{stats.approved}</p>
                        <p className="text-sm text-slate-500">Approved</p>
                    </CardContent>
                </Card>
                <Card className="bg-white border-slate-200 shadow-sm">
                    <CardContent className="p-4">
                        <p className="text-3xl font-bold text-red-600">{stats.rejected}</p>
                        <p className="text-sm text-slate-500">Rejected</p>
                    </CardContent>
                </Card>
                <Card className="bg-white border-slate-200 shadow-sm">
                    <CardContent className="p-4">
                        <div className="flex items-center gap-2">
                            <p className="text-3xl font-bold text-orange-600">{stats.avgRating}</p>
                            <Star className="h-6 w-6 text-yellow-400 fill-yellow-400" />
                        </div>
                        <p className="text-sm text-slate-500">Avg Rating</p>
                    </CardContent>
                </Card>
            </div>

            {/* Filters */}
            <Card className="bg-white border-slate-200 shadow-sm">
                <CardContent className="p-4 flex flex-col sm:flex-row gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <Input placeholder="Search reviews..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10 bg-slate-50 border-slate-200 text-slate-900" />
                    </div>
                    <div className="flex gap-4">
                        <Select value={statusFilter} onValueChange={setStatusFilter}>
                            <SelectTrigger className="w-[140px] bg-slate-50 border-slate-200 text-slate-900"><SelectValue placeholder="Status" /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Status</SelectItem>
                                <SelectItem value="PENDING">Pending</SelectItem>
                                <SelectItem value="APPROVED">Approved</SelectItem>
                                <SelectItem value="REJECTED">Rejected</SelectItem>
                                <SelectItem value="HIDDEN">Hidden</SelectItem>
                            </SelectContent>
                        </Select>
                        <Select value={ratingFilter} onValueChange={setRatingFilter}>
                            <SelectTrigger className="w-[140px] bg-slate-50 border-slate-200 text-slate-900"><SelectValue placeholder="Rating" /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Ratings</SelectItem>
                                <SelectItem value="5">5 Stars</SelectItem>
                                <SelectItem value="4">4 Stars</SelectItem>
                                <SelectItem value="3">3 Stars</SelectItem>
                                <SelectItem value="2">2 Stars</SelectItem>
                                <SelectItem value="1">1 Star</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </CardContent>
            </Card>

            {/* Reviews Table */}
            <Card className="bg-white border-slate-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow className="border-slate-200 hover:bg-transparent">
                                <TableHead className="text-slate-500 min-w-[300px]">Product</TableHead>
                                <TableHead className="text-slate-500 min-w-[200px]">Customer</TableHead>
                                <TableHead className="text-slate-500 min-w-[120px]">Rating</TableHead>
                                <TableHead className="text-slate-500 min-w-[100px]">Status</TableHead>
                                <TableHead className="text-slate-500 min-w-[100px]">Date</TableHead>
                                <TableHead className="text-slate-500 text-right min-w-[120px]">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoading ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center py-8 text-slate-500">
                                        <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-2" />
                                        Loading reviews...
                                    </TableCell>
                                </TableRow>
                            ) : filteredReviews.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center py-8 text-slate-500">
                                        No reviews found
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filteredReviews.map(review => (
                                    <TableRow key={review.id} className="border-slate-100 hover:bg-slate-50">
                                        <TableCell>
                                            <div className="flex items-center gap-3">
                                                {review.productImage && (
                                                    <img src={review.productImage} alt="" className="h-10 w-10 rounded-lg object-cover border border-slate-200 shrink-0" />
                                                )}
                                                <div>
                                                    <p className="font-medium text-slate-900">{review.productName}</p>
                                                    <p className="text-xs text-slate-500 line-clamp-1">{review.title}</p>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div>
                                                <p className="font-medium text-slate-900">{review.userName}</p>
                                                {review.isVerifiedPurchase && (
                                                    <Badge className="text-xs bg-green-100 text-green-700 border-0 hover:bg-green-100">Verified</Badge>
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex">{renderStars(review.rating)}</div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="outline" className={statusColors[review.status]}>{review.status}</Badge>
                                        </TableCell>
                                        <TableCell className="text-slate-500">
                                            {new Date(review.createdAt).toLocaleDateString()}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-1">
                                                <Button variant="ghost" size="icon" onClick={() => { setSelectedReview(review); setDetailOpen(true); }} className="text-slate-500 hover:text-slate-900 hover:bg-slate-100">
                                                    <Eye className="h-4 w-4" />
                                                </Button>
                                                {review.status === 'PENDING' && (
                                                    <>
                                                        <Button variant="ghost" size="icon" className="text-green-600 hover:text-green-700 hover:bg-green-50" onClick={() => handleApprove(review)}>
                                                            <Check className="h-4 w-4" />
                                                        </Button>
                                                        <Button variant="ghost" size="icon" className="text-red-600 hover:text-red-700 hover:bg-red-50" onClick={() => openRejectDialog(review)}>
                                                            <X className="h-4 w-4" />
                                                        </Button>
                                                    </>
                                                )}
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>
            </Card>

            {/* Review Detail Dialog */}
            <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
                <DialogContent className="max-w-2xl bg-white border-slate-200 text-slate-900">
                    <DialogHeader>
                        <DialogTitle>Review Details</DialogTitle>
                    </DialogHeader>
                    {selectedReview && (
                        <div className="space-y-4">
                            <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-lg border border-slate-200">
                                {selectedReview.productImage && (
                                    <img src={selectedReview.productImage} alt="" className="h-16 w-16 rounded-lg object-cover" />
                                )}
                                <div>
                                    <p className="font-medium text-slate-900">{selectedReview.productName}</p>
                                    <div className="flex gap-2 mt-1">
                                        {renderStars(selectedReview.rating)}
                                    </div>
                                </div>
                                <Badge variant="outline" className={`ml-auto ${statusColors[selectedReview.status]}`}>{selectedReview.status}</Badge>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                                    <p className="text-xs text-slate-500">Customer</p>
                                    <p className="font-medium">{selectedReview.userName}</p>
                                    <p className="text-sm text-slate-500">{selectedReview.userEmail}</p>
                                    {selectedReview.isVerifiedPurchase && (
                                        <Badge className="mt-1 text-xs bg-green-100 text-green-700 border-0">Verified Purchase</Badge>
                                    )}
                                </div>
                                <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                                    <p className="text-xs text-slate-500">Date Submitted</p>
                                    <p className="font-medium">{new Date(selectedReview.createdAt).toLocaleString()}</p>
                                    <p className="text-sm text-slate-500">{selectedReview.helpfulCount || 0} found helpful</p>
                                </div>
                            </div>

                            <div className="p-4 bg-slate-50 rounded-lg border border-slate-100">
                                <p className="font-medium mb-2">{selectedReview.title}</p>
                                <p className="text-slate-700">{selectedReview.comment}</p>
                            </div>

                            {selectedReview.rejectionReason && (
                                <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                                    <p className="text-xs text-red-600 font-medium">Rejection Reason</p>
                                    <p className="text-red-700">{selectedReview.rejectionReason}</p>
                                </div>
                            )}

                            <div className="flex gap-2 pt-4">
                                {selectedReview.status === 'PENDING' && (
                                    <>
                                        <Button onClick={() => handleApprove(selectedReview)} className="gap-2 bg-green-600 hover:bg-green-700">
                                            <Check className="h-4 w-4" /> Approve
                                        </Button>
                                        <Button onClick={() => openRejectDialog(selectedReview)} variant="destructive" className="gap-2">
                                            <X className="h-4 w-4" /> Reject
                                        </Button>
                                    </>
                                )}
                                {selectedReview.status === 'APPROVED' && (
                                    <Button onClick={() => handleHide(selectedReview)} variant="outline" className="gap-2 border-slate-300 text-slate-700 hover:bg-slate-50">
                                        <EyeOff className="h-4 w-4" /> Hide Review
                                    </Button>
                                )}
                                <Button onClick={() => handleDelete(selectedReview)} variant="outline" className="gap-2 border-red-200 text-red-600 hover:bg-red-50 ml-auto">
                                    <Trash2 className="h-4 w-4" /> Delete
                                </Button>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>

            {/* Reject Dialog */}
            <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
                <DialogContent className="bg-white border-slate-200 text-slate-900">
                    <DialogHeader>
                        <DialogTitle>Reject Review</DialogTitle>
                        <DialogDescription className="text-slate-500">
                            Provide a reason for rejecting this review
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label>Rejection Reason</Label>
                            <Textarea
                                value={rejectionReason}
                                onChange={(e) => setRejectionReason(e.target.value)}
                                className="bg-slate-50 border-slate-200"
                                placeholder="e.g., Spam, Inappropriate content, Off-topic..."
                                rows={3}
                            />
                        </div>
                    </div>
                    <DialogFooter className="mt-4">
                        <Button variant="outline" onClick={() => setRejectDialogOpen(false)} className="border-slate-200">Cancel</Button>
                        <Button variant="destructive" onClick={handleReject} disabled={!rejectionReason}>Reject Review</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
