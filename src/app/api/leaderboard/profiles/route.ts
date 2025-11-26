import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import { join } from 'path';

const PROFILES_FILE = join(process.cwd(), 'data', 'leaderboard-profiles.json');

interface LeaderboardProfile {
  id: string;
  summonerName: string;
  region: string;
  notes?: string;
  featured?: boolean;
}

// Garantir que o diretório existe
async function ensureDataDir() {
  const dataDir = join(process.cwd(), 'data');
  try {
    await fs.mkdir(dataDir, { recursive: true });
  } catch (error) {
    // Diretório já existe ou erro ao criar
  }
}

async function getProfiles(): Promise<LeaderboardProfile[]> {
  try {
    await ensureDataDir();
    const fileContent = await fs.readFile(PROFILES_FILE, 'utf-8');
    return JSON.parse(fileContent);
  } catch (error) {
    // Arquivo não existe, retornar array vazio
    return [];
  }
}

async function saveProfiles(profiles: LeaderboardProfile[]): Promise<void> {
  await ensureDataDir();
  await fs.writeFile(PROFILES_FILE, JSON.stringify(profiles, null, 2), 'utf-8');
}

export async function GET() {
  try {
    const profiles = await getProfiles();
    return NextResponse.json({ profiles });
  } catch (error) {
    console.error('Error reading profiles:', error);
    return NextResponse.json(
      { error: 'Erro ao carregar perfis' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { summonerName, region, notes, featured } = body;

    if (!summonerName || !region) {
      return NextResponse.json(
        { error: 'Nome do invocador e região são obrigatórios' },
        { status: 400 }
      );
    }

    const profiles = await getProfiles();
    
    // Verificar se já existe
    const exists = profiles.find(
      p => p.summonerName.toLowerCase() === summonerName.toLowerCase() && p.region === region
    );

    if (exists) {
      return NextResponse.json(
        { error: 'Perfil já cadastrado' },
        { status: 400 }
      );
    }

    const newProfile: LeaderboardProfile = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      summonerName,
      region,
      notes: notes || undefined,
      featured: featured || false,
    };

    profiles.push(newProfile);
    await saveProfiles(profiles);

    return NextResponse.json({ profile: newProfile, message: 'Perfil adicionado com sucesso' });
  } catch (error) {
    console.error('Error adding profile:', error);
    return NextResponse.json(
      { error: 'Erro ao adicionar perfil' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'ID do perfil é obrigatório' },
        { status: 400 }
      );
    }

    const profiles = await getProfiles();
    const filtered = profiles.filter(p => p.id !== id);
    
    if (profiles.length === filtered.length) {
      return NextResponse.json(
        { error: 'Perfil não encontrado' },
        { status: 404 }
      );
    }

    await saveProfiles(filtered);
    return NextResponse.json({ message: 'Perfil removido com sucesso' });
  } catch (error) {
    console.error('Error deleting profile:', error);
    return NextResponse.json(
      { error: 'Erro ao remover perfil' },
      { status: 500 }
    );
  }
}

