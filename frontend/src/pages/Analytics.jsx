import { useEffect, useState } from 'react'
import axios from 'axios'
import { useAuth } from '../context/AuthContext.jsx'
import { motion, AnimatePresence } from 'framer-motion'
import { ResponsiveContainer,  BarChart,  Bar,  XAxis,  YAxis,  Tooltip,  LineChart, Line, PieChart,  Pie,  Cell, AreaChart, Area, Legend, CartesianGrid} from 'recharts'
import { TrendingUp,  Calendar,  Pill,  Target,  Clock, Award, AlertCircle, CheckCircle, Activity, BarChart3, PieChart as PieChartIcon, Zap, ArrowUp, ArrowDown, Minus, Users, Heart, Shield} from 'lucide-react'

const COLORS = ['#5f6fff', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#84cc16']
const GRADIENT_COLORS = [
  'from-[#5f6fff] to-blue-600',
  'from-green-500 to-green-600', 
  'from-orange-500 to-orange-600',
  'from-red-500 to-red-600',
  'from-purple-500 to-purple-600',
  'from-cyan-500 to-cyan-600',
  'from-lime-500 to-lime-600'
]

const StatCard = ({ title, value, icon: Icon, subtitle, trend, color = 'blue', change, className = '' }) => {
  const colorClasses = {
    blue: 'bg-gradient-to-br from-[#5f6fff]/10 to-[#5f6fff]/20 border-[#5f6fff]/30 text-[#5f6fff] dark:from-[#5f6fff]/20 dark:to-[#5f6fff]/10 dark:border-[#5f6fff]/40 dark:text-[#5f6fff]',
    green: 'bg-gradient-to-br from-green-50 to-green-100 border-green-200 text-green-700 dark:from-green-950 dark:to-green-900 dark:border-green-800 dark:text-green-300',
    red: 'bg-gradient-to-br from-red-50 to-red-100 border-red-200 text-red-700 dark:from-red-950 dark:to-red-900 dark:border-red-800 dark:text-red-300',
    orange: 'bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200 text-orange-700 dark:from-orange-950 dark:to-orange-900 dark:border-orange-800 dark:text-orange-300',
    purple: 'bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200 text-purple-700 dark:from-purple-950 dark:to-purple-900 dark:border-purple-800 dark:text-purple-300'
  }

  const getTrendIcon = () => {
    if (!change) return null
    if (change > 0) return <ArrowUp className="w-3 h-3 text-green-500" />
    if (change < 0) return <ArrowDown className="w-3 h-3 text-red-500" />
    return <Minus className="w-3 h-3 text-gray-500" />
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02, boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)' }}
      className={`p-6 rounded-2xl border-2 ${colorClasses[color]} backdrop-blur-sm transition-all duration-300 hover:shadow-xl relative overflow-hidden ${className}`}
    ><div className="absolute inset-0 opacity-5">
        <div className="absolute -right-4 -top-4 w-24 h-24 rounded-full bg-current"></div>
        <div className="absolute -right-8 -top-8 w-32 h-32 rounded-full bg-current"></div>
      </div>
      
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-4">
          <div className="flex-1">
            <p className="text-sm font-semibold opacity-80 uppercase tracking-wide">{title}</p>
            <p className="text-3xl lg:text-4xl font-bold mt-2 leading-tight">{value}</p>
            {subtitle && <p className="text-xs opacity-70 mt-1 font-medium">{subtitle}</p>}
          </div>
          <div className="ml-4">
            <div className="p-4 rounded-xl bg-white/20 dark:bg-black/20 backdrop-blur-sm border border-white/30">
              <Icon className="w-8 h-8" />
            </div>
          </div>
        </div>
        
        {(trend || change !== undefined) && (
          <div className="flex items-center justify-between pt-3 border-t border-white/20">
            {trend && <span className="text-xs font-medium opacity-80">{trend}</span>}
            {change !== undefined && (
              <div className="flex items-center space-x-1">
                {getTrendIcon()}
                <span className="text-xs font-semibold">
                  {change > 0 ? '+' : ''}{change}%
                </span>
              </div>
            )}
          </div>
        )}
      </div>
    </motion.div>
  )
}

const ChartCard = ({ title, children, icon: Icon, className = '' }) => (
  <motion.div
    initial={{ opacity: 0, y: 30 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.6 }}
    className={`bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden ${className}`}
  >
    <div className="p-6 pb-2">
      <div className="flex items-center space-x-3 mb-6">
        <div className="p-2 bg-[#5f6fff]/10 dark:bg-[#5f6fff]/20 rounded-lg">
          <Icon className="w-6 h-6 text-[#5f6fff] dark:text-[#5f6fff]" />
        </div>
        <h3 className="text-xl font-bold text-gray-900 dark:text-white">{title}</h3>
      </div>
    </div>
    <div className="px-6 pb-6">
      {children}
    </div>
  </motion.div>
)

const LoadingSpinner = () => (
  <div className="flex items-center justify-center h-96">
    <div className="relative">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full"
      />
      <motion.div
        animate={{ rotate: -360 }}
        transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
        className="absolute inset-2 border-4 border-purple-200 border-t-purple-600 rounded-full"
      />
    </div>
  </div>
)

const EmptyState = ({ icon: Icon, title, subtitle }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.9 }}
    animate={{ opacity: 1, scale: 1 }}
    className="text-center py-16"
  >
    <div className="mx-auto w-24 h-24 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900 rounded-full flex items-center justify-center mb-6">
      <Icon className="w-12 h-12 text-gray-400" />
    </div>
    <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">{title}</h3>
    <p className="text-gray-500 dark:text-gray-400 max-w-sm mx-auto">{subtitle}</p>
  </motion.div>
)

export const AnalyticsPage = () => {
  const { token } = useAuth()
  const [dashboardData, setDashboardData] = useState(null)
  const [insights, setInsights] = useState(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')

  const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

  useEffect(() => {
    if (token) {
      fetchAnalyticsData()
    }
  }, [token])

  const fetchAnalyticsData = async () => {
    try {
      const [dashboardRes, insightsRes] = await Promise.all([
        axios.get(`${API_BASE}/analytics/dashboard`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get(`${API_BASE}/analytics/insights`, {
          headers: { Authorization: `Bearer ${token}` }
        })
      ])
      
      setDashboardData(dashboardRes.data)
      setInsights(insightsRes.data)
    } catch (error) {
      console.error('Failed to fetch analytics:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
          <LoadingSpinner />
        </div>
      </div>
    )
  }

  if (!dashboardData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
          <EmptyState 
            icon={AlertCircle}
            title="No Data Available"
            subtitle="Start taking your medications to see comprehensive analytics and insights."
          />
        </div>
      </div>
    )
  }

  const { overview, dailyStats, medicineStats, streakData } = dashboardData

  const medicineCompletionData = medicineStats?.map((med, index) => ({
    name: med.name.length > 15 ? med.name.substring(0, 15) + '...' : med.name,
    value: med.completionRate,
    fill: COLORS[index % COLORS.length]
  })) || []

  const timeSlotData = insights?.timeSlotMissed ? Object.entries(insights.timeSlotMissed).map(([time, missed]) => ({
    name: time.replace(/\s*\([^)]*\)/g, ''),
    missed,
    fill: COLORS[Object.keys(insights.timeSlotMissed).indexOf(time) % COLORS.length]
  })) : []

  const tabs = [
    { id: 'overview', label: 'Overview', icon: BarChart3, color: 'blue' },
    { id: 'trends', label: 'Trends', icon: TrendingUp, color: 'green' },
    { id: 'insights', label: 'Insights', icon: PieChartIcon, color: 'purple' },
    { id: 'medicines', label: 'Medicines', icon: Pill, color: 'orange' }
  ]

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 space-y-8"><motion.div 
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center relative"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-purple-600/10 rounded-3xl blur-3xl"></div>
          <div className="relative z-10 py-8">
            <h1 className="text-4xl lg:text-6xl font-extrabold bg-gradient-to-r from-[#5f6fff] via-purple-600 to-indigo-600 bg-clip-text text-transparent mb-4">
              Health Analytics
            </h1>
            <p className="text-lg lg:text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed">
              Comprehensive insights into your medication adherence and health progress
            </p>
          </div>
        </motion.div><div className="flex justify-center">
          <div className="flex bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg rounded-2xl p-2 shadow-lg border border-white/20 dark:border-gray-700/50">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-6 py-3 rounded-xl transition-all duration-300 font-semibold ${
                  activeTab === tab.id
                    ? 'bg-gradient-to-r from-[#5f6fff] to-purple-600 text-white shadow-lg transform scale-105'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700/50'
                }`}
              >
                <tab.icon size={20} />
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        <AnimatePresence mode="wait">{activeTab === 'overview' && (
            <motion.div
              key="overview"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              exit="hidden"
              className="space-y-8"
            ><div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                  title="Adherence Rate"
                  value={`${overview.overallAdherence}%`}
                  icon={Target}
                  subtitle="Overall compliance"
                  color={overview.overallAdherence >= 80 ? 'green' : overview.overallAdherence >= 60 ? 'orange' : 'red'}
                  change={+2.5}
                />
                <StatCard
                  title="Active Medications"
                  value={overview.activePrescriptions}
                  icon={Pill}
                  subtitle="Currently prescribed"
                  color="blue"
                  change={0}
                />
                <StatCard
                  title="Current Streak"
                  value={`${streakData?.current || 0}`}
                  icon={Zap}
                  subtitle="Days of good adherence"
                  color="purple"
                  change={+1}
                />
                <StatCard
                  title="Completed Courses"
                  value={overview.completedPrescriptions}
                  icon={CheckCircle}
                  subtitle="Treatment completed"
                  color="green"
                  change={+12}
                />
              </div><ChartCard title="30-Day Adherence Trend" icon={Activity}>
                <div className="h-80 lg:h-96">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={dailyStats}>
                      <defs>
                        <linearGradient id="colorTaken" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                          <stop offset="95%" stopColor="#10b981" stopOpacity={0.1}/>
                        </linearGradient>
                        <linearGradient id="colorMissed" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#ef4444" stopOpacity={0.8}/>
                          <stop offset="95%" stopColor="#ef4444" stopOpacity={0.1}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e0e7ff" />
                      <XAxis 
                        dataKey="date" 
                        stroke="currentColor" 
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                        tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      />
                      <YAxis stroke="currentColor" fontSize={12} tickLine={false} axisLine={false} />
                      <Tooltip 
                        contentStyle={{ 
                          background: 'rgba(255, 255, 255, 0.95)', 
                          border: 'none',
                          borderRadius: '12px',
                          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
                        }}
                        formatter={(value, name) => [value, name === 'taken' ? 'Doses Taken' : 'Doses Missed']}
                        labelFormatter={(value) => `Date: ${new Date(value).toLocaleDateString()}`}
                      />
                      <Area 
                        type="monotone" 
                        dataKey="taken" 
                        stackId="1" 
                        stroke="#10b981" 
                        fillOpacity={1}
                        fill="url(#colorTaken)"
                      />
                      <Area 
                        type="monotone" 
                        dataKey="missed" 
                        stackId="1" 
                        stroke="#ef4444" 
                        fillOpacity={1}
                        fill="url(#colorMissed)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </ChartCard>
            </motion.div>
          )}{activeTab === 'trends' && (
            <motion.div
              key="trends"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              exit="hidden"
              className="space-y-8"
            ><div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <StatCard
                  title="Current Streak"
                  value={`${streakData?.current || 0} Days`}
                  icon={Zap}
                  subtitle="Keep the momentum going!"
                  color="orange"
                  className="md:col-span-1"
                />
                <StatCard
                  title="Best Streak"
                  value={`${streakData?.longest || 0} Days`}
                  icon={Award}
                  subtitle="Your personal record"
                  color="purple"
                  className="md:col-span-1"
                />
              </div><ChartCard title="Adherence Rate Trend" icon={TrendingUp}>
                <div className="h-80 lg:h-96">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={dailyStats}>
                      <defs>
                        <linearGradient id="lineGradient" x1="0" y1="0" x2="1" y2="0">
                          <stop offset="0%" stopColor="#5f6fff" />
                          <stop offset="50%" stopColor="#8b5cf6" />
                          <stop offset="100%" stopColor="#06b6d4" />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e0e7ff" />
                      <XAxis 
                        dataKey="date" 
                        stroke="currentColor" 
                        fontSize={12}
                        tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      />
                      <YAxis stroke="currentColor" fontSize={12} />
                      <Tooltip 
                        contentStyle={{ 
                          background: 'rgba(255, 255, 255, 0.95)', 
                          border: 'none',
                          borderRadius: '12px',
                          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
                        }}
                        formatter={(value) => [`${value}%`, 'Adherence Rate']}
                        labelFormatter={(value) => `Date: ${new Date(value).toLocaleDateString()}`}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="adherenceRate" 
                        stroke="url(#lineGradient)"
                        strokeWidth={4}
                        dot={{ fill: '#5f6fff', strokeWidth: 3, r: 6 }}
                        activeDot={{ r: 8, fill: '#8b5cf6' }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </ChartCard>
            </motion.div>
          )}{activeTab === 'insights' && insights && (
            <motion.div
              key="insights"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              exit="hidden"
              className="space-y-8"
            >
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">{medicineCompletionData.length > 0 && (
                  <ChartCard title="Medicine Completion Rates" icon={PieChartIcon}>
                    <div className="h-80">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={medicineCompletionData}
                            cx="50%"
                            cy="50%"
                            outerRadius={100}
                            innerRadius={40}
                            dataKey="value"
                            label={({ name, value }) => `${name}: ${value}%`}
                            labelLine={false}
                          >
                            {medicineCompletionData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.fill} />
                            ))}
                          </Pie>
                          <Tooltip 
                            formatter={(value) => [`${value}%`, 'Completion']}
                            contentStyle={{
                              background: 'rgba(255, 255, 255, 0.95)',
                              border: 'none',
                              borderRadius: '12px',
                              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
                            }}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </ChartCard>
                )}{timeSlotData.length > 0 && (
                  <ChartCard title="Missed Doses by Time" icon={Clock}>
                    <div className="h-80">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={timeSlotData}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#e0e7ff" />
                          <XAxis 
                            dataKey="name" 
                            stroke="currentColor" 
                            fontSize={12} 
                            tickLine={false} 
                            axisLine={false}
                          />
                          <YAxis stroke="currentColor" fontSize={12} tickLine={false} axisLine={false} />
                          <Tooltip 
                            contentStyle={{ 
                              background: 'rgba(255, 255, 255, 0.95)', 
                              border: 'none',
                              borderRadius: '12px',
                              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
                            }}
                            formatter={(value) => [value, 'Missed Doses']}
                          />
                          <Bar dataKey="missed" fill="#f59e0b" radius={[8, 8, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </ChartCard>
                )}
              </div>{insights.medicineFrequency && (
                <ChartCard title="Most Prescribed Medicines" icon={Heart}>
                  <div className="space-y-4">
                    {Object.entries(insights.medicineFrequency)
                      .sort(([,a], [,b]) => b - a)
                      .slice(0, 6)
                      .map(([medicine, count], index) => (
                        <motion.div
                          key={medicine}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 rounded-xl border border-gray-200 dark:border-gray-600"
                        >
                          <div className="flex items-center space-x-4">
                            <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${GRADIENT_COLORS[index % GRADIENT_COLORS.length]} flex items-center justify-center`}>
                              <Pill className="w-6 h-6 text-white" />
                            </div>
                            <div>
                              <span className="font-semibold text-gray-900 dark:text-white">{medicine}</span>
                              <p className="text-sm text-gray-500 dark:text-gray-400">Prescribed medication</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="bg-[#5f6fff]/10 dark:bg-[#5f6fff]/20 text-[#5f6fff] dark:text-[#5f6fff] px-4 py-2 rounded-full font-bold">
                              {count} {count === 1 ? 'time' : 'times'}
                            </div>
                          </div>
                        </motion.div>
                      ))}
                  </div>
                </ChartCard>
              )}
            </motion.div>
          )}{activeTab === 'medicines' && (
            <motion.div
              key="medicines"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              exit="hidden"
            >
              <ChartCard title="Current Medicines Progress" icon={Shield}>
                {medicineStats && medicineStats.length > 0 ? (
                  <div className="space-y-6">
                    {medicineStats.map((medicine, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="p-6 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 rounded-2xl border border-gray-200 dark:border-gray-600"
                      >
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center space-x-4">
                            <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${GRADIENT_COLORS[index % GRADIENT_COLORS.length]} flex items-center justify-center`}>
                              <Pill className="w-7 h-7 text-white" />
                            </div>
                            <div>
                              <h4 className="text-xl font-bold text-gray-900 dark:text-white">{medicine.name}</h4>
                              <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">{medicine.frequency}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <span className={`text-2xl font-bold ${
                              medicine.completionRate >= 80 ? 'text-green-600' : 
                              medicine.completionRate >= 60 ? 'text-orange-600' : 'text-red-600'
                            }`}>
                              {medicine.completionRate}%
                            </span>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              {medicine.takenDoses} of {medicine.totalDoses} doses
                            </p>
                          </div>
                        </div><div className="relative">
                          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-4 overflow-hidden">
                            <motion.div 
                              initial={{ width: 0 }}
                              animate={{ width: `${medicine.completionRate}%` }}
                              transition={{ duration: 1.5, ease: "easeOut" }}
                              className={`h-full rounded-full transition-all duration-1000 ${
                                medicine.completionRate >= 80 ? 'bg-gradient-to-r from-green-400 to-green-600' : 
                                medicine.completionRate >= 60 ? 'bg-gradient-to-r from-orange-400 to-orange-600' : 
                                'bg-gradient-to-r from-red-400 to-red-600'
                              }`}
                            />
                          </div>
                        </div>
                        
                        {medicine.nextDose && (
                          <p className="text-sm text-[#5f6fff] dark:text-[#5f6fff] mt-3 font-medium">
                            <Clock className="inline w-4 h-4 mr-1" />
                            Next dose: {new Date(medicine.nextDose).toLocaleString()}
                          </p>
                        )}
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <EmptyState 
                    icon={Pill}
                    title="No Active Medicines"
                    subtitle="Add some prescriptions to track your medication progress."
                  />
                )}
              </ChartCard>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
