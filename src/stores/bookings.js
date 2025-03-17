import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { supabase } from '../lib/supabase'

export const useBookingsStore = defineStore('bookings', () => {
  const bookings = ref([])
  const loading = ref(false)
  const error = ref(null)
  
  // Get all bookings (with filters if provided)
  async function fetchBookings(filters = {}) {
    loading.value = true
    error.value = null
    
    try {
      let query = supabase
        .from('bookings')
        .select(`
          *,
          users:consultant_id (
            id,
            name,
            email,
            role
          )
        `)
      
      // Apply filters if provided
      if (filters.consultantId) {
        query = query.eq('consultant_id', filters.consultantId)
      }
      
      if (filters.status) {
        query = query.eq('status', filters.status)
      }
      
      if (filters.startDate && filters.endDate) {
        query = query
          .gte('date', filters.startDate)
          .lte('date', filters.endDate)
      } else if (filters.startDate) {
        query = query.gte('date', filters.startDate)
      } else if (filters.endDate) {
        query = query.lte('date', filters.endDate)
      }
      
      if (filters.client) {
        query = query.ilike('client', `%${filters.client}%`)
      }
      
      if (filters.projectId) {
        query = query.eq('project_id', filters.projectId)
      }
      
      // Execute the query
      const { data, error: fetchError } = await query
      
      if (fetchError) throw fetchError
      
      // For now, just set the basic data without trying to join with projects
      bookings.value = data;
    } catch (err) {
      console.error('Error fetching bookings:', err)
      error.value = err.message
    } finally {
      loading.value = false
    }
  }
  
  // Create a new booking
  async function createBooking(bookingData) {
    loading.value = true
    error.value = null
    
    try {
      const { data, error: createError } = await supabase
        .from('bookings')
        .insert([bookingData])
        .select()
      
      if (createError) throw createError
      
      // Add the new booking to the existing list
      if (data && data.length > 0) {
        bookings.value.push(data[0])
      }
      
      return data[0]
    } catch (err) {
      console.error('Error creating booking:', err)
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }
  
  // Update an existing booking
  async function updateBooking(id, updates) {
    loading.value = true
    error.value = null
    
    try {
      const { data, error: updateError } = await supabase
        .from('bookings')
        .update(updates)
        .eq('id', id)
        .select()
      
      if (updateError) throw updateError
      
      // Update the booking in the existing list
      if (data && data.length > 0) {
        const index = bookings.value.findIndex(b => b.id === id)
        if (index !== -1) {
          bookings.value[index] = data[0]
        }
      }
      
      return data[0]
    } catch (err) {
      console.error('Error updating booking:', err)
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }
  
  // Delete a booking
  async function deleteBooking(id) {
    loading.value = true
    error.value = null
    
    try {
      const { error: deleteError } = await supabase
        .from('bookings')
        .delete()
        .eq('id', id)
      
      if (deleteError) throw deleteError
      
      // Remove the booking from the existing list
      bookings.value = bookings.value.filter(b => b.id !== id)
      
      return true
    } catch (err) {
      console.error('Error deleting booking:', err)
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }
  
  // Set up real-time subscription for bookings
  function subscribeToBookings() {
    const subscription = supabase
      .channel('public:bookings')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'bookings' 
      }, payload => {
        // Handle different change types
        if (payload.eventType === 'INSERT') {
          bookings.value.push(payload.new)
        } else if (payload.eventType === 'UPDATE') {
          const index = bookings.value.findIndex(b => b.id === payload.new.id)
          if (index !== -1) {
            bookings.value[index] = payload.new
          }
        } else if (payload.eventType === 'DELETE') {
          bookings.value = bookings.value.filter(b => b.id !== payload.old.id)
        }
      })
      .subscribe()
    
    return subscription
  }
  
  // Computed properties for filtering bookings
  const bookedBookings = computed(() => 
    bookings.value.filter(b => b.status === 'geboekt')
  )
  
  const optieBookings = computed(() => 
    bookings.value.filter(b => b.status === 'optie')
  )
  
  const standbyBookings = computed(() => 
    bookings.value.filter(b => b.status === 'stand-by')
  )
  
  const afwezigBookings = computed(() => 
    bookings.value.filter(b => b.status === 'afwezig')
  )
  
  return {
    bookings,
    loading,
    error,
    fetchBookings,
    createBooking,
    updateBooking,
    deleteBooking,
    subscribeToBookings,
    bookedBookings,
    optieBookings,
    standbyBookings,
    afwezigBookings
  }
})