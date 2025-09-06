import { User } from '../models/User.js'
import { Prescription } from '../models/Prescription.js'
import { Medicine } from '../models/Medicine.js'

export const getDashboardStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments({ role: 'user' })
    const totalDoctors = await User.countDocuments({ 
      role: 'doctor', 
      'professionalInfo.verificationStatus': 'approved' 
    })
    const pendingDoctors = await User.countDocuments({ 
      role: 'doctor', 
      'professionalInfo.verificationStatus': 'pending' 
    })
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    const activeUsers = await User.countDocuments({
      updatedAt: { $gte: thirtyDaysAgo }
    })
    const totalPrescriptions = await Prescription.countDocuments()
    const totalMedicines = await Medicine.countDocuments()

    res.json({
      success: true,
      stats: {
        totalUsers,
        totalDoctors,
        pendingDoctors,
        activeUsers,
        totalPrescriptions,
        totalMedicines,
        systemUptime: '99.9%'
      }
    })
  } catch (error) {
    console.error('Dashboard stats error:', error)
    res.status(500).json({ error: 'server_error', message: 'Failed to fetch dashboard stats' })
  }
}

export const getPendingDoctors = async (req, res) => {
  try {
    const pendingDoctors = await User.find({ 
      role: 'doctor', 
      'professionalInfo.verificationStatus': 'pending' 
    }).select('-password').sort({ createdAt: -1 })

    const doctorsWithDocuments = pendingDoctors.map(doctor => ({
      id: doctor._id,
      name: doctor.name,
      email: doctor.email,
      mobile: doctor.mobile,
      specialization: doctor.professionalInfo?.specialization,
      experience: doctor.professionalInfo?.yearsExperience,
      education: doctor.professionalInfo?.education,
      medicalLicense: doctor.professionalInfo?.medicalLicense,
      hospitalAffiliation: doctor.professionalInfo?.hospitalAffiliation,
      consultationFee: doctor.professionalInfo?.consultationFee,
      documents: doctor.professionalInfo?.documents,
      bio: doctor.professionalInfo?.bio,
      languages: doctor.professionalInfo?.languages,
      timeSlots: doctor.professionalInfo?.timeSlots,
      consultationMode: doctor.professionalInfo?.consultationMode,
      verificationStatus: doctor.professionalInfo?.verificationStatus,
      createdAt: doctor.createdAt
    }))

    res.json({
      success: true,
      doctors: doctorsWithDocuments
    })
  } catch (error) {
    console.error('Pending doctors error:', error)
    res.status(500).json({ error: 'server_error', message: 'Failed to fetch pending doctors' })
  }
}

export const approveDoctor = async (req, res) => {
  try {
    const { doctorId } = req.params

    const doctor = await User.findOneAndUpdate(
      { _id: doctorId, role: 'doctor' },
      { 
        $set: { 
          'professionalInfo.verificationStatus': 'approved',
          doctorApproved: 'approved'
        }
      },
      { new: true }
    ).select('-password')

    if (!doctor) {
      return res.status(404).json({ error: 'doctor_not_found', message: 'Doctor not found' })
    }

    res.json({
      success: true,
      message: 'Doctor approved successfully',
      doctor: {
        id: doctor._id,
        name: doctor.name,
        email: doctor.email,
        verificationStatus: doctor.professionalInfo.verificationStatus
      }
    })
  } catch (error) {
    console.error('Approve doctor error:', error)
    res.status(500).json({ error: 'server_error', message: 'Failed to approve doctor' })
  }
}

export const rejectDoctor = async (req, res) => {
  try {
    const { doctorId } = req.params
    const { rejectionReason } = req.body

    const doctor = await User.findOneAndUpdate(
      { _id: doctorId, role: 'doctor' },
      { 
        $set: { 
          'professionalInfo.verificationStatus': 'rejected',
          'professionalInfo.rejectionReason': rejectionReason,
          doctorApproved: 'rejected'
        }
      },
      { new: true }
    ).select('-password')

    if (!doctor) {
      return res.status(404).json({ error: 'doctor_not_found', message: 'Doctor not found' })
    }

    res.json({
      success: true,
      message: 'Doctor application rejected',
      doctor: {
        id: doctor._id,
        name: doctor.name,
        email: doctor.email,
        verificationStatus: doctor.professionalInfo.verificationStatus,
        rejectionReason: doctor.professionalInfo.rejectionReason
      }
    })
  } catch (error) {
    console.error('Reject doctor error:', error)
    res.status(500).json({ error: 'server_error', message: 'Failed to reject doctor' })
  }
}

export const getRecentActivity = async (req, res) => {
  try {
    const recentUsers = await User.find({ role: 'user' })
      .sort({ createdAt: -1 })
      .limit(3)
      .select('name createdAt')
    const recentDoctors = await User.find({ 
      role: 'doctor', 
      'professionalInfo.verificationStatus': 'approved' 
    })
      .sort({ 'professionalInfo.approvedAt': -1 })
      .limit(2)
      .select('name professionalInfo.specialization professionalInfo.approvedAt')
    const activities = []
    recentUsers.forEach(user => {
      activities.push({
        id: `user_${user._id}`,
        type: 'user_registered',
        message: `New patient registered: ${user.name}`,
        time: formatTimeAgo(user.createdAt),
        status: 'success'
      })
    })
    recentDoctors.forEach(doctor => {
      activities.push({
        id: `doctor_${doctor._id}`,
        type: 'doctor_approved',
        message: `Dr. ${doctor.name} approved as ${doctor.professionalInfo?.specialization}`,
        time: formatTimeAgo(doctor.professionalInfo?.approvedAt || doctor.createdAt),
        status: 'info'
      })
    })
    activities.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
    activities.push({
      id: 'system_1',
      type: 'system_alert',
      message: 'System backup completed successfully',
      time: '2 hours ago',
      status: 'success'
    })

    res.json({
      success: true,
      activities: activities.slice(0, 10) 
    })
  } catch (error) {
    console.error('Recent activity error:', error)
    res.status(500).json({ error: 'server_error', message: 'Failed to fetch recent activity' })
  }
}

const formatTimeAgo = (date) => {
  const now = new Date()
  const diffInSeconds = Math.floor((now - date) / 1000)
  
  if (diffInSeconds < 60) return `${diffInSeconds} seconds ago`
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`
  return `${Math.floor(diffInSeconds / 86400)} days ago`
}

export const getAllUsers = async (req, res) => {
  try {
    const { page = 1, limit = 10, role, search } = req.query
    
    const query = {}
    if (role && role !== 'all') query.role = role
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ]
    }

    const users = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)

    const total = await User.countDocuments(query)

    res.json({
      success: true,
      users,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error('Get users error:', error)
    res.status(500).json({ error: 'server_error', message: 'Failed to fetch users' })
  }
}
