'use client';

import { useState } from 'react';
import { X } from 'lucide-react';

interface GalleryImage {
  src: string;
  alt: string;
  caption?: string;
}

interface GalleryBlockProps {
  images: GalleryImage[];
  columns?: 2 | 3 | 4;
  gap?: 'small' | 'medium' | 'large';
  lightbox?: boolean;
}

export default function GalleryBlock({
  images,
  columns = 3,
  gap = 'medium',
  lightbox = true,
}: GalleryBlockProps) {
  const [selectedImage, setSelectedImage] = useState<GalleryImage | null>(null);

  const gapClasses = {
    small: 'gap-2',
    medium: 'gap-4',
    large: 'gap-8',
  };

  const columnClasses = {
    2: 'grid-cols-1 sm:grid-cols-2',
    3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4',
  };

  return (
    <>
      <div className={`grid ${columnClasses[columns]} ${gapClasses[gap]} my-8`}>
        {images.map((image, index) => (
          <figure
            key={index}
            className="relative group cursor-pointer overflow-hidden rounded-lg"
            onClick={() => lightbox && setSelectedImage(image)}
          >
            <img
              src={image.src}
              alt={image.alt}
              className="w-full h-full object-cover transition-transform group-hover:scale-105"
            />
            {image.caption && (
              <figcaption className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4 text-white opacity-0 group-hover:opacity-100 transition-opacity">
                {image.caption}
              </figcaption>
            )}
          </figure>
        ))}
      </div>

      {/* Lightbox */}
      {lightbox && selectedImage && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
          onClick={() => setSelectedImage(null)}
        >
          <button
            className="absolute top-4 right-4 text-white hover:text-gray-300"
            onClick={() => setSelectedImage(null)}
          >
            <X className="h-8 w-8" />
          </button>
          <figure className="max-w-6xl max-h-[90vh]">
            <img
              src={selectedImage.src}
              alt={selectedImage.alt}
              className="max-w-full max-h-full object-contain"
            />
            {selectedImage.caption && (
              <figcaption className="text-white text-center mt-4">
                {selectedImage.caption}
              </figcaption>
            )}
          </figure>
        </div>
      )}
    </>
  );
}