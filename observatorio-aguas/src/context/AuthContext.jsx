import { createContext, useContext, useEffect, useState } from 'react'
import { fetchCurrentUser, loginUser, registerUser } from '../api'

const AuthContext = createContext()

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const loadUser = async () => {
    const token = localStorage.getItem('observatorio_token')
    if (!token) {
      setLoading(false)
      return
    }
    try {
      const { data } = await fetchCurrentUser()
      setUser(data)
    } catch (err) {
      localStorage.removeItem('observatorio_token')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadUser()
  }, [])

  const handleLogin = async (credentials) => {
    setError(null)
    const { data } = await loginUser(credentials)
    localStorage.setItem('observatorio_token', data.access_token)
    await loadUser()
  }

  const handleRegister = async (payload) => {
    setError(null)
    await registerUser(payload)
    await handleLogin({ email: payload.email, password: payload.password })
  }

  const logout = () => {
    localStorage.removeItem('observatorio_token')
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, loading, error, setError, login: handleLogin, register: handleRegister, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
