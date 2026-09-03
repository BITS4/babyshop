import { initializeApp, getApps, getApp } from "firebase/app"
import { getAuth } from "firebase/auth"
import { getFirestore } from "firebase/firestore"
import { getStorage } from "firebase/storage"

const firebaseConfig = {
  apiKey: "AIzaSyBQu8gOXraUfeUULWxURjStitp82poKIAA",
  authDomain: "shop-auth-2825f.firebaseapp.com",
  projectId: "shop-auth-2825f",
  storageBucket: "shop-auth-2825f.appspot.com",  
  messagingSenderId: "199284273979",
  appId: "1:199284273979:web:f834117c72e052eb01bd1e",
  measurementId: "G-HBMR6Y2E11",
}

const app = getApps().length ? getApp() : initializeApp(firebaseConfig)
export const auth = getAuth(app)
export const db = getFirestore(app)
export const storage = getStorage(app)
export default app
