import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Layout } from '../components/Layout.jsx'
import { Card } from '../components/Card.jsx'
import { Button } from '../components/Button.jsx'
import { Modal } from '../components/Modal.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import { useNotifications } from '../context/NotificationContext.jsx'
import { useNavigate } from 'react-router-dom'
import { User,  Calendar,  Clock,  CheckCircle, AlertTriangle, XCircle, Stethoscope, Phone, Mail, MapPin, Plus, RefreshCw, Video, MessageCircle, Star, IndianRupee, Heart, Pill, ChefHat, Edit3, Users} from 'lucide-react'

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

const nav = [
  {to:'/dashboard/user', label:'Overview', icon: User},
  {to:'/dashboard/user/journal', label:'Health Journal', icon: Edit3},
  {to:'/dashboard/user/doctors', label:'Available Doctors', icon: Stethoscope},
  {to:'/dashboard/user/appointments', label:'My Appointments', icon: Calendar},
  {to:'/dashboard/user/prescriptions', label:'Prescriptions', icon: Heart},
  {to:'/dashboard/user/medicines', label:'Medicines', icon: Pill},
  {to:'/dashboard/user/diet', label:'AI Diet Plan', icon: ChefHat},
  {to:'/dashboard/user/community', label:'Community', icon: Users}
]

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
}

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { duration: 0.5 }
  }
}

export const UserAppointments = () => {
  const { token } = useAuth()
  const { addNotification } = useNotifications()
  const navigate = useNavigate()
  const [appointments, setAppointments] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedAppointment, setSelectedAppointment] = useState(null)
  const [viewModal, setViewModal] = useState(false)

  useEffect(() => {
    fetchAppointments()
  }, [])

  const fetchAppointments = async () => {
    try {
      const response = await fetch(`${API_BASE}/appointments/patient/appointments`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      const data = await response.json()
      
      if (data.success) {
        setAppointments(data.appointments)
      }
    } catch (error) {
      console.error('Error fetching appointments:', error)
      addNotification({
        type: 'error',
        message: 'Failed to load appointments',
        description: 'Please try again later'
      })
    } finally {
      setLoading(false)
    }
  }

  const handleViewDetails = (appointment) => {
    setSelectedAppointment(appointment)
    setViewModal(true)
  }

  const getStatusColor = (status) => {
    switch(status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
      case 'confirmed': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400'
      case 'completed': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
      case 'cancelled': return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
      default: return 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-400'
    }
  }

  const getStatusIcon = (status) => {
    switch(status) {
      case 'pending': return <Clock className="w-4 h-4" />
      case 'confirmed': return <CheckCircle className="w-4 h-4" />
      case 'completed': return <CheckCircle className="w-4 h-4" />
      case 'cancelled': return <XCircle className="w-4 h-4" />
      default: return <AlertTriangle className="w-4 h-4" />
    }
  }

  const getUrgencyColor = (urgency) => {
    switch(urgency) {
      case 'high': return 'text-red-600'
      case 'medium': return 'text-yellow-600'
      case 'low': return 'text-green-600'
      default: return 'text-slate-600'
    }
  }

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const AppointmentCard = ({ appointment }) => (
    <motion.div
      variants={itemVariants}
      whileHover={{ y: -2 }}
      className="relative"
    >
      <Card className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-gradient-to-br from-primary/20 to-primary/10 rounded-full flex items-center justify-center">
              <Stethoscope className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-900 dark:text-white">
                Dr. {appointment.doctorName}
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                {appointment.specialization || 'General Physician'}
              </p>
              <div className="flex items-center mt-1">
                <Star className="w-4 h-4 text-yellow-400 fill-current" />
                <span className="text-sm text-slate-600 dark:text-slate-400 ml-1">
                  {appointment.rating || 4.5}
                </span>
              </div>
            </div>
          </div>
          <div className="text-right">
            <span className={`px-2 py-1 text-xs font-medium rounded-full inline-flex items-center space-x-1 ${getStatusColor(appointment.status)}`}>
              {getStatusIcon(appointment.status)}
              <span>{appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}</span>
            </span>
            <p className="text-sm text-slate-500 mt-1">
              {formatDate(appointment.appointmentDate)} • {appointment.appointmentTime}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="text-sm font-medium text-slate-600 dark:text-slate-400">Appointment Type</label>
            <p className="text-slate-900 dark:text-white capitalize">
              {appointment.appointmentType === 'online' ? '💻 Online Consultation' : 
               appointment.appointmentType === 'offline' ? '🏥 In-Person Visit' : '💬 Chat Consultation'}
            </p>
          </div>
          <div>
            <label className="text-sm font-medium text-slate-600 dark:text-slate-400">Urgency Level</label>
            <p className={`font-medium capitalize ${getUrgencyColor(appointment.urgencyLevel)}`}>
              {appointment.urgencyLevel}
            </p>
          </div>
        </div>

        <div className="space-y-3 mb-4">
          <div>
            <label className="text-sm font-medium text-slate-600 dark:text-slate-400">Symptoms</label>
            <p className="text-slate-900 dark:text-white">{appointment.symptoms || 'Not provided'}</p>
          </div>
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-slate-200 dark:border-slate-700">
          <div className="text-sm text-slate-600 dark:text-slate-400">
            Consultation Fee: <span className="font-semibold text-green-600">₹{appointment.consultationFee}</span>
          </div>
          <div className="flex space-x-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleViewDetails(appointment)}
            >
              View Details
            </Button>
            {appointment.appointmentType === 'online' && appointment.status === 'confirmed' && (
              <Button
                size="sm"
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                <Video className="w-4 h-4 mr-1" />
                Join Call
              </Button>
            )}
          </div>
        </div>
      </Card>
    </motion.div>
  )

  const stats = {
    total: appointments.length,
    pending: appointments.filter(a => a.status === 'pending').length,
    confirmed: appointments.filter(a => a.status === 'confirmed').length,
    completed: appointments.filter(a => a.status === 'completed').length
  }

  return (
    <>
      <Layout items={nav}>
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-6"
        ><motion.div variants={itemVariants} className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
                My Appointments
              </h1>
              <p className="text-slate-600 dark:text-slate-400 mt-1">
                View and manage your medical appointments
              </p>
            </div>
            <div className="flex items-center space-x-3 mt-4 sm:mt-0">
              <Button
                onClick={() => navigate('/dashboard/user/doctors')}
                className="bg-primary hover:bg-primary/90 text-white"
              >
                <Plus className="w-4 h-4 mr-2" />
                Book New Appointment
              </Button>
              <Button
                variant="outline"
                onClick={fetchAppointments}
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh
              </Button>
            </div>
          </motion.div><motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="p-4">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                  <Calendar className="w-5 h-5 text-blue-600" />
                </div>
                <div className="ml-3">
                  <p className="text-sm text-slate-600 dark:text-slate-400">Total</p>
                  <p className="text-lg font-semibold text-slate-900 dark:text-white">{stats.total}</p>
                </div>
              </div>
            </Card>
            
            <Card className="p-4">
              <div className="flex items-center">
                <div className="p-2 bg-yellow-100 dark:bg-yellow-900/20 rounded-lg">
                  <Clock className="w-5 h-5 text-yellow-600" />
                </div>
                <div className="ml-3">
                  <p className="text-sm text-slate-600 dark:text-slate-400">Pending</p>
                  <p className="text-lg font-semibold text-slate-900 dark:text-white">{stats.pending}</p>
                </div>
              </div>
            </Card>
            
            <Card className="p-4">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                  <CheckCircle className="w-5 h-5 text-blue-600" />
                </div>
                <div className="ml-3">
                  <p className="text-sm text-slate-600 dark:text-slate-400">Confirmed</p>
                  <p className="text-lg font-semibold text-slate-900 dark:text-white">{stats.confirmed}</p>
                </div>
              </div>
            </Card>
            
            <Card className="p-4">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-lg">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                </div>
                <div className="ml-3">
                  <p className="text-sm text-slate-600 dark:text-slate-400">Completed</p>
                  <p className="text-lg font-semibold text-slate-900 dark:text-white">{stats.completed}</p>
                </div>
              </div>
            </Card>
          </motion.div>{loading ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="bg-slate-200 dark:bg-slate-800 rounded-lg h-64"></div>
                </div>
              ))}
            </div>
          ) : appointments.length === 0 ? (
            <motion.div variants={itemVariants} className="text-center py-12">
              <Calendar className="w-16 h-16 text-slate-400 mx-auto mb-4" />
              <h3 className="text-xl font-medium text-slate-900 dark:text-white mb-2">
                No Appointments Yet
              </h3>
              <p className="text-slate-600 dark:text-slate-400 mb-6">
                You haven't booked any appointments yet. Start by browsing our available doctors.
              </p>
              <Button
                onClick={() => navigate('/dashboard/user/doctors')}
                className="bg-primary hover:bg-primary/90 text-white"
              >
                <Plus className="w-4 h-4 mr-2" />
                Book Your First Appointment
              </Button>
            </motion.div>
          ) : (
            <motion.div 
              variants={containerVariants}
              className="grid grid-cols-1 lg:grid-cols-2 gap-6"
            >
              {appointments.map((appointment) => (
                <AppointmentCard key={appointment._id} appointment={appointment} />
              ))}
            </motion.div>
          )}
        </motion.div>
      </Layout><AnimatePresence>
        {viewModal && selectedAppointment && (
          <Modal
            isOpen={viewModal}
            onClose={() => setViewModal(false)}
            title={`Appointment with Dr. ${selectedAppointment.doctorName}`}
          >
            <div className="space-y-4"><div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-lg">
                <h3 className="font-semibold text-slate-900 dark:text-white mb-3">Appointment Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-slate-600 dark:text-slate-400">Date & Time</label>
                    <p className="text-slate-900 dark:text-white">
                      {formatDate(selectedAppointment.appointmentDate)} at {selectedAppointment.appointmentTime}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-600 dark:text-slate-400">Status</label>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(selectedAppointment.status)}`}>
                      {selectedAppointment.status.charAt(0).toUpperCase() + selectedAppointment.status.slice(1)}
                    </span>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-600 dark:text-slate-400">Type</label>
                    <p className="text-slate-900 dark:text-white capitalize">
                      {selectedAppointment.appointmentType === 'online' ? 'Online Consultation' : 
                       selectedAppointment.appointmentType === 'offline' ? 'In-Person Visit' : 'Chat Consultation'}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-600 dark:text-slate-400">Consultation Fee</label>
                    <p className="text-slate-900 dark:text-white">₹{selectedAppointment.consultationFee}</p>
                  </div>
                </div>
              </div><div>
                <h3 className="font-semibold text-slate-900 dark:text-white mb-3">Medical Information</h3>
                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium text-slate-600 dark:text-slate-400">Symptoms</label>
                    <p className="text-slate-900 dark:text-white">{selectedAppointment.symptoms || 'Not provided'}</p>
                  </div>
                  
                  {selectedAppointment.currentMedication && selectedAppointment.currentMedication.length > 0 && (
                    <div>
                      <label className="text-sm font-medium text-slate-600 dark:text-slate-400">Current Medications</label>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {selectedAppointment.currentMedication.map((med, index) => (
                          <span
                            key={index}
                            className="px-2 py-1 bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400 text-sm rounded-full"
                          >
                            {med}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {selectedAppointment.medicalHistory && (
                    <div>
                      <label className="text-sm font-medium text-slate-600 dark:text-slate-400">Medical History</label>
                      <p className="text-slate-900 dark:text-white">{selectedAppointment.medicalHistory}</p>
                    </div>
                  )}
                </div>
              </div>{selectedAppointment.doctorNotes && (
                <div>
                  <h3 className="font-semibold text-slate-900 dark:text-white mb-3">Doctor's Notes</h3>
                  <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                    <p className="text-slate-900 dark:text-white">{selectedAppointment.doctorNotes}</p>
                  </div>
                </div>
              )}{selectedAppointment.prescription && selectedAppointment.prescription.length > 0 && (
                <div>
                  <h3 className="font-semibold text-slate-900 dark:text-white mb-3">Prescription</h3>
                  <div className="space-y-2">
                    {selectedAppointment.prescription.map((med, index) => (
                      <div key={index} className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                          <div>
                            <span className="font-medium text-slate-600 dark:text-slate-400">Medicine:</span>
                            <p className="text-slate-900 dark:text-white">{med.medicine}</p>
                          </div>
                          <div>
                            <span className="font-medium text-slate-600 dark:text-slate-400">Dosage:</span>
                            <p className="text-slate-900 dark:text-white">{med.dosage}</p>
                          </div>
                          <div>
                            <span className="font-medium text-slate-600 dark:text-slate-400">Frequency:</span>
                            <p className="text-slate-900 dark:text-white">{med.frequency}</p>
                          </div>
                          <div>
                            <span className="font-medium text-slate-600 dark:text-slate-400">Duration:</span>
                            <p className="text-slate-900 dark:text-white">{med.duration}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex justify-end">
                <Button
                  variant="outline"
                  onClick={() => setViewModal(false)}
                >
                  Close
                </Button>
              </div>
            </div>
          </Modal>
        )}
      </AnimatePresence>
    </>
  )
}
