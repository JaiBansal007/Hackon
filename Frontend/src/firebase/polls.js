import { db } from './db.jsx'
import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  onSnapshot, 
  query, 
  orderBy, 
  where,
  arrayUnion,
  arrayRemove,
  serverTimestamp,
  getDoc
} from 'firebase/firestore'

class PollsService {
  constructor() {
    this.pollsCache = new Map()
    this.unsubscribers = new Map()
  }

  // Create a new poll
  async createPoll(roomId, pollData, userId, userName) {
    try {
      const pollRef = await addDoc(collection(db, 'rooms', roomId, 'polls'), {
        question: pollData.question,
        options: pollData.options.map(option => ({
          id: option.id,
          text: option.text,
          votes: [],
          voterDetails: [] // Store user details who voted
        })),
        allowMultiple: pollData.allowMultiple || false,
        showWhoVoted: pollData.showWhoVoted || false,
        allowManualClose: pollData.allowManualClose !== false, // Default to true
        createdBy: userName,
        createdById: userId,
        createdAt: serverTimestamp(),
        isActive: true,
        totalVotes: 0,
        roomId: roomId
      })

      return {
        id: pollRef.id,
        ...pollData,
        createdBy: userName,
        createdAt: new Date().toISOString(),
        isActive: true,
        totalVotes: 0
      }
    } catch (error) {
      console.error('Error creating poll:', error)
      throw error
    }
  }

  // Vote on a poll
  async votePoll(roomId, pollId, optionId, userId, userName, userPhoto) {
    try {
      // Validate inputs
      if (!roomId || !pollId || optionId === undefined || !userId) {
        throw new Error('Missing required parameters for voting')
      }

      const pollRef = doc(db, 'rooms', String(roomId), 'polls', String(pollId))
      const pollDoc = await getDoc(pollRef)
      
      if (!pollDoc.exists()) {
        throw new Error('Poll not found')
      }

      const pollData = pollDoc.data()
      const updatedOptions = [...pollData.options]
      
      // Remove user from all options if single choice
      if (!pollData.allowMultiple) {
        updatedOptions.forEach(option => {
          if (option.votes && Array.isArray(option.votes)) {
            option.votes = option.votes.filter(vote => vote !== userId)
          } else {
            option.votes = []
          }
          if (option.voterDetails && Array.isArray(option.voterDetails)) {
            option.voterDetails = option.voterDetails.filter(voter => voter.userId !== userId)
          } else {
            option.voterDetails = []
          }
        })
      }

      // Find the selected option and toggle vote
      const selectedOption = updatedOptions.find(opt => opt.id === optionId)
      if (selectedOption) {
        // Ensure arrays exist
        if (!selectedOption.votes || !Array.isArray(selectedOption.votes)) {
          selectedOption.votes = []
        }
        if (!selectedOption.voterDetails || !Array.isArray(selectedOption.voterDetails)) {
          selectedOption.voterDetails = []
        }

        const hasVoted = selectedOption.votes.includes(userId)
        
        if (hasVoted) {
          // Remove vote
          selectedOption.votes = selectedOption.votes.filter(vote => vote !== userId)
          selectedOption.voterDetails = selectedOption.voterDetails.filter(voter => voter.userId !== userId)
        } else {
          // Add vote
          selectedOption.votes.push(userId)
          selectedOption.voterDetails.push({
            userId,
            userName: userName || 'Anonymous',
            userPhoto: userPhoto || null,
            votedAt: new Date().toISOString()
          })
        }
      }

      // Calculate total votes
      const totalVotes = updatedOptions.reduce((sum, option) => {
        return sum + (option.votes ? option.votes.length : 0)
      }, 0)

      await updateDoc(pollRef, {
        options: updatedOptions,
        totalVotes,
        lastVotedAt: serverTimestamp()
      })

      return true
    } catch (error) {
      console.error('Error voting on poll:', error)
      throw error
    }
  }

  // Close a poll
  async closePoll(roomId, pollId, userId) {
    try {
      const pollRef = doc(db, 'rooms', roomId, 'polls', pollId)
      const pollDoc = await getDoc(pollRef)
      
      if (!pollDoc.exists()) {
        throw new Error('Poll not found')
      }

      const pollData = pollDoc.data()
      
      // Only creator can close the poll
      if (pollData.createdById !== userId) {
        throw new Error('Only the poll creator can close this poll')
      }

      await updateDoc(pollRef, {
        isActive: false,
        closedAt: serverTimestamp()
      })

      return true
    } catch (error) {
      console.error('Error closing poll:', error)
      throw error
    }
  }

  // Listen to polls in a room
  listenToPolls(roomId, callback) {
    const pollsRef = collection(db, 'rooms', roomId, 'polls')
    const q = query(pollsRef, orderBy('createdAt', 'desc'))
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const polls = {}
      snapshot.docs.forEach(doc => {
        const data = doc.data()
        // Handle timestamp properly
        let createdAt = new Date().toISOString()
        if (data.createdAt) {
          if (data.createdAt.toDate) {
            createdAt = data.createdAt.toDate().toISOString()
          } else if (data.createdAt.seconds) {
            createdAt = new Date(data.createdAt.seconds * 1000).toISOString()
          } else if (typeof data.createdAt === 'string') {
            createdAt = data.createdAt
          }
        }
        
        polls[doc.id] = {
          id: doc.id,
          ...data,
          createdAt,
          // Ensure options have proper structure
          options: data.options?.map(option => ({
            ...option,
            votes: option.votes || [],
            voterDetails: option.voterDetails || []
          })) || []
        }
      })
      
      this.pollsCache.set(roomId, polls)
      callback(polls)
    }, (error) => {
      console.error('Error listening to polls:', error)
      // Call callback with empty object on error to prevent infinite loading
      callback({})
    })

    this.unsubscribers.set(roomId, unsubscribe)
    return unsubscribe
  }

  // Stop listening to polls
  stopListening(roomId) {
    const unsubscribe = this.unsubscribers.get(roomId)
    if (unsubscribe) {
      unsubscribe()
      this.unsubscribers.delete(roomId)
      this.pollsCache.delete(roomId)
    }
  }

  // Get cached polls
  getCachedPolls(roomId) {
    return this.pollsCache.get(roomId) || {}
  }

  // Clean up all listeners
  cleanup() {
    this.unsubscribers.forEach(unsubscribe => unsubscribe())
    this.unsubscribers.clear()
    this.pollsCache.clear()
  }
}

export const pollsService = new PollsService()
export default pollsService
