<template>
    <div class="dashboard">
      <h1>Dashboard</h1>
      
      <div v-if="loading" class="loading">Loading dashboard data...</div>
      
      <div v-else>
        <div class="dashboard-header">
          <div class="welcome-message">
            <h2>Welcome, {{ authStore.userDetails?.name || 'User' }}</h2>
            <p>Role: {{ authStore.userDetails?.role || 'Unknown' }}</p>
          </div>
          
          <div class="action-buttons">
            <router-link to="/calendar" class="btn">View Calendar</router-link>
            <router-link to="/bookings" class="btn">Manage Bookings</router-link>
            <router-link v-if="authStore.isAdmin" to="/users" class="btn">Manage Users</router-link>
          </div>
        </div>
        
        <div class="stats-container">
          <div class="stat-card">
            <h3>Bookings</h3>
            <div class="stat-value">{{ bookingsStore.bookedBookings.length }}</div>
          </div>
          
          <div class="stat-card">
            <h3>Options</h3>
            <div class="stat-value">{{ bookingsStore.optieBookings.length }}</div>
          </div>
          
          <div class="stat-card">
            <h3>Stand-by</h3>
            <div class="stat-value">{{ bookingsStore.standbyBookings.length }}</div>
          </div>
          
          <div class="stat-card">
            <h3>Absent</h3>
            <div class="stat-value">{{ bookingsStore.afwezigBookings.length }}</div>
          </div>
        </div>
        
        <div class="recent-bookings">
          <h3>Recent Bookings</h3>
          <table v-if="bookingsStore.bookings.length > 0">
            <thead>
              <tr>
                <th>Date</th>
                <th>Consultant</th>
                <th>Client</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="booking in recentBookings" :key="booking.id">
                <td>{{ formatDate(booking.date) }}</td>
                <td>{{ booking.users?.name || 'Unknown' }}</td>
                <td>{{ booking.client || 'N/A' }}</td>
                <td>
                  <span :class="'status ' + booking.status">
                    {{ booking.status }}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
          <div v-else class="no-data">No recent bookings found.</div>
        </div>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref, computed, onMounted, onUnmounted } from 'vue'
  import { useAuthStore } from '../stores/auth'
  import { useBookingsStore } from '../stores/bookings'
  
  const authStore = useAuthStore()
  const bookingsStore = useBookingsStore()
  const loading = ref(true)
  let bookingsSubscription = null
  
  // Get today's date and format it for filtering
  const today = new Date()
  const formattedToday = today.toISOString().split('T')[0]
  
  // Get date 30 days in the future
  const futureDate = new Date()
  futureDate.setDate(today.getDate() + 30)
  const formattedFutureDate = futureDate.toISOString().split('T')[0]
  
  // Computed property for recent bookings (limited to 5)
  const recentBookings = computed(() => {
    const sorted = [...bookingsStore.bookings]
      .sort((a, b) => new Date(a.date) - new Date(b.date))
      .filter(booking => new Date(booking.date) >= today)
    
    return sorted.slice(0, 5)
  })
  
  onMounted(async () => {
    try {
      // Fetch bookings for the current user or all bookings for admin
      const filters = {
        startDate: formattedToday,
        endDate: formattedFutureDate
      }
      
      // For consultants, only show their own bookings
      if (authStore.isConsultant) {
        filters.consultantId = authStore.user.id
      }
      
      await bookingsStore.fetchBookings(filters)
      
      // Subscribe to real-time updates
      bookingsSubscription = bookingsStore.subscribeToBookings()
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    } finally {
      loading.value = false
    }
  })
  
  onUnmounted(() => {
    // Clean up the subscription when component is destroyed
    if (bookingsSubscription) {
      bookingsSubscription.unsubscribe()
    }
  })
  
  // Helper function to format date
  function formatDate(dateString) {
    const options = { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' }
    return new Date(dateString).toLocaleDateString(undefined, options)
  }
  </script>
  
  <style scoped>
  .dashboard {
    padding: 2rem;
    max-width: 1200px;
    margin: 0 auto;
  }
  
  h1 {
    margin-bottom: 2rem;
    color: #333;
  }
  
  .loading {
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 2rem;
    font-size: 1.2rem;
    color: #666;
  }
  
  .dashboard-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 2rem;
    padding-bottom: 1rem;
    border-bottom: 1px solid #eee;
  }
  
  .welcome-message h2 {
    margin-bottom: 0.5rem;
  }
  
  .welcome-message p {
    color: #666;
  }
  
  .action-buttons {
    display: flex;
    gap: 1rem;
  }
  
  .btn {
    display: inline-block;
    padding: 0.5rem 1rem;
    background-color: #4CAF50;
    color: white;
    text-decoration: none;
    border-radius: 4px;
    transition: background-color 0.3s;
  }
  
  .btn:hover {
    background-color: #45a049;
  }
  
  .stats-container {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 1rem;
    margin-bottom: 2rem;
  }
  
  .stat-card {
    background-color: white;
    border-radius: 8px;
    padding: 1.5rem;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    text-align: center;
  }
  
  .stat-card h3 {
    margin-bottom: 0.5rem;
    color: #666;
    font-size: 1rem;
  }
  
  .stat-value {
    font-size: 2rem;
    font-weight: bold;
    color: #333;
  }
  
  .recent-bookings {
    background-color: white;
    border-radius: 8px;
    padding: 1.5rem;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }
  
  .recent-bookings h3 {
    margin-bottom: 1rem;
    color: #333;
  }
  
  table {
    width: 100%;
    border-collapse: collapse;
  }
  
  th, td {
    padding: 0.75rem;
    text-align: left;
    border-bottom: 1px solid #eee;
  }
  
  th {
    font-weight: 600;
    color: #666;
  }
  
  .status {
    display: inline-block;
    padding: 0.25rem 0.5rem;
    border-radius: 4px;
    text-transform: capitalize;
  }
  
  .status.geboekt {
    background-color: #d4edda;
    color: #155724;
  }
  
  .status.optie {
    background-color: #fff3cd;
    color: #856404;
  }
  
  .status.stand-by {
    background-color: #d1ecf1;
    color: #0c5460;
  }
  
  .status.afwezig {
    background-color: #f8d7da;
    color: #721c24;
  }
  
  .no-data {
    padding: 1rem 0;
    color: #666;
    text-align: center;
  }

    </style>