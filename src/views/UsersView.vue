<template>
    <div class="p-8 max-w-7xl mx-auto">
      <h1 class="mb-6 text-2xl font-bold text-gray-800">Manage Users</h1>
      
      <div class="flex justify-between items-center mb-6 flex-wrap gap-4">
        <button @click="showAddUserForm = true" class="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors text-sm">
          Add New User
        </button>
        
        <div class="flex-grow max-w-md">
          <input 
            type="text" 
            v-model="searchQuery" 
            placeholder="Search users..." 
            class="w-full p-2 border border-gray-300 rounded text-sm"
          />
        </div>
      </div>
      
      <div v-if="loading" class="py-8 text-center text-gray-600">Loading users...</div>
      
      <div v-else>
        <div v-if="filteredUsers.length === 0" class="py-8 text-center text-gray-600">
          No users found matching your search.
        </div>
        
        <div v-else class="bg-white rounded-lg shadow overflow-x-auto">
          <table class="w-full border-collapse">
            <thead>
              <tr>
                <th @click="sortBy('name')" class="p-3 text-left font-semibold text-gray-600 bg-gray-100 border-b border-gray-200 cursor-pointer hover:bg-gray-50">
                  Name {{ getSortIcon('name') }}
                </th>
                <th @click="sortBy('email')" class="p-3 text-left font-semibold text-gray-600 bg-gray-100 border-b border-gray-200 cursor-pointer hover:bg-gray-50">
                  Email {{ getSortIcon('email') }}
                </th>
                <th @click="sortBy('role')" class="p-3 text-left font-semibold text-gray-600 bg-gray-100 border-b border-gray-200 cursor-pointer hover:bg-gray-50">
                  Role {{ getSortIcon('role') }}
                </th>
                <th @click="sortBy('created_at')" class="p-3 text-left font-semibold text-gray-600 bg-gray-100 border-b border-gray-200 cursor-pointer hover:bg-gray-50">
                  Created {{ getSortIcon('created_at') }}
                </th>
                <th class="p-3 text-left font-semibold text-gray-600 bg-gray-100 border-b border-gray-200">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="user in sortedUsers" :key="user.id" class="border-b border-gray-100 hover:bg-gray-50">
                <td class="p-3">{{ user.name }}</td>
                <td class="p-3">{{ user.email }}</td>
                <td class="p-3">
                  <span :class="[
                    'inline-block px-2 py-1 rounded text-xs capitalize',
                    user.role === 'admin' ? 'bg-blue-100 text-blue-800' : '',
                    user.role === 'manager' ? 'bg-green-100 text-green-800' : '',
                    user.role === 'consultant' ? 'bg-yellow-100 text-yellow-800' : ''
                  ]">
                    {{ user.role }}
                  </span>
                </td>
                <td class="p-3">{{ formatDateTime(user.created_at) }}</td>
                <td class="p-3 flex gap-2">
                  <button @click="editUser(user)" class="px-3 py-1 bg-green-500 text-white text-xs rounded hover:bg-green-600 transition-colors">
                    Edit
                  </button>
                  <button 
                    @click="deleteUserConfirm(user)" 
                    class="px-3 py-1 bg-red-500 text-white text-xs rounded hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    :disabled="user.id === authStore.user.id"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      
      <!-- Add/Edit User Modal -->
      <div v-if="showAddUserForm || editUserData" class="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
        <div class="bg-white p-8 rounded-lg max-w-lg w-[90%] relative">
          <span class="absolute top-4 right-4 text-2xl cursor-pointer text-gray-600" @click="closeUserForm">&times;</span>
          
          <h3 class="text-xl font-semibold mb-2">{{ editUserData ? 'Edit User' : 'Add New User' }}</h3>
          
          <form @submit.prevent="saveUser" class="mt-6">
            <div class="mb-4">
              <label for="user-name" class="block mb-2 font-medium">Full Name:</label>
              <input 
                type="text" 
                id="user-name" 
                v-model="userForm.name" 
                required
                class="w-full p-3 border border-gray-300 rounded text-base"
              />
            </div>
            
            <div class="mb-4">
              <label for="user-email" class="block mb-2 font-medium">Email:</label>
              <input 
                type="email" 
                id="user-email" 
                v-model="userForm.email" 
                required
                :disabled="!!editUserData"
                class="w-full p-3 border border-gray-300 rounded text-base disabled:bg-gray-100 disabled:cursor-not-allowed"
              />
              <small v-if="editUserData" class="block mt-1 text-xs text-gray-600">Email cannot be changed</small>
            </div>
            
            <div class="mb-4" v-if="!editUserData">
              <label for="user-password" class="block mb-2 font-medium">Password:</label>
              <input 
                type="password" 
                id="user-password" 
                v-model="userForm.password" 
                required
                minlength="6"
                class="w-full p-3 border border-gray-300 rounded text-base"
              />
            </div>
            
            <div class="mb-4">
              <label for="user-role" class="block mb-2 font-medium">Role:</label>
              <select 
                id="user-role" 
                v-model="userForm.role" 
                required
                class="w-full p-3 border border-gray-300 rounded text-base"
              >
                <option value="consultant">Consultant</option>
                <option value="manager">Manager</option>
                <option value="admin">Admin</option>
              </select>
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
                {{ formSubmitting ? 'Saving...' : 'Save User' }}
              </button>
              <button 
                type="button" 
                @click="closeUserForm" 
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
            Are you sure you want to delete the user <strong>{{ userToDelete?.name }}</strong>?
            This action cannot be undone.
          </p>
          
          <div class="flex justify-end gap-4">
            <button 
              @click="deleteUser" 
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
  import { useAuthStore } from '../stores/auth'
  import { supabase } from '../lib/supabase'
  
  const authStore = useAuthStore()
  
  // State
  const loading = ref(true)
  const users = ref([])
  const searchQuery = ref('')
  const sortField = ref('name')
  const sortDirection = ref('asc')
  
  // Form state
  const showAddUserForm = ref(false)
  const editUserData = ref(null)
  const userForm = ref({
    name: '',
    email: '',
    password: '',
    role: 'consultant'
  })
  const formError = ref('')
  const formSubmitting = ref(false)
  
  // Delete state
  const showDeleteConfirm = ref(false)
  const userToDelete = ref(null)
  const deleteLoading = ref(false)
  
  // Computed properties
  const filteredUsers = computed(() => {
    if (!searchQuery.value) return users.value
    
    const query = searchQuery.value.toLowerCase()
    
    return users.value.filter(user => 
      user.name.toLowerCase().includes(query) ||
      user.email.toLowerCase().includes(query) ||
      user.role.toLowerCase().includes(query)
    )
  })
  
  const sortedUsers = computed(() => {
    const field = sortField.value
    const direction = sortDirection.value
    
    return [...filteredUsers.value].sort((a, b) => {
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
  
  // User CRUD operations
  function editUser(user) {
    editUserData.value = user
    
    // Initialize form with user data
    userForm.value = {
      name: user.name,
      email: user.email,
      password: '', // Don't show or update password when editing
      role: user.role
    }
  }
  
  function closeUserForm() {
    showAddUserForm.value = false
    editUserData.value = null
    formError.value = ''
    resetForm()
  }
  
  function resetForm() {
    userForm.value = {
      name: '',
      email: '',
      password: '',
      role: 'consultant'
    }
  }
  
  async function saveUser() {
    formError.value = ''
    formSubmitting.value = true
    
    try {
      if (editUserData.value) {
        // Update existing user
        const { error } = await supabase
          .from('users')
          .update({
            name: userForm.value.name,
            role: userForm.value.role
          })
          .eq('id', editUserData.value.id)
        
        if (error) throw error
        
        // Update the user in the local list
        const index = users.value.findIndex(u => u.id === editUserData.value.id)
        if (index !== -1) {
          users.value[index] = {
            ...users.value[index],
            name: userForm.value.name,
            role: userForm.value.role
          }
        }
      } else {
        // Create new user via Supabase Auth
        const { data: authData, error: authError } = await supabase.auth.admin.createUser({
          email: userForm.value.email,
          password: userForm.value.password,
          email_confirm: true // Auto-confirm email
        })
        
        if (authError) throw authError
        
        // Create user in our users table
        const { data: userData, error: userError } = await supabase
          .from('users')
          .insert([
            {
              id: authData.user.id,
              name: userForm.value.name,
              email: userForm.value.email,
              role: userForm.value.role
            }
          ])
          .select()
        
        if (userError) throw userError
        
        // Add the new user to the local list
        if (userData) {
          users.value.push(userData[0])
        }
      }
      
      closeUserForm()
    } catch (error) {
      console.error('Error saving user:', error)
      formError.value = error.message || 'Failed to save user. Please try again.'
    } finally {
      formSubmitting.value = false
    }
  }
  
  function deleteUserConfirm(user) {
    // Prevent deleting yourself
    if (user.id === authStore.user.id) return
    
    userToDelete.value = user
    showDeleteConfirm.value = true
  }
  
  async function deleteUser() {
    if (!userToDelete.value) return
    
    deleteLoading.value = true
    
    try {
      // Delete user from auth
      const { error: authError } = await supabase.auth.admin.deleteUser(
        userToDelete.value.id
      )
      
      if (authError) throw authError
      
      // Delete user from users table
      const { error: userError } = await supabase
        .from('users')
        .delete()
        .eq('id', userToDelete.value.id)
      
      if (userError) throw userError
      
      // Remove user from local list
      users.value = users.value.filter(u => u.id !== userToDelete.value.id)
      
      showDeleteConfirm.value = false
      userToDelete.value = null
    } catch (error) {
      console.error('Error deleting user:', error)
      // Show error message
    } finally {
      deleteLoading.value = false
    }
  }
  
  // Fetch users data
  async function fetchUsers() {
    loading.value = true
    
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .order('name')
      
      if (error) throw error
      
      users.value = data
    } catch (error) {
      console.error('Error fetching users:', error)
    } finally {
      loading.value = false
    }
  }
  
  // Initialize component
  onMounted(async () => {
    await fetchUsers()
  })
  </script>
  ```