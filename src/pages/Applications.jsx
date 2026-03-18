import { useState } from 'react'
import { useApplications } from '../hooks/useApplications'
import { ApplicationForm } from '../components/applications/ApplicationForm'
import { ApplicationList } from '../components/applications/ApplicationList'
import { KanbanBoard } from '../components/applications/KanbanBoard'
import { Briefcase, Plus, List, Layout } from 'lucide-react'

export default function Applications() {
  const { applications, loading, create, update, remove, updateStatus } = useApplications()
  const [showForm, setShowForm] = useState(false)
  const [viewMode, setViewMode] = useState('list') // 'list' or 'kanban'
  const [error, setError] = useState(null)

  async function handleCreate(values) {
    try {
      await create(values)
      setShowForm(false)
      setError(null)
    } catch (err) {
      setError(err.message)
    }
  }

  if (loading) {
    return <div className="text-center py-12">Chargement...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <Briefcase className="w-8 h-8 text-primary-600" />
          <h1 className="text-3xl font-bold">Candidatures</h1>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setViewMode('list')}
            className={`p-2 rounded ${viewMode === 'list' ? 'bg-primary-100 dark:bg-primary-900 text-primary-600' : 'text-gray-600'}`}
          >
            <List className="w-5 h-5" />
          </button>
          <button
            onClick={() => setViewMode('kanban')}
            className={`p-2 rounded ${viewMode === 'kanban' ? 'bg-primary-100 dark:bg-primary-900 text-primary-600' : 'text-gray-600'}`}
          >
            <Layout className="w-5 h-5" />
          </button>
          <button
            onClick={() => setShowForm(true)}
            className="btn btn-primary gap-2"
          >
            <Plus className="w-4 h-4" /> Ajouter
          </button>
        </div>
      </div>

      {error && <div className="p-4 bg-red-100 text-red-700 rounded-lg">{error}</div>}

      {showForm && (
        <ApplicationForm
          onSubmit={handleCreate}
          onCancel={() => setShowForm(false)}
        />
      )}

      {viewMode === 'list' ? (
        <ApplicationList applications={applications} onUpdate={update} onRemove={remove} onStatusChange={updateStatus} />
      ) : (
        <KanbanBoard applications={applications} onStatusChange={updateStatus} />
      )}
    </div>
  )
}
