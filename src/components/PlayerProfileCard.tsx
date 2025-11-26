'use client';

import { PlayerProfile } from '@/types/riot';
import { getProfileIconUrl, getTierColor, formatGameDuration } from '@/lib/riot-api';
import styles from './PlayerProfileCard.module.css';

interface PlayerProfileCardProps {
  profile: PlayerProfile;
}

export default function PlayerProfileCard({ profile }: PlayerProfileCardProps) {
  const { summoner, rankedSolo, rankedFlex, matchHistory } = profile;

  const getTierDisplay = (entry: typeof rankedSolo) => {
    if (!entry) return 'Unranked';
    return `${entry.tier} ${entry.rank}`;
  };

  const getWinrateColor = (winrate: number) => {
    if (winrate >= 60) return 'var(--accent-yellow)';
    if (winrate >= 50) return 'var(--accent-orange)';
    return 'var(--accent-red)';
  };

  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <div className={styles.profileSection}>
          <div className={styles.avatarContainer}>
            <img
              src={getProfileIconUrl(summoner.profileIconId)}
              alt={`${summoner.name} avatar`}
              className={styles.avatar}
            />
            <div className={styles.levelBadge}>{summoner.summonerLevel}</div>
          </div>
          <div className={styles.profileInfo}>
            <h2 className={styles.summonerName}>{summoner.name}</h2>
            <p className={styles.summonerLevel}>Nível {summoner.summonerLevel}</p>
          </div>
        </div>

        <div className={styles.statsGrid}>
          <div className={styles.statItem}>
            <div className={styles.statLabel}>Winrate</div>
            <div 
              className={styles.statValue}
              style={{ color: getWinrateColor(matchHistory.winrate) }}
            >
              {matchHistory.winrate.toFixed(1)}%
            </div>
            <div className={styles.statSubtext}>
              {matchHistory.wins}W / {matchHistory.losses}L
            </div>
          </div>
          <div className={styles.statItem}>
            <div className={styles.statLabel}>Total de Partidas</div>
            <div className={styles.statValue}>{matchHistory.totalGames}</div>
          </div>
        </div>
      </div>

      <div className={styles.rankedSection}>
        <div className={styles.rankedCard}>
          <div className={styles.rankedLabel}>Ranked Solo/Duo</div>
          {rankedSolo ? (
            <>
              <div 
                className={styles.rankedTier}
                style={{ color: getTierColor(rankedSolo.tier) }}
              >
                {getTierDisplay(rankedSolo)}
              </div>
              <div className={styles.rankedDetails}>
                <span>{rankedSolo.leaguePoints} LP</span>
                <span>•</span>
                <span>{rankedSolo.wins}W {rankedSolo.losses}L</span>
                <span>•</span>
                <span>
                  {((rankedSolo.wins / (rankedSolo.wins + rankedSolo.losses)) * 100).toFixed(1)}% WR
                </span>
              </div>
              {rankedSolo.hotStreak && (
                <div className={styles.hotStreak}>🔥 Hot Streak</div>
              )}
            </>
          ) : (
            <div className={styles.unranked}>Unranked</div>
          )}
        </div>

        <div className={styles.rankedCard}>
          <div className={styles.rankedLabel}>Ranked Flex</div>
          {rankedFlex ? (
            <>
              <div 
                className={styles.rankedTier}
                style={{ color: getTierColor(rankedFlex.tier) }}
              >
                {getTierDisplay(rankedFlex)}
              </div>
              <div className={styles.rankedDetails}>
                <span>{rankedFlex.leaguePoints} LP</span>
                <span>•</span>
                <span>{rankedFlex.wins}W {rankedFlex.losses}L</span>
                <span>•</span>
                <span>
                  {((rankedFlex.wins / (rankedFlex.wins + rankedFlex.losses)) * 100).toFixed(1)}% WR
                </span>
              </div>
              {rankedFlex.hotStreak && (
                <div className={styles.hotStreak}>🔥 Hot Streak</div>
              )}
            </>
          ) : (
            <div className={styles.unranked}>Unranked</div>
          )}
        </div>
      </div>
    </div>
  );
}

