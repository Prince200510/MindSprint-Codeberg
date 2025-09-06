import { Schedule } from '../models/Schedule.js'
import { User } from '../models/User.js'
import { Prescription } from '../models/Prescription.js'

export const adherenceStats = async (req,res) => {
  try {
    const prescriptions = await Prescription.find({ userId: req.user._id })
    let totalDoses = 0, takenDoses = 0
    
    prescriptions.forEach(p => {
      totalDoses += p.totalDoses || 0
      takenDoses += p.takenDoses || 0
    })
    
    const adherenceRate = totalDoses > 0 ? ((takenDoses / totalDoses) * 100).toFixed(1) : '0'
    
    res.json({ 
      totalDoses, 
      taken: takenDoses, 
      missed: totalDoses - takenDoses, 
      adherenceRate: Number(adherenceRate) 
    })
  } catch (error) {
    console.error('Adherence stats error:', error)
    res.status(500).json({ error: error.message })
  }
}

export const userDashboardStats = async (req, res) => {
  try {
    const userId = req.user._id
    const allPrescriptions = await Prescription.find({ userId }).sort({ createdAt: -1 })
    const activePrescriptions = allPrescriptions.filter(p => p.active === true)
    const totalPrescriptions = activePrescriptions.length
    const completedPrescriptions = allPrescriptions.filter(p => {
      return p.totalDoses && p.takenDoses >= p.totalDoses
    }).length
    const expiredPrescriptions = allPrescriptions.filter(p => {
      return p.endDate && new Date(p.endDate) < new Date()
    }).length
    let totalDoses = 0, takenDoses = 0
    allPrescriptions.forEach(p => {
      totalDoses += p.totalDoses || 0
      takenDoses += p.takenDoses || 0
    })
    const overallAdherence = totalDoses > 0 ? ((takenDoses / totalDoses) * 100).toFixed(1) : 0
    const dailyStats = []
    for (let i = 29; i >= 0; i--) {
      const date = new Date()
      date.setDate(date.getDate() - i)
      const dateStr = date.toISOString().split('T')[0]
      let dayTaken = 0, dayMissed = 0
      allPrescriptions.forEach(prescription => {
        if (prescription.doseLogs && prescription.doseLogs.length > 0) {
          prescription.doseLogs.forEach(log => {
            const logDate = new Date(log.date).toISOString().split('T')[0]
            if (logDate === dateStr) {
              if (log.taken) {
                dayTaken++
              } else {
                dayMissed++
              }
            }
          })
        }
      })
      const dayTotal = dayTaken + dayMissed
      dailyStats.push({
        date: dateStr,
        taken: dayTaken,
        missed: dayMissed,
        total: dayTotal,
        adherenceRate: dayTotal > 0 ? ((dayTaken / dayTotal) * 100).toFixed(1) : 0
      })
    }
    const medicineStats = activePrescriptions.map(p => {
      const completionRate = p.totalDoses > 0 ? Math.round((p.takenDoses / p.totalDoses) * 100) : 0
      let nextDose = null
      if (p.times && p.times.length > 0 && p.active) {
        const now = new Date()
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
        
        for (const time of p.times.sort()) {
          const [hours, minutes] = time.split(':').map(Number)
          const doseTime = new Date(today.getTime())
          doseTime.setHours(hours, minutes, 0, 0)
          
          if (doseTime > now) {
            nextDose = doseTime.toISOString()
            break
          }
        }
        if (!nextDose && p.times.length > 0) {
          const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000)
          const [hours, minutes] = p.times.sort()[0].split(':').map(Number)
          tomorrow.setHours(hours, minutes, 0, 0)
          nextDose = tomorrow.toISOString()
        }
      }
      
      return {
        name: p.medicineName,
        totalDoses: p.totalDoses || 0,
        takenDoses: p.takenDoses || 0,
        completionRate,
        frequency: p.frequency,
        nextDose
      }
    })
    
    res.json({
      overview: {
        totalPrescriptions,
        completedPrescriptions,
        expiredPrescriptions,
        activePrescriptions: totalPrescriptions,
        overallAdherence: Number(overallAdherence)
      },
      dailyStats,
      medicineStats,
      streakData: calculateStreak(dailyStats)
    })
  } catch (error) {
    console.error('Dashboard stats error:', error)
    res.status(500).json({ error: error.message })
  }
}

export const medicineInsights = async (req, res) => {
  try {
    const userId = req.user._id
    const prescriptions = await Prescription.find({ userId }).sort({ createdAt: -1 })

    const medicineFrequency = {}
    const categoryAnalysis = {}
    
    prescriptions.forEach(p => {
      medicineFrequency[p.medicineName] = (medicineFrequency[p.medicineName] || 0) + 1
      if (p.frequency) {
        categoryAnalysis[p.frequency] = (categoryAnalysis[p.frequency] || 0) + 1
      }
    })
    
    const timeSlotMissed = {
      'Morning (6-12)': 0,
      'Afternoon (12-18)': 0,
      'Evening (18-24)': 0,
      'Night (24-6)': 0
    }
    
    prescriptions.forEach(prescription => {
      if (prescription.doseLogs && prescription.doseLogs.length > 0) {
        prescription.doseLogs.forEach(log => {
          if (!log.taken && log.time) {
            const hour = parseInt(log.time.split(':')[0])
            if (hour >= 6 && hour < 12) timeSlotMissed['Morning (6-12)']++
            else if (hour >= 12 && hour < 18) timeSlotMissed['Afternoon (12-18)']++
            else if (hour >= 18 && hour < 24) timeSlotMissed['Evening (18-24)']++
            else timeSlotMissed['Night (24-6)']++
          }
        })
      }
    })
    
    res.json({
      medicineFrequency,
      categoryAnalysis,
      timeSlotMissed,
      totalMedicines: Object.keys(medicineFrequency).length
    })
  } catch (error) {
    console.error('Medicine insights error:', error)
    res.status(500).json({ error: error.message })
  }
}

function calculateStreak(dailyStats) {
  let currentStreak = 0
  let maxStreak = 0
  let tempStreak = 0
  for (let i = dailyStats.length - 1; i >= 0; i--) {
    const adherenceRate = parseFloat(dailyStats[i].adherenceRate)
    if (adherenceRate >= 80) { 
      tempStreak++
      if (i === dailyStats.length - 1) currentStreak = tempStreak
    } else {
      tempStreak = 0
    }
    maxStreak = Math.max(maxStreak, tempStreak)
  }
  
  return {
    current: currentStreak,
    longest: maxStreak
  }
}

export const platformStats = async (req,res) => {
  try {
    const users = await User.countDocuments()
    const doctors = await User.countDocuments({role:'doctor'})
    const approvedDoctors = await User.countDocuments({role:'doctor', doctorApproved:'approved'})
    res.json({ users, doctors, approvedDoctors })
  } catch (error) {
    console.error('Platform stats error:', error)
    res.status(500).json({ error: error.message })
  }
}
