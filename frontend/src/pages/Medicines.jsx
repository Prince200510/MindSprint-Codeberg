import { useState, useEffect } from 'react'
import { Layout } from '../components/Layout.jsx'
import { Card } from '../components/Card.jsx'
import { Button } from '../components/Button.jsx'
import { Modal } from '../components/Modal.jsx'
import { Input } from '../components/Input.jsx'
import { motion, AnimatePresence } from 'framer-motion'
import { Pill,  Plus,  Edit3,  Trash2, CheckCircle2, Loader2, Calendar, Clock, Info, User, Stethoscope, Heart, ChefHat} from 'lucide-react'
import { useAuth } from '../context/AuthContext.jsx'
import { useNotifications } from '../context/NotificationContext.jsx'

// Move nav array outside component to prevent re-renders
const nav = [
  {to:'/dashboard/user', label:'Overview', icon: User},
  {to:'/dashboard/user/doctors', label:'Available Doctors', icon: Stethoscope},
  {to:'/dashboard/user/appointments', label:'My Appointments', icon: Calendar},
  {to:'/dashboard/user/prescriptions', label:'Prescriptions', icon: Heart},
  {to:'/dashboard/user/medicines', label:'Medicines', icon: Pill},
  {to:'/dashboard/user/diet', label:'AI Diet Plan', icon: ChefHat}
]

export const Medicines = () => {
  const { user } = useAuth()
  const { addNotification } = useNotifications()
  const [medicines, setMedicines] = useState([])
  const [showAddModal, setShowAddModal] = useState(false)
  const [selectedMedicine, setSelectedMedicine] = useState(null)
  const [loading, setLoading] = useState(true)
  const [addingMedicine, setAddingMedicine] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')
  const [medicineForm, setMedicineForm] = useState({
    name: '',
    dosage: '',
    frequency: '',
    duration: '',
    specialInstructions: '',
    beforeAfterFood: 'after',
    withWater: true,
    avoidAlcohol: false,
    startDate: new Date().toISOString().split('T')[0],
    totalDoses: '',
    active: true
  })

  useEffect(() => {
    fetchMedicines()
  }, [])

  const fetchMedicines = async () => {
    try {
      const token = localStorage.getItem('token')
      console.log('Fetching medicines with token:', token ? 'Token exists' : 'No token')
      
      const response = await fetch('/api/medicines', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      
      console.log('Response status:', response.status)
      
      if (response.ok) {
        const data = await response.json()
        console.log('API Response data:', data)
        setMedicines(data.medicines || [])
      } else {
        console.error('API Error - Status:', response.status)
        const errorData = await response.json()
        console.error('Error details:', errorData)
        setMedicines([])
      }
    } catch (error) {
      console.error('Error fetching medicines:', error)
      const sampleMedicines = [
        {
          id: 1,
          name: 'Vitamin D',
          dosage: '500mg',
          frequency: 'Once daily',
          duration: '30 days',
          specialInstructions: 'Take with milk for better absorption',
          beforeAfterFood: 'after',
          withWater: true,
          avoidAlcohol: false,
          startDate: '2025-09-05',
          totalDoses: 30,
          takenDoses: 5,
          active: true
        }
      ]
      setMedicines(sampleMedicines)
    } finally {
      setLoading(false)
    }
  }

  const handleAddMedicine = async () => {
    setAddingMedicine(true)
    try {
      const token = localStorage.getItem('token')
      const isEditing = selectedMedicine && selectedMedicine.id
      const url = isEditing ? `/api/medicines/${selectedMedicine.id}` : '/api/medicines'
      const method = isEditing ? 'PUT' : 'POST'
      
      const requestData = {
        ...medicineForm,
        totalDoses: parseInt(medicineForm.totalDoses || '30')
      }
      
      console.log('Sending medicine data:', requestData)
      console.log('Request URL:', url)
      console.log('Request method:', method)
      
      const response = await fetch(url, {
        method: method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(requestData)
      })

      if (response.ok) {
        const data = await response.json()
        fetchMedicines()
        setSuccessMessage(isEditing ? 'Medicine updated successfully!' : 'Medicine added successfully!')
        setTimeout(() => setSuccessMessage(''), 5000)
        resetForm()
        setSelectedMedicine(null)
        setShowAddModal(false)
      } else {
        const error = await response.json()
        console.error('Error saving medicine - Status:', response.status)
        console.error('Error saving medicine - Details:', error)
        console.error('Full error object:', JSON.stringify(error, null, 2))
        alert(`Error: ${error.message || error.error || 'Unknown error'}. Please check the console for details.`)
      }
    } catch (error) {
      console.error('Error saving medicine:', error)
      if (selectedMedicine && selectedMedicine.id) {
        setMedicines(prev => 
          prev.map(m => m.id === selectedMedicine.id 
            ? { ...m, ...medicineForm, totalDoses: parseInt(medicineForm.totalDoses || '30') }
            : m
          )
        )
        setSuccessMessage('Medicine updated successfully!')
      } else {
        const newMedicine = {
          id: Date.now(),
          ...medicineForm,
          totalDoses: parseInt(medicineForm.totalDoses || '30'),
          takenDoses: 0,
          active: true
        }
        setMedicines(prev => [...prev, newMedicine])
        setSuccessMessage('Medicine added successfully!')
      }
      
      setTimeout(() => setSuccessMessage(''), 5000)
      resetForm()
      setSelectedMedicine(null)
      setShowAddModal(false)
    } finally {
      setAddingMedicine(false)
    }
  }

  const resetForm = () => {
    setMedicineForm({
      name: '',
      dosage: '',
      frequency: '',
      duration: '',
      specialInstructions: '',
      beforeAfterFood: 'after',
      withWater: true,
      avoidAlcohol: false,
      startDate: new Date().toISOString().split('T')[0],
      totalDoses: '',
      active: true
    })
  }

  const handleEditMedicine = (medicine) => {
    setMedicineForm({
      name: medicine.name,
      dosage: medicine.dosage,
      frequency: medicine.frequency,
      duration: medicine.duration,
      specialInstructions: medicine.specialInstructions || '',
      beforeAfterFood: medicine.beforeAfterFood || 'after',
      withWater: medicine.withWater !== undefined ? medicine.withWater : true,
      avoidAlcohol: medicine.avoidAlcohol || false,
      startDate: medicine.startDate ? new Date(medicine.startDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
      totalDoses: medicine.totalDoses?.toString() || '',
      active: medicine.active !== undefined ? medicine.active : true
    })
    setSelectedMedicine(medicine)
    setShowAddModal(true)
  }

  const handleDeleteMedicine = async (medicineId) => {
    console.log('handleDeleteMedicine called with ID:', medicineId)
    if (!confirm('Are you sure you want to delete this medicine?')) {
      return
    }

    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`/api/medicines/${medicineId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        fetchMedicines()
        setSuccessMessage('Medicine deleted successfully!')
        setTimeout(() => setSuccessMessage(''), 5000)
      } else {
        console.error('Error deleting medicine')
        setSuccessMessage('Error deleting medicine. Please try again.')
        setTimeout(() => setSuccessMessage(''), 5000)
      }
    } catch (error) {
      console.error('Error deleting medicine:', error)
      setMedicines(prev => prev.filter(m => m.id !== medicineId))
      setSuccessMessage('Medicine deleted successfully!')
      setTimeout(() => setSuccessMessage(''), 5000)
    }
  }

  const handleMarkAsTaken = async (medicineId) => {
    console.log('handleMarkAsTaken called with ID:', medicineId)
    try {
      const medicine = medicines.find(m => m.id === medicineId)
      if (!medicine) return

      const newTakenDoses = (medicine.takenDoses || 0) + 1
      if (medicine.totalDoses && newTakenDoses > medicine.totalDoses) {
        alert('You have already completed all doses for this medicine!')
        return
      }

      const token = localStorage.getItem('token')
      const response = await fetch(`/api/medicines/${medicineId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          takenDoses: newTakenDoses
        })
      })

      if (response.ok) {
        setMedicines(prev => prev.map(m => 
          m.id === medicineId 
            ? { ...m, takenDoses: newTakenDoses }
            : m
        ))
        
        setSuccessMessage(`Dose taken! Progress: ${newTakenDoses}/${medicine.totalDoses || 'ongoing'} doses`)
        setTimeout(() => setSuccessMessage(''), 5000)
        
        const now = new Date()
        addNotification({
          type: 'medicine-taken',
          prescription: {
            id: medicine.id,
            medicineName: medicine.name,
            dosage: medicine.dosage
          },
          time: now.getHours().toString().padStart(2, '0') + ':' + now.getMinutes().toString().padStart(2, '0'),
          message: `✅ You have taken ${medicine.name} (${medicine.dosage})`,
          description: `Taken at ${now.toLocaleTimeString()} on ${now.toLocaleDateString()}. Progress: ${newTakenDoses}/${medicine.totalDoses || 'ongoing'} doses`,
          takenAt: now
        })
      } else {
        console.error('Error updating medicine')
        setSuccessMessage('Error updating dose count. Please try again.')
        setTimeout(() => setSuccessMessage(''), 5000)
      }
    } catch (error) {
      console.error('Error marking dose as taken:', error)
      const medicine = medicines.find(m => m.id === medicineId)
      const newTakenDoses = (medicine?.takenDoses || 0) + 1
      
      setMedicines(prev => prev.map(m => 
        m.id === medicineId 
          ? { ...m, takenDoses: newTakenDoses }
          : m
      ))
      setSuccessMessage('Dose marked as taken!')
      setTimeout(() => setSuccessMessage(''), 5000)
      if (medicine) {
        const now = new Date()
        addNotification({
          type: 'medicine-taken',
          prescription: {
            id: medicine.id,
            medicineName: medicine.name,
            dosage: medicine.dosage
          },
          time: now.getHours().toString().padStart(2, '0') + ':' + now.getMinutes().toString().padStart(2, '0'),
          message: `✅ You have taken ${medicine.name} (${medicine.dosage})`,
          description: `Taken at ${now.toLocaleTimeString()} on ${now.toLocaleDateString()}. Progress: ${newTakenDoses}/${medicine.totalDoses || 'ongoing'} doses`,
          takenAt: now
        })
      }
    }
  }

  if (loading) {
    return (
      <Layout items={nav}>
        <div className="flex items-center justify-center h-64">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full"
          />
        </div>
      </Layout>
    )
  }

  return (
    <Layout items={nav}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-800 dark:text-white">My Medicines</h1>
            <p className="text-slate-600 dark:text-slate-400">Manage your medicine inventory and records</p>
          </div>
          <div className="flex items-center">
            {!showAddModal && (
              <Button onClick={() => setShowAddModal(true)} className="bg-primary hover:bg-primary/90 flex items-center">
                <Plus className="w-4 h-4 mr-2" />
                Add Medicine
              </Button>
            )}
          </div>
        </div>
        <AnimatePresence>
          {successMessage && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg p-4 shadow-lg"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <CheckCircle2 className="w-5 h-5" />
                  <p className="font-medium">{successMessage}</p>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setSuccessMessage('')}
                  className="text-white hover:bg-white/20"
                >
                  ×
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        <div className="space-y-4">
          {medicines.map(medicine => (
            <div
              key={medicine.id}
              className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden"
            >
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                      <Pill className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-slate-800 dark:text-white">
                        {medicine.name}
                      </h3>
                      <p className="text-slate-600 dark:text-slate-400">
                        {medicine.dosage} • {medicine.frequency}
                      </p>
                      <span className={`inline-block px-2 py-1 text-xs rounded-full mt-2 ${
                        medicine.active 
                          ? 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-300'
                          : 'bg-gray-100 text-gray-700 dark:bg-gray-900/20 dark:text-gray-300'
                      }`}>
                        {medicine.active ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  </div>
                  {!showAddModal && (
                    <div className="flex items-center space-x-2">
                      {medicine.totalDoses && medicine.active && (
                        <button 
                          className="px-3 py-1.5 text-sm bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors flex items-center"
                          onClick={(e) => {
                            e.preventDefault()
                            e.stopPropagation()
                            handleMarkAsTaken(medicine.id)
                          }}
                        >
                          <CheckCircle2 className="w-4 h-4 mr-1" />
                          Take Dose
                        </button>
                      )}
                      <button 
                        className="px-2 py-1.5 text-sm text-slate-600 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                        onClick={(e) => {
                          e.preventDefault()
                          e.stopPropagation()
                          handleEditMedicine(medicine)
                        }}
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button 
                        className="px-2 py-1.5 text-sm text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                        onClick={(e) => {
                          e.preventDefault()
                          e.stopPropagation()
                          handleDeleteMedicine(medicine.id)
                        }}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <div className="flex items-center text-sm">
                      <Calendar className="w-4 h-4 text-slate-500 mr-2" />
                      <span className="text-slate-600 dark:text-slate-400">Duration: </span>
                      <span className="font-medium text-slate-800 dark:text-white ml-1">
                        {medicine.duration}
                      </span>
                    </div>
                    <div className="flex items-center text-sm">
                      <Clock className="w-4 h-4 text-slate-500 mr-2" />
                      <span className="text-slate-600 dark:text-slate-400">Started: </span>
                      <span className="font-medium text-slate-800 dark:text-white ml-1">
                        {medicine.startDate ? new Date(medicine.startDate).toLocaleDateString() : 'Not specified'}
                      </span>
                    </div>
                    {medicine.totalDoses && (
                      <div className="flex items-center text-sm">
                        <CheckCircle2 className="w-4 h-4 text-green-500 mr-2" />
                        <span className="text-slate-600 dark:text-slate-400">Progress: </span>
                        <span className="font-medium text-slate-800 dark:text-white ml-1">
                          {medicine.takenDoses || 0}/{medicine.totalDoses} doses
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="space-y-3">
                    {medicine.specialInstructions && (
                      <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg border border-blue-200 dark:border-blue-800">
                        <div className="flex items-start">
                          <Info className="w-4 h-4 text-blue-500 mr-2 mt-0.5 flex-shrink-0" />
                          <div className="text-sm">
                            <p className="font-medium text-blue-700 dark:text-blue-300 mb-1">Special Instructions:</p>
                            <p className="text-blue-600 dark:text-blue-400">{medicine.specialInstructions}</p>
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="flex flex-wrap gap-2">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        medicine.beforeAfterFood === 'before' 
                          ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/20 dark:text-orange-300'
                          : 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-300'
                      }`}>
                        {medicine.beforeAfterFood} food
                      </span>
                      {medicine.withWater && (
                        <span className="px-2 py-1 text-xs bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300 rounded-full">
                          with water
                        </span>
                      )}
                      {medicine.avoidAlcohol && (
                        <span className="px-2 py-1 text-xs bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-300 rounded-full">
                          avoid alcohol
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                {medicine.totalDoses && (
                  <div className="mt-4">
                    <div className="flex items-center justify-between text-sm text-slate-600 dark:text-slate-400 mb-2">
                      <span>Progress</span>
                      <span>{Math.round(((medicine.takenDoses || 0) / medicine.totalDoses) * 100)}%</span>
                    </div>
                    <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${((medicine.takenDoses || 0) / medicine.totalDoses) * 100}%` }}
                        transition={{ duration: 0.5 }}
                        className="bg-gradient-to-r from-green-500 to-emerald-500 h-2 rounded-full"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {medicines.length === 0 && (
          <Card className="text-center py-12">
            <Pill className="w-16 h-16 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-slate-800 dark:text-white mb-2">No Medicines</h3>
            <p className="text-slate-600 dark:text-slate-400 mb-4">Add your first medicine to get started</p>
            <Button onClick={() => setShowAddModal(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Add Medicine
            </Button>
          </Card>
        )}
      </div>
      <Modal open={showAddModal} onClose={() => {
        if (!addingMedicine) {
          setShowAddModal(false)
          setSelectedMedicine(null)
          resetForm()
        }
      }} size="lg">
        <div className="p-8">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-slate-800 dark:text-white">
              {selectedMedicine ? 'Edit Medicine' : 'Add New Medicine'}
            </h2>
            <p className="text-slate-600 dark:text-slate-400 mt-2">
              {selectedMedicine ? 'Update your medicine details' : 'Enter your medicine information'}
            </p>
          </div>
          
          <div className="space-y-6">
            <div className="grid md:grid-cols-2 gap-4">
              <Input
                label="Medicine Name"
                placeholder="e.g., Vitamin D, Paracetamol"
                value={medicineForm.name}
                onChange={(e) => setMedicineForm(prev => ({...prev, name: e.target.value}))}
                required
              />
              <Input
                label="Dosage"
                placeholder="e.g., 500mg, 2 tablets"
                value={medicineForm.dosage}
                onChange={(e) => setMedicineForm(prev => ({...prev, dosage: e.target.value}))}
                required
              />
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <Input
                label="Frequency"
                placeholder="e.g., Twice daily, Every 8 hours"
                value={medicineForm.frequency}
                onChange={(e) => setMedicineForm(prev => ({...prev, frequency: e.target.value}))}
                required
              />
              <Input
                label="Duration"
                placeholder="e.g., 7 days, 2 weeks"
                value={medicineForm.duration}
                onChange={(e) => setMedicineForm(prev => ({...prev, duration: e.target.value}))}
                required
              />
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <Input
                label="Start Date"
                type="date"
                value={medicineForm.startDate}
                onChange={(e) => setMedicineForm(prev => ({...prev, startDate: e.target.value}))}
                required
              />
              <Input
                label="Total Number of Doses (Optional)"
                type="number"
                placeholder="e.g., 30"
                value={medicineForm.totalDoses}
                onChange={(e) => setMedicineForm(prev => ({...prev, totalDoses: e.target.value}))}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Special Instructions
              </label>
              <textarea
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-slate-800 dark:text-white"
                rows="3"
                placeholder="Any special instructions for taking this medicine..."
                value={medicineForm.specialInstructions}
                onChange={(e) => setMedicineForm(prev => ({...prev, specialInstructions: e.target.value}))}
              />
            </div>

            <div className="grid md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  When to Take
                </label>
                <select
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-slate-800 dark:text-white"
                  value={medicineForm.beforeAfterFood}
                  onChange={(e) => setMedicineForm(prev => ({...prev, beforeAfterFood: e.target.value}))}
                >
                  <option value="before">Before food</option>
                  <option value="after">After food</option>
                  <option value="with">With food</option>
                  <option value="anytime">Anytime</option>
                </select>
              </div>

              <div className="flex items-center space-x-2 pt-8">
                <input
                  type="checkbox"
                  id="withWater"
                  checked={medicineForm.withWater}
                  onChange={(e) => setMedicineForm(prev => ({...prev, withWater: e.target.checked}))}
                  className="rounded border-slate-300 text-primary focus:ring-primary"
                />
                <label htmlFor="withWater" className="text-sm text-slate-700 dark:text-slate-300">
                  Take with water
                </label>
              </div>

              <div className="flex items-center space-x-2 pt-8">
                <input
                  type="checkbox"
                  id="avoidAlcohol"
                  checked={medicineForm.avoidAlcohol}
                  onChange={(e) => setMedicineForm(prev => ({...prev, avoidAlcohol: e.target.checked}))}
                  className="rounded border-slate-300 text-primary focus:ring-primary"
                />
                <label htmlFor="avoidAlcohol" className="text-sm text-slate-700 dark:text-slate-300">
                  Avoid alcohol
                </label>
              </div>

              <div className="flex items-center space-x-2 pt-8">
                <input
                  type="checkbox"
                  id="active"
                  checked={medicineForm.active}
                  onChange={(e) => setMedicineForm(prev => ({...prev, active: e.target.checked}))}
                  className="rounded border-slate-300 text-primary focus:ring-primary"
                />
                <label htmlFor="active" className="text-sm text-slate-700 dark:text-slate-300">
                  Active
                </label>
              </div>
            </div>

            <div className="flex space-x-4 pt-8">
              <Button 
                onClick={handleAddMedicine} 
                className="bg-primary hover:bg-primary/90 flex-1"
                disabled={addingMedicine}
              >
                {addingMedicine ? (
                  <div className="flex items-center">
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    {selectedMedicine ? 'Updating...' : 'Adding...'}
                  </div>
                ) : (
                  selectedMedicine ? 'Update Medicine' : 'Add Medicine'
                )}
              </Button>
              <Button 
                variant="outline" 
                onClick={() => {
                  if (!addingMedicine) {
                    setShowAddModal(false)
                    setSelectedMedicine(null)
                    resetForm()
                  }
                }} 
                className="flex-1"
                disabled={addingMedicine}
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      </Modal>
    </Layout>
  )
}
