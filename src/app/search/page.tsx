'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { PlayerProfile } from '@/types/riot';
import PlayerProfileCard from '@/components/PlayerProfileCard';
import MatchHistoryList from '@/components/MatchHistoryList';
import styles from './page.module.css';

export default function SearchPage() {
  const [summonerName, setSummonerName] = useState('');
  const [region, setRegion] = useState('br1');
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState<PlayerProfile | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!summonerName.trim()) {
      setError('Digite o nome do invocador');
      return;
    }

    setLoading(true);
    setError(null);
    setProfile(null);

    try {
      const response = await fetch(
        `/api/riot/profile?name=${encodeURIComponent(summonerName)}&region=${region}`
      );

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Erro ao buscar perfil');
      }

      const data = await response.json();
      setProfile(data.profile);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao buscar perfil');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <Link href="/" className={styles.logoLink}>
          <Image
            src="/images/logo-soloboom.png"
            alt="Soloboom Logo"
            width={180}
            height={70}
            className={styles.logoImage}
            priority
          />
        </Link>
        <Link href="/" className={styles.backButton}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
          <span>Voltar</span>
        </Link>
      </header>
      <div className={styles.searchSection}>
        <h1 className={styles.title}>Buscar Jogador</h1>
        <form onSubmit={handleSearch} className={styles.searchForm}>
          <div className={styles.inputGroup}>
            <select
              value={region}
              onChange={(e) => setRegion(e.target.value)}
              className={styles.regionSelect}
            >
              <option value="br1">BR</option>
              <option value="na1">NA</option>
              <option value="euw1">EUW</option>
              <option value="eun1">EUN</option>
              <option value="kr">KR</option>
              <option value="jp1">JP</option>
              <option value="la1">LAN</option>
              <option value="la2">LAS</option>
              <option value="oc1">OCE</option>
              <option value="tr1">TR</option>
              <option value="ru">RU</option>
            </select>
            <input
              type="text"
              value={summonerName}
              onChange={(e) => setSummonerName(e.target.value)}
              placeholder="Digite o nome do invocador ou Riot ID (nome#tagline)..."
              className={styles.searchInput}
              disabled={loading}
            />
            <button
              type="submit"
              className={styles.searchButton}
              disabled={loading}
            >
              {loading ? 'Buscando...' : 'Buscar'}
            </button>
          </div>
        </form>

        {error && (
          <div className={styles.errorMessage}>
            {error}
          </div>
        )}
      </div>

      {profile && (
        <div className={styles.resultsSection}>
          <PlayerProfileCard profile={profile} />
          <MatchHistoryList 
            matches={profile.matchHistory.matches}
            puuid={profile.summoner.puuid}
          />
        </div>
      )}
    </div>
  );
}

