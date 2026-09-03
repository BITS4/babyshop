import { auth, db } from "@/app/firebase"
import { updateProfile } from "firebase/auth"
import { doc, getDoc, setDoc } from "firebase/firestore"
import { normalizeStoredProfile, type Profile } from "./profile"

export async function loadProfile(uid: string, fallbackPhotoURL = ""): Promise<Profile> {
  const snapshot = await getDoc(doc(db, "users", uid))
  return normalizeStoredProfile(snapshot.exists() ? snapshot.data() : {}, fallbackPhotoURL)
}

export async function saveProfile(
  uid: string,
  email: string | null,
  profile: Partial<Profile>
): Promise<void> {
  await setDoc(
    doc(db, "users", uid),
    { ...profile, email, updatedAt: new Date().toISOString() },
    { merge: true }
  )
}

export async function updateCurrentUserAvatar(photoURL: string): Promise<void> {
  if (auth.currentUser) await updateProfile(auth.currentUser, { photoURL })
}
