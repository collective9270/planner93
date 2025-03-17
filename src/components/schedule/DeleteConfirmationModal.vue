<template>
  <div v-if="show" class="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
    <div class="bg-white p-8 rounded-lg max-w-lg w-[90%]">
      <h3 class="text-xl font-semibold mb-2">Confirm Deletion</h3>
      <p class="mb-6">Are you sure you want to delete this booking?</p>
      
      <div class="flex gap-4">
        <button @click="$emit('confirm')" class="px-4 py-2 rounded text-sm bg-red-500 text-white">Yes, Delete</button>
        <button @click="$emit('cancel')" class="px-4 py-2 rounded text-sm bg-gray-100 text-gray-800">Cancel</button>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  show: {
    type: Boolean,
    required: true
  }
})

defineEmits(['confirm', 'cancel'])
</script> 