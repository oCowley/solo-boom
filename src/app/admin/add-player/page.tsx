'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import styles from './page.module.css';

export default function AddPlayerPage() {
  const { isAdmin } = useAuth();
  const router = useRouter();
  const [summonerName, setSummonerName] = useState('');
  const [region, setRegion] = useState('br1');
  const [notes, setNotes] = useState('');
  const [featured, setFeatured] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  if (!isAdmin) {
    return (
      <div className={styles.container}>
        <div className={styles.error}>
          Você não tem permissão para adicionar jogadores. Apenas administradores podem realizar esta ação.
        </div>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!summonerName.trim()) {
      setMessage({ type: 'error', text: 'Nome do invocador é obrigatório' });
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      const response = await fetch('/api/leaderboard/profiles', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          summonerName: summonerName.trim(),
          region,
          notes: notes.trim() || undefined,
          featured,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage({ type: 'success', text: data.message || 'Perfil adicionado com sucesso!' });
        setSummonerName('');
        setNotes('');
        setFeatured(false);
        setTimeout(() => {
          router.push('/admin/leaderboard');
        }, 1500);
      } else {
        setMessage({ type: 'error', text: data.error || 'Erro ao adicionar perfil' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Erro ao adicionar perfil' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>Adicionar Jogador</h1>
        <p className={styles.subtitle}>
          Adicione um novo jogador ao leaderboard
        </p>
      </header>

      <div className={styles.formContainer}>
        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.formGroup}>
            <label htmlFor="summonerName">Nome do Invocador ou Riot ID</label>
            <input
              type="text"
              id="summonerName"
              value={summonerName}
              onChange={(e) => setSummonerName(e.target.value)}
              placeholder="Ex: Faker ou Faker#KR1"
              className={styles.input}
              required
              disabled={loading}
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="region">Região</label>
            <select
              id="region"
              value={region}
              onChange={(e) => setRegion(e.target.value)}
              className={styles.select}
              required
              disabled={loading}
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
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="notes">Notas (opcional)</label>
            <textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Ex: Lenda do League of Legends"
              className={styles.textarea}
              rows={3}
              disabled={loading}
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.checkboxLabel}>
              <input
                type="checkbox"
                checked={featured}
                onChange={(e) => setFeatured(e.target.checked)}
                className={styles.checkbox}
                disabled={loading}
              />
              <span>Destacar no Leaderboard</span>
            </label>
          </div>

          {message && (
            <div className={`${styles.message} ${styles[message.type]}`}>
              {message.text}
            </div>
          )}

          <div className={styles.formActions}>
            <button
              type="button"
              onClick={() => router.back()}
              className={styles.cancelButton}
              disabled={loading}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className={styles.submitButton}
              disabled={loading}
            >
              {loading ? 'Adicionando...' : 'Adicionar Jogador'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

