import { initializeApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth';
import { getFirestore, doc, setDoc } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyAbh7c1xH-9PH7zj16esHbdb482LbvVIKM",
  authDomain: "soloboom-aefd1.firebaseapp.com",
  projectId: "soloboom-aefd1",
  storageBucket: "soloboom-aefd1.firebasestorage.app",
  messagingSenderId: "1057224318948",
  appId: "1:1057224318948:web:170b4ca06fc1219596b1f1"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

async function createAdminUser() {
  const email = 'joao@gmail.com';
  const password = '123456';

  try {
    console.log('Criando usuário admin...');
    
    // Criar usuário no Firebase Auth
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    console.log('Usuário criado no Auth:', user.uid);

    // Criar documento no Firestore com role admin
    await setDoc(doc(db, 'users', user.uid), {
      email,
      role: 'admin',
      createdAt: new Date().toISOString(),
    });

    console.log('✅ Usuário admin criado com sucesso!');
    console.log('Email:', email);
    console.log('Senha:', password);
    console.log('Role: admin');
    console.log('UID:', user.uid);

    process.exit(0);
  } catch (error: any) {
    if (error.code === 'auth/email-already-in-use') {
      console.log('⚠️  Usuário já existe. Atualizando role para admin...');
      
      // Se o usuário já existe, precisamos buscar o UID
      // Por enquanto, vamos apenas informar
      console.log('Por favor, atualize manualmente o role no Firestore para "admin"');
    } else {
      console.error('❌ Erro ao criar usuário:', error.message);
    }
    process.exit(1);
  }
}

createAdminUser();

