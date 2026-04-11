// src/components/PrivateRoute.tsx
// Guards routes by auth state AND optional role requirement.
// Usage:
//   <Route element={<PrivateRoute />}>           → any logged-in user
//   <Route element={<PrivateRoute role="admin" />}> → admin only, redirects others to /

import { Navigate, Outlet } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

interface PrivateRouteProps {
  role?: 'admin' | 'moderator' | 'user'
}

export default function PrivateRoute({ role }: PrivateRouteProps) {
  const [status, setStatus] = useState<'loading' | 'allowed' | 'denied' | 'unauthed'>('loading')

  useEffect(() => {
    let cancelled = false

    async function check() {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        if (!cancelled) setStatus('unauthed')
        return
      }

      if (!role) {
        if (!cancelled) setStatus('allowed')
        return
      }

      // Fetch role from DB — never trust JWT claims alone for admin checks
      const { data, error } = await supabase
        .from('users')
        .select('role')
        .eq('id', session.user.id)
        .single()

      if (error || !data) {
        if (!cancelled) setStatus('denied')
        return
      }

      if (!cancelled) setStatus(data.role === role ? 'allowed' : 'denied')
    }

    check()
    return () => { cancelled = true }
  }, [role])

  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-400 animate-pulse">Checking access...</p>
      </div>
    )
  }

  if (status === 'unauthed') return <Navigate to="/login" replace />
  if (status === 'denied') return <Navigate to="/" replace />

  return <Outlet />
}
