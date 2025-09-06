import { useState, useEffect } from 'react'
import { Layout } from '../../components/Layout.jsx'
import { Card } from '../../components/Card.jsx'
import { motion } from 'framer-motion'
import { useAuth } from '../../context/AuthContext.jsx'
import { Users,  UserCheck,  Activity,  TrendingUp,  AlertTriangle, CheckCircle2, Clock, Shield, Stethoscope, Heart, Database, Server, BarChart3, PieChart, Calendar, Mail, Settings, UserX, UserPlus, Bell, Download, Filter, Search, RefreshCw, Eye, Edit, Trash2, MoreVertical, LogOut, User, FileText} from 'lucide-react'
import { 
  UserGrowthChart, 
  UserDistributionChart, 
  DoctorSpecializationChart, 
  MonthlyTrendsChart 
} from '../../components/Charts.jsx'

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'
const SERVER_BASE = import.meta.env.VITE_SERVER_URL || 'http://localhost:5000'

const getDocumentUrl = (documentPath) => {
  if (!documentPath) return null
  console.log('Raw document path from DB:', documentPath)
  let cleanPath = documentPath.toString().trim().replace(/^\/+|\/+$/g, '')
  cleanPath = cleanPath.replace(/\\/g, '/')
  cleanPath = cleanPath.replace(/^uploads\/+uploads\/+/, 'uploads/')
  if (!cleanPath.startsWith('uploads/')) {
    cleanPath = `uploads/${cleanPath}`
  }
  const finalUrl = `${SERVER_BASE}/${cleanPath}`
  console.log('Final constructed URL:', finalUrl)
  
  return finalUrl
}

export const AdminDashboard = () => {
  const { logout, token } = useAuth()
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalDoctors: 0,
    pendingDoctors: 0,
    activeUsers: 0,
    systemUptime: '0%',
    totalPrescriptions: 0,
    totalMedicines: 0
  })
  const [loading, setLoading] = useState(true)
  const [recentActivity, setRecentActivity] = useState([])
  const [pendingDoctors, setPendingDoctors] = useState([])
  const [selectedDoctor, setSelectedDoctor] = useState(null)
  const [approving, setApproving] = useState(false)
  const [rejecting, setRejecting] = useState(false)
  const [systemMetrics, setSystemMetrics] = useState({
    cpuUsage: 45,
    memoryUsage: 62,
    diskUsage: 38,
    networkLoad: 23
  })

  // Chart data states
  const [userGrowthData, setUserGrowthData] = useState([])
  const [userDistributionData, setUserDistributionData] = useState(null)
  const [chartsLoading, setChartsLoading] = useState(true)
  const [realTimeSystemHealth, setRealTimeSystemHealth] = useState(null)
  const [systemHealthLoading, setSystemHealthLoading] = useState(true)
  const [autoRefresh, setAutoRefresh] = useState(true)

  const nav = [
    { to: '/dashboard/admin', label: 'Overview', icon: BarChart3 },
    { to: '/dashboard/admin/users', label: 'User Management', icon: Users },
    { to: '/dashboard/admin/doctors', label: 'Doctor Approval', icon: UserCheck },
    { to: '/dashboard/admin/analytics', label: 'Analytics', icon: TrendingUp },
    { to: '/dashboard/admin/system', label: 'System Health', icon: Server },
    { to: '/dashboard/admin/settings', label: 'Settings', icon: Settings }
  ]

  const fetchDashboardStats = async () => {
    try {
      const response = await fetch(`${API_BASE}/admin/dashboard/stats`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        setStats(data.stats)
      }
    } catch (error) {
      console.error('Failed to fetch dashboard stats:', error)
    }
  }

  const fetchRecentActivity = async () => {
    try {
      const response = await fetch(`${API_BASE}/admin/dashboard/activity`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        setRecentActivity(data.activities)
      }
    } catch (error) {
      console.error('Failed to fetch recent activity:', error)
    }
  }

  const fetchPendingDoctors = async () => {
    try {
      const response = await fetch(`${API_BASE}/admin/doctors/pending`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        setPendingDoctors(data.doctors)
      }
    } catch (error) {
      console.error('Failed to fetch pending doctors:', error)
    }
  }

  const fetchUserGrowthData = async () => {
    try {
      const response = await fetch(`${API_BASE}/analytics/admin/user-growth`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        setUserGrowthData(data.data)
      }
    } catch (error) {
      console.error('Failed to fetch user growth data:', error)
    }
  }

  const fetchUserDistributionData = async () => {
    try {
      const response = await fetch(`${API_BASE}/analytics/admin/user-distribution`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        setUserDistributionData(data.data)
      }
    } catch (error) {
      console.error('Failed to fetch user distribution data:', error)
    }
  }

  const fetchSystemHealthData = async () => {
    try {
      const response = await fetch(`${API_BASE}/analytics/admin/system-health`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        setRealTimeSystemHealth(data.data)
        
        // Update the legacy systemMetrics state for backward compatibility
        if (data.data && data.data.metrics) {
          setSystemMetrics({
            cpuUsage: data.data.metrics.cpuUsage,
            memoryUsage: data.data.metrics.memoryUsage,
            diskUsage: data.data.metrics.diskUsage,
            networkLoad: data.data.metrics.networkLoad
          })
        }
      }
    } catch (error) {
      console.error('Failed to fetch system health data:', error)
    } finally {
      setSystemHealthLoading(false)
    }
  }

  const refreshData = async () => {
    setLoading(true)
    setChartsLoading(true)
    setSystemHealthLoading(true)
    await Promise.all([
      fetchDashboardStats(),
      fetchRecentActivity(),
      fetchPendingDoctors(),
      fetchUserGrowthData(),
      fetchUserDistributionData(),
      fetchSystemHealthData()
    ])
    setLoading(false)
    setChartsLoading(false)
  }

  const handleApproveDoctor = async (doctorId) => {
    setApproving(true)
    try {
      const response = await fetch(`${API_BASE}/admin/doctors/${doctorId}/approve`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
      
      if (response.ok) {
        await refreshData()
        setSelectedDoctor(null)
      }
    } catch (error) {
      console.error('Failed to approve doctor:', error)
    } finally {
      setApproving(false)
    }
  }

  const handleRejectDoctor = async (doctorId) => {
    const reason = prompt('Please provide a reason for rejection:')
    if (!reason) return

    setRejecting(true)
    try {
      const response = await fetch(`${API_BASE}/admin/doctors/${doctorId}/reject`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ reason })
      })
      
      if (response.ok) {
        await refreshData()
        setSelectedDoctor(null)
      }
    } catch (error) {
      console.error('Failed to reject doctor:', error)
    } finally {
      setRejecting(false)
    }
  }

  useEffect(() => {
    if (token) {
      refreshData()
    }
  }, [token])

  // Auto-refresh system health every 30 seconds
  useEffect(() => {
    let interval = null;
    if (autoRefresh && token) {
      interval = setInterval(() => {
        fetchSystemHealthData();
      }, 30000); // Refresh every 30 seconds
    }
    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [autoRefresh, token])

  // Auto-refresh all data every 5 minutes
  useEffect(() => {
    let interval = null;
    if (autoRefresh && token) {
      interval = setInterval(() => {
        refreshData();
      }, 300000); // Refresh every 5 minutes
    }
    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [autoRefresh, token])

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  }

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 }
  }

  const StatCard = ({ icon: Icon, title, value, change, changeType, color = "text-primary" }) => (
    <motion.div variants={itemVariants}>
      <Card className="p-6 hover:shadow-lg transition-all duration-300 border border-slate-200 dark:border-slate-700">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center space-x-3">
              <div className={`p-3 rounded-2xl bg-gradient-to-br ${
                color === 'text-primary' ? 'from-primary/20 to-primary/10' :
                color === 'text-blue-600' ? 'from-blue-500/20 to-blue-400/10' :
                color === 'text-green-600' ? 'from-green-500/20 to-green-400/10' :
                color === 'text-orange-600' ? 'from-orange-500/20 to-orange-400/10' :
                'from-red-500/20 to-red-400/10'
              }`}>
                <Icon className={`w-6 h-6 ${color}`} />
              </div>
              <div>
                <h3 className="text-sm font-medium text-slate-600 dark:text-slate-400">{title}</h3>
                <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{value}</p>
              </div>
            </div>
            {change && (
              <div className="flex items-center space-x-1 mt-3">
                <TrendingUp className={`w-4 h-4 ${changeType === 'positive' ? 'text-green-500' : 'text-red-500'}`} />
                <span className={`text-sm font-medium ${changeType === 'positive' ? 'text-green-600' : 'text-red-600'}`}>
                  {change}
                </span>
                <span className="text-sm text-slate-500">vs last month</span>
              </div>
            )}
          </div>
        </div>
      </Card>
    </motion.div>
  )

  const ActivityItem = ({ activity }) => {
    const getStatusColor = (status) => {
      switch (status) {
        case 'success': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
        case 'warning': return 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400'
        case 'error': return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
        default: return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400'
      }
    }

    const getStatusIcon = (type) => {
      switch (type) {
        case 'user_registered': return <UserPlus className="w-4 h-4" />
        case 'doctor_approved': return <UserCheck className="w-4 h-4" />
        case 'system_alert': return <AlertTriangle className="w-4 h-4" />
        case 'backup_complete': return <CheckCircle2 className="w-4 h-4" />
        default: return <Activity className="w-4 h-4" />
      }
    }

    return (
      <div className="flex items-start space-x-3 p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-lg transition-colors">
        <div className={`p-2 rounded-lg ${getStatusColor(activity.status)}`}>
          {getStatusIcon(activity.type)}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-slate-900 dark:text-white">{activity.message}</p>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{activity.time}</p>
        </div>
      </div>
    )
  }

  const SystemMetric = ({ label, value, color = "bg-primary", icon: Icon, status }) => (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-2">
          {Icon && <Icon className="w-4 h-4 text-slate-500 dark:text-slate-400" />}
          <span className="text-sm font-medium text-slate-600 dark:text-slate-400">{label}</span>
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-sm font-bold text-slate-900 dark:text-white">{value}%</span>
          {status && (
            <div className={`w-2 h-2 rounded-full ${
              status === 'healthy' ? 'bg-green-500' :
              status === 'warning' ? 'bg-yellow-500' : 'bg-red-500'
            }`} />
          )}
        </div>
      </div>
      <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2.5">
        <div 
          className={`h-2.5 rounded-full ${color} transition-all duration-1000 ease-in-out`}
          style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
        ></div>
      </div>
    </div>
  )

  const PendingDoctorCard = ({ doctor, onRefresh, onViewDetails }) => {
    const [approving, setApproving] = useState(false)
    const [rejecting, setRejecting] = useState(false)
    const [showDetails, setShowDetails] = useState(false)

    const handleApprove = async () => {
      setApproving(true)
      try {
        const response = await fetch(`${API_BASE}/admin/doctors/${doctor.id}/approve`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        })
        
        if (response.ok) {
          onRefresh()
        }
      } catch (error) {
        console.error('Failed to approve doctor:', error)
      } finally {
        setApproving(false)
      }
    }

    const handleReject = async () => {
      const reason = prompt('Please provide a reason for rejection:')
      if (!reason) return

      setRejecting(true)
      try {
        const response = await fetch(`${API_BASE}/admin/doctors/${doctor.id}/reject`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ rejectionReason: reason })
        })
        
        if (response.ok) {
          onRefresh()
        }
      } catch (error) {
        console.error('Failed to reject doctor:', error)
      } finally {
        setRejecting(false)
      }
    }

    return (
      <>
        <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-gradient-to-br from-primary/20 to-primary/10 rounded-full flex items-center justify-center">
              <Stethoscope className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h4 className="font-semibold text-slate-900 dark:text-white">{doctor.name}</h4>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                {doctor.specialization} • {doctor.experience} years experience
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-500">{doctor.email}</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onViewDetails(doctor)}
              className="px-3 py-1.5 bg-blue-500 text-white text-sm rounded-md hover:bg-blue-600 transition-colors"
            >
              <Eye className="w-4 h-4" />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleApprove}
              disabled={approving || rejecting}
              className="px-3 py-1.5 bg-green-500 text-white text-sm rounded-md hover:bg-green-600 transition-colors disabled:opacity-50"
            >
              {approving ? 'Approving...' : 'Approve'}
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleReject}
              disabled={approving || rejecting}
              className="px-3 py-1.5 bg-red-500 text-white text-sm rounded-md hover:bg-red-600 transition-colors disabled:opacity-50"
            >
              {rejecting ? 'Rejecting...' : 'Reject'}
            </motion.button>
          </div>
        </div>{showDetails && (
          <DoctorDetailsModal 
            doctor={doctor} 
            onClose={() => setShowDetails(false)}
            onApprove={handleApprove}
            onReject={handleReject}
            approving={approving}
            rejecting={rejecting}
          />
        )}
      </>
    )
  }

  const DoctorDetailsModal = ({ doctor, onClose, onApprove, onReject, approving, rejecting }) => {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4" style={{ zIndex: 99999 }}>
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className="bg-white dark:bg-slate-800 rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto relative"
          style={{ zIndex: 100000 }}
        >
          <div className="sticky top-0 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 px-6 py-4 flex items-center justify-between"
               style={{ zIndex: 100001 }}>
            <h3 className="text-xl font-semibold text-slate-900 dark:text-white">
              Doctor Application Details
            </h3>
            <button
              onClick={onClose}
              className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
            >
              <span className="sr-only">Close</span>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="p-6 space-y-8"><div>
              <h4 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center">
                <User className="w-5 h-5 mr-2 text-primary" />
                Basic Information
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-slate-50 dark:bg-slate-900/50 rounded-lg">
                <div>
                  <label className="text-sm font-medium text-slate-600 dark:text-slate-400">Full Name</label>
                  <p className="text-slate-900 dark:text-white font-medium">{doctor.name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-600 dark:text-slate-400">Email Address</label>
                  <p className="text-slate-900 dark:text-white">{doctor.email}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-600 dark:text-slate-400">Mobile Number</label>
                  <p className="text-slate-900 dark:text-white">{doctor.mobile || 'Not provided'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-600 dark:text-slate-400">Registration Date</label>
                  <p className="text-slate-900 dark:text-white">
                    {new Date(doctor.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div><div>
              <h4 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center">
                <Stethoscope className="w-5 h-5 mr-2 text-primary" />
                Professional Information
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-slate-50 dark:bg-slate-900/50 rounded-lg">
                <div>
                  <label className="text-sm font-medium text-slate-600 dark:text-slate-400">Medical License</label>
                  <p className="text-slate-900 dark:text-white font-mono text-sm bg-slate-200 dark:bg-slate-800 px-2 py-1 rounded">
                    {doctor.medicalLicense}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-600 dark:text-slate-400">Specialization</label>
                  <p className="text-slate-900 dark:text-white">{doctor.specialization}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-600 dark:text-slate-400">Years of Experience</label>
                  <p className="text-slate-900 dark:text-white">{doctor.experience} years</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-600 dark:text-slate-400">Education</label>
                  <p className="text-slate-900 dark:text-white">{doctor.education}</p>
                </div>
                <div className="md:col-span-2">
                  <label className="text-sm font-medium text-slate-600 dark:text-slate-400">Hospital/Clinic Affiliation</label>
                  <p className="text-slate-900 dark:text-white">{doctor.hospitalAffiliation}</p>
                </div>
                {doctor.consultationFee && (
                  <div>
                    <label className="text-sm font-medium text-slate-600 dark:text-slate-400">Consultation Fee</label>
                    <p className="text-slate-900 dark:text-white">₹{doctor.consultationFee}</p>
                  </div>
                )}
              </div>
            </div>{doctor.bio && (
              <div>
                <h4 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center">
                  <FileText className="w-5 h-5 mr-2 text-primary" />
                  Professional Bio
                </h4>
                <div className="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-lg">
                  <p className="text-slate-700 dark:text-slate-300 leading-relaxed">{doctor.bio}</p>
                </div>
              </div>
            )}<div>
              <h4 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center">
                <Clock className="w-5 h-5 mr-2 text-primary" />
                Availability & Services
              </h4>
              <div className="space-y-4">
                {doctor.timeSlots && doctor.timeSlots.length > 0 && (
                  <div className="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-lg">
                    <label className="text-sm font-medium text-slate-600 dark:text-slate-400 block mb-2">
                      Available Time Slots
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {doctor.timeSlots.map((slot, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium"
                        >
                          {slot}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {doctor.consultationMode && doctor.consultationMode.length > 0 && (
                  <div className="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-lg">
                    <label className="text-sm font-medium text-slate-600 dark:text-slate-400 block mb-2">
                      Consultation Modes
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {doctor.consultationMode.map((mode, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400 rounded-full text-sm font-medium"
                        >
                          {mode}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {doctor.languages && doctor.languages.length > 0 && (
                  <div className="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-lg">
                    <label className="text-sm font-medium text-slate-600 dark:text-slate-400 block mb-2">
                      Languages Spoken
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {doctor.languages.map((language, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400 rounded-full text-sm font-medium"
                        >
                          {language}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>{doctor.documents && (
              <div>
                <h4 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center">
                  <FileText className="w-5 h-5 mr-2 text-primary" />
                  Uploaded Documents
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {doctor.documents.licenseProof && (
                    <div className="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-lg text-center">
                      <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/20 rounded-lg mx-auto mb-3 flex items-center justify-center">
                        <Shield className="w-8 h-8 text-blue-600" />
                      </div>
                      <h5 className="font-medium text-slate-900 dark:text-white mb-2">Medical License</h5>
                      <a
                        href={getDocumentUrl(doctor.documents.licenseProof)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center text-sm text-primary hover:text-primary/80"
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        View Document
                      </a>
                    </div>
                  )}
                  
                  {doctor.documents.governmentId && (
                    <div className="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-lg text-center">
                      <div className="w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-lg mx-auto mb-3 flex items-center justify-center">
                        <FileText className="w-8 h-8 text-green-600" />
                      </div>
                      <h5 className="font-medium text-slate-900 dark:text-white mb-2">Government ID</h5>
                      <a
                        href={getDocumentUrl(doctor.documents.governmentId)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center text-sm text-primary hover:text-primary/80"
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        View Document
                      </a>
                    </div>
                  )}
                  
                  {doctor.documents.profilePhoto && (
                    <div className="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-lg text-center">
                      <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900/20 rounded-lg mx-auto mb-3 flex items-center justify-center">
                        <User className="w-8 h-8 text-purple-600" />
                      </div>
                      <h5 className="font-medium text-slate-900 dark:text-white mb-2">Profile Photo</h5>
                      <a
                        href={getDocumentUrl(doctor.documents.profilePhoto)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center text-sm text-primary hover:text-primary/80"
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        View Photo
                      </a>
                    </div>
                  )}
                </div>
              </div>
            )}<div className="flex items-center justify-between pt-6 border-t border-slate-200 dark:border-slate-700">
              <button
                onClick={onClose}
                className="px-6 py-2 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
              >
                Close
              </button>
              <div className="flex items-center space-x-3">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    onReject()
                    onClose()
                  }}
                  disabled={approving || rejecting}
                  className="px-6 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50 flex items-center space-x-2"
                >
                  <UserX className="w-4 h-4" />
                  <span>{rejecting ? 'Rejecting...' : 'Reject Application'}</span>
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    onApprove()
                    onClose()
                  }}
                  disabled={approving || rejecting}
                  className="px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50 flex items-center space-x-2"
                >
                  <UserCheck className="w-4 h-4" />
                  <span>{approving ? 'Approving...' : 'Approve Doctor'}</span>
                </motion.button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    )
  }

  return (
    <>
      <Layout items={nav}>
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="space-y-6"
      >
        <motion.div variants={itemVariants} className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Admin Dashboard</h1>
            <p className="text-slate-600 dark:text-slate-400 mt-1">Monitor and manage your MediTrack platform</p>
          </div>
          <div className="flex items-center space-x-3 mt-4 sm:mt-0">
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={refreshData}
              disabled={loading}
              className="flex items-center space-x-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              <span>{loading ? 'Refreshing...' : 'Refresh'}</span>
            </motion.button>
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center space-x-2 px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
            >
              <Download className="w-4 h-4" />
              <span>Export</span>
            </motion.button>
          </div>
        </motion.div>
        <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard 
            icon={Users} 
            title="Total Users" 
            value={stats.totalUsers.toLocaleString()} 
            change="+12.5%" 
            changeType="positive"
            color="text-primary"
          />
          <StatCard 
            icon={Stethoscope} 
            title="Active Doctors" 
            value={stats.totalDoctors} 
            change="+8.2%" 
            changeType="positive"
            color="text-blue-600"
          />
          <StatCard 
            icon={UserCheck} 
            title="Pending Approvals" 
            value={stats.pendingDoctors} 
            change="-5.1%" 
            changeType="positive"
            color="text-orange-600"
          />
          {/* <StatCard 
            icon={Activity} 
            title="Avg Adherence" 
            value={`${stats.averageAdherence}%`} 
            change="+3.2%" 
            changeType="positive"
            color="text-green-600"
          /> */}
        </motion.div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <motion.div variants={itemVariants} className="lg:col-span-2">
            <Card className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-slate-900 dark:text-white">Recent Activity</h3>
                <button className="text-primary hover:text-primary/80 text-sm font-medium">View All</button>
              </div>
              <div className="space-y-2">
                {recentActivity.length > 0 ? (
                  recentActivity.map((activity) => (
                    <ActivityItem key={activity.id} activity={activity} />
                  ))
                ) : (
                  <div className="text-center py-8 text-slate-500">
                    {loading ? 'Loading activities...' : 'No recent activity found'}
                  </div>
                )}
              </div>
            </Card>
          </motion.div>
          <motion.div variants={itemVariants}>
            <Card className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-xl font-semibold text-slate-900 dark:text-white">System Health</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                    Real-time system monitoring • Auto-refresh: {autoRefresh ? 'ON' : 'OFF'}
                  </p>
                </div>
                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => setAutoRefresh(!autoRefresh)}
                    className={`p-2 rounded-lg transition-colors ${
                      autoRefresh 
                        ? 'bg-green-100 text-green-600 dark:bg-green-900/20 dark:text-green-400' 
                        : 'bg-gray-100 text-gray-600 dark:bg-gray-900/20 dark:text-gray-400'
                    }`}
                    title={autoRefresh ? 'Disable auto-refresh' : 'Enable auto-refresh'}
                  >
                    <RefreshCw className={`w-4 h-4 ${autoRefresh ? 'animate-spin' : ''}`} />
                  </button>
                  <div className="flex items-center space-x-2">
                    <div className={`w-2 h-2 rounded-full animate-pulse ${
                      systemHealthLoading ? 'bg-yellow-500' :
                      realTimeSystemHealth?.services?.database?.status === 'healthy' ? 'bg-green-500' : 'bg-red-500'
                    }`}></div>
                    <span className={`text-sm font-medium ${
                      systemHealthLoading ? 'text-yellow-600' :
                      realTimeSystemHealth?.services?.database?.status === 'healthy' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {systemHealthLoading ? 'Loading...' : 
                       realTimeSystemHealth?.services?.database?.status === 'healthy' ? 'Healthy' : 'Issues'}
                    </span>
                  </div>
                </div>
              </div>

              {systemHealthLoading ? (
                <div className="space-y-4">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="animate-pulse">
                      <div className="flex justify-between items-center mb-2">
                        <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-24"></div>
                        <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-12"></div>
                      </div>
                      <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2.5">
                        <div className="h-2.5 bg-slate-300 dark:bg-slate-600 rounded-full w-1/2"></div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-4">
                  <SystemMetric 
                    label="CPU Usage" 
                    value={realTimeSystemHealth?.metrics?.cpuUsage || systemMetrics.cpuUsage} 
                    color="bg-blue-500" 
                    icon={Server}
                    status={realTimeSystemHealth?.metrics?.cpuUsage > 80 ? 'warning' : 'healthy'}
                  />
                  <SystemMetric 
                    label="Memory" 
                    value={realTimeSystemHealth?.metrics?.memoryUsage || systemMetrics.memoryUsage} 
                    color="bg-green-500" 
                    icon={Database}
                    status={realTimeSystemHealth?.metrics?.memoryUsage > 85 ? 'warning' : 'healthy'}
                  />
                  <SystemMetric 
                    label="Storage" 
                    value={realTimeSystemHealth?.metrics?.diskUsage || systemMetrics.diskUsage} 
                    color="bg-yellow-500" 
                    icon={Database}
                    status={realTimeSystemHealth?.metrics?.diskUsage > 90 ? 'warning' : 'healthy'}
                  />
                  <SystemMetric 
                    label="Network" 
                    value={realTimeSystemHealth?.metrics?.networkLoad || systemMetrics.networkLoad} 
                    color="bg-purple-500" 
                    icon={Activity}
                    status="healthy"
                  />
                </div>
              )}

              <div className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-700">
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-slate-600 dark:text-slate-400">Uptime</span>
                    <span className="text-sm font-bold text-green-600">
                      {realTimeSystemHealth?.metrics?.uptime || stats.systemUptime}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-slate-600 dark:text-slate-400">DB Response</span>
                    <span className="text-sm font-bold text-blue-600">
                      {realTimeSystemHealth?.services?.database?.responseTime || '<100ms'}
                    </span>
                  </div>
                </div>
                
                {realTimeSystemHealth?.performance && (
                  <div className="mt-4 grid grid-cols-2 gap-4 text-xs">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Requests/min</span>
                      <span className="text-slate-700 dark:text-slate-300 font-medium">
                        {realTimeSystemHealth.performance.requestsPerMinute}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Active Connections</span>
                      <span className="text-slate-700 dark:text-slate-300 font-medium">
                        {realTimeSystemHealth.performance.activeConnections}
                      </span>
                    </div>
                  </div>
                )}

                <div className="mt-4 text-xs text-slate-400 dark:text-slate-500 text-center">
                  Last updated: {realTimeSystemHealth?.timestamp ? 
                    new Date(realTimeSystemHealth.timestamp).toLocaleTimeString() : 
                    'Never'
                  }
                </div>
              </div>
            </Card>
          </motion.div>
        </div>

        {pendingDoctors.length > 0 && (
          <motion.div variants={itemVariants}>
            <Card className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-slate-900 dark:text-white">
                  Pending Doctor Applications ({pendingDoctors.length})
                </h3>
                <button 
                  onClick={() => window.location.href = '/dashboard/admin/doctors'}
                  className="text-primary hover:text-primary/80 text-sm font-medium"
                >
                  View All
                </button>
              </div>
              <div className="space-y-4">
                {pendingDoctors.slice(0, 3).map((doctor) => (
                  <PendingDoctorCard 
                    key={doctor.id} 
                    doctor={doctor} 
                    onRefresh={refreshData} 
                    onViewDetails={setSelectedDoctor}
                  />
                ))}
              </div>
            </Card>
          </motion.div>
        )}
        {/* <motion.div variants={itemVariants}>
          <Card className="p-6">
            <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-6">Quick Actions</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <motion.button 
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="flex items-center space-x-3 p-4 bg-primary/10 dark:bg-primary/20 text-primary rounded-lg hover:bg-primary/20 dark:hover:bg-primary/30 transition-colors"
              >
                <UserPlus className="w-5 h-5" />
                <span className="font-medium">Add User</span>
              </motion.button>
              <motion.button 
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="flex items-center space-x-3 p-4 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors"
              >
                <UserCheck className="w-5 h-5" />
                <span className="font-medium">Approve Doctor</span>
              </motion.button>
              <motion.button 
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="flex items-center space-x-3 p-4 bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors"
              >
                <Database className="w-5 h-5" />
                <span className="font-medium">Backup Data</span>
              </motion.button>
              <motion.button 
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  console.log('Admin dashboard logout clicked')
                  logout()
                }}
                className="flex items-center space-x-3 p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
              >
                <LogOut className="w-5 h-5" />
                <span className="font-medium">Logout</span>
              </motion.button>
            </div>
          </Card>
        </motion.div> */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <motion.div variants={itemVariants}>
            <Card className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-xl font-semibold text-slate-900 dark:text-white">User Growth</h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                    Monthly user registration trends over the last 12 months
                  </p>
                </div>
                <div className="flex items-center space-x-2 text-sm text-slate-500 dark:text-slate-400">
                  <TrendingUp className="w-4 h-4" />
                  <span>Live Data</span>
                </div>
              </div>
              <UserGrowthChart data={userGrowthData} loading={chartsLoading} />
              {userGrowthData.length > 0 && !chartsLoading && (
                <div className="mt-4 grid grid-cols-3 gap-4 pt-4 border-t border-slate-200 dark:border-slate-700">
                  <div className="text-center">
                    <p className="text-sm font-medium text-slate-900 dark:text-white">
                      {userGrowthData[userGrowthData.length - 1]?.totalUsers?.toLocaleString() || '0'}
                    </p>
                    <p className="text-xs text-slate-500">Total Users</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-medium text-green-600">
                      +{userGrowthData[userGrowthData.length - 1]?.newUsers || '0'}
                    </p>
                    <p className="text-xs text-slate-500">This Month</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-medium text-blue-600">
                      {Math.round(userGrowthData.reduce((sum, month) => sum + (month.newUsers || 0), 0) / 12)}
                    </p>
                    <p className="text-xs text-slate-500">Monthly Avg</p>
                  </div>
                </div>
              )}
            </Card>
          </motion.div>
          
          <motion.div variants={itemVariants}>
            <Card className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-xl font-semibold text-slate-900 dark:text-white">User Distribution</h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                    Distribution of users by role across the platform
                  </p>
                </div>
                <div className="flex items-center space-x-2 text-sm text-slate-500 dark:text-slate-400">
                  <PieChart className="w-4 h-4" />
                  <span>Live Data</span>
                </div>
              </div>
              <UserDistributionChart data={userDistributionData} loading={chartsLoading} />
              {userDistributionData && !chartsLoading && (
                <div className="mt-4 grid grid-cols-2 gap-4 pt-4 border-t border-slate-200 dark:border-slate-700">
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-slate-600 dark:text-slate-400">Patients</span>
                      <span className="text-sm font-medium text-slate-900 dark:text-white">
                        {userDistributionData.summary?.totalPatients || 0}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-slate-600 dark:text-slate-400">Doctors</span>
                      <span className="text-sm font-medium text-slate-900 dark:text-white">
                        {userDistributionData.summary?.totalDoctors || 0}
                      </span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-slate-600 dark:text-slate-400">Approved Doctors</span>
                      <span className="text-sm font-medium text-green-600">
                        {userDistributionData.summary?.approvedDoctors || 0}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-slate-600 dark:text-slate-400">Pending Approval</span>
                      <span className="text-sm font-medium text-orange-600">
                        {userDistributionData.summary?.pendingDoctors || 0}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </Card>
          </motion.div>
        </div>

        {/* Additional Analytics Section */}
        {userDistributionData && userDistributionData.specializationDistribution && userDistributionData.specializationDistribution.length > 0 && (
          <motion.div variants={itemVariants}>
            <Card className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-xl font-semibold text-slate-900 dark:text-white">Doctor Specializations</h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                    Distribution of doctors by medical specialization
                  </p>
                </div>
                <div className="flex items-center space-x-2 text-sm text-slate-500 dark:text-slate-400">
                  <Stethoscope className="w-4 h-4" />
                  <span>Top Specializations</span>
                </div>
              </div>
              <DoctorSpecializationChart data={userDistributionData} loading={chartsLoading} />
            </Card>
          </motion.div>
        )}

        {/* Monthly Registration Trends */}
        {userDistributionData && userDistributionData.monthlyDistribution && userDistributionData.monthlyDistribution.length > 0 && (
          <motion.div variants={itemVariants}>
            <Card className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-xl font-semibold text-slate-900 dark:text-white">Registration Trends</h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                    New user registrations over the last 6 months
                  </p>
                </div>
                <div className="flex items-center space-x-2 text-sm text-slate-500 dark:text-slate-400">
                  <Activity className="w-4 h-4" />
                  <span>Recent Trends</span>
                </div>
              </div>
              <MonthlyTrendsChart data={userDistributionData} loading={chartsLoading} />
            </Card>
          </motion.div>
        )}
      </motion.div>
    </Layout>

    {selectedDoctor && (
      <DoctorDetailsModal 
        doctor={selectedDoctor} 
        onClose={() => setSelectedDoctor(null)}
        onApprove={() => handleApproveDoctor(selectedDoctor._id)}
        onReject={() => handleRejectDoctor(selectedDoctor._id)}
        approving={approving}
        rejecting={rejecting}
      />
    )}
    </>
  )
}
