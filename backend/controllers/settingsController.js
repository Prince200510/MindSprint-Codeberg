import { User } from '../models/User.js'
import crypto from 'crypto'

export const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password -otp.code')
    if (!user) {
      return res.status(404).json({
        error: 'user_not_found',
        message: 'User not found'
      })
    }

    res.json({
      success: true,
      user
    })
  } catch (error) {
    console.error('Get profile error:', error)
    res.status(500).json({
      error: 'server_error',
      message: 'Failed to get profile'
    })
  }
}

export const updateProfile = async (req, res) => {
  try {
    const {name, email, mobile, emergencyContacts, profile} = req.body
    const updateData = {}

    if (name) updateData.name = name
    if (email) updateData.email = email
    if (mobile) updateData.mobile = mobile
    if (emergencyContacts) updateData.emergencyContacts = emergencyContacts
    if (profile) updateData.profile = { ...req.user.profile, ...profile }

    const user = await User.findByIdAndUpdate(
      req.user.id,
      updateData,
      { new: true, runValidators: true }
    ).select('-password -otp.code')

    if (!user) {
      return res.status(404).json({
        error: 'user_not_found',
        message: 'User not found'
      })
    }

    res.json({
      success: true,
      message: 'Profile updated successfully',
      user
    })
  } catch (error) {
    console.error('Update profile error:', error)
    
    if (error.code === 11000) {
      return res.status(400).json({
        error: 'email_exists',
        message: 'Email already exists'
      })
    }

    res.status(500).json({
      error: 'server_error',
      message: 'Failed to update profile'
    })
  }
}

export const generateOTP = async (req, res) => {
  try {
    const { email } = req.body
    
    if (!email) {
      return res.status(400).json({
        error: 'email_required',
        message: 'Email is required'
      })
    }

    // Generate 6-digit OTP
    const otpCode = crypto.randomInt(100000, 999999).toString()
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000) // 5 minutes

    const user = await User.findById(req.user.id)
    if (!user) {
      return res.status(404).json({
        error: 'user_not_found',
        message: 'User not found'
      })
    }

    if (user.doctorApproved && !['pending', 'approved', 'rejected'].includes(user.doctorApproved)) {
      if (user.doctorApproved === 'true' || user.doctorApproved === true) {
        user.doctorApproved = 'approved'
      } else if (user.doctorApproved === 'false' || user.doctorApproved === false) {
        user.doctorApproved = 'rejected'
      } else {
        user.doctorApproved = 'pending'
      }
    }

    user.otp = {
      code: otpCode,
      expiresAt,
      verified: false
    }

    await user.save()

    res.json({
      success: true,
      message: 'OTP generated successfully',
      otp: otpCode, 
      expiresAt
    })
  } catch (error) {
    console.error('Generate OTP error:', error)
    
    if (error.name === 'ValidationError' && error.errors.doctorApproved) {
      return res.status(400).json({
        error: 'validation_error',
        message: 'Invalid doctor approval status. Please contact support.'
      })
    }
    
    res.status(500).json({
      error: 'server_error',
      message: 'Failed to generate OTP'
    })
  }
}

export const verifyOTP = async (req, res) => {
  try {
    const { otp } = req.body
    
    if (!otp || otp.length !== 6) {
      return res.status(400).json({
        error: 'invalid_otp',
        message: 'OTP must be 6 digits'
      })
    }

    const user = await User.findById(req.user.id)
    if (!user) {
      return res.status(404).json({
        error: 'user_not_found',
        message: 'User not found'
      })
    }

    if (!user.otp || !user.otp.code) {
      return res.status(400).json({
        error: 'no_otp',
        message: 'No OTP found. Please generate OTP first'
      })
    }

    if (user.otp.expiresAt < new Date()) {
      user.otp = undefined
      await user.save()
      
      return res.status(400).json({
        error: 'otp_expired',
        message: 'OTP has expired. Please generate a new one'
      })
    }

    if (user.otp.code !== otp) {
      return res.status(400).json({
        error: 'invalid_otp',
        message: 'Invalid OTP'
      })
    }

    if (user.doctorApproved && !['pending', 'approved', 'rejected'].includes(user.doctorApproved)) {
      if (user.doctorApproved === 'true' || user.doctorApproved === true) {
        user.doctorApproved = 'approved'
      } else if (user.doctorApproved === 'false' || user.doctorApproved === false) {
        user.doctorApproved = 'rejected'
      } else {
        user.doctorApproved = 'pending'
      }
    }

    user.otp.verified = true
    await user.save()

    res.json({
      success: true,
      message: 'OTP verified successfully'
    })
  } catch (error) {
    console.error('Verify OTP error:', error)
    
    if (error.name === 'ValidationError' && error.errors.doctorApproved) {
      return res.status(400).json({
        error: 'validation_error',
        message: 'Invalid doctor approval status. Please contact support.'
      })
    }
    
    res.status(500).json({
      error: 'server_error',
      message: 'Failed to verify OTP'
    })
  }
}

export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword, otp } = req.body
    
    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        error: 'missing_fields',
        message: 'Current password and new password are required'
      })
    }

    if (!otp || otp.length !== 6) {
      return res.status(400).json({
        error: 'otp_required',
        message: 'Valid 6-digit OTP is required for password change'
      })
    }

    const user = await User.findById(req.user.id)
    if (!user) {
      return res.status(404).json({
        error: 'user_not_found',
        message: 'User not found'
      })
    }

    const isCurrentPasswordValid = await user.comparePassword(currentPassword)
    if (!isCurrentPasswordValid) {
      return res.status(400).json({
        error: 'invalid_password',
        message: 'Current password is incorrect'
      })
    }

    if (!user.otp || !user.otp.verified || user.otp.code !== otp) {
      return res.status(400).json({
        error: 'invalid_otp',
        message: 'Please verify OTP first'
      })
    }

    if (user.otp.expiresAt < new Date()) {
      return res.status(400).json({
        error: 'otp_expired',
        message: 'OTP has expired. Please generate a new one'
      })
    }

    user.password = newPassword
    user.otp = undefined
    await user.save()

    res.json({
      success: true,
      message: 'Password changed successfully'
    })
  } catch (error) {
    console.error('Change password error:', error)
    res.status(500).json({
      error: 'server_error',
      message: 'Failed to change password'
    })
  }
}

export const addEmergencyContact = async (req, res) => {
  try {
    const { name, number, relationship } = req.body
    
    if (!name || !number) {
      return res.status(400).json({
        error: 'missing_fields',
        message: 'Name and number are required'
      })
    }

    const user = await User.findById(req.user.id)
    if (!user) {
      return res.status(404).json({
        error: 'user_not_found',
        message: 'User not found'
      })
    }

    if (!user.emergencyContacts) {
      user.emergencyContacts = []
    }

    user.emergencyContacts.push({
      name,
      number,
      relationship: relationship || 'Other'
    })

    await user.save()

    res.json({
      success: true,
      message: 'Emergency contact added successfully',
      emergencyContacts: user.emergencyContacts
    })
  } catch (error) {
    console.error('Add emergency contact error:', error)
    res.status(500).json({
      error: 'server_error',
      message: 'Failed to add emergency contact'
    })
  }
}

export const removeEmergencyContact = async (req, res) => {
  try {
    const { contactId } = req.params
    
    const user = await User.findById(req.user.id)
    if (!user) {
      return res.status(404).json({
        error: 'user_not_found',
        message: 'User not found'
      })
    }

    if (!user.emergencyContacts) {
      return res.status(400).json({
        error: 'no_contacts',
        message: 'No emergency contacts found'
      })
    }

    user.emergencyContacts = user.emergencyContacts.filter(
      contact => contact._id.toString() !== contactId
    )

    await user.save()

    res.json({
      success: true,
      message: 'Emergency contact removed successfully',
      emergencyContacts: user.emergencyContacts
    })
  } catch (error) {
    console.error('Remove emergency contact error:', error)
    res.status(500).json({
      error: 'server_error',
      message: 'Failed to remove emergency contact'
    })
  }
}
