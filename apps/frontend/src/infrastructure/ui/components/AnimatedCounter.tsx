"use client";

import { useLayoutEffect, useRef } from "react";
import gsap from "gsap";

interface AnimatedCounterProps {
  value: number;
  decimals?: number;
  prefix?: string;
  suffix?: string;
  className?: string;
}

const formatNumber = (value: number, decimals: number): string => {
  return value.toLocaleString("es-CO", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  });
};

export const AnimatedCounter = ({
  value,
  decimals = 0,
  prefix = "",
  suffix = "",
  className
}: AnimatedCounterProps): JSX.Element => {
  const valueRef = useRef<HTMLSpanElement | null>(null);

  useLayoutEffect(() => {
    if (!valueRef.current) {
      return;
    }

    const state = { current: 0 };

    const tween = gsap.to(state, {
      current: value,
      duration: 1.2,
      ease: "power3.out",
      onUpdate: () => {
        if (!valueRef.current) {
          return;
        }

        valueRef.current.textContent = `${prefix}${formatNumber(state.current, decimals)}${suffix}`;
      }
    });

    return () => {
      tween.kill();
    };
  }, [decimals, prefix, suffix, value]);

  return (
    <span ref={valueRef} className={className}>
      {`${prefix}${formatNumber(0, decimals)}${suffix}`}
    </span>
  );
};
