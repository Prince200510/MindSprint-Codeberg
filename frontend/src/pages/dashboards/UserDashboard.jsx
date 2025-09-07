import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Layout } from '../../components/Layout.jsx'
import { Card } from '../../components/Card.jsx'
import { Button } from '../../components/Button.jsx'
import { Modal } from '../../components/Modal.jsx'
import { Input } from '../../components/Input.jsx'
import { motion, AnimatePresence } from 'framer-motion'
import { Heart,  AlertTriangle,  Pill,  Calendar,  Edit3,  Trash2,  Plus,  Clock, Bell, User, Phone, MapPin, CheckCircle2, X, LogOut, ChefHat, Stethoscope, Users} from 'lucide-react'
import { useAuth } from '../../context/AuthContext.jsx'
import { API_CONFIG } from '../../config/api.js'

const API_BASE = API_CONFIG.API_URL

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

export const UserDashboard = () => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [patientData, setPatientData] = useState(null)
  const [prescriptions, setPrescriptions] = useState([])
  const [nextDose, setNextDose] = useState(null)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showAppointmentModal, setShowAppointmentModal] = useState(false)
  const [editingCondition, setEditingCondition] = useState(null)
  const [loading, setLoading] = useState(true)
  const [appointmentForm, setAppointmentForm] = useState({
    doctorId: '',
    appointmentType: 'online',
    appointmentDate: '',
    appointmentTime: '',
    symptoms: '',
    currentMedication: '',
    medicalHistory: '',
    urgencyLevel: 'medium'
  })
  const [availableDoctors, setAvailableDoctors] = useState([])
  const [bookingAppointment, setBookingAppointment] = useState(false)

  useEffect(() => {
    const fetchPatientData = async () => {
      try {
        const token = localStorage.getItem('token')
        const response = await fetch(`${API_BASE}/auth/profile`, {
          headers: { 'Authorization': `Bearer ${token}` }
        })
        
        if (response.ok) {
          const data = await response.json()
          setPatientData(data.user)
          console.log('Patient data:', data.user) 
        }
      } catch (error) {
        if (user) {
          setPatientData(user)
        }
      } finally {
        setLoading(false)
      }
    }

    const fetchPrescriptions = async () => {
      try {
        const token = localStorage.getItem('token')
        
        const response = await fetch(`${API_BASE}/prescriptions`, {
          headers: { 'Authorization': `Bearer ${token}` }
        })
        
        if (response.ok) {
          const data = await response.json()
          setPrescriptions(data.prescriptions || [])
          
          const activePrescriptions = data.prescriptions?.filter(p => p.active && p.times?.length > 0) || []
          const nextDoseInfo = calculateNextDose(activePrescriptions)
          setNextDose(nextDoseInfo)
        }
      } catch (error) {
        console.error('Error fetching prescriptions:', error)
      }
    }

    const fetchDoctors = async () => {
      try {
        const token = localStorage.getItem('token')
        
        const response = await fetch(`${API_BASE}/appointments/doctors/available`, {
          headers: { 'Authorization': `Bearer ${token}` }
        })
        
        if (response.ok) {
          const data = await response.json()
          setAvailableDoctors(data.doctors || [])
        }
      } catch (error) {
        console.error('Error fetching doctors:', error)
      }
    }

    if (user) {
      fetchPatientData()
      fetchPrescriptions()
      fetchDoctors()
    }
  }, [user])

  const calculateNextDose = (prescriptions) => {
    const now = new Date()
    const currentTime = now.getHours() * 60 + now.getMinutes()
    
    let nextDose = null
    let minTimeDiff = Infinity
    
    prescriptions.forEach(prescription => {
      prescription.times?.forEach(timeStr => {
        const [hours, minutes] = timeStr.split(':').map(Number)
        const timeInMinutes = hours * 60 + minutes
        
        let timeDiff = timeInMinutes - currentTime
        if (timeDiff < 0) {
          timeDiff += 24 * 60
        }
        
        if (timeDiff < minTimeDiff) {
          minTimeDiff = timeDiff
          nextDose = {
            time: timeStr,
            medicine: prescription.medicineName,
            dosage: prescription.dosage
          }
        }
      })
    })
    
    return nextDose
  }

  const handleRemoveCondition = async (conditionToRemove) => {
    try {
      const token = localStorage.getItem('token')
      const updatedConditions = patientData.profile.medicalHistory.conditions.filter(
        condition => condition !== conditionToRemove
      )

      const response = await fetch(`${API_BASE}/auth/update-profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          'profile.medicalHistory.conditions': updatedConditions
        })
      })

      if (response.ok) {
        setPatientData(prev => ({
          ...prev,
          profile: {
            ...prev.profile,
            medicalHistory: {
              ...prev.profile.medicalHistory,
              conditions: updatedConditions
            }
          }
        }))
      }
    } catch (error) {
      console.error('Error removing condition:', error)
    }
  }

  const handleBookAppointment = () => {
    setShowAppointmentModal(true)
  }

  const handleAppointmentFormChange = (field, value) => {
    setAppointmentForm(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const submitAppointment = async () => {
    if (!appointmentForm.doctorId || !appointmentForm.appointmentDate || !appointmentForm.appointmentTime) {
      alert('Please fill in all required fields')
      return
    }

    setBookingAppointment(true)
    try {
      const token = localStorage.getItem('token')
      
      const response = await fetch(`${API_BASE}/appointments/book`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(appointmentForm)
      })

      if (response.ok) {
        const data = await response.json()
        alert('Appointment booked successfully!')
        setShowAppointmentModal(false)
        // Reset form
        setAppointmentForm({
          doctorId: '',
          appointmentType: 'online',
          appointmentDate: '',
          appointmentTime: '',
          symptoms: '',
          currentMedication: '',
          medicalHistory: '',
          urgencyLevel: 'medium'
        })
      } else {
        const errorData = await response.json()
        alert(errorData.message || 'Failed to book appointment')
      }
    } catch (error) {
      console.error('Error booking appointment:', error)
      alert('Failed to book appointment. Please try again.')
    } finally {
      setBookingAppointment(false)
    }
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
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-slate-800 dark:to-slate-900 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white text-xl font-bold">
                {(patientData?.name || user?.name)?.charAt(0).toUpperCase() || 'P'}
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-800 dark:text-white">
                  {patientData?.profile?.firstName && patientData?.profile?.lastName 
                    ? `${patientData.profile.firstName} ${patientData.profile.lastName}`
                    : patientData?.name || user?.name || 'Patient'
                  }
                </h1>
                <p className="text-slate-600 dark:text-slate-400">
                  {patientData?.email || user?.email || 'Patient Dashboard'}
                </p>
              </div>
            </div>
            <div className="flex items-center">
              <Button onClick={handleBookAppointment} className="bg-green-500 hover:bg-green-600 flex items-center">
                <Calendar className="w-4 h-4 mr-2" />
                Book Appointment
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center space-x-3">
              <User className="w-5 h-5 text-blue-500" />
              <div>
                <p className="text-sm text-slate-600 dark:text-slate-400">Age</p>
                <p className="font-medium text-slate-800 dark:text-white">
                  {patientData?.profile?.dateOfBirth 
                    ? Math.floor((new Date() - new Date(patientData.profile.dateOfBirth)) / (365.25 * 24 * 60 * 60 * 1000))
                    : 'Not specified'
                  }
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Phone className="w-5 h-5 text-green-500" />
              <div>
                <p className="text-sm text-slate-600 dark:text-slate-400">Mobile</p>
                <p className="font-medium text-slate-800 dark:text-white">
                  {patientData?.mobile || user?.mobile || 'Not provided'}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <MapPin className="w-5 h-5 text-red-500" />
              <div>
                <p className="text-sm text-slate-600 dark:text-slate-400">Location</p>
                <p className="font-medium text-slate-800 dark:text-white">
                  {patientData?.profile?.city || 'Not specified'}
                </p>
              </div>
            </div>
          </div>
        </div>
        <div className="grid md:grid-cols-4 gap-6">
          <Card className="bg-gradient-to-br from-red-50 to-pink-50 dark:from-red-900/20 dark:to-pink-900/20 border-red-200 dark:border-red-800">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-red-600 dark:text-red-400">Conditions</h3>
                <p className="text-2xl font-bold text-red-700 dark:text-red-300">
                  {patientData?.profile?.medicalHistory?.conditions?.length || 0}
                </p>
              </div>
              <Heart className="w-8 h-8 text-red-500" />
            </div>
          </Card>
          <Card className="bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 border-yellow-200 dark:border-yellow-800">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-yellow-600 dark:text-yellow-400">Allergies</h3>
                <p className="text-2xl font-bold text-yellow-700 dark:text-yellow-300">
                  {patientData?.profile?.medicalHistory?.allergies?.length || 0}
                </p>
              </div>
              <AlertTriangle className="w-8 h-8 text-yellow-500" />
            </div>
          </Card>
          <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 border-blue-200 dark:border-blue-800">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-blue-600 dark:text-blue-400">Medications</h3>
                <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">
                  {prescriptions.filter(p => p.active).length}
                </p>
              </div>
              <Pill className="w-8 h-8 text-blue-500" />
            </div>
          </Card>
          <Card className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-green-200 dark:border-green-800">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-green-600 dark:text-green-400">Next Dose</h3>
                <p className="text-lg font-bold text-green-700 dark:text-green-300">
                  {nextDose ? nextDose.time : 'No doses scheduled'}
                </p>
                <p className="text-xs text-green-600 dark:text-green-400">
                  {nextDose ? nextDose.medicine : 'Add prescriptions to see schedule'}
                </p>
              </div>
              <Clock className="w-8 h-8 text-green-500" />
            </div>
          </Card>
        </div>
        
        <Card className="bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 border-purple-200 dark:border-purple-800">
          <div className="flex items-center justify-between p-6">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-full">
                <ChefHat className="w-8 h-8 text-purple-600" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-slate-800 dark:text-white">
                  AI Diet Plan
                </h3>
                <p className="text-slate-600 dark:text-slate-400">
                  Get personalized meal plans powered by artificial intelligence
                </p>
                <p className="text-sm text-purple-600 dark:text-purple-400 font-medium mt-1">
                  🥗 Customized • 🛒 Shopping Lists • 📊 Nutrition Focused
                </p>
              </div>
            </div>
            <Button 
              onClick={() => navigate('/dashboard/user/diet')}
              className="bg-purple-600 hover:bg-purple-700 text-white flex items-center"
            >
              <ChefHat className="w-5 h-5 mr-2" />
              Generate Plan
            </Button>
          </div>
        </Card>

        <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 border-blue-200 dark:border-blue-800">
          <div className="flex items-center justify-between p-6">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-full">
                <Users className="w-8 h-8 text-blue-600" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-slate-800 dark:text-white">
                  Healthcare Community
                </h3>
                <p className="text-slate-600 dark:text-slate-400">
                  Connect with others, share experiences, and get support
                </p>
                <p className="text-sm text-blue-600 dark:text-blue-400 font-medium mt-1">
                  👥 Support Groups • 💬 Discussions • 🤝 Peer Support
                </p>
              </div>
            </div>
            <Button 
              onClick={() => navigate('/dashboard/user/community')}
              className="bg-blue-600 hover:bg-blue-700 text-white flex items-center"
            >
              <Users className="w-5 h-5 mr-2" />
              Join Community
            </Button>
          </div>
        </Card>
        
        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-slate-800 dark:text-white flex items-center">
                <Heart className="w-5 h-5 mr-2 text-red-500" />
                Medical Conditions
              </h3>
              <span className="text-sm text-slate-500 dark:text-slate-400">
                {patientData?.profile?.medicalHistory?.conditions?.length || 0} conditions
              </span>
            </div>
            <div className="space-y-2">
              {patientData?.profile?.medicalHistory?.conditions?.length > 0 ? (
                patientData.profile.medicalHistory.conditions.map((condition, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-lg"
                  >
                    <span className="font-medium text-slate-700 dark:text-slate-300">{condition}</span>
                    <div className="flex items-center space-x-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleRemoveCondition(condition)}
                        className="text-green-600 hover:text-green-700 hover:bg-green-50 dark:hover:bg-green-900/20"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        <span className="ml-1">Recovered</span>
                      </Button>
                    </div>
                  </motion.div>
                ))
              ) : (
                <p className="text-slate-500 dark:text-slate-400 text-center py-4">No conditions recorded</p>
              )}
            </div>
          </Card>
          <Card>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-slate-800 dark:text-white flex items-center">
                <AlertTriangle className="w-5 h-5 mr-2 text-yellow-500" />
                Allergies
              </h3>
              <span className="text-sm text-slate-500 dark:text-slate-400">
                {patientData?.profile?.medicalHistory?.allergies?.length || 0} allergies
              </span>
            </div>
            <div className="space-y-2">
              {patientData?.profile?.medicalHistory?.allergies?.length > 0 ? (
                patientData.profile.medicalHistory.allergies.map((allergy, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center justify-between p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800"
                  >
                    <span className="font-medium text-yellow-700 dark:text-yellow-300">{allergy}</span>
                    <AlertTriangle className="w-4 h-4 text-yellow-500" />
                  </motion.div>
                ))
              ) : (
                <p className="text-slate-500 dark:text-slate-400 text-center py-4">No allergies recorded</p>
              )}
            </div>
          </Card>
        </div>
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-slate-800 dark:text-white flex items-center">
              <Pill className="w-5 h-5 mr-2 text-blue-500" />
              Current Medications
            </h3>
            <span className="text-sm text-slate-500 dark:text-slate-400">
              {prescriptions.filter(p => p.active).length} medications
            </span>
          </div>
          <div className="grid md:grid-cols-3 gap-3">
            {prescriptions.filter(p => p.active).length > 0 ? (
              prescriptions.filter(p => p.active).map((prescription, index) => (
                <motion.div
                  key={prescription._id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="p-4 bg-gradient-to-br from-[#5f6fff]/10 to-[#5f6fff]/20 dark:from-[#5f6fff]/20 dark:to-[#5f6fff]/30 rounded-lg border border-[#5f6fff]/30 dark:border-[#5f6fff]/40"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-slate-800 dark:text-white">{prescription.medicineName}</span>
                    <Pill className="w-4 h-4 text-[#5f6fff]" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      <span className="font-medium">Dosage:</span> {prescription.dosage}
                    </p>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      <span className="font-medium">Frequency:</span> {prescription.frequency}
                    </p>
                    {prescription.times && prescription.times.length > 0 && (
                      <p className="text-sm text-slate-600 dark:text-slate-400">
                        <span className="font-medium">Times:</span> {prescription.times.join(', ')}
                      </p>
                    )}
                    <div className="flex items-center justify-between pt-2">
                      <p className="text-xs text-[#5f6fff] font-medium">Active</p>
                      <div className="text-xs text-slate-500 dark:text-slate-400">
                        {prescription.takenDoses || 0}/{prescription.totalDoses} doses
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="col-span-3">
                <p className="text-slate-500 dark:text-slate-400 text-center py-8">
                  No active medications found. 
                  <br />
                  <span className="text-sm">Visit the Prescriptions page to add your medications.</span>
                </p>
              </div>
            )}
          </div>
        </Card>
        {patientData?.profile?.medicalHistory?.healthIssues && (
          <Card>
            <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-3 flex items-center">
              <Heart className="w-5 h-5 mr-2 text-red-500" />
              Additional Health Information
            </h3>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
              {patientData.profile.medicalHistory.healthIssues}
            </p>
          </Card>
        )}
      </div>
      <Modal open={showAppointmentModal} onClose={() => setShowAppointmentModal(false)}>
        <div className="p-6">
          <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-4">Book Doctor Appointment</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Select Doctor *
              </label>
              <select
                value={appointmentForm.doctorId}
                onChange={(e) => handleAppointmentFormChange('doctorId', e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-slate-800 dark:text-white"
                required
              >
                <option value="">Select a doctor...</option>
                {availableDoctors.map(doctor => (
                  <option key={doctor.id} value={doctor.id}>
                    Dr. {doctor.name} - {doctor.specialization} (₹{doctor.consultationFee})
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Appointment Type *
              </label>
              <select
                value={appointmentForm.appointmentType}
                onChange={(e) => handleAppointmentFormChange('appointmentType', e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-slate-800 dark:text-white"
              >
                <option value="online">Online Consultation</option>
                <option value="virtual">Online Virtual Meeting</option>
                <option value="in-person">In-Person Visit</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Input 
                  label="Preferred Date *" 
                  type="date" 
                  value={appointmentForm.appointmentDate}
                  onChange={(e) => handleAppointmentFormChange('appointmentDate', e.target.value)}
                  required
                />
              </div>
              <div>
                <Input 
                  label="Preferred Time *" 
                  type="time" 
                  value={appointmentForm.appointmentTime}
                  onChange={(e) => handleAppointmentFormChange('appointmentTime', e.target.value)}
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Urgency Level
              </label>
              <select
                value={appointmentForm.urgencyLevel}
                onChange={(e) => handleAppointmentFormChange('urgencyLevel', e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-slate-800 dark:text-white"
              >
                <option value="low">Low Priority</option>
                <option value="medium">Medium Priority</option>
                <option value="high">High Priority</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Symptoms/Reason for Visit *
              </label>
              <textarea 
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-slate-800 dark:text-white"
                rows="3"
                placeholder="Describe your symptoms or reason for visit..."
                value={appointmentForm.symptoms}
                onChange={(e) => handleAppointmentFormChange('symptoms', e.target.value)}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Current Medications (if any)
              </label>
              <textarea 
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-slate-800 dark:text-white"
                rows="2"
                placeholder="List current medications, separated by commas..."
                value={appointmentForm.currentMedication}
                onChange={(e) => handleAppointmentFormChange('currentMedication', e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Medical History (if relevant)
              </label>
              <textarea 
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-slate-800 dark:text-white"
                rows="2"
                placeholder="Any relevant medical history..."
                value={appointmentForm.medicalHistory}
                onChange={(e) => handleAppointmentFormChange('medicalHistory', e.target.value)}
              />
            </div>

            <div className="flex space-x-3 pt-4">
              <Button 
                onClick={submitAppointment} 
                disabled={bookingAppointment}
                className="bg-primary hover:bg-primary/90 disabled:opacity-50"
              >
                {bookingAppointment ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Booking...
                  </div>
                ) : (
                  'Book Appointment'
                )}
              </Button>
              <Button variant="outline" onClick={() => setShowAppointmentModal(false)}>
                Cancel
              </Button>
            </div>
          </div>
        </div>
      </Modal>
    </Layout>
  )
}
