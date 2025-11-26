'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/contexts/AuthContext';
import styles from './page.module.css';

export default function LoginPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'admin' | 'user'>('user');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { login, register } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (isLogin) {
        await login(email, password);
        router.push('/admin');
        router.refresh();
      } else {
        await register(email, password, role);
        // Sucesso - redirecionar após um momento
        setTimeout(() => {
          router.push('/');
        }, 1000);
      }
    } catch (err: any) {
      console.error('Auth error:', err);
      if (err.code === 'auth/user-not-found') {
        setError('Usuário não encontrado');
      } else if (err.code === 'auth/wrong-password') {
        setError('Senha incorreta');
      } else if (err.code === 'auth/email-already-in-use') {
        setError('Este email já está em uso');
      } else if (err.code === 'auth/weak-password') {
        setError('A senha deve ter pelo menos 6 caracteres');
      } else if (err.code === 'auth/invalid-email') {
        setError('Email inválido');
      } else {
        setError(err.message || 'Erro ao fazer login/cadastro');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <div className={styles.logoSection}>
          <Link href="/">
            <Image
              src="/images/logo-soloboom.png"
              alt="Soloboom Logo"
              width={300}
              height={120}
              className={styles.logo}
              priority
            />
          </Link>
        </div>

        <div className={styles.formSection}>
          <div className={styles.tabs}>
            <button
              className={`${styles.tab} ${isLogin ? styles.active : ''}`}
              onClick={() => {
                setIsLogin(true);
                setError(null);
              }}
            >
              Login
            </button>
            <button
              className={`${styles.tab} ${!isLogin ? styles.active : ''}`}
              onClick={() => {
                setIsLogin(false);
                setError(null);
              }}
            >
              Cadastro
            </button>
          </div>

          <form onSubmit={handleSubmit} className={styles.form}>
            <div className={styles.formGroup}>
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu@email.com"
                className={styles.input}
                required
                disabled={loading}
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="password">Senha</label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className={styles.input}
                required
                minLength={6}
                disabled={loading}
              />
            </div>

            {!isLogin && (
              <div className={styles.formGroup}>
                <label htmlFor="role">Tipo de Usuário</label>
                <select
                  id="role"
                  value={role}
                  onChange={(e) => setRole(e.target.value as 'admin' | 'user')}
                  className={styles.select}
                  disabled={loading}
                >
                  <option value="user">Usuário</option>
                  <option value="admin">Administrador</option>
                </select>
              </div>
            )}

            {error && (
              <div className={styles.error}>
                {error}
              </div>
            )}

            <button
              type="submit"
              className={styles.submitButton}
              disabled={loading}
            >
              {loading ? 'Carregando...' : isLogin ? 'Entrar' : 'Cadastrar'}
            </button>
          </form>

          <div className={styles.footer}>
            <Link href="/" className={styles.backLink}>
              ← Voltar ao início
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

