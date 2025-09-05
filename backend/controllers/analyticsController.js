import { Schedule } from '../models/Schedule.js'
import { User } from '../models/User.js'

export const adherenceStats = async (req,res) => {
  const schedules = await Schedule.find({user:req.user._id})
  let total=0,taken=0
  schedules.forEach(s=>{ s.doses.forEach(d=>{ total++; if(d.taken) taken++ }) })
  const rate = total? (taken/total*100).toFixed(1): '0'
  res.json({ totalDoses: total, taken, missed: total-taken, adherenceRate: Number(rate) })
}

export const platformStats = async (req,res) => {
  const users = await User.countDocuments()
  const doctors = await User.countDocuments({role:'doctor'})
  const approvedDoctors = await User.countDocuments({role:'doctor', doctorApproved:true})
  res.json({ users, doctors, approvedDoctors })
}
