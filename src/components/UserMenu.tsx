'use client';

import { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import styles from './UserMenu.module.css';

export default function UserMenu() {
  const { user, userData, logout, isAdmin } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleLogout = async () => {
    try {
      await logout();
      router.push('/');
      setIsOpen(false);
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  if (!user) {
    return null;
  }

  const displayName = userData?.email?.split('@')[0] || user.email?.split('@')[0] || 'Usuário';
  const userInitial = displayName.charAt(0).toUpperCase();

  return (
    <div className={styles.userMenu} ref={menuRef}>
      <button
        className={styles.userButton}
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Menu do usuário"
      >
        <div className={styles.userAvatar}>
          {userInitial}
        </div>
        <span className={styles.userName}>{displayName}</span>
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className={`${styles.chevron} ${isOpen ? styles.chevronOpen : ''}`}
        >
          <path d="M6 9l6 6 6-6" />
        </svg>
      </button>

      {isOpen && (
        <div className={styles.dropdown}>
          <div className={styles.userInfo}>
            <div className={styles.userInfoEmail}>{user.email}</div>
            {isAdmin && (
              <div className={styles.userInfoRole}>Administrador</div>
            )}
          </div>
          <div className={styles.divider} />
          <button
            className={styles.menuItem}
            onClick={() => {
              router.push('/admin');
              setIsOpen(false);
            }}
          >
            Painel Admin
          </button>
          <button
            className={styles.menuItem}
            onClick={handleLogout}
          >
            Sair
          </button>
        </div>
      )}
    </div>
  );
}

