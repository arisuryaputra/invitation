'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface ImageGalleryProps {
  images?: string[];
}

const defaultImages = [
  'https://via.placeholder.com/800x600/a78bfa/ffffff?text=Our+Story+1',
  'https://via.placeholder.com/800x600/7c3aed/ffffff?text=Our+Story+2',
  'https://via.placeholder.com/800x600/6d28d9/ffffff?text=Our+Story+3',
];

const ImageGallery: React.FC<ImageGalleryProps> = ({ images = defaultImages }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const goToPrevious = () => {
    const isFirstSlide = currentIndex === 0;
    const newIndex = isFirstSlide ? images.length - 1 : currentIndex - 1;
    setCurrentIndex(newIndex);
  };

  const goToNext = () => {
    const isLastSlide = currentIndex === images.length - 1;
    const newIndex = isLastSlide ? 0 : currentIndex + 1;
    setCurrentIndex(newIndex);
  };

  if (!images || images.length === 0) {
    return null;
  }

  return (
    <Card className="w-full max-w-2xl mx-auto overflow-hidden">
      <CardHeader>
        <CardTitle className="text-center">Our Gallery</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="relative aspect-video">
          <div
            style={{ backgroundImage: `url(${images[currentIndex]})` }}
            className="w-full h-full rounded-md bg-center bg-cover transition-all duration-500"
          ></div>
          <div className="absolute inset-0 flex items-center justify-between p-2">
            <Button variant="outline" size="icon" onClick={goToPrevious}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" onClick={goToNext}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ImageGallery;