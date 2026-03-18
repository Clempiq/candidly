import { useState } from 'react'
import { X } from 'lucide-react'
import { CONTRACT_TYPES } from '../../lib/francetravail'

export function AlertForm({ onSubmit, onCancel }) {
  const [values, setValues] = useState({
    name: '',
    keywords: '',
    location: '',
    contract_type: '',
    distance: 20,
  })

  function handleSubmit(e) {
    e.preventDefault()
    onSubmit(values)
  }

  return (
    <div className="modal-overlay">
      <div className="modal-panel">
        <div className="flex items-center justify-between p-6 border-b dark:border-gray-700">
          <h2 className="text-xl font-semibold">Nouvelle alerte emploi</h2>
          <button onClick={onCancel} className="p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="label">Nom de l'alerte</label>
            <input
              type="text"
              value={values.name}
              onChange={(e) => setValues({ ...values, name: e.target.value })}
              className="input"
              placeholder="Ex: Développeur React"
            />
          </div>

          <div>
            <label className="label">Mots-clés (séparés par des espaces)</label>
            <input
              type="text"
              value={values.keywords}
              onChange={(e) => setValues({ ...values, keywords: e.target.value })}
              className="input"
              placeholder="ex: React Vue Angular"
              required
            />
          </div>

          <div>
            <label className="label">Lieu</label>
            <input
              type="text"
              value={values.location}
              onChange={(e) => setValues({ ...values, location: e.target.value })}
              className="input"
              placeholder="Paris, Lyon, Toulouse"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Type de contrat</label>
              <select
                value={values.contract_type}
                onChange={(e) => setValues({ ...values, contract_type: e.target.value })}
                className="input"
              >
                {CONTRACT_TYPES.map((ct) => (
                  <option key={ct.value} value={ct.value}>
                    {ct.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">Distance (km)</label>
              <input
                type="number"
                min="1"
                max="100"
                value={values.distance}
                onChange={(e) => setValues({ ...values, distance: parseInt(e.target.value) })}
                className="input"
              />
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <button type="submit" className="btn btn-primary flex-1">
              Créer l'alerte
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
