import { NextRequest, NextResponse } from 'next/server';
import type { Summoner } from '@/types/riot';
import { REGIONS, type Region } from '@/lib/riot-api';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const summonerName = searchParams.get('name');
  const region = (searchParams.get('region') || 'br1') as Region;

  if (!summonerName) {
    return NextResponse.json(
      { error: 'Nome do invocador é obrigatório' },
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
    // Remover tagline do Riot ID (formato: nome#tagline)
    const cleanSummonerName = summonerName.split('#')[0].trim();
    
    if (!cleanSummonerName) {
      return NextResponse.json(
        { error: 'Nome do invocador inválido' },
        { status: 400 }
      );
    }

    // Buscar informações do invocador
    const summonerUrl = `https://${region}.api.riotgames.com/lol/summoner/v4/summoners/by-name/${encodeURIComponent(cleanSummonerName)}`;
    
    const summonerResponse = await fetch(summonerUrl, {
      headers: {
        'X-Riot-Token': apiKey,
      },
    });

    if (!summonerResponse.ok) {
      const errorText = await summonerResponse.text();
      console.error('Riot API Error:', {
        status: summonerResponse.status,
        statusText: summonerResponse.statusText,
        body: errorText,
        url: summonerUrl,
      });

      if (summonerResponse.status === 404) {
        return NextResponse.json(
          { error: 'Invocador não encontrado. Verifique o nome e a região.' },
          { status: 404 }
        );
      }

      if (summonerResponse.status === 403) {
        return NextResponse.json(
          { error: 'API Key inválida ou expirada. Verifique sua configuração.' },
          { status: 403 }
        );
      }

      if (summonerResponse.status === 429) {
        return NextResponse.json(
          { error: 'Limite de requisições excedido. Tente novamente em alguns instantes.' },
          { status: 429 }
        );
      }

      throw new Error(`Riot API error: ${summonerResponse.status} - ${errorText}`);
    }

    const summoner: Summoner = await summonerResponse.json();

    return NextResponse.json({ summoner });
  } catch (error) {
    console.error('Error fetching summoner:', error);
    
    const errorMessage = error instanceof Error 
      ? error.message 
      : 'Erro desconhecido ao buscar invocador';
    
    return NextResponse.json(
      { 
        error: errorMessage,
        details: process.env.NODE_ENV === 'development' ? String(error) : undefined
      },
      { status: 500 }
    );
  }
}

