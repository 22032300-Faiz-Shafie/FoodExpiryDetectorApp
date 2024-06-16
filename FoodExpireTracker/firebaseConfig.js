import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
    apiKey: "AIzaSyB-ZTcNYafw-ISQxlCKgPrgjSlHWvMBxVE",
    authDomain: "foodexpirytracker-e0cde.firebaseapp.com",
    projectId: "foodexpirytracker-e0cde",
    storageBucket: "foodexpirytracker-e0cde.appspot.com",
    messagingSenderId: "50978091911",
    appId: "1:50978091911:web:321e29f1d9c72bfadb1922",
    measurementId: "G-5L4EQD1TGM"
  };
  
  const app = initializeApp(firebaseConfig);
  const storage = getStorage(app);
  const db = getFirestore(app);
  
  export { storage, db };