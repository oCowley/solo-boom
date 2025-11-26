// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAbh7c1xH-9PH7zj16esHbdb482LbvVIKM",
  authDomain: "soloboom-aefd1.firebaseapp.com",
  projectId: "soloboom-aefd1",
  storageBucket: "soloboom-aefd1.firebasestorage.app",
  messagingSenderId: "1057224318948",
  appId: "1:1057224318948:web:170b4ca06fc1219596b1f1"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);

// Initialize Cloud Firestore and get a reference to the service
export const db = getFirestore(app);

export default app;

