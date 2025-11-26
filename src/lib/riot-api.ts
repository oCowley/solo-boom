// Configuração e utilitários para API da Riot Games

const RIOT_API_BASE = 'https://{region}.api.riotgames.com';
const RIOT_API_ASIA = 'https://{region}.api.riotgames.com';

// Regiões suportadas
export const REGIONS = {
  BR1: 'br1',
  EUN1: 'eun1',
  EUW1: 'euw1',
  JP1: 'jp1',
  KR: 'kr',
  LA1: 'la1',
  LA2: 'la2',
  NA1: 'na1',
  OC1: 'oc1',
  TR1: 'tr1',
  RU: 'ru',
} as const;

export type Region = typeof REGIONS[keyof typeof REGIONS];

// Mapeamento de região para routing value
export const REGION_ROUTING: Record<Region, string> = {
  br1: 'americas',
  eun1: 'europe',
  euw1: 'europe',
  jp1: 'asia',
  kr: 'asia',
  la1: 'americas',
  la2: 'americas',
  na1: 'americas',
  oc1: 'asia',
  tr1: 'europe',
  ru: 'europe',
};

export function getRiotApiUrl(endpoint: string, region: Region = 'br1'): string {
  const routing = REGION_ROUTING[region];
  return endpoint.replace('{region}', routing).replace('{platform}', region);
}

export function getProfileIconUrl(iconId: number): string {
  return `https://ddragon.leagueoflegends.com/cdn/14.24.1/img/profileicon/${iconId}.png`;
}

export function getChampionIconUrl(championName: string): string {
  return `https://ddragon.leagueoflegends.com/cdn/14.24.1/img/champion/${championName}.png`;
}

export function formatGameDuration(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${minutes}:${secs.toString().padStart(2, '0')}`;
}

export function getTierColor(tier: string): string {
  const tierColors: Record<string, string> = {
    IRON: '#8B7355',
    BRONZE: '#CD7F32',
    SILVER: '#C0C0C0',
    GOLD: '#FFD700',
    PLATINUM: '#00D4AA',
    EMERALD: '#00C896',
    DIAMOND: '#00B5FF',
    MASTER: '#A335EE',
    GRANDMASTER: '#FF3333',
    CHALLENGER: '#FFD700',
  };
  return tierColors[tier] || '#FFFFFF';
}

// Função para obter valor numérico do tier para ordenação
export function getTierValue(tier: string): number {
  const tierValues: Record<string, number> = {
    IRON: 1,
    BRONZE: 2,
    SILVER: 3,
    GOLD: 4,
    PLATINUM: 5,
    EMERALD: 6,
    DIAMOND: 7,
    MASTER: 8,
    GRANDMASTER: 9,
    CHALLENGER: 10,
  };
  return tierValues[tier] || 0;
}

// Função para obter valor numérico do rank para ordenação
export function getRankValue(rank: string): number {
  const rankValues: Record<string, number> = {
    IV: 1,
    III: 2,
    II: 3,
    I: 4,
  };
  return rankValues[rank] || 0;
}

