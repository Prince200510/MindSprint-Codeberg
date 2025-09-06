import { Router } from 'express'
import { 
  adherenceStats, 
  platformStats, 
  userDashboardStats, 
  medicineInsights,
  getUserGrowthData,
  getUserDistributionData,
  getSystemHealthData
} from '../controllers/analyticsController.js'
import { auth, requireRoles } from '../middleware/auth.js'
const r = Router()
r.get('/adherence', auth, adherenceStats)
r.get('/dashboard', auth, userDashboardStats)
r.get('/insights', auth, medicineInsights)
r.get('/platform', auth, requireRoles('admin'), platformStats)
r.get('/admin/user-growth', auth, requireRoles('admin'), getUserGrowthData)
r.get('/admin/user-distribution', auth, requireRoles('admin'), getUserDistributionData)
r.get('/admin/system-health', auth, requireRoles('admin'), getSystemHealthData)

export default r
