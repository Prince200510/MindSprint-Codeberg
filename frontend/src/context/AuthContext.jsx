import { createContext, useContext, useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'

const AuthContext = createContext()
const api = axios.create({ baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api' })

export const AuthProvider = ({children}) => {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(() => localStorage.getItem('token'))
  
  useEffect(() => {
    if (token) {
      localStorage.setItem('token', token)
      api.defaults.headers.common.Authorization = 'Bearer ' + token
      api.get('/auth/me').then(r => setUser(r.data)).catch(() => {
        logout()
      })
    }
  }, [token])

  const redirectToDashboard = (userRole) => {
    switch (userRole) {
      case 'admin':
        window.location.href = '/dashboard/admin'
        break
      case 'doctor':
        window.location.href = '/dashboard/doctor'
        break
      case 'user':
        window.location.href = '/dashboard/user'
        break
      default:
        window.location.href = '/'
    }
  }

  const login = async (email, password) => {
    try {
      const r = await api.post('/auth/login', { email, password })
      setToken(r.data.token)
      setUser(r.data.user)
      redirectToDashboard(r.data.user.role)
    } catch (error) {
      throw error
    }
  }

  const register = async (data) => {
    try {
      const r = await api.post('/auth/register', data)
      setToken(r.data.token)
      setUser(r.data.user)
      redirectToDashboard(r.data.user.role)
    } catch (error) {
      throw error
    }
  }

  const logout = () => {
    try {
      setToken(null)
      setUser(null)
      localStorage.removeItem('token')
      delete api.defaults.headers.common.Authorization
      
      setTimeout(() => {
        window.location.replace('/')
      }, 100)
      
    } catch (error) {
      window.location.replace('/')
    }
  }

  return (
    <AuthContext.Provider value={{ user, token, login, register, logout, api }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
