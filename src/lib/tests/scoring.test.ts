/**
 * Unit tests for scoring functions
 */

import { calculateTemporalDecay, calculateEventPenalty, calculatePillarScore } from "../scoring";
import { Indicator, Event, Pillar } from "../types";

describe("calculateTemporalDecay", () => {
  it("should return 1.0 for recent events", () => {
    const today = new Date().toISOString().split("T")[0];
    const decay = calculateTemporalDecay(today, today);
    expect(decay).toBeCloseTo(1.0, 2);
  });

  it("should return lower values for older events", () => {
    const today = new Date();
    const oneYearAgo = new Date(today);
    oneYearAgo.setFullYear(today.getFullYear() - 1);

    const decay = calculateTemporalDecay(
      oneYearAgo.toISOString().split("T")[0],
      today.toISOString().split("T")[0],
      12
    );

    // After one half-life, decay should be approximately 0.5
    expect(decay).toBeCloseTo(0.5, 1);
  });

  it("should handle custom half-life", () => {
    const today = new Date();
    const sixMonthsAgo = new Date(today);
    sixMonthsAgo.setMonth(today.getMonth() - 6);

    const decay = calculateTemporalDecay(
      sixMonthsAgo.toISOString().split("T")[0],
      today.toISOString().split("T")[0],
      6
    );

    // With 6-month half-life, 6 months ago should be ~0.5
    expect(decay).toBeCloseTo(0.5, 1);
  });
});

describe("calculateEventPenalty", () => {
  it("should calculate penalty from event gravity", () => {
    const events: Event[] = [
      {
        date: new Date().toISOString().split("T")[0],
        phase: "post-jan6",
        pillars: ["politics"],
        gravity: 5,
        description: "Test event",
        sources: ["https://example.com"],
        confidence: "high",
      },
    ];

    const penalty = calculateEventPenalty(events, new Date().toISOString().split("T")[0]);
    expect(penalty).toBeGreaterThan(0);
    expect(penalty).toBeLessThanOrEqual(20); // capped at 20
  });

  it("should filter events by pillar", () => {
    const events: Event[] = [
      {
        date: new Date().toISOString().split("T")[0],
        phase: "post-jan6",
        pillars: ["politics"],
        gravity: 5,
        description: "Politics event",
        sources: ["https://example.com"],
        confidence: "high",
      },
      {
        date: new Date().toISOString().split("T")[0],
        phase: "post-jan6",
        pillars: ["media"],
        gravity: 3,
        description: "Media event",
        sources: ["https://example.com"],
        confidence: "high",
      },
    ];

    const politicsPenalty = calculateEventPenalty(
      events,
      new Date().toISOString().split("T")[0],
      "politics"
    );
    const mediaPenalty = calculateEventPenalty(
      events,
      new Date().toISOString().split("T")[0],
      "media"
    );

    expect(politicsPenalty).toBeGreaterThan(0);
    expect(mediaPenalty).toBeGreaterThan(0);
    expect(politicsPenalty).not.toBe(mediaPenalty);
  });
});

describe("calculatePillarScore", () => {
  it("should calculate score from indicators", () => {
    const indicators: Indicator[] = [
      {
        date: "2021-01-01",
        phase: "post-jan6",
        pillar: "politics",
        indicator: "test_indicator",
        value: 10,
        normalized_value: 50,
        direction: "increasing",
        confidence: "high",
        source_url: "https://example.com",
      },
      {
        date: "2021-01-01",
        phase: "post-jan6",
        pillar: "politics",
        indicator: "test_indicator2",
        value: 20,
        normalized_value: 75,
        direction: "increasing",
        confidence: "high",
        source_url: "https://example.com",
      },
    ];

    const events: Event[] = [];
    const score = calculatePillarScore(indicators, "politics", events, "2021-01-01");

    expect(score.pillar).toBe("politics");
    expect(score.score).toBeGreaterThan(0);
    expect(score.indicator_count).toBe(2);
    expect(score.top_contributors).toHaveLength(2);
  });

  it("should return zero score for empty indicators", () => {
    const indicators: Indicator[] = [];
    const events: Event[] = [];
    const score = calculatePillarScore(indicators, "politics", events, "2021-01-01");

    expect(score.score).toBe(0);
    expect(score.indicator_count).toBe(0);
    expect(score.confidence).toBe("low");
  });
});

