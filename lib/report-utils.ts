/**
 * Utility functions for vendor monthly analytics and reports
 */

export interface GrowthMetrics {
  currentValue: number;
  previousValue: number;
  percentageChange: number;
  isPositive: boolean;
}

/**
 * Calculates growth percentage between two values
 */
export const calculateGrowth = (current: number, previous: number): GrowthMetrics => {
  if (previous === 0) {
    return {
      currentValue: current,
      previousValue: previous,
      percentageChange: current > 0 ? 100 : 0,
      isPositive: current > 0,
    };
  }

  const change = ((current - previous) / previous) * 100;
  return {
    currentValue: current,
    previousValue: previous,
    percentageChange: Math.round(change * 100) / 100,
    isPositive: change >= 0,
  };
};

/**
 * Calculates distribution of booking statuses
 */
export const calculateStatusDistribution = (testDrives: Array<{ status: string }>) => {
  const total = testDrives.length;
  if (total === 0) {
    return {
      COMPLETED: 0,
      CANCELLED: 0,
      REJECTED: 0,
      PENDING: 0,
      CONFIRMED: 0,
    };
  }

  const distribution = testDrives.reduce((acc: Record<string, number>, curr) => {
    acc[curr.status] = (acc[curr.status] || 0) + 1;
    return acc;
  }, {});

  // Convert to percentages
  Object.keys(distribution).forEach((key) => {
    distribution[key] = Math.round((distribution[key] / total) * 100);
  });

  return distribution;
};

/**
 * Generates actionable tips based on vendor metrics
 */
export const getPerformanceTips = (metrics: {
  successRate: number;
  rejectionRate: number;
  revenueGrowth: number;
}) => {
  const tips = [];

  if (metrics.successRate < 70) {
    tips.push(
      'Your completion rate is below 70%. Try responding to pending requests within 2 hours to increase conversions.'
    );
  }

  if (metrics.rejectionRate > 20) {
    tips.push(
      "High rejection rate detected. Consider updating your 'Working Hours' or vehicle availability to better match customer expectations."
    );
  }

  if (metrics.revenueGrowth < 0) {
    tips.push(
      "Monthly revenue has declined. Consider running a temporary promotion or highlighting your 'Top 3 Models' in your marketing."
    );
  }

  if (tips.length === 0) {
    tips.push(
      'Great job! Your performance metrics are strong. Keep providing excellent service to maintain your priority ranking.'
    );
  }

  return tips;
};
