import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { getPropertiesByLandlord } from '../services/propertyService'
import { getTenantsByLandlord, chargeRentToAllTenants } from '../services/tenantService'
import { getPaymentStats } from '../services/paymentService'
import { collection, getDocs, doc, updateDoc, query, where } from 'firebase/firestore'
import { db } from '../services/firebase'

function Dashboard() {
  const { currentUser } = useAuth()
  const [stats, setStats] = useState({
    totalProperties: 0,
    totalUnits: 0,
    occupiedUnits: 0,
    activeTenants: 0,
    monthlyRevenue: 0,
    totalRevenue: 0,
    totalPayments: 0
  })
  const [loading, setLoading] = useState(true)
  const [fixing, setFixing] = useState(false)
  const [chargingRent, setChargingRent] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    loadStats()
  }, [currentUser])

  const loadStats = async () => {
    setLoading(true)
    
    const propertiesResult = await getPropertiesByLandlord(currentUser.uid)
    const properties = propertiesResult.properties || []
    
    const tenantsResult = await getTenantsByLandlord(currentUser.uid)
    const tenants = tenantsResult.tenants || []
    
    const paymentStatsResult = await getPaymentStats(currentUser.uid)
    
    const totalProperties = properties.length
    const totalUnits = properties.reduce((sum, p) => sum + p.totalUnits, 0)
    const occupiedUnits = properties.reduce((sum, p) => sum + (p.occupiedUnits || 0), 0)
    const activeTenants = tenants.filter(t => t.status === 'active').length
    
    setStats({
      totalProperties,
      totalUnits,
      occupiedUnits,
      activeTenants,
      monthlyRevenue: paymentStatsResult.monthlyRevenue || 0,
      totalRevenue: paymentStatsResult.totalRevenue || 0,
      totalPayments: paymentStatsResult.totalPayments || 0
    })
    
    setLoading(false)
  }

  const recalculateOccupancy = async (landlordId) => {
    try {
      console.log('Starting occupancy recalculation...')
      
      const propertiesRef = collection(db, 'properties')
      const propertiesQuery = query(propertiesRef, where('landlordId', '==', landlordId))
      const propertiesSnapshot = await getDocs(propertiesQuery)
      
      const tenantsRef = collection(db, 'tenants')
      const tenantsQuery = query(tenantsRef, where('landlordId', '==', landlordId))
      const tenantsSnapshot = await getDocs(tenantsQuery)
      
      const tenantCounts = {}
      tenantsSnapshot.forEach((docSnap) => {
        const tenant = docSnap.data()
        if (tenant.status === 'active') {
          const propId = tenant.propertyId
          tenantCounts[propId] = (tenantCounts[propId] || 0) + 1
        }
      })
      
      console.log('Tenant counts:', tenantCounts)
      
      let updatedCount = 0
      for (const docSnap of propertiesSnapshot.docs) {
        const property = docSnap.data()
        const correctCount = tenantCounts[docSnap.id] || 0
        
        console.log(`Property: ${property.name} - Setting to ${correctCount}`)
        
        await updateDoc(doc(db, 'properties', docSnap.id), {
          occupiedUnits: correctCount
        })
        
        updatedCount++
      }
      
      console.log(`Successfully updated ${updatedCount} properties`)
      return { success: true, message: `Updated ${updatedCount} properties` }
    } catch (error) {
      console.error('Error recalculating occupancy:', error)
      return { success: false, error: error.message }
    }
  }

  const handleFixOccupancy = async () => {
    setFixing(true)
    setMessage('')
    console.log('Fixing occupancy for landlord:', currentUser.uid)
    const result = await recalculateOccupancy(currentUser.uid)
    if (result.success) {
      setMessage('✓ Occupancy counts fixed successfully!')
      await loadStats()
      setTimeout(() => setMessage(''), 5000)
    } else {
      setMessage('✗ Failed to fix occupancy: ' + result.error)
    }
    setFixing(false)
  }

  const handleChargeRent = async () => {
    if (!window.confirm('This will charge monthly rent to all active tenants. Continue?')) {
      return
    }

    setChargingRent(true)
    setMessage('')
    console.log('Charging rent to all tenants...')
    
    const result = await chargeRentToAllTenants(currentUser.uid)
    
    if (result.error) {
      setMessage('✗ ' + result.error)
    } else {
      setMessage(`✓ ${result.message}`)
      await loadStats()
    }
    
    setChargingRent(false)
    setTimeout(() => setMessage(''), 5000)
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-gray-600">Loading dashboard...</div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8 flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome back, {currentUser?.displayName || 'User'}!
          </h1>
          <p className="mt-2 text-gray-600">
            Here's what's happening with your properties today.
          </p>
        </div>
        
        <div className="flex gap-3">
          <button
            onClick={handleChargeRent}
            disabled={chargingRent}
            className="bg-green-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {chargingRent ? 'Charging...' : '💰 Charge Monthly Rent'}
          </button>
          
          <button
            onClick={handleFixOccupancy}
            disabled={fixing}
            className="bg-yellow-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-yellow-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {fixing ? 'Fixing...' : '🔧 Fix Occupancy'}
          </button>
        </div>
      </div>

      {message && (
        <div className={`mb-4 px-4 py-3 rounded ${
          message.startsWith('✓') 
            ? 'bg-green-50 border border-green-200 text-green-600' 
            : 'bg-red-50 border border-red-200 text-red-600'
        }`}>
          {message}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="flex-shrink-0 bg-indigo-100 rounded-md p-3">
              <svg className="h-6 w-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <div className="ml-4">
              <h3 className="text-sm font-medium text-gray-500">Total Properties</h3>
              <p className="mt-1 text-2xl font-bold text-gray-900">{stats.totalProperties}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="flex-shrink-0 bg-green-100 rounded-md p-3">
              <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <div className="ml-4">
              <h3 className="text-sm font-medium text-gray-500">Active Tenants</h3>
              <p className="mt-1 text-2xl font-bold text-gray-900">{stats.activeTenants}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="flex-shrink-0 bg-blue-100 rounded-md p-3">
              <svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div className="ml-4">
              <h3 className="text-sm font-medium text-gray-500">Occupied Units</h3>
              <p className="mt-1 text-2xl font-bold text-gray-900">
                {stats.occupiedUnits}/{stats.totalUnits}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="flex-shrink-0 bg-purple-100 rounded-md p-3">
              <svg className="h-6 w-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <div className="ml-4">
              <h3 className="text-sm font-medium text-gray-500">Total Payments</h3>
              <p className="mt-1 text-2xl font-bold text-gray-900">{stats.totalPayments}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Revenue Overview</h2>
          <div className="space-y-4">
            <div className="flex justify-between items-center p-4 bg-green-50 rounded-lg">
              <div>
                <p className="text-sm text-gray-600">This Month's Revenue</p>
                <p className="text-2xl font-bold text-green-600">
                  KES {stats.monthlyRevenue.toLocaleString()}
                </p>
              </div>
              <div className="text-green-600">
                <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
            </div>
            <div className="flex justify-between items-center p-4 bg-indigo-50 rounded-lg">
              <div>
                <p className="text-sm text-gray-600">Total Revenue</p>
                <p className="text-2xl font-bold text-indigo-600">
                  KES {stats.totalRevenue.toLocaleString()}
                </p>
              </div>
              <div className="text-indigo-600">
                <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Occupancy Overview</h2>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-600">Occupancy Rate</span>
                <span className="font-medium text-gray-900">
                  {stats.totalUnits > 0 ? Math.round((stats.occupiedUnits / stats.totalUnits) * 100) : 0}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className="bg-indigo-600 h-3 rounded-full transition-all"
                  style={{ 
                    width: `${stats.totalUnits > 0 ? (stats.occupiedUnits / stats.totalUnits) * 100 : 0}%` 
                  }}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 mt-6">
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600">Occupied</p>
                <p className="text-2xl font-bold text-indigo-600">{stats.occupiedUnits}</p>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600">Vacant</p>
                <p className="text-2xl font-bold text-gray-400">
                  {stats.totalUnits - stats.occupiedUnits}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard