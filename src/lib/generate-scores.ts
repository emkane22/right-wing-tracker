/**
 * Script to generate scores.json from indicators and events
 * Run this as a build step or via npm script
 */

import { loadIndicatorsFromCSV, loadEvents, exportScoresToJSON } from "./etl-server";
import { computeScoreTimeSeries } from "./scoring";
import { ScoreTimeSeries } from "./types";
import * as path from "path";

/**
 * Generate scores for a specific phase
 */
export function generateScoresForPhase(phase: "post-jan6" | "trump-era" | "baseline"): ScoreTimeSeries {
  const dataDir = path.join(process.cwd(), "data");
  const indicatorsPath = path.join(dataDir, "processed", "indicators.csv");
  const eventsPath = path.join(dataDir, "events", `${phase}-events.jsonl`);
  const outputPath = path.join(dataDir, "processed", `scores-${phase}.json`);
  
  // Load data
  const indicators = loadIndicatorsFromCSV(indicatorsPath);
  const events = loadEvents(eventsPath);
  
  // Filter indicators and events by phase
  const phaseIndicators = indicators.filter((ind) => ind.phase === phase);
  const phaseEvents = events.filter((evt) => evt.phase === phase);
  
  if (phaseIndicators.length === 0) {
    console.warn(`No indicators found for phase ${phase}`);
    // Return empty time series
    return {
      dates: [],
      composite_scores: [],
      metadata: {
        phase,
        date_range: {
          start: new Date().toISOString().split("T")[0],
          end: new Date().toISOString().split("T")[0],
        },
        last_updated: new Date().toISOString(),
      },
    };
  }
  
  // Get unique dates from indicators
  const dates = Array.from(new Set(phaseIndicators.map((ind) => ind.date))).sort();
  
  // Compute scores for each date
  const compositeScores = computeScoreTimeSeries(
    phaseIndicators,
    phaseEvents,
    dates,
    phase,
    "equal"
  );
  
  // Create time series object
  const timeSeries: ScoreTimeSeries = {
    dates,
    composite_scores: compositeScores,
    metadata: {
      phase,
      date_range: {
        start: dates[0],
        end: dates[dates.length - 1],
      },
      last_updated: new Date().toISOString(),
    },
  };
  
  // Export to JSON
  exportScoresToJSON(timeSeries, outputPath);
  
  return timeSeries;
}

/**
 * Generate all scores
 */
export function generateAllScores(): void {
  const phases: Array<"post-jan6" | "trump-era" | "baseline"> = ["post-jan6", "trump-era", "baseline"];
  
  phases.forEach((phase) => {
    try {
      console.log(`Generating scores for ${phase}...`);
      generateScoresForPhase(phase);
      console.log(`✓ Generated scores for ${phase}`);
    } catch (error) {
      console.error(`Failed to generate scores for ${phase}:`, error);
    }
  });
}

// Run if called directly
if (require.main === module) {
  generateAllScores();
}

