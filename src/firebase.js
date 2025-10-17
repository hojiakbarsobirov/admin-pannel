import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIza...",
  authDomain: "ruspeak-5c210.firebaseapp.com",
  projectId: "ruspeak-5c210",
  storageBucket: "ruspeak-5c210.appspot.com",
  messagingSenderId: "1234567890",
  appId: "1:1234567890:web:abcdef12345"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);