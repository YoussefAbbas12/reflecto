import { useMemo } from 'react';

const useProgress = (current, total, options = {}) => {
  const {
    decimals = 0,
    multiplier = 1,
  } = options;

  const percentage = useMemo(() => {
    if (total === 0) return 0;
    const value = (current / total) * 100 * multiplier;
    return decimals > 0 ? parseFloat(value.toFixed(decimals)) : Math.round(value);
  }, [current, total, multiplier, decimals]);

  const isComplete = percentage >= 100;
  const isNearComplete = percentage >= 80;
  const isBehind = percentage < 50;

  const remaining = useMemo(() => {
    return Math.max(total - current, 0);
  }, [current, total]);

  const formattedPercentage = `${percentage}%`;

  return {
    current,
    total,
    percentage,
    remaining,
    isComplete,
    isNearComplete,
    isBehind,
    formattedPercentage,
  };
};

export default useProgress;