'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface CountdownProps {
  targetDate?: string; // ISO string format: "YYYY-MM-DDTHH:mm:ss"
  title: string;
}

const Countdown: React.FC<CountdownProps> = ({ targetDate, title }) => {
  const [isMounted, setIsMounted] = useState(false);
  const [timeLeft, setTimeLeft] = useState<{ [key: string]: number }>({});

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isMounted || !targetDate) return;

    const calculateTimeLeft = () => {
      const difference = +new Date(targetDate) - +new Date();
      let newTimeLeft: { [key: string]: number } = {};

      if (difference > 0) {
        newTimeLeft = {
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60),
        };
      }
      return newTimeLeft;
    };

    setTimeLeft(calculateTimeLeft());

    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, [isMounted, targetDate]);

  const renderTimerComponents = () => {
    if (!isMounted || !targetDate) {
      // Render a static placeholder on the server and initial client render
      return <div className="text-2xl">Loading...</div>;
    }

    const timerComponents: React.ReactNode[] = Object.keys(timeLeft).map((interval) => (
      <div key={interval} className="text-center">
        <div className="text-4xl font-bold text-primary">
          {String(timeLeft[interval]).padStart(2, '0')}
        </div>
        <div className="text-sm uppercase text-muted-foreground">{interval}</div>
      </div>
    ));

    return timerComponents.length ? timerComponents : <div className="text-2xl">Time's up!</div>;
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="text-center">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex justify-center space-x-4 md:space-x-8">
          {renderTimerComponents()}
        </div>
      </CardContent>
    </Card>
  );
};

export default Countdown;