import { useApplications } from '../hooks/useApplications'
import { StatsCards } from '../components/dashboard/StatsCards'
import { BarChart3, TrendingUp } from 'lucide-react'

export default function Dashboard() {
  const { applications, loading } = useApplications()

  if (loading) {
    return <div className="text-center py-12">Chargement du tableau de bord...</div>
  }

  const stats = {
    total: applications.length,
    interviews: applications.filter((a) => a.status.includes('interview')).length,
    offers: applications.filter((a) => a.status === 'offer').length,
    responseRate: applications.length > 0 ? Math.round((applications.filter((a) => a.status !== 'applied').length / applications.length) * 100) : 0,
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-3">
        <BarChart3 className="w-8 h-8 text-primary-600" />
        <h1 className="text-3xl font-bold">Tableau de bord</h1>
      </div>

      <StatsCards stats={stats} />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Recent applications */}
        <div className="card p-6">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-5 h-5 text-primary-600" />
            <h2 className="text-lg font-semibold">Dernières candidatures</h2>
          </div>
          {applications.slice(0, 5).map((app) => (
            <div key={app.id} className="py-3 border-b last:border-b-0 text-sm">
              <p className="font-medium">{app.company_name}</p>
              <p className="text-gray-600 dark:text-gray-400">{app.position}</p>
            </div>
          ))}
        </div>

        {/* By status */}
        <div className="card p-6">
          <h2 className="text-lg font-semibold mb-4">Répartition par statut</h2>
          <div className="space-y-3">
            {[
              { label: 'Postulé', value: applications.filter((a) => a.status === 'applied').length },
              { label: 'Entretien planifié', value: applications.filter((a) => a.status === 'interview_scheduled').length },
              { label: 'Offre reçue', value: applications.filter((a) => a.status === 'offer').length },
            ].map((item) => (
              <div key={item.label} className="flex justify-between items-center">
                <span className="text-gray-700 dark:text-gray-300">{item.label}</span>
                <span className="font-bold text-primary-600">{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
