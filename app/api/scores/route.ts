/**
 * API route to serve scores data
 */

import { NextRequest, NextResponse } from "next/server";
import * as fs from "fs";
import * as path from "path";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const phase = searchParams.get("phase") || "post-jan6";
    
    // Validate phase
    if (!["post-jan6", "trump-era", "baseline"].includes(phase)) {
      return NextResponse.json(
        { error: "Invalid phase" },
        { status: 400 }
      );
    }
    
    // Load scores from file
    const scoresPath = path.join(process.cwd(), "data", "processed", `scores-${phase}.json`);
    
    if (!fs.existsSync(scoresPath)) {
      return NextResponse.json(
        { 
          error: `Scores not found for phase "${phase}".`,
          message: "This phase may not have data yet. Run 'npm run generate-scores' to generate scores for available phases.",
          phase 
        },
        { status: 404 }
      );
    }
    
    const scoresData = fs.readFileSync(scoresPath, "utf-8");
    const scores = JSON.parse(scoresData);
    
    // Check if the scores file is empty (no dates)
    if (!scores.dates || scores.dates.length === 0) {
      return NextResponse.json(
        { 
          error: `No data available for phase "${phase}".`,
          message: "This phase has no indicator data. Add data to data/processed/indicators.csv and run 'npm run generate-scores'.",
          phase 
        },
        { status: 404 }
      );
    }
    
    return NextResponse.json(scores);
  } catch (error) {
    console.error("Error loading scores:", error);
    return NextResponse.json(
      { error: "Failed to load scores" },
      { status: 500 }
    );
  }
}

