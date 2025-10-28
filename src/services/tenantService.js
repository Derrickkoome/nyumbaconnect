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

// Create a new tenant and update property occupancy
export const createTenant = async (tenantData, landlordId) => {
  try {
    // Add tenant
    const docRef = await addDoc(tenantsCollection, {
      ...tenantData,
      landlordId,
      status: 'active',
      currentBalance: 0,
      lastRentCharged: null, // Track when rent was last charged
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    })
    
    console.log('Tenant created, updating property occupancy...')
    
    // Get current property data
    const propertyRef = doc(db, 'properties', tenantData.propertyId)
    const propertySnap = await getDoc(propertyRef)
    
    if (propertySnap.exists()) {
      const propertyData = propertySnap.data()
      const currentOccupied = propertyData.occupiedUnits || 0
      const newOccupied = currentOccupied + 1
      
      console.log(`Property ${propertyData.name}: ${currentOccupied} -> ${newOccupied}`)
      
      await updateDoc(propertyRef, {
        occupiedUnits: newOccupied,
        updatedAt: serverTimestamp()
      })
      
      console.log('Property occupancy updated successfully!')
    }
    
    return { id: docRef.id, error: null }
  } catch (error) {
    console.error('Error creating tenant:', error)
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
export const updateTenant = async (tenantId, tenantData, oldPropertyId) => {
  try {
    const docRef = doc(db, 'tenants', tenantId)
    await updateDoc(docRef, {
      ...tenantData,
      updatedAt: serverTimestamp()
    })
    
    console.log('Tenant updated, checking property change...')
    
    if (oldPropertyId && tenantData.propertyId && oldPropertyId !== tenantData.propertyId) {
      console.log(`Property changed: ${oldPropertyId} -> ${tenantData.propertyId}`)
      
      const oldPropertyRef = doc(db, 'properties', oldPropertyId)
      const oldPropertySnap = await getDoc(oldPropertyRef)
      if (oldPropertySnap.exists()) {
        const oldData = oldPropertySnap.data()
        const oldOccupied = oldData.occupiedUnits || 0
        const newOldOccupied = Math.max(0, oldOccupied - 1)
        
        console.log(`Old property: ${oldOccupied} -> ${newOldOccupied}`)
        
        await updateDoc(oldPropertyRef, {
          occupiedUnits: newOldOccupied,
          updatedAt: serverTimestamp()
        })
      }
      
      const newPropertyRef = doc(db, 'properties', tenantData.propertyId)
      const newPropertySnap = await getDoc(newPropertyRef)
      if (newPropertySnap.exists()) {
        const newData = newPropertySnap.data()
        const newOccupied = newData.occupiedUnits || 0
        const newNewOccupied = newOccupied + 1
        
        console.log(`New property: ${newOccupied} -> ${newNewOccupied}`)
        
        await updateDoc(newPropertyRef, {
          occupiedUnits: newNewOccupied,
          updatedAt: serverTimestamp()
        })
      }
      
      console.log('Property occupancy updated!')
    }
    
    return { error: null }
  } catch (error) {
    console.error('Error updating tenant:', error)
    return { error: error.message }
  }
}

// Delete a tenant and update property occupancy
export const deleteTenant = async (tenantId) => {
  try {
    console.log('Deleting tenant and updating occupancy...')
    
    const tenantDocRef = doc(db, 'tenants', tenantId)
    const tenantDoc = await getDoc(tenantDocRef)
    
    if (tenantDoc.exists()) {
      const tenantData = tenantDoc.data()
      
      await deleteDoc(tenantDocRef)
      console.log('Tenant deleted')
      
      if (tenantData.propertyId) {
        const propertyRef = doc(db, 'properties', tenantData.propertyId)
        const propertySnap = await getDoc(propertyRef)
        
        if (propertySnap.exists()) {
          const propertyData = propertySnap.data()
          const currentOccupied = propertyData.occupiedUnits || 0
          const newOccupied = Math.max(0, currentOccupied - 1)
          
          console.log(`Property occupancy: ${currentOccupied} -> ${newOccupied}`)
          
          await updateDoc(propertyRef, {
            occupiedUnits: newOccupied,
            updatedAt: serverTimestamp()
          })
          
          console.log('Property occupancy updated!')
        }
      }
    }
    
    return { error: null }
  } catch (error) {
    console.error('Error deleting tenant:', error)
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

// Charge monthly rent to a tenant
export const chargeMonthlyRent = async (tenantId) => {
  try {
    const docRef = doc(db, 'tenants', tenantId)
    const tenantSnap = await getDoc(docRef)
    
    if (!tenantSnap.exists()) {
      return { error: 'Tenant not found' }
    }
    
    const tenantData = tenantSnap.data()
    const currentBalance = tenantData.currentBalance || 0
    const rentAmount = tenantData.rentAmount || 0
    const newBalance = currentBalance + rentAmount
    
    await updateDoc(docRef, {
      currentBalance: newBalance,
      lastRentCharged: serverTimestamp(),
      updatedAt: serverTimestamp()
    })
    
    console.log(`Rent charged to ${tenantData.fullName}: ${rentAmount}, New balance: ${newBalance}`)
    return { error: null, newBalance }
  } catch (error) {
    console.error('Error charging rent:', error)
    return { error: error.message }
  }
}

// Charge rent to all active tenants
export const chargeRentToAllTenants = async (landlordId) => {
  try {
    const q = query(
      tenantsCollection, 
      where('landlordId', '==', landlordId),
      where('status', '==', 'active')
    )
    const querySnapshot = await getDocs(q)
    
    let charged = 0
    let failed = 0
    
    for (const docSnap of querySnapshot.docs) {
      const result = await chargeMonthlyRent(docSnap.id)
      if (result.error) {
        failed++
      } else {
        charged++
      }
    }
    
    return { 
      error: null, 
      charged, 
      failed,
      message: `Successfully charged ${charged} tenant(s). ${failed} failed.`
    }
  } catch (error) {
    console.error('Error charging all tenants:', error)
    return { error: error.message, charged: 0, failed: 0 }
  }
}

// Check if rent should be charged for a specific month
export const shouldChargeRent = (lastChargedDate, currentDate = new Date()) => {
  if (!lastChargedDate) return true // Never charged before
  
  const lastCharged = lastChargedDate.toDate ? lastChargedDate.toDate() : new Date(lastChargedDate)
  const lastChargedMonth = lastCharged.getMonth()
  const lastChargedYear = lastCharged.getFullYear()
  const currentMonth = currentDate.getMonth()
  const currentYear = currentDate.getFullYear()
  
  // Check if we're in a new month
  if (currentYear > lastChargedYear) return true
  if (currentYear === lastChargedYear && currentMonth > lastChargedMonth) return true
  
  return false
}