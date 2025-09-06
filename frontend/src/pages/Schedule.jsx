import { useState, useEffect } from 'react'
import { Layout } from '../components/Layout.jsx'
import { Card } from '../components/Card.jsx'
import { Button } from '../components/Button.jsx'
import { motion, AnimatePresence } from 'framer-motion'
import { Calendar, Clock, Pill, CheckCircle, XCircle, AlertCircle, Plus, Filter, RefreshCw } from 'lucide-react'
import { useAuth } from '../context/AuthContext.jsx'
import { API_CONFIG } from '../config/api.js'
import axios from 'axios'

export const Schedule = () => {
  const { token } = useAuth()
  const [prescriptions, setPrescriptions] = useState([])
  const [scheduleData, setScheduleData] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])
  const [filter, setFilter] = useState('all') 

  const nav = [
    {to:'/dashboard/user', label:'Overview'},
    {to:'/dashboard/user/prescriptions', label:'Prescriptions'},
    {to:'/dashboard/user/medicines', label:'Medicines'},
    {to:'/dashboard/user/schedule', label:'Schedule'},
    {to:'/dashboard/user/analytics', label:'Analytics'},
    {to:'/dashboard/user/chat', label:'Chat'}
  ]

  const API_BASE = API_CONFIG.API_URL

  useEffect(() => {
    if (token) {
      fetchScheduleData()
    }
  }, [token, selectedDate])

  const fetchScheduleData = async () => {
    setLoading(true)
    try {
      const response = await axios.get(`${API_BASE}/prescriptions`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      
      if (response.data && response.data.prescriptions) {
        const activePrescriptions = response.data.prescriptions.filter(p => p.active)
        setPrescriptions(activePrescriptions)
        generateScheduleForDate(activePrescriptions, selectedDate)
      }
    } catch (error) {
      console.error('Error fetching schedule data:', error)
      setPrescriptions([])
      setScheduleData([])
    } finally {
      setLoading(false)
    }
  }

  const generateScheduleForDate = (prescriptions, date) => {
    const scheduleItems = []
    const selectedDateObj = new Date(date)
    
    prescriptions.forEach(prescription => {
      if (prescription.times && prescription.times.length > 0) {
        prescription.times.forEach(time => {
          const wasTaken = prescription.doseLogs?.some(log => {
            const logDate = new Date(log.date || log.takenAt || log.createdAt)
            const logDateStr = logDate.toISOString().split('T')[0]
            const logTime = log.time || logDate.toTimeString().split(' ')[0].substring(0, 5)
            return logDateStr === date && logTime === time && log.taken
          }) || false

          const scheduleItem = {
            id: `${prescription._id || prescription.id}-${time}`,
            prescriptionId: prescription._id || prescription.id,
            medicineName: prescription.medicineName,
            dosage: prescription.dosage,
            time: time,
            taken: wasTaken,
            beforeAfterFood: prescription.beforeAfterFood,
            withWater: prescription.withWater,
            specialInstructions: prescription.specialInstructions,
            prescription: prescription
          }
          
          scheduleItems.push(scheduleItem)
        })
      }
    })
    
    setScheduleData(scheduleItems.sort((a, b) => a.time.localeCompare(b.time)))
  }

  const handleMarkTaken = async (scheduleItem) => {
    try {
      const response = await axios.post(
        `${API_BASE}/prescriptions/${scheduleItem.prescriptionId}/dose-taken`,
        {
          time: scheduleItem.time,
          notes: `Taken from schedule on ${selectedDate}`
        },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          }
        }
      )

      if (response.status === 200) {
        await fetchScheduleData()
          const updatedScheduleData = scheduleData.map(item => 
          item.id === scheduleItem.id ? { ...item, taken: true } : item
        )
        setScheduleData(updatedScheduleData)
      }
    } catch (error) {
      console.error('Error marking dose as taken:', error)
      const updatedScheduleData = scheduleData.map(item => 
        item.id === scheduleItem.id ? { ...item, taken: true } : item
      )
      setScheduleData(updatedScheduleData)
    }
  }

  const getTimeStatus = (time, taken) => {
    if (taken) return 'taken'
    
    const now = new Date()
    const today = now.toISOString().split('T')[0]

    if (selectedDate <= today) {
      const [hours, minutes] = time.split(':').map(Number)
      const scheduleTime = new Date()
      scheduleTime.setHours(hours, minutes, 0, 0)
      
      if (selectedDate < today || (selectedDate === today && now > scheduleTime)) {
        return 'missed'
      }
    }
    
    return 'pending'
  }

  const getFilteredScheduleData = () => {
    if (filter === 'all') return scheduleData
    
    return scheduleData.filter(item => {
      const status = getTimeStatus(item.time, item.taken)
      return status === filter
    })
  }

  const getStatusCounts = () => {
    const counts = { total: scheduleData.length, taken: 0, pending: 0, missed: 0 }
    
    scheduleData.forEach(item => {
      const status = getTimeStatus(item.time, item.taken)
      counts[status]++
    })
    
    return counts
  }

  const groupedSchedules = getFilteredScheduleData().reduce((acc, schedule) => {
    const time = schedule.time
    if (!acc[time]) acc[time] = []
    acc[time].push(schedule)
    return acc
  }, {})

  const statusCounts = getStatusCounts()
  
  const isToday = selectedDate === new Date().toISOString().split('T')[0]
  const isPastDate = selectedDate < new Date().toISOString().split('T')[0]
  const isFutureDate = selectedDate > new Date().toISOString().split('T')[0]

  if (loading) {
    return (
      <Layout items={nav}>
        <div className="flex items-center justify-center h-64">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="w-8 h-8 border-2 border-[#5f6fff] border-t-transparent rounded-full"
          />
        </div>
      </Layout>
    )
  }

  return (
    <Layout items={nav}>
      <div className="space-y-6"><div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-slate-800 dark:text-white">
              Medication Schedule
            </h1>
            <p className="text-slate-600 dark:text-slate-400 mt-1">
              {isToday ? "Today's medication timeline" : 
               isPastDate ? `Medication history for ${new Date(selectedDate).toLocaleDateString()}` :
               `Upcoming medications for ${new Date(selectedDate).toLocaleDateString()}`}
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4"><div className="flex items-center space-x-3 bg-white dark:bg-slate-800 rounded-xl p-3 border border-slate-200 dark:border-slate-700 shadow-sm">
              <Calendar className="w-5 h-5 text-[#5f6fff]" />
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="bg-transparent border-none outline-none text-slate-700 dark:text-slate-300 font-medium cursor-pointer"
              />
            </div><Button
              onClick={fetchScheduleData}
              variant="outline"
              size="sm"
              className="flex items-center space-x-2"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Refresh</span>
            </Button>
          </div>
        </div>{scheduleData.length > 0 && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 p-4 rounded-xl border border-blue-200 dark:border-blue-800"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-600 dark:text-blue-300 text-sm font-medium">Total</p>
                  <p className="text-2xl font-bold text-blue-700 dark:text-blue-200">{statusCounts.total}</p>
                </div>
                <Pill className="w-8 h-8 text-blue-500" />
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900 p-4 rounded-xl border border-green-200 dark:border-green-800"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-600 dark:text-green-300 text-sm font-medium">Taken</p>
                  <p className="text-2xl font-bold text-green-700 dark:text-green-200">{statusCounts.taken}</p>
                </div>
                <CheckCircle className="w-8 h-8 text-green-500" />
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-950 dark:to-yellow-900 p-4 rounded-xl border border-yellow-200 dark:border-yellow-800"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-yellow-600 dark:text-yellow-300 text-sm font-medium">Pending</p>
                  <p className="text-2xl font-bold text-yellow-700 dark:text-yellow-200">{statusCounts.pending}</p>
                </div>
                <AlertCircle className="w-8 h-8 text-yellow-500" />
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-gradient-to-br from-red-50 to-red-100 dark:from-red-950 dark:to-red-900 p-4 rounded-xl border border-red-200 dark:border-red-800"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-red-600 dark:text-red-300 text-sm font-medium">Missed</p>
                  <p className="text-2xl font-bold text-red-700 dark:text-red-200">{statusCounts.missed}</p>
                </div>
                <XCircle className="w-8 h-8 text-red-500" />
              </div>
            </motion.div>
          </div>
        )}{scheduleData.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {[
              { key: 'all', label: 'All', count: statusCounts.total },
              { key: 'pending', label: 'Pending', count: statusCounts.pending },
              { key: 'taken', label: 'Taken', count: statusCounts.taken },
              { key: 'missed', label: 'Missed', count: statusCounts.missed }
            ].map(({ key, label, count }) => (
              <button
                key={key}
                onClick={() => setFilter(key)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all ${
                  filter === key
                    ? 'bg-[#5f6fff] text-white shadow-lg'
                    : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 border border-slate-200 dark:border-slate-700'
                }`}
              >
                <span>{label}</span>
                {count > 0 && (
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    filter === key ? 'bg-white/20' : 'bg-slate-100 dark:bg-slate-700'
                  }`}>
                    {count}
                  </span>
                )}
              </button>
            ))}
          </div>
        )}<div className="space-y-4">
          <AnimatePresence>
            {Object.keys(groupedSchedules).length === 0 ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
              >
                <Card className="text-center py-12">
                  <Clock className="w-16 h-16 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-slate-800 dark:text-white mb-2">
                    {scheduleData.length === 0 
                      ? `No Schedule for ${new Date(selectedDate).toLocaleDateString()}`
                      : `No ${filter} medications`}
                  </h3>
                  <p className="text-slate-600 dark:text-slate-400 mb-4">
                    {scheduleData.length === 0
                      ? "No medications scheduled for this date"
                      : `No medications match the ${filter} filter`}
                  </p>
                  {scheduleData.length === 0 && (
                    <Button 
                      onClick={() => window.location.href = '/dashboard/user/prescriptions'}
                      className="bg-[#5f6fff] hover:bg-[#5f6fff]/90"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add Prescription
                    </Button>
                  )}
                </Card>
              </motion.div>
            ) : (
              Object.entries(groupedSchedules)
                .sort(([a], [b]) => a.localeCompare(b))
                .map(([time, timeSchedules]) => (
                  <motion.div
                    key={time}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 overflow-hidden"
                  >
                    <div className="p-6">
                      <div className="flex items-center mb-6">
                        <div className="w-14 h-14 bg-gradient-to-br from-[#5f6fff] to-purple-600 rounded-xl flex items-center justify-center mr-4">
                          <Clock className="w-7 h-7 text-white" />
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-slate-800 dark:text-white">
                            {new Date(`2000-01-01T${time}`).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </h3>
                          <p className="text-slate-600 dark:text-slate-400">
                            {timeSchedules.length} medication{timeSchedules.length > 1 ? 's' : ''}
                          </p>
                        </div>
                      </div>

                      <div className="space-y-4">
                        {timeSchedules.map((scheduleItem) => {
                          const status = getTimeStatus(scheduleItem.time, scheduleItem.taken)
                          return (
                            <motion.div
                              key={scheduleItem.id}
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              className={`p-5 rounded-xl border-l-4 transition-all hover:shadow-md ${
                                status === 'taken'
                                  ? 'bg-green-50 border-green-400 dark:bg-green-900/20 dark:border-green-500'
                                  : status === 'missed'
                                  ? 'bg-red-50 border-red-400 dark:bg-red-900/20 dark:border-red-500'
                                  : 'bg-yellow-50 border-yellow-400 dark:bg-yellow-900/20 dark:border-yellow-500'
                              }`}
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-4">
                                  <div className="w-12 h-12 bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-800 rounded-lg flex items-center justify-center">
                                    <Pill className="w-6 h-6 text-[#5f6fff]" />
                                  </div>
                                  <div className="flex-1">
                                    <h4 className="font-bold text-slate-800 dark:text-white text-lg">
                                      {scheduleItem.medicineName}
                                    </h4>
                                    <p className="text-slate-600 dark:text-slate-400 font-medium">
                                      {scheduleItem.dosage}
                                    </p>
                                    {scheduleItem.specialInstructions && (
                                      <p className="text-sm text-slate-500 dark:text-slate-500 mt-1 italic">
                                        {scheduleItem.specialInstructions}
                                      </p>
                                    )}
                                    <div className="flex items-center space-x-3 mt-2 text-xs">
                                      <span className={`px-2 py-1 rounded-full ${
                                        scheduleItem.beforeAfterFood === 'before' 
                                          ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/20 dark:text-orange-300'
                                          : 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-300'
                                      }`}>
                                        {scheduleItem.beforeAfterFood} food
                                      </span>
                                      {scheduleItem.withWater && (
                                        <span className="px-2 py-1 bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300 rounded-full">
                                          with water
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                </div>
                                
                                <div className="flex items-center space-x-3">
                                  {status === 'taken' ? (
                                    <div className="flex items-center text-green-600 bg-green-100 dark:bg-green-900/30 px-4 py-2 rounded-lg">
                                      <CheckCircle className="w-5 h-5 mr-2" />
                                      <span className="font-semibold">Taken</span>
                                    </div>
                                  ) : status === 'missed' ? (
                                    <div className="flex items-center text-red-600 bg-red-100 dark:bg-red-900/30 px-4 py-2 rounded-lg">
                                      <XCircle className="w-5 h-5 mr-2" />
                                      <span className="font-semibold">Missed</span>
                                    </div>
                                  ) : (
                                    <div className="flex items-center space-x-3">
                                      <div className="flex items-center text-yellow-600 bg-yellow-100 dark:bg-yellow-900/30 px-3 py-2 rounded-lg">
                                        <AlertCircle className="w-4 h-4 mr-2" />
                                        <span className="font-medium text-sm">Pending</span>
                                      </div>
                                      <Button
                                        onClick={() => handleMarkTaken(scheduleItem)}
                                        className="bg-green-600 hover:bg-green-700 text-white flex items-center px-4 py-2 font-semibold"
                                      >
                                        <CheckCircle className="w-4 h-4 mr-2" />
                                        Mark Taken
                                      </Button>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </motion.div>
                          )
                        })}
                      </div>
                    </div>
                  </motion.div>
                ))
            )}
          </AnimatePresence>
        </div>
      </div>
    </Layout>
  )
}
