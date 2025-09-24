/**
 * Simple admin authentication hook
 * Uses localStorage to persist auth state and environment variable for password
 */
'use client'

import { useState, useEffect } from 'react'

export function useAdminAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check if already authenticated
    const authStatus = localStorage.getItem('admin_authenticated')
    if (authStatus === 'true') {
      setIsAuthenticated(true)
    }
    setLoading(false)
  }, [])

  const login = (password: string): boolean => {
    // Simple password check - in production you'd want something more secure
    // Note: We use NEXT_PUBLIC_ prefix to make it available in the browser
    const adminPassword = process.env.NEXT_PUBLIC_ADMIN_PASSWORD || 'admin123'
    
    if (password === adminPassword) {
      setIsAuthenticated(true)
      localStorage.setItem('admin_authenticated', 'true')
      return true
    }
    return false
  }

  const logout = () => {
    setIsAuthenticated(false)
    localStorage.removeItem('admin_authenticated')
  }

  return {
    isAuthenticated,
    loading,
    login,
    logout
  }
}
