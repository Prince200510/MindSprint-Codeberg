import { Router } from 'express'
import { getProfile,  updateProfile,  generateOTP,  verifyOTP,  changePassword, addEmergencyContact, removeEmergencyContact} from '../controllers/settingsController.js'
import { auth } from '../middleware/auth.js'

const router = Router()
router.use(auth)
router.get('/profile', getProfile)
router.put('/profile', updateProfile)
router.post('/generate-otp', generateOTP)
router.post('/verify-otp', verifyOTP)
router.post('/change-password', changePassword)
router.post('/emergency-contacts', addEmergencyContact)
router.delete('/emergency-contacts/:contactId', removeEmergencyContact)

export default router
