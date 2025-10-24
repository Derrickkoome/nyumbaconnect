import { 
  collection, 
  addDoc, 
  getDocs, 
  getDoc,
  doc, 
  updateDoc, 
  deleteDoc,
  query,
  where,
  orderBy,
  serverTimestamp 
} from 'firebase/firestore'
import { db } from './firebase'
import { updateTenantBalance } from './tenantService'

const paymentsCollection = collection(db, 'payments')

// Create a new payment
export const createPayment = async (paymentData, landlordId) => {
  try {
    const docRef = await addDoc(paymentsCollection, {
      ...paymentData,
      landlordId,
      status: 'completed',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    })
    
    // Update tenant balance
    if (paymentData.tenantId && paymentData.amount) {
      const tenantRef = doc(db, 'tenants', paymentData.tenantId)
      const tenantSnap = await getDoc(tenantRef)
      
      if (tenantSnap.exists()) {
        const tenantData = tenantSnap.data()
        const currentBalance = tenantData.currentBalance || 0
        const newBalance = currentBalance - paymentData.amount
        
        await updateTenantBalance(paymentData.tenantId, newBalance)
      }
    }
    
    return { id: docRef.id, error: null }
  } catch (error) {
    console.error('Error creating payment:', error)
    return { id: null, error: error.message }
  }
}

// Get all payments for a landlord
export const getPaymentsByLandlord = async (landlordId) => {
  try {
    const q = query(
      paymentsCollection, 
      where('landlordId', '==', landlordId),
      orderBy('createdAt', 'desc')
    )
    const querySnapshot = await getDocs(q)
    const payments = []
    querySnapshot.forEach((doc) => {
      payments.push({ id: doc.id, ...doc.data() })
    })
    return { payments, error: null }
  } catch (error) {
    return { payments: [], error: error.message }
  }
}

// Get payments by tenant
export const getPaymentsByTenant = async (tenantId) => {
  try {
    const q = query(
      paymentsCollection, 
      where('tenantId', '==', tenantId),
      orderBy('createdAt', 'desc')
    )
    const querySnapshot = await getDocs(q)
    const payments = []
    querySnapshot.forEach((doc) => {
      payments.push({ id: doc.id, ...doc.data() })
    })
    return { payments, error: null }
  } catch (error) {
    return { payments: [], error: error.message }
  }
}

// Get payments by property
export const getPaymentsByProperty = async (propertyId) => {
  try {
    const q = query(
      paymentsCollection, 
      where('propertyId', '==', propertyId),
      orderBy('createdAt', 'desc')
    )
    const querySnapshot = await getDocs(q)
    const payments = []
    querySnapshot.forEach((doc) => {
      payments.push({ id: doc.id, ...doc.data() })
    })
    return { payments, error: null }
  } catch (error) {
    return { payments: [], error: error.message }
  }
}

// Get a single payment by ID
export const getPaymentById = async (paymentId) => {
  try {
    const docRef = doc(db, 'payments', paymentId)
    const docSnap = await getDoc(docRef)
    
    if (docSnap.exists()) {
      return { payment: { id: docSnap.id, ...docSnap.data() }, error: null }
    } else {
      return { payment: null, error: 'Payment not found' }
    }
  } catch (error) {
    return { payment: null, error: error.message }
  }
}

// Update a payment
export const updatePayment = async (paymentId, paymentData) => {
  try {
    const docRef = doc(db, 'payments', paymentId)
    await updateDoc(docRef, {
      ...paymentData,
      updatedAt: serverTimestamp()
    })
    return { error: null }
  } catch (error) {
    return { error: error.message }
  }
}

// Delete a payment
export const deletePayment = async (paymentId) => {
  try {
    // Get payment data first to reverse tenant balance
    const paymentDocRef = doc(db, 'payments', paymentId)
    const paymentDoc = await getDoc(paymentDocRef)
    
    if (paymentDoc.exists()) {
      const paymentData = paymentDoc.data()
      
      // Delete payment
      await deleteDoc(paymentDocRef)
      
      // Reverse tenant balance
      if (paymentData.tenantId && paymentData.amount) {
        const tenantRef = doc(db, 'tenants', paymentData.tenantId)
        const tenantSnap = await getDoc(tenantRef)
        
        if (tenantSnap.exists()) {
          const tenantData = tenantSnap.data()
          const currentBalance = tenantData.currentBalance || 0
          const newBalance = currentBalance + paymentData.amount
          
          await updateTenantBalance(paymentData.tenantId, newBalance)
        }
      }
    }
    
    return { error: null }
  } catch (error) {
    console.error('Error deleting payment:', error)
    return { error: error.message }
  }
}

// Get payment statistics for a landlord
export const getPaymentStats = async (landlordId) => {
  try {
    const q = query(paymentsCollection, where('landlordId', '==', landlordId))
    const querySnapshot = await getDocs(q)
    
    let totalRevenue = 0
    let monthlyRevenue = 0
    const currentMonth = new Date().getMonth()
    const currentYear = new Date().getFullYear()
    
    querySnapshot.forEach((doc) => {
      const payment = doc.data()
      const amount = payment.amount || 0
      totalRevenue += amount
      
      // Calculate monthly revenue
      if (payment.createdAt) {
        const paymentDate = payment.createdAt.toDate()
        if (paymentDate.getMonth() === currentMonth && paymentDate.getFullYear() === currentYear) {
          monthlyRevenue += amount
        }
      }
    })
    
    return { 
      totalRevenue, 
      monthlyRevenue, 
      totalPayments: querySnapshot.size,
      error: null 
    }
  } catch (error) {
    return { 
      totalRevenue: 0, 
      monthlyRevenue: 0, 
      totalPayments: 0,
      error: error.message 
    }
  }
}