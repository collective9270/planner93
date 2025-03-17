<template>
  <div v-if="booking" class="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
    <div class="bg-white p-8 rounded-lg max-w-lg w-[90%] relative">
      <span 
        class="absolute top-4 right-4 text-2xl cursor-pointer text-gray-600" 
        @click="$emit('close')"
      >
        &times;
      </span>
      
      <h3 class="text-xl font-semibold mb-2">Booking Details</h3>
      
      <div class="my-6">
        <p class="mb-2"><strong>Date:</strong> {{ formatDate(booking.date) }}</p>
        <p class="mb-2"><strong>Consultant:</strong> {{ booking.users?.name }}</p>
        <p class="mb-2"><strong>Client:</strong> {{ booking.client || 'No client' }}</p>
        <p class="mb-2">
          <strong>Status:</strong> 
          <span :class="[
            'inline-block px-2 py-1 rounded capitalize',
            getStatusClass(booking.status)
          ]">
            {{ booking.status }}
          </span>
        </p>
        <p class="mb-2"><strong>Created:</strong> {{ formatDateTime(booking.created_at) }}</p>
      </div>
      
      <div class="flex gap-4 mt-6">
        <button 
          @click="$emit('edit')" 
          class="px-4 py-2 rounded text-sm bg-green-500 text-white"
          v-if="canEdit"
        >
          Edit
        </button>
        <button 
          @click="$emit('delete')" 
          class="px-4 py-2 rounded text-sm bg-red-500 text-white"
          v-if="canEdit"
        >
          Delete
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useAuthStore } from '../../stores/auth'

const props = defineProps({
  booking: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['close', 'edit', 'delete'])

const authStore = useAuthStore()

const canEdit = computed(() => {
  if (authStore.isAdmin) return true
  if (authStore.isManager) return true
  if (authStore.isConsultant) {
    return props.booking.consultant_id === authStore.user.id
  }
  return false
})

function formatDate(date) {
  return new Date(date).toLocaleDateString('en-US', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  })
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

function getStatusClass(status) {
  const classes = {
    'geboekt': 'bg-green-100 text-green-800',
    'optie': 'bg-yellow-100 text-yellow-800',
    'stand-by': 'bg-blue-100 text-blue-800',
    'afwezig': 'bg-red-100 text-red-800'
  }
  return classes[status] || ''
}
</script> 