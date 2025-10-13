import Link from 'next/link'

export default function Navbar() {
  return (
    <nav className="bg-gray-800 text-white p-4">
      <div className="container mx-auto flex justify-between items-center">
        <Link href="/" className="text-xl font-bold">
          NextSupa
        </Link>
        <div>
          <Link href="/dashboard" className="mr-4">
            Dashboard
          </Link>
          <Link href="/explore" className="mr-4">
            Explore
          </Link>
          <Link href="/settings">
            Settings
          </Link>
        </div>
      </div>
    </nav>
  )
}