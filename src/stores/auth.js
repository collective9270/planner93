import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { supabase } from '../lib/supabase'

export const useAuthStore = defineStore('auth', () => {
  const user = ref(null)
  const loading = ref(true)
  const userDetails = ref(null)

  // Computed properties
  const isAuthenticated = computed(() => !!user.value)
  const isAdmin = computed(() => userDetails.value?.role === 'admin')
  const isConsultant = computed(() => userDetails.value?.role === 'consultant')
  const isManager = computed(() => userDetails.value?.role === 'manager')

  // Initialize auth state
  async function initialize() {
    loading.value = true
    
    // Get session from Supabase
    const { data: { session } } = await supabase.auth.getSession()
    
    if (session) {
      user.value = session.user
      await fetchUserDetails()
    }
    
    loading.value = false
    
    // Set up auth state change listener
    supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session) {
        user.value = session.user
        await fetchUserDetails()
      } else if (event === 'SIGNED_OUT') {
        user.value = null
        userDetails.value = null
      }
    })
  }

  // Fetch user details from the users table
  async function fetchUserDetails() {
    if (!user.value) return
    
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.value.id)
      .single()
    
    if (error) {
      console.error('Error fetching user details:', error)
      return
    }
    
    userDetails.value = data
  }

  // Sign in with email and password
  async function signIn(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    })
    
    if (error) throw error
    
    user.value = data.user
    await fetchUserDetails()
    
    return data
  }

  // Sign up with email and password
  async function signUp(email, password, name, role = 'consultant') {
    // First create the auth user
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password
    })
    
    if (authError) throw authError
    
    // Then insert the user details into our users table
    const { error: userError } = await supabase
      .from('users')
      .insert([
        { 
          id: authData.user.id,
          email,
          name,
          role
        }
      ])
    
    if (userError) throw userError
    
    user.value = authData.user
    await fetchUserDetails()
    
    return authData
  }

  // Sign out
  async function signOut() {
    const { error } = await supabase.auth.signOut()
    
    if (error) throw error
    
    user.value = null
    userDetails.value = null
  }

  return {
    user,
    userDetails,
    loading,
    isAuthenticated,
    isAdmin,
    isConsultant,
    isManager,
    initialize,
    fetchUserDetails,
    signIn,
    signUp,
    signOut
  }
})