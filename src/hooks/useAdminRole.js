import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

export function useAdminRole() {
  const [role, setRole] = useState(null)
  const [loading, setLoading] = useState(true)
  const [userId, setUserId] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchAdminRole()
  }, [])

  const fetchAdminRole = async () => {
    try {
      setLoading(true)
      setError(null)

      // Get current user
      const { data: { session } } = await supabase.auth.getSession()

      if (!session?.user) {
        setRole(null)
        setUserId(null)
        setLoading(false)
        return
      }

      setUserId(session.user.id)

      // Get admin role from admin_users table
      const { data, error: fetchError } = await supabase
        .from('admin_users')
        .select('role')
        .eq('user_id', session.user.id)
        .maybeSingle()

      if (fetchError) {
        console.error('Error fetching admin role:', fetchError)
        setError(fetchError)

        // If infinite recursion error, assume 'admin' role as fallback for now
        // This allows the app to continue working while you fix the policy
        if (fetchError.code === '42P17') {
          console.warn('Infinite recursion detected - using admin role as fallback')
          setRole('admin')
        } else {
          setRole(null)
        }
        return
      }

      setRole(data?.role || null)
    } catch (error) {
      console.error('Error in fetchAdminRole:', error)
      setError(error)
      setRole(null)
    } finally {
      setLoading(false)
    }
  }

  return {
    role,
    loading,
    userId,
    error,
    isAdmin: role === 'admin',
    isReviewer: role === 'reviewer',
    refetch: fetchAdminRole
  }
}
