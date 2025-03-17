<template>
    <div class="p-8 max-w-7xl mx-auto">
      <h1 class="mb-6 text-gray-800 text-2xl font-bold">Schedule</h1>
      
      <ScheduleHeader
        :week-dates="weekDates"
        @previous-week="previousWeek"
        @next-week="nextWeek"
        @go-to-today="goToToday"
        @status-change="handleStatusChange"
        @new-booking="goToNewBooking"
      />
      
      <div v-if="loading" class="flex justify-center items-center py-8 text-lg text-gray-600">
        Loading schedule data...
      </div>
      
      <!-- Debug section -->
      <div v-if="!loading && bookingsStore.bookings.length === 0" class="bg-yellow-100 p-4 mb-4 rounded">
        <h3 class="font-bold text-yellow-700">No bookings found</h3>
        <p class="text-sm text-yellow-700">
          Make sure you have bookings in your database for the current week 
          ({{ weekDates[0].toISOString().split('T')[0] }} to {{ weekDates[4].toISOString().split('T')[0] }}).
        </p>
        <div class="text-xs text-yellow-600 mt-2">
          <div>Selected status: {{ selectedStatus || 'None' }}</div>
          <div>User role: {{ authStore.userDetails?.role || 'Unknown' }}</div>
          <div>Filter by consultant: {{ authStore.isConsultant && !authStore.isAdmin && !authStore.isManager }}</div>
          <button 
            @click="goToNewBooking()" 
            class="mt-2 px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Create New Booking
          </button>
        </div>
      </div>
      
      <!-- Debug panel - bookings information -->
      <div v-if="!loading && bookingsStore.bookings.length > 0" class="bg-blue-100 p-4 mb-4 rounded">
        <h3 class="font-bold text-blue-700">Found {{ bookingsStore.bookings.length }} bookings</h3>
        <p class="text-sm text-blue-700">
          Booking dates range:
          <span v-if="bookingsStore.bookings[0]?.date">
            {{ bookingsStore.bookings[0].date }} to {{ bookingsStore.bookings[bookingsStore.bookings.length-1].date }}
          </span>
        </p>
        <div class="text-xs text-blue-600 mt-2">
          <div>First booking: {{ bookingsStore.bookings[0]?.consultant_id ? `Consultant ID: ${bookingsStore.bookings[0].consultant_id}` : 'No consultant ID' }}</div>
          <div>Selected status: {{ selectedStatus || 'None' }}</div>
        </div>
      </div>
      
      <ScheduleGrid
        v-if="!loading"
        :week-dates="weekDates"
        :users="users"
        :bookings="bookingsStore.bookings"
        :selected-status="selectedStatus"
        @booking-click="showBookingDetails"
        @add-booking="addNewBooking"
        @edit-booking="editBooking"
      />
      
      <BookingDetailsModal
        v-if="selectedBooking"
        :booking="selectedBooking"
        @close="selectedBooking = null"
        @edit="editBooking"
        @delete="deleteBookingConfirm"
      />
      
      <DeleteConfirmationModal
        :show="showDeleteConfirm"
        @confirm="deleteBooking"
        @cancel="showDeleteConfirm = false"
      />
    </div>
  </template>
  
  <script setup>
  import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
  import { useRouter } from 'vue-router'
  import { useAuthStore } from '../stores/auth'
  import { useBookingsStore } from '../stores/bookings'
  import { supabase } from '../lib/supabase'
  import ScheduleHeader from '../components/schedule/ScheduleHeader.vue'
  import ScheduleGrid from '../components/schedule/ScheduleGrid.vue'
  import BookingDetailsModal from '../components/schedule/BookingDetailsModal.vue'
  import DeleteConfirmationModal from '../components/schedule/DeleteConfirmationModal.vue'
  
  const router = useRouter()
  const authStore = useAuthStore()
  const bookingsStore = useBookingsStore()
  
  const loading = ref(true)
  const currentDate = ref(new Date())
  const users = ref([])
  const selectedStatus = ref('')
  const selectedBooking = ref(null)
  const showDeleteConfirm = ref(false)
  let bookingsSubscription = null
  
  // Week navigation
  function previousWeek() {
    currentDate.value = new Date(currentDate.value.setDate(currentDate.value.getDate() - 7))
    refreshBookings()
  }
  
  function nextWeek() {
    currentDate.value = new Date(currentDate.value.setDate(currentDate.value.getDate() + 7))
    refreshBookings()
  }
  
  function goToToday() {
    currentDate.value = new Date()
    refreshBookings()
  }
  
  function goToNewBooking() {
    router.push({ 
      name: 'bookings',
      query: { new: 'true' }
    })
  }
  
  function handleStatusChange(status) {
    selectedStatus.value = status
  }
  
  // Computed properties for week view
  const weekDates = computed(() => {
    const dates = []
    const startDate = new Date(currentDate.value)
    startDate.setDate(startDate.getDate() - startDate.getDay() + 1) // Start from Monday
    
    for (let i = 0; i < 5; i++) { // Monday to Friday
      const date = new Date(startDate)
      date.setDate(date.getDate() + i)
      dates.push(date)
    }
    
    return dates
  })
  
  // Booking actions
  function showBookingDetails(booking) {
    selectedBooking.value = booking
  }
  
  function editBooking(booking) {
    router.push({ 
      name: 'bookings',
      query: { edit: booking.id }
    })
  }
  
  function addNewBooking(bookingData) {
    // Format the date if it's a Date object
    const formattedDate = bookingData.date instanceof Date 
      ? bookingData.date.toISOString().split('T')[0]
      : bookingData.date;
    
    // Navigate to bookings page with pre-filled data
    router.push({ 
      name: 'bookings',
      query: { 
        new: 'true',
        date: formattedDate,
        consultant_id: bookingData.consultant_id
      }
    })
  }
  
  function deleteBookingConfirm(booking) {
    selectedBooking.value = booking
    showDeleteConfirm.value = true
  }
  
  async function deleteBooking() {
    if (!selectedBooking.value) return
    
    try {
      await bookingsStore.deleteBooking(selectedBooking.value.id)
      showDeleteConfirm.value = false
      selectedBooking.value = null
    } catch (error) {
      console.error('Error deleting booking:', error)
    }
  }
  
  // Fetch all users for the schedule
  async function fetchUsers() {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('id, name, role')
        .eq('role', 'consultant')
      
      if (error) throw error
      
      users.value = data
    } catch (error) {
      console.error('Error fetching users:', error)
    }
  }
  
  // Fetch bookings for current week
  async function fetchWeekBookings() {
    loading.value = true
    
    try {
      const startDate = weekDates.value[0].toISOString().split('T')[0]
      const endDate = weekDates.value[4].toISOString().split('T')[0]
      
      const filters = {
        startDate,
        endDate
      }
      
      // For consultants, only show their own bookings
      if (authStore.isConsultant && !authStore.isAdmin && !authStore.isManager) {
        filters.consultantId = authStore.user.id
      }
      
      await bookingsStore.fetchBookings(filters)
      
      // Debug: Log the bookings loaded
      console.log('Bookings loaded in Calendar:', bookingsStore.bookings)
    } catch (error) {
      console.error('Error fetching bookings:', error)
    } finally {
      loading.value = false
    }
  }
  
  // Refresh bookings when filters change
  function refreshBookings() {
    fetchWeekBookings()
  }
  
  // Watch for filter changes
  watch([selectedStatus], refreshBookings)
  
  onMounted(async () => {
    // Initialize auth before fetching data
    if (!authStore.isAuthenticated) {
      await authStore.initialize()
    }
    
    // Fetch data
    await Promise.all([
      fetchUsers(),
      fetchWeekBookings()
    ])
    
    // Subscribe to real-time updates
    bookingsSubscription = bookingsStore.subscribeToBookings()
  })
  
  onUnmounted(() => {
    // Clean up the subscription when component is destroyed
    if (bookingsSubscription) {
      bookingsSubscription.unsubscribe()
    }
  })
  </script>