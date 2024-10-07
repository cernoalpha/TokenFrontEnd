import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getDatabase, ref, set, push, get, child, onValue } from "firebase/database";
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
    apiKey: "AIzaSyBv_8nSSyUd8rx6nZHSbXR0AIlmawVFJlY",
    authDomain: "healthscore-1c1c9.firebaseapp.com",
    databaseURL: "https://healthscore-1c1c9-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "healthscore-1c1c9",
    storageBucket: "healthscore-1c1c9.appspot.com",
    messagingSenderId: "711236896646",
    appId: "1:711236896646:web:eb727a4331316da18fce07"
  };
  
const app = initializeApp(firebaseConfig);

const auth = getAuth(app);
const database = getDatabase(app);
const storage = getStorage();

export { app ,auth, database, storage, ref, set, push, get, child, onValue };