import { NextResponse } from 'next/server';
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth';
import { getFirestore, doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';

export async function POST() {
  try {
    const email = 'joao@gmail.com';
    const password = '123456';

    // Verificar se o usuário já existe
    let user;
    try {
      // Tentar criar o usuário
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      user = userCredential.user;
    } catch (error: any) {
      if (error.code === 'auth/email-already-in-use') {
        // Se já existe, buscar o usuário pelo email
        // Nota: Firebase Auth não permite buscar por email diretamente
        // Vamos retornar uma mensagem informando que precisa atualizar manualmente
        return NextResponse.json({
          message: 'Usuário já existe. Por favor, atualize manualmente o role no Firestore para "admin"',
          note: 'Acesse o Firebase Console e atualize o documento na coleção "users"'
        }, { status: 200 });
      }
      throw error;
    }

    // Criar documento no Firestore com role admin
    await setDoc(doc(db, 'users', user.uid), {
      email,
      role: 'admin',
      createdAt: new Date().toISOString(),
    });

    return NextResponse.json({
      success: true,
      message: 'Usuário admin criado com sucesso!',
      email,
      uid: user.uid
    });
  } catch (error: any) {
    console.error('Error creating admin user:', error);
    return NextResponse.json(
      { error: error.message || 'Erro ao criar usuário admin' },
      { status: 500 }
    );
  }
}

