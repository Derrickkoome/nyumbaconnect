import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { 
  createProperty, 
  getPropertiesByLandlord, 
  updateProperty, 
  deleteProperty 
} from '../services/propertyService'
import PropertyCard from '../components/properties/PropertyCard'
import PropertyForm from '../components/properties/PropertyForm'

function Properties() {
  const { currentUser } = useAuth()
  const [properties, setProperties] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingProperty, setEditingProperty] = useState(null)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    loadProperties()
  }, [currentUser])

  const loadProperties = async () => {
    setLoading(true)
    const result = await getPropertiesByLandlord(currentUser.uid)
    if (result.error) {
      setError(result.error)
    } else {
      setProperties(result.properties)
    }
    setLoading(false)
  }

  const handleAddProperty = async (propertyData) => {
    const result = await createProperty(propertyData, currentUser.uid)
    if (result.error) {
      setError(result.error)
    } else {
      setSuccess('Property added successfully!')
      setShowForm(false)
      loadProperties()
      setTimeout(() => setSuccess(''), 3000)
    }
  }

  const handleUpdateProperty = async (propertyData) => {
    const result = await updateProperty(editingProperty.id, propertyData)
    if (result.error) {
      setError(result.error)
    } else {
      setSuccess('Property updated successfully!')
      setShowForm(false)
      setEditingProperty(null)
      loadProperties()
      setTimeout(() => setSuccess(''), 3000)
    }
  }

  const handleDeleteProperty = async (propertyId) => {
    if (window.confirm('Are you sure you want to delete this property?')) {
      const result = await deleteProperty(propertyId)
      if (result.error) {
        setError(result.error)
      } else {
        setSuccess('Property deleted successfully!')
        loadProperties()
        setTimeout(() => setSuccess(''), 3000)
      }
    }
  }

  const handleEdit = (property) => {
    setEditingProperty(property)
    setShowForm(true)
  }

  const handleCancel = () => {
    setShowForm(false)
    setEditingProperty(null)
    setError('')
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-gray-600">Loading properties...</div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Properties</h1>
          <p className="mt-2 text-gray-600">Manage your rental properties</p>
        </div>
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="bg-indigo-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-indigo-700"
          >
            Add Property
          </button>
        )}
      </div>

      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-4 bg-green-50 border border-green-200 text-green-600 px-4 py-3 rounded">
          {success}
        </div>
      )}

      {showForm && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-6">
            {editingProperty ? 'Edit Property' : 'Add New Property'}
          </h2>
          <PropertyForm
            onSubmit={editingProperty ? handleUpdateProperty : handleAddProperty}
            onCancel={handleCancel}
            initialData={editingProperty}
          />
        </div>
      )}

      {properties.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <svg
            className="mx-auto h-12 w-12 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
            />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">No properties</h3>
          <p className="mt-1 text-sm text-gray-500">Get started by adding a new property.</p>
          <div className="mt-6">
            <button
              onClick={() => setShowForm(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
            >
              Add Property
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {properties.map((property) => (
            <PropertyCard
              key={property.id}
              property={property}
              onEdit={handleEdit}
              onDelete={handleDeleteProperty}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export default Properties