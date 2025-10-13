'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

type Project = {
  id: string;
  name: string;
  description: string;
  author_id: string;
  profiles: {
    username: string;
  } | null;
};

export default function ExplorePage() {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchPublicProjects = async () => {
      setLoading(true)
      const { data, error } = await supabase
        .from('projects')
        .select(`
          id,
          name,
          description,
          author_id,
          profiles ( username )
        `)
        .eq('visibility', 'public')

      if (error) {
        console.error('Error fetching public projects:', error)
      } else {
        setProjects(data)
      }
      setLoading(false)
    }
    fetchPublicProjects()
  }, [])

  if (loading) {
    return <div>Loading...</div>
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-8">Explore Public Projects</h1>
      <div>
        {projects.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {projects.map((proj) => (
              <div key={proj.id} className="p-4 border rounded-lg shadow">
                <h3 className="text-xl font-bold">{proj.name}</h3>
                <p className="text-sm text-gray-500 mb-2">
                  by {proj.profiles?.username || 'Unknown'}
                </p>
                <p>{proj.description}</p>
              </div>
            ))}
          </div>
        ) : (
          <p>There are no public projects to display yet.</p>
        )}
      </div>
    </div>
  )
}