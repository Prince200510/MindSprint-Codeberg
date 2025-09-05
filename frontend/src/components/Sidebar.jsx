import { NavLink } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronRight, LogOut, Menu, X } from 'lucide-react'
import { useAuth } from '../context/AuthContext.jsx'
import { useState, useEffect } from 'react'

export const Sidebar = ({items}) => {
  const { user, logout } = useAuth()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  useEffect(() => {
    setIsMobileMenuOpen(false)
  }, [location])
  
  const getSidebarTitle = () => {
    switch(user?.role) {
      case 'admin': return { title: 'Admin Panel', subtitle: 'Manage your platform' }
      case 'doctor': return { title: 'Doctor Dashboard', subtitle: 'Manage your practice' }
      case 'user': return { title: 'Patient Dashboard', subtitle: 'Manage your health' }
      default: return { title: 'Dashboard', subtitle: 'Welcome' }
    }
  }

  const { title, subtitle } = getSidebarTitle()
  const containerVariants = {
    hidden: { opacity: 0, x: -50 },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        duration: 0.3,
        staggerChildren: 0.1
      }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0 }
  }

  const mobileMenuVariants = {
    hidden: { x: '-100%' },
    visible: { 
      x: 0,
      transition: { type: 'spring', damping: 25, stiffness: 200 }
    },
    exit: { 
      x: '-100%',
      transition: { type: 'spring', damping: 25, stiffness: 200 }
    }
  }

  const SidebarContent = ({ isMobile = false }) => (
    <div className={`flex flex-col h-full ${isMobile ? 'p-4' : 'p-6'}`}>
      <div className={`${isMobile ? 'mb-6' : 'mb-8'}`}>
        {isMobile && (
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-semibold text-slate-800 dark:text-white">{title}</h2>
              <p className="text-sm text-slate-600 dark:text-slate-400">{subtitle}</p>
            </div>
            <button
              onClick={() => setIsMobileMenuOpen(false)}
              className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        )}
        {!isMobile && (
          <>
            <h2 className="text-lg font-semibold text-slate-800 dark:text-white mb-1">{title}</h2>
            <p className="text-sm text-slate-600 dark:text-slate-400">{subtitle}</p>
          </>
        )}
      </div>
      
      <nav className="space-y-2 flex-1">
        {items.map((item, index) => {
          const Icon = item.icon
          return (
            <motion.div key={item.to} variants={itemVariants}>
              <NavLink 
                to={item.to} 
                onClick={() => isMobile && setIsMobileMenuOpen(false)}
                className={({isActive}) => `
                  group flex items-center justify-between px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl text-sm font-medium transition-all duration-200 relative overflow-hidden
                  ${isActive 
                    ? 'bg-gradient-to-r from-primary to-primary/80 text-white shadow-lg shadow-primary/25' 
                    : 'hover:bg-slate-100 dark:hover:bg-slate-800/50 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                  }
                `}
              >
                {({isActive}) => (
                  <>
                    <div className="flex items-center space-x-3">
                      {Icon && (
                        <Icon className={`w-4 h-4 sm:w-5 sm:h-5 transition-all duration-200 ${
                          isActive ? 'text-white' : 'text-slate-500 dark:text-slate-400 group-hover:text-slate-700 dark:group-hover:text-slate-300'
                        }`} />
                      )}
                      <span className="relative z-10">{item.label}</span>
                    </div>
                    <ChevronRight className={`w-3 h-3 sm:w-4 sm:h-4 transition-all duration-200 ${
                      isActive 
                        ? 'text-white opacity-100 transform translate-x-0' 
                        : 'text-slate-400 opacity-0 transform -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0'
                    }`} />
                    
                    {isActive && (
                      <motion.div
                        layoutId={isMobile ? "activeTabMobile" : "activeTab"}
                        className="absolute inset-0 bg-gradient-to-r from-primary to-primary/80 rounded-xl"
                        initial={false}
                        transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                      />
                    )}
                  </>
                )}
              </NavLink>
            </motion.div>
          )
        })}
      </nav>

      <div className="mt-auto pt-4 sm:pt-6 border-t border-slate-200 dark:border-slate-700 space-y-3 sm:space-y-4">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => {
            logout()
            isMobile && setIsMobileMenuOpen(false)
          }}
          className="w-full flex items-center justify-between px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl text-sm font-medium transition-all duration-200 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30 border border-red-200 dark:border-red-800"
        >
          <div className="flex items-center space-x-3">
            <LogOut className="w-4 h-4 sm:w-5 sm:h-5" />
            <span>Logout</span>
          </div>
          <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4 opacity-60" />
        </motion.button>
        <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-3 sm:p-4">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-primary to-primary/80 rounded-lg flex items-center justify-center">
              <span className="text-white font-semibold text-xs sm:text-sm">
                {user?.name ? user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : 'U'}
              </span>
            </div>
            <div>
              <p className="text-xs sm:text-sm font-medium text-slate-900 dark:text-white">
                {user?.name || 'User'}
              </p>
              <p className="text-xs text-slate-600 dark:text-slate-400 capitalize">
                {user?.role === 'user' ? 'Patient' : user?.role || 'User'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )

  return (
    <>
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsMobileMenuOpen(true)}
        className="md:hidden fixed top-4 left-4 z-50 p-2 rounded-lg bg-white dark:bg-slate-800 shadow-lg border border-slate-200 dark:border-slate-700"
      >
        <Menu className="w-5 h-5 text-slate-600 dark:text-slate-300" />
      </motion.button>
      <motion.aside 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="w-72 shrink-0 hidden md:flex flex-col gap-2 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-r border-slate-200/60 dark:border-slate-700/60"
      >
        <SidebarContent />
      </motion.aside>
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="md:hidden fixed inset-0 bg-black/50 z-40"
            />
            <motion.aside
              variants={mobileMenuVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="md:hidden fixed left-0 top-0 h-full w-80 max-w-[85vw] bg-white dark:bg-slate-900 shadow-2xl z-50 border-r border-slate-200 dark:border-slate-700"
            >
              <SidebarContent isMobile={true} />
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
