import { getStatus } from '../../hooks/useApplications'
import { STATUSES } from '../../hooks/useApplications'

export function KanbanBoard({ applications, onStatusChange }) {
  async function handleDrop(e, newStatus) {
    e.preventDefault()
    const appId = e.dataTransfer.getData('appId')
    if (appId) {
      await onStatusChange(appId, newStatus)
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 2xl:grid-cols-4 gap-4 overflow-x-auto pb-4">
      {STATUSES.map((statusDef) => {
        const items = applications.filter((a) => a.status === statusDef.value)
        return (
          <div
            key={statusDef.value}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => handleDrop(e, statusDef.value)}
            className="bg-gray-100 dark:bg-gray-800 rounded-lg p-4 min-h-96 kanban-drag-over"
          >
            <h3 className="font-semibold mb-4 text-sm">{statusDef.label}</h3>
            <div className="space-y-2">
              {items.map((app) => (
                <div
                  key={app.id}
                  draggable
                  onDragStart={(e) => e.dataTransfer.setData('appId', app.id)}
                  className="bg-white dark:bg-gray-900 p-3 rounded-lg shadow text-sm cursor-move kanban-dragging"
                >
                  <p className="font-medium">{app.company_name}</p>
                  <p className="text-gray-600 dark:text-gray-400 text-xs">{app.position}</p>
                </div>
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}
