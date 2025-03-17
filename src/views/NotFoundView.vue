<template>
    <div class="not-found">
      <div class="not-found-content">
        <h1>404</h1>
        <h2>Page Not Found</h2>
        <p>The page you're looking for doesn't exist or has been moved.</p>
        <div class="actions">
          <router-link to="/" class="btn">Return Home</router-link>
          <router-link v-if="authStore.isAuthenticated" to="/dashboard" class="btn">Go to Dashboard</router-link>
        </div>
      </div>
    </div>
  </template>
  
  <script setup>
  import { useAuthStore } from '../stores/auth'
  
  const authStore = useAuthStore()
  </script>
  
  <style scoped>
  .not-found {
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 100vh;
    background-color: #f5f5f5;
    padding: 2rem;
  }
  
  .not-found-content {
    text-align: center;
    max-width: 600px;
  }
  
  h1 {
    font-size: 8rem;
    font-weight: 700;
    color: #2c3e50;
    margin: 0;
    line-height: 1;
  }
  
  h2 {
    font-size: 2rem;
    margin-bottom: 1rem;
    color: #333;
  }
  
  p {
    font-size: 1.25rem;
    color: #666;
    margin-bottom: 2rem;
  }
  
  .actions {
    display: flex;
    justify-content: center;
    gap: 1rem;
  }
  
  .btn {
    display: inline-block;
    padding: 0.75rem 1.5rem;
    background-color: #4CAF50;
    color: white;
    text-decoration: none;
    border-radius: 4px;
    font-weight: 500;
    transition: background-color 0.3s;
  }
  
  .btn:hover {
    background-color: #45a049;
  }
  
  @media (max-width: 768px) {
    h1 {
      font-size: 5rem;
    }
    
    h2 {
      font-size: 1.5rem;
    }
    
    p {
      font-size: 1rem;
    }
    
    .actions {
      flex-direction: column;
    }
  }
  </style>