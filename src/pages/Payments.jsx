import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { 
  createPayment, 
  getPaymentsByLandlord, 
  deletePayment,
  getPaymentStats
} from '../services/paymentService'
import PaymentCard from '../components/payments/PaymentCard'
import PaymentForm from '../components/payments/PaymentForm'

function Payments() {
  const { currentUser } = useAuth()
  const [payments, setPayments] = useState([])
  const [stats, setStats] = useState({ totalRevenue: 0, monthlyRevenue: 0, totalPayments: 0 })
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [viewingPayment, setViewingPayment] = useState(null)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    loadPayments()
    loadStats()
  }, [currentUser])

  const loadPayments = async () => {
    setLoading(true)
    const result = await getPaymentsByLandlord(currentUser.uid)
    if (result.error) {
      setError(result.error)
    } else {
      setPayments(result.payments)
    }
    setLoading(false)
  }

  const loadStats = async () => {
    const result = await getPaymentStats(currentUser.uid)
    if (!result.error) {
      setStats({
        totalRevenue: result.totalRevenue,
        monthlyRevenue: result.monthlyRevenue,
        totalPayments: result.totalPayments
      })
    }
  }

  const handleAddPayment = async (paymentData) => {
    const result = await createPayment(paymentData, currentUser.uid)
    if (result.error) {
      setError(result.error)
    } else {
      setSuccess('Payment recorded successfully!')
      setShowForm(false)
      loadPayments()
      loadStats()
      setTimeout(() => setSuccess(''), 3000)
    }
  }

  const handleDeletePayment = async (paymentId) => {
    if (window.confirm('Are you sure you want to delete this payment? This will reverse the tenant balance.')) {
      const result = await deletePayment(paymentId)
      if (result.error) {
        setError(result.error)
      } else {
        setSuccess('Payment deleted successfully!')
        loadPayments()
        loadStats()
        setTimeout(() => setSuccess(''), 3000)
      }
    }
  }

  const handleViewDetails = (payment) => {
    setViewingPayment(payment)
    setShowForm(false)
  }

  const handleCancel = () => {
    setShowForm(false)
    setError('')
  }

  const handleCloseDetails = () => {
    setViewingPayment(null)
  }

  const formatDate = (timestamp) => {
    if (!timestamp) return 'N/A'
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp)
    return date.toLocaleString('en-KE', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-gray-600">Loading payments...</div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Payments</h1>
          <p className="mt-2 text-gray-600">Track and manage rent payments</p>
        </div>
        {!showForm && !viewingPayment && (
          <button
            onClick={() => setShowForm(true)}
            className="bg-indigo-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-indigo-700"
          >
            Record Payment
          </button>
        )}
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500">Total Revenue</h3>
          <p className="mt-2 text-3xl font-bold text-green-600">
            KES {stats.totalRevenue.toLocaleString()}
          </p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500">This Month</h3>
          <p className="mt-2 text-3xl font-bold text-indigo-600">
            KES {stats.monthlyRevenue.toLocaleString()}
          </p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500">Total Payments</h3>
          <p className="mt-2 text-3xl font-bold text-gray-900">{stats.totalPayments}</p>
        </div>
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
          <h2 className="text-xl font-bold text-gray-900 mb-6">Record New Payment</h2>
          <PaymentForm onSubmit={handleAddPayment} onCancel={handleCancel} />
        </div>
      )}

      {viewingPayment && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex justify-between items-start mb-6">
            <h2 className="text-xl font-bold text-gray-900">Payment Details</h2>
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
              <h3 className="text-sm font-medium text-gray-500 mb-4">Payment Information</h3>
              <dl className="space-y-3">
                <div>
                  <dt className="text-sm text-gray-600">Tenant</dt>
                  <dd className="text-sm font-medium text-gray-900">{viewingPayment.tenantName}</dd>
                </div>
                <div>
                  <dt className="text-sm text-gray-600">Property</dt>
                  <dd className="text-sm font-medium text-gray-900">{viewingPayment.propertyName}</dd>
                </div>
                <div>
                  <dt className="text-sm text-gray-600">Amount</dt>
                  <dd className="text-lg font-bold text-green-600">
                    KES {viewingPayment.amount?.toLocaleString()}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm text-gray-600">Payment Method</dt>
                  <dd className="text-sm font-medium text-gray-900 capitalize">
                    {viewingPayment.paymentMethod}
                  </dd>
                </div>
              </dl>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-4">Transaction Details</h3>
              <dl className="space-y-3">
                <div>
                  <dt className="text-sm text-gray-600">Payment Date</dt>
                  <dd className="text-sm font-medium text-gray-900">
                    {new Date(viewingPayment.paymentDate).toLocaleDateString()}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm text-gray-600">Recorded On</dt>
                  <dd className="text-sm font-medium text-gray-900">
                    {formatDate(viewingPayment.createdAt)}
                  </dd>
                </div>
                {viewingPayment.transactionId && (
                  <div>
                    <dt className="text-sm text-gray-600">Transaction ID</dt>
                    <dd className="text-sm font-medium text-gray-900 font-mono">
                      {viewingPayment.transactionId}
                    </dd>
                  </div>
                )}
                {viewingPayment.notes && (
                  <div>
                    <dt className="text-sm text-gray-600">Notes</dt>
                    <dd className="text-sm font-medium text-gray-900">{viewingPayment.notes}</dd>
                  </div>
                )}
              </dl>
            </div>
          </div>

          <div className="mt-6 pt-6 border-t">
            <button
              onClick={() => handleDeletePayment(viewingPayment.id)}
              className="px-4 py-2 bg-red-600 text-white rounded-md text-sm font-medium hover:bg-red-700"
            >
              Delete Payment
            </button>
          </div>
        </div>
      )}

      {!showForm && !viewingPayment && (
        <>
          {payments.length === 0 ? (
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
                  d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">No payments recorded</h3>
              <p className="mt-1 text-sm text-gray-500">Get started by recording your first payment.</p>
              <div className="mt-6">
                <button
                  onClick={() => setShowForm(true)}
                  className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
                >
                  Record Payment
                </button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {payments.map((payment) => (
                <PaymentCard
                  key={payment.id}
                  payment={payment}
                  onDelete={handleDeletePayment}
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

export default Payments