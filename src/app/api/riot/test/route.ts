import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const apiKey = process.env.RIOT_API_KEY;

  if (!apiKey) {
    return NextResponse.json(
      { 
        error: 'API Key não configurada',
        message: 'Crie um arquivo .env.local na raiz do projeto com: RIOT_API_KEY=sua_chave_aqui'
      },
      { status: 500 }
    );
  }

  // Testar a API Key fazendo uma requisição simples
  try {
    const testUrl = 'https://br1.api.riotgames.com/lol/status/v4/platform-data';
    const response = await fetch(testUrl, {
      headers: {
        'X-Riot-Token': apiKey,
      },
    });

    const responseText = await response.text();

    if (!response.ok) {
      return NextResponse.json({
        success: false,
        status: response.status,
        statusText: response.statusText,
        error: responseText,
        apiKeyLength: apiKey.length,
        apiKeyPrefix: apiKey.substring(0, 8) + '...',
        message: response.status === 403 
          ? 'API Key inválida ou expirada. Verifique no portal da Riot Games.'
          : `Erro na API: ${response.status}`,
      }, { status: response.status });
    }

    return NextResponse.json({
      success: true,
      message: 'API Key está funcionando corretamente!',
      apiKeyLength: apiKey.length,
      apiKeyPrefix: apiKey.substring(0, 8) + '...',
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Erro desconhecido',
      message: 'Erro ao testar a API Key',
    }, { status: 500 });
  }
}

