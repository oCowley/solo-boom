'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import styles from './dashboard.module.css';

export default function AdminDashboard() {
  const { user, userData, isAdmin } = useAuth();
  const [playerCount, setPlayerCount] = useState<number | null>(null);

  useEffect(() => {
    const loadPlayerCount = async () => {
      try {
        const response = await fetch('/api/leaderboard/profiles');
        if (response.ok) {
          const data = await response.json();
          setPlayerCount(data.profiles?.length || 0);
        }
      } catch (error) {
        console.error('Error loading player count:', error);
      }
    };

    loadPlayerCount();
  }, []);

  return (
    <div className={styles.dashboardContainer}>
      <header className={styles.header}>
        <h1 className={styles.title}>Dashboard</h1>
        <p className={styles.subtitle}>
          Bem-vindo, {userData?.email?.split('@')[0] || user?.email?.split('@')[0] || 'Usuário'}!
        </p>
      </header>

      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={styles.statIcon}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
          </div>
          <div className={styles.statContent}>
            <h3 className={styles.statTitle}>Jogadores Cadastrados</h3>
            <p className={styles.statValue}>{playerCount !== null ? playerCount : '...'}</p>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statIcon}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
              <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
              <path d="M4 22h16" />
              <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" />
              <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" />
              <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" />
            </svg>
          </div>
          <div className={styles.statContent}>
            <h3 className={styles.statTitle}>Rankings Ativos</h3>
            <p className={styles.statValue}>1</p>
          </div>
        </div>

        {isAdmin && (
          <div className={styles.statCard}>
            <div className={styles.statIcon}>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 20h9" />
                <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
              </svg>
            </div>
            <div className={styles.statContent}>
              <h3 className={styles.statTitle}>Permissões</h3>
              <p className={styles.statValue}>Administrador</p>
            </div>
          </div>
        )}
      </div>

      <div className={styles.quickActions}>
        <h2 className={styles.sectionTitle}>Ações Rápidas</h2>
        <div className={styles.actionsGrid}>
          <a href="/admin/leaderboard" className={styles.actionCard}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
              <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
              <path d="M4 22h16" />
              <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" />
              <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" />
              <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" />
            </svg>
            <h3>Gerenciar Leaderboard</h3>
            <p>Visualizar e editar jogadores do ranking</p>
          </a>

          {isAdmin && (
            <a href="/admin/add-player" className={styles.actionCard}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <path d="M12 8v8M8 12h8" />
              </svg>
              <h3>Adicionar Jogador</h3>
              <p>Adicionar novo jogador ao leaderboard</p>
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
