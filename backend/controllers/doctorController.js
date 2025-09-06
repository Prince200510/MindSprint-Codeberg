import { User } from '../models/User.js'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import multer from 'multer'
import path from 'path'

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    let uploadPath = 'uploads/'
    
    if (file.fieldname === 'profilePhoto') {
      uploadPath += 'profiles/'
    } else if (file.fieldname === 'licenseProof') {
      uploadPath += 'licenses/'
    } else if (file.fieldname === 'governmentId') {
      uploadPath += 'ids/'
    }
    
    cb(null, uploadPath)
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname))
  }
})

export const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|pdf/
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase())
    const mimetype = allowedTypes.test(file.mimetype)
    
    if (extname && mimetype) {
      return cb(null, true)
    } else {
      cb(new Error('Only images and PDF files are allowed'))
    }
  }
})

export const doctorRegister = async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      email,
      phone,
      password,
      medicalLicense,
      specialization,
      yearsExperience,
      education,
      hospitalAffiliation,
      consultationFee,
      timeSlots,
      consultationMode,
      languages,
      bio
    } = req.body

    const existingDoctor = await User.findOne({ email })
    if (existingDoctor) {
      return res.status(400).json({ message: 'Doctor already exists with this email' })
    }

    const doctorData = {
      name: `${firstName} ${lastName}`,
      email,
      mobile: phone,
      password, 
      role: 'doctor',
      isVerified: false, 
      doctorApproved: 'pending', 
      professionalInfo: {
        medicalLicense,
        specialization,
        yearsExperience: parseInt(yearsExperience),
        education,
        hospitalAffiliation,
        consultationFee: consultationFee ? parseFloat(consultationFee) : 0,
        timeSlots: JSON.parse(timeSlots || '[]'),
        consultationMode: JSON.parse(consultationMode || '[]'),
        languages: JSON.parse(languages || '[]'),
        bio,
        verificationStatus: 'pending',
        isAvailable: false,
        documents: {}
      }
    }

    if (req.files) {
      if (req.files.licenseProof) {
        doctorData.professionalInfo.documents.licenseProof = req.files.licenseProof[0].path.replace(/\\/g, '/')
      }
      if (req.files.governmentId) {
        doctorData.professionalInfo.documents.governmentId = req.files.governmentId[0].path.replace(/\\/g, '/')
      }
      if (req.files.profilePhoto) {
        doctorData.professionalInfo.documents.profilePhoto = req.files.profilePhoto[0].path.replace(/\\/g, '/')
      }
    }
    const doctor = new User(doctorData)
    await doctor.save()
    res.status(201).json({
      message: 'Doctor registration submitted successfully! Please wait for admin verification.',
      doctorId: doctor._id
    })
  } catch (error) {
    console.error('Doctor registration error:', error)
    res.status(500).json({ message: 'Server error during registration' })
  }
}

export const getDoctorDashboard = async (req, res) => {
  try {
    const doctorId = req.user.userId
    const doctor = await User.findById(doctorId)
    if (!doctor || doctor.role !== 'doctor') {
      return res.status(404).json({ message: 'Doctor not found' })
    }
    let doctorStatus = doctor.doctorApproved || 'pending' 
    const response = {
      doctorStatus,
      rejectionReason: doctor.professionalInfo?.rejectionReason || null
    }
    if (doctorStatus !== 'approved') {
      return res.json(response)
    }
    const dashboardData = {
      ...response,
      stats: {
        todayAppointments: 8,
        totalPatients: 156,
        pendingConsultations: 5,
        monthlyEarnings: 45000,
        completedConsultations: 120,
        avgRating: 4.7
      },
      recentAppointments: [
        {
          id: 1,
          name: 'John Doe',
          age: 32,
          lastVisit: 'Today',
          condition: 'Hypertension Follow-up',
          status: 'completed'
        },
        {
          id: 2,
          name: 'Sarah Smith',
          age: 28,
          lastVisit: 'Yesterday',
          condition: 'Routine Checkup',
          status: 'completed'
        }
      ],
      todaySchedule: [
        {
          id: 1,
          patientName: 'Michael Johnson',
          consultationType: 'Video Consultation',
          time: '10:00 AM'
        },
        {
          id: 2,
          patientName: 'Emma Davis',
          consultationType: 'In-Person',
          time: '2:00 PM'
        }
      ],
      notifications: [
        {
          message: 'New appointment request from John Doe',
          time: '2 hours ago'
        },
        {
          message: 'Prescription review needed for Sarah Smith',
          time: '4 hours ago'
        }
      ]
    }

    res.json(dashboardData)
  } catch (error) {
    console.error('Error fetching doctor dashboard:', error)
    res.status(500).json({ message: 'Failed to fetch dashboard data' })
  }
}

export const getDoctorProfile = async (req, res) => {
  try {
    const doctor = await User.findById(req.user.userId).select('-password')
    
    if (!doctor) {
      return res.status(404).json({ message: 'Doctor not found' })
    }

    res.json(doctor)
  } catch (error) {
    console.error('Error fetching doctor profile:', error)
    res.status(500).json({ message: 'Failed to fetch profile' })
  }
}

export const updateDoctorProfile = async (req, res) => {
  try {
    const doctorId = req.user.userId
    const updates = req.body

    const doctor = await User.findByIdAndUpdate(
      doctorId,
      { $set: updates },
      { new: true, runValidators: true }
    ).select('-password')

    res.json({ message: 'Profile updated successfully', doctor })
  } catch (error) {
    console.error('Error updating doctor profile:', error)
    res.status(500).json({ message: 'Failed to update profile' })
  }
}

export const listDoctors = async (req,res) => {
  const doctors = await User.find({role:'doctor'}).select('-password')
  res.json(doctors)
}

export const getPendingDoctors = async (req, res) => {
  try {
    const pendingDoctors = await User.find({
      role: 'doctor',
      doctorApproved: 'pending' 
    }).select('-password -otp -otpExpiry').sort({ createdAt: -1 })

    res.json({
      success: true,
      doctors: pendingDoctors
    })
  } catch (error) {
    console.error('Error fetching pending doctors:', error)
    res.status(500).json({ error: 'server_error', message: 'Failed to fetch pending doctors' })
  }
}

export const approveDoctor = async (req,res) => {
  try {
    const { id } = req.params
    const doctor = await User.findOne({_id:id, role:'doctor'})
    if(!doctor) return res.status(404).json({error:'not_found'})
    
    doctor.doctorApproved = 'approved' 
    doctor.professionalInfo.verificationStatus = 'approved'
    doctor.professionalInfo.rejectionReason = undefined 
    await doctor.save()
    
    res.json({success:true, message: 'Doctor approved successfully'})
  } catch (error) {
    console.error('Error approving doctor:', error)
    res.status(500).json({ error: 'server_error', message: 'Failed to approve doctor' })
  }
}

export const rejectDoctor = async (req,res) => {
  try {
    const { id } = req.params
    const { reason } = req.body 
    
    const doctor = await User.findOne({_id:id, role:'doctor'})
    if(!doctor) return res.status(404).json({error:'not_found'})
    
    doctor.doctorApproved = 'rejected' 
    doctor.professionalInfo.verificationStatus = 'rejected'
    doctor.professionalInfo.rejectionReason = reason || 'Application rejected by admin'
    await doctor.save()
    
    res.json({success:true, message: 'Doctor application rejected'})
  } catch (error) {
    console.error('Error rejecting doctor:', error)
    res.status(500).json({ error: 'server_error', message: 'Failed to reject doctor' })
  }
}
