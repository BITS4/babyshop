// src/components/Navbar.tsx
export default function Navbar() {
  return (
    <header className="w-full bg-white shadow-md py-4 px-6 flex justify-between items-center">
      <h1 className="text-2xl font-bold text-pink-500">BabyShop</h1>
      <nav className="space-x-4 text-gray-700">
        <a href="#" className="hover:text-pink-500">Home</a>
        <a href="#" className="hover:text-pink-500">Shop</a>
        <a href="#" className="hover:text-pink-500">Contact</a>
        <a href="#" className="hover:text-pink-500">Cart</a>
      </nav>
    </header>
  )
}
