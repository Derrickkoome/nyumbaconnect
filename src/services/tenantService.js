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
  serverTimestamp 
} from 'firebase/firestore'
import { db } from './firebase'

const tenantsCollection = collection(db, 'tenants')

// Create a new tenant
export const createTenant = async (tenantData, landlordId) => {
  try {
    const docRef = await addDoc(tenantsCollection, {
      ...tenantData,
      landlordId,
      status: 'active',
      currentBalance: 0,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    })
    return { id: docRef.id, error: null }
  } catch (error) {
    return { id: null, error: error.message }
  }
}

// Get all tenants for a landlord
export const getTenantsByLandlord = async (landlordId) => {
  try {
    const q = query(tenantsCollection, where('landlordId', '==', landlordId))
    const querySnapshot = await getDocs(q)
    const tenants = []
    querySnapshot.forEach((doc) => {
      tenants.push({ id: doc.id, ...doc.data() })
    })
    return { tenants, error: null }
  } catch (error) {
    return { tenants: [], error: error.message }
  }
}

// Get tenants by property
export const getTenantsByProperty = async (propertyId) => {
  try {
    const q = query(tenantsCollection, where('propertyId', '==', propertyId))
    const querySnapshot = await getDocs(q)
    const tenants = []
    querySnapshot.forEach((doc) => {
      tenants.push({ id: doc.id, ...doc.data() })
    })
    return { tenants, error: null }
  } catch (error) {
    return { tenants: [], error: error.message }
  }
}

// Get a single tenant by ID
export const getTenantById = async (tenantId) => {
  try {
    const docRef = doc(db, 'tenants', tenantId)
    const docSnap = await getDoc(docRef)
    
    if (docSnap.exists()) {
      return { tenant: { id: docSnap.id, ...docSnap.data() }, error: null }
    } else {
      return { tenant: null, error: 'Tenant not found' }
    }
  } catch (error) {
    return { tenant: null, error: error.message }
  }
}

// Update a tenant
export const updateTenant = async (tenantId, tenantData) => {
  try {
    const docRef = doc(db, 'tenants', tenantId)
    await updateDoc(docRef, {
      ...tenantData,
      updatedAt: serverTimestamp()
    })
    return { error: null }
  } catch (error) {
    return { error: error.message }
  }
}

// Delete a tenant
export const deleteTenant = async (tenantId) => {
  try {
    const docRef = doc(db, 'tenants', tenantId)
    await deleteDoc(docRef)
    return { error: null }
  } catch (error) {
    return { error: error.message }
  }
}

// Update tenant balance
export const updateTenantBalance = async (tenantId, newBalance) => {
  try {
    const docRef = doc(db, 'tenants', tenantId)
    await updateDoc(docRef, {
      currentBalance: newBalance,
      updatedAt: serverTimestamp()
    })
    return { error: null }
  } catch (error) {
    return { error: error.message }
  }
}

// Update tenant status
export const updateTenantStatus = async (tenantId, status) => {
  try {
    const docRef = doc(db, 'tenants', tenantId)
    await updateDoc(docRef, {
      status,
      updatedAt: serverTimestamp()
    })
    return { error: null }
  } catch (error) {
    return { error: error.message }
  }
}