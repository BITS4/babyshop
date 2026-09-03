import {
  applicationDefault,
  cert,
  getApps,
  initializeApp,
  type ServiceAccount,
} from "firebase-admin/app"
import { getAuth } from "firebase-admin/auth"
import { getFirestore } from "firebase-admin/firestore"

function serviceAccount(): ServiceAccount | undefined {
  const encoded = process.env.FIREBASE_SERVICE_ACCOUNT_JSON
  if (!encoded) return undefined

  const parsed = JSON.parse(encoded) as Partial<ServiceAccount>
  if (!parsed.projectId || !parsed.clientEmail || !parsed.privateKey) {
    throw new Error("FIREBASE_SERVICE_ACCOUNT_JSON is incomplete")
  }
  return parsed as ServiceAccount
}

function adminApp() {
  const existing = getApps()[0]
  if (existing) return existing
  const account = serviceAccount()
  return initializeApp({ credential: account ? cert(account) : applicationDefault() })
}

export function adminAuth() {
  return getAuth(adminApp())
}

export function adminDatabase() {
  return getFirestore(adminApp())
}
