import { db } from "./config"
import { 
  collection, 
  addDoc, 
  doc, 
  updateDoc, 
  deleteDoc, 
  getDoc,
  onSnapshot, 
  query, 
  where, 
  orderBy, 
  getDocs,
  serverTimestamp,
  arrayUnion,
  arrayRemove
} from "firebase/firestore"

class PartiesService {
  constructor() {
    this.unsubscribeCallbacks = new Map()
  }

  // Create a new scheduled party
  async createParty(partyData, hostId, hostName) {
    try {
      const party = {
        ...partyData,
        id: Date.now().toString(),
        hostId,
        hostName,
        attendees: [{ id: hostId, name: hostName, joinedAt: Date.now() }],
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        status: partyData.scheduledTime > Date.now() ? 'scheduled' : 'active',
        maxAttendees: partyData.maxAttendees || 10,
        isPublic: partyData.isPublic || true,
        roomId: null // Will be set when party starts
      }

      const docRef = await addDoc(collection(db, "parties"), party)
      console.log("✅ Party created with ID:", docRef.id)
      
      return {
        success: true,
        partyId: docRef.id,
        party: { ...party, firestoreId: docRef.id }
      }
    } catch (error) {
      console.error("❌ Error creating party:", error)
      return { success: false, error: error.message }
    }
  }

  // Join an existing party
  async joinParty(partyId, userId, userName) {
    try {
      // First, check if the party exists
      const partyRef = doc(db, "parties", partyId)
      const partyDoc = await getDoc(partyRef)
      
      if (!partyDoc.exists()) {
        console.error("❌ Party not found:", partyId)
        return { success: false, error: "Party not found. Please check the party code." }
      }
      
      const partyData = partyDoc.data()
      
      // Check if user is already in the party
      const isAlreadyJoined = partyData.attendees?.some(attendee => attendee.id === userId)
      if (isAlreadyJoined) {
        console.log("ℹ️ User already in party:", partyId)
        return { success: true, message: "You're already in this party!" }
      }
      
      // Check if party is full
      if (partyData.attendees?.length >= partyData.maxAttendees) {
        console.error("❌ Party is full:", partyId)
        return { success: false, error: "This party is full. Cannot join." }
      }
      
      await updateDoc(partyRef, {
        attendees: arrayUnion({
          id: userId,
          name: userName,
          joinedAt: Date.now()
        }),
        updatedAt: serverTimestamp()
      })

      console.log("✅ Joined party:", partyId)
      return { success: true, party: { ...partyData, firestoreId: partyId } }
    } catch (error) {
      console.error("❌ Error joining party:", error)
      return { success: false, error: error.message }
    }
  }

  // Leave a party
  async leaveParty(partyId, userId, userName) {
    try {
      const partyRef = doc(db, "parties", partyId)
      
      await updateDoc(partyRef, {
        attendees: arrayRemove({
          id: userId,
          name: userName
        }),
        updatedAt: serverTimestamp()
      })

      console.log("✅ Left party:", partyId)
      return { success: true }
    } catch (error) {
      console.error("❌ Error leaving party:", error)
      return { success: false, error: error.message }
    }
  }

  // Start a scheduled party (convert to active)
  async startParty(partyId, roomId) {
    try {
      const partyRef = doc(db, "parties", partyId)
      
      await updateDoc(partyRef, {
        status: 'active',
        roomId,
        startedAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      })

      console.log("✅ Party started:", partyId)
      return { success: true }
    } catch (error) {
      console.error("❌ Error starting party:", error)
      return { success: false, error: error.message }
    }
  }

  // End a party
  async endParty(partyId) {
    try {
      const partyRef = doc(db, "parties", partyId)
      
      await updateDoc(partyRef, {
        status: 'ended',
        endedAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      })

      console.log("✅ Party ended:", partyId)
      return { success: true }
    } catch (error) {
      console.error("❌ Error ending party:", error)
      return { success: false, error: error.message }
    }
  }

  // Listen to all public parties
  listenToPublicParties(callback) {
    const q = query(
      collection(db, "parties"),
      where("isPublic", "==", true),
      where("status", "in", ["scheduled", "active"]),
      orderBy("scheduledTime", "asc")
    )

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const parties = []
      snapshot.forEach((doc) => {
        parties.push({
          firestoreId: doc.id,
          ...doc.data(),
          scheduledTime: doc.data().scheduledTime?.toDate?.() || new Date(doc.data().scheduledTime),
          createdAt: doc.data().createdAt?.toDate?.() || new Date(doc.data().createdAt)
        })
      })
      callback(parties)
    })

    this.unsubscribeCallbacks.set('publicParties', unsubscribe)
    return unsubscribe
  }

  // Listen to user's parties (hosted or joined)
  listenToUserParties(userId, callback) {
    // Simplified query - get all parties and filter client-side to avoid index requirements
    const q = query(
      collection(db, "parties"),
      orderBy("scheduledTime", "asc")
    )

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const parties = []
      snapshot.forEach((doc) => {
        const data = doc.data()
        // Check if user is the host or in attendees
        const isHost = data.hostId === userId
        const isAttendee = data.attendees?.some(attendee => attendee.id === userId)
        
        if (isHost || isAttendee) {
          parties.push({
            firestoreId: doc.id,
            ...data,
            scheduledTime: data.scheduledTime?.toDate?.() || new Date(data.scheduledTime),
            createdAt: data.createdAt?.toDate?.() || new Date(data.createdAt)
          })
        }
      })
      callback(parties)
    })

    this.unsubscribeCallbacks.set(`userParties_${userId}`, unsubscribe)
    return unsubscribe
  }

  // Get party by ID
  async getParty(partyId) {
    try {
      const partyRef = doc(db, "parties", partyId)
      const partySnap = await getDoc(partyRef)
      
      if (partySnap.exists()) {
        const data = partySnap.data()
        return {
          success: true,
          party: {
            firestoreId: partySnap.id,
            ...data,
            scheduledTime: data.scheduledTime?.toDate?.() || new Date(data.scheduledTime),
            createdAt: data.createdAt?.toDate?.() || new Date(data.createdAt)
          }
        }
      } else {
        return { success: false, error: "Party not found" }
      }
    } catch (error) {
      console.error("❌ Error getting party:", error)
      return { success: false, error: error.message }
    }
  }

  // Search parties by movie or title
  async searchParties(searchTerm) {
    try {
      // In a real implementation, you'd use more sophisticated search
      // For now, we'll get all public parties and filter client-side
      const q = query(
        collection(db, "parties"),
        where("isPublic", "==", true),
        where("status", "in", ["scheduled", "active"])
      )

      const snapshot = await getDocs(q)
      const parties = []
      
      snapshot.forEach((doc) => {
        const data = doc.data()
        const party = {
          firestoreId: doc.id,
          ...data,
          scheduledTime: data.scheduledTime?.toDate?.() || new Date(data.scheduledTime),
          createdAt: data.createdAt?.toDate?.() || new Date(data.createdAt)
        }
        
        // Simple text search in title, movie, and description
        const searchableText = `${party.title} ${party.movie?.title} ${party.description}`.toLowerCase()
        if (searchableText.includes(searchTerm.toLowerCase())) {
          parties.push(party)
        }
      })

      return { success: true, parties }
    } catch (error) {
      console.error("❌ Error searching parties:", error)
      return { success: false, error: error.message, parties: [] }
    }
  }

  // Find party by short code (last 8 characters)
  async findPartyByCode(shortCode) {
    try {
      console.log("🔍 Searching for party with code:", shortCode)
      
      // First try as full ID
      const fullIdRef = doc(db, "parties", shortCode)
      const fullIdDoc = await getDoc(fullIdRef)
      
      if (fullIdDoc.exists()) {
        console.log("✅ Found party by full ID:", shortCode)
        return { success: true, partyId: shortCode, party: { ...fullIdDoc.data(), firestoreId: shortCode } }
      }
      
      // If not found, search by short code
      console.log("🔍 Searching parties by short code...")
      const partiesRef = collection(db, "parties")
      const snapshot = await getDocs(partiesRef)
      
      for (const docSnapshot of snapshot.docs) {
        const docId = docSnapshot.id
        const shortId = docId.slice(-8).toUpperCase()
        console.log(`Checking party ${docId} with short code ${shortId} against ${shortCode.toUpperCase()}`)
        
        if (shortId === shortCode.toUpperCase()) {
          console.log("✅ Found party by short code:", docId)
          return { success: true, partyId: docId, party: { ...docSnapshot.data(), firestoreId: docId } }
        }
      }
      
      console.log("❌ No party found with code:", shortCode)
      return { success: false, error: "Party not found with this code." }
    } catch (error) {
      console.error("❌ Error finding party by code:", error)
      return { success: false, error: error.message }
    }
  }

  // Cleanup all listeners
  cleanup() {
    this.unsubscribeCallbacks.forEach(unsubscribe => {
      if (typeof unsubscribe === 'function') {
        unsubscribe()
      }
    })
    this.unsubscribeCallbacks.clear()
  }
}

const partiesService = new PartiesService()
export default partiesService
