<template>
  <div class="p-8 max-w-7xl mx-auto">
    <h1 class="mb-6 text-2xl font-bold text-gray-800">Manage Projects</h1>
    
    <div class="flex justify-between items-center mb-6 flex-wrap gap-4">
      <button @click="showAddProjectForm = true" class="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors text-sm">
        Add New Project
      </button>
      
      <div class="flex-grow max-w-md">
        <input 
          type="text" 
          v-model="searchQuery" 
          placeholder="Search projects..." 
          class="w-full p-2 border border-gray-300 rounded text-sm"
        />
      </div>
    </div>
    
    <div v-if="projectsStore.loading" class="py-8 text-center text-gray-600">Loading projects...</div>
    
    <div v-else>
      <div v-if="filteredProjects.length === 0" class="py-8 text-center text-gray-600">
        No projects found matching your search.
      </div>
      
      <div v-else class="bg-white rounded-lg shadow overflow-x-auto">
        <table class="w-full border-collapse">
          <thead>
            <tr>
              <th @click="sortBy('name')" class="p-3 text-left font-semibold text-gray-600 bg-gray-100 border-b border-gray-200 cursor-pointer hover:bg-gray-50">
                Project {{ getSortIcon('name') }}
              </th>
              <th @click="sortBy('client_name')" class="p-3 text-left font-semibold text-gray-600 bg-gray-100 border-b border-gray-200 cursor-pointer hover:bg-gray-50">
                Client {{ getSortIcon('client_name') }}
              </th>
              <th @click="sortBy('manager_name')" class="p-3 text-left font-semibold text-gray-600 bg-gray-100 border-b border-gray-200 cursor-pointer hover:bg-gray-50">
                Manager {{ getSortIcon('manager_name') }}
              </th>
              <th @click="sortBy('start_date')" class="p-3 text-left font-semibold text-gray-600 bg-gray-100 border-b border-gray-200 cursor-pointer hover:bg-gray-50">
                Start Date {{ getSortIcon('start_date') }}
              </th>
              <th @click="sortBy('end_date')" class="p-3 text-left font-semibold text-gray-600 bg-gray-100 border-b border-gray-200 cursor-pointer hover:bg-gray-50">
                End Date {{ getSortIcon('end_date') }}
              </th>
              <th @click="sortBy('status')" class="p-3 text-left font-semibold text-gray-600 bg-gray-100 border-b border-gray-200 cursor-pointer hover:bg-gray-50">
                Status {{ getSortIcon('status') }}
              </th>
              <th class="p-3 text-left font-semibold text-gray-600 bg-gray-100 border-b border-gray-200">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="project in sortedProjects" :key="project.id" class="border-b border-gray-100 hover:bg-gray-50">
              <td class="p-3">{{ project.name }}</td>
              <td class="p-3">{{ project.client_name }}</td>
              <td class="p-3">{{ project.manager_name }}</td>
              <td class="p-3">{{ formatDate(project.start_date) }}</td>
              <td class="p-3">{{ formatDate(project.end_date) }}</td>
              <td class="p-3">
                <span :class="getStatusClass(project.status)" class="px-2 py-1 rounded-full text-xs">
                  {{ project.status }}
                </span>
              </td>
              <td class="p-3 flex gap-2">
                <button @click="editProject(project)" class="px-3 py-1 bg-green-500 text-white text-xs rounded hover:bg-green-600 transition-colors">
                  Edit
                </button>
                <button 
                  @click="deleteProjectConfirm(project)" 
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
    
    <!-- Add/Edit Project Modal -->
    <div v-if="showAddProjectForm || editProjectData" class="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div class="bg-white p-8 rounded-lg max-w-2xl w-[90%] relative">
        <span class="absolute top-4 right-4 text-2xl cursor-pointer text-gray-600" @click="closeProjectForm">&times;</span>
        
        <h3 class="text-xl font-semibold mb-2">{{ editProjectData ? 'Edit Project' : 'Add New Project' }}</h3>
        
        <form @submit.prevent="saveProject" class="mt-6">
          <div class="mb-4">
            <label for="project-name" class="block mb-2 font-medium">Project Name:</label>
            <input 
              type="text" 
              id="project-name" 
              v-model="projectForm.name" 
              required
              class="w-full p-3 border border-gray-300 rounded text-base"
            />
          </div>
          
          <div class="mb-4">
            <label for="project-client" class="block mb-2 font-medium">Client:</label>
            <select 
              id="project-client" 
              v-model="projectForm.client_id" 
              required
              class="w-full p-3 border border-gray-300 rounded text-base"
            >
              <option value="">Select a client</option>
              <option v-for="client in clientsStore.clients" :key="client.id" :value="client.id">
                {{ client.name }}
              </option>
            </select>
          </div>
          
          <div class="mb-4">
            <label for="project-description" class="block mb-2 font-medium">Description:</label>
            <textarea 
              id="project-description" 
              v-model="projectForm.description" 
              rows="3"
              class="w-full p-3 border border-gray-300 rounded text-base"
            ></textarea>
          </div>
          
          <div class="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label for="project-start" class="block mb-2 font-medium">Start Date:</label>
              <input 
                type="date" 
                id="project-start" 
                v-model="projectForm.start_date" 
                required
                class="w-full p-3 border border-gray-300 rounded text-base"
              />
            </div>
            
            <div>
              <label for="project-end" class="block mb-2 font-medium">End Date:</label>
              <input 
                type="date" 
                id="project-end" 
                v-model="projectForm.end_date" 
                required
                class="w-full p-3 border border-gray-300 rounded text-base"
              />
            </div>
          </div>
          
          <div class="mb-4">
            <label for="project-status" class="block mb-2 font-medium">Status:</label>
            <select 
              id="project-status" 
              v-model="projectForm.status" 
              required
              class="w-full p-3 border border-gray-300 rounded text-base"
            >
              <option value="planning">Planning</option>
              <option value="active">Active</option>
              <option value="completed">Completed</option>
              <option value="on_hold">On Hold</option>
            </select>
          </div>
          
          <div class="mb-4">
            <label for="project-budget" class="block mb-2 font-medium">Budget:</label>
            <input 
              type="number" 
              id="project-budget" 
              v-model="projectForm.budget" 
              step="0.01"
              class="w-full p-3 border border-gray-300 rounded text-base"
            />
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
              {{ formSubmitting ? 'Saving...' : 'Save Project' }}
            </button>
            <button 
              type="button" 
              @click="closeProjectForm" 
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
          Are you sure you want to delete the project <strong>{{ projectToDelete?.name }}</strong>?
          This action cannot be undone.
        </p>
        
        <div class="flex justify-end gap-4">
          <button 
            @click="deleteProject" 
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
import { useProjectsStore } from '../stores/projects'
import { useClientsStore } from '../stores/clients'

const authStore = useAuthStore()
const projectsStore = useProjectsStore()
const clientsStore = useClientsStore()

// State
const searchQuery = ref('')
const sortField = ref('name')
const sortDirection = ref('asc')

// Form state
const showAddProjectForm = ref(false)
const editProjectData = ref(null)
const projectForm = ref({
  name: '',
  client_id: '',
  description: '',
  start_date: '',
  end_date: '',
  status: 'planning',
  budget: null
})
const formError = ref('')
const formSubmitting = ref(false)

// Delete state
const showDeleteConfirm = ref(false)
const projectToDelete = ref(null)
const deleteLoading = ref(false)

// Computed properties
const filteredProjects = computed(() => {
  if (!searchQuery.value) return projectsStore.projects
  
  const query = searchQuery.value.toLowerCase()
  
  return projectsStore.projects.filter(project => 
    project.name.toLowerCase().includes(query) ||
    project.client_name.toLowerCase().includes(query) ||
    project.manager_name.toLowerCase().includes(query)
  )
})

const sortedProjects = computed(() => {
  const field = sortField.value
  const direction = sortDirection.value
  
  return [...filteredProjects.value].sort((a, b) => {
    const valueA = a[field]
    const valueB = b[field]
    
    // Handle null/undefined values
    if (valueA === null || valueA === undefined) return direction === 'asc' ? -1 : 1
    if (valueB === null || valueB === undefined) return direction === 'asc' ? 1 : -1
    
    // Compare based on data type
    if (typeof valueA === 'string') {
      const result = valueA.localeCompare(valueB)
      return direction === 'asc' ? result : -result
    } else if (valueA instanceof Date) {
      const result = valueA < valueB ? -1 : valueA > valueB ? 1 : 0
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
    sortDirection.value = sortDirection.value === 'asc' ? 'desc' : 'asc'
  } else {
    sortField.value = field
    sortDirection.value = 'asc'
  }
}

function getSortIcon(field) {
  if (sortField.value !== field) return ''
  return sortDirection.value === 'asc' ? '▲' : '▼'
}

function formatDate(dateString) {
  return new Date(dateString).toLocaleDateString()
}

function getStatusClass(status) {
  const classes = {
    planning: 'bg-yellow-100 text-yellow-800',
    active: 'bg-green-100 text-green-800',
    completed: 'bg-blue-100 text-blue-800',
    on_hold: 'bg-gray-100 text-gray-800'
  }
  return classes[status] || 'bg-gray-100 text-gray-800'
}

function editProject(project) {
  editProjectData.value = project
  
  // Initialize form with project data
  projectForm.value = {
    name: project.name,
    client_id: project.client_id,
    description: project.description || '',
    start_date: project.start_date,
    end_date: project.end_date,
    status: project.status,
    budget: project.budget
  }
}

function closeProjectForm() {
  showAddProjectForm.value = false
  editProjectData.value = null
  formError.value = ''
  resetForm()
}

function resetForm() {
  projectForm.value = {
    name: '',
    client_id: '',
    description: '',
    start_date: '',
    end_date: '',
    status: 'planning',
    budget: null
  }
}

async function saveProject() {
  formError.value = ''
  formSubmitting.value = true
  
  try {
    // Log the form data for debugging
    console.log('Saving project with form data:', JSON.stringify(projectForm.value))
    
    if (editProjectData.value) {
      // Update existing project
      await projectsStore.updateProject(editProjectData.value.id, projectForm.value)
    } else {
      // Create new project
      const projectToCreate = {
        ...projectForm.value,
        manager_id: authStore.user.id
      }
      console.log('Creating new project with data:', JSON.stringify(projectToCreate))
      await projectsStore.createProject(projectToCreate)
    }
    
    closeProjectForm()
  } catch (error) {
    console.error('Error saving project:', error)
    formError.value = error.message || 'Failed to save project. Please try again.'
  } finally {
    formSubmitting.value = false
  }
}

function deleteProjectConfirm(project) {
  projectToDelete.value = project
  showDeleteConfirm.value = true
}

async function deleteProject() {
  if (!projectToDelete.value) return
  
  deleteLoading.value = true
  
  try {
    await projectsStore.deleteProject(projectToDelete.value.id)
    showDeleteConfirm.value = false
    projectToDelete.value = null
  } catch (error) {
    console.error('Error deleting project:', error)
  } finally {
    deleteLoading.value = false
  }
}

// Initialize component
onMounted(async () => {
  // Initialize auth before fetching data
  if (!authStore.isAuthenticated) {
    await authStore.initialize()
  }
  await Promise.all([
    clientsStore.fetchClients(),
    projectsStore.fetchProjects()
  ])
})
</script> 