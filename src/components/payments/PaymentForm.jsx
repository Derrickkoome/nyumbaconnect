import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import { getTenantsByLandlord } from '../../services/tenantService'
import { getPropertiesByLandlord } from '../../services/propertyService'

function PaymentForm({ onSubmit, onCancel, initialData = null }) {
  const { currentUser } = useAuth()
  const [tenants, setTenants] = useState([])
  const [properties, setProperties] = useState([])
  const [formData, setFormData] = useState({
    tenantId: initialData?.tenantId || '',
    tenantName: initialData?.tenantName || '',
    propertyId: initialData?.propertyId || '',
    propertyName: initialData?.propertyName || '',
    amount: initialData?.amount || '',
    paymentMethod: initialData?.paymentMethod || 'cash',
    transactionId: initialData?.transactionId || '',
    paymentDate: initialData?.paymentDate || new Date().toISOString().split('T')[0],
    notes: initialData?.notes || ''
  })
  const [errors, setErrors] = useState({})

  useEffect(() => {
    loadData()
  }, [currentUser])

  const loadData = async () => {
    const tenantsResult = await getTenantsByLandlord(currentUser.uid)
    const propertiesResult = await getPropertiesByLandlord(currentUser.uid)
    
    if (tenantsResult.tenants) {
      setTenants(tenantsResult.tenants)
    }
    if (propertiesResult.properties) {
      setProperties(propertiesResult.properties)
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    
    // If tenant is changed, auto-fill property and tenant name
    if (name === 'tenantId') {
      const selectedTenant = tenants.find(t => t.id === value)
      setFormData({
        ...formData,
        tenantId: value,
        tenantName: selectedTenant?.fullName || '',
        propertyId: selectedTenant?.propertyId || '',
        propertyName: selectedTenant?.propertyName || ''
      })
    } else {
      setFormData({
        ...formData,
        [name]: value
      })
    }
    
    // Clear error for this field
    if (errors[name]) {
      setErrors({ ...errors, [name]: '' })
    }
  }

  const validate = () => {
    const newErrors = {}
    if (!formData.tenantId) newErrors.tenantId = 'Please select a tenant'
    if (!formData.amount || formData.amount <= 0) {
      newErrors.amount = 'Amount must be greater than 0'
    }
    if (!formData.paymentMethod) newErrors.paymentMethod = 'Payment method is required'
    if (!formData.paymentDate) newErrors.paymentDate = 'Payment date is required'
    
    if (formData.paymentMethod === 'mpesa' && !formData.transactionId.trim()) {
      newErrors.transactionId = 'Transaction ID is required for M-Pesa payments'
    }
    
    return newErrors
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const newErrors = validate()
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    onSubmit({
      ...formData,
      amount: parseFloat(formData.amount)
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label htmlFor="tenantId" className="block text-sm font-medium text-gray-700">
          Tenant *
        </label>
        <select
          id="tenantId"
          name="tenantId"
          value={formData.tenantId}
          onChange={handleChange}
          className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 ${
            errors.tenantId ? 'border-red-300' : 'border-gray-300'
          }`}
        >
          <option value="">Select a tenant</option>
          {tenants.map((tenant) => (
            <option key={tenant.id} value={tenant.id}>
              {tenant.fullName} - {tenant.propertyName} ({tenant.unitNumber})
            </option>
          ))}
        </select>
        {errors.tenantId && <p className="mt-1 text-sm text-red-600">{errors.tenantId}</p>}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label htmlFor="amount" className="block text-sm font-medium text-gray-700">
            Amount (KES) *
          </label>
          <input
            type="number"
            id="amount"
            name="amount"
            min="0"
            step="0.01"
            value={formData.amount}
            onChange={handleChange}
            className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 ${
              errors.amount ? 'border-red-300' : 'border-gray-300'
            }`}
            placeholder="25000"
          />
          {errors.amount && <p className="mt-1 text-sm text-red-600">{errors.amount}</p>}
        </div>

        <div>
          <label htmlFor="paymentDate" className="block text-sm font-medium text-gray-700">
            Payment Date *
          </label>
          <input
            type="date"
            id="paymentDate"
            name="paymentDate"
            value={formData.paymentDate}
            onChange={handleChange}
            className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 ${
              errors.paymentDate ? 'border-red-300' : 'border-gray-300'
            }`}
          />
          {errors.paymentDate && <p className="mt-1 text-sm text-red-600">{errors.paymentDate}</p>}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label htmlFor="paymentMethod" className="block text-sm font-medium text-gray-700">
            Payment Method *
          </label>
          <select
            id="paymentMethod"
            name="paymentMethod"
            value={formData.paymentMethod}
            onChange={handleChange}
            className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 ${
              errors.paymentMethod ? 'border-red-300' : 'border-gray-300'
            }`}
          >
            <option value="cash">Cash</option>
            <option value="mpesa">M-Pesa</option>
            <option value="bank">Bank Transfer</option>
            <option value="cheque">Cheque</option>
          </select>
          {errors.paymentMethod && <p className="mt-1 text-sm text-red-600">{errors.paymentMethod}</p>}
        </div>

        <div>
          <label htmlFor="transactionId" className="block text-sm font-medium text-gray-700">
            Transaction ID {formData.paymentMethod === 'mpesa' && '*'}
          </label>
          <input
            type="text"
            id="transactionId"
            name="transactionId"
            value={formData.transactionId}
            onChange={handleChange}
            className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 ${
              errors.transactionId ? 'border-red-300' : 'border-gray-300'
            }`}
            placeholder="e.g., RGT123456789"
          />
          {errors.transactionId && <p className="mt-1 text-sm text-red-600">{errors.transactionId}</p>}
        </div>
      </div>

      <div>
        <label htmlFor="notes" className="block text-sm font-medium text-gray-700">
          Notes
        </label>
        <textarea
          id="notes"
          name="notes"
          rows="3"
          value={formData.notes}
          onChange={handleChange}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          placeholder="Additional payment information..."
        />
      </div>

      <div className="flex justify-end gap-3 pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
        >
          {initialData ? 'Update Payment' : 'Record Payment'}
        </button>
      </div>
    </form>
  )
}

export default PaymentForm