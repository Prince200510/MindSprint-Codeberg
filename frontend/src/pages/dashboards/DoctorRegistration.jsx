import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Card } from '../../components/Card.jsx'
import { Button } from '../../components/Button.jsx'
import { Input } from '../../components/Input.jsx'
import { motion, AnimatePresence } from 'framer-motion'
import { User,  Mail,  Phone,  Shield,  FileText,  Upload,  Clock,  Award,  MapPin, GraduationCap, Stethoscope, DollarSign, Calendar, MessageSquare, Video, Users, CheckCircle, ArrowRight, ArrowLeft, AlertTriangle, Camera, Globe, Loader2} from 'lucide-react'
import { useAuth } from '../../context/AuthContext.jsx'
import { useNotifications } from '../../context/NotificationContext.jsx'

export const DoctorRegistration = () => {
  const { user } = useAuth()
  const { addNotification } = useNotifications()
  const [currentStep, setCurrentStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})
  const [showWarning, setShowWarning] = useState(false)
  const [warningMessage, setWarningMessage] = useState('')
  const [basicInfo, setBasicInfo] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  })
  const [professionalInfo, setProfessionalInfo] = useState({
    medicalLicense: '',
    specialization: '',
    yearsExperience: '',
    education: '',
    hospitalAffiliation: '',
    consultationFee: ''
  })
  const [documents, setDocuments] = useState({
    licenseProof: null,
    governmentId: null,
    profilePhoto: null
  })

  const [availability, setAvailability] = useState({
    timeSlots: [],
    consultationMode: [],
    languages: [],
    bio: ''
  })
  const [successMessage, setSuccessMessage] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'
  const specializations = ['General Physician', 'Cardiologist',  'Neurologist', 'Dermatologist', 'Pediatrician', 'Gynecologist', 'Orthopedic Surgeon', 'Psychiatrist', 'Radiologist', 'Anesthesiologist', 'Urologist', 'ENT Specialist', 'Ophthalmologist', 'Emergency Medicine', 'Family Medicine']
  const consultationModes = [
    { id: 'video', label: 'Video Call', icon: Video },
    { id: 'chat', label: 'Chat', icon: MessageSquare },
    { id: 'offline', label: 'In-Person', icon: Users }
  ]
  const languages = ['English', 'Hindi', 'Bengali', 'Telugu', 'Marathi', 'Tamil', 'Gujarati', 'Urdu', 'Kannada', 'Malayalam', 'Punjabi', 'Assamese']
  const timeSlots = ['09:00 - 10:00', '10:00 - 11:00',  '11:00 - 12:00', '12:00 - 13:00', '14:00 - 15:00', '15:00 - 16:00', '16:00 - 17:00', '17:00 - 18:00', '18:00 - 19:00', '19:00 - 20:00']
  const showWarningPopup = (message) => {
    setWarningMessage(message)
    setShowWarning(true)
    setTimeout(() => setShowWarning(false), 3000)
  }
  const validateStep = (step) => {
    const newErrors = {}
    
    if (step === 1) {
      if (!basicInfo.firstName.trim()) {
        newErrors.firstName = 'First name is required'
        showWarningPopup('Please enter your first name')
      } else if (!/^[a-zA-Z\s]+$/.test(basicInfo.firstName.trim())) {
        newErrors.firstName = 'First name should contain only letters'
        showWarningPopup('First name should contain only letters and spaces')
      }
      
      if (!basicInfo.lastName.trim()) {
        newErrors.lastName = 'Last name is required'
        showWarningPopup('Please enter your last name')
      } else if (!/^[a-zA-Z\s]+$/.test(basicInfo.lastName.trim())) {
        newErrors.lastName = 'Last name should contain only letters'
        showWarningPopup('Last name should contain only letters and spaces')
      }
      
      if (!basicInfo.email.trim()) {
        newErrors.email = 'Email is required'
        showWarningPopup('Please enter your email address')
      } else if (!/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(basicInfo.email)) {
        newErrors.email = 'Please enter a valid email address'
        showWarningPopup('Please enter a valid email address (e.g., doctor@example.com)')
      }
      
      if (!basicInfo.phone.trim()) {
        newErrors.phone = 'Phone number is required'
        showWarningPopup('Please enter your phone number')
      } else if (!/^\d+$/.test(basicInfo.phone.trim())) {
        newErrors.phone = 'Phone number should contain only digits'
        showWarningPopup('Phone number should contain only numeric digits (0-9)')
      } else if (basicInfo.phone.trim().length !== 10) {
        newErrors.phone = 'Phone number must be exactly 10 digits'
        showWarningPopup('Phone number must be exactly 10 digits long')
      } else if (!/^[6-9]\d{9}$/.test(basicInfo.phone.trim())) {
        newErrors.phone = 'Please enter a valid Indian phone number'
        showWarningPopup('Phone number should start with 6, 7, 8, or 9 and be 10 digits long')
      }
      
      if (!basicInfo.password) {
        newErrors.password = 'Password is required'
        showWarningPopup('Please create a password')
      } else if (basicInfo.password.length < 8) {
        newErrors.password = 'Password must be at least 8 characters'
        showWarningPopup('Password must be at least 8 characters long for security')
      } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(basicInfo.password)) {
        newErrors.password = 'Password must contain uppercase, lowercase, and number'
        showWarningPopup('Password must contain at least one uppercase letter, lowercase letter, and number')
      }
      
      if (basicInfo.password !== basicInfo.confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match'
        showWarningPopup('Password confirmation does not match. Please re-enter the same password')
      }
    }
    
    if (step === 2) {
      if (!professionalInfo.medicalLicense.trim()) {
        newErrors.medicalLicense = 'Medical license is required'
        showWarningPopup('Please enter your medical license number')
      } else if (!/^[A-Z0-9/-]+$/.test(professionalInfo.medicalLicense.trim())) {
        newErrors.medicalLicense = 'Invalid license format'
        showWarningPopup('Medical license should contain only letters, numbers, hyphens, and forward slashes')
      }
      
      if (!professionalInfo.specialization) {
        newErrors.specialization = 'Specialization is required'
        showWarningPopup('Please select your medical specialization')
      }
      
      if (!professionalInfo.yearsExperience) {
        newErrors.yearsExperience = 'Years of experience is required'
        showWarningPopup('Please enter your years of medical experience')
      } else if (!/^\d+$/.test(professionalInfo.yearsExperience.toString())) {
        newErrors.yearsExperience = 'Experience should be a valid number'
        showWarningPopup('Years of experience should be a valid number')
      } else if (professionalInfo.yearsExperience < 0) {
        newErrors.yearsExperience = 'Experience cannot be negative'
        showWarningPopup('Years of experience cannot be negative')
      } else if (professionalInfo.yearsExperience > 60) {
        newErrors.yearsExperience = 'Please enter a realistic experience value'
        showWarningPopup('Please enter a realistic number of years (maximum 60 years)')
      }
      
      if (!professionalInfo.education.trim()) {
        newErrors.education = 'Education qualification is required'
        showWarningPopup('Please enter your educational qualifications')
      } else if (professionalInfo.education.trim().length < 3) {
        newErrors.education = 'Please enter valid qualifications'
        showWarningPopup('Educational qualifications seem too short. Please provide complete details')
      }
      if (!professionalInfo.hospitalAffiliation.trim()) {
        newErrors.hospitalAffiliation = 'Hospital/Clinic affiliation is required'
        showWarningPopup('Please enter your current hospital or clinic affiliation')
      }
      
      if (professionalInfo.consultationFee && !/^\d+$/.test(professionalInfo.consultationFee.toString())) {
        newErrors.consultationFee = 'Consultation fee should be a valid number'
        showWarningPopup('Consultation fee should contain only numeric digits')
      } else if (professionalInfo.consultationFee && professionalInfo.consultationFee < 0) {
        newErrors.consultationFee = 'Consultation fee cannot be negative'
        showWarningPopup('Consultation fee cannot be negative')
      }
    }
    
    if (step === 3) {
      if (!documents.licenseProof) {
        newErrors.licenseProof = 'Medical license proof is required'
        showWarningPopup('Please upload your medical license certificate')
      }
      if (!documents.profilePhoto) {
        newErrors.profilePhoto = 'Profile photo is required'
        showWarningPopup('Please upload a professional profile photo')
      }
    }
    
    if (step === 4) {
      if (availability.timeSlots.length === 0) {
        newErrors.timeSlots = 'Please select at least one time slot'
        showWarningPopup('Please select at least one available time slot for consultations')
      }
      if (availability.consultationMode.length === 0) {
        newErrors.consultationMode = 'Please select at least one consultation mode'
        showWarningPopup('Please select at least one consultation mode (Online/Offline)')
      }
      if (availability.languages.length === 0) {
        newErrors.languages = 'Please select at least one language'
        showWarningPopup('Please select at least one language you can communicate in')
      }
      if (!availability.bio.trim()) {
        newErrors.bio = 'Bio is required'
        showWarningPopup('Please write a short bio describing your background and expertise')
      } else if (availability.bio.trim().length < 50) {
        newErrors.bio = 'Bio should be at least 50 characters'
        showWarningPopup('Please write a more detailed bio (at least 50 characters)')
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, 4))
    }
  }

  const handlePrevious = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1))
  }

  const handlePhoneChange = (e) => {
    const value = e.target.value
    if (value === '' || (/^\d+$/.test(value) && value.length <= 10)) {
      setBasicInfo(prev => ({ ...prev, phone: value }))
      if (value.length === 10 && /^[6-9]\d{9}$/.test(value)) {
        setErrors(prev => ({ ...prev, phone: '' }))
      }
    } else {
      showWarningPopup('Phone number should contain only digits (0-9) and be maximum 10 digits')
    }
  }

  const handleExperienceChange = (e) => {
    const value = e.target.value
    if (value === '' || (/^\d+$/.test(value) && parseInt(value) <= 60)) {
      setProfessionalInfo(prev => ({ ...prev, yearsExperience: value }))
      if (value && parseInt(value) >= 0 && parseInt(value) <= 60) {
        setErrors(prev => ({ ...prev, yearsExperience: '' }))
      }
    } else {
      showWarningPopup('Years of experience should be a number between 0 and 60')
    }
  }

  const handleConsultationFeeChange = (e) => {
    const value = e.target.value
    if (value === '' || (/^\d+$/.test(value) && parseInt(value) <= 50000)) {
      setProfessionalInfo(prev => ({ ...prev, consultationFee: value }))
      if (value && parseInt(value) >= 0) {
        setErrors(prev => ({ ...prev, consultationFee: '' }))
      }
    } else {
      showWarningPopup('Consultation fee should be a valid amount (numbers only, max ₹50,000)')
    }
  }

  const handleNameChange = (field, e) => {
    const value = e.target.value
    if (value === '' || /^[a-zA-Z\s]*$/.test(value)) {
      setBasicInfo(prev => ({ ...prev, [field]: value }))
      if (value.trim().length > 0) {
        setErrors(prev => ({ ...prev, [field]: '' }))
      }
    } else {
      showWarningPopup(`${field === 'firstName' ? 'First' : 'Last'} name should contain only letters and spaces`)
    }
  }

  const handleEmailChange = (e) => {
    const value = e.target.value
    setBasicInfo(prev => ({ ...prev, email: value }))
    if (/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(value)) {
      setErrors(prev => ({ ...prev, email: '' }))
    }
  }

  const handleFileUpload = (field, file) => {
    if (file) {
      if (file.size > 5 * 1024 * 1024) { 
        setErrorMessage('File size must be less than 5MB')
        setTimeout(() => setErrorMessage(''), 5000)
        return
      }
      
      setDocuments(prev => ({
        ...prev,
        [field]: file
      }))
    }
  }

  const handleSubmit = async () => {
    if (!validateStep(4)) return

    setLoading(true)
    
    try {
      const formData = new FormData()
      Object.keys(basicInfo).forEach(key => {
        if (key !== 'confirmPassword') {
          formData.append(key, basicInfo[key])
        }
      })

      Object.keys(professionalInfo).forEach(key => {
        formData.append(key, professionalInfo[key])
      })
      
      if (documents.licenseProof) formData.append('licenseProof', documents.licenseProof)
      if (documents.governmentId) formData.append('governmentId', documents.governmentId)
      if (documents.profilePhoto) formData.append('profilePhoto', documents.profilePhoto)
      
      formData.append('timeSlots', JSON.stringify(availability.timeSlots))
      formData.append('consultationMode', JSON.stringify(availability.consultationMode))
      formData.append('languages', JSON.stringify(availability.languages))
      formData.append('bio', availability.bio)

      const response = await fetch(`${API_BASE}/auth/doctor-register`, {
        method: 'POST',
        body: formData
      })

      const data = await response.json()

      if (response.ok) {
        setSuccessMessage('Registration submitted successfully! Please wait for admin verification.')
        addNotification({
          type: 'success',
          message: 'Registration Submitted',
          description: 'Your doctor registration has been submitted for verification'
        })
        
        setTimeout(() => {
          window.location.href = '/auth'
        }, 3000)
      } else {
        setErrorMessage(data.message || 'Registration failed')
        setTimeout(() => setErrorMessage(''), 5000)
      }
    } catch (error) {
      console.error('Registration error:', error)
      setErrorMessage('Registration failed. Please try again.')
      setTimeout(() => setErrorMessage(''), 5000)
    } finally {
      setLoading(false)
    }
  }

  const renderStep1 = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-2">Basic Information</h2>
        <p className="text-slate-600 dark:text-slate-400">Let's start with your basic details</p>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <Input
            label="First Name"
            placeholder="Enter your first name"
            value={basicInfo.firstName}
            onChange={(e) => handleNameChange('firstName', e)}
            error={errors.firstName}
            required
          />
        </div>
        <div>
          <Input
            label="Last Name"
            placeholder="Enter your last name"
            value={basicInfo.lastName}
            onChange={(e) => handleNameChange('lastName', e)}
            error={errors.lastName}
            required
          />
        </div>
      </div>

      <Input
        label="Email Address"
        type="email"
        placeholder="Enter your professional email address"
        value={basicInfo.email}
        onChange={handleEmailChange}
        error={errors.email}
        required
      />

      <Input
        label="Phone Number"
        type="tel"
        placeholder="Enter your contact phone number"
        value={basicInfo.phone}
        onChange={handlePhoneChange}
        error={errors.phone}
        required
      />

      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <Input
            label="Password"
            type="password"
            placeholder="Create a strong password"
            value={basicInfo.password}
            onChange={(e) => setBasicInfo(prev => ({ ...prev, password: e.target.value }))}
            error={errors.password}
            required
          />
        </div>
        <div>
          <Input
            label="Confirm Password"
            type="password"
            placeholder="Re-enter your password"
            value={basicInfo.confirmPassword}
            onChange={(e) => setBasicInfo(prev => ({ ...prev, confirmPassword: e.target.value }))}
            error={errors.confirmPassword}
            required
          />
        </div>
      </div>
    </div>
  )

  const renderStep2 = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-2">Professional Details</h2>
        <p className="text-slate-600 dark:text-slate-400">Tell us about your medical qualifications</p>
      </div>

      <Input
        label="Medical License Number / Registration ID"
        value={professionalInfo.medicalLicense}
        onChange={(e) => setProfessionalInfo(prev => ({ ...prev, medicalLicense: e.target.value }))}
        error={errors.medicalLicense}
        required
        placeholder="e.g., MCI12345678"
      />

      <div>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
          Specialization <span className="text-red-500">*</span>
        </label>
        <select
          value={professionalInfo.specialization}
          onChange={(e) => setProfessionalInfo(prev => ({ ...prev, specialization: e.target.value }))}
          className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-[#5f6fff] focus:border-transparent dark:bg-slate-800 dark:text-white"
          required
        >
          <option value="">Select Specialization</option>
          {specializations.map(spec => (
            <option key={spec} value={spec}>{spec}</option>
          ))}
        </select>
        {errors.specialization && (
          <p className="mt-1 text-sm text-red-500">{errors.specialization}</p>
        )}
      </div>

      <Input
        label="Years of Experience"
        type="number"
        min="0"
        placeholder="Enter years of medical experience"
        value={professionalInfo.yearsExperience}
        onChange={handleExperienceChange}
        error={errors.yearsExperience}
        required
      />

      <Input
        label="Education/Qualification"
        value={professionalInfo.education}
        onChange={(e) => setProfessionalInfo(prev => ({ ...prev, education: e.target.value }))}
        error={errors.education}
        required
        placeholder="e.g., MBBS, MD - Cardiology"
      />

      <Input
        label="Hospital/Clinic Affiliation"
        value={professionalInfo.hospitalAffiliation}
        onChange={(e) => setProfessionalInfo(prev => ({ ...prev, hospitalAffiliation: e.target.value }))}
        error={errors.hospitalAffiliation}
        required
        placeholder="Current workplace"
      />

      <Input
        label="Consultation Fee (Optional)"
        type="number"
        min="0"
        value={professionalInfo.consultationFee}
        onChange={handleConsultationFeeChange}
        placeholder="Amount in INR"
      />
    </div>
  )

  const renderStep3 = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-2">Document Uploads</h2>
        <p className="text-slate-600 dark:text-slate-400">Upload required documents for verification</p>
      </div>

      <div className="space-y-6"><div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
            Medical License Proof <span className="text-red-500">*</span>
          </label>
          <div className="border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-lg p-6 text-center">
            <Upload className="mx-auto h-12 w-12 text-slate-400 mb-4" />
            <div className="text-sm text-slate-600 dark:text-slate-400 mb-4">
              <label className="relative cursor-pointer bg-white dark:bg-slate-800 rounded-md font-medium text-[#5f6fff] hover:text-[#5f6fff]/80">
                <span>Upload license certificate</span>
                <input
                  type="file"
                  className="sr-only"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={(e) => handleFileUpload('licenseProof', e.target.files[0])}
                />
              </label>
              <span className="block mt-2 text-xs text-slate-500">PDF, JPG, PNG (max 10MB)</span>
            </div>
            {documents.licenseProof && (
              <p className="text-sm text-green-600 dark:text-green-400">
                ✓ {documents.licenseProof.name}
              </p>
            )}
            {errors.licenseProof && (
              <p className="text-sm text-red-500 mt-1">{errors.licenseProof}</p>
            )}
          </div>
        </div><div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
            Government ID Proof (Optional)
          </label>
          <div className="border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-lg p-6 text-center">
            <Upload className="mx-auto h-12 w-12 text-slate-400 mb-4" />
            <div className="text-sm text-slate-600 dark:text-slate-400 mb-4">
              <label className="relative cursor-pointer bg-white dark:bg-slate-800 rounded-md font-medium text-[#5f6fff] hover:text-[#5f6fff]/80">
                <span>Upload ID proof</span>
                <input
                  type="file"
                  className="sr-only"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={(e) => handleFileUpload('governmentId', e.target.files[0])}
                />
              </label>
              <span className="block mt-2 text-xs text-slate-500">Aadhaar, PAN, Passport, etc. (PDF, JPG, PNG)</span>
            </div>
            {documents.governmentId && (
              <p className="text-sm text-green-600 dark:text-green-400">
                ✓ {documents.governmentId.name}
              </p>
            )}
          </div>
        </div><div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
            Profile Photo <span className="text-red-500">*</span>
          </label>
          <div className="border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-lg p-6 text-center">
            <Camera className="mx-auto h-12 w-12 text-slate-400 mb-4" />
            <div className="text-sm text-slate-600 dark:text-slate-400 mb-4">
              <label className="relative cursor-pointer bg-white dark:bg-slate-800 rounded-md font-medium text-[#5f6fff] hover:text-[#5f6fff]/80">
                <span>Upload profile photo</span>
                <input
                  type="file"
                  className="sr-only"
                  accept=".jpg,.jpeg,.png"
                  onChange={(e) => handleFileUpload('profilePhoto', e.target.files[0])}
                />
              </label>
              <span className="block mt-2 text-xs text-slate-500">Professional headshot (JPG, PNG, max 5MB)</span>
            </div>
            {documents.profilePhoto && (
              <p className="text-sm text-green-600 dark:text-green-400">
                ✓ {documents.profilePhoto.name}
              </p>
            )}
            {errors.profilePhoto && (
              <p className="text-sm text-red-500 mt-1">{errors.profilePhoto}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )

  const renderStep4 = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-2">Availability & Preferences</h2>
        <p className="text-slate-600 dark:text-slate-400">Set your consultation preferences</p>
      </div><div>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
          Available Time Slots <span className="text-red-500">*</span>
        </label>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {timeSlots.map(slot => (
            <label key={slot} className="flex items-center space-x-3 p-3 border border-slate-300 dark:border-slate-600 rounded-lg cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800">
              <input
                type="checkbox"
                checked={availability.timeSlots.includes(slot)}
                onChange={(e) => {
                  if (e.target.checked) {
                    setAvailability(prev => ({
                      ...prev,
                      timeSlots: [...prev.timeSlots, slot]
                    }))
                  } else {
                    setAvailability(prev => ({
                      ...prev,
                      timeSlots: prev.timeSlots.filter(s => s !== slot)
                    }))
                  }
                }}
                className="rounded border-slate-300 text-[#5f6fff] focus:ring-[#5f6fff]"
              />
              <span className="text-sm text-slate-700 dark:text-slate-300">{slot}</span>
            </label>
          ))}
        </div>
        {errors.timeSlots && (
          <p className="text-sm text-red-500 mt-1">{errors.timeSlots}</p>
        )}
      </div><div>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
          Preferred Consultation Mode <span className="text-red-500">*</span>
        </label>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {consultationModes.map(mode => {
            const Icon = mode.icon
            return (
              <label key={mode.id} className="flex items-center space-x-3 p-4 border border-slate-300 dark:border-slate-600 rounded-lg cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800">
                <input
                  type="checkbox"
                  checked={availability.consultationMode.includes(mode.id)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setAvailability(prev => ({
                        ...prev,
                        consultationMode: [...prev.consultationMode, mode.id]
                      }))
                    } else {
                      setAvailability(prev => ({
                        ...prev,
                        consultationMode: prev.consultationMode.filter(m => m !== mode.id)
                      }))
                    }
                  }}
                  className="rounded border-slate-300 text-[#5f6fff] focus:ring-[#5f6fff]"
                />
                <Icon className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                <span className="text-sm text-slate-700 dark:text-slate-300">{mode.label}</span>
              </label>
            )
          })}
        </div>
        {errors.consultationMode && (
          <p className="text-sm text-red-500 mt-1">{errors.consultationMode}</p>
        )}
      </div><div>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
          Languages Spoken <span className="text-red-500">*</span>
        </label>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {languages.map(language => (
            <label key={language} className="flex items-center space-x-3 p-3 border border-slate-300 dark:border-slate-600 rounded-lg cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800">
              <input
                type="checkbox"
                checked={availability.languages.includes(language)}
                onChange={(e) => {
                  if (e.target.checked) {
                    setAvailability(prev => ({
                      ...prev,
                      languages: [...prev.languages, language]
                    }))
                  } else {
                    setAvailability(prev => ({
                      ...prev,
                      languages: prev.languages.filter(l => l !== language)
                    }))
                  }
                }}
                className="rounded border-slate-300 text-[#5f6fff] focus:ring-[#5f6fff]"
              />
              <span className="text-sm text-slate-700 dark:text-slate-300">{language}</span>
            </label>
          ))}
        </div>
        {errors.languages && (
          <p className="text-sm text-red-500 mt-1">{errors.languages}</p>
        )}
      </div><div>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
          Short Bio <span className="text-red-500">*</span>
        </label>
        <textarea
          value={availability.bio}
          onChange={(e) => setAvailability(prev => ({ ...prev, bio: e.target.value }))}
          rows={4}
          className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-[#5f6fff] focus:border-transparent dark:bg-slate-800 dark:text-white"
          placeholder="Tell patients about your experience, expertise, and background..."
          required
        />
        {errors.bio && (
          <p className="text-sm text-red-500 mt-1">{errors.bio}</p>
        )}
      </div>
    </div>
  )

  const renderStepContent = () => {
    switch (currentStep) {
      case 1: return renderStep1()
      case 2: return renderStep2() 
      case 3: return renderStep3()
      case 4: return renderStep4()
      default: return renderStep1()
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800"><div className="bg-white dark:bg-slate-800 shadow-sm border-b border-slate-200 dark:border-slate-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-br from-[#5f6fff] to-[#5f6fff]/80 rounded-lg flex items-center justify-center">
                <Stethoscope className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-semibold text-slate-800 dark:text-white">MediTrack</h1>
                <p className="text-xs text-slate-500 dark:text-slate-400">Doctor Registration</p>
              </div>
            </div>
            <Link 
              to="/" 
              className="flex items-center space-x-2 text-slate-600 dark:text-slate-400 hover:text-[#5f6fff] transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Login</span>
            </Link>
          </div>
        </div>
      </div><div className="max-w-4xl mx-auto px-4 py-8 space-y-6"><div className="bg-white dark:bg-slate-800 rounded-lg shadow-lg p-6">
          <div className="flex items-center justify-between mb-8">
            {[1, 2, 3, 4].map((step) => (
              <div key={step} className="flex items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold ${
                  step < currentStep ? 'bg-green-500 text-white' :
                  step === currentStep ? 'bg-[#5f6fff] text-white' : 
                  'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-400'
                }`}>
                  {step < currentStep ? <CheckCircle className="w-5 h-5" /> : step}
                </div>
                {step < 4 && (
                  <div className={`w-24 h-1 ml-4 ${
                    step < currentStep ? 'bg-green-500' : 'bg-slate-200 dark:bg-slate-700'
                  }`} />
                )}
              </div>
            ))}
          </div>
          
          <div className="text-center">
            <div className="flex justify-center space-x-8 text-sm">
              <span className={currentStep === 1 ? 'text-[#5f6fff] font-semibold' : 'text-slate-500'}>
                Basic Info
              </span>
              <span className={currentStep === 2 ? 'text-[#5f6fff] font-semibold' : 'text-slate-500'}>
                Professional
              </span>
              <span className={currentStep === 3 ? 'text-[#5f6fff] font-semibold' : 'text-slate-500'}>
                Documents
              </span>
              <span className={currentStep === 4 ? 'text-[#5f6fff] font-semibold' : 'text-slate-500'}>
                Availability
              </span>
            </div>
          </div>
        </div><AnimatePresence>
          {successMessage && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4"
            >
              <div className="flex items-center space-x-3">
                <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                <p className="font-medium text-green-800 dark:text-green-200">{successMessage}</p>
              </div>
            </motion.div>
          )}

          {errorMessage && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4"
            >
              <div className="flex items-center space-x-3">
                <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400" />
                <p className="font-medium text-red-800 dark:text-red-200">{errorMessage}</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence><Card>
          <div className="p-8">
            {renderStepContent()}
          </div>
        </Card><div className="flex items-center justify-between">
          <Button
            onClick={handlePrevious}
            disabled={currentStep === 1}
            variant="outline"
            className="flex items-center space-x-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Previous</span>
          </Button>

          <div className="flex space-x-4">
            {currentStep < 4 ? (
              <Button
                onClick={handleNext}
                className="flex items-center space-x-2"
              >
                <span>Next</span>
                <ArrowRight className="w-4 h-4" />
              </Button>
            ) : (
              <Button
                onClick={handleSubmit}
                disabled={loading}
                className="flex items-center space-x-2"
              >
                {loading ? (
                  <>
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    >
                      <Loader2 className="w-4 h-4" />
                    </motion.div>
                    <span>Submitting...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4" />
                    <span>Submit Registration</span>
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </div><AnimatePresence>
        {showWarning && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className="fixed top-4 right-4 z-50"
          >
            <div className="bg-red-500 text-white px-6 py-4 rounded-lg shadow-lg max-w-sm flex items-start space-x-3">
              <AlertTriangle className="w-5 h-5 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium text-sm">Invalid Input</p>
                <p className="text-sm opacity-90">{warningMessage}</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
