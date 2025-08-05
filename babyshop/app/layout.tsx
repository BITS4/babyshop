import "./globals.css"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import { CartProvider } from "../context/CartContext"
import { AuthProvider } from "../context/AuthContext"
import { ProductProvider } from "../context/ProductContext"
const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "BabyShop — Adorable Clothes for Little Ones",
  description: "Shop the cutest baby clothing with fast delivery and soft comfort.",
  keywords: ["baby clothes", "babyshop", "kids fashion", "adorable clothes"],
  authors: [{ name: "Your Name or Brand" }],
  openGraph: {
    title: "BabyShop",
    description: "Adorable and cozy baby clothes — shop now!",
    url: "https://babyshop-ouij.vercel.app",
    siteName: "BabyShop",
    type: "website",
  },
}


export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <CartProvider>
            <ProductProvider>{children}</ProductProvider>
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  )
}


