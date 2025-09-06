import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { ThemeProvider } from './context/ThemeContext.jsx'
import { AuthProvider, useAuth } from './context/AuthContext.jsx'
import { NotificationProvider } from './context/NotificationContext.jsx'
import Landing from './pages/Landing.jsx'
import { AuthPage } from './pages/Auth.jsx'
import { UserDashboard } from './pages/dashboards/UserDashboard.jsx'
import { DoctorDashboard } from './pages/dashboards/DoctorDashboard.jsx'
import { DoctorRegistration } from './pages/dashboards/DoctorRegistration.jsx'
import { AdminDashboard } from './pages/dashboards/AdminDashboard.jsx'
import { AnalyticsPage } from './pages/Analytics.jsx'
import { Prescriptions } from './pages/Prescriptions.jsx'
import { Medicines } from './pages/Medicines.jsx'
import { Schedule } from './pages/Schedule.jsx'
import { Settings } from './pages/Settings.jsx'
import { AvailableDoctors } from './pages/AvailableDoctors.jsx'
import { UserAppointments } from './pages/UserAppointments.jsx'
import { Diet } from './pages/Diet.jsx'
import { Community } from './pages/Community.jsx'

const Guard = ({children, roles}) => {
  const {user} = useAuth()
  if(!user) return <AuthPage />
  if(roles && !roles.includes(user.role)) return <div className='min-h-screen flex items-center justify-center bg-slate-100 dark:bg-slate-900'>
    <div className='text-center p-10 bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700'>
      <h2 className='text-2xl font-bold text-red-600 mb-4'>Access Denied</h2>
      <p className='text-slate-600 dark:text-slate-400'>You don't have permission to access this area.</p>
    </div>
  </div>
  if(user.role==='doctor' && roles?.includes('doctor') && !user.doctorApproved) return <div className='min-h-screen flex items-center justify-center bg-slate-100 dark:bg-slate-900'>
    <div className='text-center p-10 bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700'>
      <h2 className='text-2xl font-bold text-yellow-600 mb-4'>Awaiting Approval</h2>
      <p className='text-slate-600 dark:text-slate-400'>Your doctor account is pending approval from an administrator.</p>
    </div>
  </div>
  return children
}

export const App = () => <ThemeProvider><AuthProvider><NotificationProvider><BrowserRouter>
  <Routes>
    <Route path='/' element={<Landing />} />
    <Route path='/auth' element={<AuthPage />} />
    <Route path='/auth/login' element={<AuthPage mode='login' />} />
    <Route path='/auth/register' element={<AuthPage mode='register' />} />
    <Route path='/doctor-register' element={<DoctorRegistration />} />
    <Route path='/dashboard/user' element={<Guard roles={['user']}><UserDashboard /></Guard>} />
    <Route path='/dashboard/user/doctors' element={<Guard roles={['user']}><AvailableDoctors /></Guard>} />
    <Route path='/dashboard/user/appointments' element={<Guard roles={['user']}><UserAppointments /></Guard>} />
    <Route path='/dashboard/user/prescriptions' element={<Guard roles={['user']}><Prescriptions /></Guard>} />
    <Route path='/dashboard/user/medicines' element={<Guard roles={['user']}><Medicines /></Guard>} />
    <Route path='/dashboard/user/diet' element={<Guard roles={['user']}><Diet /></Guard>} />
    <Route path='/dashboard/user/community' element={<Guard roles={['user']}><Community /></Guard>} />
    <Route path='/dashboard/user/schedule' element={<Guard roles={['user']}><Schedule /></Guard>} />
    <Route path='/dashboard/user/analytics' element={<Guard roles={['user']}><AnalyticsPage /></Guard>} />
    <Route path='/dashboard/user/settings' element={<Guard roles={['user']}><Settings /></Guard>} />
    <Route path='/dashboard/doctor/*' element={<Guard roles={['doctor']}><DoctorDashboard /></Guard>} />
    <Route path='/dashboard/admin/*' element={<Guard roles={['admin']}><AdminDashboard /></Guard>} />
    <Route path='/analytics' element={<Guard roles={['user','doctor','admin']}><AnalyticsPage /></Guard>} />
  </Routes>
</BrowserRouter></NotificationProvider></AuthProvider></ThemeProvider>
