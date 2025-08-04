import "./globals.css"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import { CartProvider } from "../context/CartContext"
import { AuthProvider } from "../context/AuthContext"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "BabyShop",
  description: "Adorable fashion for little ones",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <CartProvider>{children}</CartProvider>
        </AuthProvider>
      </body>
    </html>
  )
}


