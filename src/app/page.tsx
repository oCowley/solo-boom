'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import UserMenu from '@/components/UserMenu';
import styles from './page.module.css';

export default function Home() {
  const { user, isAdmin } = useAuth();
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setIsLoaded(true);
    
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({
        x: (e.clientX / window.innerWidth) * 100,
        y: (e.clientY / window.innerHeight) * 100,
      });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div className={styles.container}>
      {/* Efeito de cursor glow */}
      <div 
        className={styles.cursorGlow}
        style={{
          left: `${mousePosition.x}%`,
          top: `${mousePosition.y}%`,
        }}
      />

      {/* Partículas animadas de fundo */}
      <div className={styles.particles}>
        {Array.from({ length: 20 }).map((_, i) => (
          <div key={i} className={styles.particle} style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 5}s`,
            animationDuration: `${5 + Math.random() * 5}s`,
          }} />
        ))}
      </div>

      {/* Header */}
      <header className={styles.header}>
        <div className={styles.logoContainer}>
          <h1 className={styles.logo}>SOLOBOOM</h1>
          <div className={styles.logoGlow} />
        </div>
        <nav className={styles.nav}>
          <a href="/search" className={styles.navLink}>Buscar Jogador</a>
          <a href="/leader" className={styles.navLink}>Leader</a>
          <a href="#about" className={styles.navLink}>Sobre</a>
          {user ? (
            <UserMenu />
          ) : (
            <a href="/login" className={styles.loginButton}>Login</a>
          )}
        </nav>
      </header>

      {/* Hero Section */}
      <main className={styles.hero}>
        <div className={`${styles.heroContent} ${isLoaded ? styles.fadeIn : ''}`}>
          <div className={styles.logoHero}>
            <Image
              src="/images/logo-soloboom.png"
              alt="Soloboom Logo"
              width={400}
              height={160}
              className={styles.logoImageHero}
              priority
            />
            <div className={styles.logoHeroGlow} />
          </div>
          <div className={styles.badge}>
            <span className={styles.badgeText}>TEMPO REAL</span>
            <div className={styles.badgePulse} />
          </div>
          
          <h1 className={styles.heroTitle}>
            <span className={styles.titleLine}>RANKING</span>
            <span className={styles.titleLine}>LEAGUE OF LEGENDS</span>
            <span className={styles.titleAccent}>EM TEMPO REAL</span>
          </h1>

          <p className={styles.heroDescription}>
            Acompanhe os melhores jogadores, estatísticas detalhadas e rankings 
            atualizados instantaneamente. Domine o Rift com dados precisos.
          </p>

          <div className={styles.ctaContainer}>
            <a href="/search" className={styles.ctaPrimary}>
              <span>Buscar Jogador</span>
              <div className={styles.buttonGlow} />
            </a>
            <a href="/leader" className={styles.ctaSecondary}>
              <span>Ver Leaderboard</span>
            </a>
          </div>

          {/* Stats Preview */}
          <div className={styles.statsPreview}>
            <div className={styles.statCard}>
              <div className={styles.statValue}>10K+</div>
              <div className={styles.statLabel}>Jogadores Ativos</div>
            </div>
            <div className={styles.statCard}>
              <div className={styles.statValue}>500K+</div>
              <div className={styles.statLabel}>Partidas Analisadas</div>
            </div>
            <div className={styles.statCard}>
              <div className={styles.statValue}>24/7</div>
              <div className={styles.statLabel}>Atualização</div>
            </div>
          </div>
        </div>

        {/* Elementos decorativos */}
        <div className={styles.decorativeElements}>
          <div className={styles.geometricShape1} />
          <div className={styles.geometricShape2} />
          <div className={styles.geometricShape3} />
        </div>
      </main>

      {/* Features Section */}
      <section className={styles.features}>
        <div className={styles.featureCard}>
          <div className={styles.featureIcon}>
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
            </svg>
          </div>
          <h3 className={styles.featureTitle}>Tempo Real</h3>
          <p className={styles.featureDescription}>
            Dados atualizados instantaneamente durante as partidas
          </p>
        </div>
        <div className={styles.featureCard}>
          <div className={styles.featureIcon}>
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="20" x2="18" y2="10" />
              <line x1="12" y1="20" x2="12" y2="4" />
              <line x1="6" y1="20" x2="6" y2="14" />
            </svg>
          </div>
          <h3 className={styles.featureTitle}>Leaderboard</h3>
          <p className={styles.featureDescription}>
            Ranking dos melhores jogadores atualizado em tempo real
          </p>
        </div>
        <div className={styles.featureCard}>
          <div className={styles.featureIcon}>
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
              <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
              <path d="M4 22h16" />
              <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" />
              <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" />
              <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" />
            </svg>
          </div>
          <h3 className={styles.featureTitle}>Ranking Global</h3>
          <p className={styles.featureDescription}>
            Compare-se com os melhores jogadores do mundo
          </p>
        </div>
      </section>
    </div>
  );
}
