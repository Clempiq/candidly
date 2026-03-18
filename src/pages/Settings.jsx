import { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useTheme } from '../contexts/ThemeContext'
import { supabase } from '../lib/supabase'
import { subscribeToPush, unsubscribeFromPush, isPushSubscribed } from '../lib/notifications'

export default function Settings() {
  const { user, signOut } = useAuth()
  const { isDark, toggleDark } = useTheme()
  const [reminderDays, setReminderDays] = useState(7)
  const [pushEnabled, setPushEnabled] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleTogglePush() {
    setLoading(true)
    try {
      if (pushEnabled) {
        await unsubscribeFromPush(user.id)
        setPushEnabled(false)
      } else {
        await subscribeToPush(user.id)
        setPushEnabled(true)
      }
    } catch (error) {
      console.error('Push toggle error:', error)
    }
    setLoading(false)
  }

  async function handleReminderDaysChange(e) {
    const days = parseInt(e.target.value)
    setReminderDays(days)
    await supabase
      .from('profiles')
      .update({ reminder_days: days })
      .eq('id', user.id)
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Paramètres</h1>

      {/* Theme */}
      <div className="card p-6">
        <h2 className="text-lg font-semibold mb-4">Apparence</h2>
        <button
          onClick={toggleDark}
          className="btn btn-secondary"
        >
          {isDark ? 'Mode clair' : 'Mode sombre'}
        </button>
      </div>

      {/* Reminders */}
      <div className="card p-6">
        <h2 className="text-lg font-semibold mb-4">Rappels de suivi</h2>
        <div className="space-y-3">
          <label className="label">
            Intervalle de rappel (jours)
          </label>
          <input
            type="number"
            min="1"
            max="30"
            value={reminderDays}
            onChange={handleReminderDaysChange}
            className="input"
          />
        </div>
      </div>

      {/* Push Notifications */}
      <div className="card p-6">
        <h2 className="text-lg font-semibold mb-4">Notifications push</h2>
        <button
          onClick={handleTogglePush}
          disabled={loading}
          className={pushEnabled ? 'btn btn-danger' : 'btn btn-primary'}
        >
          {loading ? 'Chargement...' : pushEnabled ? 'Désactiver' : 'Activer'}
        </button>
      </div>

      {/* Sign Out */}
      <div className="card p-6">
        <h2 className="text-lg font-semibold mb-4">Compte</h2>
        <button
          onClick={signOut}
          className="btn btn-ghost"
        >
          Se déconnecter
        </button>
      </div>
    </div>
  )
}
