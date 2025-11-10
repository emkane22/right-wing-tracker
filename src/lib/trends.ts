/**
 * Trend analysis functions
 */

import { CompositeScore, Trend } from "./types";

/**
 * Calculate month-to-month deltas
 */
export function calculateDeltas(scores: CompositeScore[]): Trend[] {
  const trends: Trend[] = [];
  
  for (let i = 0; i < scores.length; i++) {
    const current = scores[i];
    const previous = i > 0 ? scores[i - 1] : null;
    
    if (!previous) {
      trends.push({
        date: current.date,
        delta: 0,
        percentage_change: 0,
        trend: "stable",
      });
      continue;
    }
    
    const delta = current.score - previous.score;
    const percentageChange = previous.score > 0 
      ? (delta / previous.score) * 100 
      : 0;
    
    // Determine trend direction
    let trend: "increasing" | "decreasing" | "stable";
    if (Math.abs(percentageChange) < 1) {
      trend = "stable";
    } else if (delta > 0) {
      trend = "increasing";
    } else {
      trend = "decreasing";
    }
    
    trends.push({
      date: current.date,
      delta: Math.round(delta * 100) / 100,
      percentage_change: Math.round(percentageChange * 100) / 100,
      trend,
    });
  }
  
  return trends;
}

/**
 * Detect turning points (significant changes in direction)
 */
export function detectTurningPoints(trends: Trend[]): Trend[] {
  const turningPoints: Trend[] = [];
  
  for (let i = 2; i < trends.length; i++) {
    const prev = trends[i - 2];
    const current = trends[i - 1];
    const next = trends[i];
    
    // Check for significant change in direction
    const prevDirection = prev.trend;
    const nextDirection = next.trend;
    
    if (prevDirection !== nextDirection && prevDirection !== "stable" && nextDirection !== "stable") {
      // Significant change detected
      const magnitude = Math.abs(next.percentage_change);
      
      // Only mark as turning point if change is significant (>5%)
      if (magnitude > 5) {
        turningPoints.push({
          ...current,
          turning_point: true,
        });
      }
    }
  }
  
  return turningPoints;
}

/**
 * Calculate rolling average
 */
export function calculateRollingAverage(
  scores: CompositeScore[],
  windowSize: number = 3
): number[] {
  const averages: number[] = [];
  
  for (let i = 0; i < scores.length; i++) {
    const start = Math.max(0, i - Math.floor(windowSize / 2));
    const end = Math.min(scores.length, i + Math.ceil(windowSize / 2));
    const window = scores.slice(start, end);
    
    const avg = window.reduce((sum, s) => sum + s.score, 0) / window.length;
    averages.push(Math.round(avg * 100) / 100);
  }
  
  return averages;
}

/**
 * Calculate velocity (rate of change)
 */
export function calculateVelocity(trends: Trend[]): number[] {
  return trends.map((trend) => trend.delta);
}

/**
 * Identify acceleration (change in velocity)
 */
export function calculateAcceleration(velocities: number[]): number[] {
  const acceleration: number[] = [];
  
  for (let i = 0; i < velocities.length; i++) {
    if (i === 0) {
      acceleration.push(0);
    } else {
      acceleration.push(Math.round((velocities[i] - velocities[i - 1]) * 100) / 100);
    }
  }
  
  return acceleration;
}

/**
 * Get summary statistics for a time series
 */
export function getSummaryStatistics(scores: CompositeScore[]): {
  mean: number;
  median: number;
  min: number;
  max: number;
  stdDev: number;
  trend: "increasing" | "decreasing" | "stable";
} {
  const values = scores.map((s) => s.score);
  const mean = values.reduce((a, b) => a + b, 0) / values.length;
  
  const sorted = [...values].sort((a, b) => a - b);
  const median = sorted[Math.floor(sorted.length / 2)];
  
  const min = Math.min(...values);
  const max = Math.max(...values);
  
  const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
  const stdDev = Math.sqrt(variance);
  
  // Determine overall trend
  const firstHalf = values.slice(0, Math.floor(values.length / 2));
  const secondHalf = values.slice(Math.floor(values.length / 2));
  const firstMean = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length;
  const secondMean = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length;
  
  let trend: "increasing" | "decreasing" | "stable";
  const diff = secondMean - firstMean;
  if (Math.abs(diff) < 1) {
    trend = "stable";
  } else if (diff > 0) {
    trend = "increasing";
  } else {
    trend = "decreasing";
  }
  
  return {
    mean: Math.round(mean * 100) / 100,
    median: Math.round(median * 100) / 100,
    min: Math.round(min * 100) / 100,
    max: Math.round(max * 100) / 100,
    stdDev: Math.round(stdDev * 100) / 100,
    trend,
  };
}

