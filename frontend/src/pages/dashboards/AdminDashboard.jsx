import { useState, useEffect } from 'react'
import { Layout } from '../../components/Layout.jsx'
import { Card } from '../../components/Card.jsx'
import { motion } from 'framer-motion'
import { useAuth } from '../../context/AuthContext.jsx'
import { Users,  UserCheck,  Activity,  TrendingUp,  AlertTriangle, CheckCircle2, Clock, Shield, Stethoscope, Heart, Database, Server, BarChart3, PieChart, Calendar, Mail, Settings, UserX, UserPlus, Bell, Download, Filter, Search, RefreshCw, Eye, Edit, Trash2, MoreVertical, LogOut} from 'lucide-react'

export const AdminDashboard = () => {
  const { logout } = useAuth()
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalDoctors: 0,
    pendingDoctors: 0,
    activeUsers: 0,
    systemUptime: '99.9%',
    averageAdherence: 0
  })

  const [recentActivity, setRecentActivity] = useState([])
  const [systemMetrics, setSystemMetrics] = useState({
    cpuUsage: 45,
    memoryUsage: 62,
    diskUsage: 38,
    networkLoad: 23
  })

  const nav = [
    { to: '/dashboard/admin', label: 'Overview', icon: BarChart3 },
    { to: '/dashboard/admin/users', label: 'User Management', icon: Users },
    { to: '/dashboard/admin/doctors', label: 'Doctor Approval', icon: UserCheck },
    { to: '/dashboard/admin/analytics', label: 'Analytics', icon: TrendingUp },
    { to: '/dashboard/admin/system', label: 'System Health', icon: Server },
    { to: '/dashboard/admin/settings', label: 'Settings', icon: Settings }
  ]

  useEffect(() => {
    setStats({
      totalUsers: 1247,
      totalDoctors: 89,
      pendingDoctors: 12,
      activeUsers: 892,
      systemUptime: '99.9%',
      averageAdherence: 78.5
    })
    setRecentActivity([
      { id: 1, type: 'user_registered', message: 'New patient registered: John Doe', time: '2 minutes ago', status: 'success' },
      { id: 2, type: 'doctor_approved', message: 'Dr. Smith approved as cardiologist', time: '15 minutes ago', status: 'info' },
      { id: 3, type: 'system_alert', message: 'High memory usage detected', time: '1 hour ago', status: 'warning' },
      { id: 4, type: 'backup_complete', message: 'Daily backup completed successfully', time: '2 hours ago', status: 'success' },
      { id: 5, type: 'user_login', message: '45 users logged in today', time: '3 hours ago', status: 'info' }
    ])
  }, [])

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

  const SystemMetric = ({ label, value, color = "bg-primary" }) => (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <span className="text-sm font-medium text-slate-600 dark:text-slate-400">{label}</span>
        <span className="text-sm font-bold text-slate-900 dark:text-white">{value}%</span>
      </div>
      <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
        <div 
          className={`h-2 rounded-full ${color} transition-all duration-500`}
          style={{ width: `${value}%` }}
        ></div>
      </div>
    </div>
  )

  return (
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
              className="flex items-center space-x-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Refresh</span>
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
                {recentActivity.map((activity) => (
                  <ActivityItem key={activity.id} activity={activity} />
                ))}
              </div>
            </Card>
          </motion.div>
          <motion.div variants={itemVariants}>
            <Card className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-slate-900 dark:text-white">System Health</h3>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-sm text-green-600 font-medium">Healthy</span>
                </div>
              </div>
              <div className="space-y-4">
                <SystemMetric label="CPU Usage" value={systemMetrics.cpuUsage} color="bg-blue-500" />
                <SystemMetric label="Memory" value={systemMetrics.memoryUsage} color="bg-green-500" />
                <SystemMetric label="Storage" value={systemMetrics.diskUsage} color="bg-yellow-500" />
                <SystemMetric label="Network" value={systemMetrics.networkLoad} color="bg-purple-500" />
              </div>
              <div className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-700">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-slate-600 dark:text-slate-400">Uptime</span>
                  <span className="text-sm font-bold text-green-600">{stats.systemUptime}</span>
                </div>
              </div>
            </Card>
          </motion.div>
        </div>
        <motion.div variants={itemVariants}>
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
        </motion.div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <motion.div variants={itemVariants}>
            <Card className="p-6">
              <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-6">User Growth</h3>
              <div className="h-64 bg-gradient-to-br from-primary/10 to-blue-500/10 rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <BarChart3 className="w-12 h-12 text-primary mx-auto mb-2" />
                  <p className="text-slate-600 dark:text-slate-400">Chart visualization would go here</p>
                </div>
              </div>
            </Card>
          </motion.div>
          
          <motion.div variants={itemVariants}>
            <Card className="p-6">
              <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-6">User Distribution</h3>
              <div className="h-64 bg-gradient-to-br from-green-500/10 to-blue-500/10 rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <PieChart className="w-12 h-12 text-green-600 mx-auto mb-2" />
                  <p className="text-slate-600 dark:text-slate-400">Pie chart visualization would go here</p>
                </div>
              </div>
            </Card>
          </motion.div>
        </div>
      </motion.div>
    </Layout>
  )
}
