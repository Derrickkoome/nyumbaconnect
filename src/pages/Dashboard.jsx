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
      await loadStats() // Refresh dashboard
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

      {/* Rest of your dashboard remains the same */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Your existing stat cards */}
      </div>

      {/* Your existing revenue and occupancy sections */}
    </div>
  )
}

export default Dashboard