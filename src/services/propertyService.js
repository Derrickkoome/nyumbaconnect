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

const propertiesCollection = collection(db, 'properties')

// Create a new property
export const createProperty = async (propertyData, landlordId) => {
  try {
    const docRef = await addDoc(propertiesCollection, {
      ...propertyData,
      landlordId,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    })
    return { id: docRef.id, error: null }
  } catch (error) {
    return { id: null, error: error.message }
  }
}

// Get all properties for a landlord
export const getPropertiesByLandlord = async (landlordId) => {
  try {
    const q = query(propertiesCollection, where('landlordId', '==', landlordId))
    const querySnapshot = await getDocs(q)
    const properties = []
    querySnapshot.forEach((doc) => {
      properties.push({ id: doc.id, ...doc.data() })
    })
    return { properties, error: null }
  } catch (error) {
    return { properties: [], error: error.message }
  }
}

// Get a single property by ID
export const getPropertyById = async (propertyId) => {
  try {
    const docRef = doc(db, 'properties', propertyId)
    const docSnap = await getDoc(docRef)
    
    if (docSnap.exists()) {
      return { property: { id: docSnap.id, ...docSnap.data() }, error: null }
    } else {
      return { property: null, error: 'Property not found' }
    }
  } catch (error) {
    return { property: null, error: error.message }
  }
}

// Update a property
export const updateProperty = async (propertyId, propertyData) => {
  try {
    const docRef = doc(db, 'properties', propertyId)
    await updateDoc(docRef, {
      ...propertyData,
      updatedAt: serverTimestamp()
    })
    return { error: null }
  } catch (error) {
    return { error: error.message }
  }
}

// Delete a property
export const deleteProperty = async (propertyId) => {
  try {
    const docRef = doc(db, 'properties', propertyId)
    await deleteDoc(docRef)
    return { error: null }
  } catch (error) {
    return { error: error.message }
  }
}