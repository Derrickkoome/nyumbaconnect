function PaymentCard({ payment, onDelete, onViewDetails }) {
  const getPaymentMethodBadge = (method) => {
    const badges = {
      cash: 'bg-green-100 text-green-800',
      mpesa: 'bg-purple-100 text-purple-800',
      bank: 'bg-blue-100 text-blue-800',
      cheque: 'bg-yellow-100 text-yellow-800'
    }
    return badges[method] || 'bg-gray-100 text-gray-800'
  }

  const formatDate = (timestamp) => {
    if (!timestamp) return 'N/A'
    
    // Handle Firestore Timestamp
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp)
    return date.toLocaleDateString('en-KE', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-bold text-gray-900">{payment.tenantName}</h3>
          <p className="text-sm text-gray-600 mt-1">{payment.propertyName}</p>
        </div>
        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getPaymentMethodBadge(payment.paymentMethod)}`}>
          {payment.paymentMethod?.toUpperCase()}
        </span>
      </div>

      <div className="space-y-2 mb-4">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Amount:</span>
          <span className="font-bold text-green-600 text-lg">
            KES {payment.amount?.toLocaleString()}
          </span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Date:</span>
          <span className="font-medium text-gray-900">{formatDate(payment.createdAt)}</span>
        </div>
        {payment.transactionId && (
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Transaction ID:</span>
            <span className="font-medium text-gray-900 font-mono text-xs">
              {payment.transactionId}
            </span>
          </div>
        )}
      </div>

      {payment.notes && (
        <div className="mb-4 p-3 bg-gray-50 rounded text-sm text-gray-600">
          {payment.notes}
        </div>
      )}

      <div className="flex gap-2 pt-4 border-t">
        <button
          onClick={() => onViewDetails(payment)}
          className="flex-1 text-indigo-600 hover:text-indigo-900 text-sm font-medium py-2"
        >
          View Details
        </button>
        <button
          onClick={() => onDelete(payment.id)}
          className="flex-1 text-red-600 hover:text-red-900 text-sm font-medium py-2"
        >
          Delete
        </button>
      </div>
    </div>
  )
}

export default PaymentCard