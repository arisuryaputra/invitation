'use client';

import React, { useState, useRef } from 'react';

interface MusicPlayerProps {
  songUrl: string;
}

const MusicPlayer: React.FC<MusicPlayerProps> = ({ songUrl }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  // If no song URL is provided (it's empty, null, or undefined), don't render the component.
  if (!songUrl) {
    return null;
  }

  const togglePlayPause = () => {
    if (isPlaying) {
      audioRef.current?.pause();
    } else {
      audioRef.current?.play();
    }
    setIsPlaying(!isPlaying);
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <audio ref={audioRef} src={songUrl} loop />
      <button
        onClick={togglePlayPause}
        className="w-14 h-14 bg-indigo-600 text-white rounded-full flex items-center justify-center shadow-lg hover:bg-indigo-700 focus:outline-none"
        aria-label={isPlaying ? 'Pause music' : 'Play music'}
      >
        {isPlaying ? (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6" />
          </svg>
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
          </svg>
        )}
      </button>
    </div>
  );
};

export default MusicPlayer;