import { useState, useEffect } from 'react'
import { Layout } from '../components/Layout.jsx'
import { Card } from '../components/Card.jsx'
import { Button } from '../components/Button.jsx'
import { Modal } from '../components/Modal.jsx'
import { Input } from '../components/Input.jsx'
import { motion, AnimatePresence } from 'framer-motion'
import { Pill,  Plus,  Clock,  Calendar,  AlertTriangle,  Edit3,  Trash2, Bell, CheckCircle2, Info, Timer, Loader2} from 'lucide-react'
import { useAuth } from '../context/AuthContext.jsx'
import { useNotifications } from '../context/NotificationContext.jsx'

export const Prescriptions = () => {
  const { user } = useAuth()
  const { notifications, addNotification, markAsRead, removeNotification } = useNotifications()
  const [prescriptions, setPrescriptions] = useState([])
  const [showAddModal, setShowAddModal] = useState(false)
  const [showDoseModal, setShowDoseModal] = useState(false)
  const [selectedPrescription, setSelectedPrescription] = useState(null)
  const [editingPrescription, setEditingPrescription] = useState(null)
  const [loading, setLoading] = useState(true)
  const [addingPrescription, setAddingPrescription] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')
  const [prescriptionForm, setPrescriptionForm] = useState({
    medicineName: '',
    dosage: '',
    frequency: '',
    duration: '',
    specialInstructions: '',
    beforeAfterFood: 'after',
    withWater: true,
    avoidAlcohol: false,
    times: ['08:00'], 
    totalDoses: '',
    startDate: new Date().toISOString().split('T')[0] 
  })
  const [doseForm, setDoseForm] = useState({
    totalDoses: '',
    doseTimes: []
  })

  const nav = [
    {to:'/dashboard/user', label:'Overview'},
    {to:'/dashboard/user/prescriptions', label:'Prescriptions'},
    {to:'/dashboard/user/medicines', label:'Medicines'},
    {to:'/dashboard/user/schedule', label:'Schedule'},
    {to:'/dashboard/user/analytics', label:'Analytics'},
    {to:'/dashboard/user/chat', label:'Chat'}
  ]
  useEffect(() => {
    fetchPrescriptions()
  }, [])
  useEffect(() => {
    if (prescriptions.length > 0) {
      checkNotifications(prescriptions)

      const notificationInterval = setInterval(() => {
        checkNotifications(prescriptions)
      }, 30000)
      
      return () => clearInterval(notificationInterval)
    }
  }, [prescriptions])

  const fetchPrescriptions = async () => {
    try {
      const token = localStorage.getItem('token')
      console.log('Fetching prescriptions with token:', token ? 'Token exists' : 'No token')
      
      const response = await fetch('/api/prescriptions', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      
      console.log('Response status:', response.status)
      
      if (response.ok) {
        const data = await response.json()
        console.log('API Response data:', data)
        console.log('Prescriptions array:', data.prescriptions)
        console.log('Number of prescriptions:', data.prescriptions?.length || 0)
        
        const prescriptionsWithDoseLogs = data.prescriptions || []
        setPrescriptions(prescriptionsWithDoseLogs)
        loadDoseLogsAsNotifications(prescriptionsWithDoseLogs)
        
      } else {
        console.error('API Error - Status:', response.status)
        const errorData = await response.json()
        console.error('Error details:', errorData)
      }
    } catch (error) {
      console.error('Error fetching prescriptions:', error)
      const samplePrescriptions = [
        {
          id: 1,
          medicineName: 'Vitamin D',
          dosage: '500mg',
          frequency: 'Once daily',
          duration: '30 days',
          specialInstructions: 'Take with milk for better absorption',
          beforeAfterFood: 'after',
          withWater: true,
          avoidAlcohol: false,
          startDate: '2025-09-05',
          times: ['07:00'],
          totalDoses: 30,
          takenDoses: 5,
          active: true,
          nextDose: '2025-09-06 07:00',
          doseLogs: [
            { _id: 'log1', takenAt: '2025-09-05T14:51:39.820Z', status: 'taken' },
            { _id: 'log2', takenAt: '2025-09-05T15:17:15.935Z', status: 'taken' },
            { _id: 'log3', takenAt: '2025-09-05T13:30:00.000Z', status: 'taken' },
            { _id: 'log4', takenAt: '2025-09-05T12:15:00.000Z', status: 'taken' },
            { _id: 'log5', takenAt: '2025-09-05T11:00:00.000Z', status: 'taken' },
            { _id: 'log6', takenAt: '2025-09-04T19:30:00.000Z', status: 'taken' },
            { _id: 'log7', takenAt: '2025-09-04T18:15:00.000Z', status: 'taken' },
            { _id: 'log8', takenAt: '2025-09-04T17:00:00.000Z', status: 'taken' }
          ]
        },
        {
          id: 2,
          medicineName: 'Calcium Tablets',
          dosage: '1000mg',
          frequency: 'Twice daily',
          duration: '60 days',
          specialInstructions: 'Take after meals',
          beforeAfterFood: 'after',
          withWater: true,
          avoidAlcohol: false,
          startDate: '2025-09-05',
          times: ['08:00', '20:00'],
          totalDoses: 60,
          takenDoses: 3,
          active: true,
          nextDose: '2025-09-06 08:00',
          doseLogs: [
            { _id: 'log9', takenAt: '2025-09-05T08:00:00.000Z', status: 'taken' },
            { _id: 'log10', takenAt: '2025-09-04T20:00:00.000Z', status: 'taken' },
            { _id: 'log11', takenAt: '2025-09-04T08:00:00.000Z', status: 'taken' }
          ]
        }
      ]
      setPrescriptions(samplePrescriptions)
      loadDoseLogsAsNotifications(samplePrescriptions)
    } finally {
      setLoading(false)
    }
  }

  const checkNotifications = async (prescriptionList = prescriptions) => {
    const now = new Date()
    const currentTime = now.getHours().toString().padStart(2, '0') + ':' + now.getMinutes().toString().padStart(2, '0')
    
    console.log('Checking notifications at:', currentTime)
    console.log('Available prescriptions:', prescriptionList.length)
    
    prescriptionList.forEach(prescription => {
      if (prescription.active && prescription.times) {
        console.log(`Checking prescription: ${prescription.medicineName}, times: ${prescription.times}`)
        
        prescription.times.forEach(notificationTime => {
          console.log(`Comparing current time ${currentTime} with notification time ${notificationTime}`)
          const [currentHour, currentMin] = currentTime.split(':').map(Number)
          const [notifHour, notifMin] = notificationTime.split(':').map(Number)
          
          const currentMinutes = currentHour * 60 + currentMin
          const notifMinutes = notifHour * 60 + notifMin
          const timeDiff = Math.abs(currentMinutes - notifMinutes)
          
          if (timeDiff <= 1) {
            console.log(`Time match found for ${prescription.medicineName} at ${notificationTime}`)
            const existingNotification = notifications.find(n => 
              n.prescription?.id === prescription.id && n.time === notificationTime
            )
            
            if (!existingNotification) {
              console.log(`Adding new notification for ${prescription.medicineName}`)
              const newNotification = {
                type: 'dose-reminder',
                prescription: prescription,
                time: notificationTime,
                message: `Time to take your ${prescription.medicineName} (${prescription.dosage})`
              }
              
              addNotification(newNotification)
            } else {
              console.log(`Notification already exists for ${prescription.medicineName}`)
            }
          }
        })
      }
    })
  }

  const loadDoseLogsAsNotifications = (prescriptionList) => {
    console.log('Loading dose logs as notifications...')
    
    prescriptionList.forEach(prescription => {
      console.log(`Checking prescription ${prescription.medicineName} for dose logs:`, prescription.doseLogs)
      
      if (prescription.doseLogs && prescription.doseLogs.length > 0) {
        prescription.doseLogs.forEach((doseLog, index) => {
          console.log(`Processing dose log ${index}:`, doseLog)
          
          const existingNotification = notifications.find(n => 
            n.doseLogId === doseLog._id || (n.prescription?.id === prescription.id && n.doseLogTime === doseLog.takenAt)
          )
          
          if (!existingNotification) {
            const logDate = new Date(doseLog.takenAt || doseLog.createdAt || new Date())
            const logTime = logDate.getHours().toString().padStart(2, '0') + ':' + logDate.getMinutes().toString().padStart(2, '0')
            
            const notification = {
              type: 'medicine-taken',
              prescription: prescription,
              time: logTime,
              doseLogId: doseLog._id || `doselog-${index}-${Date.now()}`,
              doseLogTime: doseLog.takenAt || doseLog.createdAt,
              message: `You took ${prescription.medicineName} (${prescription.dosage})`,
              takenAt: doseLog.takenAt || doseLog.createdAt,
              isRead: true 
            }
            
            console.log('Adding dose log notification:', notification)
            addNotification(notification)
          } else {
            console.log('Dose log notification already exists')
          }
        })
      }
    })
  }

  const timeToMinutes = (time) => {
    const [hours, minutes] = time.split(':').map(Number)
    return hours * 60 + minutes
  }

  const handleAddPrescription = async () => {
    setAddingPrescription(true)
    try {
      const token = localStorage.getItem('token')
      const isEditing = selectedPrescription && selectedPrescription.id
      const url = isEditing ? `/api/prescriptions/${selectedPrescription.id}` : '/api/prescriptions'
      const method = isEditing ? 'PUT' : 'POST'
      
      const requestData = {
        ...prescriptionForm,
        totalDoses: parseInt(prescriptionForm.totalDoses || '30')
      }
      
      console.log('Sending prescription data:', requestData)
      console.log('Request URL:', url)
      console.log('Request method:', method)
      
      const response = await fetch(url, {
        method: method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(requestData)
      })

      if (response.ok) {
        const data = await response.json()
        fetchPrescriptions()
        setSuccessMessage(isEditing ? 'Prescription updated successfully!' : 'Prescription added successfully!')
        setTimeout(() => setSuccessMessage(''), 5000)
        setPrescriptionForm({
          medicineName: '',
          dosage: '',
          frequency: '',
          duration: '',
          specialInstructions: '',
          beforeAfterFood: 'after',
          withWater: true,
          avoidAlcohol: false,
          times: ['08:00'],
          totalDoses: '',
          startDate: new Date().toISOString().split('T')[0]
        })
        setSelectedPrescription(null)
        setShowAddModal(false)
      } else {
        const error = await response.json()
        console.error('Error saving prescription - Status:', response.status)
        console.error('Error saving prescription - Details:', error)
        console.error('Full error object:', JSON.stringify(error, null, 2))
        alert(`Error: ${error.message || error.error || 'Unknown error'}. Please check the console for details.`)
      }
    } catch (error) {
      console.error('Error saving prescription:', error)
      if (selectedPrescription && selectedPrescription.id) {
        setPrescriptions(prev => 
          prev.map(p => p.id === selectedPrescription.id 
            ? { ...p, ...prescriptionForm, totalDoses: parseInt(prescriptionForm.totalDoses || '30') }
            : p
          )
        )
        setSuccessMessage('Prescription updated successfully!')
      } else {
        const newPrescription = {
          id: Date.now(),
          ...prescriptionForm,
          totalDoses: parseInt(prescriptionForm.totalDoses || '30'),
          takenDoses: 0,
          active: true,
          nextDose: calculateNextDose(new Date().toISOString().split('T')[0], prescriptionForm.times[0])
        }
        setPrescriptions(prev => [...prev, newPrescription])
        setSuccessMessage('Prescription added successfully!')
      }
      setTimeout(() => setSuccessMessage(''), 5000)
      setPrescriptionForm({
        medicineName: '',
        dosage: '',
        frequency: '',
        duration: '',
        specialInstructions: '',
        beforeAfterFood: 'after',
        withWater: true,
        avoidAlcohol: false,
        times: ['08:00'],
        totalDoses: '',
        startDate: new Date().toISOString().split('T')[0]
      })
      setSelectedPrescription(null)
      setShowAddModal(false)
    } finally {
      setAddingPrescription(false)
    }
  }

  const calculateNextDose = (startDate, time) => {
    if (!startDate || !time) {
      return new Date().toISOString()
    }
    
    const today = new Date()
    const [hours, minutes] = time.split(':').map(Number)
    const nextDose = new Date(today.getFullYear(), today.getMonth(), today.getDate(), hours, minutes)
    
    if (nextDose <= today) {
      nextDose.setDate(nextDose.getDate() + 1)
    }
    
    return nextDose.toISOString()
  }

  const handleSetDoseTiming = (prescription) => {
    setSelectedPrescription(prescription)
    setDoseForm({
      totalDoses: prescription.totalDoses || '',
      doseTimes: prescription.times || ['08:00']
    })
    setShowDoseModal(true)
  }

  const handleEditPrescription = (prescription) => {
    setPrescriptionForm({
      medicineName: prescription.medicineName,
      dosage: prescription.dosage,
      frequency: prescription.frequency,
      duration: prescription.duration,
      specialInstructions: prescription.specialInstructions || '',
      beforeAfterFood: prescription.beforeAfterFood || 'after',
      withWater: prescription.withWater !== undefined ? prescription.withWater : true,
      avoidAlcohol: prescription.avoidAlcohol || false,
      times: prescription.times || ['08:00'],
      totalDoses: prescription.totalDoses?.toString() || '',
      startDate: prescription.startDate ? new Date(prescription.startDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]
    })
    setSelectedPrescription(prescription)
    setShowAddModal(true)
  }

  const handleDeletePrescription = async (prescriptionId) => {
    console.log('handleDeletePrescription called with ID:', prescriptionId)
    if (!confirm('Are you sure you want to delete this prescription?')) {
      return
    }

    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`/api/prescriptions/${prescriptionId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        fetchPrescriptions()
        setSuccessMessage('Prescription deleted successfully!')
        setTimeout(() => setSuccessMessage(''), 5000)
      } else {
        console.error('Error deleting prescription')
        setSuccessMessage('Error deleting prescription. Please try again.')
        setTimeout(() => setSuccessMessage(''), 5000)
      }
    } catch (error) {
      console.error('Error deleting prescription:', error)
      setPrescriptions(prev => prev.filter(p => p.id !== prescriptionId))
      setSuccessMessage('Prescription deleted successfully!')
      setTimeout(() => setSuccessMessage(''), 5000)
    }
  }

  const handleUpdateDoseTiming = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`/api/prescriptions/${selectedPrescription.id}/timing`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          totalDoses: parseInt(doseForm.totalDoses),
          times: doseForm.doseTimes
        })
      })

      if (response.ok) {
        fetchPrescriptions()
        setShowDoseModal(false)
      } else {
        console.error('Error updating dose timing')
      }
    } catch (error) {
      console.error('Error updating dose timing:', error)
      setPrescriptions(prev => 
        prev.map(p => 
          p.id === selectedPrescription.id 
            ? { ...p, totalDoses: parseInt(doseForm.totalDoses), times: doseForm.doseTimes }
            : p
        )
      )
      setShowDoseModal(false)
    }
  }

  const handleMarkTaken = async (prescriptionId, notificationId = null) => {
    try {
      const token = localStorage.getItem('token')
      const prescription = prescriptions.find(p => p.id === prescriptionId || p._id === prescriptionId)
      
      const response = await fetch(`/api/prescriptions/${prescriptionId}/dose-taken`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          time: new Date().toTimeString().split(' ')[0].substring(0, 5),
          notes: 'Marked as taken from notification'
        })
      })

      if (response.ok) {
        fetchPrescriptions()
      
        if (notificationId) {
          removeNotification(notificationId)
        } else {
          notifications.forEach(n => {
            if (n.prescription?.id === prescriptionId && n.type === 'dose-reminder') {
              removeNotification(n.id)
            }
          })
        }

        if (prescription) {
          const now = new Date()
          const takenNotification = {
            type: 'medicine-taken',
            prescription: prescription,
            time: now.getHours().toString().padStart(2, '0') + ':' + now.getMinutes().toString().padStart(2, '0'),
            message: `✅ You have taken ${prescription.medicineName} (${prescription.dosage})`,
            description: `Taken at ${now.toLocaleTimeString()} on ${now.toLocaleDateString()}`,
            takenAt: now.toISOString()
          }
          
          addNotification(takenNotification)
        }
      } else {
        console.error('Error marking dose as taken')
      }
    } catch (error) {
      console.error('Error marking dose as taken:', error)
    
      const prescription = prescriptions.find(p => p.id === prescriptionId || p._id === prescriptionId)
      
      setPrescriptions(prev =>
        prev.map(p =>
          p.id === prescriptionId
            ? { ...p, takenDoses: (p.takenDoses || 0) + 1 }
            : p
        )
      )

      if (notificationId) {
        removeNotification(notificationId)
      }
      if (prescription) {
        const now = new Date()
        const takenNotification = {
          type: 'medicine-taken',
          prescription: prescription,
          time: now.getHours().toString().padStart(2, '0') + ':' + now.getMinutes().toString().padStart(2, '0'),
          message: `✅ You have taken ${prescription.medicineName} (${prescription.dosage})`,
          description: `Taken at ${now.toLocaleTimeString()} on ${now.toLocaleDateString()}`,
          takenAt: now.toISOString()
        }   
        addNotification(takenNotification)
      }
    }
  }

  const addDoseTime = () => {
    setDoseForm(prev => ({
      ...prev,
      doseTimes: [...prev.doseTimes, '08:00']
    }))
  }

  const updateDoseTime = (index, time) => {
    setDoseForm(prev => ({
      ...prev,
      doseTimes: prev.doseTimes.map((t, i) => i === index ? time : t)
    }))
  }

  const removeDoseTime = (index) => {
    setDoseForm(prev => ({
      ...prev,
      doseTimes: prev.doseTimes.filter((_, i) => i !== index)
    }))
  }

  if (loading) {
    return (
      <Layout items={nav}>
        <div className="flex items-center justify-center h-64">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full"
          />
        </div>
      </Layout>
    )
  }

  return (
    <Layout items={nav}>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-800 dark:text-white">Prescriptions</h1>
            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400">Manage your medications and dosage schedules</p>
          </div>
          <div className="flex items-center space-x-1 sm:space-x-2">
            {!showAddModal && !showDoseModal && (
              <>
                <Button 
                  onClick={() => {
                    console.log('Loading dose logs as notifications...')
                    loadDoseLogsAsNotifications(prescriptions)
                  }}
                  variant="outline" 
                  size="sm"
                  className="text-xs sm:text-sm px-2 sm:px-3 hidden sm:inline-flex"
                >
                  Load Past Doses
                </Button>
                <Button 
                  onClick={() => {
                    const now = new Date()
                    const currentTime = now.getHours().toString().padStart(2, '0') + ':' + now.getMinutes().toString().padStart(2, '0')
                    addNotification({
                      type: 'dose-reminder',
                      prescription: { id: 'test', medicineName: 'Test Medicine' },
                      time: currentTime,
                      message: `Test notification for ${currentTime}`
                    })
                  }}
                  variant="outline" 
                  size="sm"
                  className="text-xs sm:text-sm px-2 sm:px-3 hidden sm:inline-flex"
                >
                  Test Notification
                </Button>
                <Button onClick={() => setShowAddModal(true)} className="bg-primary hover:bg-primary/90 px-2 sm:px-4 py-1.5 sm:py-2">
                  <Plus className="w-4 h-4 mr-1 sm:mr-2" />
                  <span className="text-sm sm:text-base">Add</span>
                  <span className="hidden sm:inline ml-1">Prescription</span>
                </Button>
              </>
            )}
          </div>
        </div>
        <AnimatePresence>
          {successMessage && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg p-4 shadow-lg"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <CheckCircle2 className="w-5 h-5" />
                  <p className="font-medium">{successMessage}</p>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setSuccessMessage('')}
                  className="text-white hover:bg-white/20"
                >
                  ×
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        <AnimatePresence>
          {notifications.filter(n => !n.isRead && n.type === 'dose-reminder').map(notification => (
            <motion.div
              key={notification.id}
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className={`rounded-lg p-3 sm:p-4 shadow-lg border-l-4 ${
                notification.isRead 
                  ? 'bg-gradient-to-r from-gray-100 to-gray-200 border-gray-400 dark:from-gray-800 dark:to-gray-900 dark:border-gray-600' 
                  : 'bg-gradient-to-r from-blue-500 to-purple-600 border-yellow-400'
              } text-white`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-start space-x-3">
                  <div className="relative flex-shrink-0">
                    <Bell className="w-4 h-4 sm:w-5 sm:h-5" />
                    {!notification.isRead && (
                      <div className="absolute -top-1 -right-1 w-2 h-2 sm:w-3 sm:h-3 bg-yellow-400 rounded-full animate-pulse" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm sm:text-base font-medium ${notification.isRead ? 'text-gray-600 dark:text-gray-400' : 'text-white'}`}>
                      {notification.message}
                    </p>
                    <p className={`text-xs sm:text-sm opacity-90 ${notification.isRead ? 'text-gray-500 dark:text-gray-500' : 'text-white'} mt-1`}>
                      Scheduled for {notification.time} • {new Date(notification.createdAt).toLocaleTimeString()}
                    </p>
                    {notification.isRead && (
                      <p className="text-xs text-green-600 dark:text-green-400 mt-1">✓ Read</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center justify-end sm:justify-center">
                  <Button
                    size="sm"
                    onClick={() => handleMarkTaken(notification.prescription.id, notification.id)}
                    className="bg-green-600 hover:bg-green-700 text-white flex items-center px-3 py-1.5"
                  >
                    <CheckCircle2 className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                    <span className="text-xs sm:text-sm">Taken</span>
                  </Button>
                </div>
              </div>
              
              {!notification.isRead && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="mt-3 pt-3 border-t border-white/20"
                >
                  <p className="text-xs text-white/80">
                    💊 Don't forget to take your medicine on time for better health!
                  </p>
                </motion.div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>

        <div className="space-y-4">
          {prescriptions.map(prescription => (
            <div
              key={prescription.id}
              className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden"
            >
              <div className="p-4 sm:p-6">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-4">
                  <div className="flex items-start space-x-3 sm:space-x-4">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Pill className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg sm:text-xl font-semibold text-slate-800 dark:text-white truncate">
                        {prescription.medicineName}
                      </h3>
                      <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400">
                        {prescription.dosage} • {prescription.frequency}
                      </p>
                    </div>
                  </div>
                  {!showAddModal && !showDoseModal && (
                    <div className="flex items-center space-x-1 sm:space-x-2 relative" style={{zIndex: 1000}}>
                      <button
                        className="px-2 sm:px-3 py-1.5 text-xs sm:text-sm border border-slate-300 dark:border-slate-600 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors flex items-center cursor-pointer relative"
                        style={{zIndex: 1001}}
                        onClick={(e) => {
                          e.preventDefault()
                          e.stopPropagation()
                          handleSetDoseTiming(prescription)
                        }}
                      >
                        <Timer className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                        <span className="hidden sm:inline">Set</span> Timing
                      </button>
                      <button 
                        className="px-2 py-1.5 text-xs sm:text-sm text-slate-600 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer relative"
                        style={{zIndex: 1001}}
                        onClick={(e) => {
                          e.preventDefault()
                          e.stopPropagation()
                          handleEditPrescription(prescription)
                        }}
                      >
                        <Edit3 className="w-3 h-3 sm:w-4 sm:h-4" />
                      </button>
                      <button 
                        className="px-2 py-1.5 text-xs sm:text-sm text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors cursor-pointer relative"
                        style={{zIndex: 1001}}
                        onClick={(e) => {
                          e.preventDefault()
                          e.stopPropagation()
                          handleDeletePrescription(prescription.id)
                        }}
                      >
                        <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
                      </button>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                  <div className="space-y-3">
                    <div className="flex items-center text-sm">
                      <Calendar className="w-3 h-3 sm:w-4 sm:h-4 text-slate-500 mr-2 flex-shrink-0" />
                      <span className="text-slate-600 dark:text-slate-400">Duration: </span>
                      <span className="font-medium text-slate-800 dark:text-white ml-1 truncate">
                        {prescription.duration}
                      </span>
                    </div>
                    <div className="flex items-center text-sm">
                      <Clock className="w-3 h-3 sm:w-4 sm:h-4 text-slate-500 mr-2 flex-shrink-0" />
                      <span className="text-slate-600 dark:text-slate-400">Times: </span>
                      <span className="font-medium text-slate-800 dark:text-white ml-1 truncate">
                        {prescription.times.join(', ')}
                      </span>
                    </div>
                    <div className="flex items-center text-sm">
                      <CheckCircle2 className="w-3 h-3 sm:w-4 sm:h-4 text-green-500 mr-2 flex-shrink-0" />
                      <span className="text-slate-600 dark:text-slate-400">Progress: </span>
                      <span className="font-medium text-slate-800 dark:text-white ml-1">
                        {prescription.takenDoses}/{prescription.totalDoses} doses
                      </span>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {prescription.specialInstructions && (
                      <div className="bg-blue-50 dark:bg-blue-900/20 p-2 sm:p-3 rounded-lg border border-blue-200 dark:border-blue-800">
                        <div className="flex items-start">
                          <Info className="w-3 h-3 sm:w-4 sm:h-4 text-blue-500 mr-2 mt-0.5 flex-shrink-0" />
                          <div className="text-sm">
                            <p className="font-medium text-blue-700 dark:text-blue-300 mb-1">Special Instructions:</p>
                            <p className="text-blue-600 dark:text-blue-400 text-xs sm:text-sm">{prescription.specialInstructions}</p>
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="flex flex-wrap gap-1 sm:gap-2">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        prescription.beforeAfterFood === 'before' 
                          ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/20 dark:text-orange-300'
                          : 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-300'
                      }`}>
                        {prescription.beforeAfterFood} food
                      </span>
                      {prescription.withWater && (
                        <span className="px-2 py-1 text-xs bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300 rounded-full">
                          with water
                        </span>
                      )}
                      {prescription.avoidAlcohol && (
                        <span className="px-2 py-1 text-xs bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-300 rounded-full">
                          avoid alcohol
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="mt-4">
                  <div className="flex items-center justify-between text-xs sm:text-sm text-slate-600 dark:text-slate-400 mb-2">
                    <span>Progress</span>
                    <span>{Math.round((prescription.takenDoses / prescription.totalDoses) * 100)}%</span>
                  </div>
                  <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${(prescription.takenDoses / prescription.totalDoses) * 100}%` }}
                      transition={{ duration: 0.5 }}
                      className="bg-gradient-to-r from-green-500 to-emerald-500 h-2 rounded-full"
                    />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {prescriptions.length === 0 && (
          <Card className="text-center py-8 sm:py-12">
            <Pill className="w-12 h-12 sm:w-16 sm:h-16 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
            <h3 className="text-base sm:text-lg font-medium text-slate-800 dark:text-white mb-2">No Prescriptions</h3>
            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 mb-4">Add your first prescription to get started</p>
            <Button onClick={() => setShowAddModal(true)} className="px-4 sm:px-6">
              <Plus className="w-4 h-4 mr-2" />
              Add Prescription
            </Button>
          </Card>
        )}
      </div>

      <Modal open={showAddModal} onClose={() => {
        if (!addingPrescription) {
          setShowAddModal(false)
          setSelectedPrescription(null)
          setPrescriptionForm({
            medicineName: '',
            dosage: '',
            frequency: '',
            duration: '',
            specialInstructions: '',
            beforeAfterFood: 'after',
            withWater: true,
            avoidAlcohol: false,
            times: ['08:00'],
            totalDoses: '',
            startDate: new Date().toISOString().split('T')[0]
          })
        }
      }} size="lg">
        <div className="p-8">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-slate-800 dark:text-white">
              {selectedPrescription ? 'Edit Prescription' : 'Add New Prescription'}
            </h2>
            <p className="text-slate-600 dark:text-slate-400 mt-2">
              {selectedPrescription ? 'Update your prescription details' : 'Enter your prescription information'}
            </p>
          </div>
          
          <div className="space-y-6">
            <div className="grid md:grid-cols-2 gap-4">
              <Input
                label="Medicine Name"
                placeholder="e.g., Vitamin D, Paracetamol"
                value={prescriptionForm.medicineName}
                onChange={(e) => setPrescriptionForm(prev => ({...prev, medicineName: e.target.value}))}
                required
              />
              <Input
                label="Dosage"
                placeholder="e.g., 500mg, 2 tablets"
                value={prescriptionForm.dosage}
                onChange={(e) => setPrescriptionForm(prev => ({...prev, dosage: e.target.value}))}
                required
              />
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <Input
                label="Frequency"
                placeholder="e.g., Twice daily, Every 8 hours"
                value={prescriptionForm.frequency}
                onChange={(e) => setPrescriptionForm(prev => ({...prev, frequency: e.target.value}))}
                required
              />
              <Input
                label="Duration"
                placeholder="e.g., 7 days, 2 weeks"
                value={prescriptionForm.duration}
                onChange={(e) => setPrescriptionForm(prev => ({...prev, duration: e.target.value}))}
                required
              />
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <Input
                label="Start Date"
                type="date"
                value={prescriptionForm.startDate}
                onChange={(e) => setPrescriptionForm(prev => ({...prev, startDate: e.target.value}))}
                required
              />
              <Input
                label="Total Number of Doses"
                type="number"
                placeholder="e.g., 30"
                value={prescriptionForm.totalDoses}
                onChange={(e) => setPrescriptionForm(prev => ({...prev, totalDoses: e.target.value}))}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Special Instructions
              </label>
              <textarea
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-slate-800 dark:text-white"
                rows="3"
                placeholder="Any special instructions for taking this medicine..."
                value={prescriptionForm.specialInstructions}
                onChange={(e) => setPrescriptionForm(prev => ({...prev, specialInstructions: e.target.value}))}
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  Dose Times
                </label>
                <Button 
                  size="sm" 
                  type="button"
                  onClick={() => setPrescriptionForm(prev => ({...prev, times: [...prev.times, '08:00']}))} 
                  variant="outline"
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Add Time
                </Button>
              </div>

              <div className="space-y-2">
                {prescriptionForm.times.map((time, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <Input
                      type="time"
                      value={time}
                      onChange={(e) => {
                        const newTimes = [...prescriptionForm.times]
                        newTimes[index] = e.target.value
                        setPrescriptionForm(prev => ({...prev, times: newTimes}))
                      }}
                      className="flex-1"
                    />
                    <Button
                      size="sm"
                      type="button"
                      variant="ghost"
                      onClick={() => {
                        const newTimes = prescriptionForm.times.filter((_, i) => i !== index)
                        setPrescriptionForm(prev => ({...prev, times: newTimes}))
                      }}
                      className="text-red-500 hover:text-red-600"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  When to Take
                </label>
                <select
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-slate-800 dark:text-white"
                  value={prescriptionForm.beforeAfterFood}
                  onChange={(e) => setPrescriptionForm(prev => ({...prev, beforeAfterFood: e.target.value}))}
                >
                  <option value="before">Before food</option>
                  <option value="after">After food</option>
                  <option value="with">With food</option>
                  <option value="anytime">Anytime</option>
                </select>
              </div>

              <div className="flex items-center space-x-2 pt-8">
                <input
                  type="checkbox"
                  id="withWater"
                  checked={prescriptionForm.withWater}
                  onChange={(e) => setPrescriptionForm(prev => ({...prev, withWater: e.target.checked}))}
                  className="rounded border-slate-300 text-primary focus:ring-primary"
                />
                <label htmlFor="withWater" className="text-sm text-slate-700 dark:text-slate-300">
                  Take with water
                </label>
              </div>

              <div className="flex items-center space-x-2 pt-8">
                <input
                  type="checkbox"
                  id="avoidAlcohol"
                  checked={prescriptionForm.avoidAlcohol}
                  onChange={(e) => setPrescriptionForm(prev => ({...prev, avoidAlcohol: e.target.checked}))}
                  className="rounded border-slate-300 text-primary focus:ring-primary"
                />
                <label htmlFor="avoidAlcohol" className="text-sm text-slate-700 dark:text-slate-300">
                  Avoid alcohol
                </label>
              </div>
            </div>

            <div className="flex space-x-4 pt-8">
              <Button 
                onClick={handleAddPrescription} 
                className="bg-primary hover:bg-primary/90 flex-1"
                disabled={addingPrescription}
              >
                {addingPrescription ? (
                  <div className="flex items-center">
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    {selectedPrescription ? 'Updating...' : 'Adding...'}
                  </div>
                ) : (
                  selectedPrescription ? 'Update Prescription' : 'Add Prescription'
                )}
              </Button>
              <Button 
                variant="outline" 
                onClick={() => {
                  if (!addingPrescription) {
                    setShowAddModal(false)
                    setSelectedPrescription(null)
                    setPrescriptionForm({
                      medicineName: '',
                      dosage: '',
                      frequency: '',
                      duration: '',
                      specialInstructions: '',
                      beforeAfterFood: 'after',
                      withWater: true,
                      avoidAlcohol: false,
                      times: ['08:00'],
                      totalDoses: '',
                      startDate: new Date().toISOString().split('T')[0]
                    })
                  }
                }} 
                className="flex-1"
                disabled={addingPrescription}
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      </Modal>

      <Modal open={showDoseModal} onClose={() => setShowDoseModal(false)}>
        <div className="p-8">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-slate-800 dark:text-white">
              Set Dose Timing
            </h2>
            <p className="text-slate-600 dark:text-slate-400 mt-2">
              Configure timing for {selectedPrescription?.medicineName}
            </p>
          </div>
          
          <div className="space-y-4">
            <Input
              label="Total Number of Doses"
              type="number"
              placeholder="e.g., 30"
              value={doseForm.totalDoses}
              onChange={(e) => setDoseForm(prev => ({...prev, totalDoses: e.target.value}))}
            />

            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  Dose Times
                </label>
                <Button size="sm" onClick={addDoseTime} variant="outline">
                  <Plus className="w-4 h-4 mr-1" />
                  Add Time
                </Button>
              </div>

              <div className="space-y-2">
                {doseForm.doseTimes.map((time, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <Input
                      type="time"
                      value={time}
                      onChange={(e) => updateDoseTime(index, e.target.value)}
                      className="flex-1"
                    />
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => removeDoseTime(index)}
                      className="text-red-500 hover:text-red-600"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex space-x-4 pt-8">
              <Button onClick={handleUpdateDoseTiming} className="bg-primary hover:bg-primary/90 flex-1">
                Save Timing
              </Button>
              <Button variant="outline" onClick={() => setShowDoseModal(false)} className="flex-1">
                Cancel
              </Button>
            </div>
          </div>
        </div>
      </Modal>
    </Layout>
  )
}
