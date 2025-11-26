'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { PlayerProfile } from '@/types/riot';
import PlayerProfileCard from '@/components/PlayerProfileCard';
import styles from './page.module.css';

interface LeaderboardProfile {
  id: string;
  summonerName: string;
  region: string;
  notes?: string;
  featured?: boolean;
}

export default function LeaderboardAdminPage() {
  const { isAdmin } = useAuth();
  const [profiles, setProfiles] = useState<LeaderboardProfile[]>([]);
  const [playerData, setPlayerData] = useState<Record<string, PlayerProfile>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadProfiles();
  }, []);

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

  const handleDelete = async (id: string) => {
    if (!isAdmin) return;
    
    if (!confirm('Tem certeza que deseja remover este perfil?')) {
      return;
    }

    try {
      const response = await fetch(`/api/leaderboard/profiles?id=${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        loadProfiles();
      } else {
        const data = await response.json();
        alert(data.error || 'Erro ao remover perfil');
      }
    } catch (error) {
      alert('Erro ao remover perfil');
    }
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>Carregando perfis...</div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>Gerenciar Leaderboard</h1>
        <p className={styles.subtitle}>
          {profiles.length} jogador{profiles.length !== 1 ? 'es' : ''} cadastrado{profiles.length !== 1 ? 's' : ''}
        </p>
      </header>

      {error && (
        <div className={styles.error}>{error}</div>
      )}

      {profiles.length === 0 ? (
        <div className={styles.empty}>
          <p>Nenhum perfil cadastrado ainda.</p>
          {isAdmin && (
            <a href="/admin/add-player" className={styles.addButton}>
              Adicionar Primeiro Jogador
            </a>
          )}
        </div>
      ) : (
        <div className={styles.profilesGrid}>
          {profiles.map((profile) => {
            const data = playerData[profile.id];
            return (
              <div key={profile.id} className={styles.profileCard}>
                {data ? (
                  <PlayerProfileCard profile={data} />
                ) : (
                  <div className={styles.loadingProfile}>
                    Carregando dados de {profile.summonerName}...
                  </div>
                )}
                {profile.notes && (
                  <div className={styles.notes}>{profile.notes}</div>
                )}
                {isAdmin && (
                  <div className={styles.actions}>
                    <button
                      onClick={() => handleDelete(profile.id)}
                      className={styles.deleteButton}
                    >
                      Remover
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

