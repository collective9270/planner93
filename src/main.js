import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'

// Import Tailwind CSS
import './assets/tailwind.css'

// Create the app instance
const app = createApp(App)

// Use Pinia for state management
app.use(createPinia())

// Use Vue Router
app.use(router)

// Mount the app
app.mount('#app')