import { Appointment } from '../models/Appointment.js'
import { User } from '../models/User.js'

export const getApprovedDoctors = async (req, res) => {
  try {
    const doctors = await User.find({
      role: 'doctor',
      doctorApproved: 'approved'
    }).select('-password -otp').sort({ createdAt: -1 })

    const formattedDoctors = doctors.map(doctor => ({
      id: doctor._id,
      name: doctor.name,
      email: doctor.email,
      phone: doctor.mobile,
      education: doctor.professionalInfo?.education || 'Not specified',
      specialization: doctor.professionalInfo?.specialization || 'General',
      experience: doctor.professionalInfo?.yearsExperience || 0,
      consultationFee: doctor.professionalInfo?.consultationFee || 500,
      consultationModes: doctor.professionalInfo?.consultationMode || ['online'],
      languages: doctor.professionalInfo?.languages || ['English'],
      rating: doctor.professionalInfo?.rating || 4.5,
      profilePhoto: doctor.professionalInfo?.documents?.profilePhoto || null,
      bio: doctor.professionalInfo?.bio || '',
      hospitalAffiliation: doctor.professionalInfo?.hospitalAffiliation || 'Private Practice'
    }))

    res.json({
      success: true,
      doctors: formattedDoctors
    })
  } catch (error) {
    console.error('Error fetching approved doctors:', error)
    res.status(500).json({ error: 'server_error', message: 'Failed to fetch doctors' })
  }
}

export const bookAppointment = async (req, res) => {
  try {
    const {
      doctorId,
      appointmentType,
      appointmentDate,
      appointmentTime,
      symptoms,
      currentMedication,
      medicalHistory,
      urgencyLevel
    } = req.body

    const patientId = req.user.id
    const patient = await User.findById(patientId)
    const doctor = await User.findById(doctorId)

    if (!patient || !doctor) {
      return res.status(404).json({ error: 'not_found', message: 'Patient or doctor not found' })
    }

    if (doctor.role !== 'doctor' || doctor.doctorApproved !== 'approved') {
      return res.status(400).json({ error: 'invalid_doctor', message: 'Doctor not available for appointments' })
    }
    const appointment = new Appointment({
      patient: patientId,
      patientName: patient.name,
      patientEmail: patient.email,
      patientPhone: patient.mobile,
      doctor: doctorId,
      doctorName: doctor.name,
      appointmentType,
      appointmentDate: new Date(appointmentDate),
      appointmentTime,
      symptoms,
      currentMedication: currentMedication ? currentMedication.split(',').map(med => med.trim()) : [],
      medicalHistory,
      urgencyLevel: urgencyLevel || 'medium',
      consultationFee: doctor.professionalInfo?.consultationFee || 500,
      status: 'pending'
    })

    await appointment.save()

    res.status(201).json({
      success: true,
      message: 'Appointment booked successfully',
      appointment: {
        id: appointment._id,
        doctorName: appointment.doctorName,
        appointmentType: appointment.appointmentType,
        appointmentDate: appointment.appointmentDate,
        appointmentTime: appointment.appointmentTime,
        status: appointment.status,
        consultationFee: appointment.consultationFee
      }
    })
  } catch (error) {
    console.error('Error booking appointment:', error)
    res.status(500).json({ error: 'server_error', message: 'Failed to book appointment' })
  }
}

export const getPatientAppointments = async (req, res) => {
  try {
    const patientId = req.user.id

    const appointments = await Appointment.find({ patient: patientId })
      .populate('doctor', 'name professionalInfo.specialization')
      .sort({ appointmentDate: -1 })

    res.json({
      success: true,
      appointments
    })
  } catch (error) {
    console.error('Error fetching patient appointments:', error)
    res.status(500).json({ error: 'server_error', message: 'Failed to fetch appointments' })
  }
}

export const getDoctorAppointments = async (req, res) => {
  try {
    const doctorId = req.user.id

    const appointments = await Appointment.find({ doctor: doctorId })
      .populate('patient', 'name profile')
      .sort({ appointmentDate: -1 })

    res.json({
      success: true,
      appointments
    })
  } catch (error) {
    console.error('Error fetching doctor appointments:', error)
    res.status(500).json({ error: 'server_error', message: 'Failed to fetch appointments' })
  }
}

export const updateAppointmentStatus = async (req, res) => {
  try {
    const { appointmentId } = req.params
    const { status, doctorNotes, prescription } = req.body
    const doctorId = req.user.id

    const appointment = await Appointment.findOne({
      _id: appointmentId,
      doctor: doctorId
    })

    if (!appointment) {
      return res.status(404).json({ error: 'not_found', message: 'Appointment not found' })
    }

    appointment.status = status
    if (doctorNotes) appointment.doctorNotes = doctorNotes
    if (prescription) appointment.prescription = prescription

    await appointment.save()

    res.json({
      success: true,
      message: 'Appointment updated successfully',
      appointment
    })
  } catch (error) {
    console.error('Error updating appointment:', error)
    res.status(500).json({ error: 'server_error', message: 'Failed to update appointment' })
  }
}
