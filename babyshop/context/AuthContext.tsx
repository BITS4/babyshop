"use client"
import { createContext, useContext, useEffect, useState, ReactNode } from "react"

type AuthContextType = {
  user: string | null
  registeredUser: { email: string; password: string } | null
  login: (email: string, password: string) => boolean
  logout: () => void
  register: (email: string, password: string) => void
  isLoading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<string | null>(null)
  const [registeredUser, setRegisteredUser] = useState<{ email: string; password: string } | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const savedUser = localStorage.getItem("user")
    if (savedUser) setUser(savedUser)

    const savedReg = localStorage.getItem("registeredUser")
    if (savedReg) setRegisteredUser(JSON.parse(savedReg))
    setIsLoading(false)
  }, [])

  useEffect(() => {
    localStorage.setItem("user", user ?? "")
  }, [user])

  useEffect(() => {
    if (registeredUser) {
      localStorage.setItem("registeredUser", JSON.stringify(registeredUser))
    }
  }, [registeredUser])

  const login = (email: string, password: string) => {
    if (registeredUser && email === registeredUser.email && password === registeredUser.password) {
      setUser(email)
      return true
    } else {
      return false
    }
  }

  const register = (email: string, password: string) => {
    setRegisteredUser({ email, password })
  }

  const logout = () => setUser(null)

  return (
    <AuthContext.Provider value={{ user, registeredUser, login, logout, register, isLoading }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error("useAuth must be used inside AuthProvider")
  return context
}
