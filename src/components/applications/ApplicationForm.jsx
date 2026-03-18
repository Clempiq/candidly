import { useState } from 'react'
import { X } from 'lucide-react'
import { STATUSES } from '../../hooks/useApplications'

export function ApplicationForm({ onSubmit, onCancel }) {
  const [values, setValues] = useState({
    company_name: '',
    position: '',
    applied_date: new Date().toISOString().split('T')[0],
    url: '',
    status: 'applied',
    location: '',
    salary_range: '',
    contact_name: '',
    contact_email: '',
    interest_score: 3,
    notes: '',
  })

  function handleSubmit(e) {
    e.preventDefault()
    onSubmit(values)
  }

  return (
    <div className="modal-overlay">
      <div className="modal-panel">
        <div className="flex items-center justify-between p-6 border-b dark:border-gray-700">
          <h2 className="text-xl font-semibold">Nouvelle candidature</h2>
          <button onClick={onCancel} className="p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="label">Entreprise</label>
              <input
                type="text"
                required
                value={values.company_name}
                onChange={(e) => setValues({ ...values, company_name: e.target.value })}
                className="input"
                placeholder="Ex: Google"
              />
            </div>
            <div>
              <label className="label">Poste</label>
              <input
                type="text"
                required
                value={values.position}
                onChange={(e) => setValues({ ...values, position: e.target.value })}
                className="input"
                placeholder="Ex: Développeur React"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="label">Date de candidature</label>
              <input
                type="date"
                required
                value={values.applied_date}
                onChange={(e) => setValues({ ...values, applied_date: e.target.value })}
                className="input"
              />
            </div>
            <div>
              <label className="label">Statut</label>
              <select
                value={values.status}
                onChange={(e) => setValues({ ...values, status: e.target.value })}
                className="input"
              >
                {STATUSES.map((s) => (
                  <option key={s.value} value={s.value}>
                    {s.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="label">URL de l'offre</label>
            <input
              type="url"
              value={values.url}
              onChange={(e) => setValues({ ...values, url: e.target.value })}
              className="input"
              placeholder="https://..."
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="label">Localisation</label>
              <input
                type="text"
                value={values.location}
                onChange={(e) => setValues({ ...values, location: e.target.value })}
                className="input"
                placeholder="Paris, Toulouse"
              />
            </div>
            <div>
              <label className="label">Salaire</label>
              <input
                type="text"
                value={values.salary_range}
                onChange={(e) => setValues({ ...values, salary_range: e.target.value })}
                className="input"
                placeholder="30k - 40k"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="label">Contact</label>
              <input
                type="text"
                value={values.contact_name}
                onChange={(e) => setValues({ ...values, contact_name: e.target.value })}
                className="input"
                placeholder="Nom du recruteur"
              />
            </div>
            <div>
              <label className="label">Email du contact</label>
              <input
                type="email"
                value={values.contact_email}
                onChange={(e) => setValues({ ...values, contact_email: e.target.value })}
                className="input"
                placeholder="contact@company.com"
              />
            </div>
          </div>

          <div>
            <label className="label">Score d'intérêt (1-5)</label>
            <input
              type="range"
              min="1"
              max="5"
              value={values.interest_score}
              onChange={(e) => setValues({ ...values, interest_score: parseInt(e.target.value) })}
              className="w-full"
            />
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              {values.interest_score}/5
            </p>
          </div>

          <div>
            <label className="label">Notes</label>
            <textarea
              value={values.notes}
              onChange={(e) => setValues({ ...values, notes: e.target.value })}
              className="input h-20 resize-none"
              placeholder="Remarques, impressions..."
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button type="submit" className="btn btn-primary flex-1">
              Ajouter
            </button>
            <button type="button" onClick={onCancel} className="btn btn-secondary flex-1">
              Annuler
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
