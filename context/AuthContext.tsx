"use client"
import { createContext, useContext, useEffect, useState, ReactNode } from "react"
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  onIdTokenChanged,
  sendEmailVerification,
  GoogleAuthProvider,
  signInWithPopup,
  User,
} from "firebase/auth"
import { auth } from "@/app/firebase"

type AuthContextType = {
  user: User | null
  isVerified: boolean
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (email: string, password: string) => Promise<void>
  loginWithGoogle: () => Promise<void>
  logout: () => Promise<void>
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Helper: force-refresh current user from Firebase
  const refreshUser = async () => {
    try {
      const cu = auth.currentUser
      if (cu) {
        await cu.reload()
        // setUser from auth.currentUser so emailVerified is updated
        setUser(auth.currentUser)
      }
    } catch {
      // ignore reload errors
    }
  }

  // 1) Initialize auth and eagerly reload once so emailVerified is accurate
  useEffect(() => {
    const unsubAuth = onAuthStateChanged(auth, async (currentUser) => {
      try {
        if (currentUser) {
          await currentUser.reload()
        }
      } finally {
        setUser(auth.currentUser) // may be null
        setIsLoading(false)
      }
    })

    // 2) Also react to token refreshes (e.g., after verification)
    const unsubToken = onIdTokenChanged(auth, (u) => {
      setUser(u)
    })

    return () => {
      unsubAuth()
      unsubToken()
    }
  }, [])

  // 3) Refresh when the tab regains focus or becomes visible again
  useEffect(() => {
    if (!user) return

    const onFocus = () => { void refreshUser() }
    const onVisible = () => {
      if (document.visibilityState === "visible") { void refreshUser() }
    }

    window.addEventListener("focus", onFocus)
    document.addEventListener("visibilitychange", onVisible)

    // do an immediate refresh when this effect starts
    void refreshUser()

    return () => {
      window.removeEventListener("focus", onFocus)
      document.removeEventListener("visibilitychange", onVisible)
    }
  }, [user?.uid])

  const login = async (email: string, password: string) => {
    const result = await signInWithEmailAndPassword(auth, email, password)
    // After login, reload to ensure the latest emailVerified flag
    await result.user.reload()
    setUser(auth.currentUser)
    if (!auth.currentUser?.emailVerified) {
      throw new Error("Please verify your email. Check your inbox.")
    }
  }

  const register = async (email: string, password: string) => {
    if (!email.endsWith("@gmail.com")) {
      throw new Error("Only Gmail addresses are allowed.")
    }
    const result = await createUserWithEmailAndPassword(auth, email, password)
    await sendEmailVerification(result.user)
    // Keep them logged in but unverified until they confirm
    await result.user.reload()
    setUser(auth.currentUser)
  }

  const loginWithGoogle = async () => {
    const provider = new GoogleAuthProvider()
    const result = await signInWithPopup(auth, provider)
    await result.user.reload()
    setUser(auth.currentUser)
  }

  const logout = async () => {
    await signOut(auth)
    setUser(null)
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isVerified: !!user?.emailVerified,
        isLoading,
        login,
        register,
        loginWithGoogle,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error("useAuth must be used inside AuthProvider")
  return context
}
