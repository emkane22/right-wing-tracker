/**
 * Server-side ETL functions for Node.js environment
 * Use this for build-time data processing
 */

import { Indicator, Phase, Pillar, Direction } from "./types";
import { inferConfidence, validateSourceUrl } from "./provenance";
import * as fs from "fs";
import * as path from "path";

/**
 * Load raw data from CSV or JSON files (server-side only)
 */
export function loadRawData(filePath: string): any[] {
  const ext = path.extname(filePath).toLowerCase();
  
  if (ext === ".json") {
    const content = fs.readFileSync(filePath, "utf-8");
    return JSON.parse(content);
  } else if (ext === ".csv") {
    // Simple CSV parser (for production, use a proper CSV library like papaparse)
    const content = fs.readFileSync(filePath, "utf-8");
    const lines = content.split("\n").filter((line) => line.trim());
    const headers = lines[0].split(",").map((h) => h.trim());
    
    return lines.slice(1).map((line) => {
      const values = line.split(",").map((v) => v.trim().replace(/^"|"$/g, ""));
      const obj: any = {};
      headers.forEach((header, i) => {
        obj[header] = values[i];
      });
      return obj;
    });
  } else {
    throw new Error(`Unsupported file format: ${ext}`);
  }
}

/**
 * Load events from JSONL file (one event per line)
 */
export function loadEvents(filePath: string): any[] {
  if (!fs.existsSync(filePath)) {
    return [];
  }
  
  const content = fs.readFileSync(filePath, "utf-8");
  const lines = content.split("\n").filter((line) => line.trim());
  
  return lines.map((line) => {
    try {
      return JSON.parse(line);
    } catch (e) {
      console.warn(`Failed to parse event line: ${line}`);
      return null;
    }
  }).filter((event) => event !== null);
}

/**
 * Normalize indicator values to 0-100 scale within a phase
 */
export function normalizeIndicator(
  value: number,
  min: number,
  max: number
): number {
  if (max === min) {
    return 50; // default to middle if no variation
  }
  
  const normalized = ((value - min) / (max - min)) * 100;
  
  // Clamp to 0-100 range
  return Math.max(0, Math.min(100, normalized));
}

/**
 * Normalize all indicators within a phase
 */
export function normalizeIndicatorsByPhase(
  indicators: Indicator[],
  phase: Phase
): Indicator[] {
  const phaseIndicators = indicators.filter((ind) => ind.phase === phase);
  
  // Group by indicator name
  const indicatorGroups = new Map<string, Indicator[]>();
  
  phaseIndicators.forEach((ind) => {
    if (!indicatorGroups.has(ind.indicator)) {
      indicatorGroups.set(ind.indicator, []);
    }
    indicatorGroups.get(ind.indicator)!.push(ind);
  });
  
  // Normalize each indicator group
  const normalized: Indicator[] = [];
  
  indicatorGroups.forEach((group, indicatorName) => {
    const values = group.map((ind) => ind.value);
    const min = Math.min(...values);
    const max = Math.max(...values);
    
    group.forEach((ind) => {
      normalized.push({
        ...ind,
        normalized_value: normalizeIndicator(ind.value, min, max),
      });
    });
  });
  
  return normalized;
}

/**
 * Load indicators from CSV file
 */
export function loadIndicatorsFromCSV(filePath: string): Indicator[] {
  const rawData = loadRawData(filePath);
  
  return rawData.map((row) => ({
    date: row.date,
    phase: row.phase as Phase,
    pillar: row.pillar as Pillar,
    indicator: row.indicator,
    value: parseFloat(row.value),
    normalized_value: parseFloat(row.normalized_value),
    direction: row.direction as Direction,
    confidence: row.confidence as any,
    source_url: row.source_url,
    location: row.location || undefined,
  }));
}

/**
 * Export indicators to CSV
 */
export function exportIndicatorsToCSV(indicators: Indicator[], outputPath: string): void {
  const headers = [
    "date",
    "phase",
    "pillar",
    "indicator",
    "value",
    "normalized_value",
    "direction",
    "confidence",
    "source_url",
    "location",
  ];
  
  const rows = indicators.map((ind) => [
    ind.date,
    ind.phase,
    ind.pillar,
    ind.indicator,
    ind.value.toString(),
    ind.normalized_value.toString(),
    ind.direction,
    ind.confidence,
    ind.source_url,
    ind.location || "",
  ]);
  
  const csvContent = [
    headers.join(","),
    ...rows.map((row) => row.map((cell) => `"${cell}"`).join(",")),
  ].join("\n");
  
  // Ensure directory exists
  const dir = path.dirname(outputPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  
  fs.writeFileSync(outputPath, csvContent, "utf-8");
}

/**
 * Load scores from JSON file
 */
export function loadScoresFromJSON(filePath: string): any {
  if (!fs.existsSync(filePath)) {
    return null;
  }
  
  const content = fs.readFileSync(filePath, "utf-8");
  return JSON.parse(content);
}

/**
 * Export scores to JSON file
 */
export function exportScoresToJSON(scores: any, outputPath: string): void {
  // Ensure directory exists
  const dir = path.dirname(outputPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  
  fs.writeFileSync(outputPath, JSON.stringify(scores, null, 2), "utf-8");
}

