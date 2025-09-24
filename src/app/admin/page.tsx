/**
 * Admin Panel - Wedding management dashboard
 * Protected by simple password authentication
 */
'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import { supabase } from '@/lib/supabase'
import { useAdminAuth } from '@/hooks/useAdminAuth'
import { Invitado, Producto, Pago } from '@/types'
import Button from '@/components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import Modal from '@/components/ui/Modal'
import AddInvitadoModal from '@/components/admin/AddInvitadoModal'
import EditInvitadoModal from '@/components/admin/EditInvitadoModal'
import QuickConfirmationModal from '@/components/admin/QuickConfirmationModal'
import AddProductoModal from '@/components/admin/AddProductoModal'
import EditProductoModal from '@/components/admin/EditProductoModal'

// Login Component
function AdminLogin({ onLogin }: { onLogin: (password: string) => boolean }) {
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const success = onLogin(password)
    if (!success) {
      setError('Contraseña incorrecta')
      setPassword('')
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 to-pink-50 flex items-center justify-center">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-center">Admin - Panel de Boda</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Contraseña de administrador
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                placeholder="Ingresa la contraseña"
                required
              />
            </div>
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            )}
            <Button type="submit" loading={loading} className="w-full">
              Iniciar Sesión
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

// Main Admin Dashboard
function AdminDashboard({ onLogout }: { onLogout: () => void }) {
  const [invitados, setInvitados] = useState<Invitado[]>([])
  const [productos, setProductos] = useState<Producto[]>([])
  const [pagos, setPagos] = useState<(Pago & { producto?: Producto })[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'invitados' | 'productos' | 'pagos'>('invitados')
  const [showAddInvitado, setShowAddInvitado] = useState(false)
  const [showEditInvitado, setShowEditInvitado] = useState(false)
  const [editingInvitado, setEditingInvitado] = useState<Invitado | null>(null)
  const [showQuickConfirmation, setShowQuickConfirmation] = useState(false)
  const [confirmationData, setConfirmationData] = useState<{
    invitado: Invitado | null
    person: 'persona1' | 'persona2'
  }>({ invitado: null, person: 'persona1' })
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'confirmados' | 'pendientes' | 'no-asisten'>('all')
  const [showAddProducto, setShowAddProducto] = useState(false)
  const [showEditProducto, setShowEditProducto] = useState(false)
  const [editingProducto, setEditingProducto] = useState<Producto | null>(null)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const adminPassword = process.env.NEXT_PUBLIC_ADMIN_PASSWORD || 'admin123'
      
      // Load invitados via API
      const invitadosResponse = await fetch('/api/admin/invitados', {
        headers: {
          'x-admin-password': adminPassword
        }
      })
      
      if (invitadosResponse.ok) {
        const invitadosData = await invitadosResponse.json()
        setInvitados(invitadosData.data || [])
      }

      // Load productos via API
      const productosResponse = await fetch('/api/admin/productos', {
        headers: {
          'x-admin-password': adminPassword
        }
      })
      
      if (productosResponse.ok) {
        const productosData = await productosResponse.json()
        setProductos(productosData.data || [])
      }

      // For now, load pagos directly (we'll create API route later if needed)
      const pagosRes = await supabase.from('pagos').select(`
        *,
        producto:productos(*)
      `).order('created_at', { ascending: false })

      if (!pagosRes.error) setPagos(pagosRes.data || [])
      
    } catch (error) {
      console.error('Error loading admin data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleInvitadoAdded = () => {
    loadData() // Reload data after adding new invitado
  }

  const handleEditInvitado = (invitado: Invitado) => {
    setEditingInvitado(invitado)
    setShowEditInvitado(true)
  }

  const handleInvitadoUpdated = () => {
    loadData() // Reload data after updating invitado
    setEditingInvitado(null)
  }

  const handleProductoAdded = () => {
    loadData() // Reload data after adding new producto
  }

  const handleEditProducto = (producto: Producto) => {
    setEditingProducto(producto)
    setShowEditProducto(true)
  }

  const handleProductoUpdated = () => {
    loadData() // Reload data after updating producto
    setEditingProducto(null)
  }

  const handleDeleteProducto = async (producto: Producto) => {
    if (!confirm(`¿Estás seguro de eliminar "${producto.titulo}"?`)) return

    try {
      const adminPassword = process.env.NEXT_PUBLIC_ADMIN_PASSWORD || 'admin123'
      const response = await fetch(`/api/admin/productos/${producto.id}`, {
        method: 'DELETE',
        headers: {
          'x-admin-password': adminPassword
        }
      })

      if (response.ok) {
        loadData() // Reload data after deleting producto
      } else {
        alert('Error al eliminar el producto')
      }
    } catch (error) {
      console.error('Error deleting producto:', error)
      alert('Error al eliminar el producto')
    }
  }

  // Filter invitados based on search term and status
  const filteredInvitados = invitados.filter(invitado => {
    // Search filter
    const searchLower = searchTerm.toLowerCase()
    const matchesSearch = !searchTerm || (
      invitado.nombre_1.toLowerCase().includes(searchLower) ||
      (invitado.nombre_2 && invitado.nombre_2.toLowerCase().includes(searchLower)) ||
      invitado.slug.toLowerCase().includes(searchLower)
    )

    // Status filter
    let matchesStatus = true
    if (statusFilter !== 'all') {
      if (statusFilter === 'confirmados') {
        matchesStatus = invitado.asistencia_1 === 'si' || invitado.asistencia_2 === 'si'
      } else if (statusFilter === 'pendientes') {
        matchesStatus = invitado.asistencia_1 === 'pendiente' || invitado.asistencia_2 === 'pendiente'
      } else if (statusFilter === 'no-asisten') {
        matchesStatus = invitado.asistencia_1 === 'no' || invitado.asistencia_2 === 'no'
      }
    }

    return matchesSearch && matchesStatus
  })

  // Quick confirmation modal
  const openQuickConfirmation = (invitado: Invitado, person: 'persona1' | 'persona2') => {
    setConfirmationData({ invitado, person })
    setShowQuickConfirmation(true)
  }

  const handleQuickConfirmation = async (status: 'pendiente' | 'si' | 'no') => {
    if (!confirmationData.invitado) return

    try {
      const adminPassword = process.env.NEXT_PUBLIC_ADMIN_PASSWORD || 'admin123'
      const field = confirmationData.person === 'persona1' ? 'asistencia_1' : 'asistencia_2'
      
      const response = await fetch(`/api/admin/invitados/${confirmationData.invitado.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-password': adminPassword
        },
        body: JSON.stringify({ [field]: status })
      })

      if (response.ok) {
        // Update local state
        setInvitados(prev => prev.map(inv => 
          inv.id === confirmationData.invitado!.id 
            ? { ...inv, [field]: status }
            : inv
        ))
      }
    } catch (error) {
      console.error('Error updating confirmation:', error)
    }
  }

  const getPersonStats = () => {
    let totalPersonas = 0
    let confirmados = 0
    let pendientes = 0
    let noAsisten = 0

    invitados.forEach(inv => {
      // Persona 1
      totalPersonas += 1
      if (inv.asistencia_1 === 'si') confirmados += 1
      else if (inv.asistencia_1 === 'no') noAsisten += 1
      else pendientes += 1

      // Persona 2 (si existe)
      if (inv.nombre_2) {
        totalPersonas += 1
        if (inv.asistencia_2 === 'si') confirmados += 1
        else if (inv.asistencia_2 === 'no') noAsisten += 1
        else pendientes += 1
      }
    })
    
    return { totalPersonas, confirmados, pendientes, noAsisten }
  }

  const getTotalGifts = () => {
    return pagos.reduce((total, pago) => total + pago.monto, 0)
  }

  const stats = getPersonStats()
  const totalGifts = getTotalGifts()

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-rose-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando panel administrativo...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900">Panel Administrativo - Boda</h1>
            <Button variant="outline" onClick={onLogout}>
              Cerrar Sesión
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Stats Overview - Mejoradas */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <Card 
            className={`cursor-pointer transition-all hover:shadow-md ${statusFilter === 'all' ? 'ring-2 ring-blue-500 bg-blue-50' : ''}`}
            onClick={() => setStatusFilter('all')}
          >
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  👥
                </div>
                <div>
                  <div className="text-2xl font-bold text-blue-600">{stats.totalPersonas}</div>
                  <p className="text-xs text-gray-600">Total Personas</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card 
            className={`cursor-pointer transition-all hover:shadow-md ${statusFilter === 'confirmados' ? 'ring-2 ring-green-500 bg-green-50' : ''}`}
            onClick={() => setStatusFilter('confirmados')}
          >
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  ✅
                </div>
                <div>
                  <div className="text-2xl font-bold text-green-600">{stats.confirmados}</div>
                  <p className="text-xs text-gray-600">Confirmados</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card 
            className={`cursor-pointer transition-all hover:shadow-md ${statusFilter === 'pendientes' ? 'ring-2 ring-yellow-500 bg-yellow-50' : ''}`}
            onClick={() => setStatusFilter('pendientes')}
          >
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                  🟡
                </div>
                <div>
                  <div className="text-2xl font-bold text-yellow-600">{stats.pendientes}</div>
                  <p className="text-xs text-gray-600">Pendientes</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card 
            className={`cursor-pointer transition-all hover:shadow-md ${statusFilter === 'no-asisten' ? 'ring-2 ring-red-500 bg-red-50' : ''}`}
            onClick={() => setStatusFilter('no-asisten')}
          >
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                  ❌
                </div>
                <div>
                  <div className="text-2xl font-bold text-red-600">{stats.noAsisten}</div>
                  <p className="text-xs text-gray-600">No Asisten</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs Navigation */}
        <div className="bg-white rounded-lg shadow-sm mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              {[
                { key: 'invitados', label: 'Invitados', count: invitados.length },
                { key: 'productos', label: 'Productos', count: productos.length },
                { key: 'pagos', label: 'Pagos', count: pagos.length }
              ].map(tab => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key as any)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.key
                      ? 'border-rose-500 text-rose-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {tab.label}
                  <span className="ml-2 bg-gray-100 text-gray-900 py-0.5 px-2 rounded-full text-xs">
                    {tab.count}
                  </span>
                </button>
              ))}
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {activeTab === 'invitados' && (
              <div>
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                  <div className="flex items-center space-x-4">
                    <h2 className="text-lg font-semibold">Lista de Invitados</h2>
                    
                    {/* Filter indicator */}
                    {statusFilter !== 'all' && (
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-500">Filtro:</span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          statusFilter === 'confirmados' ? 'bg-green-100 text-green-700' :
                          statusFilter === 'pendientes' ? 'bg-yellow-100 text-yellow-700' :
                          statusFilter === 'no-asisten' ? 'bg-red-100 text-red-700' : ''
                        }`}>
                          {statusFilter === 'confirmados' ? '✅ Confirmados' :
                           statusFilter === 'pendientes' ? '🟡 Pendientes' :
                           statusFilter === 'no-asisten' ? '❌ No Asisten' : ''}
                        </span>
                        <button
                          onClick={() => setStatusFilter('all')}
                          className="text-xs text-gray-400 hover:text-gray-600"
                          title="Limpiar filtro"
                        >
                          ✕
                        </button>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="Buscar invitados..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full sm:w-64 px-3 py-2 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                      />
                      <svg className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                    </div>
                    <Button onClick={() => setShowAddInvitado(true)}>
                      Agregar Invitado
                    </Button>
                  </div>
                </div>
                
                {(searchTerm || statusFilter !== 'all') && (
                  <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-sm text-blue-700">
                      Mostrando {filteredInvitados.length} de {invitados.length} invitados
                      {searchTerm && <span className="font-medium"> que coinciden con "{searchTerm}"</span>}
                      {statusFilter !== 'all' && !searchTerm && (
                        <span className="font-medium"> en el filtro "{
                          statusFilter === 'confirmados' ? 'Confirmados' :
                          statusFilter === 'pendientes' ? 'Pendientes' :
                          statusFilter === 'no-asisten' ? 'No Asisten' : ''
                        }"</span>
                      )}
                    </p>
                  </div>
                )}
                
                {/* Desktop Table */}
                <div className="hidden lg:block overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Invitado(s)
                        </th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Confirmación
                        </th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Restricciones
                        </th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Observaciones
                        </th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Acciones
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredInvitados.map((invitado) => (
                        <tr key={invitado.id}>
                          <td className="px-4 py-3">
                            <div className="space-y-1">
                              <div className="text-sm font-medium text-gray-900">
                                {invitado.nombre_1}
                                {invitado.nombre_2 && (
                                  <span className="text-rose-600"> & {invitado.nombre_2}</span>
                                )}
                              </div>
                              <code className="text-xs bg-gray-100 px-1.5 py-0.5 rounded text-gray-500">
                                /rsvp/{invitado.slug}
                              </code>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <div className="space-y-2">
                              <div className="flex items-center justify-between p-2 bg-gray-50 rounded-md hover:bg-gray-100 transition-colors">
                                <div className="flex items-center space-x-2">
                                  <div className="w-5 h-5 rounded-full bg-white flex items-center justify-center text-xs font-medium text-gray-600">
                                    1
                                  </div>
                                  <span className="font-medium text-sm text-gray-900 truncate max-w-[120px]">{invitado.nombre_1}</span>
                                </div>
                                <button
                                  onClick={() => openQuickConfirmation(invitado, 'persona1')}
                                  title="Click para cambiar estado de confirmación"
                                  className={`px-2 py-1 rounded text-xs font-medium transition-all hover:scale-105 cursor-pointer ${
                                    invitado.asistencia_1 === 'si' ? 'bg-green-100 text-green-800 hover:bg-green-200' :
                                    invitado.asistencia_1 === 'no' ? 'bg-red-100 text-red-800 hover:bg-red-200' :
                                    'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
                                  }`}
                                >
                                  <span className="flex items-center space-x-1">
                                    <span className="text-xs">
                                      {invitado.asistencia_1 === 'si' ? '✅' : 
                                       invitado.asistencia_1 === 'no' ? '❌' : '🟡'}
                                    </span>
                                    <span>
                                      {invitado.asistencia_1 === 'si' ? 'Sí' : 
                                       invitado.asistencia_1 === 'no' ? 'No' : 'Pendiente'}
                                    </span>
                                  </span>
                                </button>
                              </div>
                              {invitado.nombre_2 && (
                                <div className="flex items-center justify-between p-2 bg-gray-50 rounded-md hover:bg-gray-100 transition-colors">
                                  <div className="flex items-center space-x-2">
                                    <div className="w-5 h-5 rounded-full bg-white flex items-center justify-center text-xs font-medium text-gray-600">
                                      2
                                    </div>
                                    <span className="font-medium text-sm text-gray-900 truncate max-w-[120px]">{invitado.nombre_2}</span>
                                  </div>
                                  <button
                                    onClick={() => openQuickConfirmation(invitado, 'persona2')}
                                    title="Click para cambiar estado de confirmación"
                                    className={`px-2 py-1 rounded text-xs font-medium transition-all hover:scale-105 cursor-pointer ${
                                      invitado.asistencia_2 === 'si' ? 'bg-green-100 text-green-800 hover:bg-green-200' :
                                      invitado.asistencia_2 === 'no' ? 'bg-red-100 text-red-800 hover:bg-red-200' :
                                      'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
                                    }`}
                                  >
                                    <span className="flex items-center space-x-1">
                                      <span className="text-xs">
                                        {invitado.asistencia_2 === 'si' ? '✅' : 
                                         invitado.asistencia_2 === 'no' ? '❌' : '🟡'}
                                      </span>
                                      <span>
                                        {invitado.asistencia_2 === 'si' ? 'Sí' : 
                                         invitado.asistencia_2 === 'no' ? 'No' : 'Pendiente'}
                                      </span>
                                    </span>
                                  </button>
                                </div>
                              )}
                            </div>
                          </td>
                          <td className="px-4 py-3 text-xs text-gray-500">
                            <div className="max-w-xs">
                              {invitado.restriccion_1 && (
                                <div className="mb-1 text-xs">{invitado.nombre_1}: {invitado.restriccion_1}</div>
                              )}
                              {invitado.restriccion_2 && (
                                <div className="text-xs">{invitado.nombre_2}: {invitado.restriccion_2}</div>
                              )}
                              {!invitado.restriccion_1 && !invitado.restriccion_2 && (
                                <span className="text-gray-400 text-xs">Sin restricciones</span>
                              )}
                            </div>
                          </td>
                          <td className="px-4 py-3 text-xs text-gray-500">
                            <div className="max-w-xs">
                              {invitado.mensaje ? (
                                <div className="bg-yellow-50 border border-yellow-200 rounded p-2 text-xs">
                                  <div className="flex items-start space-x-1">
                                    <span className="text-yellow-600 flex-shrink-0 mt-0.5">📝</span>
                                    <span className="text-yellow-800">{invitado.mensaje}</span>
                                  </div>
                                </div>
                              ) : (
                                <span className="text-gray-400 text-xs">Sin observaciones</span>
                              )}
                            </div>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEditInvitado(invitado)}
                              className="text-xs"
                            >
                              Editar
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Mobile Cards */}
                <div className="block lg:hidden space-y-4">
                  {filteredInvitados.map((invitado) => (
                    <Card key={invitado.id} className="border border-gray-200">
                      <CardContent className="p-4">
                        <div className="space-y-4">
                          {/* Names */}
                          <div>
                            <h3 className="font-medium text-gray-900">
                              {invitado.nombre_1}
                              {invitado.nombre_2 && (
                                <span className="text-rose-600"> & {invitado.nombre_2}</span>
                              )}
                            </h3>
                            <p className="text-xs text-gray-500 mt-1">
                              /rsvp/{invitado.slug}
                            </p>
                          </div>

                          {/* Confirmation Status */}
                          <div>
                            <p className="text-sm font-medium text-gray-700 mb-2">Estado de confirmación:</p>
                            <div className="space-y-2">
                              <button
                                onClick={() => openQuickConfirmation(invitado, 'persona1')}
                                className={`w-full flex items-center justify-between px-3 py-2 text-sm rounded-lg transition-colors ${
                                  invitado.asistencia_1 === 'si' ? 'bg-green-100 text-green-800' :
                                  invitado.asistencia_1 === 'no' ? 'bg-red-100 text-red-800' :
                                  'bg-yellow-100 text-yellow-800'
                                }`}
                              >
                                <span>{invitado.nombre_1}</span>
                                <span>
                                  {invitado.asistencia_1 === 'si' ? '✅ Confirmado' : 
                                   invitado.asistencia_1 === 'no' ? '❌ No asiste' : '🟡 Pendiente'}
                                </span>
                              </button>
                              {invitado.nombre_2 && (
                                <button
                                  onClick={() => openQuickConfirmation(invitado, 'persona2')}
                                  className={`w-full flex items-center justify-between px-3 py-2 text-sm rounded-lg transition-colors ${
                                    invitado.asistencia_2 === 'si' ? 'bg-green-100 text-green-800' :
                                    invitado.asistencia_2 === 'no' ? 'bg-red-100 text-red-800' :
                                    'bg-yellow-100 text-yellow-800'
                                  }`}
                                >
                                  <span>{invitado.nombre_2}</span>
                                  <span>
                                    {invitado.asistencia_2 === 'si' ? '✅ Confirmado' : 
                                     invitado.asistencia_2 === 'no' ? '❌ No asiste' : '🟡 Pendiente'}
                                  </span>
                                </button>
                              )}
                            </div>
                          </div>

                          {/* Restrictions */}
                          {(invitado.restriccion_1 || invitado.restriccion_2) && (
                            <div>
                              <p className="text-sm font-medium text-gray-700 mb-1">Restricciones:</p>
                              <div className="text-sm text-gray-600">
                                {invitado.restriccion_1 && (
                                  <div>{invitado.nombre_1}: {invitado.restriccion_1}</div>
                                )}
                                {invitado.restriccion_2 && (
                                  <div>{invitado.nombre_2}: {invitado.restriccion_2}</div>
                                )}
                              </div>
                            </div>
                          )}

                          {invitado.mensaje && (
                            <div>
                              <p className="text-sm font-medium text-gray-700 mb-1">Observaciones:</p>
                              <div className="bg-yellow-50 border border-yellow-200 rounded p-2 text-xs">
                                <div className="flex items-start space-x-1">
                                  <span className="text-yellow-600 flex-shrink-0 mt-0.5">📝</span>
                                  <span className="text-yellow-800">{invitado.mensaje}</span>
                                </div>
                              </div>
                            </div>
                          )}

                          {/* Actions */}
                          <div className="pt-2 border-t border-gray-100">
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleEditInvitado(invitado)}
                              className="w-full"
                            >
                              Editar Invitado
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'productos' && (
              <div>
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">🎁 Catálogo de Regalos</h2>
                    <p className="text-gray-600">Gestiona los productos disponibles para que los invitados contribuyan</p>
                  </div>
                  <Button 
                    onClick={() => setShowAddProducto(true)}
                    className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 shadow-lg"
                  >
                    <span className="mr-2">✨</span>
                    Agregar Regalo
                  </Button>
                </div>
                
                {productos.length === 0 ? (
                  <div className="text-center py-16">
                    <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center">
                      <span className="text-4xl">🎁</span>
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">No hay regalos aún</h3>
                    <p className="text-gray-600 mb-6 max-w-md mx-auto">
                      Agrega el primer regalo para que los invitados puedan empezar a contribuir
                    </p>
                    <Button 
                      onClick={() => setShowAddProducto(true)}
                      className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                    >
                      <span className="mr-2">✨</span>
                      Crear Primer Regalo
                    </Button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {productos.map((producto) => (
                      <Card key={producto.id} className="overflow-hidden hover:shadow-lg transition-all group">
                        <div className="aspect-[4/3] relative overflow-hidden bg-gray-100">
                          <Image
                            src={producto.imagen_url}
                            alt={producto.titulo}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                        <CardContent className="p-6">
                          <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2">{producto.titulo}</h3>
                          <p className="text-gray-600 text-sm mb-4 line-clamp-3">{producto.descripcion}</p>
                          
                          <div className="flex space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              className="flex-1 hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700"
                              onClick={() => handleEditProducto(producto)}
                            >
                              <span className="mr-1">✏️</span>
                              Editar
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="hover:bg-red-50 hover:border-red-300 hover:text-red-700"
                              onClick={() => handleDeleteProducto(producto)}
                            >
                              <span className="mr-1">🗑️</span>
                              Eliminar
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'pagos' && (
              <div>
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">💝 Contribuciones de Regalos</h2>
                    <p className="text-gray-600">Gestiona las contribuciones que han hecho los invitados</p>
                  </div>
                  
                  {pagos.length > 0 && (
                    <div className="flex items-center space-x-4">
                      <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg px-4 py-2">
                        <div className="text-center">
                          <div className="text-lg font-bold text-green-600">
                            ${pagos.reduce((sum, pago) => sum + pago.monto, 0).toLocaleString('es-CO')}
                          </div>
                          <div className="text-xs text-green-700">Total Recaudado</div>
                        </div>
                      </div>
                      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg px-4 py-2">
                        <div className="text-center">
                          <div className="text-lg font-bold text-blue-600">{pagos.length}</div>
                          <div className="text-xs text-blue-700">Contribuciones</div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                
                {pagos.length === 0 ? (
                  <div className="text-center py-16">
                    <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center">
                      <span className="text-4xl">💝</span>
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">Aún no hay contribuciones</h3>
                    <p className="text-gray-600 max-w-md mx-auto">
                      Cuando los invitados empiecen a contribuir a los regalos, aparecerán aquí para que puedas gestionarlas.
                    </p>
                  </div>
                ) : (
                  <>
                    {/* Desktop Table */}
                    <div className="hidden lg:block overflow-hidden bg-white rounded-lg shadow-sm border border-gray-200">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                              Fecha
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                              Contribuyente
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                              Regalo
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                              Monto
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                              Estado
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                              Mensaje
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-100">
                          {pagos.map((pago) => (
                            <tr key={pago.id} className="hover:bg-gray-50 transition-colors">
                              <td className="px-4 py-3 text-sm text-gray-500">
                                {pago.created_at && new Date(pago.created_at).toLocaleDateString('es-CO', {
                                  day: '2-digit',
                                  month: '2-digit',
                                  year: 'numeric'
                                })}
                              </td>
                              <td className="px-4 py-3">
                                <div className="font-medium text-gray-900 text-sm">{pago.quien_regala}</div>
                              </td>
                              <td className="px-4 py-3">
                                <div className="flex items-center space-x-3">
                                  {pago.producto?.imagen_url && (
                                    <div className="w-8 h-8 relative rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                                      <Image
                                        src={pago.producto.imagen_url}
                                        alt={pago.producto.titulo}
                                        fill
                                        className="object-cover"
                                      />
                                    </div>
                                  )}
                                  <span className="text-sm text-gray-900 font-medium truncate max-w-[150px]">
                                    {pago.producto?.titulo || 'Producto eliminado'}
                                  </span>
                                </div>
                              </td>
                              <td className="px-4 py-3">
                                <span className="text-sm font-bold text-green-600">
                                  ${pago.monto.toLocaleString('es-CO')}
                                </span>
                              </td>
                              <td className="px-4 py-3">
                                <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full ${
                                  pago.estado === 'aprobado' ? 'bg-green-100 text-green-800' :
                                  pago.estado === 'rechazado' ? 'bg-red-100 text-red-800' :
                                  'bg-yellow-100 text-yellow-800'
                                }`}>
                                  <span className="mr-1">
                                    {pago.estado === 'aprobado' ? '✅' : 
                                     pago.estado === 'rechazado' ? '❌' : '🟡'}
                                  </span>
                                  {pago.estado === 'aprobado' ? 'Aprobado' :
                                   pago.estado === 'rechazado' ? 'Rechazado' : 'Pendiente'}
                                </span>
                              </td>
                              <td className="px-4 py-3 text-sm text-gray-600 max-w-[200px]">
                                {pago.mensaje ? (
                                  <div className="truncate" title={pago.mensaje}>
                                    "{pago.mensaje}"
                                  </div>
                                ) : (
                                  <span className="text-gray-400 italic">Sin mensaje</span>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {/* Mobile Cards */}
                    <div className="lg:hidden space-y-4">
                      {pagos.map((pago) => (
                        <Card key={pago.id} className="overflow-hidden hover:shadow-md transition-shadow">
                          <CardContent className="p-4">
                            <div className="flex items-start justify-between mb-3">
                              <div className="flex items-center space-x-3">
                                {pago.producto?.imagen_url && (
                                  <div className="w-12 h-12 relative rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                                    <Image
                                      src={pago.producto.imagen_url}
                                      alt={pago.producto.titulo}
                                      fill
                                      className="object-cover"
                                    />
                                  </div>
                                )}
                                <div>
                                  <h4 className="font-semibold text-gray-900 text-sm">
                                    {pago.quien_regala}
                                  </h4>
                                  <p className="text-xs text-gray-500">
                                    {pago.created_at && new Date(pago.created_at).toLocaleDateString('es-CO')}
                                  </p>
                                </div>
                              </div>
                              <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full ${
                                pago.estado === 'aprobado' ? 'bg-green-100 text-green-800' :
                                pago.estado === 'rechazado' ? 'bg-red-100 text-red-800' :
                                'bg-yellow-100 text-yellow-800'
                              }`}>
                                <span className="mr-1">
                                  {pago.estado === 'aprobado' ? '✅' : 
                                   pago.estado === 'rechazado' ? '❌' : '🟡'}
                                </span>
                                {pago.estado === 'aprobado' ? 'Aprobado' :
                                 pago.estado === 'rechazado' ? 'Rechazado' : 'Pendiente'}
                              </span>
                            </div>
                            
                            <div className="space-y-2">
                              <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-600">Regalo:</span>
                                <span className="text-sm font-medium text-gray-900 truncate max-w-[200px]">
                                  {pago.producto?.titulo || 'Producto eliminado'}
                                </span>
                              </div>
                              <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-600">Monto:</span>
                                <span className="text-lg font-bold text-green-600">
                                  ${pago.monto.toLocaleString('es-CO')}
                                </span>
                              </div>
                              {pago.mensaje && (
                                <div className="pt-2 border-t border-gray-100">
                                  <p className="text-xs text-gray-600 italic">
                                    "{pago.mensaje}"
                                  </p>
                                </div>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Add Invitado Modal */}
      <AddInvitadoModal
        isOpen={showAddInvitado}
        onClose={() => setShowAddInvitado(false)}
        onSuccess={handleInvitadoAdded}
      />

      {/* Edit Invitado Modal */}
      <EditInvitadoModal
        isOpen={showEditInvitado}
        onClose={() => {
          setShowEditInvitado(false)
          setEditingInvitado(null)
        }}
        onSuccess={handleInvitadoUpdated}
        invitado={editingInvitado}
      />

      {/* Quick Confirmation Modal */}
      <QuickConfirmationModal
        isOpen={showQuickConfirmation}
        onClose={() => setShowQuickConfirmation(false)}
        invitado={confirmationData.invitado}
        person={confirmationData.person}
        onConfirm={handleQuickConfirmation}
      />

      {/* Add Producto Modal */}
      <AddProductoModal
        isOpen={showAddProducto}
        onClose={() => setShowAddProducto(false)}
        onSuccess={handleProductoAdded}
      />

      {/* Edit Producto Modal */}
      <EditProductoModal
        isOpen={showEditProducto}
        onClose={() => {
          setShowEditProducto(false)
          setEditingProducto(null)
        }}
        onSuccess={handleProductoUpdated}
        producto={editingProducto}
      />
    </div>
  )
}

// Main Admin Page Component
export default function AdminPage() {
  const { isAuthenticated, loading, login, logout } = useAdminAuth()

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-rose-50 to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-rose-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <AdminLogin onLogin={login} />
  }

  return <AdminDashboard onLogout={logout} />
}
