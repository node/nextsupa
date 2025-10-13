'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { User } from '@supabase/supabase-js'

type Project = {
  id: string;
  name: string;
  description: string;
  visibility: string;
};

type Workspace = {
  id: string;
  name: string;
};

export default function WorkspacePage({ params }: { params: { wsId: string } }) {
  const { wsId } = params
  const [user, setUser] = useState<User | null>(null)
  const [workspace, setWorkspace] = useState<Workspace | null>(null)
  const [projects, setProjects] = useState<Project[]>([])
  const [newProjectName, setNewProjectName] = useState('')
  const [newProjectDescription, setNewProjectDescription] = useState('')
  const [newProjectVisibility, setNewProjectVisibility] = useState('private')

  useEffect(() => {
    const fetchUserAndWorkspace = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        setUser(user)
        const { data: wsData, error: wsError } = await supabase
          .from('workspaces')
          .select('id, name')
          .eq('id', wsId)
          .single()

        if (wsError) {
          console.error('Error fetching workspace:', wsError)
        } else {
          setWorkspace(wsData)
        }

        const { data: projData, error: projError } = await supabase
          .from('projects')
          .select('id, name, description, visibility')
          .eq('workspace_id', wsId)

        if (projError) {
          console.error('Error fetching projects:', projError)
        } else {
          setProjects(projData)
        }
      }
    }
    fetchUserAndWorkspace()
  }, [wsId])

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault()
    if (user && newProjectName.trim()) {
      const { data, error } = await supabase
        .from('projects')
        .insert({
          name: newProjectName,
          description: newProjectDescription,
          visibility: newProjectVisibility,
          workspace_id: wsId,
          author_id: user.id
        })
        .select()

      if (error) {
        alert(error.message)
      } else if (data) {
        setProjects([...projects, data[0]])
        setNewProjectName('')
        setNewProjectDescription('')
        setNewProjectVisibility('private')
      }
    }
  }

  if (!workspace) {
    return <div>Loading...</div>
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4">{workspace.name}</h1>
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-4">Create New Project</h2>
        <form onSubmit={handleCreateProject}>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Name</label>
            <input
              type="text"
              placeholder="Project Name"
              value={newProjectName}
              onChange={(e) => setNewProjectName(e.target.value)}
              className="w-full p-2 border rounded"
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Description</label>
            <textarea
              placeholder="Project Description"
              value={newProjectDescription}
              onChange={(e) => setNewProjectDescription(e.target.value)}
              className="w-full p-2 border rounded"
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Visibility</label>
            <select
              value={newProjectVisibility}
              onChange={(e) => setNewProjectVisibility(e.target.value)}
              className="w-full p-2 border rounded"
            >
              <option value="private">Private</option>
              <option value="workspace">Workspace</option>
              <option value="public">Public</option>
            </select>
          </div>
          <button type="submit" className="p-2 bg-blue-500 text-white rounded">
            Create Project
          </button>
        </form>
      </div>
      <div>
        <h2 className="text-2xl font-bold mb-4">Projects</h2>
        {projects.length > 0 ? (
          <ul>
            {projects.map((proj) => (
              <li key={proj.id} className="p-4 border rounded-lg mb-2">
                <h3 className="text-xl font-bold">{proj.name}</h3>
                <p>{proj.description}</p>
                <p className="text-sm text-gray-500">Visibility: {proj.visibility}</p>
              </li>
            ))}
          </ul>
        ) : (
          <p>This workspace doesn&apos;t have any projects yet.</p>
        )}
      </div>
    </div>
  )
}