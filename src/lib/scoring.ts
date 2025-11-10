/**
 * Scoring functions for computing pillar and composite scores
 */

import { Indicator, Event, PillarScore, CompositeScore, Weights, Phase } from "./types";
import { getPreset } from "./presets";

// Temporal decay constant (half-life = 12 months)
const DECAY_LAMBDA = Math.log(2) / 12; // months

/**
 * Calculate temporal decay weight for an event
 */
export function calculateTemporalDecay(
  eventDate: string,
  currentDate: string,
  halfLifeMonths: number = 12
): number {
  const event = new Date(eventDate);
  const current = new Date(currentDate);
  const monthsDiff = (current.getTime() - event.getTime()) / (1000 * 60 * 60 * 24 * 30);
  
  const lambda = Math.log(2) / halfLifeMonths;
  return Math.exp(-lambda * monthsDiff);
}

/**
 * Calculate event gravity penalty
 */
export function calculateEventPenalty(
  events: Event[],
  currentDate: string,
  pillar?: Pillar
): number {
  const relevantEvents = pillar
    ? events.filter((e) => e.pillars.includes(pillar))
    : events;
  
  let totalPenalty = 0;
  
  relevantEvents.forEach((event) => {
    const decay = calculateTemporalDecay(event.date, currentDate);
    const penalty = event.gravity * 2 * decay; // scale gravity (1-5) to penalty points
    totalPenalty += penalty;
  });
  
  // Cap penalty at reasonable maximum (e.g., 20 points)
  return Math.min(totalPenalty, 20);
}

/**
 * Calculate pillar score from indicators
 */
export function calculatePillarScore(
  indicators: Indicator[],
  pillar: Pillar,
  events: Event[],
  currentDate: string
): PillarScore {
  const pillarIndicators = indicators.filter((ind) => ind.pillar === pillar);
  
  if (pillarIndicators.length === 0) {
    return {
      pillar: pillar,
      score: 0,
      uncertainty: 0,
      confidence: "low",
      indicator_count: 0,
      top_contributors: [],
    };
  }
  
  // Calculate average normalized value
  const values = pillarIndicators.map((ind) => ind.normalized_value);
  const mean = values.reduce((a, b) => a + b, 0) / values.length;
  
  // Calculate standard error (uncertainty)
  const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
  const stdDev = Math.sqrt(variance);
  const standardError = stdDev / Math.sqrt(values.length);
  
  // Determine overall confidence (lowest confidence among indicators)
  const confidences = pillarIndicators.map((ind) => ind.confidence);
  const confidenceOrder = { high: 3, medium: 2, low: 1 };
  const minConfidence = confidences.reduce((min, conf) => {
    return confidenceOrder[conf] < confidenceOrder[min] ? conf : min;
  }, confidences[0]);
  
  // Calculate event penalty
  const eventPenalty = calculateEventPenalty(events, currentDate, pillar);
  
  // Apply penalty to score (penalty increases score)
  const score = Math.min(100, mean + eventPenalty);
  
  // Get top contributors (indicators with highest normalized values)
  const contributors = pillarIndicators
    .map((ind) => ({
      indicator: ind.indicator,
      value: ind.normalized_value,
      weight: 1 / pillarIndicators.length, // equal weight for now
    }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 3);
  
  return {
    pillar: pillar,
    score: Math.round(score * 100) / 100, // round to 2 decimal places
    uncertainty: Math.round(standardError * 100) / 100,
    confidence: minConfidence,
    indicator_count: pillarIndicators.length,
    top_contributors: contributors,
  };
}

/**
 * Calculate composite score from pillar scores
 */
export function calculateCompositeScore(
  pillarScores: PillarScore[],
  weights: Weights,
  events: Event[],
  currentDate: string
): CompositeScore {
  // Calculate weighted average of pillar scores
  let weightedSum = 0;
  let totalWeight = 0;
  
  pillarScores.forEach((pillar) => {
    const weight = weights[pillar.pillar];
    weightedSum += pillar.score * weight;
    totalWeight += weight;
  });
  
  const baseScore = totalWeight > 0 ? weightedSum / totalWeight : 0;
  
  // Calculate overall event penalty (across all pillars)
  const eventPenalty = calculateEventPenalty(events, currentDate);
  
  // Apply penalty
  const score = Math.min(100, baseScore + eventPenalty);
  
  // Calculate overall uncertainty (weighted average of pillar uncertainties)
  let uncertaintySum = 0;
  pillarScores.forEach((pillar) => {
    const weight = weights[pillar.pillar];
    uncertaintySum += pillar.uncertainty * weight;
  });
  const uncertainty = totalWeight > 0 ? uncertaintySum / totalWeight : 0;
  
  // Determine overall confidence (lowest among pillars)
  const confidences = pillarScores.map((p) => p.confidence);
  const confidenceOrder = { high: 3, medium: 2, low: 1 };
  const minConfidence = confidences.reduce((min, conf) => {
    return confidenceOrder[conf] < confidenceOrder[min] ? conf : min;
  }, confidences[0] || "low");
  
  // Count events affecting this score
  const eventCount = events.filter((e) => {
    const eventDate = new Date(e.date);
    const current = new Date(currentDate);
    const monthsDiff = (current.getTime() - eventDate.getTime()) / (1000 * 60 * 60 * 24 * 30);
    return monthsDiff >= 0 && monthsDiff <= 24; // events within 24 months
  }).length;
  
  return {
    date: currentDate,
    score: Math.round(score * 100) / 100,
    uncertainty: Math.round(uncertainty * 100) / 100,
    confidence: minConfidence,
    pillars: pillarScores,
    weights,
    event_penalty: Math.round(eventPenalty * 100) / 100,
    event_count: eventCount,
  };
}

/**
 * Compute scores for a given date and phase
 */
export function computeScores(
  indicators: Indicator[],
  events: Event[],
  date: string,
  phase: Phase,
  weightPreset: string = "equal"
): CompositeScore {
  const weights = getPreset(weightPreset);
  
  // Calculate pillar scores
  const pillars: Pillar[] = ["politics", "media", "business", "technology"];
  const pillarScores = pillars.map((pillar) =>
    calculatePillarScore(indicators, pillar, events, date)
  );
  
  // Calculate composite score
  const compositeScore = calculateCompositeScore(pillarScores, weights, events, date);
  
  return compositeScore;
}

/**
 * Compute time series of scores
 */
export function computeScoreTimeSeries(
  indicators: Indicator[],
  events: Event[],
  dates: string[],
  phase: Phase,
  weightPreset: string = "equal"
): CompositeScore[] {
  return dates.map((date) => computeScores(indicators, events, date, phase, weightPreset));
}

