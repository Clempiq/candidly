import { ApplicationCard } from './ApplicationCard'

export function ApplicationList({ applications, onUpdate, onRemove, onStatusChange }) {
  if (applications.length === 0) {
    return (
      <div className="text-center py-12 text-gray-400">
        <p>Aucune candidature pour le moment</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {applications.map((app) => (
        <ApplicationCard
          key={app.id}
          application={app}
          onUpdate={onUpdate}
          onRemove={onRemove}
          onStatusChange={onStatusChange}
        />
      ))}
    </div>
  )
}
