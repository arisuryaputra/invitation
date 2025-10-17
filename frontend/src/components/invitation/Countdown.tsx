'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

interface CountdownProps {
  targetDate?: string;
  title: string;
  isEditing?: boolean;
  onTitleChange?: (newTitle: string) => void;
}

const Countdown: React.FC<CountdownProps> = ({ targetDate, title, isEditing = false, onTitleChange }) => {
  const [isMounted, setIsMounted] = useState(false);
  const [isInlineEditing, setIsInlineEditing] = useState(false);
  const [editableTitle, setEditableTitle] = useState(title);

  const calculateTimeLeft = () => {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 30);
    const effectiveTargetDate = targetDate || futureDate.toISOString();

    const difference = +new Date(effectiveTargetDate) - +new Date();
    let timeLeft: { [key: string]: number } = {};

    if (difference > 0) {
      timeLeft = {
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60),
      };
    }
    return timeLeft;
  };

  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

  useEffect(() => {
    setIsMounted(true);
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, [targetDate]);

  useEffect(() => {
    setEditableTitle(title);
  }, [title]);

  const handleTitleDoubleClick = () => {
    if (isEditing) {
      setIsInlineEditing(true);
    }
  };

  const handleTitleBlur = () => {
    setIsInlineEditing(false);
    if (onTitleChange) {
      onTitleChange(editableTitle);
    }
  };

  const handleTitleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleTitleBlur();
    }
  };

  const renderTitle = () => {
    if (isInlineEditing) {
      return (
        <Input
          type="text"
          value={editableTitle}
          onChange={(e) => setEditableTitle(e.target.value)}
          onBlur={handleTitleBlur}
          onKeyDown={handleTitleKeyDown}
          className="text-center text-2xl font-bold bg-transparent"
          autoFocus
        />
      );
    }
    return (
      <CardTitle onDoubleClick={handleTitleDoubleClick} className="text-center cursor-pointer">
        {title}
      </CardTitle>
    );
  };

  if (!isMounted) {
    // Render a placeholder on the server and initial client render
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle className="text-center">{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center space-x-4 md:space-x-8">
             {/* Static placeholder to prevent hydration mismatch */}
             <div className="text-center"><div className="text-4xl font-bold">00</div><div className="text-sm uppercase text-muted-foreground">Days</div></div>
             <div className="text-center"><div className="text-4xl font-bold">00</div><div className="text-sm uppercase text-muted-foreground">Hours</div></div>
             <div className="text-center"><div className="text-4xl font-bold">00</div><div className="text-sm uppercase text-muted-foreground">Minutes</div></div>
             <div className="text-center"><div className="text-4xl font-bold">00</div><div className="text-sm uppercase text-muted-foreground">Seconds</div></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const timerComponents: React.ReactNode[] = [];
  Object.entries(timeLeft).forEach(([interval, value]) => {
    timerComponents.push(
      <div key={interval} className="text-center">
        <div className="text-4xl font-bold text-primary">
          {String(value).padStart(2, '0')}
        </div>
        <div className="text-sm uppercase text-muted-foreground">{interval}</div>
      </div>
    );
  });

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        {renderTitle()}
      </CardHeader>
      <CardContent>
        <div className="flex justify-center space-x-4 md:space-x-8">
          {timerComponents.length ? timerComponents : <div className="text-2xl">Time's up!</div>}
        </div>
      </CardContent>
    </Card>
  );
};

export default Countdown;