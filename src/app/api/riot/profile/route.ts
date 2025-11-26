import { NextRequest, NextResponse } from 'next/server';
import type { PlayerProfile, Match, MatchHistory } from '@/types/riot';
import { REGION_ROUTING, type Region } from '@/lib/riot-api';

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
    console.error('RIOT_API_KEY não encontrada nas variáveis de ambiente');
    return NextResponse.json(
      { 
        error: 'API Key da Riot não configurada',
        message: 'Crie um arquivo .env.local na raiz do projeto com: RIOT_API_KEY=sua_chave_aqui'
      },
      { status: 500 }
    );
  }

  // Log para debug (apenas mostrar que a key existe, não o valor completo)
  console.log('API Key encontrada, tamanho:', apiKey.length, 'prefixo:', apiKey.substring(0, 8) + '...');

  try {
    let summoner;
    let puuid: string;

    // Verificar se é Riot ID (formato: nome#tagline) ou Summoner Name antigo
    if (summonerName.includes('#')) {
      // Buscar por Riot ID usando Account-V1
      const [gameName, tagLine] = summonerName.split('#').map(s => s.trim());
      
      if (!gameName || !tagLine) {
        return NextResponse.json(
          { error: 'Formato de Riot ID inválido. Use: nome#tagline' },
          { status: 400 }
        );
      }

      // Account-V1 usa routing value (americas, europe, asia)
      const routing = REGION_ROUTING[region];
      const accountUrl = `https://${routing}.api.riotgames.com/riot/account/v1/accounts/by-riot-id/${encodeURIComponent(gameName)}/${encodeURIComponent(tagLine)}`;
      
      console.log('Buscando por Riot ID:', { gameName, tagLine, region, routing, url: accountUrl });
      
      const accountResponse = await fetch(accountUrl, {
        headers: { 'X-Riot-Token': apiKey },
      });

      if (!accountResponse.ok) {
        const errorText = await accountResponse.text();
        console.error('Riot Account API Error:', {
          status: accountResponse.status,
          statusText: accountResponse.statusText,
          body: errorText,
          url: accountUrl,
        });

        if (accountResponse.status === 404) {
          return NextResponse.json(
            { error: 'Riot ID não encontrado. Verifique o nome#tagline e a região.' },
            { status: 404 }
          );
        }
        
        if (accountResponse.status === 403) {
          return NextResponse.json(
            { error: 'API Key inválida ou expirada. Verifique se a chave está correta no arquivo .env.local' },
            { status: 403 }
          );
        }

        if (accountResponse.status === 429) {
          return NextResponse.json(
            { error: 'Limite de requisições excedido. Tente novamente em alguns instantes.' },
            { status: 429 }
          );
        }

        throw new Error(`Riot Account API error: ${accountResponse.status} - ${errorText}`);
      }

      const account = await accountResponse.json();
      puuid = account.puuid;

      // Agora buscar Summoner usando PUUID
      const summonerByPuuidUrl = `https://${region}.api.riotgames.com/lol/summoner/v4/summoners/by-puuid/${puuid}`;
      const summonerResponse = await fetch(summonerByPuuidUrl, {
        headers: { 'X-Riot-Token': apiKey },
      });

      if (!summonerResponse.ok) {
        const errorText = await summonerResponse.text();
        console.error('Riot Summoner API Error:', {
          status: summonerResponse.status,
          body: errorText,
        });
        throw new Error(`Erro ao buscar Summoner: ${summonerResponse.status} - ${errorText}`);
      }

      summoner = await summonerResponse.json();
    } else {
      // Buscar por Summoner Name antigo
      const cleanSummonerName = summonerName.trim();
      
      if (!cleanSummonerName) {
        return NextResponse.json(
          { error: 'Nome do invocador inválido' },
          { status: 400 }
        );
      }

      const summonerUrl = `https://${region}.api.riotgames.com/lol/summoner/v4/summoners/by-name/${encodeURIComponent(cleanSummonerName)}`;
      
      console.log('Buscando por Summoner Name:', { cleanSummonerName, region, url: summonerUrl });
      
      const summonerResponse = await fetch(summonerUrl, {
        headers: { 'X-Riot-Token': apiKey },
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
            { error: 'API Key inválida ou expirada. Verifique se a chave está correta no arquivo .env.local e se não expirou.' },
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

      summoner = await summonerResponse.json();
      puuid = summoner.puuid;
    }

    // 2. Buscar informações de ranked
    let rankedSolo = null;
    let rankedFlex = null;
    
    try {
      const leagueUrl = `https://${region}.api.riotgames.com/lol/league/v4/entries/by-summoner/${summoner.id}`;
      const leagueResponse = await fetch(leagueUrl, {
        headers: { 'X-Riot-Token': apiKey },
      });

      if (leagueResponse.ok) {
        const entries = await leagueResponse.json();
        rankedSolo = entries.find((e: any) => e.queueType === 'RANKED_SOLO_5x5') || null;
        rankedFlex = entries.find((e: any) => e.queueType === 'RANKED_FLEX_SR') || null;
      } else {
        console.warn('Failed to fetch league entries:', leagueResponse.status);
      }
    } catch (leagueError) {
      console.warn('Error fetching league entries (continuing without ranked info):', leagueError);
      // Continuar sem informações de ranked se houver erro
    }

    // 3. Buscar histórico de partidas
    let matches: Match[] = [];
    try {
      const routing = REGION_ROUTING[region];
      const matchListUrl = `https://${routing}.api.riotgames.com/lol/match/v5/matches/by-puuid/${puuid}/ids?start=0&count=20`;
      const matchListResponse = await fetch(matchListUrl, {
        headers: { 'X-Riot-Token': apiKey },
      });

      if (matchListResponse.ok) {
        const matchIds: string[] = await matchListResponse.json();
        
        // Limitar a 10 partidas para evitar muitas requisições
        const limitedMatchIds = matchIds.slice(0, 10);
        
        const matchesPromises = limitedMatchIds.map(async (matchId) => {
          try {
            const matchUrl = `https://${routing}.api.riotgames.com/lol/match/v5/matches/${matchId}`;
            const matchResponse = await fetch(matchUrl, {
              headers: { 'X-Riot-Token': apiKey },
            });
            if (matchResponse.ok) {
              return matchResponse.json() as Promise<Match>;
            }
            console.warn(`Failed to fetch match ${matchId}: ${matchResponse.status}`);
            return null;
          } catch (err) {
            console.warn(`Error fetching match ${matchId}:`, err);
            return null;
          }
        });

        matches = (await Promise.all(matchesPromises)).filter(
          (match): match is Match => match !== null
        );
      } else {
        console.warn('Failed to fetch match list:', matchListResponse.status);
      }
    } catch (matchError) {
      console.warn('Error fetching matches (continuing without matches):', matchError);
      // Continuar sem partidas se houver erro
    }

    // 4. Calcular winrate
    const wins = matches.filter(m => {
      const participant = m.info.participants.find(p => p.puuid === puuid);
      return participant?.win;
    }).length;
    const losses = matches.length - wins;
    const winrate = matches.length > 0 ? (wins / matches.length) * 100 : 0;

    const matchHistory: MatchHistory = {
      matches,
      totalGames: matches.length,
      wins,
      losses,
      winrate,
    };

    const profile: PlayerProfile = {
      summoner,
      rankedSolo,
      rankedFlex,
      matchHistory,
    };

    return NextResponse.json({ profile });
  } catch (error) {
    console.error('Error fetching profile:', error);
    
    const errorMessage = error instanceof Error 
      ? error.message 
      : 'Erro desconhecido ao buscar perfil do jogador';
    
    return NextResponse.json(
      { 
        error: errorMessage,
        details: process.env.NODE_ENV === 'development' ? String(error) : undefined
      },
      { status: 500 }
    );
  }
}

