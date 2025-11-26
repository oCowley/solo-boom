import { NextRequest, NextResponse } from 'next/server';
import type { LeagueEntry } from '@/types/riot';
import { REGIONS, type Region } from '@/lib/riot-api';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const summonerId = searchParams.get('summonerId');
  const region = (searchParams.get('region') || 'br1') as Region;

  if (!summonerId) {
    return NextResponse.json(
      { error: 'ID do invocador é obrigatório' },
      { status: 400 }
    );
  }

  const apiKey = process.env.RIOT_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: 'API Key da Riot não configurada' },
      { status: 500 }
    );
  }

  try {
    const leagueUrl = `https://${region}.api.riotgames.com/lol/league/v4/entries/by-summoner/${summonerId}`;
    
    const leagueResponse = await fetch(leagueUrl, {
      headers: {
        'X-Riot-Token': apiKey,
      },
    });

    if (!leagueResponse.ok) {
      throw new Error(`Riot API error: ${leagueResponse.status}`);
    }

    const entries: LeagueEntry[] = await leagueResponse.json();
    
    // Separar ranked solo e flex
    const rankedSolo = entries.find(e => e.queueType === 'RANKED_SOLO_5x5') || null;
    const rankedFlex = entries.find(e => e.queueType === 'RANKED_FLEX_SR') || null;

    return NextResponse.json({ rankedSolo, rankedFlex });
  } catch (error) {
    console.error('Error fetching league entries:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar informações de ranked' },
      { status: 500 }
    );
  }
}

