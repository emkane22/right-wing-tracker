# Right-Wing Tracker

A data-driven website that tracks democratic backsliding within the U.S. right wing (politics, media, business, and technology) from 2000–present, starting with post–Jan 6 2021 data.

## Overview

This project uses **observable-first principles** to track democratic backsliding through auditable, objective indicators (laws, arrests, budgets, corporate filings) instead of subjective "expert ratings."

### Four Pillars

- **Politics & Elections** – interference, restrictive laws, oversight erosion
- **Media & Information** – journalist arrests, SLAPP suits, FOIA denials
- **Business & Money** – PAC funding to anti-democratic actors, lobbying
- **Technology Platforms** – policy rollbacks, reinstatement of extremist content

### Time Phases

- **Phase 1**: Post-Jan 6 (2021–present) → current focus
- **Phase 2**: Trump Era (2016–2021) → next
- **Phase 3**: Baseline (2000–2016) → final context

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- TypeScript

### Installation

```bash
# Install dependencies
npm install

# Generate initial scores from sample data
npm run generate-scores

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

### Project Structure

```
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   └── page.tsx           # Main page
├── src/
│   ├── lib/               # Core library functions
│   │   ├── etl-server.ts  # ETL functions (server-side)
│   │   ├── scoring.ts     # Scoring algorithms
│   │   ├── trends.ts      # Trend analysis
│   │   ├── presets.ts     # Weight presets
│   │   ├── provenance.ts  # Data provenance
│   │   └── types.ts       # TypeScript types
│   └── hooks/
│       └── useScores.ts   # React hook for scores
├── data/
│   ├── raw/               # Raw source data
│   ├── events/            # Event data (JSONL)
│   └── processed/         # Processed indicators and scores
└── METHODOLOGY.md         # Detailed methodology
```

## Data Processing

### Generate Scores

After adding or updating indicator data, regenerate scores:

```bash
npm run generate-scores
```

This will:
1. Load indicators from `data/processed/indicators.csv`
2. Load events from `data/events/*.jsonl`
3. Compute pillar and composite scores
4. Export to `data/processed/scores-*.json`

### Adding Data

1. **Indicators**: Add rows to `data/processed/indicators.csv` with the required columns
2. **Events**: Add events to `data/events/{phase}-events.jsonl` (one JSON object per line)
3. Run `npm run generate-scores` to update scores

## Testing

```bash
# Run tests
npm test
```

## Methodology

See [METHODOLOGY.md](./METHODOLOGY.md) for detailed information about:
- Scoring algorithms
- Normalization methods
- Event gravity penalties
- Temporal decay
- Weight presets

## API

### `/api/scores?phase={phase}`

Returns scores for a specific phase (`post-jan6`, `trump-era`, `baseline`).

## Development

### Key Files

- `src/lib/etl-server.ts` - Load raw data, normalize by phase, export indicators.csv
- `src/lib/scoring.ts` - Combine indicators → pillar/composite + event gravity
- `src/lib/trends.ts` - Month-to-month deltas, turning points
- `src/lib/presets.ts` - Weight presets (equal, politicsHeavy, mediaHeavy)
- `src/lib/provenance.ts` - Attach sources and timestamps
- `src/hooks/useScores.ts` - React hook to load scores in UI

### UI Hooks

- `useScores(options)` - Load composite & pillar scores from API
- Supports phase filtering, state filtering (future), and weight presets

## License

Private project - All rights reserved

## Contributing

This is a private project. For questions or contributions, please contact the repository owner.
