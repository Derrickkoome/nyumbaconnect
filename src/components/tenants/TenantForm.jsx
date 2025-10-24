import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import { getPropertiesByLandlord } from '../../services/propertyService'

function TenantForm({ onSubmit, onCancel, initialData = null }) {
  const { currentUser } = useAuth()
  const [properties, setProperties] = useState([])
  const [formData, setFormData] = useState({
    firstName: initialData?.firstName || '',
    lastName: initialData?.lastName || '',
    email: initialData?.email || '',
    phone: initialData?.phone || '',
    propertyId: initialData?.propertyId || '',
    propertyName: initialData?.propertyName || '',
    unitNumber: initialData?.unitNumber || '',
    rentAmount: initialData?.rentAmount || '',
    moveInDate: initialData?.moveInDate || '',
    idNumber: initialData?.idNumber || ''
  })
  const [errors, setErrors] = useState({})

  useEffect(() => {
    loadProperties()
  }, [currentUser])

  const loadProperties = async () => {
    const result = await getPropertiesByLandlord(currentUser.uid)
    if (result.properties) {
      setProperties(result.properties)
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    
    // If property is changed, update propertyName too
    if (name === 'propertyId') {
      const selectedProperty = properties.find(p => p.id === value)
      setFormData({
        ...formData,
        propertyId: value,
        propertyName: selectedProperty?.name || ''
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
    if (!formData.firstName.trim()) newErrors.firstName = 'First name is required'
    if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required'
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required'
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid'
    }
    if (!formData.phone.trim()) newErrors.phone = 'Phone number is required'
    if (!formData.propertyId) newErrors.propertyId = 'Property is required'
    if (!formData.unitNumber.trim()) newErrors.unitNumber = 'Unit number is required'
    if (!formData.rentAmount || formData.rentAmount <= 0) {
      newErrors.rentAmount = 'Rent amount must be greater than 0'
    }
    if (!formData.moveInDate) newErrors.moveInDate = 'Move-in date is required'
    if (!formData.idNumber.trim()) newErrors.idNumber = 'ID number is required'
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
      rentAmount: parseFloat(formData.rentAmount),
      fullName: `${formData.firstName} ${formData.lastName}`
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">
            First Name *
          </label>
          <input
            type="text"
            id="firstName"
            name="firstName"
            value={formData.firstName}
            onChange={handleChange}
            className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 ${
              errors.firstName ? 'border-red-300' : 'border-gray-300'
            }`}
            placeholder="John"
          />
          {errors.firstName && <p className="mt-1 text-sm text-red-600">{errors.firstName}</p>}
        </div>

        <div>
          <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">
            Last Name *
          </label>
          <input
            type="text"
            id="lastName"
            name="lastName"
            value={formData.lastName}
            onChange={handleChange}
            className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 ${
              errors.lastName ? 'border-red-300' : 'border-gray-300'
            }`}
            placeholder="Doe"
          />
          {errors.lastName && <p className="mt-1 text-sm text-red-600">{errors.lastName}</p>}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700">
            Email *
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 ${
              errors.email ? 'border-red-300' : 'border-gray-300'
            }`}
            placeholder="john.doe@example.com"
          />
          {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
        </div>

        <div>
          <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
            Phone Number *
          </label>
          <input
            type="tel"
            id="phone"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 ${
              errors.phone ? 'border-red-300' : 'border-gray-300'
            }`}
            placeholder="0712345678"
          />
          {errors.phone && <p className="mt-1 text-sm text-red-600">{errors.phone}</p>}
        </div>
      </div>

      <div>
        <label htmlFor="idNumber" className="block text-sm font-medium text-gray-700">
          ID Number *
        </label>
        <input
          type="text"
          id="idNumber"
          name="idNumber"
          value={formData.idNumber}
          onChange={handleChange}
          className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 ${
            errors.idNumber ? 'border-red-300' : 'border-gray-300'
          }`}
          placeholder="12345678"
        />
        {errors.idNumber && <p className="mt-1 text-sm text-red-600">{errors.idNumber}</p>}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label htmlFor="propertyId" className="block text-sm font-medium text-gray-700">
            Property *
          </label>
          <select
            id="propertyId"
            name="propertyId"
            value={formData.propertyId}
            onChange={handleChange}
            className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 ${
              errors.propertyId ? 'border-red-300' : 'border-gray-300'
            }`}
          >
            <option value="">Select a property</option>
            {properties.map((property) => (
              <option key={property.id} value={property.id}>
                {property.name}
              </option>
            ))}
          </select>
          {errors.propertyId && <p className="mt-1 text-sm text-red-600">{errors.propertyId}</p>}
        </div>

        <div>
          <label htmlFor="unitNumber" className="block text-sm font-medium text-gray-700">
            Unit Number *
          </label>
          <input
            type="text"
            id="unitNumber"
            name="unitNumber"
            value={formData.unitNumber}
            onChange={handleChange}
            className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 ${
              errors.unitNumber ? 'border-red-300' : 'border-gray-300'
            }`}
            placeholder="e.g., A1, 101"
          />
          {errors.unitNumber && <p className="mt-1 text-sm text-red-600">{errors.unitNumber}</p>}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label htmlFor="rentAmount" className="block text-sm font-medium text-gray-700">
            Monthly Rent (KES) *
          </label>
          <input
            type="number"
            id="rentAmount"
            name="rentAmount"
            min="0"
            step="0.01"
            value={formData.rentAmount}
            onChange={handleChange}
            className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 ${
              errors.rentAmount ? 'border-red-300' : 'border-gray-300'
            }`}
            placeholder="25000"
          />
          {errors.rentAmount && <p className="mt-1 text-sm text-red-600">{errors.rentAmount}</p>}
        </div>

        <div>
          <label htmlFor="moveInDate" className="block text-sm font-medium text-gray-700">
            Move-in Date *
          </label>
          <input
            type="date"
            id="moveInDate"
            name="moveInDate"
            value={formData.moveInDate}
            onChange={handleChange}
            className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 ${
              errors.moveInDate ? 'border-red-300' : 'border-gray-300'
            }`}
          />
          {errors.moveInDate && <p className="mt-1 text-sm text-red-600">{errors.moveInDate}</p>}
        </div>
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
          {initialData ? 'Update Tenant' : 'Add Tenant'}
        </button>
      </div>
    </form>
  )
}

export default TenantForm