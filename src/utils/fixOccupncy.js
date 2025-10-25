import { collection, getDocs, doc, updateDoc, query, where } from 'firebase/firestore'
import { db } from '../services/firebase'

// Recalculate occupancy based on actual tenants
export const recalculateOccupancy = async (landlordId) => {
  try {
    console.log('Starting occupancy recalculation...')
    
    // Get all properties for this landlord
    const propertiesRef = collection(db, 'properties')
    const propertiesQuery = query(propertiesRef, where('landlordId', '==', landlordId))
    const propertiesSnapshot = await getDocs(propertiesQuery)
    
    // Get all active tenants for this landlord
    const tenantsRef = collection(db, 'tenants')
    const tenantsQuery = query(tenantsRef, where('landlordId', '==', landlordId))
    const tenantsSnapshot = await getDocs(tenantsQuery)
    
    // Count tenants per property
    const tenantCounts = {}
    tenantsSnapshot.forEach((docSnap) => {
      const tenant = docSnap.data()
      if (tenant.status === 'active') {
        const propId = tenant.propertyId
        tenantCounts[propId] = (tenantCounts[propId] || 0) + 1
      }
    })
    
    console.log('Tenant counts:', tenantCounts)
    
    // Update each property with correct count
    let updatedCount = 0
    for (const docSnap of propertiesSnapshot.docs) {
      const property = docSnap.data()
      const correctCount = tenantCounts[docSnap.id] || 0
      
      console.log(`Property: ${property.name}`)
      console.log(`  Current occupiedUnits: ${property.occupiedUnits}`)
      console.log(`  Should be: ${correctCount}`)
      
      await updateDoc(doc(db, 'properties', docSnap.id), {
        occupiedUnits: correctCount
      })
      
      updatedCount++
      console.log(`  ✓ Updated!`)
    }
    
    console.log(`Successfully updated ${updatedCount} properties`)
    return { success: true, message: `Updated ${updatedCount} properties` }
  } catch (error) {
    console.error('Error recalculating occupancy:', error)
    return { success: false, error: error.message }
  }
}