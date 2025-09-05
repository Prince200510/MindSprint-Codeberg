import { Router } from 'express'
import multer from 'multer'
import path from 'path'
import {uploadPrescription,  mockOCR,  createSchedule,  markDose, createPrescription, getPrescriptions, updatePrescription, deletePrescription, markDoseTaken, getDueNotifications} from '../controllers/prescriptionController.js'
import { auth } from '../middleware/auth.js'

const storage = multer.diskStorage({
  destination: (req,file,cb)=> cb(null, 'backend/uploads'),
  filename: (req,file,cb)=> cb(null, Date.now()+'-'+file.originalname.replace(/\s+/g,'_'))
})
const upload = multer({storage})

const r = Router()

r.post('/', auth, createPrescription)
r.get('/', auth, getPrescriptions)
r.put('/:id', auth, updatePrescription)
r.put('/:id/timing', auth, updatePrescription)
r.delete('/:id', auth, deletePrescription)
r.post('/:id/dose-taken', auth, markDoseTaken)
r.get('/notifications', auth, getDueNotifications)
r.post('/upload', auth, upload.single('file'), uploadPrescription)
r.post('/:id/ocr', auth, mockOCR)
r.post('/schedule', auth, createSchedule)
r.post('/dose', auth, markDose)

export default r
