function TenantCard({ tenant, onEdit, onDelete, onViewDetails }) {
  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800'
      case 'inactive':
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getBalanceColor = (balance) => {
    if (balance > 0) return 'text-red-600'
    if (balance < 0) return 'text-green-600'
    return 'text-gray-900'
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-bold text-gray-900">{tenant.fullName}</h3>
          <p className="text-sm text-gray-600 mt-1">{tenant.email}</p>
          <p className="text-sm text-gray-600">{tenant.phone}</p>
        </div>
        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(tenant.status)}`}>
          {tenant.status}
        </span>
      </div>

      <div className="space-y-2 mb-4">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Property:</span>
          <span className="font-medium text-gray-900">{tenant.propertyName}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Unit:</span>
          <span className="font-medium text-gray-900">{tenant.unitNumber}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Monthly Rent:</span>
          <span className="font-medium text-gray-900">KES {tenant.rentAmount?.toLocaleString()}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Balance:</span>
          <span className={`font-bold ${getBalanceColor(tenant.currentBalance)}`}>
            KES {tenant.currentBalance?.toLocaleString()}
          </span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Move-in Date:</span>
          <span className="font-medium text-gray-900">
            {new Date(tenant.moveInDate).toLocaleDateString()}
          </span>
        </div>
      </div>

      <div className="flex gap-2 pt-4 border-t">
        <button
          onClick={() => onViewDetails(tenant)}
          className="flex-1 text-indigo-600 hover:text-indigo-900 text-sm font-medium py-2"
        >
          View Details
        </button>
        <button
          onClick={() => onEdit(tenant)}
          className="flex-1 text-indigo-600 hover:text-indigo-900 text-sm font-medium py-2"
        >
          Edit
        </button>
        <button
          onClick={() => onDelete(tenant.id)}
          className="flex-1 text-red-600 hover:text-red-900 text-sm font-medium py-2"
        >
          Delete
        </button>
      </div>
    </div>
  )
}

export default TenantCard