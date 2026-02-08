import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Upload, Trash2, Star, Grid3x3, Eye, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { useProductManagement } from '@/contexts/ProductManagementContext';
import { ProductImage } from '@/types/product';

export default function ProductImageManagement() {
    const navigate = useNavigate();
    const { productId } = useParams<{ productId: string }>();
    const { getProduct, uploadImages, deleteImage, setFeaturedImage, reorderImages } = useProductManagement();

    const product = productId ? getProduct(productId) : null;
    const [images, setImages] = useState<ProductImage[]>(product?.images || []);
    const [isDragging, setIsDragging] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [previewImage, setPreviewImage] = useState<ProductImage | null>(null);
    const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

    if (!product) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <div className="text-center">
                    <p className="text-slate-600 mb-4">Product not found</p>
                    <Button onClick={() => navigate('/admin/products')}>Back to Products</Button>
                </div>
            </div>
        );
    }

    const handleDragEnter = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
    };

    const handleDrop = async (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);

        const files = Array.from(e.dataTransfer.files).filter(file =>
            file.type.startsWith('image/')
        );

        if (files.length === 0) {
            toast.error('Please drop image files');
            return;
        }

        await handleUpload(files);
    };

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            await handleUpload(Array.from(e.target.files));
        }
    };

    const handleUpload = async (files: File[]) => {
        if (images.length + files.length > 10) {
            toast.error('Maximum 10 images per product');
            return;
        }

        setIsUploading(true);
        try {
            const result = await uploadImages(files);
            if (result.success && result.images) {
                setImages([...images, ...result.images]);
                toast.success(`${files.length} image(s) uploaded`);
            }
        } finally {
            setIsUploading(false);
        }
    };

    const handleSetFeatured = async (imageId: string) => {
        const result = await setFeaturedImage(product.id, imageId);
        if (result.success) {
            setImages(images.map(img => ({
                ...img,
                isFeatured: img.id === imageId
            })));
            toast.success('Featured image updated');
        }
    };

    const handleDelete = async (imageId: string) => {
        if (!confirm('Delete this image?')) return;

        const result = await deleteImage(imageId);
        if (result.success) {
            setImages(images.filter(img => img.id !== imageId));
            toast.success('Image deleted');
        }
    };

    const handleReorder = async (fromIndex: number, toIndex: number) => {
        const newImages = [...images];
        const [movedImage] = newImages.splice(fromIndex, 1);
        newImages.splice(toIndex, 0, movedImage);

        setImages(newImages);

        if (productId) {
            await reorderImages(productId, newImages.map(img => img.id));
        }
    };

    return (
        <div className="min-h-screen bg-slate-50">
            {/* Header */}
            <div className="bg-white border-b border-slate-200 sticky top-0 z-10">
                <div className="max-w-7xl mx-auto px-6 py-4">
                    <div className="flex items-center gap-4">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => navigate(`/admin/products`)}
                            className="gap-2"
                        >
                            <ArrowLeft className="h-4 w-4" />
                            Back
                        </Button>
                        <div>
                            <h1 className="text-2xl font-bold">Manage Product Images</h1>
                            <p className="text-sm text-slate-500">{product.name}</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-6 py-8">
                {/* Upload Section */}
                <Card className="mb-8">
                    <CardHeader>
                        <CardTitle>Upload Images</CardTitle>
                        <CardDescription>
                            Drag and drop or click to upload. Maximum 10 images per product.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div
                            onDragEnter={handleDragEnter}
                            onDragLeave={handleDragLeave}
                            onDrop={handleDrop}
                            className={`
                                border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer
                                ${isDragging
                                    ? 'border-orange-500 bg-orange-50'
                                    : 'border-slate-300 hover:border-orange-400 hover:bg-slate-50'
                                }
                            `}
                        >
                            <input
                                type="file"
                                id="image-upload"
                                multiple
                                accept="image/jpeg,image/jpg,image/png,image/webp"
                                onChange={handleFileSelect}
                                className="hidden"
                                disabled={isUploading || images.length >= 10}
                            />

                            <label htmlFor="image-upload" className="cursor-pointer block">
                                <div className="flex flex-col items-center gap-4">
                                    <div className="h-16 w-16 rounded-full bg-orange-100 flex items-center justify-center">
                                        <Upload className="h-8 w-8 text-orange-600" />
                                    </div>
                                    <div>
                                        <p className="text-lg font-medium text-slate-900">
                                            Drag images here or click to select
                                        </p>
                                        <p className="text-sm text-slate-500 mt-1">
                                            {images.length}/10 images uploaded
                                        </p>
                                    </div>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        disabled={isUploading || images.length >= 10}
                                    >
                                        Select Images
                                    </Button>
                                </div>
                            </label>
                        </div>
                    </CardContent>
                </Card>

                {/* Images Grid */}
                {images.length > 0 ? (
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Grid3x3 className="h-5 w-5" />
                                Product Images ({images.length})
                            </CardTitle>
                            <CardDescription>
                                Click and drag to reorder images. Mark one as featured.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                                {images.map((image, index) => (
                                    <div
                                        key={image.id}
                                        draggable
                                        onDragStart={() => setDraggedIndex(index)}
                                        onDragOver={(e) => e.preventDefault()}
                                        onDrop={() => {
                                            if (draggedIndex !== null && draggedIndex !== index) {
                                                handleReorder(draggedIndex, index);
                                            }
                                            setDraggedIndex(null);
                                        }}
                                        className={`
                                            group relative aspect-square rounded-lg overflow-hidden border-2 cursor-move transition-all
                                            ${draggedIndex === index ? 'border-orange-500 opacity-50' : 'border-slate-200'}
                                            ${image.isFeatured ? 'border-orange-500 ring-2 ring-orange-400' : ''}
                                        `}
                                    >
                                        {/* Image */}
                                        <img
                                            src={image.url}
                                            alt="Product"
                                            className="w-full h-full object-cover"
                                        />

                                        {/* Featured Badge */}
                                        {image.isFeatured && (
                                            <div className="absolute top-2 left-2 bg-orange-500 text-white px-2 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
                                                <Star className="h-3 w-3 fill-current" />
                                                Featured
                                            </div>
                                        )}

                                        {/* Hover Actions */}
                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                            <Button
                                                size="icon"
                                                variant="secondary"
                                                className="h-8 w-8 rounded-full"
                                                onClick={() => setPreviewImage(image)}
                                            >
                                                <Eye className="h-4 w-4" />
                                            </Button>

                                            {!image.isFeatured && (
                                                <Button
                                                    size="icon"
                                                    variant="secondary"
                                                    className="h-8 w-8 rounded-full"
                                                    onClick={() => handleSetFeatured(image.id)}
                                                >
                                                    <Star className="h-4 w-4" />
                                                </Button>
                                            )}

                                            <Button
                                                size="icon"
                                                variant="destructive"
                                                className="h-8 w-8 rounded-full"
                                                onClick={() => handleDelete(image.id)}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                ) : (
                    <Card className="text-center py-12">
                        <div className="flex flex-col items-center gap-4">
                            <Upload className="h-12 w-12 text-slate-300" />
                            <p className="text-slate-600">No images uploaded yet</p>
                            <p className="text-sm text-slate-500">Upload images to get started</p>
                        </div>
                    </Card>
                )}
            </div>

            {/* Image Preview Dialog */}
            {previewImage && (
                <Dialog open={!!previewImage} onOpenChange={() => setPreviewImage(null)}>
                    <DialogContent className="max-w-2xl">
                        <DialogHeader>
                            <DialogTitle>Image Preview</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                            <img
                                src={previewImage.url}
                                alt="Preview"
                                className="w-full h-auto rounded-lg max-h-[60vh] object-contain"
                            />
                            <div className="flex gap-2">
                                {!previewImage.isFeatured && (
                                    <Button
                                        className="flex-1"
                                        onClick={() => {
                                            handleSetFeatured(previewImage.id);
                                            setPreviewImage(null);
                                        }}
                                    >
                                        <Star className="h-4 w-4 mr-2" />
                                        Set as Featured
                                    </Button>
                                )}
                                <Button
                                    variant="destructive"
                                    className="flex-1"
                                    onClick={() => {
                                        handleDelete(previewImage.id);
                                        setPreviewImage(null);
                                    }}
                                >
                                    <Trash2 className="h-4 w-4 mr-2" />
                                    Delete Image
                                </Button>
                            </div>
                        </div>
                    </DialogContent>
                </Dialog>
            )}
        </div>
    );
}
