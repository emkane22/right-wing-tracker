/**
 * React hook to load and use scores data
 */

import { useState, useEffect } from "react";
import { ScoreTimeSeries, CompositeScore } from "../lib/types";

export interface UseScoresOptions {
  phase?: "post-jan6" | "trump-era" | "baseline";
  state?: string; // Filter by state (future feature)
  weightPreset?: string; // Weight preset name
}

export interface UseScoresResult {
  scores: CompositeScore[] | null;
  timeSeries: ScoreTimeSeries | null;
  loading: boolean;
  error: Error | null;
  currentScore: CompositeScore | null; // Most recent score
}

/**
 * Hook to load scores from JSON file
 */
export function useScores(options: UseScoresOptions = {}): UseScoresResult {
  const { phase = "post-jan6", state, weightPreset = "equal" } = options;
  const [scores, setScores] = useState<CompositeScore[] | null>(null);
  const [timeSeries, setTimeSeries] = useState<ScoreTimeSeries | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [currentScore, setCurrentScore] = useState<CompositeScore | null>(null);
  
  useEffect(() => {
    async function loadScores() {
      try {
        setLoading(true);
        setError(null);
        
        // Load scores from JSON file
        // In Next.js, we need to use an API route or place files in public directory
        // For now, we'll create an API route to serve the data
        const response = await fetch(`/api/scores?phase=${phase}`);
        
        if (!response.ok) {
          throw new Error(`Failed to load scores: ${response.statusText}`);
        }
        
        const data: ScoreTimeSeries = await response.json();
        
        // Filter by state if provided (future feature)
        let filteredScores = data.composite_scores;
        if (state) {
          // TODO: Implement state filtering when location data is available
          filteredScores = data.composite_scores; // Placeholder
        }
        
        // Apply weight preset if different from default
        // TODO: Recompute scores with different weights if needed
        // For now, we assume scores are precomputed with default weights
        
        setTimeSeries(data);
        setScores(filteredScores);
        
        // Get current (most recent) score
        const current = filteredScores[filteredScores.length - 1] || null;
        setCurrentScore(current);
      } catch (err) {
        setError(err instanceof Error ? err : new Error("Unknown error"));
        setScores(null);
        setTimeSeries(null);
        setCurrentScore(null);
      } finally {
        setLoading(false);
      }
    }
    
    loadScores();
  }, [phase, state, weightPreset]);
  
  return {
    scores,
    timeSeries,
    loading,
    error,
    currentScore,
  };
}

/**
 * Get score for a specific date
 */
export function getScoreForDate(
  scores: CompositeScore[],
  date: string
): CompositeScore | null {
  return scores.find((s) => s.date === date) || null;
}

/**
 * Get scores within a date range
 */
export function getScoresInRange(
  scores: CompositeScore[],
  startDate: string,
  endDate: string
): CompositeScore[] {
  return scores.filter((s) => s.date >= startDate && s.date <= endDate);
}

