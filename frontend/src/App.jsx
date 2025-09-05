import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { ThemeProvider } from './context/ThemeContext.jsx'
import { AuthProvider, useAuth } from './context/AuthContext.jsx'
import { NotificationProvider } from './context/NotificationContext.jsx'
import Landing from './pages/Landing.jsx'
import { AuthPage } from './pages/Auth.jsx'
import { UserDashboard } from './pages/dashboards/UserDashboard.jsx'
import { DoctorDashboard } from './pages/dashboards/DoctorDashboard.jsx'
import { AdminDashboard } from './pages/dashboards/AdminDashboard.jsx'
import { ChatPage } from './pages/Chat.jsx'
import { AnalyticsPage } from './pages/Analytics.jsx'
import { Prescriptions } from './pages/Prescriptions.jsx'
import { Medicines } from './pages/Medicines.jsx'

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
    <Route path='/dashboard/user' element={<Guard roles={['user']}><UserDashboard /></Guard>} />
    <Route path='/dashboard/user/prescriptions' element={<Guard roles={['user']}><Prescriptions /></Guard>} />
    <Route path='/dashboard/user/medicines' element={<Guard roles={['user']}><Medicines /></Guard>} />
    <Route path='/dashboard/doctor/*' element={<Guard roles={['doctor']}><DoctorDashboard /></Guard>} />
    <Route path='/dashboard/admin/*' element={<Guard roles={['admin']}><AdminDashboard /></Guard>} />
    <Route path='/chat' element={<Guard roles={['user','doctor','admin']}><ChatPage /></Guard>} />
    <Route path='/analytics' element={<Guard roles={['user','doctor','admin']}><AnalyticsPage /></Guard>} />
  </Routes>
</BrowserRouter></NotificationProvider></AuthProvider></ThemeProvider>
