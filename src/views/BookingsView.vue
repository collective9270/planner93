<template>
    <div class="bookings-view">
      <h1>Manage Bookings</h1>
      
      <div class="bookings-controls">
        <button @click="showAddBookingForm = true" class="btn add-btn">
          Add New Booking
        </button>
        
        <div class="filters">
          <div class="filter-group">
            <label for="consultant-filter">Consultant:</label>
            <select id="consultant-filter" v-model="filters.consultantId">
              <option value="">All Consultants</option>
              <option v-for="user in users" :key="user.id" :value="user.id">
                {{ user.name }}
              </option>
            </select>
          </div>
          
          <div class="filter-group">
            <label for="status-filter">Status:</label>
            <select id="status-filter" v-model="filters.status">
              <option value="">All Statuses</option>
              <option value="geboekt">Geboekt</option>
              <option value="optie">Optie</option>
              <option value="stand-by">Stand-by</option>
              <option value="afwezig">Afwezig</option>
            </select>
          </div>
          
          <div class="filter-group">
            <label for="client-filter">Client:</label>
            <input 
              type="text" 
              id="client-filter" 
              v-model="filters.client" 
              placeholder="Filter by client..."
            />
          </div>
          
          <div class="filter-group" v-if="projects.length > 0">
            <label for="project-filter">Project:</label>
            <select id="project-filter" v-model="filters.projectId">
              <option value="">All Projects</option>
              <option v-for="project in projects" :key="project.id" :value="project.id">
                {{ project.name }}
              </option>
            </select>
          </div>
          
          <div class="filter-group date-filter">
            <label for="date-filter">Date Range:</label>
            <div class="date-inputs">
              <input 
                type="date" 
                id="start-date" 
                v-model="filters.startDate"
              />
              <span>to</span>
              <input 
                type="date" 
                id="end-date" 
                v-model="filters.endDate"
              />
            </div>
          </div>
        </div>
      </div>
      
      <div v-if="loading" class="loading">Loading bookings...</div>
      
      <div v-else>
        <div v-if="filteredBookings.length === 0" class="no-data">
          No bookings found with the current filters.
        </div>
        
        <div v-else class="bookings-table-container">
          <table class="bookings-table">
            <thead>
              <tr>
                <th @click="sortBy('date')" class="sortable-header">
                  Date {{ getSortIcon('date') }}
                </th>
                <th @click="sortBy('users.name')" class="sortable-header">
                  Consultant {{ getSortIcon('users.name') }}
                </th>
                <th @click="sortBy('client')" class="sortable-header">
                  Client {{ getSortIcon('client') }}
                </th>
                <th @click="sortBy('project_name')" class="sortable-header">
                  Project {{ getSortIcon('project_name') }}
                </th>
                <th @click="sortBy('status')" class="sortable-header">
                  Status {{ getSortIcon('status') }}
                </th>
                <th @click="sortBy('created_at')" class="sortable-header">
                  Created {{ getSortIcon('created_at') }}
                </th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="booking in sortedBookings" :key="booking.id">
                <td>{{ formatDate(booking.date) }}</td>
                <td>{{ booking.users?.name || 'Unknown' }}</td>
                <td>{{ booking.client || getClientName(booking.client_id) }}</td>
                <td>{{ booking.project_name || getProjectName(booking.project_id) || '-' }}</td>
                <td>
                  <span :class="'status ' + booking.status">
                    {{ booking.status }}
                  </span>
                </td>
                <td>{{ formatDateTime(booking.created_at) }}</td>
                <td class="actions-cell">
                  <button 
                    @click="editBooking(booking)" 
                    class="action-btn edit-btn"
                    v-if="canEditBooking(booking)"
                  >
                    Edit
                  </button>
                  <button 
                    @click="deleteBookingConfirm(booking)" 
                    class="action-btn delete-btn"
                    v-if="canDeleteBooking(booking)"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      
      <!-- Add/Edit Booking Modal -->
      <div v-if="showAddBookingForm || editBookingData" class="modal">
        <div class="modal-content">
          <span class="close-button" @click="closeBookingForm">&times;</span>
          
          <h3>{{ editBookingData ? 'Edit Booking' : 'Add New Booking' }}</h3>
          
          <form @submit.prevent="saveBooking" class="booking-form">
            <div class="form-group">
              <label for="booking-date">Date:</label>
              <input 
                type="date" 
                id="booking-date" 
                v-model="bookingForm.date" 
                required
              />
            </div>
            
            <div class="form-group">
              <label for="booking-consultant">Consultant:</label>
              <select 
                id="booking-consultant" 
                v-model="bookingForm.consultant_id"
                required
                :disabled="authStore.isConsultant && !authStore.isAdmin && !authStore.isManager"
              >
                <option v-for="user in users" :key="user.id" :value="user.id">
                  {{ user.name }}
                </option>
              </select>
            </div>
            
            <div class="form-group">
              <label for="booking-client">Client:</label>
              <select 
                id="booking-client" 
                v-model="bookingForm.client_id" 
                required
                @change="handleClientChange"
              >
                <option value="">Select a client</option>
                <option v-for="client in clients" :key="client.id" :value="client.id">
                  {{ client.name }}
                </option>
              </select>
            </div>
            
            <div class="form-group" v-if="bookingForm.client_id && clientProjects.length > 0">
              <label for="booking-project">Project (Optional):</label>
              <select 
                id="booking-project" 
                v-model="bookingForm.project_id"
              >
                <option value="">No Project</option>
                <option v-for="project in clientProjects" :key="project.id" :value="project.id">
                  {{ project.name }}
                </option>
              </select>
            </div>
            
            <div class="form-group">
              <label for="booking-description">Description (Optional):</label>
              <input 
                type="text" 
                id="booking-description" 
                v-model="bookingForm.description" 
                placeholder="Additional details about this booking"
              />
            </div>
            
            <div class="form-group">
              <label for="booking-status">Status:</label>
              <select id="booking-status" v-model="bookingForm.status" required>
                <option value="geboekt">Geboekt</option>
                <option value="optie">Optie</option>
                <option value="stand-by">Stand-by</option>
                <option value="afwezig">Afwezig</option>
              </select>
            </div>
            
            <div v-if="formError" class="error-message">
              {{ formError }}
            </div>
            
            <div class="form-actions">
              <button type="submit" class="btn save-btn" :disabled="formSubmitting">
                {{ formSubmitting ? 'Saving...' : 'Save Booking' }}
              </button>
              <button type="button" @click="closeBookingForm" class="btn" :disabled="formSubmitting">
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
      
      <!-- Confirmation Modal -->
      <div v-if="showDeleteConfirm" class="modal">
        <div class="modal-content">
          <h3>Confirm Deletion</h3>
          <p>Are you sure you want to delete this booking?</p>
          
          <div class="modal-actions">
            <button @click="deleteBooking" class="btn delete-btn" :disabled="deleteLoading">
              {{ deleteLoading ? 'Deleting...' : 'Yes, Delete' }}
            </button>
            <button @click="showDeleteConfirm = false" class="btn" :disabled="deleteLoading">
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
  import { useRoute } from 'vue-router'
  import { useAuthStore } from '../stores/auth'
  import { useBookingsStore } from '../stores/bookings'
  import { useClientsStore } from '../stores/clients'
  import { useProjectsStore } from '../stores/projects'
  import { supabase } from '../lib/supabase'
  
  const route = useRoute()
  const authStore = useAuthStore()
  const bookingsStore = useBookingsStore()
  const clientsStore = useClientsStore()
  const projectsStore = useProjectsStore()
  
  // State
  const loading = ref(true)
  const users = ref([])
  const clients = ref([])
  const projects = ref([])
  const clientProjects = ref([])
  const filters = ref({
    consultantId: '',
    status: '',
    client: '',
    startDate: '',
    endDate: '',
    projectId: ''
  })
  const showAddBookingForm = ref(false)
  const editBookingData = ref(null)
  const bookingForm = ref({
    date: '',
    consultant_id: '',
    client_id: '',
    project_id: '',
    client: '',
    status: 'geboekt'
  })
  const formError = ref('')
  const formSubmitting = ref(false)
  const showDeleteConfirm = ref(false)
  const deleteBookingId = ref(null)
  const deleteLoading = ref(false)
  const sortField = ref('date')
  const sortDirection = ref('asc')
  let bookingsSubscription = null
  
  // Computed properties
  const filteredBookings = computed(() => {
    return bookingsStore.bookings.filter(booking => {
      // Filter by consultant
      if (filters.value.consultantId && booking.consultant_id !== filters.value.consultantId) {
        return false
      }
      
      // Filter by status
      if (filters.value.status && booking.status !== filters.value.status) {
        return false
      }
      
      // Filter by client
      if (filters.value.client && !booking.client?.toLowerCase().includes(filters.value.client.toLowerCase())) {
        return false
      }
      
      // Filter by date range
      if (filters.value.startDate && new Date(booking.date) < new Date(filters.value.startDate)) {
        return false
      }
      
      if (filters.value.endDate && new Date(booking.date) > new Date(filters.value.endDate)) {
        return false
      }
      
      // Filter by project
      if (filters.value.projectId && booking.project_id !== filters.value.projectId) {
        return false
      }
      
      return true
    })
  })
  
  const sortedBookings = computed(() => {
    const field = sortField.value
    const direction = sortDirection.value
    
    return [...filteredBookings.value].sort((a, b) => {
      let valueA, valueB
      
      // Handle nested fields (like users.name)
      if (field.includes('.')) {
        const [obj, prop] = field.split('.')
        valueA = a[obj] ? a[obj][prop] : ''
        valueB = b[obj] ? b[obj][prop] : ''
      } else {
        valueA = a[field]
        valueB = b[field]
      }
      
      // Handle null/undefined values
      if (valueA === null || valueA === undefined) valueA = ''
      if (valueB === null || valueB === undefined) valueB = ''
      
      // Compare based on data type
      if (typeof valueA === 'string') {
        const result = valueA.localeCompare(valueB)
        return direction === 'asc' ? result : -result
      } else {
        const result = valueA < valueB ? -1 : valueA > valueB ? 1 : 0
        return direction === 'asc' ? result : -result
      }
    })
  })
  
  // Methods
  function sortBy(field) {
    if (sortField.value === field) {
      // Toggle direction if same field
      sortDirection.value = sortDirection.value === 'asc' ? 'desc' : 'asc'
    } else {
      // New field, default to ascending
      sortField.value = field
      sortDirection.value = 'asc'
    }
  }
  
  function getSortIcon(field) {
    if (sortField.value !== field) return ''
    return sortDirection.value === 'asc' ? '▲' : '▼'
  }
  
  // Helper functions for getting names from IDs
  function getClientName(clientId) {
    if (!clientId) return 'N/A';
    const client = clients.value.find(c => c.id === clientId);
    return client ? client.name : 'Unknown Client';
  }
  
  function getProjectName(projectId) {
    if (!projectId) return null;
    const project = projects.value.find(p => p.id === projectId);
    return project ? project.name : 'Unknown Project';
  }
  
  // Date formatting
  function formatDate(dateString) {
    const options = { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' }
    return new Date(dateString).toLocaleDateString(undefined, options)
  }
  
  function formatDateTime(dateTimeString) {
    const options = { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }
    return new Date(dateTimeString).toLocaleString(undefined, options)
  }
  
  // Booking CRUD operations
  function editBooking(booking) {
    editBookingData.value = booking
    
    // Initialize form with booking data
    bookingForm.value = {
      date: booking.date,
      consultant_id: booking.consultant_id,
      client_id: booking.client_id || '',
      project_id: booking.project_id || '',
      status: booking.status,
      description: booking.description || ''
    }
    
    // If we have a client_id, trigger the client change handler to load projects
    if (booking.client_id) {
      handleClientChange();
    }
  }
  
  function closeBookingForm() {
    showAddBookingForm.value = false
    editBookingData.value = null
    formError.value = ''
    resetForm()
  }
  
  function resetForm() {
    bookingForm.value = {
      date: '',
      consultant_id: authStore.isConsultant ? authStore.user.id : '',
      client_id: '',
      project_id: '',
      status: 'geboekt',
      description: ''
    }
    
    // Clear client projects when resetting form
    clientProjects.value = [];
  }
  
  function handleClientChange() {
    // Reset project selection when client changes
    bookingForm.value.project_id = '';
    
    // Filter projects for the selected client
    if (bookingForm.value.client_id) {
      clientProjects.value = projects.value.filter(
        project => project.client_id === bookingForm.value.client_id
      );
      console.log('Filtered projects for client:', bookingForm.value.client_id, clientProjects.value);
    } else {
      clientProjects.value = [];
    }
  }
  
  async function saveBooking() {
    formError.value = '';
    formSubmitting.value = true;
    
    try {
      // Create a copy of the form data
      const bookingData = { ...bookingForm.value };
      
      // Validate required fields
      if (!bookingData.consultant_id) {
        formError.value = 'Consultant is required';
        return;
      }
      
      if (!bookingData.date) {
        formError.value = 'Date is required';
        return;
      }
      
      if (!bookingData.client_id) {
        formError.value = 'Client is required';
        return;
      }
      
      // Find client name from the selected client_id
      if (bookingData.client_id) {
        const selectedClient = clients.value.find(c => c.id === bookingData.client_id);
        if (selectedClient) {
          bookingData.client = selectedClient.name;
        }
      }
      
      // Remove any empty string values that should be null for UUID fields
      Object.keys(bookingData).forEach(key => {
        // If it ends with _id and is empty string, set to null
        if (key.endsWith('_id') && bookingData[key] === '') {
          delete bookingData[key]; // Just remove the property entirely
        }
      });
      
      console.log('Saving booking with data:', bookingData);
      
      if (editBookingData.value) {
        await bookingsStore.updateBooking(editBookingData.value.id, bookingData);
      } else {
        await bookingsStore.createBooking(bookingData);
      }
      
      closeBookingForm();
    } catch (error) {
      console.error('Error saving booking:', error);
      formError.value = error.message || 'An error occurred while saving the booking';
    } finally {
      formSubmitting.value = false;
    }
  }
  
  function deleteBookingConfirm(booking) {
    deleteBookingId.value = booking.id
    showDeleteConfirm.value = true
  }
  
  async function deleteBooking() {
    if (!deleteBookingId.value) return
    
    deleteLoading.value = true
    
    try {
      await bookingsStore.deleteBooking(deleteBookingId.value)
      showDeleteConfirm.value = false
      deleteBookingId.value = null
    } catch (error) {
      console.error('Error deleting booking:', error)
      // Show error message
    } finally {
      deleteLoading.value = false
    }
  }
  
  // Permission checks
  function canEditBooking(booking) {
    // Admins can edit any booking
    if (authStore.isAdmin) return true
    
    // Managers can edit any booking
    if (authStore.isManager) return true
    
    // Consultants can only edit their own bookings
    if (authStore.isConsultant) {
      return booking.consultant_id === authStore.user.id
    }
    
    return false
  }
  
  function canDeleteBooking(booking) {
    // Same permissions as edit for now
    return canEditBooking(booking)
  }
  
  // Data fetching
  async function fetchUsers() {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('id, name, email, role')
        .order('name')
      
      if (error) throw error
      
      users.value = data
    } catch (error) {
      console.error('Error fetching users:', error)
    }
  }
  
  async function fetchClients() {
    try {
      await clientsStore.fetchClients();
      clients.value = clientsStore.clients;
      console.log('Fetched clients:', clients.value);
    } catch (error) {
      console.error('Error fetching clients:', error);
      clients.value = [];
    }
  }
  
  async function fetchProjects() {
    try {
      // Try to fetch projects, but handle the case where the table might not exist yet
      try {
        await projectsStore.fetchProjects();
        projects.value = projectsStore.projects;
        console.log('Fetched projects:', projects.value);
      } catch (projectsError) {
        console.error('Error fetching projects (table might not exist yet):', projectsError);
        projects.value = [];
      }
    } catch (error) {
      console.error('Error in fetchProjects:', error);
      projects.value = [];
    }
  }
  
  async function fetchClientProjects() {
    try {
      // This table doesn't exist yet, so just set an empty array
      clientProjects.value = [];
      
      // Once you have the projects table created, you can use:
      // await projectsStore.fetchProjects();
      // clientProjects.value = projectsStore.projects.filter(p => p.client_id === selectedClientId);
    } catch (error) {
      console.error('Error fetching client projects:', error)
    }
  }
  
  async function fetchBookings() {
    loading.value = true
    
    try {
      let fetchFilters = {}
      
      // For consultants, only show their own bookings
      if (authStore.isConsultant && !authStore.isAdmin && !authStore.isManager) {
        fetchFilters.consultantId = authStore.user.id
      }
      
      await bookingsStore.fetchBookings(fetchFilters)
    } catch (error) {
      console.error('Error fetching bookings:', error)
    } finally {
      loading.value = false
    }
  }
  
  // Check for edit query parameter
  function checkForEditParam() {
    const editId = route.query.edit
    
    if (editId) {
      const booking = bookingsStore.bookings.find(b => b.id === editId)
      if (booking) {
        editBooking(booking)
      }
    }
  }
  
  // Initialize component
  onMounted(async () => {
    // Initialize auth store if needed
    if (!authStore.isAuthenticated) {
      await authStore.initialize()
    }
    
    // Set default consultant for consultants
    if (authStore.isConsultant) {
      bookingForm.value.consultant_id = authStore.user.id
    }
    
    // Fetch data with error handling for each call
    loading.value = true;
    try {
      // Fetch users first as it's critical
      await fetchUsers();
      
      // Then try to fetch other data, but don't block on errors
      try {
        await fetchClients();
      } catch (error) {
        console.error('Error fetching clients:', error);
      }
      
      try {
        await fetchProjects();
      } catch (error) {
        console.error('Error fetching projects:', error);
      }
      
      try {
        await fetchClientProjects();
      } catch (error) {
        console.error('Error fetching client projects:', error);
      }
      
      // Finally fetch bookings
      try {
        await fetchBookings();
      } catch (error) {
        console.error('Error fetching bookings:', error);
      }
      
      // Subscribe to real-time updates
      bookingsSubscription = bookingsStore.subscribeToBookings();
      
      // Check for edit parameter
      checkForEditParam();
    } catch (error) {
      console.error('Error during component initialization:', error);
    } finally {
      loading.value = false;
    }
  })
  
  // Clean up
  onUnmounted(() => {
    if (bookingsSubscription) {
      bookingsSubscription.unsubscribe()
    }
  })
  
  // Watch for filter changes
  watch(filters, () => {
    // No need to re-fetch from server, we'll filter client-side
    // This makes the UI more responsive
  }, { deep: true })
  </script>
  
  <style scoped>
  .bookings-view {
    padding: 2rem;
    max-width: 1200px;
    margin: 0 auto;
  }
  
  h1 {
    margin-bottom: 1.5rem;
    color: #333;
  }
  
  .bookings-controls {
    display: flex;
    justify-content: space-between;
    margin-bottom: 1.5rem;
    flex-wrap: wrap;
    gap: 1rem;
  }
  
  .btn {
    padding: 0.5rem 1rem;
    border-radius: 4px;
    cursor: pointer;
    border: none;
    font-size: 0.875rem;
    background-color: #f5f5f5;
    color: #333;
  }
  
  .add-btn {
    background-color: #4CAF50;
    color: white;
  }
  
  .filters {
    display: flex;
    gap: 1rem;
    flex-wrap: wrap;
  }
  
  .filter-group {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }
  
  .filter-group select,
  .filter-group input {
    padding: 0.5rem;
    border: 1px solid #ddd;
    border-radius: 4px;
  }
  
  .date-filter {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .date-inputs {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }
  
  .loading, .no-data {
    padding: 2rem;
    text-align: center;
    color: #666;
  }
  
  .bookings-table-container {
    background-color: white;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    overflow-x: auto;
  }
  
  .bookings-table {
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
    background-color: #f9f9f9;
  }
  
  .sortable-header {
    cursor: pointer;
    position: relative;
  }
  
  .sortable-header:hover {
    background-color: #f1f1f1;
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
  
  .actions-cell {
    display: flex;
    gap: 0.5rem;
  }
  
  .action-btn {
    padding: 0.25rem 0.5rem;
    border-radius: 4px;
    border: none;
    cursor: pointer;
    font-size: 0.75rem;
  }
  
  .edit-btn {
    background-color: #4CAF50;
    color: white;
  }
  
  .delete-btn {
    background-color: #f44336;
    color: white;
  }
  
  /* Modal styles */
  .modal {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
  }
  
  .modal-content {
    background-color: white;
    padding: 2rem;
    border-radius: 8px;
    max-width: 500px;
    width: 90%;
    position: relative;
  }
  
  .close-button {
    position: absolute;
    top: 1rem;
    right: 1rem;
    font-size: 1.5rem;
    cursor: pointer;
    color: #666;
  }
  
  .booking-form {
    margin-top: 1.5rem;
  }
  
  .form-group {
    margin-bottom: 1rem;
  }
  
  .form-group label {
    display: block;
    margin-bottom: 0.5rem;
    font-weight: 500;
  }
  
  .form-group input,
  .form-group select {
    width: 100%;
    padding: 0.75rem;
    border: 1px solid #ddd;
    border-radius: 4px;
    font-size: 1rem;
  }
  
  .error-message {
    color: #f44336;
    margin: 1rem 0;
    font-size: 0.875rem;
  }
  
  .form-actions {
    display: flex;
    gap: 1rem;
    margin-top: 1.5rem;
  }
  
  .save-btn {
    background-color: #4CAF50;
    color: white;
  }
  </style>