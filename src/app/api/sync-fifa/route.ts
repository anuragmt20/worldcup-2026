import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

// Server-side route to fetch official FIFA match results and schedule dynamically
export async function GET() {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5s timeout

    const response = await fetch('https://worldcup26.ir/get/games', {
      signal: controller.signal,
      headers: { 'User-Agent': 'FIFA-WorldCup-Portal-2026' },
      next: { revalidate: 30 } // Cache for 30 seconds
    });

    clearTimeout(timeoutId);

    if (response.ok) {
      const data = await response.json();
      if (data && data.games && Array.isArray(data.games)) {
        return NextResponse.json({ 
          success: true, 
          source: 'Official FIFA Match Center (Live API)',
          matches: data.games
        });
      }
    }
    
    throw new Error('API returned invalid format or failed');

  } catch (err: any) {
    console.warn('FIFA Sync API failed, using local fallback:', err.message);
    try {
      // Fallback to local schedule database
      const filePath = path.join(process.cwd(), 'src/data/football.matches.json');
      const fileContent = fs.readFileSync(filePath, 'utf-8');
      const matches = JSON.parse(fileContent);

      return NextResponse.json({ 
        success: true, 
        source: 'Local FIFA Database (Offline Fallback)',
        matches: matches
      });
    } catch (fallbackErr: any) {
      return NextResponse.json({ success: false, error: fallbackErr.message }, { status: 500 });
    }
  }
}

