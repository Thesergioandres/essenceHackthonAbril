"use client";

import { useEffect, useMemo, useState } from "react";

interface CountdownTimerProps {
  expirationDate: string;
}

const ONE_SECOND_IN_MS = 1000;
const FIVE_HOURS_IN_MS = 5 * 60 * 60 * 1000;

const getRemainingMs = (expirationDate: string): number => {
  const expirationTime = new Date(expirationDate).getTime();

  if (Number.isNaN(expirationTime)) {
    return 0;
  }

  return expirationTime - Date.now();
};

const formatCountdown = (remainingMs: number): string => {
  if (remainingMs <= 0) {
    return "Expirado";
  }

  const totalSeconds = Math.floor(remainingMs / ONE_SECOND_IN_MS);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return `${days} días, ${hours} hrs, ${minutes} min, ${seconds} seg`;
};

export const CountdownTimer = ({ expirationDate }: CountdownTimerProps): JSX.Element => {
  const [remainingMs, setRemainingMs] = useState<number>(() => getRemainingMs(expirationDate));

  useEffect(() => {
    const updateCountdown = (): void => {
      setRemainingMs(getRemainingMs(expirationDate));
    };

    updateCountdown();

    const intervalId = window.setInterval(updateCountdown, ONE_SECOND_IN_MS);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [expirationDate]);

  const timerClassName = useMemo(() => {
    if (remainingMs <= 0) {
      return "text-red-500";
    }

    if (remainingMs < FIVE_HOURS_IN_MS) {
      return "text-orange-500";
    }

    return "text-green-600";
  }, [remainingMs]);

  return <p className={`mt-1 text-base font-semibold ${timerClassName}`}>{formatCountdown(remainingMs)}</p>;
};