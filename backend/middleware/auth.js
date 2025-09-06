import jwt from 'jsonwebtoken'
import { User } from '../models/User.js'

export const auth = async (req,res,next) => {
  const header = req.headers.authorization || ''
  const token = header.startsWith('Bearer ') ? header.substring(7) : null
  if(!token) return res.status(401).json({error:'unauthorized'})
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    const user = await User.findById(decoded.id)
    if(!user) return res.status(401).json({error:'unauthorized'})
    req.user = user
    next()
  } catch(e){
    res.status(401).json({error:'unauthorized'})
  }
}

export const requireRoles = (...roles) => (req,res,next) => {
  if(!req.user || !roles.includes(req.user.role)) return res.status(403).json({error:'forbidden'})
  if(req.user.role==='doctor' && !req.user.doctorApproved) return res.status(403).json({error:'doctor_not_approved'})
  next()
}

export const adminOnly = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ error: 'admin_access_required' })
  }
  next()
}

// Alternative function name for compatibility
export const authenticateToken = auth
export const authorizeRoles = requireRoles
