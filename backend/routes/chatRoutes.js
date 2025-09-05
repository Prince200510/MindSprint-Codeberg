import { Router } from 'express'
import { getMessages } from '../controllers/chatController.js'
import { auth } from '../middleware/auth.js'
const r = Router()
r.get('/:room', auth, getMessages)
export default r
