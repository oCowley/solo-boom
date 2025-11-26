'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useAuth } from '@/contexts/AuthContext';
import UserMenu from '@/components/UserMenu';
import styles from './layout.module.css';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAdmin } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <ProtectedRoute requireAdmin={false}>
      <div className={styles.dashboard}>
        <aside className={`${styles.sidebar} ${sidebarOpen ? styles.sidebarOpen : styles.sidebarClosed}`}>
          <div className={styles.sidebarHeader}>
            <h2 className={styles.sidebarTitle}>Menu</h2>
            <button
              className={styles.sidebarToggle}
              onClick={() => setSidebarOpen(!sidebarOpen)}
              aria-label="Toggle sidebar"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                {sidebarOpen ? (
                  <path d="M18 6L6 18M6 6l12 12" />
                ) : (
                  <path d="M3 12h18M3 6h18M3 18h18" />
                )}
              </svg>
            </button>
          </div>

          <nav className={styles.sidebarNav}>
            <a href="/admin" className={styles.navItem}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                <polyline points="9 22 9 12 15 12 15 22" />
              </svg>
              {sidebarOpen && <span>Dashboard</span>}
            </a>

            <a href="/admin/leaderboard" className={styles.navItem}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
                <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
                <path d="M4 22h16" />
                <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" />
                <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" />
                <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" />
              </svg>
              {sidebarOpen && <span>Gerenciar Leaderboard</span>}
            </a>

            <a href="/leader" className={styles.navItem}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 3h18v18H3zM9 9h6v6H9z" />
              </svg>
              {sidebarOpen && <span>Ver Leaderboard</span>}
            </a>

            {isAdmin && (
              <a href="/admin/add-player" className={styles.navItem}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <path d="M12 8v8M8 12h8" />
                </svg>
                {sidebarOpen && <span>Adicionar Jogador</span>}
              </a>
            )}
          </nav>
        </aside>

        <main className={styles.mainContent}>
          <header className={styles.topHeader}>
            <Link href="/" className={styles.logoLink}>
              <Image
                src="/images/logo-soloboom.png"
                alt="Soloboom Logo"
                width={150}
                height={60}
                className={styles.logoImage}
                priority
              />
            </Link>
            <UserMenu />
          </header>
          <div className={styles.contentWrapper}>
            {children}
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}

