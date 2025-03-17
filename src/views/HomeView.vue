<template>
  <div class="min-h-screen">
    <div class="bg-slate-800 text-white py-16 md:py-24 px-4">
      <div class="max-w-4xl mx-auto text-center">
        <h1 class="text-4xl md:text-5xl font-bold mb-4">Consultant Scheduler</h1>
        <p class="text-xl md:text-2xl mb-8 opacity-90">Streamline your consultant scheduling with our powerful management platform</p>
        
        <div class="flex flex-col sm:flex-row justify-center gap-4">
          <router-link 
            v-if="!authStore.isAuthenticated" 
            to="/login" 
            class="px-6 py-3 bg-emerald-600 text-white font-medium rounded-md hover:bg-emerald-700 transition-colors"
          >
            Login
          </router-link>
          <router-link 
            v-if="!authStore.isAuthenticated" 
            to="/register" 
            class="px-6 py-3 bg-transparent text-white font-medium rounded-md border-2 border-white hover:bg-white/10 transition-colors"
          >
            Register
          </router-link>
          <router-link 
            v-if="authStore.isAuthenticated" 
            to="/dashboard" 
            class="px-6 py-3 bg-emerald-600 text-white font-medium rounded-md hover:bg-emerald-700 transition-colors"
          >
            Go to Dashboard
          </router-link>
        </div>
      </div>
    </div>
    
    <div class="py-16 px-4 max-w-6xl mx-auto">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div class="bg-white p-8 rounded-lg shadow-md hover:shadow-lg transition-shadow hover:-translate-y-1 transition-transform duration-300">
          <h3 class="text-xl font-semibold text-slate-800 mb-2">Booking Management</h3>
          <p class="text-gray-600">Create, update, and manage consultant bookings with ease. Track status from options to confirmed bookings.</p>
        </div>
        
        <div class="bg-white p-8 rounded-lg shadow-md hover:shadow-lg transition-shadow hover:-translate-y-1 transition-transform duration-300">
          <h3 class="text-xl font-semibold text-slate-800 mb-4">Calendar View</h3>
          <p class="text-gray-600">View your entire schedule in an intuitive calendar interface. Color-coded status indicators for quick reference.</p>
        </div>
        
        <div class="bg-white p-8 rounded-lg shadow-md hover:shadow-lg transition-shadow hover:-translate-y-1 transition-transform duration-300">
          <h3 class="text-xl font-semibold text-slate-800 mb-4">Real-Time Updates</h3>
          <p class="text-gray-600">All changes are instantly visible to team members. No more double bookings or miscommunications.</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useAuthStore } from '../stores/auth'

const authStore = useAuthStore()
</script>