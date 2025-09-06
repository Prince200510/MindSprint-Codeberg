import { Router } from 'express'
import { register, login, me, getProfile, updateProfile } from '../controllers/authController.js'
import { doctorRegister, upload } from '../controllers/doctorController.js'
import { auth } from '../middleware/auth.js'

const r = Router()
r.post('/register', register)
r.post('/login', login)
r.post('/doctor-register', upload.fields([
  { name: 'licenseProof', maxCount: 1 },
  { name: 'governmentId', maxCount: 1 },
  { name: 'profilePhoto', maxCount: 1 }
]), doctorRegister)
r.get('/me', auth, me)
r.get('/profile', auth, getProfile)
r.put('/update-profile', auth, updateProfile)

export default r
