import { defineStore } from 'pinia'
import { ref } from 'vue'
import { supabase } from '../lib/supabase'

export const useClientsStore = defineStore('clients', () => {
  const clients = ref([])
  const loading = ref(false)
  const error = ref(null)

  // Getters
  const getClientById = (id) => {
    return clients.value.find(client => client.id === id)
  }

  // Actions
  async function fetchClients() {
    loading.value = true
    error.value = null
    
    try {
      const { data, error: fetchError } = await supabase
        .from('clients')
        .select('*')
        .order('name')
      
      if (fetchError) throw fetchError
      
      clients.value = data || []
    } catch (err) {
      error.value = err.message
      console.error('Error fetching clients:', err)
    } finally {
      loading.value = false
    }
  }

  async function createClient(clientData) {
    loading.value = true
    error.value = null
    
    try {
      const { data, error: createError } = await supabase
        .from('clients')
        .insert([clientData])
        .select()
      
      if (createError) throw createError
      
      if (data && data[0]) {
        clients.value.push(data[0])
        return data[0]
      }
      
      return null
    } catch (err) {
      error.value = err.message
      console.error('Error creating client:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  async function updateClient(id, clientData) {
    loading.value = true
    error.value = null
    
    try {
      const { data, error: updateError } = await supabase
        .from('clients')
        .update(clientData)
        .eq('id', id)
        .select()
      
      if (updateError) throw updateError
      
      if (data && data[0]) {
        // Update client in the local state
        const index = clients.value.findIndex(c => c.id === id)
        if (index !== -1) {
          clients.value[index] = {
            ...clients.value[index],
            ...data[0]
          }
        }
        return data[0]
      }
      
      return null
    } catch (err) {
      error.value = err.message
      console.error('Error updating client:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  async function deleteClient(id) {
    loading.value = true
    error.value = null
    
    try {
      const { error: deleteError } = await supabase
        .from('clients')
        .delete()
        .eq('id', id)
      
      if (deleteError) throw deleteError
      
      // Remove client from local state
      clients.value = clients.value.filter(c => c.id !== id)
      return true
    } catch (err) {
      error.value = err.message
      console.error('Error deleting client:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  return {
    clients,
    loading,
    error,
    getClientById,
    fetchClients,
    createClient,
    updateClient,
    deleteClient
  }
}) 