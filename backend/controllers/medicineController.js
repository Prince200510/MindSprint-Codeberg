import { Medicine } from '../models/Medicine.js'

export const createMedicine = async (req, res) => {
  try {
    const {name, dosage, frequency, duration, specialInstructions, beforeAfterFood, withWater, avoidAlcohol, startDate, totalDoses, active} = req.body

    if (!name || !dosage || !frequency || !duration) {
      return res.status(400).json({
        error: 'missing_fields',
        message: 'Medicine name, dosage, frequency, and duration are required'
      })
    }

    const medicineStartDate = startDate ? new Date(startDate) : new Date()

    let endDate = null
    if (duration) {
      const start = new Date(medicineStartDate)
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

    const medicine = await Medicine.create({
      userId: req.user.id,
      name,
      dosage,
      frequency,
      duration,
      specialInstructions,
      beforeAfterFood: beforeAfterFood || 'after',
      withWater: withWater !== undefined ? withWater : true,
      avoidAlcohol: avoidAlcohol || false,
      startDate: medicineStartDate,
      endDate,
      totalDoses: totalDoses ? parseInt(totalDoses) : undefined,
      active: active !== undefined ? active : true
    })

    res.status(201).json({
      success: true,
      message: 'Medicine created successfully',
      medicine
    })

  } catch (error) {
    console.error('Create medicine error:', error)
    res.status(500).json({
      error: 'server_error',
      message: 'Failed to create medicine'
    })
  }
}

export const getMedicines = async (req, res) => {
  try {
    console.log('Getting medicines for user ID:', req.user.id)
    
    const medicines = await Medicine.find({ 
      userId: req.user.id
    })
    .sort({ createdAt: -1 })

    console.log('Found medicines:', medicines.length)
    console.log('Medicine details:', medicines.map(m => ({ 
      id: m._id, 
      name: m.name, 
      userId: m.userId 
    })))

    res.json({
      success: true,
      medicines
    })

  } catch (error) {
    console.error('Get medicines error:', error)
    res.status(500).json({
      error: 'server_error',
      message: 'Failed to fetch medicines'
    })
  }
}

export const updateMedicine = async (req, res) => {
  try {
    const { id } = req.params
    const updates = req.body

    const medicine = await Medicine.findOne({
      _id: id,
      userId: req.user.id
    })

    if (!medicine) {
      return res.status(404).json({
        error: 'not_found',
        message: 'Medicine not found'
      })
    }

    const allowedUpdates = [
      'name', 'dosage', 'frequency', 'duration', 'specialInstructions',
      'beforeAfterFood', 'withWater', 'avoidAlcohol', 'totalDoses', 'active',
      'startDate', 'takenDoses'
    ]

    allowedUpdates.forEach(field => {
      if (updates[field] !== undefined) {
        if (field === 'totalDoses' && updates[field]) {
          medicine[field] = parseInt(updates[field])
        } else {
          medicine[field] = updates[field]
        }
      }
    })

    if (updates.duration && updates.startDate) {
      const start = new Date(updates.startDate)
      const durationMatch = updates.duration.match(/(\d+)\s*(day|days|week|weeks|month|months)/i)
      if (durationMatch) {
        const amount = parseInt(durationMatch[1])
        const unit = durationMatch[2].toLowerCase()
        
        let endDate = new Date(start)
        if (unit.includes('day')) {
          endDate.setDate(endDate.getDate() + amount)
        } else if (unit.includes('week')) {
          endDate.setDate(endDate.getDate() + (amount * 7))
        } else if (unit.includes('month')) {
          endDate.setMonth(endDate.getMonth() + amount)
        }
        medicine.endDate = endDate
      }
    }

    await medicine.save()

    res.json({
      success: true,
      message: 'Medicine updated successfully',
      medicine
    })

  } catch (error) {
    console.error('Update medicine error:', error)
    res.status(500).json({
      error: 'server_error',
      message: 'Failed to update medicine'
    })
  }
}

export const deleteMedicine = async (req, res) => {
  try {
    const { id } = req.params

    const medicine = await Medicine.findOneAndDelete({
      _id: id,
      userId: req.user.id
    })

    if (!medicine) {
      return res.status(404).json({
        error: 'not_found',
        message: 'Medicine not found'
      })
    }

    res.json({
      success: true,
      message: 'Medicine deleted successfully'
    })

  } catch (error) {
    console.error('Delete medicine error:', error)
    res.status(500).json({
      error: 'server_error',
      message: 'Failed to delete medicine'
    })
  }
}
