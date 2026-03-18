import { useState } from 'react'
import { getStatus } from '../../hooks/useApplications'
import { Trash2, ExternalLink, ChevronDown } from 'lucide-react'

export function ApplicationCard({ application, onRemove, onStatusChange }) {
  const [expanded, setExpanded] = useState(false)
  const status = getStatus(application.status)

  async function handleRemove() {
    if (confirm('Supprimer cette candidature ?')) {
      await onRemove(application.id)
    }
  }

  return (
    <div className="card p-4">
      <div
        className="flex items-center justify-between cursor-pointer"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center gap-4 flex-1">
          <div className={`w-3 h-3 rounded-full ${status.dot}`} />
          <div className="flex-1">
            <h3 className="font-semibold">{application.company_name}</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">{application.position}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className={`badge ${status.color}`}>
            {status.label}
          </span>
          <ChevronDown
            className={`w-4 h-4 transition-transform ${expanded ? 'rotate-180' : ''}`}
          />
        </div>
      </div>

      {expanded && (
        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 space-y-3">
          {application.url && (
            <a
              href={application.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-primary-600 hover:underline text-sm"
              onClick={(e) => e.stopPropagation()}
            >
              Voir l'offre <ExternalLink className="w-3 h-3" />
            </a>
          )}

          <div className="grid grid-cols-2 gap-4 text-sm">
            {application.location && (
              <div>
                <p className="text-gray-500 dark:text-gray-400">Localisation</p>
                <p className="font-medium">{application.location}</p>
              </div>
            )}
            {application.salary_range && (
              <div>
                <p className="text-gray-500 dark:text-gray-400">Salaire</p>
                <p className="font-medium">{application.salary_range}</p>
              </div>
            )}
            {application.contact_name && (
              <div>
                <p className="text-gray-500 dark:text-gray-400">Contact</p>
                <p className="font-medium">{application.contact_name}</p>
              </div>
            )}
            {application.interest_score && (
              <div>
                <p className="text-gray-500 dark:text-gray-400">Intérêt</p>
                <p className="font-medium">{'⭐'.repeat(application.interest_score)}</p>
              </div>
            )}
          </div>

          {application.notes && (
            <div>
              <p className="text-gray-500 dark:text-gray-400 text-sm">Notes</p>
              <p className="text-sm mt-1">{application.notes}</p>
            </div>
          )}

          <div className="flex gap-2 pt-2">
            <button
              onClick={(e) => { e.stopPropagation(); handleRemove() }}
              className="btn btn-danger btn-sm gap-1"
            >
              <Trash2 className="w-3 h-3" /> Supprimer
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
