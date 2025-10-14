'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { User } from '@supabase/supabase-js'

type Workspace = {
  id: string;
  name: string;
};

export default function Dashboard() {
  const [user, setUser] = useState<User | null>(null)
  const [workspaces, setWorkspaces] = useState<Workspace[]>([])
  const [newWorkspaceName, setNewWorkspaceName] = useState('')
  const router = useRouter()

  useEffect(() => {
    const fetchUserAndWorkspaces = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        setUser(user)
        const { data, error } = await supabase
          .from('workspaces')
          .select('id, name')
          .eq('owner_id', user.id)
        if (error) {
          console.error('Error fetching workspaces:', error)
        } else {
          setWorkspaces(data)
        }
      } else {
        router.push('/auth/signin')
      }
    }
    fetchUserAndWorkspaces()
  }, [router])

  const handleCreateWorkspace = async (e: React.FormEvent) => {
    e.preventDefault()
    if (user && newWorkspaceName.trim()) {
      const { data, error } = await supabase
        .from('workspaces')
        .insert({ name: newWorkspaceName, owner_id: user.id })
        .select()

      if (error) {
        alert(error.message)
      } else if (data) {
        setWorkspaces([...workspaces, data[0]])
        setNewWorkspaceName('')
      }
    }
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Your Workspaces</h1>
      <div className="mb-8">
        <form onSubmit={handleCreateWorkspace} className="flex items-center">
          <input
            type="text"
            placeholder="New Workspace Name"
            value={newWorkspaceName}
            onChange={(e) => setNewWorkspaceName(e.target.value)}
            className="p-2 border rounded-l-lg"
          />
          <button type="submit" className="p-2 bg-blue-500 text-white rounded-r-lg">
            Create
          </button>
        </form>
      </div>
      <div>
        {workspaces.length > 0 ? (
          <ul>
            {workspaces.map((ws) => (
              <li key={ws.id} className="p-4 border rounded-lg mb-2">
                <a href={`/dashboard/ws/${ws.id}`} className="text-blue-500 hover:underline">
                  {ws.name}
                </a>
              </li>
            ))}
          </ul>
        ) : (
          <p>You don&apos;t have any workspaces yet.</p>
        )}
      </div>
    </div>
  )
}