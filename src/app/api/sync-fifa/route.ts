import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export const dynamic = 'force-dynamic';

// Server-side route to fetch official FIFA match results and schedule dynamically
export async function GET() {
  const urlsToTry = [
    'https://worldcup26.ir/get/games',
    'https://corsproxy.io/?https://worldcup26.ir/get/games',
    'https://api.codetabs.com/v1/proxy?quest=https://worldcup26.ir/get/games',
    'https://thingproxy.freeboard.io/fetch/https://worldcup26.ir/get/games'
  ];

  let gamesData: any = null;
  let successSource = '';

  for (const url of urlsToTry) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000); // 8s timeout per attempt

      const response = await fetch(url, {
        signal: controller.signal,
        headers: { 'User-Agent': 'FIFA-WorldCup-Portal-2026' },
        next: { revalidate: 0 } // Do not cache this dynamic sync call
      });

      clearTimeout(timeoutId);

      if (response.ok) {
        let data = await response.json();
        if (data && typeof data === 'string') {
          data = JSON.parse(data);
        }
        if (data && data.contents) {
          data = typeof data.contents === 'string' ? JSON.parse(data.contents) : data.contents;
        }

        if (data && data.games && Array.isArray(data.games)) {
          gamesData = data.games;
          successSource = url === urlsToTry[0]
            ? 'Official FIFA Match Center (Live API)'
            : `Official FIFA Match Center (Live API via Proxy: ${new URL(url).hostname})`;
          break;
        }
      }
    } catch (e: any) {
      console.warn(`Fetch failed for URL: ${url}. Error: ${e.message}`);
    }
  }

  if (gamesData) {
    return NextResponse.json({
      success: true,
      source: successSource,
      matches: gamesData
    });
  }

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

