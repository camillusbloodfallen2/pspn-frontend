import React, { useEffect, useRef, useState } from "react";

interface AnimatedNumberProps {
  value: number;
  className?: string;
  duration?: number;
  format?: (value: number) => string;
}

const AnimatedNumber: React.FC<AnimatedNumberProps> = ({
  value,
  className,
  duration = 900,
  format,
}) => {
  const [displayValue, setDisplayValue] = useState(value);
  const previousValue = useRef(value);

  useEffect(() => {
    if (Math.abs(previousValue.current - value) < 0.0001) {
      setDisplayValue(value);
      previousValue.current = value;
      return;
    }

    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    if (reduceMotion || duration <= 0) {
      setDisplayValue(value);
      previousValue.current = value;
      return;
    }

    const startValue = previousValue.current;
    const startTime = performance.now();
    let frameId = 0;

    const tick = (timestamp: number) => {
      const progress = Math.min((timestamp - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const currentValue = startValue + (value - startValue) * eased;

      setDisplayValue(currentValue);

      if (progress < 1) {
        frameId = window.requestAnimationFrame(tick);
      } else {
        setDisplayValue(value);
        previousValue.current = value;
      }
    };

    frameId = window.requestAnimationFrame(tick);

    return () => window.cancelAnimationFrame(frameId);
  }, [duration, value]);

  return (
    <span className={className}>
      {format ? format(displayValue) : displayValue}
    </span>
  );
};

export default AnimatedNumber;
