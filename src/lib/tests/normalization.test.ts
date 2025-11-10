/**
 * Unit tests for normalization functions
 */

import { normalizeIndicator, normalizeIndicatorsByPhase } from "../etl-server";
import { Indicator, Phase } from "../types";

describe("normalizeIndicator", () => {
  it("should normalize value to 0-100 scale", () => {
    expect(normalizeIndicator(50, 0, 100)).toBe(50);
    expect(normalizeIndicator(25, 0, 100)).toBe(25);
    expect(normalizeIndicator(75, 0, 100)).toBe(75);
    expect(normalizeIndicator(0, 0, 100)).toBe(0);
    expect(normalizeIndicator(100, 0, 100)).toBe(100);
  });

  it("should handle min-max edge cases", () => {
    expect(normalizeIndicator(50, 50, 50)).toBe(50); // no variation
    expect(normalizeIndicator(10, 0, 10)).toBe(100);
    expect(normalizeIndicator(0, 0, 10)).toBe(0);
  });

  it("should clamp values to 0-100 range", () => {
    expect(normalizeIndicator(150, 0, 100)).toBe(100);
    expect(normalizeIndicator(-10, 0, 100)).toBe(0);
  });
});

describe("normalizeIndicatorsByPhase", () => {
  it("should normalize indicators within a phase", () => {
    const indicators: Indicator[] = [
      {
        date: "2021-01-01",
        phase: "post-jan6",
        pillar: "politics",
        indicator: "test_indicator",
        value: 10,
        normalized_value: 0,
        direction: "increasing",
        confidence: "high",
        source_url: "https://example.com",
      },
      {
        date: "2021-02-01",
        phase: "post-jan6",
        pillar: "politics",
        indicator: "test_indicator",
        value: 20,
        normalized_value: 0,
        direction: "increasing",
        confidence: "high",
        source_url: "https://example.com",
      },
      {
        date: "2021-03-01",
        phase: "post-jan6",
        pillar: "politics",
        indicator: "test_indicator",
        value: 30,
        normalized_value: 0,
        direction: "increasing",
        confidence: "high",
        source_url: "https://example.com",
      },
    ];

    const normalized = normalizeIndicatorsByPhase(indicators, "post-jan6");

    expect(normalized).toHaveLength(3);
    expect(normalized[0].normalized_value).toBe(0); // min value
    expect(normalized[1].normalized_value).toBe(50); // middle value
    expect(normalized[2].normalized_value).toBe(100); // max value
  });

  it("should only normalize indicators for the specified phase", () => {
    const indicators: Indicator[] = [
      {
        date: "2021-01-01",
        phase: "post-jan6",
        pillar: "politics",
        indicator: "test_indicator",
        value: 10,
        normalized_value: 0,
        direction: "increasing",
        confidence: "high",
        source_url: "https://example.com",
      },
      {
        date: "2016-01-01",
        phase: "trump-era",
        pillar: "politics",
        indicator: "test_indicator",
        value: 20,
        normalized_value: 0,
        direction: "increasing",
        confidence: "high",
        source_url: "https://example.com",
      },
    ];

    const normalized = normalizeIndicatorsByPhase(indicators, "post-jan6");

    expect(normalized).toHaveLength(1);
    expect(normalized[0].phase).toBe("post-jan6");
    expect(normalized[0].normalized_value).toBe(50); // only one value, so default to 50
  });
});

