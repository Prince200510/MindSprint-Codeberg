import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { User,  Mail,  Phone,  Lock,  Eye,  EyeOff,  Calendar,  MapPin,  UserPlus,  Heart,  AlertTriangle,  Pill,  GraduationCap,  Bell, ChevronLeft, ChevronRight, Save, Hospital, FileText, Shield, CheckCircle2, X} from 'lucide-react'
import { Card } from './Card.jsx'
import { Input } from './Input.jsx'
import { Button } from './Button.jsx'

const ValidationToast = ({ message, type, onClose }) => (
  <motion.div
    initial={{ opacity: 0, y: -50, x: '-50%' }}
    animate={{ opacity: 1, y: 0, x: '-50%' }}
    exit={{ opacity: 0, y: -50, x: '-50%' }}
    className={`fixed top-6 left-1/2 z-[9999] flex items-center space-x-3 px-6 py-4 rounded-lg shadow-lg backdrop-blur-lg border ${
      type === 'success' 
        ? 'bg-green-500/90 text-white border-green-400' 
        : type === 'warning'
        ? 'bg-orange-500/90 text-white border-orange-400'
        : 'bg-red-500/90 text-white border-red-400'
    }`}
  >
    {type === 'success' ? (
      <CheckCircle2 className="w-5 h-5" />
    ) : (
      <AlertTriangle className="w-5 h-5" />
    )}
    <span className="font-medium">{message}</span>
    <button onClick={onClose} className="ml-2">
      <X className="w-4 h-4" />
    </button>
  </motion.div>
)

export const PatientRegistration = ({ onComplete, onBack }) => {
  const [currentStep, setCurrentStep] = useState(1)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [toast, setToast] = useState(null)
  const showToast = (message, type) => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 4000)
  }
  const [formData, setFormData] = useState(() => {
    const saved = localStorage.getItem('patientRegistrationData')
    return saved ? JSON.parse(saved) : {
      firstName: '',
      lastName: '',
      email: '',
      mobile: '',
      password: '',
      confirmPassword: '',
      dateOfBirth: '',
      gender: '',
      address: '',
      city: '',
      pincode: '',
      emergencyContactName: '',
      emergencyContactNumber: '',
      medicalConditions: [],
      allergies: [],
      currentMedications: [],
      isStudent: false,
      studentInstitution: '',
      healthIssues: '',
      notificationPreferences: {
        email: true,
        sms: false,
        app: true
      }
    }
  })

  const [errors, setErrors] = useState({})

  useEffect(() => {
    localStorage.setItem('patientRegistrationData', JSON.stringify(formData))
  }, [formData])

  useEffect(() => {
    localStorage.setItem('patientRegistrationStep', currentStep.toString())
  }, [currentStep])

  useEffect(() => {
    const savedStep = localStorage.getItem('patientRegistrationStep')
    if (savedStep) {
      setCurrentStep(parseInt(savedStep))
    }
  }, [])

  const updateFormData = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
    
    if (field === 'email') {
      if (value.length > 0 && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
        showToast('Please enter a valid email address', 'warning')
      } else if (value.length > 0 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
        showToast('Valid email format ✓', 'success')
      }
    }
    
    if (field === 'mobile') {
      if (value.length > 0 && !/^[6-9]\d{0,9}$/.test(value)) {
        showToast('Mobile number should start with 6-9 and be 10 digits', 'warning')
      } else if (value.length === 10 && !/^[6-9]\d{9}$/.test(value)) {
        showToast('Please enter a valid 10-digit mobile number', 'error')
      } else if (value.length === 10 && /^[6-9]\d{9}$/.test(value)) {
        showToast('Valid mobile number entered!', 'success')
      }
    }
    
    if (field === 'confirmPassword') {
      if (value.length > 0 && formData.password && value !== formData.password) {
        showToast('Passwords do not match', 'warning')
      } else if (value.length > 0 && formData.password && value === formData.password) {
        showToast('Passwords match!', 'success')
      }
    }
    
    if (field === 'password' && formData.confirmPassword) {
      if (formData.confirmPassword !== value) {
        showToast('Passwords do not match', 'warning')
      } else if (formData.confirmPassword === value) {
        showToast('Passwords match!', 'success')
      }
    }
    
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }))
    }
  }

  const validateStep1 = () => {
    const newErrors = {}
    
    if (!formData.firstName.trim()) newErrors.firstName = 'First name is required'
    if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required'
    if (!formData.email.trim()) newErrors.email = 'Email is required'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErrors.email = 'Invalid email format'
    if (!formData.mobile.trim()) newErrors.mobile = 'Mobile number is required'
    else if (!/^[6-9]\d{9}$/.test(formData.mobile)) newErrors.mobile = 'Invalid Indian mobile number'
    if (!formData.password) newErrors.password = 'Password is required'
    else if (formData.password.length < 6) newErrors.password = 'Password must be at least 6 characters'
    if (!formData.confirmPassword) newErrors.confirmPassword = 'Please confirm password'
    else if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = 'Passwords do not match'

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const validateStep2 = () => {
    const newErrors = {}
    
    if (!formData.dateOfBirth) newErrors.dateOfBirth = 'Date of birth is required'
    if (!formData.address.trim()) newErrors.address = 'Address is required'
    if (!formData.city.trim()) newErrors.city = 'City is required'
    if (!formData.pincode.trim()) newErrors.pincode = 'Pincode is required'
    else if (!/^\d{6}$/.test(formData.pincode)) newErrors.pincode = 'Invalid pincode format'

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const validateStep3 = () => {
    return true
  }

  const nextStep = () => {
    let isValid = false
    
    switch (currentStep) {
      case 1:
        isValid = validateStep1()
        break
      case 2:
        isValid = validateStep2()
        break
      case 3:
        isValid = validateStep3()
        break
      default:
        isValid = true
    }

    if (isValid && currentStep < 3) {
      setCurrentStep(prev => prev + 1)
    } else if (isValid && currentStep === 3) {
      handleComplete()
    }
  }

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1)
    } else {
      onBack()
    }
  }

  const handleComplete = () => {
    showToast('🎉 Registration form completed! Processing your information...', 'success')
    localStorage.removeItem('patientRegistrationData')
    localStorage.removeItem('patientRegistrationStep')
    onComplete(formData)
  }

  const addListItem = (listType, item) => {
    if (item.trim()) {
      setFormData(prev => ({
        ...prev,
        [listType]: [...prev[listType], item.trim()]
      }))
    }
  }

  const removeListItem = (listType, index) => {
    setFormData(prev => ({
      ...prev,
      [listType]: prev[listType].filter((_, i) => i !== index)
    }))
  }

  const stepVariants = {
    hidden: { opacity: 0, x: 50 },
    visible: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -50 }
  }

  return (
    <>
      <AnimatePresence>
        {toast && (
          <ValidationToast 
            message={toast.message} 
            type={toast.type} 
            onClose={() => setToast(null)} 
          />
        )}
      </AnimatePresence>
      
      <div className="min-h-screen bg-gradient-to-br from-primary/5 via-white to-blue-50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800 p-6 flex items-center justify-center">
      <div className="w-full max-w-2xl">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Patient Registration</h2>
            <span className="text-sm text-slate-600 dark:text-slate-400">Step {currentStep} of 3</span>
          </div>
          <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
            <div 
              className="bg-primary h-2 rounded-full transition-all duration-500"
              style={{ width: `${(currentStep / 3) * 100}%` }}
            />
          </div>
          <div className="flex justify-between mt-2 text-xs text-slate-500">
            <span className={currentStep >= 1 ? 'text-primary font-medium' : ''}>Basic Info</span>
            <span className={currentStep >= 2 ? 'text-primary font-medium' : ''}>Health Profile</span>
            <span className={currentStep >= 3 ? 'text-primary font-medium' : ''}>Medical History</span>
          </div>
        </div>

        <Card className="p-8">
          <AnimatePresence mode="wait">
            {currentStep === 1 && (
              <motion.div key="step1" variants={stepVariants} initial="hidden" animate="visible" exit="exit" transition={{ duration: 0.3 }}>
                <div className="text-center mb-6">
                  <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <User className="w-8 h-8 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold text-slate-900 dark:text-white">Basic Information</h3>
                  <p className="text-slate-600 dark:text-slate-400 text-sm mt-1">Let's start with your personal details</p>
                </div>

                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input label="First Name" placeholder="Enter first name" value={formData.firstName} onChange={(e) => updateFormData('firstName', e.target.value)} error={errors.firstName} icon={User}/>
                    <Input label="Last Name" placeholder="Enter last name" value={formData.lastName} onChange={(e) => updateFormData('lastName', e.target.value)} error={errors.lastName} icon={User}/>
                  </div>
                  <Input label="Email Address" type="email" placeholder="Enter email address" value={formData.email} onChange={(e) => updateFormData('email', e.target.value)} error={errors.email} icon={Mail}/>
                  <Input
                     label="Mobile Number"
                     placeholder="Enter 10-digit mobile number"
                     value={formData.mobile}
                     onChange={(e) => {
                       const value = e.target.value.replace(/[^0-9]/g, '').slice(0, 10)
                       updateFormData('mobile', value)
                     }}
                     error={errors.mobile}
                     icon={Phone}
                     maxLength={10}/>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="relative">
                      <Input label="New Password" type={showPassword ? "text" : "password"} placeholder="Create password" value={formData.password} onChange={(e) => updateFormData('password', e.target.value)} error={errors.password} icon={Lock}/>
                      <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-[1rem] text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors z-10">
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                    
                    <div className="relative">
                      <Input label="Confirm Password" type={showConfirmPassword ? "text" : "password"} placeholder="Confirm password" value={formData.confirmPassword} onChange={(e) => updateFormData('confirmPassword', e.target.value)} error={errors.confirmPassword} icon={Lock}/>
                      <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-3 top-[1rem] text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors z-10">
                        {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {currentStep === 2 && (
              <motion.div
                key="step2"
                variants={stepVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                transition={{ duration: 0.3 }}
              >
                <div className="text-center mb-6">
                  <div className="w-16 h-16 bg-blue-500/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Hospital className="w-8 h-8 text-blue-500" />
                  </div>
                  <h3 className="text-xl font-semibold text-slate-900 dark:text-white">🏥 Health & Prescription Profile</h3>
                  <p className="text-slate-600 dark:text-slate-400 text-sm mt-1">Help us provide better medical care</p>
                </div>

                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                       <div>
                            
                       
                    <Input
                      label="Date of Birth"
                      type="date"
                      value={formData.dateOfBirth}
                      onChange={(e) => updateFormData('dateOfBirth', e.target.value)}
                      error={errors.dateOfBirth}
                      icon={Calendar}
                    /></div>
                    
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        Gender (Optional)
                      </label>
                      <select
                        value={formData.gender}
                        onChange={(e) => updateFormData('gender', e.target.value)}
                        className="w-full px-4 py-3 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                      >
                        <option value="">Select Gender</option>
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                        <option value="other">Other</option>
                        <option value="prefer-not-to-say">Prefer not to say</option>
                      </select>
                    </div>
                  </div>

                  <Input
                    label="Address"
                    placeholder="Enter your full address"
                    value={formData.address}
                    onChange={(e) => updateFormData('address', e.target.value)}
                    error={errors.address}
                    icon={MapPin}
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                      label="City"
                      placeholder="Enter city"
                      value={formData.city}
                      onChange={(e) => updateFormData('city', e.target.value)}
                      error={errors.city}
                      icon={MapPin}
                    />
                    
                    <Input
                      label="Pincode"
                      placeholder="Enter 6-digit pincode"
                      value={formData.pincode}
                      onChange={(e) => updateFormData('pincode', e.target.value)}
                      error={errors.pincode}
                      icon={MapPin}
                    />
                  </div>

                  <div className="bg-orange-50 dark:bg-orange-900/20 p-4 rounded-lg border border-orange-200 dark:border-orange-800">
                    <h4 className="font-medium text-orange-800 dark:text-orange-200 mb-2 flex items-center">
                      <Shield className="w-4 h-4 mr-2" />
                      Emergency Contact (Optional)
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Input
                        label="Contact Name"
                        placeholder="Family member name"
                        value={formData.emergencyContactName}
                        onChange={(e) => updateFormData('emergencyContactName', e.target.value)}
                        icon={User}
                      />
                      <Input
                        label="Contact Number"
                        placeholder="Emergency contact number"
                        value={formData.emergencyContactNumber}
                        onChange={(e) => updateFormData('emergencyContactNumber', e.target.value)}
                        icon={Phone}
                      />
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
            {currentStep === 3 && (
              <motion.div
                key="step3"
                variants={stepVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                transition={{ duration: 0.3 }}
              >
                <div className="text-center mb-6">
                  <div className="w-16 h-16 bg-green-500/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <FileText className="w-8 h-8 text-green-500" />
                  </div>
                  <h3 className="text-xl font-semibold text-slate-900 dark:text-white">Medical History</h3>
                  <p className="text-slate-600 dark:text-slate-400 text-sm mt-1">Help doctors provide better care</p>
                </div>

                <div className="space-y-6">
                  <MedicalListSection
                    title="Medical Conditions"
                    subtitle="Any chronic conditions or ongoing health issues"
                    icon={Heart}
                    items={formData.medicalConditions}
                    onAdd={(item) => addListItem('medicalConditions', item)}
                    onRemove={(index) => removeListItem('medicalConditions', index)}
                    placeholder="e.g., Diabetes, Hypertension, Asthma"
                    color="text-red-600"
                    bgColor="bg-red-50 dark:bg-red-900/20"
                  />
                  <MedicalListSection
                    title="Allergies"
                    subtitle="Food allergies, drug allergies, environmental allergies"
                    icon={AlertTriangle}
                    items={formData.allergies}
                    onAdd={(item) => addListItem('allergies', item)}
                    onRemove={(index) => removeListItem('allergies', index)}
                    placeholder="e.g., Penicillin, Peanuts, Pollen"
                    color="text-orange-600"
                    bgColor="bg-orange-50 dark:bg-orange-900/20"
                  />
                  <MedicalListSection
                    title="Current Medications"
                    subtitle="Medicines you are currently taking"
                    icon={Pill}
                    items={formData.currentMedications}
                    onAdd={(item) => addListItem('currentMedications', item)}
                    onRemove={(index) => removeListItem('currentMedications', index)}
                    placeholder="e.g., Aspirin 75mg daily, Vitamin D"
                    color="text-blue-600"
                    bgColor="bg-blue-50 dark:bg-blue-900/20"
                  />
                  <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg border border-purple-200 dark:border-purple-800">
                    <div className="flex items-center space-x-3 mb-3">
                      <GraduationCap className="w-5 h-5 text-purple-600" />
                      <h4 className="font-medium text-purple-800 dark:text-purple-200">Student Status</h4>
                    </div>
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.isStudent}
                        onChange={(e) => updateFormData('isStudent', e.target.checked)}
                        className="rounded border-slate-300 text-primary focus:ring-primary"
                      />
                      <span className="text-sm text-slate-700 dark:text-slate-300">I am currently a student</span>
                    </label>
                    {formData.isStudent && (
                      <div className="mt-3">
                        <Input
                          label="Institution Name"
                          placeholder="Enter your school/college name"
                          value={formData.studentInstitution}
                          onChange={(e) => updateFormData('studentInstitution', e.target.value)}
                          icon={GraduationCap}
                        />
                      </div>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Any other health-related concerns or issues?
                    </label>
                    <textarea
                      value={formData.healthIssues}
                      onChange={(e) => updateFormData('healthIssues', e.target.value)}
                      placeholder="Describe any other health concerns, symptoms, or issues you'd like doctors to know about..."
                      className="w-full px-4 py-3 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary bg-white dark:bg-slate-800 text-slate-900 dark:text-white h-24 resize-none"
                    />
                  </div>
                  <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                    <div className="flex items-center space-x-3 mb-4">
                      <Bell className="w-5 h-5 text-blue-600" />
                      <h4 className="font-medium text-blue-800 dark:text-blue-200">Notification Preferences</h4>
                    </div>
                    <div className="space-y-2">
                      <label className="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.notificationPreferences.email}
                          onChange={(e) => updateFormData('notificationPreferences', {
                            ...formData.notificationPreferences,
                            email: e.target.checked
                          })}
                          className="rounded border-slate-300 text-primary focus:ring-primary"
                        />
                        <span className="text-sm text-slate-700 dark:text-slate-300">Email notifications</span>
                      </label>
                      <label className="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.notificationPreferences.sms}
                          onChange={(e) => updateFormData('notificationPreferences', {
                            ...formData.notificationPreferences,
                            sms: e.target.checked
                          })}
                          className="rounded border-slate-300 text-primary focus:ring-primary"
                        />
                        <span className="text-sm text-slate-700 dark:text-slate-300">SMS notifications</span>
                      </label>
                      <label className="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.notificationPreferences.app}
                          onChange={(e) => updateFormData('notificationPreferences', {
                            ...formData.notificationPreferences,
                            app: e.target.checked
                          })}
                          className="rounded border-slate-300 text-primary focus:ring-primary"
                        />
                        <span className="text-sm text-slate-700 dark:text-slate-300">App notifications</span>
                      </label>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          <div className="flex justify-between pt-6 mt-6 border-t border-slate-200 dark:border-slate-700">
            <Button
              variant="outline"
              onClick={prevStep}
              className="flex items-center space-x-2"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>{currentStep === 1 ? 'Back to Login' : 'Previous'}</span>
            </Button>

            <div className="flex space-x-3">
              <Button
                variant="outline"
                onClick={() => {
                  console.log('Progress saved')
                }}
                className="flex items-center space-x-2"
              >
                <Save className="w-4 h-4" />
                <span>Save Progress</span>
              </Button>

              <Button
                onClick={nextStep}
                className="flex items-center space-x-2"
              >
                <span>{currentStep === 3 ? 'Complete Registration' : 'Next'}</span>
                {currentStep === 3 ? 
                  <UserPlus className="w-4 h-4" /> : 
                  <ChevronRight className="w-4 h-4" />
                }
              </Button>
            </div>
          </div>
        </Card>
      </div>
      </div>
    </>
  )
}

const MedicalListSection = ({ title, subtitle, icon: Icon, items, onAdd, onRemove, placeholder, color, bgColor }) => {
  const [inputValue, setInputValue] = useState('')

  const handleAdd = () => {
    if (inputValue.trim()) {
      onAdd(inputValue)
      setInputValue('')
    }
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleAdd()
    }
  }

  return (
    <div className={`${bgColor} p-4 rounded-lg border border-opacity-20`}>
      <div className="flex items-center space-x-3 mb-3">
        <Icon className={`w-5 h-5 ${color}`} />
        <div>
          <h4 className={`font-medium ${color}`}>{title}</h4>
          <p className="text-xs text-slate-600 dark:text-slate-400">{subtitle}</p>
        </div>
      </div>

      <div className="flex space-x-2 mb-3">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder={placeholder}
          className="flex-1 px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm"
        />
        <button
          onClick={handleAdd}
          className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors text-sm"
        >
          Add
        </button>
      </div>

      {items.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {items.map((item, index) => (
            <span
              key={index}
              className="inline-flex items-center space-x-1 px-3 py-1 bg-white dark:bg-slate-800 rounded-full text-sm border border-slate-200 dark:border-slate-700"
            >
              <span>{item}</span>
              <button
                onClick={() => onRemove(index)}
                className="text-red-500 hover:text-red-700 ml-1"
              >
                ×
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  )
}
