import { initializeApp, getApps, getApp } from "firebase/app"
import { getAuth } from "firebase/auth"
import { getFirestore } from "firebase/firestore"

const firebaseConfig = {
  apiKey: "AIzaSyBQu8gOXraUfeUULWxURjStitp82poKIAA",
  authDomain: "shop-auth-2825f.firebaseapp.com",
  projectId: "shop-auth-2825f",
  storageBucket: "shop-auth-2825f.firebasestorage.app",
  messagingSenderId: "199284273979",
  appId: "1:199284273979:web:f834117c72e052eb01bd1e",
  measurementId: "G-HBMR6Y2E11"
}

const app = !getApps().length ? initializeApp(firebaseConfig) : getApps()[0]

export const auth = getAuth(app)
export const db = getFirestore(app)