// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAZXh-lYFLxEb86GJD4f2GwPIw9mw5pV68",
  authDomain: "bella-instituto.firebaseapp.com",
  projectId: "bella-instituto",
  storageBucket: "bella-instituto.firebasestorage.app",
  messagingSenderId: "790657776783",
  appId: "1:790657776783:web:f23f84572d31f5d5af04fa",
  measurementId: "G-9Z09TW796D"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
export const db = getFirestore(app);
export const auth = getAuth(app);
