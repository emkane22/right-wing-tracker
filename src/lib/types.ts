/**
 * Type definitions for the Right-Wing Tracker data model
 */

export type Phase = "post-jan6" | "trump-era" | "baseline";
export type Pillar = "politics" | "media" | "business" | "technology";
export type Confidence = "high" | "medium" | "low";
export type Direction = "increasing" | "decreasing";

export interface Indicator {
  date: string; // ISO 8601 date string
  phase: Phase;
  pillar: Pillar;
  indicator: string; // e.g., "voter_suppression_laws"
  value: number; // raw numeric value
  normalized_value: number; // 0-100 normalized score
  direction: Direction;
  confidence: Confidence;
  source_url: string;
  location?: string; // state code or "federal"
}

export interface Event {
  date: string; // ISO 8601 date string
  phase: Phase;
  pillars: Pillar[]; // can affect multiple pillars
  gravity: number; // 1-5 severity score
  description: string;
  location?: string; // state code or "federal"
  sources: string[]; // array of source URLs
  confidence: Confidence;
  indicator_impact?: string[]; // related indicator names
}

export interface PillarScore {
  pillar: Pillar;
  score: number; // 0-100
  uncertainty: number; // standard error
  confidence: Confidence;
  indicator_count: number;
  top_contributors: Array<{
    indicator: string;
    value: number;
    weight: number;
  }>;
}

export interface CompositeScore {
  date: string;
  score: number; // 0-100
  uncertainty: number;
  confidence: Confidence;
  pillars: PillarScore[];
  weights: Weights;
  event_penalty: number; // penalty from event gravity
  event_count: number; // number of events affecting this score
}

export interface Weights {
  politics: number;
  media: number;
  business: number;
  technology: number;
}

export interface ScoreTimeSeries {
  dates: string[];
  composite_scores: CompositeScore[];
  metadata: {
    phase: Phase;
    date_range: {
      start: string;
      end: string;
    };
    last_updated: string;
  };
}

export interface Trend {
  date: string;
  delta: number; // change from previous period
  percentage_change: number;
  trend: "increasing" | "decreasing" | "stable";
  turning_point?: boolean; // significant change in direction
}

