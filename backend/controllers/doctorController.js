import { User } from '../models/User.js'

export const listDoctors = async (req,res) => {
  const doctors = await User.find({role:'doctor'}).select('-password')
  res.json(doctors)
}

export const approveDoctor = async (req,res) => {
  const { id } = req.params
  const doctor = await User.findOne({_id:id, role:'doctor'})
  if(!doctor) return res.status(404).json({error:'not_found'})
  doctor.doctorApproved = true
  await doctor.save()
  res.json({success:true})
}

export const rejectDoctor = async (req,res) => {
  const { id } = req.params
  const doctor = await User.findOne({_id:id, role:'doctor'})
  if(!doctor) return res.status(404).json({error:'not_found'})
  await doctor.deleteOne()
  res.json({success:true})
}
