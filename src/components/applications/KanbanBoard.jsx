import { useState } from 'react'
import { STATUSES } from '../../hooks/useApplications'

export function KanbanBoard({ applications, onStatusChange }) {
  const [draggingId, setDraggingId] = useState(null)
  const [dragOverStatus, setDragOverStatus] = useState(null)

  async function handleDrop(e, newStatus) {
    e.preventDefault()
    const appId = e.dataTransfer.getData('appId')
    setDragOverStatus(null)
    setDraggingId(null)
    if (appId) {
      await onStatusChange(appId, newStatus)
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 2xl:grid-cols-4 gap-4 pb-4">
      {STATUSES.map((statusDef) => {
        const items = applications.filter((a) => a.status === statusDef.value)
        const isOver = dragOverStatus === statusDef.value
        return (
          <div
            key={statusDef.value}
            onDragOver={(e) => { e.preventDefault(); setDragOverStatus(statusDef.value) }}
            onDragLeave={(e) => {
              if (!e.currentTarget.contains(e.relatedTarget)) {
                setDragOverStatus(null)
              }
            }}
            onDrop={(e) => handleDrop(e, statusDef.value)}
            className={`rounded-lg p-4 min-h-96 transition-colors ${
              isOver
                ? 'kanban-drag-over'
                : 'bg-gray-100 dark:bg-gray-800'
            }`}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-sm">{statusDef.label}</h3>
              <span className="text-xs text-gray-500 bg-white dark:bg-gray-700 rounded-full px-2 py-0.5">
                {items.length}
              </span>
            </div>
            <div className="space-y-2">
              {items.map((app) => (
                <div
                  key={app.id}
                  draggable
                  onDragStart={(e) => {
                    e.dataTransfer.setData('appId', app.id)
                    setDraggingId(app.id)
                  }}
                  onDragEnd={() => {
                    setDraggingId(null)
                    setDragOverStatus(null)
                  }}
                  className={`bg-white dark:bg-gray-900 p-3 rounded-lg shadow-sm text-sm cursor-move transition-all ${
                    draggingId === app.id ? 'opacity-40 scale-95' : 'hover:shadow-md'
                  }`}
                >
                  <p className="font-medium">{app.company_name}</p>
                  <p className="text-gray-500 dark:text-gray-400 text-xs mt-0.5">{app.position}</p>
                  {app.location && (
                    <p className="text-gray-400 text-xs mt-1">{app.location}</p>
                  )}
                </div>
              ))}
              {items.length === 0 && (
                <p className="text-center text-gray-400 text-xs py-6">Aucune</p>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
