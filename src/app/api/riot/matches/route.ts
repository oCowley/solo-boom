import { NextRequest, NextResponse } from 'next/server';
import type { Match } from '@/types/riot';
import { REGION_ROUTING, type Region } from '@/lib/riot-api';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const puuid = searchParams.get('puuid');
  const region = (searchParams.get('region') || 'br1') as Region;
  const count = parseInt(searchParams.get('count') || '10');

  if (!puuid) {
    return NextResponse.json(
      { error: 'PUUID é obrigatório' },
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
    const routing = REGION_ROUTING[region];
    
    // Primeiro, buscar lista de match IDs
    const matchListUrl = `https://${routing}.api.riotgames.com/lol/match/v5/matches/by-puuid/${puuid}/ids?start=0&count=${count}`;
    
    const matchListResponse = await fetch(matchListUrl, {
      headers: {
        'X-Riot-Token': apiKey,
      },
    });

    if (!matchListResponse.ok) {
      throw new Error(`Riot API error: ${matchListResponse.status}`);
    }

    const matchIds: string[] = await matchListResponse.json();

    // Buscar detalhes de cada partida
    const matchesPromises = matchIds.map(async (matchId) => {
      const matchUrl = `https://${routing}.api.riotgames.com/lol/match/v5/matches/${matchId}`;
      const matchResponse = await fetch(matchUrl, {
        headers: {
          'X-Riot-Token': apiKey,
        },
      });

      if (!matchResponse.ok) {
        return null;
      }

      return matchResponse.json() as Promise<Match>;
    });

    const matches = (await Promise.all(matchesPromises)).filter(
      (match): match is Match => match !== null
    );

    return NextResponse.json({ matches });
  } catch (error) {
    console.error('Error fetching matches:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar histórico de partidas' },
      { status: 500 }
    );
  }
}

