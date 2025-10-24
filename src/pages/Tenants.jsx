import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { 
  createTenant, 
  getTenantsByLandlord, 
  updateTenant, 
  deleteTenant 
} from '../services/tenantService'
import { updateProperty } from '../services/propertyService'
import TenantCard from '../components/tenants/TenantCard'
import TenantForm from '../components/tenants/TenantForm'

function Tenants() {
  const { currentUser } = useAuth()
  const [tenants, setTenants] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingTenant, setEditingTenant] = useState(null)
  const [viewingTenant, setViewingTenant] = useState(null)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    loadTenants()
  }, [currentUser])

  const loadTenants = async () => {
    setLoading(true)
    const result = await getTenantsByLandlord(currentUser.uid)
    if (result.error) {
      setError(result.error)
    } else {
      setTenants(result.tenants)
    }
    setLoading(false)
  }

  const handleAddTenant = async (tenantData) => {
    const result = await createTenant(tenantData, currentUser.uid)
    if (result.error) {
      setError(result.error)
    } else {
      setSuccess('Tenant added successfully!')
      setShowForm(false)
      loadTenants()
      setTimeout(() => setSuccess(''), 3000)
    }
  }

  const handleUpdateTenant = async (tenantData) => {
    const result = await updateTenant(editingTenant.id, tenantData)
    if (result.error) {
      setError(result.error)
    } else {
      setSuccess('Tenant updated successfully!')
      setShowForm(false)
      setEditingTenant(null)
      loadTenants()
      setTimeout(() => setSuccess(''), 3000)
    }
  }

  const handleDeleteTenant = async (tenantId) => {
    if (window.confirm('Are you sure you want to delete this tenant? This action cannot be undone.')) {
      const result = await deleteTenant(tenantId)
      if (result.error) {
        setError(result.error)
      } else {
        setSuccess('Tenant deleted successfully!')
        loadTenants()
        setTimeout(() => setSuccess(''), 3000)
      }
    }
  }

  const handleEdit = (tenant) => {
    setEditingTenant(tenant)
    setShowForm(true)
    setViewingTenant(null)
  }

  const handleViewDetails = (tenant) => {
    setViewingTenant(tenant)
    setShowForm(false)
  }

  const handleCancel = () => {
    setShowForm(false)
    setEditingTenant(null)
    setError('')
  }

  const handleCloseDetails = () => {
    setViewingTenant(null)
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-gray-600">Loading tenants...</div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Tenants</h1>
          <p className="mt-2 text-gray-600">Manage your tenants and their rental details</p>
        </div>
        {!showForm && !viewingTenant && (
          <button
            onClick={() => setShowForm(true)}
            className="bg-indigo-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-indigo-700"
          >
            Add Tenant
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
            {editingTenant ? 'Edit Tenant' : 'Add New Tenant'}
          </h2>
          <TenantForm
            onSubmit={editingTenant ? handleUpdateTenant : handleAddTenant}
            onCancel={handleCancel}
            initialData={editingTenant}
          />
        </div>
      )}

      {viewingTenant && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex justify-between items-start mb-6">
            <h2 className="text-xl font-bold text-gray-900">Tenant Details</h2>
            <button
              onClick={handleCloseDetails}
              className="text-gray-400 hover:text-gray-600"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-4">Personal Information</h3>
              <dl className="space-y-3">
                <div>
                  <dt className="text-sm text-gray-600">Full Name</dt>
                  <dd className="text-sm font-medium text-gray-900">{viewingTenant.fullName}</dd>
                </div>
                <div>
                  <dt className="text-sm text-gray-600">Email</dt>
                  <dd className="text-sm font-medium text-gray-900">{viewingTenant.email}</dd>
                </div>
                <div>
                  <dt className="text-sm text-gray-600">Phone</dt>
                  <dd className="text-sm font-medium text-gray-900">{viewingTenant.phone}</dd>
                </div>
                <div>
                  <dt className="text-sm text-gray-600">ID Number</dt>
                  <dd className="text-sm font-medium text-gray-900">{viewingTenant.idNumber}</dd>
                </div>
              </dl>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-4">Rental Information</h3>
              <dl className="space-y-3">
                <div>
                  <dt className="text-sm text-gray-600">Property</dt>
                  <dd className="text-sm font-medium text-gray-900">{viewingTenant.propertyName}</dd>
                </div>
                <div>
                  <dt className="text-sm text-gray-600">Unit Number</dt>
                  <dd className="text-sm font-medium text-gray-900">{viewingTenant.unitNumber}</dd>
                </div>
                <div>
                  <dt className="text-sm text-gray-600">Monthly Rent</dt>
                  <dd className="text-sm font-medium text-gray-900">KES {viewingTenant.rentAmount?.toLocaleString()}</dd>
                </div>
                <div>
                  <dt className="text-sm text-gray-600">Current Balance</dt>
                  <dd className="text-sm font-medium text-gray-900">KES {viewingTenant.currentBalance?.toLocaleString()}</dd>
                </div>
                <div>
                  <dt className="text-sm text-gray-600">Move-in Date</dt>
                  <dd className="text-sm font-medium text-gray-900">
                    {new Date(viewingTenant.moveInDate).toLocaleDateString()}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm text-gray-600">Status</dt>
                  <dd className="text-sm font-medium text-gray-900 capitalize">{viewingTenant.status}</dd>
                </div>
              </dl>
            </div>
          </div>

          <div className="mt-6 pt-6 border-t flex gap-3">
            <button
              onClick={() => handleEdit(viewingTenant)}
              className="px-4 py-2 bg-indigo-600 text-white rounded-md text-sm font-medium hover:bg-indigo-700"
            >
              Edit Tenant
            </button>
            <button
              onClick={() => handleDeleteTenant(viewingTenant.id)}
              className="px-4 py-2 bg-red-600 text-white rounded-md text-sm font-medium hover:bg-red-700"
            >
              Delete Tenant
            </button>
          </div>
        </div>
      )}

      {!showForm && !viewingTenant && (
        <>
          {tenants.length === 0 ? (
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
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zm-12 0a2 2 0 11-4 0 2 2 0 014 0z"
                    />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">No tenants</h3>
              <p className="mt-1 text-sm text-gray-500">Get started by adding a new tenant.</p>
              <div className="mt-6">
                <button
                  onClick={() => setShowForm(true)}
                  className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
                >
                  Add Tenant
                </button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {tenants.map((tenant) => (
                <TenantCard
                  key={tenant.id}
                  tenant={tenant}
                  onEdit={handleEdit}
                  onDelete={handleDeleteTenant}
                  onViewDetails={handleViewDetails}
                />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  )
}

export default Tenants