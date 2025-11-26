'use client';

import { Match } from '@/types/riot';
import { getChampionIconUrl, formatGameDuration } from '@/lib/riot-api';
import styles from './MatchHistoryList.module.css';

interface MatchHistoryListProps {
  matches: Match[];
  puuid: string;
}

export default function MatchHistoryList({ matches, puuid }: MatchHistoryListProps) {
  const getMatchResult = (match: Match) => {
    const participant = match.info.participants.find(p => p.puuid === puuid);
    return participant?.win || false;
  };

  const getParticipant = (match: Match): Match['info']['participants'][0] | undefined => {
    return match.info.participants.find(p => p.puuid === puuid);
  };

  const getKDA = (participant: Match['info']['participants'][0]) => {
    return `${participant.kills}/${participant.deaths}/${participant.assists}`;
  };

  const getKDARatio = (participant: Match['info']['participants'][0]) => {
    const kda = (participant.kills + participant.assists) / Math.max(participant.deaths, 1);
    return kda.toFixed(2);
  };

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) return `${diffMins}m atrás`;
    if (diffHours < 24) return `${diffHours}h atrás`;
    return `${diffDays}d atrás`;
  };

  const getQueueName = (queueId: number) => {
    const queueNames: Record<number, string> = {
      420: 'Ranked Solo/Duo',
      440: 'Ranked Flex',
      450: 'ARAM',
      400: 'Normal Draft',
      430: 'Normal Blind',
    };
    return queueNames[queueId] || `Queue ${queueId}`;
  };

  if (matches.length === 0) {
    return (
      <div className={styles.emptyState}>
        <p>Nenhuma partida encontrada</p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>Histórico de Partidas</h2>
      <div className={styles.matchesList}>
        {matches.map((match) => {
          const participant = getParticipant(match);
          if (!participant) return null;

          const won = getMatchResult(match);
          const kda = getKDA(participant);
          const kdaRatio = getKDARatio(participant);

          return (
            <div
              key={match.metadata.matchId}
              className={`${styles.matchCard} ${won ? styles.win : styles.loss}`}
            >
              <div className={styles.matchHeader}>
                <div className={styles.queueInfo}>
                  <span className={styles.queueName}>
                    {getQueueName(match.info.queueId)}
                  </span>
                  <span className={styles.matchDate}>
                    {formatDate(match.info.gameStartTimestamp)}
                  </span>
                </div>
                <div className={styles.matchResult}>
                  <span className={styles.resultText}>{won ? 'VITÓRIA' : 'DERROTA'}</span>
                  <span className={styles.matchDuration}>
                    {formatGameDuration(match.info.gameDuration)}
                  </span>
                </div>
              </div>

              <div className={styles.matchContent}>
                <div className={styles.championInfo}>
                  <img
                    src={getChampionIconUrl(participant.championName)}
                    alt={participant.championName}
                    className={styles.championIcon}
                  />
                  <div className={styles.championDetails}>
                    <div className={styles.championName}>{participant.championName}</div>
                    <div className={styles.championLevel}>Nível {participant.champLevel}</div>
                  </div>
                </div>

                <div className={styles.stats}>
                  <div className={styles.kda}>
                    <div className={styles.kdaValue}>{kda}</div>
                    <div className={styles.kdaRatio}>KDA {kdaRatio}</div>
                  </div>
                  <div className={styles.additionalStats}>
                    <div className={styles.stat}>
                      <span className={styles.statValue}>{participant.totalMinionsKilled}</span>
                      <span className={styles.statLabel}>CS</span>
                    </div>
                    <div className={styles.stat}>
                      <span className={styles.statValue}>
                        {((participant.totalMinionsKilled / (match.info.gameDuration / 60)) * 10).toFixed(1)}
                      </span>
                      <span className={styles.statLabel}>CS/min</span>
                    </div>
                    <div className={styles.stat}>
                      <span className={styles.statValue}>
                        {((participant.totalDamageDealtToChampions / 1000).toFixed(1))}k
                      </span>
                      <span className={styles.statLabel}>Dano</span>
                    </div>
                  </div>
                </div>

                <div className={styles.items}>
                  <div className={styles.itemsRow}>
                    {[0, 1, 2].map((i) => {
                      const itemId = participant[`item${i}` as 'item0' | 'item1' | 'item2'] as number;
                      return (
                        <div key={i} className={styles.itemSlot}>
                          {itemId > 0 ? (
                            <img
                              src={`https://ddragon.leagueoflegends.com/cdn/14.24.1/img/item/${itemId}.png`}
                              alt={`Item ${i}`}
                              className={styles.itemIcon}
                            />
                          ) : (
                            <div className={styles.emptyItem} />
                          )}
                        </div>
                      );
                    })}
                  </div>
                  <div className={styles.itemsRow}>
                    {[3, 4, 5].map((i) => {
                      const itemId = participant[`item${i}` as 'item3' | 'item4' | 'item5'] as number;
                      return (
                        <div key={i} className={styles.itemSlot}>
                          {itemId > 0 ? (
                            <img
                              src={`https://ddragon.leagueoflegends.com/cdn/14.24.1/img/item/${itemId}.png`}
                              alt={`Item ${i}`}
                              className={styles.itemIcon}
                            />
                          ) : (
                            <div className={styles.emptyItem} />
                          )}
                        </div>
                      );
                    })}
                  </div>
                  {participant.item6 > 0 && (
                    <div className={styles.trinketSlot}>
                      <img
                        src={`https://ddragon.leagueoflegends.com/cdn/14.24.1/img/item/${participant.item6}.png`}
                        alt="Trinket"
                        className={styles.itemIcon}
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

