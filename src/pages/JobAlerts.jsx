import { useState } from 'react'
import { useJobAlerts } from '../hooks/useJobAlerts'
import { useApplications } from '../hooks/useApplications'
import { AlertForm } from '../components/alerts/AlertForm'
import { searchOffres, CONTRACT_TYPES } from '../lib/francetravail'
import {
  Bell, Plus, Trash2, ToggleLeft, ToggleRight,
  Search, ExternalLink, CheckCircle2, Briefcase, MapPin, Clock,
} from 'lucide-react'

function OfferCard({ offer, onAdd, added }) {
  const company  = offer.entreprise?.nom ?? 'Entreprise non précisée'
  const location = offer.lieuTravail?.libelle ?? ''
  const contract = offer.typeContrat ?? ''
  const salary   = offer.salaire?.libelle ?? ''
  const url      = offer.origineOffre?.urlOrigine ?? `https://candidat.francetravail.fr/offres/recherche/detail/${offer.id}`
  const dateStr  = offer.dateCreation
    ? new Date(offer.dateCreation).toLocaleDateString('fr-FR')
    : ''

  return (
    <div className="card p-4 flex flex-col gap-3">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-gray-900 dark:text-gray-100 truncate">{offer.intitule}</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-0.5">{company}</p>
        </div>
        {contract && (
          <span className="badge bg-primary-100 text-primary-700 dark:bg-primary-900 dark:text-primary-300 shrink-0">
            {contract}
          </span>
        )}
      </div>

      <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-500 dark:text-gray-400">
        {location && (
          <span className="flex items-center gap-1">
            <MapPin className="w-3 h-3" /> {location}
          </span>
        )}
        {salary && (
          <span className="flex items-center gap-1">
            <Briefcase className="w-3 h-3" /> {salary}
          </span>
        )}
        {dateStr && (
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3" /> Publié le {dateStr}
          </span>
        )}
      </div>

      <div className="flex items-center gap-2 pt-1">
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="btn btn-secondary btn-sm gap-1"
        >
          Voir l'offre <ExternalLink className="w-3 h-3" />
        </a>
        {added ? (
          <span className="flex items-center gap-1 text-green-600 text-sm font-medium">
            <CheckCircle2 className="w-4 h-4" /> Ajouté
          </span>
        ) : (
          <button onClick={() => onAdd(offer)} className="btn btn-primary btn-sm gap-1">
            <Plus className="w-3 h-3" /> Ajouter aux candidatures
          </button>
        )}
      </div>
    </div>
  )
}

export default function JobAlerts() {
  const [tab, setTab] = useState('search')

  const [keywords, setKeywords]         = useState('')
  const [contractType, setContractType] = useState('')
  const [results, setResults]           = useState([])
  const [searching, setSearching]       = useState(false)
  const [searchError, setSearchError]   = useState(null)
  const [hasSearched, setHasSearched]   = useState(false)
  const [addedIds, setAddedIds]         = useState(new Set())

  const { alerts, loading: alertsLoading, create, remove, toggle } = useJobAlerts()
  const { create: createApplication } = useApplications()
  const [showForm, setShowForm]   = useState(false)
  const [error, setError]         = useState(null)

  const [alertResults, setAlertResults]     = useState({})
  const [loadingAlerts, setLoadingAlerts]   = useState({})

  const ftConfigured = !!(import.meta.env.VITE_FT_CLIENT_ID && import.meta.env.VITE_FT_CLIENT_ID !== 'your-client-id')

  async function handleSearch(e) {
    e.preventDefault()
    if (!keywords.trim()) return
    setSearching(true)
    setSearchError(null)
    setHasSearched(true)
    try {
      const data = await searchOffres({ motsCles: keywords, typeContrat: contractType || undefined, range: '0-19' })
      setResults(data.resultats ?? [])
    } catch (err) {
      setSearchError(err.message)
    } finally {
      setSearching(false)
    }
  }

  async function handleAddToApplications(offer) {
    try {
      await createApplication({
        company_name: offer.entreprise?.nom ?? 'Entreprise non précisée',
        position: offer.intitule,
        applied_date: new Date().toISOString().split('T')[0],
        url: offer.origineOffre?.urlOrigine ?? `https://candidat.francetravail.fr/offres/recherche/detail/${offer.id}`,
        location: offer.lieuTravail?.libelle ?? '',
        status: 'applied',
        notes: `Référence France Travail : ${offer.id}`,
      })
      setAddedIds((prev) => new Set([...prev, offer.id]))
    } catch (err) {
      setError(err.message)
    }
  }

  async function handleCreate(values) {
    try { await create(values); setShowForm(false) }
    catch (err) { setError(err.message) }
  }

  async function handleTestAlert(alert) {
    if (loadingAlerts[alert.id]) return
    setLoadingAlerts((prev) => ({ ...prev, [alert.id]: true }))
    try {
      const data = await searchOffres({ motsCles: alert.keywords, typeContrat: alert.contract_type || undefined, range: '0-9' })
      setAlertResults((prev) => ({ ...prev, [alert.id]: data.resultats ?? [] }))
    } catch (err) {
      setError(err.message)
    } finally {
      setLoadingAlerts((prev) => ({ ...prev, [alert.id]: false }))
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <Bell className="w-8 h-8 text-primary-600" />
          <h1 className="text-3xl font-bold">Offres d'emploi</h1>
        </div>
        {tab === 'alerts' && (
          <button onClick={() => setShowForm(true)} className="btn btn-primary gap-2">
            <Plus className="w-4 h-4" /> Nouvelle alerte
          </button>
        )}
      </div>

      <div className="flex gap-1 p-1 bg-gray-100 dark:bg-gray-800 rounded-lg w-fit">
        {[{ id: 'search', label: 'Recherche' }, { id: 'alerts', label: 'Mes alertes' }].map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`px-5 py-2 rounded-md text-sm font-medium transition-colors ${
              tab === t.id
                ? 'bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 shadow-sm'
                : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {error && <div className="p-4 bg-red-100 text-red-700 rounded-lg text-sm">{error}</div>}

      {!ftConfigured && (
        <div className="p-4 bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 rounded-lg text-sm text-amber-800 dark:text-amber-200">
          ⚠️ Les identifiants France Travail ne sont pas configurés. Ajoutez{' '}
          <code className="font-mono">VITE_FT_CLIENT_ID</code> et{' '}
          <code className="font-mono">VITE_FT_CLIENT_SECRET</code> dans vos variables d'environnement.
        </div>
      )}

      {tab === 'search' && (
        <div className="space-y-4">
          <form onSubmit={handleSearch} className="card p-4 flex flex-wrap gap-3 items-end">
            <div className="flex-1 min-w-48">
              <label className="label">Mots-clés</label>
              <input type="text" value={keywords} onChange={(e) => setKeywords(e.target.value)}
                className="input" placeholder="ex: développeur React, barman, comptable..." required />
            </div>
            <div className="w-44">
              <label className="label">Type de contrat</label>
              <select value={contractType} onChange={(e) => setContractType(e.target.value)} className="input">
                {CONTRACT_TYPES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
              </select>
            </div>
            <button type="submit" disabled={searching || !ftConfigured} className="btn btn-primary gap-2 h-10">
              <Search className="w-4 h-4" />
              {searching ? 'Recherche...' : 'Rechercher'}
            </button>
          </form>

          {searchError && <div className="p-4 bg-red-100 text-red-700 rounded-lg text-sm">{searchError}</div>}

          {hasSearched && !searching && (
            <p className="text-sm text-gray-500">
              {results.length === 0 ? 'Aucune offre trouvée.' : `${results.length} offre${results.length > 1 ? 's' : ''} trouvée${results.length > 1 ? 's' : ''}`}
            </p>
          )}

          <div className="space-y-3">
            {results.map((offer) => (
              <OfferCard key={offer.id} offer={offer} onAdd={handleAddToApplications} added={addedIds.has(offer.id)} />
            ))}
          </div>
        </div>
      )}

      {tab === 'alerts' && (
        <div className="space-y-4">
          {showForm && <AlertForm onSubmit={handleCreate} onCancel={() => setShowForm(false)} />}

          {alertsLoading ? (
            <p className="text-center text-gray-400 py-8">Chargement...</p>
          ) : alerts.length === 0 ? (
            <div className="card p-10 text-center">
              <Bell className="w-10 h-10 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 font-medium">Aucune alerte configurée</p>
              <p className="text-sm text-gray-400 mt-1">Créez une alerte pour être notifié des nouvelles offres.</p>
              <button onClick={() => setShowForm(true)} className="btn btn-primary mt-4 gap-2">
                <Plus className="w-4 h-4" /> Créer ma première alerte
              </button>
            </div>
          ) : (
            alerts.map((alert) => (
              <div key={alert.id} className="card overflow-hidden">
                <div className="p-4 flex items-center justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold">{alert.name}</h3>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                        alert.is_active ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300' : 'bg-gray-100 text-gray-500'
                      }`}>
                        {alert.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 mt-0.5">
                      {alert.keywords}{alert.contract_type ? ` · ${alert.contract_type}` : ''}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button onClick={() => handleTestAlert(alert)} disabled={loadingAlerts[alert.id] || !ftConfigured}
                      className="btn btn-secondary btn-sm gap-1">
                      <Search className="w-3 h-3" />
                      {loadingAlerts[alert.id] ? 'Chargement...' : 'Voir les offres'}
                    </button>
                    <button onClick={() => toggle(alert.id, !alert.is_active)}
                      className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-800">
                      {alert.is_active ? <ToggleRight className="w-6 h-6 text-green-500" /> : <ToggleLeft className="w-6 h-6 text-gray-400" />}
                    </button>
                    <button onClick={() => { if (confirm('Supprimer cette alerte ?')) remove(alert.id) }}
                      className="p-1.5 rounded text-red-500 hover:bg-red-50 dark:hover:bg-red-950">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {alertResults[alert.id] && (
                  <div className="border-t border-gray-200 dark:border-gray-700 p-4 space-y-3 bg-gray-50 dark:bg-gray-800/50">
                    {alertResults[alert.id].length === 0 ? (
                      <p className="text-sm text-gray-400 text-center py-2">Aucune offre trouvée pour cette alerte.</p>
                    ) : (
                      alertResults[alert.id].map((offer) => (
                        <OfferCard key={offer.id} offer={offer} onAdd={handleAddToApplications} added={addedIds.has(offer.id)} />
                      ))
                    )}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  )
}
