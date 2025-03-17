<template>
  <div class="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
    <div class="flex items-center gap-4">
      <div class="flex rounded-md shadow-sm">
        <button 
          @click="$emit('previous-week')" 
          class="px-3 py-2 bg-white border border-gray-300 rounded-l-md hover:bg-gray-50 transition-colors flex items-center justify-center"
          title="Previous Week"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        
        <button 
          @click="$emit('go-to-today')" 
          class="px-3 py-2 bg-white border-t border-b border-gray-300 hover:bg-gray-50 transition-colors"
          title="Go to Today"
        >
          Today
        </button>
        
        <button 
          @click="$emit('next-week')" 
          class="px-3 py-2 bg-white border border-gray-300 rounded-r-md hover:bg-gray-50 transition-colors flex items-center justify-center"
          title="Next Week"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
      
      <h2 class="text-xl font-semibold">{{ weekRange }}</h2>
    </div>
    
    <div class="flex gap-4 flex-wrap">
      <div class="flex items-center gap-2">
        <label for="status-filter" class="text-gray-700">Status:</label>
        <select 
          id="status-filter" 
          v-model="localStatus" 
          class="px-3 py-2 border border-gray-300 rounded-md min-w-[150px] shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
          @change="$emit('status-change', localStatus)"
        >
          <option value="">All Statuses</option>
          <option value="geboekt">Geboekt</option>
          <option value="optie">Optie</option>
          <option value="stand-by">Stand-by</option>
          <option value="afwezig">Afwezig</option>
        </select>
      </div>
      
      <button
        @click="$emit('new-booking')"
        class="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors flex items-center gap-2"
        title="Add New Booking"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
        </svg>
        New Booking
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  weekDates: {
    type: Array,
    required: true
  }
})

const emit = defineEmits(['previous-week', 'next-week', 'go-to-today', 'status-change', 'new-booking'])

const localStatus = ref('')

const weekRange = computed(() => {
  const start = props.weekDates[0]
  const end = props.weekDates[4]
  
  // Check if dates are in the same month
  const sameMonth = start.getMonth() === end.getMonth()
  
  if (sameMonth) {
    return `${formatDateWithDay(start)} - ${formatDateOnlyDay(end)}, ${formatYear(end)}`
  } else {
    return `${formatDateWithDay(start)} - ${formatDateWithDay(end)}, ${formatYear(end)}`
  }
})

function formatDateWithDay(date) {
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

function formatDateOnlyDay(date) {
  return date.toLocaleDateString('en-US', { day: 'numeric' })
}

function formatYear(date) {
  return date.toLocaleDateString('en-US', { year: 'numeric' })
}
</script> 