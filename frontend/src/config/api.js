const getEnvironment = () => {
  if (typeof window !== 'undefined' && window.location.hostname.includes('vercel.app')) {
    return 'production'
  }
  if (typeof window !== 'undefined' && !window.location.hostname.includes('localhost') && !window.location.hostname.includes('127.0.0.1')) {
    return 'production'
  }
  return import.meta.env.VITE_NODE_ENV || import.meta.env.NODE_ENV || 'development'
}

const isProduction = () => {
  if (typeof window !== 'undefined') {
    return window.location.hostname.includes('vercel.app') || 
           (!window.location.hostname.includes('localhost') && !window.location.hostname.includes('127.0.0.1'))
  }
  return getEnvironment() === 'production'
}

const isDevelopment = () => {
  return getEnvironment() === 'development'
}
const getUrl = (devUrl, prodUrl) => {
  return isProduction() ? prodUrl : devUrl
}

export const API_CONFIG = {
  API_URL: getUrl(
    import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
    import.meta.env.VITE_PROD_API_URL || 'https://mindsprint-backend-meditrack.onrender.com/api'
  ),
  SERVER_URL: getUrl(
    import.meta.env.VITE_SERVER_URL || 'http://localhost:5000',
    import.meta.env.VITE_PROD_SERVER_URL || 'https://mindsprint-backend-meditrack.onrender.com'
  ),
  SOCKET_URL: getUrl(
    import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000',
    import.meta.env.VITE_PROD_SOCKET_URL || 'https://mindsprint-backend-meditrack.onrender.com'
  ),
  FRONTEND_URL: getUrl(
    import.meta.env.VITE_FRONTEND_URL || 'http://localhost:5173',
    import.meta.env.VITE_PROD_FRONTEND_URL || 'https://meditrack-mindsprint.vercel.app'
  ),
  IS_PRODUCTION: isProduction(),
  IS_DEVELOPMENT: isDevelopment(),
  ENVIRONMENT: getEnvironment(),
}
export const getApiUrl = (endpoint = '') => {
  return `${API_CONFIG.API_URL}${endpoint.startsWith('/') ? '' : '/'}${endpoint}`
}
export const getServerUrl = (path = '') => {
  return `${API_CONFIG.SERVER_URL}${path.startsWith('/') ? '' : '/'}${path}`
}
export const getSocketUrl = () => {
  return API_CONFIG.SOCKET_URL
}
export const createApiHeaders = (token = null, additionalHeaders = {}) => {
  const headers = {
    'Content-Type': 'application/json',
    ...additionalHeaders
  }
  if (token) {
    headers.Authorization = `Bearer ${token}`
  }
  return headers
}
export const logEnvironment = () => {
  console.log('🔧 MediTrack Environment Configuration:')
  console.log('  Environment:', API_CONFIG.ENVIRONMENT)
  console.log('  Hostname:', typeof window !== 'undefined' ? window.location.hostname : 'N/A')
  console.log('  API URL:', API_CONFIG.API_URL)
  console.log('  Server URL:', API_CONFIG.SERVER_URL)
  console.log('  Socket URL:', API_CONFIG.SOCKET_URL)
  console.log('  Frontend URL:', API_CONFIG.FRONTEND_URL)
  console.log('  Is Production:', API_CONFIG.IS_PRODUCTION)
  console.log('  VITE_NODE_ENV:', import.meta.env.VITE_NODE_ENV)
}

export const API_BASE = API_CONFIG.API_URL
export const SERVER_BASE = API_CONFIG.SERVER_URL
export default API_CONFIG
