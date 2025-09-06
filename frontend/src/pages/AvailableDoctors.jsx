import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Layout } from '../components/Layout.jsx'
import { Card } from '../components/Card.jsx'
import { Button } from '../components/Button.jsx'
import { Modal } from '../components/Modal.jsx'
import { Input } from '../components/Input.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import { useNotifications } from '../context/NotificationContext.jsx'
import { useNavigate } from 'react-router-dom'
import { User,  Mail,  Phone,  GraduationCap,  Star,  Clock,  MapPin, Calendar, MessageCircle, Video, UserCheck, IndianRupee, Stethoscope, Heart, Award, Languages, Pill, ChefHat} from 'lucide-react'

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'
const nav = [
  { to: '/dashboard/user', label: 'Dashboard', icon: User },
  { to: '/dashboard/user/doctors', label: 'Available Doctors', icon: Stethoscope },
  { to: '/dashboard/user/appointments', label: 'My Appointments', icon: Calendar },
  { to: '/dashboard/user/prescriptions', label: 'Prescriptions', icon: Heart },
  { to: '/dashboard/user/medicines', label: 'Medicines', icon: Pill },
  { to: '/dashboard/user/diet', label: 'AI Diet Plan', icon: ChefHat }
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

export const AvailableDoctors = () => {
  const { token } = useAuth()
  const { addNotification } = useNotifications()
  const navigate = useNavigate()
  const [doctors, setDoctors] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedDoctor, setSelectedDoctor] = useState(null)
  const [bookingModal, setBookingModal] = useState(false)
  const [bookingData, setBookingData] = useState({
    appointmentType: 'online',
    appointmentDate: '',
    appointmentTime: '',
    symptoms: '',
    currentMedication: '',
    medicalHistory: '',
    urgencyLevel: 'medium'
  })
  const [booking, setBooking] = useState(false)

  useEffect(() => {
    fetchDoctors()
  }, [])

  const fetchDoctors = async () => {
    try {
      const response = await fetch(`${API_BASE}/appointments/doctors/available`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      const data = await response.json()
      
      if (data.success) {
        setDoctors(data.doctors)
      }
    } catch (error) {
      console.error('Error fetching doctors:', error)
      addNotification({
        type: 'error',
        message: 'Failed to load doctors',
        description: 'Please try again later'
      })
    } finally {
      setLoading(false)
    }
  }

  const handleBookAppointment = (doctor) => {
    setSelectedDoctor(doctor)
    setBookingModal(true)
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    console.log("kaam kar raha hai");
    setBookingData(prev => ({
      ...prev,
      appointmentDate: tomorrow.toISOString().split('T')[0]
    }))
  }

  const handleBookingSubmit = async (e) => {
    e.preventDefault()
    
    if (!bookingData.appointmentDate) {
      addNotification({
        type: 'error',
        message: 'Validation Error',
        description: 'Please select an appointment date'
      })
      return
    }
    
    if (!bookingData.appointmentTime) {
      addNotification({
        type: 'error',
        message: 'Validation Error',
        description: 'Please select an appointment time'
      })
      return
    }
    
    if (!bookingData.symptoms.trim()) {
      addNotification({
        type: 'error',
        message: 'Validation Error',
        description: 'Please describe your symptoms'
      })
      return
    }
    
    setBooking(true)

    try {
      const bookingPayload = {
        doctorId: selectedDoctor.id,
        ...bookingData
      }

      const response = await fetch(`${API_BASE}/appointments/book`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(bookingPayload)
      })

      const data = await response.json()

      if (response.ok) {
        addNotification({
          type: 'success',
          message: 'Appointment Booked!',
          description: `Your appointment with Dr. ${selectedDoctor.name} has been booked successfully.`
        })
        setBookingModal(false)
        setBookingData({
          appointmentType: 'online',
          appointmentDate: '',
          appointmentTime: '',
          symptoms: '',
          currentMedication: '',
          medicalHistory: '',
          urgencyLevel: 'medium'
        })
        setTimeout(() => {
          navigate('/dashboard/user/appointments')
        }, 2000)
      } else {
        addNotification({
          type: 'error',
          message: 'Booking Failed',
          description: data.message || 'Please try again later'
        })
      }
    } catch (error) {
      addNotification({
        type: 'error',
        message: 'Network Error',
        description: 'Unable to connect to server. Please check your connection and try again.'
      })
    } finally {
      setBooking(false)
    }
  }

  const DoctorCard = ({ doctor }) => {
    return (
      <motion.div
        variants={itemVariants}
        whileHover={{ y: -5 }}
        className="relative"
      >
        <Card className="p-6 h-full flex flex-col"><div className="flex items-start space-x-4 mb-4">
            <div className="w-16 h-16 bg-gradient-to-br from-primary/20 to-primary/10 rounded-full flex items-center justify-center flex-shrink-0 overflow-hidden relative">
              <User className="w-8 h-8 text-primary" />
            </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white truncate">
              Dr. {doctor.name}
            </h3>
            <p className="text-sm text-primary font-medium">{doctor.specialization}</p>
            <div className="flex items-center mt-1">
              <Star className="w-4 h-4 text-yellow-400 fill-current" />
              <span className="text-sm text-slate-600 dark:text-slate-400 ml-1">
                {doctor.rating} ({doctor.experience}+ years exp)
              </span>
            </div>
          </div>
        </div><div className="space-y-2 mb-4">
          <div className="flex items-center text-sm text-slate-600 dark:text-slate-400">
            <Mail className="w-4 h-4 mr-2" />
            <span className="truncate">{doctor.email}</span>
          </div>
          {doctor.phone && (
            <div className="flex items-center text-sm text-slate-600 dark:text-slate-400">
              <Phone className="w-4 h-4 mr-2" />
              <span>{doctor.phone}</span>
            </div>
          )}
          <div className="flex items-center text-sm text-slate-600 dark:text-slate-400">
            <GraduationCap className="w-4 h-4 mr-2" />
            <span className="truncate">{doctor.education}</span>
          </div>
          <div className="flex items-center text-sm text-slate-600 dark:text-slate-400">
            <MapPin className="w-4 h-4 mr-2" />
            <span className="truncate">{doctor.hospitalAffiliation}</span>
          </div>
        </div>{doctor.bio && (
          <div className="mb-4">
            <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2">
              {doctor.bio}
            </p>
          </div>
        )}{doctor.languages?.length > 0 && (
          <div className="mb-4">
            <div className="flex items-center mb-2">
              <Languages className="w-4 h-4 text-slate-500 mr-1" />
              <span className="text-sm text-slate-600 dark:text-slate-400">Languages:</span>
            </div>
            <div className="flex flex-wrap gap-1">
              {doctor.languages.slice(0, 3).map((language, index) => (
                <span
                  key={index}
                  className="px-2 py-1 bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400 text-xs rounded-full"
                >
                  {language}
                </span>
              ))}
              {doctor.languages.length > 3 && (
                <span className="px-2 py-1 bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 text-xs rounded-full">
                  +{doctor.languages.length - 3} more
                </span>
              )}
            </div>
          </div>
        )}<div className="mb-4">
          <div className="flex items-center mb-2">
            <Video className="w-4 h-4 text-slate-500 mr-1" />
            <span className="text-sm text-slate-600 dark:text-slate-400">Available via:</span>
          </div>
          <div className="flex flex-wrap gap-1">
            {doctor.consultationModes.map((mode, index) => (
              <span
                key={index}
                className="px-2 py-1 bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400 text-xs rounded-full capitalize"
              >
                {mode === 'online' ? '💻 Online' : mode === 'offline' ? '🏥 In-Person' : '💬 Chat'}
              </span>
            ))}
          </div>
        </div><div className="mt-auto pt-4 border-t border-slate-200 dark:border-slate-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <IndianRupee className="w-4 h-4 text-green-600" />
              <span className="text-lg font-semibold text-green-600">
                {doctor.consultationFee}
              </span>
              <span className="text-sm text-slate-500 ml-1">per consultation</span>
            </div>
            <Button
              onClick={() => handleBookAppointment(doctor)}
              className="bg-primary hover:bg-primary/90 text-white px-4 py-2"
            >
              Book Now
            </Button>
          </div>
        </div>
      </Card>
    </motion.div>
    );
  };

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
              <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Available Doctors</h1>
              <p className="text-slate-600 dark:text-slate-400 mt-1">
                Book appointments with verified healthcare professionals
              </p>
            </div>
            <div className="flex items-center space-x-3 mt-4 sm:mt-0">
              <div className="flex items-center space-x-2 text-sm text-slate-600 dark:text-slate-400">
                <UserCheck className="w-4 h-4 text-green-600" />
                <span>{doctors.length} Doctors Available</span>
              </div>
            </div>
          </motion.div>{loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="bg-slate-200 dark:bg-slate-800 rounded-lg h-80"></div>
                </div>
              ))}
            </div>
          ) : doctors.length === 0 ? (
            <motion.div variants={itemVariants} className="text-center py-12">
              <Stethoscope className="w-16 h-16 text-slate-400 mx-auto mb-4" />
              <h3 className="text-xl font-medium text-slate-900 dark:text-white mb-2">
                No Doctors Available
              </h3>
              <p className="text-slate-600 dark:text-slate-400">
                Currently no doctors are available for appointments. Please check back later.
              </p>
            </motion.div>
          ) : (
            <motion.div 
              variants={containerVariants}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {doctors.map((doctor) => (
                <DoctorCard key={doctor.id} doctor={doctor} />
              ))}
            </motion.div>
          )}
        </motion.div>
      </Layout><AnimatePresence>
        {bookingModal && selectedDoctor && (
          <Modal
            open={bookingModal}
            onClose={() => setBookingModal(false)}
            size="large"
          >
            <div className="p-6">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">
                Book Appointment with Dr. {selectedDoctor.name}
              </h2>
              
              <form onSubmit={handleBookingSubmit} className="space-y-4">
              <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center">
                    <User className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900 dark:text-white">
                      Dr. {selectedDoctor.name}
                    </h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      {selectedDoctor.specialization} • ₹{selectedDoctor.consultationFee}
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Appointment Type *
                  </label>
                  <select
                    value={bookingData.appointmentType}
                    onChange={(e) => setBookingData(prev => ({...prev, appointmentType: e.target.value}))}
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                    required
                  >
                    {selectedDoctor.consultationModes.map(mode => (
                      <option key={mode} value={mode}>
                        {mode === 'online' ? 'Online Consultation' : 
                         mode === 'offline' ? 'In-Person Visit' : 'Chat Consultation'}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Urgency Level
                  </label>
                  <select
                    value={bookingData.urgencyLevel}
                    onChange={(e) => setBookingData(prev => ({...prev, urgencyLevel: e.target.value}))}
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  type="date"
                  label="Appointment Date *"
                  value={bookingData.appointmentDate}
                  onChange={(e) => setBookingData(prev => ({...prev, appointmentDate: e.target.value}))}
                  min={new Date().toISOString().split('T')[0]}
                  required
                />

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Preferred Time *
                  </label>
                  <select
                    value={bookingData.appointmentTime}
                    onChange={(e) => setBookingData(prev => ({...prev, appointmentTime: e.target.value}))}
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                    required
                  >
                    <option value="">Select Time</option>
                    <option value="09:00">09:00 AM</option>
                    <option value="10:00">10:00 AM</option>
                    <option value="11:00">11:00 AM</option>
                    <option value="12:00">12:00 PM</option>
                    <option value="14:00">02:00 PM</option>
                    <option value="15:00">03:00 PM</option>
                    <option value="16:00">04:00 PM</option>
                    <option value="17:00">05:00 PM</option>
                    <option value="18:00">06:00 PM</option>
                    <option value="19:00">07:00 PM</option>
                  </select>
                </div>
              </div>

              <Input
                label="Current Symptoms *"
                placeholder="Describe your symptoms..."
                value={bookingData.symptoms}
                onChange={(e) => setBookingData(prev => ({...prev, symptoms: e.target.value}))}
                required
              />

              <Input
                label="Current Medications"
                placeholder="List any medications you're currently taking (comma separated)"
                value={bookingData.currentMedication}
                onChange={(e) => setBookingData(prev => ({...prev, currentMedication: e.target.value}))}
              />

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Medical History
                </label>
                <textarea
                  rows={3}
                  placeholder="Any relevant medical history..."
                  value={bookingData.medicalHistory}
                  onChange={(e) => setBookingData(prev => ({...prev, medicalHistory: e.target.value}))}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>

              <div className="flex items-center justify-between pt-4">
                <div className="text-sm text-slate-600 dark:text-slate-400">
                  Consultation Fee: <span className="font-semibold text-green-600">₹{selectedDoctor.consultationFee}</span>
                </div>
                <div className="flex space-x-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setBookingModal(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={booking}
                    className="bg-primary hover:bg-primary/90 text-white"
                  >
                    {booking ? 'Booking...' : 'Book Appointment'}
                  </Button>
                </div>
              </div>
              </form>
            </div>
          </Modal>
        )}
      </AnimatePresence>
    </>
  )
}
