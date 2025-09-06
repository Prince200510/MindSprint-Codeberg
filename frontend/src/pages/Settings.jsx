import { useState, useEffect } from 'react'
import { Layout } from '../components/Layout.jsx'
import { Card } from '../components/Card.jsx'
import { Button } from '../components/Button.jsx'
import { Input } from '../components/Input.jsx'
import { Modal } from '../components/Modal.jsx'
import { motion, AnimatePresence } from 'framer-motion'
import { User, Mail, Phone, Shield, Plus, Trash2, Save, Eye, EyeOff, Loader2, CheckCircle2, AlertTriangle, Clock } from 'lucide-react'
import { useAuth } from '../context/AuthContext.jsx'
import { useNotifications } from '../context/NotificationContext.jsx'
import { API_CONFIG } from '../config/api.js'
import emailjs from '@emailjs/browser'

export const Settings = () => {
  const { user } = useAuth()
  const { addNotification } = useNotifications()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [profile, setProfile] = useState({
    name: '',
    email: '',
    mobile: '',
    emergencyContacts: []
  })
  const [showPasswordModal, setShowPasswordModal] = useState(false)
  const [showOTPModal, setShowOTPModal] = useState(false)
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
    otp: ''
  })
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  })
  const [otpTimer, setOtpTimer] = useState(0)
  const [otpSending, setOtpSending] = useState(false)
  const [otpVerifying, setOtpVerifying] = useState(false)
  const [otpVerified, setOtpVerified] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const [modalSuccessMessage, setModalSuccessMessage] = useState('')
  const [modalErrorMessage, setModalErrorMessage] = useState('')

  const nav = user?.role === 'user' ? [
    {to:'/dashboard/user', label:'Overview'},
    {to:'/dashboard/user/prescriptions', label:'Prescriptions'},
    {to:'/dashboard/user/medicines', label:'Medicines'},
    {to:'/dashboard/user/schedule', label:'Schedule'},
    {to:'/dashboard/user/analytics', label:'Analytics'},
    {to:'/dashboard/user/chat', label:'Chat'},
    {to:'/dashboard/user/settings', label:'Settings'}
  ] : user?.role === 'doctor' ? [
    {to:'/dashboard/doctor', label:'Appointments'},
    {to:'/dashboard/doctor/settings', label:'Settings'}
  ] : [
    {to:'/dashboard/admin', label:'Overview'},
    {to:'/dashboard/admin/settings', label:'Settings'}
  ]

  const API_BASE = API_CONFIG.API_URL

  useEffect(() => {
    fetchProfile()
    try {
      emailjs.init(import.meta.env.VITE_EMAILJS_PUBLIC_KEY)
      console.log('EmailJS initialized successfully')
    } catch (error) {
      console.error('Failed to initialize EmailJS:', error)
    }
  }, [])

  useEffect(() => {
    let timer
    if (otpTimer > 0) {
      timer = setTimeout(() => setOtpTimer(otpTimer - 1), 1000)
    }
    return () => clearTimeout(timer)
  }, [otpTimer])

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`${API_BASE}/settings/profile`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })

      if (response.ok) {
        const data = await response.json()
        setProfile({
          name: data.user.name || '',
          email: data.user.email || '',
          mobile: data.user.mobile || '',
          emergencyContacts: data.user.emergencyContacts || []
        })
      }
    } catch (error) {
      console.error('Error fetching profile:', error)
      setErrorMessage('Failed to fetch profile data')
    } finally {
      setLoading(false)
    }
  }

  const updateProfile = async (e) => {
    e.preventDefault()
    setSaving(true)
    
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`${API_BASE}/settings/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(profile)
      })

      const data = await response.json()

      if (response.ok) {
        setSuccessMessage('Profile updated successfully!')
        setTimeout(() => setSuccessMessage(''), 5000)
      } else {
        setErrorMessage(data.message || 'Failed to update profile')
        setTimeout(() => setErrorMessage(''), 5000)
      }
    } catch (error) {
      console.error('Error updating profile:', error)
      setErrorMessage('Failed to update profile')
      setTimeout(() => setErrorMessage(''), 5000)
    } finally {
      setSaving(false)
    }
  }

  const sendOTPEmail = async () => {
    setOtpSending(true)
    
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`${API_BASE}/settings/generate-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ email: profile.email })
      })

      const data = await response.json()

      if (response.ok) {
        const templateParams = {
          to: profile.email,
          email: profile.email,
          to_email: profile.email,
          user_email: profile.email,
          recipient: profile.email,
          name: profile.name,
          to_name: profile.name,
          user_name: profile.name,
          otp: data.otp,
          otp_code: data.otp,
          verification_code: data.otp,
          code: data.otp,
          message: `Your OTP verification code is: ${data.otp}`,
          from_name: 'MediTrack Healthcare',
          reply_to: 'noreply@meditrack.com'
        }

        console.log('Sending email with params:', templateParams)
        console.log('EmailJS Config:', {
          serviceId: import.meta.env.VITE_EMAILJS_SERVICE_ID,
          templateId: import.meta.env.VITE_EMAILJS_TEMPLATE_ID,
          publicKey: import.meta.env.VITE_EMAILJS_PUBLIC_KEY
        })

        const emailResponse = await emailjs.send(
          import.meta.env.VITE_EMAILJS_SERVICE_ID,
          import.meta.env.VITE_EMAILJS_TEMPLATE_ID,
          templateParams,
          import.meta.env.VITE_EMAILJS_PUBLIC_KEY
        )

        console.log('EmailJS Response:', emailResponse)
        setModalSuccessMessage('OTP sent to your email!')
        setOtpTimer(300) // 5 minutes
        setTimeout(() => setModalSuccessMessage(''), 5000)
      } else {
        setModalErrorMessage(data.message || 'Failed to generate OTP')
        setTimeout(() => setModalErrorMessage(''), 5000)
      }
    } catch (error) {
      console.error('Error sending OTP:', error)
      console.error('Error details:', error.text || error.message)
      
      if (error.message && error.message.includes('422')) {
        setModalErrorMessage('EmailJS configuration error. Please check your template parameters.')
      } else {
        setModalErrorMessage(`Failed to send OTP email: ${error.text || error.message || 'Unknown error'}`)
      }
      setTimeout(() => setModalErrorMessage(''), 5000)
    } finally {
      setOtpSending(false)
    }
  }

  const verifyOTP = async () => {
    if (!passwordForm.otp || passwordForm.otp.length !== 6) {
      setModalErrorMessage('Please enter a valid 6-digit OTP')
      setTimeout(() => setModalErrorMessage(''), 3000)
      return
    }

    setOtpVerifying(true)

    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`${API_BASE}/settings/verify-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ otp: passwordForm.otp })
      })

      const data = await response.json()

      if (response.ok) {
        setOtpVerified(true)
        setModalSuccessMessage('OTP verified successfully!')
        setTimeout(() => setModalSuccessMessage(''), 3000)
      } else {
        setModalErrorMessage(data.message || 'Invalid OTP')
        setTimeout(() => setModalErrorMessage(''), 5000)
      }
    } catch (error) {
      console.error('Error verifying OTP:', error)
      setModalErrorMessage('Failed to verify OTP')
      setTimeout(() => setModalErrorMessage(''), 5000)
    } finally {
      setOtpVerifying(false)
    }
  }

  const changePassword = async (e) => {
    e.preventDefault()
    
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setModalErrorMessage('New passwords do not match')
      setTimeout(() => setModalErrorMessage(''), 5000)
      return
    }

    if (passwordForm.newPassword.length < 6) {
      setModalErrorMessage('New password must be at least 6 characters')
      setTimeout(() => setModalErrorMessage(''), 5000)
      return
    }

    if (!otpVerified) {
      setModalErrorMessage('Please verify OTP first')
      setTimeout(() => setModalErrorMessage(''), 5000)
      return
    }

    setSaving(true)

    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`${API_BASE}/settings/change-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword,
          otp: passwordForm.otp
        })
      })

      const data = await response.json()

      if (response.ok) {
        setModalSuccessMessage('Password changed successfully!')
        setPasswordForm({
          currentPassword: '',
          newPassword: '',
          confirmPassword: '',
          otp: ''
        })
        setOtpVerified(false)
        setOtpTimer(0)
        setTimeout(() => {
          setShowPasswordModal(false)
          setModalSuccessMessage('')
          setModalErrorMessage('')
        }, 2000)
        
        addNotification({
          type: 'success',
          message: 'Password updated successfully',
          description: 'Your password has been changed securely'
        })
      } else {
        setModalErrorMessage(data.message || 'Failed to change password')
        setTimeout(() => setModalErrorMessage(''), 5000)
      }
    } catch (error) {
      console.error('Error changing password:', error)
      setModalErrorMessage('Failed to change password')
      setTimeout(() => setModalErrorMessage(''), 5000)
    } finally {
      setSaving(false)
    }
  }

  const addEmergencyContact = async () => {
    const name = prompt('Enter contact name:')
    const number = prompt('Enter contact number:')
    const relationship = prompt('Enter relationship (optional):') || 'Other'

    if (!name || !number) return

    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`${API_BASE}/settings/emergency-contacts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ name, number, relationship })
      })

      const data = await response.json()

      if (response.ok) {
        setProfile(prev => ({
          ...prev,
          emergencyContacts: data.emergencyContacts
        }))
        setSuccessMessage('Emergency contact added successfully!')
        setTimeout(() => setSuccessMessage(''), 5000)
      } else {
        setErrorMessage(data.message || 'Failed to add emergency contact')
        setTimeout(() => setErrorMessage(''), 5000)
      }
    } catch (error) {
      console.error('Error adding emergency contact:', error)
      setErrorMessage('Failed to add emergency contact')
      setTimeout(() => setErrorMessage(''), 5000)
    }
  }

  const removeEmergencyContact = async (contactId) => {
    if (!confirm('Are you sure you want to remove this emergency contact?')) return

    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`${API_BASE}/settings/emergency-contacts/${contactId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      })

      const data = await response.json()

      if (response.ok) {
        setProfile(prev => ({
          ...prev,
          emergencyContacts: data.emergencyContacts
        }))
        setSuccessMessage('Emergency contact removed successfully!')
        setTimeout(() => setSuccessMessage(''), 5000)
      } else {
        setErrorMessage(data.message || 'Failed to remove emergency contact')
        setTimeout(() => setErrorMessage(''), 5000)
      }
    } catch (error) {
      console.error('Error removing emergency contact:', error)
      setErrorMessage('Failed to remove emergency contact')
      setTimeout(() => setErrorMessage(''), 5000)
    }
  }

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
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
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Settings</h1>
            <p className="text-slate-600 dark:text-slate-400">Manage your account preferences and security</p>
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
              <div className="flex items-center space-x-3">
                <CheckCircle2 className="w-5 h-5" />
                <p className="font-medium">{successMessage}</p>
              </div>
            </motion.div>
          )}

          {errorMessage && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg p-4 shadow-lg"
            >
              <div className="flex items-center space-x-3">
                <AlertTriangle className="w-5 h-5" />
                <p className="font-medium">{errorMessage}</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="grid md:grid-cols-2 gap-6"><Card>
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-10 h-10 bg-gradient-to-br from-[#5f6fff] to-[#5f6fff]/80 rounded-lg flex items-center justify-center">
                <User className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-xl font-semibold text-slate-800 dark:text-white">Profile Information</h2>
            </div>

            <form onSubmit={updateProfile} className="space-y-4">
              <Input
                label="Full Name"
                value={profile.name}
                onChange={(e) => setProfile(prev => ({ ...prev, name: e.target.value }))}
                required
              />
              <Input
                label="Email Address"
                type="email"
                value={profile.email}
                onChange={(e) => setProfile(prev => ({ ...prev, email: e.target.value }))}
                required
              />
              <Input
                label="Mobile Number"
                type="tel"
                value={profile.mobile}
                onChange={(e) => setProfile(prev => ({ ...prev, mobile: e.target.value }))}
                placeholder="+1234567890"
              />

              <Button 
                type="submit"
                className="bg-[#5f6fff] hover:bg-[#5f6fff]/90 w-full"
                disabled={saving}
              >
                {saving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Save Changes
                  </>
                )}
              </Button>
            </form>
          </Card><Card>
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-red-600 rounded-lg flex items-center justify-center">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-xl font-semibold text-slate-800 dark:text-white">Security</h2>
            </div>

            <div className="space-y-4">
              <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
                <h3 className="font-medium text-slate-800 dark:text-white mb-2">Password</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">
                  Change your password to keep your account secure
                </p>
                <Button
                  onClick={() => {
                    setShowPasswordModal(true)
                    setModalSuccessMessage('')
                    setModalErrorMessage('')
                  }}
                  variant="outline"
                  className="border-red-300 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                >
                  <Shield className="w-4 h-4 mr-2" />
                  Change Password
                </Button>
              </div>
            </div>
          </Card>
        </div><Card>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg flex items-center justify-center">
                <Phone className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-xl font-semibold text-slate-800 dark:text-white">Emergency Contacts</h2>
            </div>
            <Button 
              onClick={addEmergencyContact}
              className="bg-[#5f6fff] hover:bg-[#5f6fff]/90"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Contact
            </Button>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            {profile.emergencyContacts.map((contact, index) => (
              <motion.div
                key={contact._id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-4 bg-slate-50 dark:bg-slate-800 rounded-lg"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium text-slate-800 dark:text-white">{contact.name}</h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400">{contact.number}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-500">{contact.relationship}</p>
                  </div>
                  <button
                    onClick={() => removeEmergencyContact(contact._id)}
                    className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            ))}
            
            {profile.emergencyContacts.length === 0 && (
              <div className="col-span-2 text-center py-8">
                <Phone className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
                <p className="text-slate-500 dark:text-slate-400">No emergency contacts added yet</p>
              </div>
            )}
          </div>
        </Card><Modal open={showPasswordModal} onClose={() => {
          if (!saving) {
            setShowPasswordModal(false)
            setPasswordForm({
              currentPassword: '',
              newPassword: '',
              confirmPassword: '',
              otp: ''
            })
            setOtpVerified(false)
            setOtpTimer(0)
            setModalSuccessMessage('')
            setModalErrorMessage('')
          }
        }}>
          <div className="p-6">
            <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-4">Change Password</h2>{modalSuccessMessage && (
              <div className="mb-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                <div className="flex items-center space-x-3">
                  <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400" />
                  <p className="font-medium text-green-800 dark:text-green-200">{modalSuccessMessage}</p>
                </div>
              </div>
            )}{modalErrorMessage && (
              <div className="mb-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                <div className="flex items-center space-x-3">
                  <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400" />
                  <p className="font-medium text-red-800 dark:text-red-200">{modalErrorMessage}</p>
                </div>
              </div>
            )}
            
            <form onSubmit={changePassword} className="space-y-4">
              <div className="relative">
                <Input
                  label="Current Password"
                  type={showPasswords.current ? 'text' : 'password'}
                  value={passwordForm.currentPassword}
                  onChange={(e) => setPasswordForm(prev => ({ ...prev, currentPassword: e.target.value }))}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPasswords(prev => ({ ...prev, current: !prev.current }))}
                  className="absolute right-3 top-8 text-slate-400 hover:text-slate-600"
                >
                  {showPasswords.current ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              <div className="relative">
                <Input
                  label="New Password"
                  type={showPasswords.new ? 'text' : 'password'}
                  value={passwordForm.newPassword}
                  onChange={(e) => setPasswordForm(prev => ({ ...prev, newPassword: e.target.value }))}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPasswords(prev => ({ ...prev, new: !prev.new }))}
                  className="absolute right-3 top-8 text-slate-400 hover:text-slate-600"
                >
                  {showPasswords.new ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              <div className="relative">
                <Input
                  label="Confirm New Password"
                  type={showPasswords.confirm ? 'text' : 'password'}
                  value={passwordForm.confirmPassword}
                  onChange={(e) => setPasswordForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPasswords(prev => ({ ...prev, confirm: !prev.confirm }))}
                  className="absolute right-3 top-8 text-slate-400 hover:text-slate-600"
                >
                  {showPasswords.confirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              <div className="border-t border-slate-200 dark:border-slate-700 pt-4">
                <h3 className="font-medium text-slate-800 dark:text-white mb-3">Email Verification</h3>
                
                <div className="flex space-x-2 mb-3">
                  <Button
                    type="button"
                    onClick={sendOTPEmail}
                    variant="outline"
                    disabled={otpSending || otpTimer > 0}
                  >
                    {otpSending ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                        Sending...
                      </>
                    ) : otpTimer > 0 ? (
                      <>
                        <Clock className="w-4 h-4 mr-2" />
                        Resend in {formatTime(otpTimer)}
                      </>
                    ) : (
                      <>
                        <Mail className="w-4 h-4 mr-2" />
                        Send OTP
                      </>
                    )}
                  </Button>
                </div>

                <div className="flex space-x-2">
                  <Input
                    label="6-Digit OTP"
                    value={passwordForm.otp}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, '').slice(0, 6)
                      setPasswordForm(prev => ({ ...prev, otp: value }))
                    }}
                    placeholder="Enter OTP"
                    maxLength={6}
                    required
                    className={otpVerified ? 'border-green-500' : ''}
                  />
                  <Button
                    type="button"
                    onClick={verifyOTP}
                    disabled={otpVerifying || !passwordForm.otp || passwordForm.otp.length !== 6 || otpVerified}
                    className="mt-6"
                  >
                    {otpVerifying ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : otpVerified ? (
                      <CheckCircle2 className="w-4 h-4 text-green-500" />
                    ) : (
                      'Verify'
                    )}
                  </Button>
                </div>
              </div>

              <div className="flex space-x-3 pt-4">
                <Button
                  type="submit"
                  className="bg-[#5f6fff] hover:flex-1"
                  disabled={saving || !otpVerified}
                >
                  {saving ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      Changing...
                    </>
                  ) : (
                    <>
                      <Shield className="w-4 h-4 mr-2" />
                      Change Password
                    </>
                  )}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowPasswordModal(false)}
                  disabled={saving}
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </form>
          </div>
        </Modal>
      </div>
    </Layout>
  )
}
