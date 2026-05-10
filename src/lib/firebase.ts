import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAwYbTVEOL5oXaoUJkO_3nwRijqvoxfWKA",
  authDomain: "traveloop-d0bc7.firebaseapp.com",
  projectId: "traveloop-d0bc7",
  storageBucket: "traveloop-d0bc7.firebasestorage.app",
  messagingSenderId: "11138623803",
  appId: "1:11138623803:web:22c631245f7c0a60286f1e",
  measurementId: "G-7SL17DD9WL"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
