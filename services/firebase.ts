import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Your web app's Firebase configuration.
// In a production app, it is recommended to store these values in environment variables.
const firebaseConfig = {
  apiKey: "AIzaSyDDT2VYRGXN4qCuoeHBIEbMeRNyAuqDEK0",
  authDomain: "eduhub-lms-1.firebaseapp.com",
  projectId: "eduhub-lms-1",
  storageBucket: "eduhub-lms-1.firebasestorage.app",
  messagingSenderId: "1014411030519",
  appId: "1:1014411030519:web:0fba97bb4a599088e3c8f2",
  measurementId: "G-62B6YPD5Z7"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
const auth = getAuth(app);
const db = getFirestore(app);

export { app, auth, db };
