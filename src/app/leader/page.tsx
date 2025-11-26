'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/contexts/AuthContext';
import UserMenu from '@/components/UserMenu';
import { PlayerProfile } from '@/types/riot';
import PlayerProfileCard from '@/components/PlayerProfileCard';
import { getTierValue, getRankValue } from '@/lib/riot-api';
import styles from './page.module.css';

interface LeaderboardProfile {
  id: string;
  summonerName: string;
  region: string;
  notes?: string;
  featured?: boolean;
}

export default function LeaderPage() {
  const { user, isAdmin } = useAuth();
  const [profiles, setProfiles] = useState<LeaderboardProfile[]>([]);
  const [playerData, setPlayerData] = useState<Record<string, PlayerProfile>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Carregar perfis cadastrados
    const loadProfiles = async () => {
      try {
        const response = await fetch('/api/leaderboard/profiles');
        if (response.ok) {
          const data = await response.json();
          setProfiles(data.profiles || []);
          
          // Carregar dados de cada perfil
          const profilePromises = (data.profiles || []).map(async (profile: LeaderboardProfile) => {
            try {
              const profileResponse = await fetch(
                `/api/riot/profile?name=${encodeURIComponent(profile.summonerName)}&region=${profile.region}`
              );
              if (profileResponse.ok) {
                const profileData = await profileResponse.json();
                return { id: profile.id, data: profileData.profile };
              }
              return null;
            } catch (err) {
              console.error(`Error loading profile ${profile.summonerName}:`, err);
              return null;
            }
          });

          const loadedProfiles = await Promise.all(profilePromises);
          const profilesMap: Record<string, PlayerProfile> = {};
          
          loadedProfiles.forEach((item) => {
            if (item) {
              profilesMap[item.id] = item.data;
            }
          });
          
          setPlayerData(profilesMap);
        } else {
          setError('Erro ao carregar perfis');
        }
      } catch (err) {
        console.error('Error loading profiles:', err);
        setError('Erro ao carregar perfis');
      } finally {
        setLoading(false);
      }
    };

    loadProfiles();
  }, []);

  // Função para ordenar perfis por rank
  const sortProfilesByRank = (profileList: LeaderboardProfile[]) => {
    return [...profileList].sort((a, b) => {
      const dataA = playerData[a.id];
      const dataB = playerData[b.id];

      // Se não tem dados, vai para o final
      if (!dataA && !dataB) return 0;
      if (!dataA) return 1;
      if (!dataB) return -1;

      const rankedA = dataA.rankedSolo;
      const rankedB = dataB.rankedSolo;

      // Se não tem ranked, vai para o final
      if (!rankedA && !rankedB) return 0;
      if (!rankedA) return 1;
      if (!rankedB) return -1;

      // Comparar por tier primeiro
      const tierA = getTierValue(rankedA.tier);
      const tierB = getTierValue(rankedB.tier);
      
      if (tierA !== tierB) {
        return tierB - tierA; // Maior tier primeiro
      }

      // Se mesmo tier, comparar por rank
      const rankA = getRankValue(rankedA.rank);
      const rankB = getRankValue(rankedB.rank);
      
      if (rankA !== rankB) {
        return rankB - rankA; // Maior rank primeiro
      }

      // Se mesmo tier e rank, comparar por LP
      return rankedB.leaguePoints - rankedA.leaguePoints;
    });
  };

  const featuredProfiles = useMemo(() => {
    return sortProfilesByRank(profiles.filter(p => p.featured));
  }, [profiles, playerData]);

  const regularProfiles = useMemo(() => {
    return sortProfilesByRank(profiles.filter(p => !p.featured));
  }, [profiles, playerData]);

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
        <nav className={styles.nav}>
          <Link href="/search" className={styles.navLink}>Buscar Jogador</Link>
          <Link href="/leader" className={`${styles.navLink} ${styles.active}`}>Leader</Link>
          <Link href="/#about" className={styles.navLink}>Sobre</Link>
          {user ? (
            <UserMenu />
          ) : (
            <Link href="/login" className={styles.loginButton}>Login</Link>
          )}
        </nav>
      </header>

      <main className={styles.main}>
        <div className={styles.hero}>
          <h1 className={styles.title}>Leaderboard</h1>
          <p className={styles.subtitle}>
            Os melhores jogadores cadastrados no Soloboom
          </p>
        </div>

        {loading && (
          <div className={styles.loading}>
            <div className={styles.spinner} />
            <p>Carregando perfis...</p>
          </div>
        )}

        {error && (
          <div className={styles.error}>
            {error}
          </div>
        )}

        {!loading && !error && (
          <>
            {featuredProfiles.length > 0 && (
              <section className={styles.section}>
                <h2 className={styles.sectionTitle}>Destaques</h2>
                <div className={styles.profilesGrid}>
                  {featuredProfiles.map((profile) => {
                    const data = playerData[profile.id];
                    if (!data) return null;
                    return (
                      <div key={profile.id} className={styles.profileWrapper}>
                        <PlayerProfileCard profile={data} />
                        {profile.notes && (
                          <div className={styles.notes}>{profile.notes}</div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </section>
            )}

            {regularProfiles.length > 0 && (
              <section className={styles.section}>
                <h2 className={styles.sectionTitle}>Todos os Jogadores</h2>
                <div className={styles.profilesGrid}>
                  {regularProfiles.map((profile) => {
                    const data = playerData[profile.id];
                    if (!data) return null;
                    return (
                      <div key={profile.id} className={styles.profileWrapper}>
                        <PlayerProfileCard profile={data} />
                        {profile.notes && (
                          <div className={styles.notes}>{profile.notes}</div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </section>
            )}

            {profiles.length === 0 && (
              <div className={styles.empty}>
                <p>Nenhum perfil cadastrado ainda.</p>
                <p className={styles.emptySubtext}>
                  Os administradores podem adicionar perfis através do painel de administração.
                </p>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}

