import { useState, useEffect } from 'react'
import { Layout } from '../../components/Layout'
import { Card } from '../../components/Card'
import { Button } from '../../components/Button'
import { Modal } from '../../components/Modal'
import { motion, AnimatePresence } from 'framer-motion'
import { Users,  Calendar,  Clock,  CheckCircle, AlertTriangle, User, Stethoscope, FileText, Star, Activity, Pill, Phone, Mail, MapPin, Edit3, Eye, MessageCircle, Video, UserCheck} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useNotifications } from '../../context/NotificationContext'
import { API_CONFIG } from '../../config/api.js'

const API_BASE = API_CONFIG.API_URL

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

export const DoctorDashboard = () => {
  const { user, token } = useAuth()
  const { addNotification } = useNotifications()
  const [appointments, setAppointments] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedAppointment, setSelectedAppointment] = useState(null)
  const [consultationModal, setConsultationModal] = useState(false)
  const [consultationNotes, setConsultationNotes] = useState('')
  const [prescription, setPrescription] = useState([{ medicine: '', dosage: '', frequency: '', duration: '' }])
  const [updating, setUpdating] = useState(false)

  const nav = [
    {to:'/dashboard/doctor', label:'Patient Appointments', icon: Users}
  ]

  useEffect(() => {
    fetchAppointments()
  }, [])

  const fetchAppointments = async () => {
    try {
      const response = await fetch(`${API_BASE}/appointments/doctor/appointments`, {
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
    setConsultationModal(true)
    setConsultationNotes(appointment.doctorNotes || '')
    setPrescription(appointment.prescription && appointment.prescription.length > 0 
      ? appointment.prescription 
      : [{ medicine: '', dosage: '', frequency: '', duration: '' }])
  }

  const handleUpdateAppointment = async (status) => {
    if (!selectedAppointment) return
    
    setUpdating(true)
    try {
      const response = await fetch(`${API_BASE}/appointments/doctor/appointments/${selectedAppointment._id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          status,
          doctorNotes: consultationNotes,
          prescription: prescription.filter(item => item.medicine.trim())
        })
      })

      const data = await response.json()

      if (response.ok) {
        addNotification({
          type: 'success',
          message: 'Appointment Updated',
          description: `Appointment has been marked as ${status}`
        })
        setConsultationModal(false)
        fetchAppointments()
      } else {
        throw new Error(data.message || 'Failed to update appointment')
      }
    } catch (error) {
      console.error('Update error:', error)
      addNotification({
        type: 'error',
        message: 'Update Failed',
        description: error.message || 'Please try again'
      })
    } finally {
      setUpdating(false)
    }
  }

  const addPrescriptionItem = () => {
    setPrescription([...prescription, { medicine: '', dosage: '', frequency: '', duration: '' }])
  }

  const updatePrescriptionItem = (index, field, value) => {
    const updated = prescription.map((item, i) => 
      i === index ? { ...item, [field]: value } : item
    )
    setPrescription(updated)
  }

  const removePrescriptionItem = (index) => {
    setPrescription(prescription.filter((_, i) => i !== index))
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
              <User className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-900 dark:text-white">
                {appointment.patientName}
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                {appointment.patientEmail}
              </p>
              {appointment.patientPhone && (
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  📞 {appointment.patientPhone}
                </p>
              )}
            </div>
          </div>
          <div className="text-right">
            <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(appointment.status)}`}>
              {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
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
               appointment.appointmentType === 'offline' ? '🏥 In-Person Visit' : 
               appointment.appointmentType === 'virtual' ? '🎥 Online Virtual Meeting' : '💬 Chat Consultation'}
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
            <label className="text-sm font-medium text-slate-600 dark:text-slate-400">Current Symptoms</label>
            <p className="text-slate-900 dark:text-white">{appointment.symptoms || 'Not provided'}</p>
          </div>
          
          {appointment.currentMedication && appointment.currentMedication.length > 0 && (
            <div>
              <label className="text-sm font-medium text-slate-600 dark:text-slate-400">Current Medications</label>
              <div className="flex flex-wrap gap-1 mt-1">
                {appointment.currentMedication.map((med, index) => (
                  <span
                    key={index}
                    className="px-2 py-1 bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400 text-sm rounded-full"
                  >
                    💊 {med}
                  </span>
                ))}
              </div>
            </div>
          )}

          {appointment.medicalHistory && (
            <div>
              <label className="text-sm font-medium text-slate-600 dark:text-slate-400">Medical History</label>
              <p className="text-slate-900 dark:text-white">{appointment.medicalHistory}</p>
            </div>
          )}
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
              <Eye className="w-4 h-4 mr-1" />
              View Details
            </Button>
            {appointment.appointmentType === 'virtual' && appointment.status === 'confirmed' && (
              <Button
                size="sm"
                className="bg-green-600 hover:bg-green-700 text-white"
                onClick={() => {
                  const roomId = `appointment-${appointment._id}`;
                  const meetingLink = `/meeting-room?roomID=${roomId}`;
                  window.open(meetingLink, '_blank');
                }}
              >
                <Video className="w-4 h-4 mr-1" />
                Join Meeting
              </Button>
            )}
            {appointment.status === 'pending' && (
              <Button
                size="sm"
                onClick={() => {
                  setSelectedAppointment(appointment)
                  handleUpdateAppointment('confirmed')
                }}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                <CheckCircle className="w-4 h-4 mr-1" />
                Confirm
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
                Patient Appointments
              </h1>
              <p className="text-slate-600 dark:text-slate-400 mt-1">
                Manage your patient consultations and medical records
              </p>
            </div>
            <div className="flex items-center space-x-3 mt-4 sm:mt-0">
              <div className="text-sm text-slate-600 dark:text-slate-400">
                Welcome back, <span className="font-semibold">Dr. {user?.name}</span>
              </div>
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
                  <UserCheck className="w-5 h-5 text-blue-600" />
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
              <Stethoscope className="w-16 h-16 text-slate-400 mx-auto mb-4" />
              <h3 className="text-xl font-medium text-slate-900 dark:text-white mb-2">
                No Appointments Yet
              </h3>
              <p className="text-slate-600 dark:text-slate-400">
                Patient appointments will appear here once they book consultations with you.
              </p>
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
        {consultationModal && selectedAppointment && (
          <Modal
            open={consultationModal}
            onClose={() => setConsultationModal(false)}
            size="large"
          >
            <div className="p-6">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">
                Consultation - {selectedAppointment.patientName}
              </h2>
            <div className="space-y-6"><div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-lg">
                <h3 className="font-semibold text-slate-900 dark:text-white mb-3">Patient Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-slate-600 dark:text-slate-400">Name</label>
                    <p className="text-slate-900 dark:text-white">{selectedAppointment.patientName}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-600 dark:text-slate-400">Email</label>
                    <p className="text-slate-900 dark:text-white">{selectedAppointment.patientEmail}</p>
                  </div>
                  {selectedAppointment.patientPhone && (
                    <div>
                      <label className="text-sm font-medium text-slate-600 dark:text-slate-400">Phone</label>
                      <p className="text-slate-900 dark:text-white">{selectedAppointment.patientPhone}</p>
                    </div>
                  )}
                  <div>
                    <label className="text-sm font-medium text-slate-600 dark:text-slate-400">Appointment Date</label>
                    <p className="text-slate-900 dark:text-white">
                      {formatDate(selectedAppointment.appointmentDate)} at {selectedAppointment.appointmentTime}
                    </p>
                  </div>
                </div>
              </div>

              {/* Virtual Meeting Section for Doctor */}
              {selectedAppointment.appointmentType === 'virtual' && selectedAppointment.status === 'confirmed' && (
                <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 border border-green-200 dark:border-green-800">
                  <h3 className="font-semibold text-green-900 dark:text-green-100 mb-3 flex items-center">
                    <Video className="w-5 h-5 mr-2" />
                    Virtual Meeting Access
                  </h3>
                  <div className="flex items-center space-x-3">
                    <Button
                      onClick={() => {
                        const roomId = `appointment-${selectedAppointment._id}`;
                        const meetingLink = `/meeting-room?roomID=${roomId}`;
                        window.open(meetingLink, '_blank');
                      }}
                      className="bg-green-600 hover:bg-green-700 text-white"
                      size="sm"
                    >
                      <Video className="w-4 h-4 mr-2" />
                      Start Meeting
                    </Button>
                    <Button
                      onClick={() => {
                        const roomId = `appointment-${selectedAppointment._id}`;
                        const meetingLink = `${window.location.origin}/meeting-room?roomID=${roomId}`;
                        navigator.clipboard.writeText(meetingLink);
                      }}
                      variant="outline"
                      size="sm"
                      className="border-green-600 text-green-600 hover:bg-green-50"
                    >
                      Copy Patient Link
                    </Button>
                  </div>
                  <p className="text-green-800 dark:text-green-200 text-sm mt-2">
                    Share the patient link so they can join the same meeting room.
                  </p>
                </div>
              )}

              <div>
                <h3 className="font-semibold text-slate-900 dark:text-white mb-3">Medical Information</h3>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-slate-600 dark:text-slate-400">Symptoms</label>
                    <p className="text-slate-900 dark:text-white">{selectedAppointment.symptoms || 'Not provided'}</p>
                  </div>
                  
                  {selectedAppointment.currentMedication && selectedAppointment.currentMedication.length > 0 && (
                    <div>
                      <label className="text-sm font-medium text-slate-600 dark:text-slate-400">Current Medications</label>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {selectedAppointment.currentMedication.map((med, index) => (
                          <span
                            key={index}
                            className="px-3 py-1 bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400 text-sm rounded-full"
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
              </div><div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Consultation Notes
                </label>
                <textarea
                  rows={4}
                  value={consultationNotes}
                  onChange={(e) => setConsultationNotes(e.target.value)}
                  placeholder="Add your consultation notes..."
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div><div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-slate-900 dark:text-white">Prescription</h3>
                  <Button
                    size="sm"
                    onClick={addPrescriptionItem}
                    className="bg-green-600 hover:bg-green-700 text-white"
                  >
                    Add Medicine
                  </Button>
                </div>
                
                <div className="space-y-3">
                  {prescription.map((item, index) => (
                    <div key={index} className="grid grid-cols-1 md:grid-cols-4 gap-2 p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                      <input
                        type="text"
                        placeholder="Medicine name"
                        value={item.medicine}
                        onChange={(e) => updatePrescriptionItem(index, 'medicine', e.target.value)}
                        className="px-3 py-2 border border-slate-300 dark:border-slate-600 rounded bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                      />
                      <input
                        type="text"
                        placeholder="Dosage"
                        value={item.dosage}
                        onChange={(e) => updatePrescriptionItem(index, 'dosage', e.target.value)}
                        className="px-3 py-2 border border-slate-300 dark:border-slate-600 rounded bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                      />
                      <input
                        type="text"
                        placeholder="Frequency"
                        value={item.frequency}
                        onChange={(e) => updatePrescriptionItem(index, 'frequency', e.target.value)}
                        className="px-3 py-2 border border-slate-300 dark:border-slate-600 rounded bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                      />
                      <div className="flex space-x-2">
                        <input
                          type="text"
                          placeholder="Duration"
                          value={item.duration}
                          onChange={(e) => updatePrescriptionItem(index, 'duration', e.target.value)}
                          className="flex-1 px-3 py-2 border border-slate-300 dark:border-slate-600 rounded bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                        />
                        {prescription.length > 1 && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => removePrescriptionItem(index)}
                            className="text-red-600 hover:text-red-700"
                          >
                            Remove
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div><div className="flex items-center justify-between pt-6 border-t border-slate-200 dark:border-slate-700">
                <Button
                  variant="outline"
                  onClick={() => setConsultationModal(false)}
                >
                  Close
                </Button>
                <div className="flex space-x-3">
                  {selectedAppointment.status !== 'completed' && (
                    <Button
                      onClick={() => handleUpdateAppointment('completed')}
                      disabled={updating}
                      className="bg-green-600 hover:bg-green-700 text-white"
                    >
                      {updating ? 'Updating...' : 'Mark as Completed'}
                    </Button>
                  )}
                </div>
              </div>
              </div>
            </div>
          </Modal>
        )}
      </AnimatePresence>
    </>
  )
}
