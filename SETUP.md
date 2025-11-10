# Setup Guide

## Quick Start

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Generate initial scores**
   ```bash
   npm run generate-scores
   ```
   This creates `data/processed/scores-post-jan6.json` from the sample data.

3. **Run development server**
   ```bash
   npm run dev
   ```

4. **Open browser**
   Navigate to http://localhost:3000

## Data Files

### Sample Data Provided

- `data/processed/indicators.csv` - Sample indicator data for post-Jan 6 phase
- `data/events/post-jan6-events.jsonl` - Sample event data

### Generated Files

After running `npm run generate-scores`:
- `data/processed/scores-post-jan6.json` - Computed scores for post-Jan 6 phase
- `data/processed/scores-trump-era.json` - Empty scores (no data yet)
- `data/processed/scores-baseline.json` - Empty scores (no data yet)

## Adding New Data

### Adding Indicators

1. Edit `data/processed/indicators.csv`
2. Add rows with the following columns:
   - `date` - ISO 8601 date (YYYY-MM-DD)
   - `phase` - "post-jan6", "trump-era", or "baseline"
   - `pillar` - "politics", "media", "business", or "technology"
   - `indicator` - Indicator name (e.g., "voter_restriction_laws")
   - `value` - Raw numeric value
   - `normalized_value` - Will be computed automatically (can be 0 initially)
   - `direction` - "increasing" or "decreasing"
   - `confidence` - "high", "medium", or "low"
   - `source_url` - URL to source data
   - `location` - Optional state code or "federal"

3. Run `npm run generate-scores` to recompute normalized values and scores

### Adding Events

1. Edit `data/events/{phase}-events.jsonl`
2. Add one JSON object per line with:
   ```json
   {
     "date": "2021-01-20",
     "phase": "post-jan6",
     "pillars": ["politics"],
     "gravity": 5,
     "description": "Event description",
     "location": "federal",
     "sources": ["https://example.com"],
     "confidence": "high"
   }
   ```

3. Run `npm run generate-scores` to update scores with event penalties

## Using the useScores Hook

In your React components:

```typescript
import { useScores } from "@/src/hooks/useScores";

function MyComponent() {
  const { scores, loading, error, currentScore } = useScores({
    phase: "post-jan6",
    weightPreset: "equal"
  });

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;
  
  return (
    <div>
      <h1>Current Score: {currentScore?.score}</h1>
      {/* Render scores... */}
    </div>
  );
}
```

## API Endpoints

### GET /api/scores?phase={phase}

Returns scores for a specific phase.

**Parameters:**
- `phase` (required): "post-jan6", "trump-era", or "baseline"

**Response:**
```json
{
  "dates": ["2021-02-01", "2021-03-01", ...],
  "composite_scores": [...],
  "metadata": {
    "phase": "post-jan6",
    "date_range": {
      "start": "2021-02-01",
      "end": "2021-07-01"
    },
    "last_updated": "2025-11-10T00:00:15.763Z"
  }
}
```

## Troubleshooting

### Scores not generating

- Check that `data/processed/indicators.csv` exists and has data
- Check that `data/events/{phase}-events.jsonl` exists (can be empty)
- Run `npm run generate-scores` and check for errors in console

### API returns 404

- Ensure scores have been generated: `npm run generate-scores`
- Check that `data/processed/scores-{phase}.json` exists
- Restart the dev server: `npm run dev`

### Type errors

- Run `npm install` to ensure all dependencies are installed
- Check that TypeScript is configured correctly in `tsconfig.json`

## Next Steps

1. **Add more indicator data** - Expand `indicators.csv` with real data
2. **Add more events** - Add events to `events.jsonl` files
3. **Backfill Trump era** - Add data for 2016-2021 phase
4. **Backfill baseline** - Add data for 2000-2016 phase
5. **Update UI** - Integrate `useScores` hook into the main page
6. **Add timeline slider** - Implement phase toggle and date range filtering
7. **Add weight toggles** - Allow users to switch between weight presets

