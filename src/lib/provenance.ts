/**
 * Data provenance and source tracking
 */

import { Indicator, Event, Confidence } from "./types";

export interface ProvenanceRecord {
  timestamp: string; // ISO 8601 timestamp
  source_url: string;
  confidence: Confidence;
  verification_status: "verified" | "unverified" | "pending";
  last_checked: string; // ISO 8601 timestamp
}

/**
 * Attach provenance metadata to indicators
 */
export function attachProvenance(
  indicator: Indicator,
  verificationStatus: "verified" | "unverified" | "pending" = "pending"
): Indicator & { provenance: ProvenanceRecord } {
  return {
    ...indicator,
    provenance: {
      timestamp: new Date().toISOString(),
      source_url: indicator.source_url,
      confidence: indicator.confidence,
      verification_status: verificationStatus,
      last_checked: new Date().toISOString(),
    },
  };
}

/**
 * Attach provenance metadata to events
 */
export function attachEventProvenance(
  event: Event,
  verificationStatus: "verified" | "unverified" | "pending" = "pending"
): Event & { provenance: ProvenanceRecord[] } {
  return {
    ...event,
    provenance: event.sources.map((source) => ({
      timestamp: new Date().toISOString(),
      source_url: source,
      confidence: event.confidence,
      verification_status: verificationStatus,
      last_checked: new Date().toISOString(),
    })),
  };
}

/**
 * Determine confidence level based on source type
 */
export function inferConfidence(sourceUrl: string): Confidence {
  const url = sourceUrl.toLowerCase();
  
  // High confidence: government sources, official records
  if (
    url.includes("gov") ||
    url.includes("fec.gov") ||
    url.includes("justice.gov") ||
    url.includes("congress.gov") ||
    url.includes("crsreports")
  ) {
    return "high";
  }
  
  // Medium confidence: reputable news, research institutions
  if (
    url.includes("brennancenter") ||
    url.includes("opensecrets") ||
    url.includes("cpj.org") ||
    url.includes("aclu.org")
  ) {
    return "medium";
  }
  
  // Low confidence: everything else (news articles, blogs, etc.)
  return "low";
}

/**
 * Validate source URL format
 */
export function validateSourceUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}

