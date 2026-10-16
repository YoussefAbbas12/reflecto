import { useMemo } from 'react';

const useLoyaltyPoints = (points = 2228, maxPoints = 10000) => {
  const formattedPoints = useMemo(() => {
    return new Intl.NumberFormat('en-US').format(points);
  }, [points]);

  const progress = useMemo(() => {
    return Math.min((points / maxPoints) * 100, 100);
  }, [points, maxPoints]);

  const pointsToNextReward = useMemo(() => {
    const nextThreshold = Math.ceil(points / 1000) * 1000;
    return nextThreshold - points;
  }, [points]);

  const formattedPointsToNextReward = useMemo(() => {
    return new Intl.NumberFormat('en-US').format(pointsToNextReward);
  }, [pointsToNextReward]);

  const canRedeem = points >= 1000;
  const redemptionOptions = useMemo(() => [
    { points: 1000, discount: 50, label: '$50 off' },
    { points: 2500, discount: 150, label: '$150 off' },
    { points: 5000, discount: 350, label: '$350 off' },
  ], []);

  return {
    points,
    formattedPoints,
    progress,
    pointsToNextReward,
    formattedPointsToNextReward,
    canRedeem,
    redemptionOptions,
  };
};

export default useLoyaltyPoints;