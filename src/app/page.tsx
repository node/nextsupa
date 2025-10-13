'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { User } from '@supabase/supabase-js'

export default function Home() {
  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
    }
    fetchUser()
  }, [])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    setUser(null)
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-2">
      <main className="flex flex-col items-center justify-center w-full flex-1 px-20 text-center">
        <h1 className="text-6xl font-bold">
          Welcome to NextSupa
        </h1>

        <div className="mt-8">
          {user ? (
            <div>
              <p className="text-xl">You are signed in as {user.email}</p>
              <div className="mt-4">
                <Link href="/dashboard" className="px-4 py-2 bg-green-500 text-white rounded mr-4">
                    Go to Dashboard
                </Link>
                <button
                  onClick={handleSignOut}
                  className="px-4 py-2 bg-red-500 text-white rounded"
                >
                  Sign Out
                </button>
              </div>
            </div>
          ) : (
            <div>
              <p className="text-xl">You are not signed in.</p>
              <div className="mt-4">
                <Link href="/auth/signin" className="px-4 py-2 bg-blue-500 text-white rounded mr-4">
                    Sign In
                </Link>
                <Link href="/auth/signup" className="px-4 py-2 bg-green-500 text-white rounded">
                    Sign Up
                </Link>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}