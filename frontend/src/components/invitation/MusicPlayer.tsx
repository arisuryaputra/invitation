'use client';

import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Play, Pause } from 'lucide-react';

interface MusicPlayerProps {
  songUrl: string;
}

const MusicPlayer: React.FC<MusicPlayerProps> = ({ songUrl }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  // Use a default song for demonstration if the prop is not passed,
  // but handle the case where it's explicitly an empty string.
  const effectiveSongUrl = songUrl || "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3";

  if (!effectiveSongUrl) {
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
      <audio ref={audioRef} src={effectiveSongUrl} loop />
      <Button
        onClick={togglePlayPause}
        variant="secondary"
        size="icon"
        className="rounded-full h-14 w-14"
        aria-label={isPlaying ? 'Pause music' : 'Play music'}
      >
        {isPlaying ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6" />}
      </Button>
    </div>
  );
};

export default MusicPlayer;