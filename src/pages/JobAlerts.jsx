import { useState } from 'react'
import { useJobAlerts } from '../hooks/useJobAlerts'
import { AlertForm } from '../components/alerts/AlertForm'
import { Bell, Plus, Trash2, ToggleLeft, ToggleRight } from 'lucide-react'

export default function JobAlerts() {
  const { alerts, loading, create, remove, toggle } = useJobAlerts()
  const [showForm, setShowForm] = useState(false)
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

  async function handleToggle(id, isActive) {
    try {
      await toggle(id, !isActive)
    } catch (err) {
      setError(err.message)
    }
  }

  async function handleRemove(id) {
    if (!confirm('Supprimer cette alerte ?')) return
    try {
      await remove(id)
    } catch (err) {
      setError(err.message)
    }
  }

  if (loading) {
    return <div className="text-center py-12">Chargement...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Bell className="w-8 h-8 text-primary-600" />
          <h1 className="text-3xl font-bold">Alertes emploi</h1>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="btn btn-primary gap-2"
        >
          <Plus className="w-4 h-4" /> Nouvelle alerte
        </button>
      </div>

      {error && <div className="p-4 bg-red-100 text-red-700 rounded-lg">{error}</div>}

      {showForm && (
        <AlertForm
          onSubmit={handleCreate}
          onCancel={() => setShowForm(false)}
        />
      )}

      <div className="space-y-3">
        {alerts.length === 0 ? (
          <p className="text-center text-gray-400 py-8">Aucune alerte pour le moment</p>
        ) : (
          alerts.map((alert) => (
            <div key={alert.id} className="card p-4 flex items-center justify-between">
              <div>
                <h3 className="font-semibold">{alert.name}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {alert.keywords}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleToggle(alert.id, alert.is_active)}
                  className="p-2"
                >
                  {alert.is_active ? (
                    <ToggleRight className="w-6 h-6 text-green-500" />
                  ) : (
                    <ToggleLeft className="w-6 h-6 text-gray-400" />
                  )}
                </button>
                <button
                  onClick={() => handleRemove(alert.id)}
                  className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-950 rounded"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
