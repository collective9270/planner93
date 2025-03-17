import { defineStore } from 'pinia'
import { ref } from 'vue'
import { supabase } from '../lib/supabase'

export const useProjectsStore = defineStore('projects', () => {
  const projects = ref([])
  const loading = ref(false)
  const error = ref(null)

  // Getters
  const getProjectById = (id) => {
    return projects.value.find(project => project.id === id)
  }

  // Actions
  async function fetchProjects() {
    loading.value = true
    error.value = null
    
    try {
      // First fetch all projects
      const { data: projectsData, error: projectsError } = await supabase
        .from('projects')
        .select('*')
        .order('created_at', { ascending: false })
      
      if (projectsError) throw projectsError
      
      if (projectsData && projectsData.length > 0) {
        // Collect unique client and manager IDs
        const clientIds = [...new Set(projectsData.filter(p => p.client_id).map(p => p.client_id))]
        const managerIds = [...new Set(projectsData.filter(p => p.manager_id).map(p => p.manager_id))]
        
        // Fetch clients data
        const { data: clientsData } = await supabase
          .from('clients')
          .select('id, name')
          .in('id', clientIds)
        
        // Fetch users data for managers
        const { data: managersData } = await supabase
          .from('users')
          .select('id, name')
          .in('id', managerIds)
        
        // Create lookup maps
        const clientsMap = clientsData?.reduce((acc, client) => {
          acc[client.id] = client
          return acc
        }, {}) || {}
        
        const managersMap = managersData?.reduce((acc, user) => {
          acc[user.id] = user
          return acc
        }, {}) || {}
        
        // Map projects with client and manager data
        projects.value = projectsData.map(project => ({
          ...project,
          client_name: (project.client_id && clientsMap[project.client_id]?.name) || 'Unknown Client',
          manager_name: (project.manager_id && managersMap[project.manager_id]?.name) || 'Unknown Manager'
        }))
      } else {
        projects.value = []
      }
    } catch (err) {
      error.value = err.message
      console.error('Error fetching projects:', err)
    } finally {
      loading.value = false
    }
  }

  async function createProject(projectData) {
    loading.value = true
    error.value = null
    
    try {
      // Make a copy of the project data for modifications
      const dataToSend = { ...projectData };
      
      // Log the data being sent to the database
      console.log('Creating project with data:', dataToSend);
      
      const { data, error: createError } = await supabase
        .from('projects')
        .insert([dataToSend])
        .select()
      
      if (createError) throw createError
      
      if (data && data[0]) {
        // Fetch the new project with related data
        await fetchProjects()
        return data[0]
      }
      
      return null
    } catch (err) {
      error.value = err.message
      console.error('Error creating project:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  async function updateProject(id, projectData) {
    loading.value = true
    error.value = null
    
    try {
      const { data, error: updateError } = await supabase
        .from('projects')
        .update(projectData)
        .eq('id', id)
        .select()
      
      if (updateError) throw updateError
      
      if (data && data[0]) {
        // Update the project in the local state
        const index = projects.value.findIndex(p => p.id === id)
        if (index !== -1) {
          projects.value[index] = {
            ...projects.value[index],
            ...data[0]
          }
        }
        return data[0]
      }
      
      return null
    } catch (err) {
      error.value = err.message
      console.error('Error updating project:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  async function deleteProject(id) {
    loading.value = true
    error.value = null
    
    try {
      // First delete project assignments
      const { error: assignmentsError } = await supabase
        .from('project_assignments')
        .delete()
        .eq('project_id', id)
      
      if (assignmentsError) throw assignmentsError
      
      // Then delete the project
      const { error: deleteError } = await supabase
        .from('projects')
        .delete()
        .eq('id', id)
      
      if (deleteError) throw deleteError
      
      // Remove project from local state
      projects.value = projects.value.filter(p => p.id !== id)
      return true
    } catch (err) {
      error.value = err.message
      console.error('Error deleting project:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  return {
    projects,
    loading,
    error,
    getProjectById,
    fetchProjects,
    createProject,
    updateProject,
    deleteProject
  }
}) 