'use client';

import React, { useState } from 'react';

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

  return (
    <div className="p-4 rounded-lg shadow-md bg-white w-full max-w-2xl mx-auto">
      <h3 className="text-xl font-semibold text-center mb-4">Our Gallery</h3>
      <div className="relative h-96">
        <div
          style={{ backgroundImage: `url(${images[currentIndex]})` }}
          className="w-full h-full rounded-lg bg-center bg-cover duration-500"
        ></div>
        {/* Left Arrow */}
        <button
          onClick={goToPrevious}
          className="absolute top-1/2 left-2 -translate-y-1/2 bg-black/30 text-white p-2 rounded-full hover:bg-black/50"
        >
          &#10094;
        </button>
        {/* Right Arrow */}
        <button
          onClick={goToNext}
          className="absolute top-1/2 right-2 -translate-y-1/2 bg-black/30 text-white p-2 rounded-full hover:bg-black/50"
        >
          &#10095;
        </button>
      </div>
    </div>
  );
};

export default ImageGallery;