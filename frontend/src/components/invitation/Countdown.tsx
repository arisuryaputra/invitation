'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface CountdownProps {
  targetDate?: string;
  title: string;
}

const Countdown: React.FC<CountdownProps> = ({ targetDate, title }) => {
  const [isMounted, setIsMounted] = useState(false);

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
  }, [targetDate]); // Recalculate if targetDate changes

  if (!isMounted) {
    // Render a placeholder on the server and initial client render
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle className="text-center">{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center space-x-4 md:space-x-8">
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
        <CardTitle className="text-center">{title}</CardTitle>
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