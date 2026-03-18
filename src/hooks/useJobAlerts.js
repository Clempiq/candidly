import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'

export function useJobAlerts() {
  const { user } = useAuth()
  const [alerts, setAlerts] = useState([])
  const [loading, setLoading] = useState(true)

  const fetch = useCallback(async () => {
    if (!user) return
    setLoading(true)
    const { data } = await supabase
      .from('job_alerts')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
    setAlerts(data ?? [])
    setLoading(false)
  }, [user])

  useEffect(() => { fetch() }, [fetch])

  async function create(values) {
    const { data, error } = await supabase
      .from('job_alerts')
      .insert({ ...values, user_id: user.id })
      .select()
      .single()
    if (error) throw error
    setAlerts((prev) => [data, ...prev])
    return data
  }

  async function update(id, values) {
    const { data, error } = await supabase
      .from('job_alerts')
      .update(values)
      .eq('id', id)
      .select()
      .single()
    if (error) throw error
    setAlerts((prev) => prev.map((a) => (a.id === id ? data : a)))
    return data
  }

  async function remove(id) {
    await supabase.from('job_alerts').delete().eq('id', id)
    setAlerts((prev) => prev.filter((a) => a.id !== id))
  }

  async function toggle(id, isActive) {
    return update(id, { is_active: isActive })
  }

  return { alerts, loading, refetch: fetch, create, update, remove, toggle }
}
