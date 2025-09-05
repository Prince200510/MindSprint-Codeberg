import { Router } from 'express'
import { register, login, me, getProfile, updateProfile } from '../controllers/authController.js'
import { auth } from '../middleware/auth.js'

const r = Router()
r.post('/register', register)
r.post('/login', login)
r.get('/me', auth, me)
r.get('/profile', auth, getProfile)
r.put('/update-profile', auth, updateProfile)

export default r
