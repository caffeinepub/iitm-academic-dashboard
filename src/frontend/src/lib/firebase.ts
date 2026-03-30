import { initializeApp } from "firebase/app";
import { GoogleAuthProvider, getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyACeYwNljzgrk8WAywxKSHoj_juuk2rPbg",
  authDomain: "insti-flow.firebaseapp.com",
  projectId: "insti-flow",
  storageBucket: "insti-flow.firebasestorage.app",
  messagingSenderId: "439140382247",
  appId: "1:439140382247:web:08bdb56afb68e0a9014002",
  measurementId: "G-5MWJ8TFFER",
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const db = getFirestore(app);
