import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { getPropertiesByLandlord } from '../services/propertyService'

function Dashboard() {
  const { currentUser } = useAuth()
  const [stats, setStats] = useState({
    totalProperties: 0,
    totalUnits: 0,
    occupiedUnits: 0
  })

  useEffect(() => {
    loadStats()
  }, [currentUser])

  const loadStats = async () => {
    const result = await getPropertiesByLandlord(currentUser.uid)
    if (result.properties) {
      const totalProperties = result.properties.length
      const totalUnits = result.properties.reduce((sum, p) => sum + p.totalUnits, 0)
      const occupiedUnits = result.properties.reduce((sum, p) => sum + p.occupiedUnits, 0)
      
      setStats({ totalProperties, totalUnits, occupiedUnits })
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Welcome back, {currentUser?.displayName || 'User'}!
        </h1>
        <p className="mt-2 text-gray-600">
          Here's what's happening with your properties today.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500">Total Properties</h3>
          <p className="mt-2 text-3xl font-bold text-gray-900">{stats.totalProperties}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500">Total Units</h3>
          <p className="mt-2 text-3xl font-bold text-gray-900">{stats.totalUnits}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500">Occupied Units</h3>
          <p className="mt-2 text-3xl font-bold text-gray-900">{stats.occupiedUnits}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500">Vacant Units</h3>
          <p className="mt-2 text-3xl font-bold text-gray-900">
            {stats.totalUnits - stats.occupiedUnits}
          </p>
        </div>
      </div>

      <div className="mt-8 bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Recent Activity</h2>
        <p className="text-gray-600">No recent activity to display.</p>
      </div>
    </div>
  )
}

export default Dashboard