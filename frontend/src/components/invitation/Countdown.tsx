'use client';

import React, { useState, useEffect } from 'react';

interface CountdownProps {
  targetDate?: string; // ISO string format: "YYYY-MM-DDTHH:mm:ss"
  title: string;
}

const Countdown: React.FC<CountdownProps> = ({ targetDate, title }) => {
  const futureDate = new Date();
  futureDate.setDate(futureDate.getDate() + 30); // Default to 30 days from now

  const effectiveTargetDate = targetDate || futureDate.toISOString();

  const calculateTimeLeft = () => {
    const difference = +new Date(effectiveTargetDate) - +new Date();
    let timeLeft = {};

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
    const timer = setTimeout(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearTimeout(timer);
  });

  const timerComponents: React.ReactNode[] = [];

  Object.keys(timeLeft).forEach((interval) => {
    // @ts-ignore
    if (!timeLeft[interval]) {
      return;
    }
    timerComponents.push(
      <div key={interval} className="text-center">
        <div className="text-4xl font-bold">
          {/* @ts-ignore */}
          {String(timeLeft[interval]).padStart(2, '0')}
        </div>
        <div className="text-sm uppercase">{interval}</div>
      </div>
    );
  });

  return (
    <div className="p-4 rounded-lg shadow-md bg-white text-gray-800 w-full max-w-md mx-auto">
      <h3 className="text-xl font-semibold text-center mb-4">{title}</h3>
      <div className="flex justify-center space-x-4">
        {timerComponents.length ? timerComponents : <div className="text-2xl">Time's up!</div>}
      </div>
    </div>
  );
};

export default Countdown;