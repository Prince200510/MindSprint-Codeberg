import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Layout } from '../components/Layout.jsx'
import { Card } from '../components/Card.jsx'
import { Button } from '../components/Button.jsx'
import { Modal } from '../components/Modal.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import { useNotifications } from '../context/NotificationContext.jsx'
import { useNavigate } from 'react-router-dom'
import { User, Calendar, Clock, CheckCircle, AlertTriangle, XCircle, Stethoscope, Phone, Mail, MapPin, Plus, RefreshCw, Video, MessageCircle, Star, IndianRupee, Heart, Pill, ChefHat, Edit3, Users } from 'lucide-react'
import { API_CONFIG } from '../config/api.js'

const API_BASE = API_CONFIG.API_URL

const nav = [
