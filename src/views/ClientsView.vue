<template>
  <div class="p-8 max-w-7xl mx-auto">
    <h1 class="mb-6 text-2xl font-bold text-gray-800">Manage Clients</h1>
    
    <div class="flex justify-between items-center mb-6 flex-wrap gap-4">
      <button @click="showAddClientForm = true" class="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors text-sm">
        Add New Client
      </button>
      
      <div class="flex-grow max-w-md">
        <input 
          type="text" 
          v-model="searchQuery" 
          placeholder="Search clients..." 
          class="w-full p-2 border border-gray-300 rounded text-sm"
        />
      </div>
    </div>
    
    <div v-if="loading" class="py-8 text-center text-gray-600">Loading clients...</div>
    
    <div v-else>
      <div v-if="filteredClients.length === 0" class="py-8 text-center text-gray-600">
        No clients found matching your search.
      </div>
      
      <div v-else class="bg-white rounded-lg shadow overflow-x-auto">
        <table class="w-full border-collapse">
          <thead>
            <tr>
              <th @click="sortBy('name')" class="p-3 text-left font-semibold text-gray-600 bg-gray-100 border-b border-gray-200 cursor-pointer hover:bg-gray-50">
                Company {{ getSortIcon('name') }}
              </th>
              <th @click="sortBy('contact_person')" class="p-3 text-left font-semibold text-gray-600 bg-gray-100 border-b border-gray-200 cursor-pointer hover:bg-gray-50">
                Contact {{ getSortIcon('contact_person') }}
              </th>
              <th @click="sortBy('email')" class="p-3 text-left font-semibold text-gray-600 bg-gray-100 border-b border-gray-200 cursor-pointer hover:bg-gray-50">
                Email {{ getSortIcon('email') }}
              </th>
              <th @click="sortBy('phone')" class="p-3 text-left font-semibold text-gray-600 bg-gray-100 border-b border-gray-200 cursor-pointer hover:bg-gray-50">
                Phone {{ getSortIcon('phone') }}
              </th>
              <th @click="sortBy('city')" class="p-3 text-left font-semibold text-gray-600 bg-gray-100 border-b border-gray-200 cursor-pointer hover:bg-gray-50">
                City {{ getSortIcon('city') }}
              </th>
              <th @click="sortBy('created_at')" class="p-3 text-left font-semibold text-gray-600 bg-gray-100 border-b border-gray-200 cursor-pointer hover:bg-gray-50">
                Created {{ getSortIcon('created_at') }}
              </th>
              <th class="p-3 text-left font-semibold text-gray-600 bg-gray-100 border-b border-gray-200">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="client in sortedClients" :key="client.id" class="border-b border-gray-100 hover:bg-gray-50">
              <td class="p-3">{{ client.name }}</td>
              <td class="p-3">{{ client.contact_person }}</td>
              <td class="p-3">{{ client.email }}</td>
              <td class="p-3">{{ client.phone || 'N/A' }}</td>
              <td class="p-3">{{ client.city || 'N/A' }}</td>
              <td class="p-3">{{ formatDateTime(client.created_at) }}</td>
              <td class="p-3 flex gap-2">
                <button @click="editClient(client)" class="px-3 py-1 bg-green-500 text-white text-xs rounded hover:bg-green-600 transition-colors">
                  Edit
                </button>
                <button 
                  @click="deleteClientConfirm(client)" 
                  class="px-3 py-1 bg-red-500 text-white text-xs rounded hover:bg-red-600 transition-colors"
                >
                  Delete
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
    
    <!-- Add/Edit Client Modal -->
    <div v-if="showAddClientForm || editClientData" class="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div class="bg-white p-8 rounded-lg max-w-lg w-[90%] relative">
        <span class="absolute top-4 right-4 text-2xl cursor-pointer text-gray-600" @click="closeClientForm">&times;</span>
        
        <h3 class="text-xl font-semibold mb-2">{{ editClientData ? 'Edit Client' : 'Add New Client' }}</h3>
        
        <form @submit.prevent="saveClient" class="mt-6">
          <div class="mb-4">
            <label for="client-name" class="block mb-2 font-medium">Company Name:</label>
            <input 
              type="text" 
              id="client-name" 
              v-model="clientForm.name" 
              required
              class="w-full p-3 border border-gray-300 rounded text-base"
            />
          </div>
          
          <div class="mb-4">
            <label for="client-contact" class="block mb-2 font-medium">Contact Person:</label>
            <input 
              type="text" 
              id="client-contact" 
              v-model="clientForm.contact_person" 
              required
              class="w-full p-3 border border-gray-300 rounded text-base"
            />
          </div>
          
          <div class="mb-4">
            <label for="client-email" class="block mb-2 font-medium">Email:</label>
            <input 
              type="email" 
              id="client-email" 
              v-model="clientForm.email" 
              required
              class="w-full p-3 border border-gray-300 rounded text-base"
            />
          </div>
          
          <div class="mb-4">
            <label for="client-phone" class="block mb-2 font-medium">Phone:</label>
            <input 
              type="tel" 
              id="client-phone" 
              v-model="clientForm.phone" 
              class="w-full p-3 border border-gray-300 rounded text-base"
            />
          </div>
          
          <div class="mb-4">
            <label for="client-address" class="block mb-2 font-medium">Address:</label>
            <input 
              type="text" 
              id="client-address" 
              v-model="clientForm.address" 
              class="w-full p-3 border border-gray-300 rounded text-base"
            />
          </div>
          
          <div class="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label for="client-city" class="block mb-2 font-medium">City:</label>
              <input 
                type="text" 
                id="client-city" 
                v-model="clientForm.city" 
                class="w-full p-3 border border-gray-300 rounded text-base"
              />
            </div>
            
            <div>
              <label for="client-postal" class="block mb-2 font-medium">Postal Code:</label>
              <input 
                type="text" 
                id="client-postal" 
                v-model="clientForm.postal_code" 
                class="w-full p-3 border border-gray-300 rounded text-base"
              />
            </div>
          </div>
          
          <div class="mb-4">
            <label for="client-country" class="block mb-2 font-medium">Country:</label>
            <input 
              type="text" 
              id="client-country" 
              v-model="clientForm.country" 
              class="w-full p-3 border border-gray-300 rounded text-base"
            />
          </div>
          
          <div class="mb-4">
            <label for="client-notes" class="block mb-2 font-medium">Notes:</label>
            <textarea 
              id="client-notes" 
              v-model="clientForm.notes" 
              rows="3"
              class="w-full p-3 border border-gray-300 rounded text-base"
            ></textarea>
          </div>
          
          <div class="mb-4">
            <label class="flex items-center">
              <input 
                type="checkbox" 
                v-model="clientForm.active" 
                class="mr-2"
              />
              <span class="font-medium">Active Client</span>
            </label>
          </div>
          
          <div v-if="formError" class="my-4 p-2 bg-red-50 text-red-600 text-sm rounded">
            {{ formError }}
          </div>
          
          <div class="flex gap-4 mt-6">
            <button 
              type="submit" 
              class="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors text-sm disabled:opacity-70"
              :disabled="formSubmitting"
            >
              {{ formSubmitting ? 'Saving...' : 'Save Client' }}
            </button>
            <button 
              type="button" 
              @click="closeClientForm" 
              class="px-4 py-2 bg-gray-100 text-gray-800 rounded hover:bg-gray-200 transition-colors text-sm disabled:opacity-70"
              :disabled="formSubmitting"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
    
    <!-- Confirmation Modal -->
    <div v-if="showDeleteConfirm" class="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div class="bg-white p-8 rounded-lg max-w-lg w-[90%]">
        <h3 class="text-xl font-semibold mb-2">Confirm Deletion</h3>
        <p class="mb-6">
          Are you sure you want to delete the client <strong>{{ clientToDelete?.name }}</strong>?
          This action cannot be undone.
        </p>
        
        <div class="flex justify-end gap-4">
          <button 
            @click="deleteClient" 
            class="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors text-sm disabled:opacity-70"
            :disabled="deleteLoading"
          >
            {{ deleteLoading ? 'Deleting...' : 'Yes, Delete' }}
          </button>
          <button 
            @click="showDeleteConfirm = false" 
            class="px-4 py-2 bg-gray-100 text-gray-800 rounded hover:bg-gray-200 transition-colors text-sm disabled:opacity-70"
            :disabled="deleteLoading"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { supabase } from '../lib/supabase'
import { useAuthStore } from '../stores/auth'

// State
const loading = ref(true)
const clients = ref([])
const searchQuery = ref('')
const sortField = ref('name')
const sortDirection = ref('asc')
const authStore = useAuthStore()

// Form state
const showAddClientForm = ref(false)
const editClientData = ref(null)
const clientForm = ref({
  name: '',
  contact_person: '',
  email: '',
  phone: '',
  address: '',
  city: '',
  postal_code: '',
  country: '',
  notes: '',
  active: true
})
const formError = ref('')
const formSubmitting = ref(false)

// Delete state
const showDeleteConfirm = ref(false)
const clientToDelete = ref(null)
const deleteLoading = ref(false)

// Computed properties
const filteredClients = computed(() => {
  if (!searchQuery.value) return clients.value
  
  const query = searchQuery.value.toLowerCase()
  
  return clients.value.filter(client => 
    client.name.toLowerCase().includes(query) ||
    client.contact_person.toLowerCase().includes(query) ||
    client.email.toLowerCase().includes(query) ||
    (client.city && client.city.toLowerCase().includes(query))
  )
})

const sortedClients = computed(() => {
  const field = sortField.value
  const direction = sortDirection.value
  
  return [...filteredClients.value].sort((a, b) => {
    const valueA = a[field]
    const valueB = b[field]
    
    // Handle null/undefined values
    if (valueA === null || valueA === undefined) return direction === 'asc' ? -1 : 1
    if (valueB === null || valueB === undefined) return direction === 'asc' ? 1 : -1
    
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

// Format date and time
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

// Client CRUD operations
function editClient(client) {
  editClientData.value = client
  
  // Initialize form with client data
  clientForm.value = {
    name: client.name,
    contact_person: client.contact_person,
    email: client.email,
    phone: client.phone || '',
    address: client.address || '',
    city: client.city || '',
    postal_code: client.postal_code || '',
    country: client.country || '',
    notes: client.notes || '',
    active: client.active
  }
}

function closeClientForm() {
  showAddClientForm.value = false
  editClientData.value = null
  formError.value = ''
  resetForm()
}

function resetForm() {
  clientForm.value = {
    name: '',
    contact_person: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    postal_code: '',
    country: '',
    notes: '',
    active: true
  }
}

async function saveClient() {
  formError.value = ''
  formSubmitting.value = true
  
  try {
    if (editClientData.value) {
      // Update existing client
      const { error } = await supabase
        .from('clients')
        .update(clientForm.value)
        .eq('id', editClientData.value.id)
      
      if (error) throw error
      
      // Update the client in the local list
      const index = clients.value.findIndex(c => c.id === editClientData.value.id)
      if (index !== -1) {
        clients.value[index] = {
          ...clients.value[index],
          ...clientForm.value
        }
      }
    } else {
      // Create new client
      const { data, error } = await supabase
        .from('clients')
        .insert([{
          ...clientForm.value,
          created_by: authStore.user.id
        }])
        .select()
      
      if (error) throw error
      
      // Add the new client to the local list
      if (data) {
        clients.value.push(data[0])
      }
    }
    
    closeClientForm()
  } catch (error) {
    console.error('Error saving client:', error)
    formError.value = error.message || 'Failed to save client. Please try again.'
  } finally {
    formSubmitting.value = false
  }
}

function deleteClientConfirm(client) {
  clientToDelete.value = client
  showDeleteConfirm.value = true
}

async function deleteClient() {
  if (!clientToDelete.value) return
  
  deleteLoading.value = true
  
  try {
    const { error } = await supabase
      .from('clients')
      .delete()
      .eq('id', clientToDelete.value.id)
    
    if (error) throw error
    
    // Remove client from local list
    clients.value = clients.value.filter(c => c.id !== clientToDelete.value.id)
    
    showDeleteConfirm.value = false
    clientToDelete.value = null
  } catch (error) {
    console.error('Error deleting client:', error)
    // Show error message
  } finally {
    deleteLoading.value = false
  }
}

// Fetch clients data
async function fetchClients() {
  loading.value = true
  
  try {
    const { data, error } = await supabase
      .from('clients')
      .select('*')
      .order('name')
    
    if (error) throw error
    
    clients.value = data
  } catch (error) {
    console.error('Error fetching clients:', error)
  } finally {
    loading.value = false
  }
}

// Initialize component
onMounted(async () => {
  // Initialize auth before fetching data
  if (!authStore.isAuthenticated) {
    await authStore.initialize()
  }
  await fetchClients()
})
</script> 