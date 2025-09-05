import jwt from 'jsonwebtoken'
import { User } from '../models/User.js'

const sign = (user) => jwt.sign({id:user._id,role:user.role}, process.env.JWT_SECRET, {expiresIn:'7d'})

export const register = async (req,res) => {
  try {
    const { name, email, password, role, specialization, mobile, profile } = req.body
    
    if(!name || !email || !password) {
      return res.status(400).json({
        error:'missing_fields',
        message: 'Name, email, and password are required'
      })
    }

    const exists = await User.findOne({email})
    if(exists) {
      return res.status(409).json({
        error:'email_in_use',
        message: 'An account with this email already exists. Please use a different email or try logging in.'
      })
    }
    
    const userData = {
      name,
      email,
      password,
      role: role || 'user',
      specialization
    }
    
    if (mobile) userData.mobile = mobile
    if (profile) userData.profile = profile
    
    const user = await User.create(userData)
    
    const token = sign(user)
    const userResponse = {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      doctorApproved: user.doctorApproved,
      mobile: user.mobile,
      profile: user.profile
    }
    
    res.status(201).json({
      success: true,
      message: 'Registration successful! Welcome to MediTrack!',
      token,
      user: userResponse
    })
    
  } catch (error) {
    console.error('Registration error:', error)
    res.status(500).json({
      error: 'server_error',
      message: 'Something went wrong during registration. Please try again.'
    })
  }
}

export const login = async (req,res) => {
  const { email,password } = req.body
  const user = await User.findOne({email})
  if(!user) return res.status(401).json({error:'invalid_credentials'})
  const match = await user.comparePassword(password)
  if(!match) return res.status(401).json({error:'invalid_credentials'})
  res.json({token: sign(user), user:{id:user._id,name:user.name,role:user.role,doctorApproved:user.doctorApproved}})
}

export const me = async (req,res) => {
  try {
    const user = await User.findById(req.user.id).select('-password')
    if(!user) return res.status(404).json({error: 'user_not_found'})
    res.json({
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      doctorApproved: user.doctorApproved,
      mobile: user.mobile,
      profile: user.profile
    })
  } catch (error) {
    res.status(500).json({error: 'server_error'})
  }
}

export const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password')
    if(!user) return res.status(404).json({error: 'user_not_found'})
    
    res.json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        mobile: user.mobile,
        profile: user.profile,
        createdAt: user.createdAt
      }
    })
  } catch (error) {
    console.error('Profile fetch error:', error)
    res.status(500).json({error: 'server_error', message: 'Failed to fetch profile'})
  }
}

export const updateProfile = async (req, res) => {
  try {
    const userId = req.user.id
    const updates = req.body
    const updateDoc = {}
    
    if (updates.name) updateDoc.name = updates.name
    if (updates.mobile) updateDoc.mobile = updates.mobile
  
    if (updates.profile) {
      Object.keys(updates.profile).forEach(key => {
        updateDoc[`profile.${key}`] = updates.profile[key]
      })
    }
    
    Object.keys(updates).forEach(key => {
      if (key.startsWith('profile.')) {
        updateDoc[key] = updates[key]
      }
    })
    
    updateDoc.updatedAt = new Date()
    
    const user = await User.findByIdAndUpdate(
      userId,
      { $set: updateDoc },
      { new: true, runValidators: true }
    ).select('-password')
    
    if (!user) {
      return res.status(404).json({error: 'user_not_found'})
    }
    
    res.json({
      success: true,
      message: 'Profile updated successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        mobile: user.mobile,
        profile: user.profile
      }
    })
    
  } catch (error) {
    console.error('Profile update error:', error)
    res.status(500).json({
      error: 'server_error',
      message: 'Failed to update profile'
    })
  }
}
