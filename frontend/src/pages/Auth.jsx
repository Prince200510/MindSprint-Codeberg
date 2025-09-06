import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext.jsx'
import { useTheme } from '../context/ThemeContext.jsx'
import { motion, AnimatePresence } from 'framer-motion'
import { useSearchParams, useNavigate, Link } from 'react-router-dom'
import { PatientRegistration } from '../components/PatientRegistration.jsx'
import { Stethoscope,  User,  Shield,  Sun,  Moon,  ArrowLeft,  Mail,  Lock,  UserPlus, Heart, Activity, Eye, EyeOff, CheckCircle2, Star, X, AlertCircle} from 'lucide-react'

const Toast = ({ message, type, onClose }) => (
  <motion.div
    initial={{ opacity: 0, y: -50, x: '-50%' }}
    animate={{ opacity: 1, y: 0, x: '-50%' }}
    exit={{ opacity: 0, y: -50, x: '-50%' }}
    className={`fixed top-6 left-1/2 z-50 flex items-center space-x-3 px-6 py-4 rounded-lg shadow-lg backdrop-blur-lg border ${
      type === 'success' 
        ? 'bg-green-500/90 text-white border-green-400' 
        : 'bg-red-500/90 text-white border-red-400'
    }`}
  >
    {type === 'success' ? (
      <CheckCircle2 className="w-5 h-5" />
    ) : (
      <AlertCircle className="w-5 h-5" />
    )}
    <span className="font-medium">{message}</span>
    <button onClick={onClose} className="ml-2">
      <X className="w-4 h-4" />
    </button>
  </motion.div>
)

export const AuthPage = ({mode='login'}) => {
  const { login, register } = useAuth()
  const { theme, toggle } = useTheme()
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const roleParam = searchParams.get('role')
  
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    role: roleParam || 'patient',
    specialization: ''
  })
  
  const [currentMode, setCurrentMode] = useState(mode)
  const [showPatientRegistration, setShowPatientRegistration] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
  const [toast, setToast] = useState(null)
  const showToast = (message, type) => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 5000)
  }

  useEffect(() => {
    if (roleParam) {
      setForm(prev => ({ ...prev, role: roleParam === 'patient' ? 'user' : roleParam }))
      if (roleParam === 'admin') {
        setCurrentMode('login')
      }
    }
  }, [roleParam])

  useEffect(() => {
    if (currentMode === 'register' && (form.role === 'doctor' || roleParam === 'doctor')) {
      const timer = setTimeout(() => {
        navigate('/doctor-register')
      }, 100) 
      
      return () => clearTimeout(timer)
    }
  }, [currentMode, form.role, roleParam, navigate])

  const submit = async e => {
    e.preventDefault()
    
    if (currentMode === 'register' && form.role === 'admin') {
      showToast('Admin accounts cannot be created through the website. Please contact system administrator.', 'error')
      return
    }
    
    if (currentMode === 'register' && form.role === 'doctor') {
      navigate('/doctor-register')
      return
    }
    
    setIsLoading(true)
    try {
      if (currentMode === 'login') {
        await login(form.email, form.password)
        showToast('Login successful! Redirecting to dashboard...', 'success')
      } else {
        await register(form)
        showToast('Account created successfully! Redirecting to dashboard...', 'success')
      }
    } catch (error) {
      console.error('Auth error:', error)
      
      if (error.response?.status === 403) {
        const errorData = error.response.data
        if (errorData.error === 'account_pending') {
          showToast('⏳ Your doctor application is under review. Please wait for admin approval before logging in.', 'error')
        } else if (errorData.error === 'account_rejected') {
          showToast('❌ Your doctor application was rejected. Please contact support at support@meditrack.com or submit a new application.', 'error')
        } else if (errorData.error === 'account_not_approved') {
          showToast('🚫 Your doctor account is not approved. Please contact support at support@meditrack.com for assistance.', 'error')
        } else {
          showToast(errorData.message || 'Account access denied. Please contact support.', 'error')
        }
      } else if (error.response?.status === 401) {
        showToast('❌ Invalid email or password. Please check your credentials and try again.', 'error')
      } else if (error.response?.status === 409) {
        showToast('⚠️ An account with this email already exists. Please use a different email or try logging in.', 'error')
      } else if (error.response?.data?.error === 'missing_fields') {
        showToast('📝 Please fill in all required fields before submitting.', 'error')
      } else {
        showToast('❌ Something went wrong. Please try again later.', 'error')
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handlePatientRegistrationComplete = async (patientData) => {
    setIsLoading(true)
    try {
      const registrationData = {
        name: `${patientData.firstName} ${patientData.lastName}`,
        email: patientData.email,
        password: patientData.password,
        role: 'user',
        mobile: patientData.mobile,
        profile: {
          firstName: patientData.firstName,
          lastName: patientData.lastName,
          dateOfBirth: patientData.dateOfBirth,
          gender: patientData.gender,
          address: patientData.address,
          city: patientData.city,
          pincode: patientData.pincode,
          emergencyContact: {
            name: patientData.emergencyContactName,
            number: patientData.emergencyContactNumber
          },
          medicalHistory: {
            conditions: patientData.medicalConditions,
            allergies: patientData.allergies,
            currentMedications: patientData.currentMedications,
            isStudent: patientData.isStudent,
            studentInstitution: patientData.studentInstitution,
            healthIssues: patientData.healthIssues
          },
          notificationPreferences: patientData.notificationPreferences
        }
      }

      const result = await register(registrationData)
      if (result.success) {
        showToast('🎉 Registration completed successfully! Welcome to MediTrack!', 'success')
        setShowPatientRegistration(false)
        setTimeout(() => {
          showToast('🔑 Please login with your new account', 'success')
          setCurrentMode('login')
          setForm(prev => ({
            ...prev,
            email: patientData.email,
            password: '' 
          }))
        }, 2000)
      } else {
        throw new Error(result.error || 'Registration failed')
      }
    } catch (error) {
      if (error.response?.status === 409) {
        showToast('⚠️ An account with this email already exists. Please use a different email or try logging in.', 'error')
      } else if (error.response?.data?.error === 'email_in_use') {
        showToast('⚠️ This email is already registered. Please use a different email address.', 'error')
      } else if (error.response?.data?.error === 'missing_fields') {
        showToast('❌ Please fill in all required fields before submitting.', 'error')
      } else if (error.response?.status >= 500) {
        showToast('🔧 Server error occurred. Please try again in a few moments.', 'error')
      } else if (error.message.includes('Network Error')) {
        showToast('🌐 Network connection error. Please check your internet connection.', 'error')
      } else {
        showToast(
          error.response?.data?.message || 
          error.message || 
          '❌ Registration failed. Please check your information and try again.',
          'error'
        )
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handlePatientRegistrationBack = () => {
    setShowPatientRegistration(false)
  }

  const getRoleInfo = (role) => {
    switch (role) {
      case 'admin':
        return { 
          icon: Shield, 
          title: 'Admin Portal', 
          subtitle: 'System Administration',
          color: 'text-red-500', 
          bgColor: 'bg-gradient-to-r from-red-500 to-red-600',
          bgLight: 'bg-red-50 dark:bg-red-900/20',
          textColor: 'text-red-600 dark:text-red-400',
          description: 'Manage the entire MediTrack platform'
        }
      case 'doctor':
        return { 
          icon: Stethoscope, 
          title: 'Doctor Portal', 
          subtitle: 'Medical Professional',
          color: 'text-blue-500', 
          bgColor: 'bg-gradient-to-r from-blue-500 to-blue-600',
          bgLight: 'bg-blue-50 dark:bg-blue-900/20',
          textColor: 'text-blue-600 dark:text-blue-400',
          description: 'Access patient records and prescriptions'
        }
      default:
        return { 
          icon: User, 
          title: 'Patient Portal', 
          subtitle: 'Healthcare Management',
          color: 'text-primary', 
          bgColor: 'bg-gradient-to-r from-primary to-primary/80',
          bgLight: 'bg-primary/10 dark:bg-primary/20',
          textColor: 'text-primary dark:text-primary/90',
          description: 'Manage your medications and health'
        }
    }
  }

  const roleInfo = getRoleInfo(roleParam || 'patient')
  const RoleIcon = roleInfo.icon

  const containerVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut",
        staggerChildren: 0.1
      }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  }

  return (
    <>
      {showPatientRegistration && (
        <PatientRegistration
          onComplete={handlePatientRegistrationComplete}
          onBack={handlePatientRegistrationBack}
        />
      )}
      {!showPatientRegistration && (
        <div className="min-h-screen flex">
          <AnimatePresence>
            {toast && (
              <Toast 
                message={toast.message} 
                type={toast.type} 
                onClose={() => setToast(null)} 
              />
            )}
          </AnimatePresence>
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary via-blue-600 to-purple-700 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'0.05\'%3E%3Ccircle cx=\'30\' cy=\'30\' r=\'1.5\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')]"></div>
        <div className="absolute top-20 left-20 w-64 h-64 bg-white/10 rounded-full filter blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-80 h-80 bg-purple-500/20 rounded-full filter blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-500/10 rounded-full filter blur-3xl animate-pulse delay-2000"></div>
        <div className="relative z-10 flex flex-col justify-center items-center p-12 text-white text-center">
          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="mb-8"
          >
            <div className="w-20 h-20 bg-white/20 backdrop-blur-lg rounded-3xl flex items-center justify-center mb-6 shadow-2xl">
              <Stethoscope className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-4xl font-bold mb-2">MediTrack</h1>
            <p className="text-blue-100 text-lg">Healthcare Made Simple</p>
          </motion.div>
          <motion.div 
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="space-y-6 max-w-md"
          >
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-white/20 backdrop-blur-lg rounded-2xl flex items-center justify-center">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div className="text-left">
                <h3 className="font-semibold text-lg">Secure & Private</h3>
                <p className="text-blue-100 text-sm">HIPAA compliant healthcare platform</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-white/20 backdrop-blur-lg rounded-2xl flex items-center justify-center">
                <Activity className="w-6 h-6 text-white" />
              </div>
              <div className="text-left">
                <h3 className="font-semibold text-lg">Real-time Monitoring</h3>
                <p className="text-blue-100 text-sm">Track your health progress 24/7</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-white/20 backdrop-blur-lg rounded-2xl flex items-center justify-center">
                <Heart className="w-6 h-6 text-white" />
              </div>
              <div className="text-left">
                <h3 className="font-semibold text-lg">Comprehensive Care</h3>
                <p className="text-blue-100 text-sm">Complete healthcare management</p>
              </div>
            </div>
          </motion.div>
          
          <motion.div 
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="flex items-center space-x-6 mt-12 text-blue-100 text-sm"
          >
            <div className="flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4" />
              <span>Secure</span>
            </div>
            <div className="flex items-center space-x-2">
              <Shield className="w-4 h-4" />
              <span>HIPAA Compliant</span>
            </div>
            <div className="flex items-center space-x-2">
              <Star className="w-4 h-4 fill-current" />
              <span>Trusted</span>
            </div>
          </motion.div>

          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.9 }}
            className="mt-8"
          >
            <div className="relative">
              <div className="w-16 h-16 bg-white/20 backdrop-blur-lg rounded-full flex items-center justify-center cursor-pointer hover:bg-white/30 transition-all duration-300 group">
                <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center ml-1 group-hover:scale-110 transition-transform duration-300">
                  <div className="w-0 h-0 border-l-[6px] border-l-primary border-t-[4px] border-b-[4px] border-t-transparent border-b-transparent ml-0.5"></div>
                </div>
              </div>
              <div className="absolute -inset-4 rounded-full bg-white/10 animate-ping"></div>
              <div className="absolute -inset-2 rounded-full bg-white/20 animate-ping animation-delay-150"></div>
            </div>
            <p className="text-blue-100 text-sm mt-3">How it works?</p>
          </motion.div>
        </div>
      </div>

      <div className="w-full lg:w-1/2 bg-white dark:bg-slate-900 flex items-center justify-center p-8">
        <div className="lg:hidden absolute top-6 left-6 right-6 flex items-center justify-between z-10">
          <Link 
            to="/" 
            className="flex items-center space-x-2 text-slate-600 dark:text-slate-400 hover:text-primary transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="text-sm">Back</span>
          </Link>
          <button 
            onClick={toggle}
            className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
            aria-label="Toggle theme"
          >
            {theme === 'light' ? 
              <Moon className="w-5 h-5" /> : 
              <Sun className="w-5 h-5" />
            }
          </button>
        </div>
        <div className="hidden lg:block absolute top-6 right-6 z-10">
          <button 
            onClick={toggle}
            className="p-3 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all duration-300 group"
            aria-label="Toggle theme"
          >
            {theme === 'light' ? 
              <Moon className="w-5 h-5 text-slate-600 group-hover:scale-110 transition-transform" /> : 
              <Sun className="w-5 h-5 text-yellow-500 group-hover:scale-110 transition-transform" />
            }
          </button>
        </div>

        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="w-full max-w-md"
        >
          <div className="lg:hidden text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-r from-primary to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
              <Stethoscope className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-slate-800 dark:text-white">MediTrack</h1>
          </div>
          {roleParam && (
            <motion.div variants={itemVariants} className="text-center mb-6">
              <div className={`w-16 h-16 ${roleInfo.bgColor} rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg`}>
                <RoleIcon className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-1">
                {roleInfo.title}
              </h2>
              <p className="text-slate-600 dark:text-slate-400">
                {roleInfo.subtitle}
              </p>
            </motion.div>
          )}

          <motion.div 
            variants={itemVariants}
            className="bg-white dark:bg-slate-800 rounded-2xl p-8 shadow-xl border border-slate-200 dark:border-slate-700"
          >
            <div className="text-center mb-8">
              <motion.h2 
                variants={itemVariants}
                className="text-2xl font-bold text-slate-800 dark:text-white mb-2"
              >
                {currentMode === 'login' ? 'Welcome Back' : 'Create Account'}
              </motion.h2>
              <motion.p variants={itemVariants} className="text-slate-600 dark:text-slate-400">
                {currentMode === 'login' 
                  ? roleParam ? `Please login to your ${roleInfo.title.toLowerCase()}` : 'Please sign in to your account'
                  : roleParam ? `Create your ${roleInfo.title.toLowerCase()}` : 'Join our healthcare platform'
                }
              </motion.p>
            </div>

            <motion.form variants={itemVariants} onSubmit={submit} className="space-y-5">{currentMode === 'register' && (form.role === 'doctor' || roleParam === 'doctor') ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center py-8"
                >
                  <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                    <Stethoscope className="w-10 h-10 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-slate-800 dark:text-white mb-3">
                    Doctor Registration Portal
                  </h3>
                  <p className="text-slate-600 dark:text-slate-400 mb-6">
                    Please complete the comprehensive doctor registration process with professional credentials, document verification, and availability setup.
                  </p>
                  <div className="flex items-center justify-center space-x-2 text-blue-600 dark:text-blue-400">
                    <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                    <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                    <span className="ml-3 text-sm font-medium">Redirecting to registration...</span>
                  </div>
                </motion.div>
              ) : (
                <>
              <AnimatePresence mode="wait">
                {currentMode === 'register' && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="relative"
                  >
                    <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 dark:text-slate-500 z-10">
                      <UserPlus className="w-5 h-5" />
                    </div>
                    <input
                      type="text"
                      placeholder="Full Name"
                      value={form.name}
                      onChange={e => setForm({...form, name: e.target.value})}
                      className="w-full pl-12 pr-4 py-3 bg-slate-50 dark:bg-slate-700/50 border border-slate-300 dark:border-slate-600 rounded-lg focus:border-primary focus:outline-none transition-all duration-300 text-slate-800 dark:text-white placeholder:text-slate-500 dark:placeholder:text-slate-400"
                      required
                    />
                  </motion.div>
                )}
              </AnimatePresence>
              
              <div className="relative">
                <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 dark:text-slate-500 z-10">
                  <Mail className="w-5 h-5" />
                </div>
                <input
                  type="email"
                  placeholder={roleParam === 'admin' ? 'princemaurya88719@gmail.com' : 'Email Address'}
                  value={form.email}
                  onChange={e => setForm({...form, email: e.target.value})}
                  className="w-full pl-12 pr-4 py-3 bg-slate-50 dark:bg-slate-700/50 border border-slate-300 dark:border-slate-600 rounded-lg focus:border-primary focus:outline-none transition-all duration-300 text-slate-800 dark:text-white placeholder:text-slate-500 dark:placeholder:text-slate-400"
                  required
                />
              </div>
              
              <div className="relative">
                <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 dark:text-slate-500 z-10">
                  <Lock className="w-5 h-5" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Password"
                  value={form.password}
                  onChange={e => setForm({...form, password: e.target.value})}
                  className="w-full pl-12 pr-12 py-3 bg-slate-50 dark:bg-slate-700/50 border border-slate-300 dark:border-slate-600 rounded-lg focus:border-primary focus:outline-none transition-all duration-300 text-slate-800 dark:text-white placeholder:text-slate-500 dark:placeholder:text-slate-400"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-slate-400 dark:text-slate-500 hover:text-primary transition-colors duration-300"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {currentMode === 'login' && (
                <div className="flex items-center justify-between">
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={e => setRememberMe(e.target.checked)}
                      className="w-4 h-4 text-primary bg-gray-100 border-gray-300 rounded focus:ring-primary dark:focus:ring-primary dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                    />
                    <span className="text-sm text-slate-600 dark:text-slate-400">Remember me</span>
                  </label>
                  <button
                    type="button"
                    className="text-sm text-primary hover:text-primary/80 font-medium"
                  >
                    Forgot password?
                  </button>
                </div>
              )}

              <AnimatePresence mode="wait">
                {currentMode === 'register' && !roleParam && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-4"
                  >
                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
                      Account Type
                    </label>
                    <select 
                      className="w-full px-4 py-3 rounded-lg bg-slate-50 dark:bg-slate-700/50 border border-slate-300 dark:border-slate-600 text-slate-800 dark:text-white focus:border-primary focus:outline-none transition-all duration-300" 
                      value={form.role} 
                      onChange={e => setForm({...form, role: e.target.value})}
                    >
                      <option value="user">Patient</option>
                      <option value="doctor">Doctor</option>
                    </select>
                    
                    {form.role === 'doctor' && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        className="relative"
                      >
                        <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 dark:text-slate-500 z-10">
                          <Activity className="w-5 h-5" />
                        </div>
                        <input
                          type="text"
                          placeholder="Medical Specialization"
                          value={form.specialization}
                          onChange={e => setForm({...form, specialization: e.target.value})}
                          className="w-full pl-12 pr-4 py-3 bg-slate-50 dark:bg-slate-700/50 border border-slate-300 dark:border-slate-600 rounded-lg focus:border-primary focus:outline-none transition-all duration-300 text-slate-800 dark:text-white placeholder:text-slate-500 dark:placeholder:text-slate-400"
                        />
                      </motion.div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>

              <motion.button
                variants={itemVariants}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`w-full py-3 font-semibold rounded-lg shadow-lg transition-all duration-300 ${
                  isLoading 
                    ? 'bg-slate-400 cursor-not-allowed' 
                    : `${roleInfo.bgColor} hover:shadow-xl`
                } text-white relative overflow-hidden group`}
                type="submit"
                disabled={isLoading}
              >
                <div className="absolute inset-0 bg-white/10 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></div>
                <div className="relative z-10 flex items-center justify-center space-x-2">
                  {isLoading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      <span>Processing...</span>
                    </>
                  ) : (
                    <>
                      <span>{currentMode === 'login' ? 'Sign In' : 'Create Account'}</span>
                      <Heart className="w-5 h-5" />
                    </>
                  )}
                </div>
              </motion.button>
              </>
              )}
            </motion.form>

            {roleParam !== 'admin' && (
              <motion.div variants={itemVariants} className="text-center pt-6 border-t border-slate-200 dark:border-slate-600 mt-6">
                <p className="text-slate-600 dark:text-slate-400 mb-3">
                  {currentMode === 'login' ? "Don't have an account?" : 'Already have an account?'}
                </p>
                <button
                  type="button"
                  onClick={() => {
                    if (currentMode === 'login' && (form.role === 'user' || form.role === 'patient')) {
                      setShowPatientRegistration(true)
                    } else {
                      setCurrentMode(currentMode === 'login' ? 'register' : 'login')
                    }
                  }}
                  className="text-primary hover:text-primary/80 font-semibold transition-colors duration-300"
                >
                  {currentMode === 'login' 
                    ? (form.role === 'user' || form.role === 'patient' ? 'Complete Patient Registration' : 'Create New Account')
                    : 'Sign In Instead'
                  }
                </button>
              </motion.div>
            )}

            {!roleParam && (
              <motion.div variants={itemVariants} className="text-center pt-6 border-t border-slate-200 dark:border-slate-600 mt-6">
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-4">Or access specific portal</p>
                <div className="grid grid-cols-2 gap-4 max-w-xs mx-auto">
                  <Link 
                    to="/auth?role=patient"
                    className="flex flex-col items-center space-y-2 p-4 bg-primary/10 dark:bg-primary/20 text-primary dark:text-primary/90 rounded-xl hover:bg-primary/20 dark:hover:bg-primary/30 transition-all duration-300 group"
                  >
                    <User className="w-6 h-6 group-hover:scale-110 transition-transform" />
                    <span className="text-sm font-medium">Patient</span>
                  </Link>
                  <Link 
                    to="/auth?role=doctor"
                    className="flex flex-col items-center space-y-2 p-4 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-xl hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-all duration-300 group"
                  >
                    <Stethoscope className="w-6 h-6 group-hover:scale-110 transition-transform" />
                    <span className="text-sm font-medium">Doctor</span>
                  </Link>
                </div>
              </motion.div>
            )}
          </motion.div>
        </motion.div>
      </div>
        </div>
      )}
    </>
  )
}
