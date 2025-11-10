# Right-Wing Tracker Methodology

## Core Principle: Observable-First Measurement

This project uses **auditable, objective indicators** (laws, arrests, budgets, corporate filings) instead of subjective "expert ratings" to track democratic backsliding within the U.S. right wing.

## Four Pillars of Measurement

### A. Politics & Elections
- Election interference attempts
- Restrictive voting laws
- Oversight erosion (e.g., committee disbandment, investigation blocks)
- Executive power expansion

### B. Media & Information
- Journalist arrests or harassment
- SLAPP (Strategic Lawsuit Against Public Participation) suits
- FOIA denials
- Media consolidation affecting democratic discourse

### C. Business & Money
- PAC funding to anti-democratic actors
- Lobbying expenditures on restrictive policies
- Corporate contributions to election-denying candidates
- Dark money flows

### D. Technology Platforms
- Policy rollbacks affecting content moderation
- Reinstatement of extremist content or accounts
- Algorithm changes favoring disinformation
- Platform policy changes affecting democratic discourse

## Time Phases

### Phase 1: Post-Jan 6 (2021–present)
**Current focus** - Primary data collection phase

### Phase 2: Trump Era (2016–2021)
**Next phase** - Backfill to capture full context

### Phase 3: Baseline (2000–2016)
**Final phase** - Historical context and baseline comparison

## Measurement Model

### Normalization
Each indicator is normalized to a 0–100 scale within its phase:
- **Min-max normalization**: `(value - min) / (max - min) × 100`
- Higher scores indicate worse democratic backsliding
- Normalization is phase-specific to allow temporal comparison

### Pillar Scores
- **Pillar score** = average of all indicators within that pillar
- Each pillar includes multiple indicators (typically 3–5 per pillar)

### Composite Score
- **Composite score** = weighted average of four pillars
- Default weights: Equal (0.25 each)
- Alternative presets: Politics-Heavy, Media-Heavy, Business-Heavy, Technology-Heavy

### Event Gravity Penalties
- Events are assigned severity scores on a 1–5 scale:
  - 1: Minor incident
  - 2: Moderate concern
  - 3: Significant violation
  - 4: Major threat
  - 5: Critical democratic backsliding event
- Penalties decay over time with a half-life of ~12 months
- Recent events carry more weight than historical ones

### Uncertainty & Confidence
- **Uncertainty bands**: ± SD/√n (standard error)
- **Confidence labels**: High, Medium, Low based on data quality and source reliability
- Each indicator includes confidence metadata

### Temporal Decay
- Recent events weighted more heavily than older events
- Exponential decay with half-life ≈ 12 months
- Formula: `weight = e^(-λt)` where λ = ln(2) / 12 months

## Data Architecture

```
data/
 ├─ raw/                # source CSVs/JSONs from external sources
 ├─ events/             # one JSONL file per event
 ├─ processed/
 │   ├─ indicators.csv  # normalized indicator values
 │   └─ scores.json     # pillar + composite scores by date
 └─ sources.md          # data provenance and source URLs
```

### Data Record Schema

Each indicator record includes:
- `date`: ISO 8601 date string
- `phase`: "post-jan6" | "trump-era" | "baseline"
- `pillar`: "politics" | "media" | "business" | "technology"
- `indicator`: specific indicator name (e.g., "voter_suppression_laws")
- `value`: raw numeric value
- `normalized_value`: 0–100 normalized score
- `direction`: "increasing" | "decreasing" (worsening vs. improving)
- `confidence`: "high" | "medium" | "low"
- `source_url`: URL to source data

Each event record includes:
- `date`: ISO 8601 date string
- `phase`: time phase
- `pillar`: affected pillar(s)
- `gravity`: 1–5 severity score
- `description`: event description
- `location`: state or federal level
- `sources`: array of source URLs
- `confidence`: confidence level

## Scoring Algorithm

1. **Load raw data** → Extract indicators and events
2. **Normalize indicators** → Apply min-max normalization within phase
3. **Compute pillar scores** → Average indicators within each pillar
4. **Apply event gravity** → Add penalties for significant events
5. **Apply temporal decay** → Weight recent events more heavily
6. **Compute composite score** → Weighted average of pillars
7. **Calculate uncertainty** → Standard error and confidence bands
8. **Export scores** → Generate scores.json with time series data

## Weight Presets

### Equal (Default)
- Politics: 0.25
- Media: 0.25
- Business: 0.25
- Technology: 0.25

### Politics-Heavy
- Politics: 0.40
- Media: 0.25
- Business: 0.20
- Technology: 0.15

### Media-Heavy
- Politics: 0.20
- Media: 0.40
- Business: 0.20
- Technology: 0.20

### Business-Heavy
- Politics: 0.25
- Media: 0.20
- Business: 0.40
- Technology: 0.15

### Technology-Heavy
- Politics: 0.20
- Media: 0.25
- Business: 0.15
- Technology: 0.40

## Data Quality Standards

- All data must be sourced from verifiable, public records
- Each indicator must have at least one source URL
- Confidence levels assigned based on:
  - Source reliability (government records = high, news reports = medium/low)
  - Data completeness (complete datasets = high, partial = medium/low)
  - Verification status (verified = high, unverified = low)
- Regular audits of data sources and methodology

## Future Enhancements

- Machine learning models for trend prediction
- Automated data collection from APIs
- Real-time event detection and scoring
- Comparative analysis with international democratic backsliding trends
- State-level granularity and filtering

