import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

const api = axios.create({
  baseURL: API_URL,
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('observatorio_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

export const registerUser = (payload) => api.post('/auth/register', payload)
export const loginUser = (payload) =>
  api.post('/auth/login', new URLSearchParams({ username: payload.email, password: payload.password }))
export const fetchCurrentUser = () => api.get('/auth/me')

export const fetchWaterBodies = () => api.get('/cuerpos-agua')
export const createWaterBody = (payload) => api.post('/cuerpos-agua', payload)
export const updateWaterBody = (id, payload) => api.put(`/cuerpos-agua/${id}`, payload)
export const deleteWaterBody = (id) => api.delete(`/cuerpos-agua/${id}`)

export const fetchSensors = () => api.get('/sensores')
export const fetchParameters = () => api.get('/parametros')
export const fetchReadings = () => api.get('/lecturas')
export const fetchAlerts = () => api.get('/alertas')
export const fetchProtectedZones = () => api.get('/zonas-protegidas')
export const fetchReports = () => api.get('/reportes')
export const fetchFavorites = () => api.get('/favoritos')
export const createFavorite = (payload) => api.post('/favoritos', payload)

export const fetchStats = () => api.get('/estadisticas')

export default api
