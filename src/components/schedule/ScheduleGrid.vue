<template>
  <div class="schedule-grid bg-white border border-gray-200 rounded-lg shadow-md overflow-hidden">
    <!-- Header row with dates -->
    <div class="grid-header grid" :style="`grid-template-columns: 160px repeat(${days.length}, 1fr)`">
      <div class="p-3 font-semibold bg-gray-100 border-b border-r border-gray-200">Consultant</div>
      <div 
        v-for="(day, index) in days" 
        :key="index" 
        class="p-3 font-semibold text-center bg-gray-100 border-b border-r border-gray-200 last:border-r-0"
      >
        {{ formatDisplayDate(day) }}
      </div>
    </div>
    
    <!-- Grid body -->
    <div class="grid-body">
      <!-- Row for each user -->
      <div 
        v-for="user in users" 
        :key="user.id" 
        class="grid-row grid" 
        :style="`grid-template-columns: 160px repeat(${days.length}, 1fr)`"
      >
        <!-- User cell -->
        <div class="user-cell p-2 border-b border-r border-gray-200 bg-gray-50">
          <div class="font-medium">{{ user.name }}</div>
          <div class="text-xs text-gray-500">{{ user.role }}</div>
        </div>
        
        <!-- Booking cells for each day -->
        <div 
          v-for="(day, dayIndex) in days" 
          :key="dayIndex" 
          class="grid-cell relative border-r border-gray-200 min-h-[80px] hover:bg-gray-50 transition-colors group"
          :class="dayIndex % 2 === 0 ? 'bg-white' : 'bg-gray-50'"
        >
          <!-- Debug info for each day -->
          <div class="text-[10px] text-gray-400">
            {{ formatDisplayDate(day) }}
            <span class="block">(DB format: {{ formatDate(day) }})</span>
          </div>
          
          <div v-if="getBookingsForDay(day, user?.id).length === 0" class="text-center text-xs text-gray-400 pt-2">
            No bookings
          </div>

          <!-- Bookings for this day and user -->
          <div 
            v-for="booking in getBookingsForDay(day, user?.id)" 
            :key="booking.id" 
            class="booking-cell relative m-1 p-2 text-xs rounded border-l-4 shadow-sm cursor-pointer"
            :class="getBookingStatusClass(booking.status)"
            @click="$emit('booking-click', booking)"
          >
            <div class="font-semibold">{{ booking.client || 'No Client' }}</div>
            <div class="text-[10px]">{{ booking.status }}</div>
            
            <!-- Actions -->
            <div class="absolute top-1 right-1">
              <button 
                @click.stop="$emit('edit-booking', booking)"
                class="text-gray-500 hover:text-blue-600"
              >
                <i class="fas fa-edit"></i>
              </button>
            </div>
          </div>

          <!-- Add booking button -->
          <div 
            class="opacity-0 group-hover:opacity-100 absolute right-1 bottom-1 transition-opacity"
            @click="$emit('add-booking', { date: day, consultant_id: user?.id })"
          >
            <button class="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-blue-600">
              <i class="fas fa-plus text-xs"></i>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  weekDates: {
    type: Array,
    required: true
  },
  users: {
    type: Array,
    required: true
  },
  bookings: {
    type: Array,
    default: () => []
  },
  selectedStatus: {
    type: String,
    default: ''
  }
})

const emit = defineEmits(['booking-click', 'add-booking', 'edit-booking'])

// Compute the weekdays (Mon-Fri) for the grid
const days = computed(() => {
  return props.weekDates
})

function formatDate(date) {
  // Format date as YYYY-MM-DD for database comparison
  const d = new Date(date)
  const yyyy = d.getFullYear()
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  return `${yyyy}-${mm}-${dd}`
}

function formatDisplayDate(date) {
  // Format date as Month Day for display
  const d = new Date(date)
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

function getBookingsForDay(date, userId) {
  if (!props.bookings || !userId) {
    return []
  }

  const formattedDate = formatDate(date)
  
  return props.bookings.filter(booking => {
    const isDateMatch = booking.date === formattedDate
    const isUserMatch = String(booking.consultant_id) === String(userId)
    const isStatusMatch = !props.selectedStatus || booking.status === props.selectedStatus
    
    return isDateMatch && isUserMatch && isStatusMatch
  })
}

function getBookingStatusClass(status) {
  if (!status) return 'border-gray-300'
  
  switch (status.toLowerCase()) {
    case 'confirmed':
    case 'geboekt':
      return 'border-green-500 bg-green-50'
    case 'tentative':
    case 'optie':
      return 'border-yellow-500 bg-yellow-50'
    case 'canceled':
    case 'afwezig':
      return 'border-red-500 bg-red-50'
    case 'stand-by':
      return 'border-blue-500 bg-blue-50'
    default:
      return 'border-gray-300'
  }
}
</script>

<style scoped>
.grid-header {
  position: sticky;
  top: 0;
  z-index: 10;
}

.booking-cell {
  transition: all 0.2s;
}

.booking-cell:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
}

.grid-cell {
  min-height: 80px;
  border-bottom: 1px solid #e5e7eb;
  padding: 4px;
}

.user-cell {
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.schedule-grid {
  margin-top: 1rem;
}
</style> 