<template>
  <div class="min-h-screen flex flex-col">
    <header v-if="authStore.isAuthenticated" class="bg-slate-800 text-white py-4">
      <div class="container mx-auto px-4 flex justify-between items-center">
        <div class="text-lg font-bold">
          <router-link to="/" class="text-white hover:text-gray-200">Consultant Scheduler</router-link>
        </div>
        
        <nav class="hidden md:flex space-x-6">
          <router-link to="/dashboard" class="text-gray-300 hover:text-white border-b-2 border-transparent hover:border-white py-2 transition-colors">Dashboard</router-link>
          <router-link to="/calendar" class="text-gray-300 hover:text-white border-b-2 border-transparent hover:border-white py-2 transition-colors">Calendar</router-link>
          <router-link to="/bookings" class="text-gray-300 hover:text-white border-b-2 border-transparent hover:border-white py-2 transition-colors">Bookings</router-link>
          <router-link to="/clients" class="text-gray-300 hover:text-white border-b-2 border-transparent hover:border-white py-2 transition-colors">Clients</router-link>
          <router-link to="/projects" class="text-gray-300 hover:text-white border-b-2 border-transparent hover:border-white py-2 transition-colors">Projects</router-link>
          <router-link v-if="authStore.isAdmin" to="/users" class="text-gray-300 hover:text-white border-b-2 border-transparent hover:border-white py-2 transition-colors">Users</router-link>
        </nav>
        
        <div class="relative">
          <div @click="toggleUserDropdown" class="flex items-center space-x-2 px-3 py-2 bg-slate-700/50 rounded-md cursor-pointer">
            <span>{{ authStore.userDetails?.name || 'User' }}</span>
            <span class="bg-slate-600 px-2 py-1 rounded text-xs capitalize">{{ authStore.userDetails?.role }}</span>
            <span class="text-xs">▼</span>
          </div>
          
          <div v-if="showUserDropdown" class="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10">
            <router-link to="/profile" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Profile</router-link>
            <button @click="logout" class="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Logout</button>
          </div>
        </div>
      </div>
    </header>
    
    <main class="flex-grow">
      <router-view />
    </main>
    
    <footer class="bg-slate-800 text-gray-300 py-4 mt-auto">
      <div class="container mx-auto px-4 text-center">
        <p>Consultant Scheduler © {{ new Date().getFullYear() }}</p>
      </div>
    </footer>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from './stores/auth'

const router = useRouter()
const authStore = useAuthStore()
const showUserDropdown = ref(false)

// Toggle user dropdown
function toggleUserDropdown() {
  showUserDropdown.value = !showUserDropdown.value
}

// Close dropdown when clicking outside
function closeDropdownOnClickOutside(event) {
  const userMenu = document.querySelector('.user-menu')
  if (userMenu && !userMenu.contains(event.target)) {
    showUserDropdown.value = false
  }
}

// Logout function
async function logout() {
  try {
    await authStore.signOut()
    router.push('/login')
  } catch (error) {
    console.error('Error logging out:', error)
  }
}

onMounted(async () => {
  // Initialize auth state
  await authStore.initialize()
  
  // Add event listener for clicks
  document.addEventListener('click', closeDropdownOnClickOutside)
})

onUnmounted(() => {
  // Remove event listener
  document.removeEventListener('click', closeDropdownOnClickOutside)
})
</script>