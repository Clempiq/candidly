import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'

export const STATUSES = [
  { value: 'applied',             label: 'Postulé',             color: 'bg-blue-100 text-blue-700',   dot: 'bg-blue-500' },
  { value: 'interview_scheduled', label: 'Entretien planifié',  color: 'bg-amber-100 text-amber-700', dot: 'bg-amber-500' },
  { value: 'interview_done',      label: 'Entretien passé',     color: 'bg-orange-100 text-orange-700', dot: 'bg-orange-500' },
  { value: 'offer',               label: 'Offre reçue 🎉',      color: 'bg-green-100 text-green-700', dot: 'bg-green-500' },
  { value: 'rejected',            label: 'Refus',               color: 'bg-red-100 text-red-700',     dot: 'bg-red-500' },
  { value: 'ghosted',             label: 'Ghosté',              color: 'bg-gray-100 text-gray-600',   dot: 'bg-gray-400' },
  { value: 'withdrawn',           label: 'Retiré',              color: 'bg-slate-100 text-slate-600', dot: 'bg-slate-400' },
]

export function getStatus(value) {
  return STATUSES.find((s) => s.value === value) ?? STATUSES[0]
}

export function useApplications() {
  const { user } = useAuth()
  const [applications, setApplications] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetch = useCallback(async () => {
    if (!user) return
    setLoading(true)
    const { data, error } = await supabase
      .from('applications')
      .select('*')
      .eq('user_id', user.id)
      .order('applied_date', { ascending: false })
    if (error) setError(error.message)
    else setApplications(data ?? [])
    setLoading(false)
  }, [user])

  useEffect(() => { fetch() }, [fetch])

  async function create(values) {
    const { data, error } = await supabase
      .from('applications')
      .insert({ ...values, user_id: user.id })
      .select()
      .single()
    if (error) throw error
    setApplications((prev) => [data, ...prev])
    return data
  }

  async function update(id, values) {
    const { data, error } = await supabase
      .from('applications')
      .update({ ...values, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()
    if (error) throw error
    setApplications((prev) => prev.map((a) => (a.id === id ? data : a)))
    return data
  }

  async function remove(id) {
    const { error } = await supabase.from('applications').delete().eq('id', id)
    if (error) throw error
    setApplications((prev) => prev.filter((a) => a.id !== id))
  }

  async function updateStatus(id, status) {
    return update(id, { status, updated_at: new Date().toISOString() })
  }

  return { applications, loading, error, refetch: fetch, create, update, remove, updateStatus }
}
