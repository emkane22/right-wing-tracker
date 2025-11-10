/**
 * Script to generate scores.json from indicators and events
 * Run this as a build step or via npm script
 */

import { loadIndicatorsFromCSV, loadEvents, exportScoresToJSON } from "./etl-server";
import { computeScoreTimeSeries } from "./scoring";
import { ScoreTimeSeries } from "./types";
import * as path from "path";
import * as fs from "fs";

/**
 * Generate scores for a specific phase
 * @returns ScoreTimeSeries if successful, null if no data available
 */
export function generateScoresForPhase(phase: "post-jan6" | "trump-era" | "baseline"): ScoreTimeSeries | null {
  const dataDir = path.join(process.cwd(), "data");
  const indicatorsPath = path.join(dataDir, "processed", "indicators.csv");
  const eventsPath = path.join(dataDir, "events", `${phase}-events.jsonl`);
  const outputPath = path.join(dataDir, "processed", `scores-${phase}.json`);
  
  // Check if indicators file exists
  if (!fs.existsSync(indicatorsPath)) {
    throw new Error(`Indicators file not found: ${indicatorsPath}`);
  }
  
  // Load data
  const indicators = loadIndicatorsFromCSV(indicatorsPath);
  const events = loadEvents(eventsPath);
  
  // Filter indicators and events by phase
  const phaseIndicators = indicators.filter((ind) => ind.phase === phase);
  const phaseEvents = events.filter((evt) => evt.phase === phase);
  
  // Skip if no indicators found for this phase
  if (phaseIndicators.length === 0) {
    // Remove empty score file if it exists
    if (fs.existsSync(outputPath)) {
      fs.unlinkSync(outputPath);
    }
    return null;
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
  
  console.log("🚀 Starting score generation...\n");
  
  let successCount = 0;
  let skippedCount = 0;
  
  phases.forEach((phase) => {
    try {
      process.stdout.write(`Generating scores for ${phase}... `);
      const result = generateScoresForPhase(phase);
      
      if (result === null) {
        console.log(`⏭️  Skipped (no data available)`);
        skippedCount++;
      } else {
        // Count unique indicators from the generated scores
        const indicatorCount = result.composite_scores.length > 0 
          ? result.composite_scores[0]?.pillars?.reduce((sum, p) => sum + (p.indicator_count || 0), 0) || 0
          : 0;
        const eventCount = result.composite_scores.length > 0
          ? result.composite_scores.reduce((sum, cs) => sum + (cs.event_count || 0), 0)
          : 0;
        console.log(`✓ Generated (${result.dates.length} dates, ${indicatorCount} indicators${eventCount > 0 ? `, ${eventCount} events` : ''})`);
        successCount++;
      }
    } catch (error) {
      console.error(`✗ Failed`);
      console.error(`  Error: ${error instanceof Error ? error.message : String(error)}`);
    }
  });
  
  console.log(`\n📊 Summary: ${successCount} generated, ${skippedCount} skipped`);
  
  if (skippedCount > 0) {
    console.log(`\n💡 Note: Skipped phases have no indicator data. Add data to data/processed/indicators.csv to generate scores.`);
  }
}

// Run if called directly
if (require.main === module) {
  generateAllScores();
}

