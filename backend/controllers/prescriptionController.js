import { Prescription } from '../models/Prescription.js'
import { Schedule } from '../models/Schedule.js'
import fs from 'fs'
import path from 'path'

export const uploadPrescription = async (req,res) => {
  if(!req.file) return res.status(400).json({error:'no_file'})
  const p = await Prescription.create({
    userId: req.user.id,
    originalName: req.file.originalname,
    filePath: req.file.path,
    parsedData: { medicines: [], notes: 'mock_ocr_pending_review' }
  })
  res.json(p)
}

export const mockOCR = async (req,res) => {
  const { id } = req.params
  const p = await Prescription.findById(id)
  if(!p) return res.status(404).json({error:'not_found'})
  p.parsedData = { medicines: [{ name:'Amoxicillin', dosage:'500mg', frequency:'3x daily'}], notes:'mock_ai_result' }
  await p.save()
  res.json(p)
}

export const createPrescription = async (req, res) => {
  try {
    const {
      medicineName,
      dosage,
      frequency,
      duration,
      specialInstructions,
      beforeAfterFood,
      withWater,
      avoidAlcohol,
      startDate,
      times,
      totalDoses
    } = req.body

    if (!medicineName || !dosage || !frequency || !duration || !totalDoses) {
      return res.status(400).json({
        error: 'missing_fields',
        message: 'Medicine name, dosage, frequency, duration, and total doses are required'
      })
    }

    const prescriptionStartDate = startDate ? new Date(startDate) : new Date()

    let endDate = null
    if (duration) {
      const start = new Date(prescriptionStartDate)
      const durationMatch = duration.match(/(\d+)\s*(day|days|week|weeks|month|months)/i)
      if (durationMatch) {
        const amount = parseInt(durationMatch[1])
        const unit = durationMatch[2].toLowerCase()
        
        endDate = new Date(start)
        if (unit.includes('day')) {
          endDate.setDate(endDate.getDate() + amount)
        } else if (unit.includes('week')) {
          endDate.setDate(endDate.getDate() + (amount * 7))
        } else if (unit.includes('month')) {
          endDate.setMonth(endDate.getMonth() + amount)
        }
      }
    }

    const prescription = await Prescription.create({
      userId: req.user.id,
      medicineName,
      dosage,
      frequency,
      duration,
      specialInstructions,
      beforeAfterFood: beforeAfterFood || 'after',
      withWater: withWater !== undefined ? withWater : true,
      avoidAlcohol: avoidAlcohol || false,
      startDate: prescriptionStartDate,
      endDate,
      times: times || [],
      totalDoses: parseInt(totalDoses)
    })

    res.status(201).json({
      success: true,
      message: 'Prescription created successfully',
      prescription
    })

  } catch (error) {
    console.error('Create prescription error:', error)
    res.status(500).json({
      error: 'server_error',
      message: 'Failed to create prescription'
    })
  }
}

export const getPrescriptions = async (req, res) => {
  try {
    console.log('Getting prescriptions for user ID:', req.user.id)
    
    const prescriptions = await Prescription.find({ 
      userId: req.user.id,
      $or: [
        { medicineName: { $exists: true } }, 
        { originalName: { $exists: true } }   
      ]
    })
    .sort({ createdAt: -1 })
    .populate('doctorId', 'name specialization')

    console.log('Found prescriptions:', prescriptions.length)
    console.log('Prescription details:', prescriptions.map(p => ({ 
      id: p._id, 
      medicineName: p.medicineName, 
      userId: p.userId 
    })))

    res.json({
      success: true,
      prescriptions
    })

  } catch (error) {
    console.error('Get prescriptions error:', error)
    res.status(500).json({
      error: 'server_error',
      message: 'Failed to fetch prescriptions'
    })
  }
}

export const updatePrescription = async (req, res) => {
  try {
    const { id } = req.params
    const updates = req.body

    const prescription = await Prescription.findOne({
      _id: id,
      userId: req.user.id
    })

    if (!prescription) {
      return res.status(404).json({
        error: 'not_found',
        message: 'Prescription not found'
      })
    }

    const allowedUpdates = [
      'medicineName', 'dosage', 'frequency', 'duration', 'specialInstructions',
      'beforeAfterFood', 'withWater', 'avoidAlcohol', 'times', 'totalDoses', 'active'
    ]

    allowedUpdates.forEach(field => {
      if (updates[field] !== undefined) {
        prescription[field] = updates[field]
      }
    })

    await prescription.save()

    res.json({
      success: true,
      message: 'Prescription updated successfully',
      prescription
    })

  } catch (error) {
    console.error('Update prescription error:', error)
    res.status(500).json({
      error: 'server_error',
      message: 'Failed to update prescription'
    })
  }
}

export const deletePrescription = async (req, res) => {
  try {
    const { id } = req.params

    const prescription = await Prescription.findOneAndDelete({
      _id: id,
      userId: req.user.id
    })

    if (!prescription) {
      return res.status(404).json({
        error: 'not_found',
        message: 'Prescription not found'
      })
    }

    res.json({
      success: true,
      message: 'Prescription deleted successfully'
    })

  } catch (error) {
    console.error('Delete prescription error:', error)
    res.status(500).json({
      error: 'server_error',
      message: 'Failed to delete prescription'
    })
  }
}

export const markDoseTaken = async (req, res) => {
  try {
    const { id } = req.params
    const { time, notes } = req.body

    const prescription = await Prescription.findOne({
      _id: id,
      userId: req.user.id
    })

    if (!prescription) {
      return res.status(404).json({
        error: 'not_found',
        message: 'Prescription not found'
      })
    }

    prescription.doseLogs.push({
      date: new Date(),
      time: time || new Date().toTimeString().split(' ')[0].substring(0, 5),
      taken: true,
      notes: notes || ''
    })

    prescription.takenDoses = Math.min(prescription.takenDoses + 1, prescription.totalDoses)

    if (prescription.takenDoses >= prescription.totalDoses) {
      prescription.active = false
    }

    await prescription.save()

    res.json({
      success: true,
      message: 'Dose marked as taken',
      prescription
    })

  } catch (error) {
    console.error('Mark dose taken error:', error)
    res.status(500).json({
      error: 'server_error',
      message: 'Failed to mark dose as taken'
    })
  }
}

export const getDueNotifications = async (req, res) => {
  try {
    const now = new Date()
    const reminderTime = new Date(now.getTime() + 15 * 60 * 1000) // 15 minutes from now

    const prescriptions = await Prescription.find({
      userId: req.user.id,
      active: true,
      'notifications.enabled': true,
      times: { $exists: true, $ne: [] }
    })

    const dueNotifications = []

    prescriptions.forEach(prescription => {
      prescription.times.forEach(time => {
        const [hours, minutes] = time.split(':').map(Number)
        const doseTime = new Date()
        doseTime.setHours(hours, minutes, 0, 0)

        if (Math.abs(doseTime.getTime() - now.getTime()) <= prescription.notifications.reminderMinutes * 60 * 1000) {
          dueNotifications.push({
            prescriptionId: prescription._id,
            medicineName: prescription.medicineName,
            dosage: prescription.dosage,
            time: time,
            doseTime: doseTime,
            message: `Time to take your ${prescription.medicineName} (${prescription.dosage})`
          })
        }
      })
    })

    res.json({
      success: true,
      notifications: dueNotifications
    })

  } catch (error) {
    console.error('Get notifications error:', error)
    res.status(500).json({
      error: 'server_error',
      message: 'Failed to get notifications'
    })
  }
}

export const createSchedule = async (req,res) => {
  const { prescriptionId, medicineName, times, startDate, endDate } = req.body
  if(!medicineName||!times?.length) return res.status(400).json({error:'missing_fields'})
  const schedule = await Schedule.create({
    user: req.user.id,
    prescription: prescriptionId,
    medicineName,
    doses: times.map(t=>({time:t})),
    startDate: startDate? new Date(startDate): new Date(),
    endDate: endDate? new Date(endDate): null
  })
  res.json(schedule)
}

export const markDose = async (req,res) => {
  const { scheduleId, index, taken } = req.body
  const schedule = await Schedule.findOne({_id:scheduleId, user:req.user.id})
  if(!schedule) return res.status(404).json({error:'not_found'})
  const dose = schedule.doses[index]
  if(!dose) return res.status(400).json({error:'invalid_dose'})
  dose.taken = taken
  dose.takenAt = taken? new Date(): null
  await schedule.save()
  res.json(schedule)
}
