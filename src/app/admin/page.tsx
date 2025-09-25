/**
 * Admin Panel - Wedding management dashboard
 * Protected by simple password authentication
 */
'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import { supabase } from '@/lib/supabase'
import { useAdminAuth } from '@/hooks/useAdminAuth'
import { Invitado, Producto, Pago, ListaEspera } from '@/types'
import Button from '@/components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import AddInvitadoModal from '@/components/admin/AddInvitadoModal'
import EditInvitadoModal from '@/components/admin/EditInvitadoModal'
import QuickConfirmationModal from '@/components/admin/QuickConfirmationModal'
import AddProductoModal from '@/components/admin/AddProductoModal'
import EditProductoModal from '@/components/admin/EditProductoModal'
import AddListaEsperaForm from '@/components/admin/AddListaEsperaForm'
import { generateWhatsAppMessage, copyToClipboard, generateRSVPUrl } from '@/lib/whatsapp'

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
  const [listaEspera, setListaEspera] = useState<ListaEspera[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'invitados' | 'productos' | 'pagos' | 'lista-espera'>('invitados')
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
  const [whatsappFilter, setWhatsappFilter] = useState<'all' | 'enviadas' | 'pendientes'>('all')
  const [listaEsperaSearchTerm, setListaEsperaSearchTerm] = useState('')
  const [priorityFilter, setPriorityFilter] = useState<'all' | 'alta' | 'media' | 'baja'>('all')
  const [showAddProducto, setShowAddProducto] = useState(false)
  const [showEditProducto, setShowEditProducto] = useState(false)
  const [editingProducto, setEditingProducto] = useState<Producto | null>(null)
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)
  const [showWhatsAppModal, setShowWhatsAppModal] = useState(false)
  const [selectedInvitado, setSelectedInvitado] = useState<Invitado | null>(null)
  const [showAddListaEspera, setShowAddListaEspera] = useState(false)
  const [showConvertModal, setShowConvertModal] = useState(false)
  const [convertingItem, setConvertingItem] = useState<ListaEspera | null>(null)
  const [loadingActions, setLoadingActions] = useState<{[key: string]: boolean}>({})

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

      // Load lista de espera via API
      const listaEsperaResponse = await fetch('/api/admin/lista-espera', {
        headers: {
          'x-admin-password': adminPassword
        }
      })
      
      if (listaEsperaResponse.ok) {
        const listaEsperaData = await listaEsperaResponse.json()
        setListaEspera(listaEsperaData.data || [])
      }
      
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

  const handleListaEsperaAdded = () => {
    loadData() // Reload data after adding new lista espera item
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

    // WhatsApp filter
    let matchesWhatsApp = true
    if (whatsappFilter !== 'all') {
      if (whatsappFilter === 'enviadas') {
        matchesWhatsApp = invitado.invitacion_enviada === true
      } else if (whatsappFilter === 'pendientes') {
        matchesWhatsApp = invitado.invitacion_enviada !== true
      }
    }

    return matchesSearch && matchesStatus && matchesWhatsApp
  })

  // Filtered lista espera
  const filteredListaEspera = listaEspera.filter((item) => {
    // Search filter
    let matchesSearch = true
    if (listaEsperaSearchTerm) {
      const searchLower = listaEsperaSearchTerm.toLowerCase()
      matchesSearch = (
        item.nombre_1.toLowerCase().includes(searchLower) ||
        (item.nombre_2 && item.nombre_2.toLowerCase().includes(searchLower)) ||
        (item.notas && item.notas.toLowerCase().includes(searchLower)) ||
        item.de_quien.toLowerCase().includes(searchLower) ||
        item.prioridad.toLowerCase().includes(searchLower)
      )
    }

    // Priority filter
    let matchesPriority = true
    if (priorityFilter !== 'all') {
      matchesPriority = item.prioridad === priorityFilter
    }

    return matchesSearch && matchesPriority
  })

  // Quick confirmation modal
  const openQuickConfirmation = (invitado: Invitado, person: 'persona1' | 'persona2') => {
    setConfirmationData({ invitado, person })
    setShowQuickConfirmation(true)
  }

  // WhatsApp functions
  const handleOpenWhatsAppModal = (invitado: Invitado) => {
    setSelectedInvitado(invitado)
    setShowWhatsAppModal(true)
  }

  const handleCopyWhatsAppMessage = async (invitado: Invitado) => {
    try {
      const message = generateWhatsAppMessage({ slug: invitado.slug })
      await copyToClipboard(message)
      showToast('Mensaje de WhatsApp copiado al portapapeles', 'success')
    } catch (error) {
      console.error('Error copying WhatsApp message:', error)
      showToast('Error al copiar el mensaje', 'error')
    }
  }

  const handleCopyRSVPUrl = async (slug: string) => {
    try {
      const url = generateRSVPUrl(slug)
      await copyToClipboard(url)
      showToast('Link de confirmación copiado', 'success')
    } catch (error) {
      console.error('Error copying RSVP URL:', error)
      showToast('Error al copiar el link', 'error')
    }
  }

  const handleToggleInvitacionEnviada = async (invitado: Invitado) => {
    try {
      const newStatus = !invitado.invitacion_enviada
      
      const response = await fetch(`/api/admin/invitados/${invitado.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-password': process.env.NEXT_PUBLIC_ADMIN_PASSWORD || 'admin123'
        },
        body: JSON.stringify({
          invitacion_enviada: newStatus
        })
      })

      if (!response.ok) throw new Error('Failed to update invitation status')

      // Update local state
      setInvitados(prev => prev.map(inv => 
        inv.id === invitado.id 
          ? { ...inv, invitacion_enviada: newStatus }
          : inv
      ))

      showToast(
        newStatus ? 'Marcado como enviado' : 'Marcado como no enviado', 
        'success'
      )
    } catch (error) {
      console.error('Error updating invitation status:', error)
      showToast('Error al actualizar estado', 'error')
    }
  }

  // Toast helper
  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3000)
  }

  // Lista de Espera functions
  const handleOpenConvertModal = (item: ListaEspera) => {
    setConvertingItem(item)
    setShowConvertModal(true)
  }

  const handleConvertToInvitado = async (listaEsperaItem: ListaEspera) => {
    const actionKey = `convert-${listaEsperaItem.id}`
    setLoadingActions(prev => ({ ...prev, [actionKey]: true }))

    try {
      const adminPassword = process.env.NEXT_PUBLIC_ADMIN_PASSWORD || 'admin123'
      
      const response = await fetch(`/api/admin/lista-espera/${listaEsperaItem.id}`, {
        method: 'POST',
        headers: {
          'x-admin-password': adminPassword
        }
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Error converting to invitado')
      }

      // Refresh data
      loadData()
      setShowConvertModal(false)
      setConvertingItem(null)
      
      showToast(`${listaEsperaItem.nombre_1} convertido a invitado exitosamente`, 'success')
    } catch (error) {
      console.error('Error converting to invitado:', error)
      showToast('Error al convertir a invitado', 'error')
    } finally {
      setLoadingActions(prev => ({ ...prev, [actionKey]: false }))
    }
  }

  const handleDeleteFromListaEspera = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar este elemento de la lista de espera?')) {
      return
    }

    const actionKey = `delete-${id}`
    setLoadingActions(prev => ({ ...prev, [actionKey]: true }))

    try {
      const adminPassword = process.env.NEXT_PUBLIC_ADMIN_PASSWORD || 'admin123'
      
      const response = await fetch(`/api/admin/lista-espera/${id}`, {
        method: 'DELETE',
        headers: {
          'x-admin-password': adminPassword
        }
      })

      if (!response.ok) {
        throw new Error('Error deleting from lista espera')
      }
      
      // Refresh data
      loadData()
      
      showToast('Eliminado de lista de espera', 'success')
    } catch (error) {
      console.error('Error deleting from lista espera:', error)
      showToast('Error al eliminar', 'error')
    } finally {
      setLoadingActions(prev => ({ ...prev, [actionKey]: false }))
    }
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

  const stats = getPersonStats()
  // const totalGifts = getTotalGifts()

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

        {/* Tabs Navigation */}
        <div className="bg-white rounded-lg shadow-sm mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              {[
                { key: 'invitados', label: 'Invitados', count: invitados.length },
                { key: 'lista-espera', label: 'Lista de Espera', count: listaEspera.length },
                { key: 'productos', label: 'Productos', count: productos.length },
                { key: 'pagos', label: 'Pagos', count: pagos.length }
              ].map(tab => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key as 'invitados' | 'productos' | 'pagos' | 'lista-espera')}
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
                    
                    {/* Filter indicators */}
                    {(statusFilter !== 'all' || whatsappFilter !== 'all') && (
                      <div className="flex items-center flex-wrap gap-2">
                        <span className="text-sm text-gray-500">Filtros:</span>
                        
                        {statusFilter !== 'all' && (
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            statusFilter === 'confirmados' ? 'bg-green-100 text-green-700' :
                            statusFilter === 'pendientes' ? 'bg-yellow-100 text-yellow-700' :
                            statusFilter === 'no-asisten' ? 'bg-red-100 text-red-700' : ''
                          }`}>
                            {statusFilter === 'confirmados' ? 'Confirmados' :
                             statusFilter === 'pendientes' ? 'Pendientes' :
                             statusFilter === 'no-asisten' ? 'No Asisten' : ''}
                            <button
                              onClick={() => setStatusFilter('all')}
                              className="ml-1 text-current hover:text-red-600"
                            >
                              ✕
                            </button>
                          </span>
                        )}

                        {whatsappFilter !== 'all' && (
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            whatsappFilter === 'enviadas' ? 'bg-blue-100 text-blue-700' :
                            whatsappFilter === 'pendientes' ? 'bg-orange-100 text-orange-700' : ''
                          }`}>
                            WhatsApp: {whatsappFilter === 'enviadas' ? 'Enviadas' : 'Pendientes'}
                            <button
                              onClick={() => setWhatsappFilter('all')}
                              className="ml-1 text-current hover:text-red-600"
                            >
                              ✕
                            </button>
                          </span>
                        )}
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

                {/* Status Filter Cards */}
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
                    onClick={() => setStatusFilter(statusFilter === 'confirmados' ? 'all' : 'confirmados')}
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
                    onClick={() => setStatusFilter(statusFilter === 'pendientes' ? 'all' : 'pendientes')}
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
                    onClick={() => setStatusFilter(statusFilter === 'no-asisten' ? 'all' : 'no-asisten')}
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

                {/* WhatsApp Filter Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <Card 
                    className={`cursor-pointer transition-all hover:shadow-md ${whatsappFilter === 'pendientes' ? 'ring-2 ring-orange-500 bg-orange-50' : ''}`}
                    onClick={() => setWhatsappFilter(whatsappFilter === 'pendientes' ? 'all' : 'pendientes')}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center space-x-2">
                        <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                          ⏳
                        </div>
                        <div>
                          <div className="text-2xl font-bold text-orange-600">
                            {invitados.filter(inv => !inv.invitacion_enviada).length}
                          </div>
                          <p className="text-xs text-gray-600">WhatsApp Pendientes</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card 
                    className={`cursor-pointer transition-all hover:shadow-md ${whatsappFilter === 'enviadas' ? 'ring-2 ring-blue-500 bg-blue-50' : ''}`}
                    onClick={() => setWhatsappFilter(whatsappFilter === 'enviadas' ? 'all' : 'enviadas')}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center space-x-2">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                          ✓
                        </div>
                        <div>
                          <div className="text-2xl font-bold text-blue-600">
                            {invitados.filter(inv => inv.invitacion_enviada).length}
                          </div>
                          <p className="text-xs text-gray-600">WhatsApp Enviadas</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
                
                {(searchTerm || statusFilter !== 'all') && (
                  <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-sm text-blue-700">
                      Mostrando {filteredInvitados.length} de {invitados.length} invitados
                      {searchTerm && <span className="font-medium"> que coinciden con &quot;{searchTerm}&quot;</span>}
                      {statusFilter !== 'all' && !searchTerm && (
                        <span className="font-medium"> en el filtro &quot;{
                          statusFilter === 'confirmados' ? 'Confirmados' :
                          statusFilter === 'pendientes' ? 'Pendientes' :
                          statusFilter === 'no-asisten' ? 'No Asisten' : ''
                        }&quot;</span>
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
                          De Quién
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
                            <div className="space-y-2">
                              <div className="text-sm font-medium text-gray-900">
                                {invitado.nombre_1}
                                {invitado.nombre_2 && (
                                  <span className="text-rose-600"> & {invitado.nombre_2}</span>
                                )}
                              </div>
                              <div className="flex items-center justify-between max-w-[280px]">
                                <a 
                                  href={generateRSVPUrl(invitado.slug)}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-xs text-blue-600 hover:text-blue-800 underline truncate flex-1 min-w-0"
                                  title={generateRSVPUrl(invitado.slug)}
                                >
                                  {generateRSVPUrl(invitado.slug)}
                                </a>
                                <button
                                  onClick={() => handleCopyRSVPUrl(invitado.slug)}
                                  className="text-gray-500 hover:text-gray-700 transition-colors p-1 hover:bg-gray-100 rounded ml-2 flex-shrink-0"
                                  title="Copiar link de confirmación"
                                >
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                  </svg>
                                </button>
                              </div>
                            </div>
                          </td>
                          {/* De Quién */}
                          <td className="px-4 py-3">
                            {invitado.de_quien ? (
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                invitado.de_quien === 'jaime' 
                                  ? 'bg-blue-100 text-blue-800' 
                                  : 'bg-pink-100 text-pink-800'
                              }`}>
                                {invitado.de_quien === 'jaime' ? 'Jaime' : 'Alejandra'}
                              </span>
                            ) : (
                              <span className="text-gray-400 text-xs">Sin asignar</span>
                            )}
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
                            <div className="flex space-x-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleEditInvitado(invitado)}
                                className="text-xs"
                              >
                                Editar
                              </Button>
                              <button
                                onClick={() => handleOpenWhatsAppModal(invitado)}
                                className={`text-xs px-2 py-1 rounded transition-colors ${
                                  invitado.invitacion_enviada 
                                    ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                                    : 'bg-green-600 hover:bg-green-700 text-white'
                                }`}
                                title={
                                  invitado.invitacion_enviada 
                                    ? 'Invitación enviada - Click para reenviar' 
                                    : 'Enviar invitación por WhatsApp'
                                }
                              >
                                {invitado.invitacion_enviada ? 'Enviada' : 'WhatsApp'}
                              </button>
                            </div>
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
                          {/* Names and Link */}
                          <div>
                            <div className="flex items-start justify-between mb-2">
                              <h3 className="font-medium text-gray-900">
                                {invitado.nombre_1}
                                {invitado.nombre_2 && (
                                  <span className="text-rose-600"> & {invitado.nombre_2}</span>
                                )}
                              </h3>
                              {invitado.de_quien && (
                                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                  invitado.de_quien === 'jaime' 
                                    ? 'bg-blue-100 text-blue-800' 
                                    : 'bg-pink-100 text-pink-800'
                                }`}>
                                  {invitado.de_quien === 'jaime' ? 'Jaime' : 'Alejandra'}
                                </span>
                              )}
                            </div>
                            <div className="flex items-center justify-between bg-gray-50 rounded-lg p-2">
                              <a 
                                href={generateRSVPUrl(invitado.slug)}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs text-blue-600 hover:text-blue-800 underline truncate flex-1 min-w-0"
                                title={generateRSVPUrl(invitado.slug)}
                              >
                                {generateRSVPUrl(invitado.slug)}
                              </a>
                              <button
                                onClick={() => handleCopyRSVPUrl(invitado.slug)}
                                className="text-gray-500 hover:text-gray-700 transition-colors p-1 hover:bg-gray-200 rounded ml-2 flex-shrink-0"
                                title="Copiar link de confirmación"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                </svg>
                              </button>
                            </div>
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
                          <div className="pt-2 border-t border-gray-100 space-y-2">
                            <div className="flex space-x-2">
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => handleEditInvitado(invitado)}
                                className="flex-1"
                              >
                                Editar
                              </Button>
                              <button
                                onClick={() => handleOpenWhatsAppModal(invitado)}
                                className={`flex-1 text-xs px-3 py-2 rounded-lg transition-colors ${
                                  invitado.invitacion_enviada 
                                    ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                                    : 'bg-green-600 hover:bg-green-700 text-white'
                                }`}
                                title={
                                  invitado.invitacion_enviada 
                                    ? 'Invitación enviada - Click para reenviar' 
                                    : 'Enviar invitación por WhatsApp'
                                }
                              >
                                {invitado.invitacion_enviada ? 'Enviada' : 'WhatsApp'}
                              </button>
                            </div>
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
                                    &quot;{pago.mensaje}&quot;
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
                                    &quot;{pago.mensaje}&quot;
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

              {activeTab === 'lista-espera' && (
                <div>
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">⏳ Lista de Espera</h2>
                    <p className="text-gray-600">Gestiona invitados potenciales antes de convertirlos en invitados oficiales</p>
                  </div>
                  <Button 
                    onClick={() => setShowAddListaEspera(true)}
                    className="bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700"
                  >
                    Agregar a Lista de Espera
                  </Button>
                </div>

                {/* Search Bar */}
                <div className="mb-6">
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                    </div>
                    <input
                      type="text"
                      placeholder="Buscar por nombre, notas, prioridad..."
                      value={listaEsperaSearchTerm}
                      onChange={(e) => setListaEsperaSearchTerm(e.target.value)}
                      className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-orange-500 focus:border-orange-500"
                    />
                  </div>
                </div>

                {/* Priority Filters - Always visible */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
                  {[
                    { 
                      key: 'all', 
                      label: 'Todos', 
                      count: listaEspera.length,
                      color: 'bg-gray-100 text-gray-800',
                      activeColor: 'bg-gray-600 text-white'
                    },
                    { 
                      key: 'alta', 
                      label: 'Alta', 
                      count: listaEspera.filter(item => item.prioridad === 'alta').length,
                      color: 'bg-red-100 text-red-800',
                      activeColor: 'bg-red-600 text-white'
                    },
                    { 
                      key: 'media', 
                      label: 'Media', 
                      count: listaEspera.filter(item => item.prioridad === 'media').length,
                      color: 'bg-yellow-100 text-yellow-800',
                      activeColor: 'bg-yellow-600 text-white'
                    },
                    { 
                      key: 'baja', 
                      label: 'Baja', 
                      count: listaEspera.filter(item => item.prioridad === 'baja').length,
                      color: 'bg-green-100 text-green-800',
                      activeColor: 'bg-green-600 text-white'
                    }
                  ].map(filter => (
                    <button
                      key={filter.key}
                      onClick={() => {
                        if (priorityFilter === filter.key) {
                          setPriorityFilter('all')
                        } else {
                          setPriorityFilter(filter.key as 'all' | 'alta' | 'media' | 'baja')
                        }
                      }}
                      className={`p-3 rounded-lg border transition-all duration-200 ${
                        priorityFilter === filter.key
                          ? `${filter.activeColor} border-transparent shadow-sm`
                          : `${filter.color} border-gray-200 hover:border-gray-300`
                      }`}
                    >
                      <div className="text-center">
                        <div className="text-xl font-bold">{filter.count}</div>
                        <div className="text-xs font-medium">Prioridad {filter.label}</div>
                      </div>
                    </button>
                  ))}
                </div>

                {/* Summary Statistics */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <span className="text-lg">👥</span>
                        </div>
                        <div>
                          <div className="text-2xl font-bold text-blue-600">
                            {listaEspera.filter(item => item.de_quien === 'jaime').length} / {listaEspera.filter(item => item.de_quien === 'alejandra').length}
                          </div>
                          <p className="text-sm text-gray-600">Jaime / Alejandra</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                          <span className="text-lg">⏳</span>
                        </div>
                        <div>
                          <div className="text-2xl font-bold text-orange-600">{listaEspera.length}</div>
                          <p className="text-sm text-gray-600">Total en Lista de Espera</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Results info */}
                {(listaEsperaSearchTerm || priorityFilter !== 'all') && (
                  <div className="mb-4">
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-gray-600">
                        Mostrando {filteredListaEspera.length} de {listaEspera.length} elementos
                        {priorityFilter !== 'all' && (
                          <span className="ml-2">
                            • Prioridad: <span className="font-medium capitalize">{priorityFilter}</span>
                          </span>
                        )}
                      </p>
                      {(listaEsperaSearchTerm || priorityFilter !== 'all') && (
                        <button
                          onClick={() => {
                            setListaEsperaSearchTerm('')
                            setPriorityFilter('all')
                          }}
                          className="text-xs text-orange-600 hover:text-orange-700 font-medium"
                        >
                          Limpiar filtros
                        </button>
                      )}
                    </div>
                  </div>
                )}

                {filteredListaEspera.length === 0 ? (
                  <Card>
                    <CardContent className="p-12 text-center">
                      <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <span className="text-2xl">⏳</span>
                      </div>
                      <h3 className="text-lg font-medium text-gray-900 mb-2">
                        {listaEspera.length === 0 ? 'Sin elementos en lista de espera' : 'No se encontraron resultados'}
                      </h3>
                      <p className="text-gray-500 mb-6">
                        {listaEspera.length === 0 
                          ? 'Agrega invitados potenciales para gestionarlos antes de enviar invitaciones'
                          : 'Intenta con otros términos de búsqueda'
                        }
                      </p>
                      <Button 
                        onClick={() => setShowAddListaEspera(true)}
                        className="bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700"
                      >
                        Agregar Primer Elemento
                      </Button>
                    </CardContent>
                  </Card>
                ) : (
                  <>

                    {/* Desktop Table */}
                    <div className="hidden lg:block overflow-x-auto bg-white rounded-lg shadow-sm border border-gray-200">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Invitado(s)
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              De Quién
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Prioridad
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Notas
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Acciones
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {filteredListaEspera.map((item) => (
                            <tr key={item.id} className="hover:bg-gray-50">
                              <td className="px-6 py-4">
                                <div className="text-sm font-medium text-gray-900">
                                  {item.nombre_1}
                                  {item.nombre_2 && (
                                    <span className="text-rose-600"> & {item.nombre_2}</span>
                                  )}
                                </div>
                              </td>
                              <td className="px-6 py-4">
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                  item.de_quien === 'jaime' 
                                    ? 'bg-blue-100 text-blue-800' 
                                    : 'bg-pink-100 text-pink-800'
                                }`}>
                                  {item.de_quien === 'jaime' ? 'Jaime' : 'Alejandra'}
                                </span>
                              </td>
                              <td className="px-6 py-4">
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                  item.prioridad === 'alta' ? 'bg-red-100 text-red-800' :
                                  item.prioridad === 'media' ? 'bg-yellow-100 text-yellow-800' :
                                  'bg-gray-100 text-gray-800'
                                }`}>
                                  {item.prioridad === 'alta' ? 'Alta' : 
                                   item.prioridad === 'media' ? 'Media' : 'Baja'}
                                </span>
                              </td>
                              <td className="px-6 py-4">
                                <div className="text-sm text-gray-500 max-w-xs truncate">
                                  {item.notas || 'Sin notas'}
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex space-x-2">
                                  <button
                                    onClick={() => handleOpenConvertModal(item)}
                                    disabled={loadingActions[`convert-${item.id}`]}
                                    className="text-xs bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white px-3 py-1 rounded transition-colors flex items-center space-x-1"
                                    title="Convertir a invitado oficial"
                                  >
                                    {loadingActions[`convert-${item.id}`] ? (
                                      <>
                                        <svg className="animate-spin h-3 w-3" fill="none" viewBox="0 0 24 24">
                                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        <span>Convirtiendo...</span>
                                      </>
                                    ) : (
                                      'Invitar'
                                    )}
                                  </button>
                                  <button
                                    onClick={() => handleDeleteFromListaEspera(item.id)}
                                    disabled={loadingActions[`delete-${item.id}`]}
                                    className="text-xs bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white px-3 py-1 rounded transition-colors flex items-center space-x-1"
                                    title="Eliminar de lista de espera"
                                  >
                                    {loadingActions[`delete-${item.id}`] ? (
                                      <>
                                        <svg className="animate-spin h-3 w-3" fill="none" viewBox="0 0 24 24">
                                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        <span>Eliminando...</span>
                                      </>
                                    ) : (
                                      'Eliminar'
                                    )}
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {/* Mobile Cards */}
                    <div className="lg:hidden space-y-4">
                      {filteredListaEspera.map((item) => (
                        <Card key={item.id} className="border border-gray-200">
                          <CardContent className="p-4">
                            <div className="space-y-3">
                              {/* Header with names and badges */}
                              <div className="flex justify-between items-start">
                                <div>
                                  <h3 className="font-medium text-gray-900">
                                    {item.nombre_1}
                                    {item.nombre_2 && (
                                      <span className="text-rose-600"> & {item.nombre_2}</span>
                                    )}
                                  </h3>
                                </div>
                                <div className="flex space-x-2">
                                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                    item.de_quien === 'jaime' 
                                      ? 'bg-blue-100 text-blue-800' 
                                      : 'bg-pink-100 text-pink-800'
                                  }`}>
                                    {item.de_quien === 'jaime' ? 'Jaime' : 'Alejandra'}
                                  </span>
                                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                    item.prioridad === 'alta' ? 'bg-red-100 text-red-800' :
                                    item.prioridad === 'media' ? 'bg-yellow-100 text-yellow-800' :
                                    'bg-gray-100 text-gray-800'
                                  }`}>
                                    {item.prioridad === 'alta' ? 'Alta' : 
                                     item.prioridad === 'media' ? 'Media' : 'Baja'}
                                  </span>
                                </div>
                              </div>

                              {/* Notes */}
                              {item.notas && (
                                <div className="bg-gray-50 rounded-lg p-2">
                                  <p className="text-sm text-gray-600">{item.notas}</p>
                                </div>
                              )}

                              {/* Actions */}
                              <div className="flex space-x-2 pt-2 border-t border-gray-100">
                                <button
                                  onClick={() => handleOpenConvertModal(item)}
                                  disabled={loadingActions[`convert-${item.id}`]}
                                  className="flex-1 text-sm bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white px-3 py-2 rounded transition-colors flex items-center justify-center space-x-1"
                                >
                                  {loadingActions[`convert-${item.id}`] ? (
                                    <>
                                      <svg className="animate-spin h-3 w-3" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                      </svg>
                                      <span>Convirtiendo...</span>
                                    </>
                                  ) : (
                                    'Convertir a Invitado'
                                  )}
                                </button>
                                <button
                                  onClick={() => handleDeleteFromListaEspera(item.id)}
                                  disabled={loadingActions[`delete-${item.id}`]}
                                  className="text-sm bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white px-3 py-2 rounded transition-colors flex items-center justify-center space-x-1"
                                >
                                  {loadingActions[`delete-${item.id}`] ? (
                                    <>
                                      <svg className="animate-spin h-3 w-3" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                      </svg>
                                      <span>Eliminando...</span>
                                    </>
                                  ) : (
                                    'Eliminar'
                                  )}
                                </button>
                              </div>
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

      {/* WhatsApp Modal */}
      {showWhatsAppModal && selectedInvitado && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold text-gray-900">
                  Invitación WhatsApp
                </h2>
                <button
                  onClick={() => setShowWhatsAppModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-600 mb-2">
                    Para: <span className="font-medium text-gray-900">
                      {selectedInvitado.nombre_1}
                      {selectedInvitado.nombre_2 && ` & ${selectedInvitado.nombre_2}`}
                    </span>
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Mensaje a copiar:
                  </label>
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 text-sm whitespace-pre-line">
                    {generateWhatsAppMessage({ slug: selectedInvitado.slug })}
                  </div>
                </div>

                <div className="flex space-x-3">
                  <button
                    onClick={() => handleCopyWhatsAppMessage(selectedInvitado)}
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors"
                  >
                    Copiar Mensaje
                  </button>
                  <button
                    onClick={() => setShowWhatsAppModal(false)}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancelar
                  </button>
                </div>

                <div className="border-t pt-4">
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedInvitado.invitacion_enviada || false}
                      onChange={() => {
                        handleToggleInvitacionEnviada(selectedInvitado)
                        setShowWhatsAppModal(false)
                      }}
                      className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                    />
                    <span className="text-sm text-gray-700">
                      Marcar como enviada
                    </span>
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Lista Espera Modal */}
      {showAddListaEspera && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold text-gray-900">
                  Agregar a Lista de Espera
                </h2>
                <button
                  onClick={() => setShowAddListaEspera(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <AddListaEsperaForm 
                onSuccess={() => {
                  setShowAddListaEspera(false)
                  handleListaEsperaAdded()
                }}
                onCancel={() => setShowAddListaEspera(false)}
              />
            </div>
          </div>
        </div>
      )}

      {/* Convert to Invitado Confirmation Modal */}
      {showConvertModal && convertingItem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center justify-center w-12 h-12 mx-auto bg-orange-100 rounded-full mb-4">
                <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              
              <div className="text-center mb-6">
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Convertir a Invitado Oficial
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                  ¿Estás seguro que quieres convertir a <strong>{convertingItem.nombre_1}</strong>
                  {convertingItem.nombre_2 && <span> y <strong>{convertingItem.nombre_2}</strong></span>} 
                  en invitado oficial?
                </p>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                  <div className="flex">
                    <svg className="w-5 h-5 text-blue-400 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div className="text-left">
                      <p className="text-sm text-blue-800 font-medium">¿Qué pasará?</p>
                      <ul className="text-xs text-blue-700 mt-1 space-y-1">
                        <li>• Se creará un nuevo invitado en la lista oficial</li>
                        <li>• Se generará automáticamente su slug único</li>
                        <li>• Se eliminará de la lista de espera</li>
                        <li>• El estado RSVP será &quot;Pendiente&quot;</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex space-x-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowConvertModal(false)
                    setConvertingItem(null)
                  }}
                  className="flex-1"
                  disabled={loadingActions[`convert-${convertingItem.id}`]}
                >
                  Cancelar
                </Button>
                <Button
                  onClick={() => handleConvertToInvitado(convertingItem)}
                  loading={loadingActions[`convert-${convertingItem.id}`]}
                  className="flex-1 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800"
                >
                  {loadingActions[`convert-${convertingItem.id}`] ? 'Convirtiendo...' : 'Sí, Convertir'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toast && (
        <div className="fixed top-4 right-4 z-50 max-w-sm">
          <div className={`p-4 rounded-lg shadow-lg ${
            toast.type === 'success' 
              ? 'bg-green-50 border border-green-200 text-green-800' 
              : 'bg-red-50 border border-red-200 text-red-800'
          }`}>
            <div className="flex items-center space-x-2">
              <span className="text-sm">
                {toast.type === 'success' ? 'Listo' : 'Error'}
              </span>
              <span className="text-sm font-medium">{toast.message}</span>
            </div>
          </div>
        </div>
      )}
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
