function PropertyCard({ property, onEdit, onDelete }) {
  const occupancyRate = property.totalUnits > 0 
    ? Math.round((property.occupiedUnits / property.totalUnits) * 100) 
    : 0

  return (
    <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-xl font-bold text-gray-900">{property.name}</h3>
          <p className="text-sm text-gray-600 mt-1">{property.address}</p>
          <p className="text-sm text-gray-600">{property.city}</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => onEdit(property)}
            className="text-indigo-600 hover:text-indigo-900 text-sm font-medium"
          >
            Edit
          </button>
          <button
            onClick={() => onDelete(property.id)}
            className="text-red-600 hover:text-red-900 text-sm font-medium"
          >
            Delete
          </button>
        </div>
      </div>

      {property.description && (
        <p className="text-gray-600 text-sm mb-4">{property.description}</p>
      )}

      <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t">
        <div>
          <p className="text-sm text-gray-500">Total Units</p>
          <p className="text-2xl font-bold text-gray-900">{property.totalUnits}</p>
        </div>
        <div>
          <p className="text-sm text-gray-500">Occupied</p>
          <p className="text-2xl font-bold text-gray-900">{property.occupiedUnits}</p>
        </div>
      </div>

      <div className="mt-4">
        <div className="flex justify-between text-sm mb-1">
          <span className="text-gray-600">Occupancy Rate</span>
          <span className="font-medium text-gray-900">{occupancyRate}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-indigo-600 h-2 rounded-full transition-all"
            style={{ width: `${occupancyRate}%` }}
          />
        </div>
      </div>
    </div>
  )
}

export default PropertyCard