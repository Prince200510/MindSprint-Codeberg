import { useState, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import { useNotifications } from '../context/NotificationContext.jsx'
import { motion, AnimatePresence } from 'framer-motion'
import { Bell,  Search,  Settings,  User,  LogOut,  Shield, ChevronDown, Stethoscope, CheckCircle2, X, Clock, Calendar} from 'lucide-react'

export const Topbar = () => {
  const { user, logout } = useAuth()
  const { notifications, unreadCount, markAsRead, removeNotification } = useNotifications()
  const navigate = useNavigate()
  const [showProfile, setShowProfile] = useState(false)
  const [showNotifications, setShowNotifications] = useState(false)
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, right: 0 })
  const [notificationPosition, setNotificationPosition] = useState({ top: 0, right: 0 })
  const dropdownRef = useRef(null)
  const buttonRef = useRef(null)
  const notificationRef = useRef(null)
  const notificationButtonRef = useRef(null)

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowProfile(false)
      }
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setShowNotifications(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  const handleLogout = (e) => {
    e.preventDefault()
    e.stopPropagation()
    try {
      logout()
      setShowProfile(false)
    } catch (error) {
    }
  }

  return (
    <header className="h-16 flex items-center justify-between px-3 sm:px-6 border-b border-slate-200/60 dark:border-slate-700/60 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl relative z-50">
      <div className="flex items-center space-x-2 sm:space-x-3">
        <div className="w-7 h-7 sm:w-8 sm:h-8 bg-gradient-to-r from-primary to-primary/80 rounded-lg flex items-center justify-center">
          <Stethoscope className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
        </div>
        <div className="font-bold text-lg sm:text-xl text-slate-900 dark:text-white">
          <span className="hidden xs:inline">MediTrack</span>
          <span className="xs:hidden">MT</span>
        </div>
      </div>
      <div className="flex-1 max-w-xs sm:max-w-md mx-2 sm:mx-8 hidden md:block">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input 
            type="text"
            placeholder="Search..."
            className="w-full pl-10 pr-4 py-2 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 text-sm"
          />
        </div>
      </div>
      <div className="flex items-center space-x-1 sm:space-x-4">
        <div className="relative" ref={notificationRef}>
          <motion.button 
            ref={notificationButtonRef}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              if (!showNotifications && notificationButtonRef.current) {
                const rect = notificationButtonRef.current.getBoundingClientRect()
                setNotificationPosition({
                  top: rect.bottom + 8,
                  right: window.innerWidth - rect.right
                })
              }
              setShowNotifications(!showNotifications)
            }}
            className="relative p-1.5 sm:p-2 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
          >
            <Bell className="w-4 h-4 sm:w-5 sm:h-5 text-slate-600 dark:text-slate-300" />
            {unreadCount > 0 && (
              <motion.span 
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute -top-1 -right-1 w-4 h-4 sm:w-5 sm:h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-medium"
              >
                {unreadCount > 99 ? '99+' : unreadCount}
              </motion.span>
            )}
          </motion.button>

          <AnimatePresence>
            {showNotifications && (
              <motion.div
                initial={{ opacity: 0, y: -10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                className="absolute right-0 top-full mt-2 w-72 sm:w-80 max-h-80 sm:max-h-96 bg-white dark:bg-slate-800 backdrop-blur-md rounded-lg shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden z-[99999]"
              >
                <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-700">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-medium text-slate-900 dark:text-white">
                      Notifications ({unreadCount} new)
                    </h3>
                    <button
                      onClick={() => setShowNotifications(false)}
                      className="p-1 rounded-md hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                    >
                      <X className="w-4 h-4 text-slate-500" />
                    </button>
                  </div>
                </div>
                
                <div className="max-h-80 overflow-y-auto">
                  {notifications.length > 0 ? (
                    notifications.map(notification => (
                      <motion.div
                        key={notification.id}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className={`p-4 border-b border-slate-100 dark:border-slate-700/50 hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors cursor-pointer ${
                          !notification.isRead ? 'bg-gradient-to-r from-blue-50/50 to-transparent dark:from-blue-900/10 dark:to-transparent border-l-2 border-l-blue-400' : ''
                        }`}
                        onClick={() => !notification.isRead && markAsRead(notification.id)}
                      >
                        <div className="flex items-start space-x-3">
                          <div className="flex-shrink-0">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                              !notification.isRead 
                                ? 'bg-blue-100 dark:bg-blue-900/30' 
                                : 'bg-slate-100 dark:bg-slate-700'
                            }`}>
                              {notification.type === 'medicine-taken' ? (
                                <CheckCircle2 className={`w-5 h-5 ${
                                  notification.isRead ? 'text-green-500' : 'text-green-600'
                                }`} />
                              ) : (
                                <Bell className={`w-5 h-5 ${
                                  notification.isRead ? 'text-slate-400' : 'text-blue-500'
                                }`} />
                              )}
                            </div>
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-1">
                              <div className="flex items-center space-x-2">
                                <span className={`text-sm font-medium ${
                                  notification.isRead 
                                    ? 'text-slate-600 dark:text-slate-400' 
                                    : 'text-slate-900 dark:text-white'
                                }`}>
                                  {notification.type === 'medicine-taken' ? 'Medicine Taken ✓' : 'Medicine Reminder'}
                                </span>
                                {!notification.isRead && (
                                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                                )}
                              </div>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  removeNotification(notification.id);
                                }}
                                className="p-1 rounded-md hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors opacity-0 group-hover:opacity-100"
                                title="Remove"
                              >
                                <X className="w-3 h-3 text-slate-400" />
                              </button>
                            </div>
                            
                            <p className={`text-sm leading-relaxed ${
                              notification.isRead 
                                ? 'text-slate-600 dark:text-slate-400' 
                                : 'text-slate-800 dark:text-slate-200'
                            }`}>
                              {notification.message}
                            </p>
                            
                            {notification.prescription?.specialInstructions && (
                              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                                📝 {notification.prescription.specialInstructions}
                              </p>
                            )}
                            
                            <div className="flex items-center justify-between mt-3">
                              <div className="flex items-center space-x-4 text-xs text-slate-500 dark:text-slate-400">
                                <div className="flex items-center space-x-1">
                                  <Clock className="w-3 h-3" />
                                  <span>{notification.time}</span>
                                </div>
                                <div className="flex items-center space-x-1">
                                  <Calendar className="w-3 h-3" />
                                  <span>{new Date(notification.createdAt || notification.takenAt).toLocaleDateString()}</span>
                                </div>
                              </div>
                              
                              {!notification.isRead && notification.type === 'dose-reminder' && (
                                <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full">
                                  New
                                </span>
                              )}
                              
                              {notification.type === 'medicine-taken' && (
                                <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-full">
                                  Taken
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))
                  ) : (
                    <div className="p-8 text-center">
                      <Bell className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
                      <p className="text-sm text-slate-500 dark:text-slate-400">No notifications</p>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        <motion.button 
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => navigate('/dashboard/user/settings')}
          className="p-1.5 sm:p-2 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors hidden sm:block"
        >
          <Settings className="w-4 h-4 sm:w-5 sm:h-5 text-slate-600 dark:text-slate-300" />
        </motion.button>
        {user && (
          <div className="relative" ref={dropdownRef}>
            <motion.button
              ref={buttonRef}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                if (!showProfile && buttonRef.current) {
                  const rect = buttonRef.current.getBoundingClientRect()
                  setDropdownPosition({
                    top: rect.bottom + 8,
                    right: window.innerWidth - rect.right
                  })
                }
                setShowProfile(!showProfile)
              }}
              className="flex items-center space-x-2 sm:space-x-3 px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
            >
              <div className="w-7 h-7 sm:w-8 sm:h-8 bg-gradient-to-br from-primary to-primary/80 rounded-lg flex items-center justify-center">
                {user.role === 'admin' ? (
                  <Shield className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
                ) : (
                  <User className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
                )}
              </div>
              <div className="text-left hidden md:block">
                <p className="text-sm font-medium text-slate-900 dark:text-white">{user.name}</p>
                <p className="text-xs text-slate-600 dark:text-slate-400 capitalize">{user.role}</p>
              </div>
              <ChevronDown className={`w-3 h-3 sm:w-4 sm:h-4 text-slate-500 transition-transform ${showProfile ? 'rotate-180' : ''} hidden sm:block`} />
            </motion.button>

            <AnimatePresence>
              {showProfile && (
                <motion.div
                  initial={{ opacity: 0, y: -10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                  className="absolute right-0 top-full mt-2 w-48 sm:w-56 bg-white dark:bg-slate-800 backdrop-blur-md rounded-lg shadow-2xl border border-slate-200 dark:border-slate-700 py-2 z-[99999]"
                >
                  <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-700">
                    <p className="text-sm font-medium text-slate-900 dark:text-white">{user.name}</p>
                    <p className="text-xs text-slate-600 dark:text-slate-400">{user.email || 'princemaurya88719@gmail.com'}</p>
                    <div className="flex items-center space-x-1 mt-1">
                      <Shield className="w-3 h-3 text-primary" />
                      <span className="text-xs font-medium text-primary capitalize">{user.role}</span>
                    </div>
                  </div>
                  
                  <div className="py-1">
                    <button 
                      onClick={() => {
                        const settingsPath = user.role === 'user' 
                          ? '/dashboard/user/settings'
                          : user.role === 'doctor'
                          ? '/dashboard/doctor/settings'
                          : '/dashboard/admin/settings'
                        navigate(settingsPath)
                        setShowProfile(false)
                      }}
                      className="flex items-center space-x-3 w-full px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                    >
                      <User className="w-4 h-4" />
                      <span>Profile Settings</span>
                    </button>
                    <button 
                      onClick={() => {
                        const settingsPath = user.role === 'user' 
                          ? '/dashboard/user/settings'
                          : user.role === 'doctor'
                          ? '/dashboard/doctor/settings'
                          : '/dashboard/admin/settings'
                        navigate(settingsPath)
                        setShowProfile(false)
                      }}
                      className="flex items-center space-x-3 w-full px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                    >
                      <Settings className="w-4 h-4" />
                      <span>Preferences</span>
                    </button>
                  </div>
                  
                  <div className="border-t border-slate-200 dark:border-slate-700 py-1">
                    <button 
                      type="button"
                      onClick={handleLogout}
                      className="flex items-center space-x-3 w-full px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors focus:outline-none focus:bg-red-50 dark:focus:bg-red-900/20"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </div>
    </header>
  )
}
