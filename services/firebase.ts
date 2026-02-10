
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCSIr_l5i1tvNOhFL2XjCSuU1iglOcSGtc",
  authDomain: "my-project-b5b55.firebaseapp.com",
  projectId: "my-project-b5b55",
  storageBucket: "my-project-b5b55.firebasestorage.app",
  messagingSenderId: "895798127955",
  appId: "1:895798127955:web:bcc665c1200a2564b8c5a6",
  measurementId: "G-K96LQEBHPK"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
