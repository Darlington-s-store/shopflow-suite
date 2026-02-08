import { useState, useCallback } from 'react';
import { Upload, X, Star, Image as ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ProductImage } from '@/types/product';
import { toast } from 'sonner';

interface ImageUploadProps {
    images: ProductImage[];
    onImagesChange: (images: ProductImage[]) => void;
    maxImages?: number;
    maxSizeMB?: number;
}

export function ImageUpload({ images, onImagesChange, maxImages = 10, maxSizeMB = 5 }: ImageUploadProps) {
    const [isDragging, setIsDragging] = useState(false);

    const validateFile = useCallback((file: File): boolean => {
        // Check file type
        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
        if (!allowedTypes.includes(file.type)) {
            toast.error(`${file.name}: Only JPG, PNG, and WEBP images are allowed`);
            return false;
        }

        // Check file size
        const maxSizeBytes = maxSizeMB * 1024 * 1024;
        if (file.size > maxSizeBytes) {
            toast.error(`${file.name}: File size must be less than ${maxSizeMB}MB`);
            return false;
        }

        return true;
    }, [maxSizeMB]);

    const handleFiles = useCallback((files: FileList | null) => {
        if (!files) return;

        const fileArray = Array.from(files);

        // Check max images limit
        if (images.length + fileArray.length > maxImages) {
            toast.error(`Maximum ${maxImages} images allowed`);
            return;
        }

        const validFiles = fileArray.filter(validateFile);

        if (validFiles.length === 0) return;

        const newImages: ProductImage[] = validFiles.map((file, index) => ({
            id: `${Date.now()}-${index}`,
            url: URL.createObjectURL(file),
            file,
            sortOrder: images.length + index,
            isFeatured: images.length === 0 && index === 0, // First image is featured
            createdAt: new Date(),
        }));

        onImagesChange([...images, ...newImages]);
        toast.success(`${validFiles.length} image(s) uploaded`);
    }, [images, maxImages, onImagesChange, validateFile]);

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        handleFiles(e.dataTransfer.files);
    }, [handleFiles]);

    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    }, []);

    const handleDragLeave = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
    }, []);

    const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        handleFiles(e.target.files);
        e.target.value = ''; // Reset input
    }, [handleFiles]);

    const removeImage = (imageId: string) => {
        const updatedImages = images.filter(img => img.id !== imageId);

        // If removed image was featured, make first image featured
        if (updatedImages.length > 0 && !updatedImages.some(img => img.isFeatured)) {
            updatedImages[0].isFeatured = true;
        }

        onImagesChange(updatedImages);
        toast.success('Image removed');
    };

    const setFeaturedImage = (imageId: string) => {
        const updatedImages = images.map(img => ({
            ...img,
            isFeatured: img.id === imageId,
        }));
        onImagesChange(updatedImages);
        toast.success('Featured image updated');
    };

    const reorderImages = (fromIndex: number, toIndex: number) => {
        const updatedImages = [...images];
        const [movedImage] = updatedImages.splice(fromIndex, 1);
        updatedImages.splice(toIndex, 0, movedImage);

        // Update sort order
        updatedImages.forEach((img, index) => {
            img.sortOrder = index;
        });

        onImagesChange(updatedImages);
    };

    return (
        <div className="space-y-4">
            {/* Upload Area */}
            <div
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                className={`
          border-2 border-dashed rounded-lg p-8 text-center transition-colors
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
                    onChange={handleFileInput}
                    className="hidden"
                />

                <div className="flex flex-col items-center gap-4">
                    <div className="h-16 w-16 rounded-full bg-orange-100 flex items-center justify-center">
                        <Upload className="h-8 w-8 text-orange-600" />
                    </div>

                    <div>
                        <p className="text-lg font-medium text-slate-900">
                            Drag and drop images here
                        </p>
                        <p className="text-sm text-slate-500 mt-1">
                            or click to browse from your computer
                        </p>
                    </div>

                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => document.getElementById('image-upload')?.click()}
                        className="border-orange-600 text-orange-600 hover:bg-orange-50"
                    >
                        <Upload className="h-4 w-4 mr-2" />
                        Choose Files
                    </Button>

                    <p className="text-xs text-slate-400">
                        JPG, PNG, WEBP • Max {maxSizeMB}MB per image • Up to {maxImages} images
                    </p>
                </div>
            </div>

            {/* Image Preview Grid */}
            {images.length > 0 && (
                <div>
                    <div className="flex items-center justify-between mb-3">
                        <p className="text-sm font-medium text-slate-700">
                            Uploaded Images ({images.length}/{maxImages})
                        </p>
                        <p className="text-xs text-slate-500">
                            Click star to set featured image
                        </p>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {images.map((image, index) => (
                            <div
                                key={image.id}
                                className="relative group aspect-square rounded-lg overflow-hidden border-2 border-slate-200 hover:border-orange-400 transition-colors"
                                draggable
                                onDragStart={(e) => e.dataTransfer.setData('text/plain', index.toString())}
                                onDragOver={(e) => e.preventDefault()}
                                onDrop={(e) => {
                                    e.preventDefault();
                                    const fromIndex = parseInt(e.dataTransfer.getData('text/plain'));
                                    reorderImages(fromIndex, index);
                                }}
                            >
                                {/* Image */}
                                <img
                                    src={image.url}
                                    alt={`Product ${index + 1}`}
                                    className="w-full h-full object-cover"
                                />

                                {/* Featured Badge */}
                                {image.isFeatured && (
                                    <div className="absolute top-2 left-2 bg-orange-600 text-white text-xs font-medium px-2 py-1 rounded">
                                        Featured
                                    </div>
                                )}

                                {/* Order Badge */}
                                <div className="absolute top-2 right-2 bg-black/60 text-white text-xs font-medium px-2 py-1 rounded">
                                    #{index + 1}
                                </div>

                                {/* Hover Actions */}
                                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                    <Button
                                        type="button"
                                        size="sm"
                                        variant="secondary"
                                        onClick={() => setFeaturedImage(image.id)}
                                        className="h-8 w-8 p-0"
                                        title="Set as featured"
                                    >
                                        <Star className={`h-4 w-4 ${image.isFeatured ? 'fill-orange-500 text-orange-500' : ''}`} />
                                    </Button>

                                    <Button
                                        type="button"
                                        size="sm"
                                        variant="destructive"
                                        onClick={() => removeImage(image.id)}
                                        className="h-8 w-8 p-0"
                                        title="Remove image"
                                    >
                                        <X className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>

                    <p className="text-xs text-slate-500 mt-3">
                        💡 Tip: Drag images to reorder them. The first image will be the main product image.
                    </p>
                </div>
            )}

            {/* Empty State */}
            {images.length === 0 && (
                <div className="text-center py-8 border border-dashed border-slate-300 rounded-lg bg-slate-50">
                    <ImageIcon className="h-12 w-12 text-slate-400 mx-auto mb-3" />
                    <p className="text-sm text-slate-500">No images uploaded yet</p>
                </div>
            )}
        </div>
    );
}
