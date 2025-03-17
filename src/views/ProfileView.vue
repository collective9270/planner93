<template>
    <div class="profile-view">
      <h1>Profile</h1>
      
      <div v-if="loading" class="loading">Loading profile data...</div>
      
      <div v-else class="profile-content">
        <div class="profile-card">
          <h2>User Information</h2>
          
          <form @submit.prevent="updateProfile">
            <div class="form-group">
              <label for="name">Full Name</label>
              <input 
                type="text"
                id="name"
                v-model="profileForm.name"
                required
              />
            </div>
            
            <div class="form-group">
              <label for="email">Email</label>
              <input 
                type="email"
                id="email"
                v-model="profileForm.email"
                disabled
              />
              <small>Email cannot be changed</small>
            </div>
            
            <div class="form-group">
              <label for="role">Role</label>
              <input 
                type="text"
                id="role"
                v-model="profileForm.role"
                disabled
              />
              <small>Contact an administrator to change your role</small>
            </div>
            
            <div v-if="updateError" class="error-message">
              {{ updateError }}
            </div>
            
            <div v-if="updateSuccess" class="success-message">
              {{ updateSuccess }}
            </div>
            
            <button type="submit" class="btn save-btn" :disabled="updateLoading">
              {{ updateLoading ? 'Saving...' : 'Save Changes' }}
            </button>
          </form>
        </div>
        
        <div class="profile-card">
          <h2>Password</h2>
          
          <form @submit.prevent="changePassword">
            <div class="form-group">
              <label for="current-password">Current Password</label>
              <input 
                type="password"
                id="current-password"
                v-model="passwordForm.currentPassword"
                required
              />
            </div>
            
            <div class="form-group">
              <label for="new-password">New Password</label>
              <input 
                type="password"
                id="new-password"
                v-model="passwordForm.newPassword"
                required
                minlength="6"
              />
            </div>
            
            <div class="form-group">
              <label for="confirm-password">Confirm New Password</label>
              <input 
                type="password"
                id="confirm-password"
                v-model="passwordForm.confirmPassword"
                required
                minlength="6"
              />
            </div>
            
            <div v-if="passwordError" class="error-message">
              {{ passwordError }}
            </div>
            
            <div v-if="passwordSuccess" class="success-message">
              {{ passwordSuccess }}
            </div>
            
            <button type="submit" class="btn save-btn" :disabled="passwordLoading">
              {{ passwordLoading ? 'Changing Password...' : 'Change Password' }}
            </button>
          </form>
        </div>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref, reactive, onMounted } from 'vue'
  import { useAuthStore } from '../stores/auth'
  import { supabase } from '../lib/supabase'
  
  const authStore = useAuthStore()
  const loading = ref(true)
  
  // Profile form
  const profileForm = reactive({
    name: '',
    email: '',
    role: ''
  })
  
  const updateError = ref('')
  const updateSuccess = ref('')
  const updateLoading = ref(false)
  
  // Password form
  const passwordForm = reactive({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })
  
  const passwordError = ref('')
  const passwordSuccess = ref('')
  const passwordLoading = ref(false)
  
  // Load user data
  onMounted(async () => {
    try {
      // Ensure auth is initialized
      if (!authStore.isAuthenticated) {
        await authStore.initialize()
      }
      
      // Load user details into form
      if (authStore.userDetails) {
        profileForm.name = authStore.userDetails.name || ''
        profileForm.email = authStore.userDetails.email || ''
        profileForm.role = authStore.userDetails.role || ''
      }
    } catch (error) {
      console.error('Error loading profile data:', error)
    } finally {
      loading.value = false
    }
  })
  
  // Update profile information
  async function updateProfile() {
    updateError.value = ''
    updateSuccess.value = ''
    updateLoading.value = true
    
    try {
      // Validate input
      if (!profileForm.name.trim()) {
        throw new Error('Name cannot be empty')
      }
      
      // Update user in the database
      const { error } = await supabase
        .from('users')
        .update({ name: profileForm.name.trim() })
        .eq('id', authStore.user.id)
      
      if (error) throw error
      
      // Update local state
      if (authStore.userDetails) {
        authStore.userDetails.name = profileForm.name.trim()
      }
      
      updateSuccess.value = 'Profile updated successfully'
    } catch (error) {
      console.error('Error updating profile:', error)
      updateError.value = error.message || 'Failed to update profile'
    } finally {
      updateLoading.value = false
    }
  }
  
  // Change password
  async function changePassword() {
    passwordError.value = ''
    passwordSuccess.value = ''
    passwordLoading.value = true
    
    try {
      // Validate input
      if (passwordForm.newPassword !== passwordForm.confirmPassword) {
        throw new Error('New passwords do not match')
      }
      
      if (passwordForm.newPassword.length < 6) {
        throw new Error('New password must be at least 6 characters long')
      }
      
      // First, verify current password by attempting to sign in
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: profileForm.email,
        password: passwordForm.currentPassword
      })
      
      if (signInError) {
        throw new Error('Current password is incorrect')
      }
      
      // Update password
      const { error: updateError } = await supabase.auth.updateUser({
        password: passwordForm.newPassword
      })
      
      if (updateError) throw updateError
      
      // Clear form and show success message
      passwordForm.currentPassword = ''
      passwordForm.newPassword = ''
      passwordForm.confirmPassword = ''
      
      passwordSuccess.value = 'Password changed successfully'
    } catch (error) {
      console.error('Error changing password:', error)
      passwordError.value = error.message || 'Failed to change password'
    } finally {
      passwordLoading.value = false
    }
  }
  </script>
  
  <style scoped>
  .profile-view {
    padding: 2rem;
    max-width: 1200px;
    margin: 0 auto;
  }
  
  h1 {
    margin-bottom: 1.5rem;
    color: #333;
  }
  
  .loading {
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 2rem;
    font-size: 1.2rem;
    color: #666;
  }
  
  .profile-content {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
    gap: 2rem;
  }
  
  .profile-card {
    background-color: white;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    padding: 1.5rem;
  }
  
  h2 {
    margin-bottom: 1.5rem;
    color: #333;
    font-size: 1.25rem;
  }
  
  .form-group {
    margin-bottom: 1.25rem;
  }
  
  .form-group label {
    display: block;
    margin-bottom: 0.5rem;
    font-weight: 500;
  }
  
  .form-group input {
    width: 100%;
    padding: 0.75rem;
    border: 1px solid #ddd;
    border-radius: 4px;
    font-size: 1rem;
  }
  
  .form-group small {
    display: block;
    margin-top: 0.25rem;
    color: #666;
    font-size: 0.75rem;
  }
  
  .form-group input:disabled {
    background-color: #f5f5f5;
    cursor: not-allowed;
  }
  
  .error-message {
    background-color: #f8d7da;
    color: #721c24;
    padding: 0.75rem;
    border-radius: 4px;
    margin-bottom: 1rem;
    font-size: 0.875rem;
  }
  
  .success-message {
    background-color: #d4edda;
    color: #155724;
    padding: 0.75rem;
    border-radius: 4px;
    margin-bottom: 1rem;
    font-size: 0.875rem;
  }
  
  .btn {
    padding: 0.75rem 1rem;
    border-radius: 4px;
    border: none;
    cursor: pointer;
    font-size: 1rem;
    background-color: #f5f5f5;
    color: #333;
  }
  
  .save-btn {
    background-color: #4CAF50;
    color: white;
  }
  
  .save-btn:hover {
    background-color: #45a049;
  }
  
  .btn:disabled {
    background-color: #cccccc;
    cursor: not-allowed;
  }
  
  @media (max-width: 768px) {
    .profile-content {
      grid-template-columns: 1fr;
    }
  }
  </style>