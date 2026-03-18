import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'

/**
 * Get applications that might need a follow-up reminder
 * based on applied_date and user's reminder_days setting
 */
export function useReminders() {
  const { user } = useAuth()
  const [applications, setApplications] = useState([])
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return

    async function loadReminders() {
      setLoading(true)

      // Get user reminder preference
      const { data: profile } = await supabase
        .from('profiles')
        .select('reminder_days')
        .eq('id', user.id)
        .single()

      // Get applications that don't have recent updates and haven't been rejected/offered/withdrawn
      const { data } = await supabase
        .from('applications')
        .select('*')
        .eq('user_id', user.id)
        .in('status', ['applied', 'interview_scheduled'])
        .order('applied_date', { ascending: true })

      setProfile(profile)
      setApplications(data ?? [])
      setLoading(false)
    }

    loadReminders()
  }, [user])

  return { applications, profile, loading }
}
