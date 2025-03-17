<template>
  <div class="flex justify-center items-center min-h-screen bg-gray-100">
    <div class="w-full max-w-md p-8 bg-white rounded-lg shadow-md">
      <h1 class="mb-6 text-center text-2xl font-bold text-gray-800">Login</h1>
      <form @submit.prevent="handleLogin">
        <div class="mb-4">
          <label for="email" class="block mb-2 font-medium text-gray-700">Email</label>
          <input 
            type="email" 
            id="email" 
            v-model="email" 
            required 
            placeholder="Enter your email"
            class="w-full p-3 border border-gray-300 rounded text-base focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
          />
        </div>
        
        <div class="mb-4">
          <label for="password" class="block mb-2 font-medium text-gray-700">Password</label>
          <input 
            type="password" 
            id="password" 
            v-model="password" 
            required 
            placeholder="Enter your password"
            class="w-full p-3 border border-gray-300 rounded text-base focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
          />
        </div>
        
        <div v-if="error" class="my-4 text-sm text-red-600">
          {{ error }}
        </div>
        
        <button 
          type="submit" 
          class="w-full py-3 mt-4 bg-green-600 text-white rounded text-base cursor-pointer transition-colors duration-300 hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
          :disabled="loading"
        >
          {{ loading ? 'Logging in...' : 'Login' }}
        </button>
      </form>
      
      <div class="mt-6 text-center">
        <router-link to="/register" class="text-green-600 hover:underline">Don't have an account? Register</router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

const email = ref('')
const password = ref('')
const error = ref('')
const loading = ref(false)

async function handleLogin() {
  error.value = ''
  loading.value = true
  
  try {
    await authStore.signIn(email.value, password.value)
    
    // Redirect to the intended page or dashboard
    const redirectPath = route.query.redirect || '/dashboard'
    router.push(redirectPath)
  } catch (err) {
    console.error('Login error:', err)
    error.value = err.message || 'Failed to log in. Please check your credentials.'
  } finally {
    loading.value = false
  }
}
</script>