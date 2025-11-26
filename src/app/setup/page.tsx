'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import styles from './page.module.css';

export default function SetupPage() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const router = useRouter();

  const createAdmin = async () => {
    setLoading(true);
    setMessage(null);

    const email = 'joao@gmail.com';
    const password = '123456';

    try {
      // Criar usuário no Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Criar documento no Firestore com role admin
      await setDoc(doc(db, 'users', user.uid), {
        email,
        role: 'admin',
        createdAt: new Date().toISOString(),
      });

      setMessage({
        type: 'success',
        text: 'Usuário admin criado com sucesso! Email: joao@gmail.com, Senha: 123456'
      });

      setTimeout(() => {
        router.push('/login');
      }, 2000);
    } catch (error: any) {
      if (error.code === 'auth/email-already-in-use') {
        setMessage({
          type: 'error',
          text: 'Usuário já existe. Você pode fazer login com: joao@gmail.com / 123456'
        });
      } else {
        setMessage({
          type: 'error',
          text: error.message || 'Erro ao criar usuário admin'
        });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <h1 className={styles.title}>Setup Inicial</h1>
        <p className={styles.subtitle}>
          Esta página cria o usuário administrador inicial
        </p>

        <div className={styles.info}>
          <p><strong>Email:</strong> joao@gmail.com</p>
          <p><strong>Senha:</strong> 123456</p>
          <p><strong>Role:</strong> admin</p>
        </div>

        {message && (
          <div className={`${styles.message} ${styles[message.type]}`}>
            {message.text}
          </div>
        )}

        <button
          onClick={createAdmin}
          className={styles.button}
          disabled={loading}
        >
          {loading ? 'Criando usuário...' : 'Criar Usuário Admin'}
        </button>

        <a href="/login" className={styles.link}>
          Já tem conta? Fazer login
        </a>
      </div>
    </div>
  );
}

