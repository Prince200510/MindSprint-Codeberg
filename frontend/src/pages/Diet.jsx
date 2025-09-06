import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Layout } from '../components/Layout.jsx'
import { Card } from '../components/Card.jsx'
import { Button } from '../components/Button.jsx'
import { Input } from '../components/Input.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import { useNotifications } from '../context/NotificationContext.jsx'
import { User,  Calendar,  Stethoscope,  Heart,  Pill, ChefHat, ShoppingCart, Target, AlertTriangle, Loader2, CheckCircle2, Coffee, UtensilsCrossed, Moon, Save, Download, FileText} from 'lucide-react'

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

const nav = [
  { to: '/dashboard/user', label: 'Dashboard', icon: User },
  { to: '/dashboard/user/doctors', label: 'Available Doctors', icon: Stethoscope },
  { to: '/dashboard/user/appointments', label: 'My Appointments', icon: Calendar },
  { to: '/dashboard/user/prescriptions', label: 'Prescriptions', icon: Heart },
  { to: '/dashboard/user/medicines', label: 'Medicines', icon: Pill },
  { to: '/dashboard/user/diet', label: 'AI Diet Plan', icon: ChefHat }
]

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
}

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { duration: 0.5 }
  }
}

export const Diet = () => {
  const { user } = useAuth()
  const { addNotification } = useNotifications()
  const [formData, setFormData] = useState({
    diet: '',
    allergies: '',
    calories: '',
    goals: ''
  })
  const [loading, setLoading] = useState(false)
  const [plan, setPlan] = useState(null)
  const [savedPlans, setSavedPlans] = useState([])
  const [showSaved, setShowSaved] = useState(false)

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setPlan(null)

    try {
      const token = localStorage.getItem('token')
      const response = await fetch('http://localhost:5000/api/diet/mealplan', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      })

      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.error || 'Unknown server error')
      }

      setPlan(data.plan)
      addNotification({
        type: 'success',
        message: 'Meal Plan Generated!',
        description: 'Your personalized 7-day meal plan is ready.'
      })
    } catch (error) {
      console.error('Error fetching meal plan:', error)
      addNotification({
        type: 'error',
        message: 'Failed to Generate Meal Plan',
        description: error.message
      })
    } finally {
      setLoading(false)
    }
  }

  const getMealIcon = (mealType) => {
    switch(mealType) {
      case 'breakfast': return <Coffee className="w-5 h-5 text-orange-500" />
      case 'lunch': return <UtensilsCrossed className="w-5 h-5 text-green-500" />
      case 'dinner': return <Moon className="w-5 h-5 text-purple-500" />
      default: return <Heart className="w-5 h-5 text-pink-500" />
    }
  }

  const fetchSavedPlans = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch('http://localhost:5000/api/diet/saved', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch saved plans')
      }

      setSavedPlans(data.data || [])
    } catch (error) {
      console.error('Error fetching saved plans:', error)
    }
  }

  const saveDietPlan = async () => {
    if (!plan) return

    try {
      const token = localStorage.getItem('token')
      const response = await fetch('http://localhost:5000/api/diet/save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          preferences: formData,
          plan: plan,
          createdAt: new Date().toISOString()
        })
      })

      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.error || 'Failed to save diet plan')
      }

      fetchSavedPlans()

      addNotification({
        type: 'success',
        message: 'Diet Plan Saved!',
        description: 'Your meal plan has been saved successfully.'
      })
    } catch (error) {
      console.error('Error saving diet plan:', error)
      addNotification({
        type: 'error',
        message: 'Failed to Save',
        description: error.message
      })
    }
  }

  const downloadPDF = () => {
    if (!plan) return

    const htmlContent = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>My Personalized 7-Day Diet Plan</title>
        <style>
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          
          body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            padding: 20px;
          }
          
          .container {
            max-width: 800px;
            margin: 0 auto;
            background: white;
            border-radius: 20px;
            box-shadow: 0 20px 40px rgba(0,0,0,0.1);
            overflow: hidden;
          }
          
          .header {
            background: linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%);
            color: white;
            padding: 40px 30px;
            text-align: center;
            position: relative;
          }
          
          .header::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="40" fill="none" stroke="white" stroke-width="0.5" opacity="0.1"/></svg>');
          }
          
          .header h1 {
            font-size: 2.5rem;
            font-weight: 700;
            margin-bottom: 10px;
            position: relative;
            z-index: 1;
          }
          
          .header .subtitle {
            font-size: 1.1rem;
            opacity: 0.9;
            position: relative;
            z-index: 1;
          }
          
          .content {
            padding: 40px 30px;
          }
          
          .preferences {
            background: linear-gradient(135deg, #F8FAFC 0%, #E2E8F0 100%);
            border-radius: 15px;
            padding: 25px;
            margin-bottom: 30px;
            border-left: 5px solid #4F46E5;
          }
          
          .preferences h3 {
            color: #4F46E5;
            font-size: 1.4rem;
            margin-bottom: 15px;
            display: flex;
            align-items: center;
          }
          
          .preferences h3::before {
            content: "⚙️";
            margin-right: 10px;
          }
          
          .preference-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 15px;
          }
          
          .preference-item {
            display: flex;
            flex-direction: column;
          }
          
          .preference-label {
            font-weight: 600;
            color: #374151;
            margin-bottom: 5px;
          }
          
          .preference-value {
            color: #6B7280;
            background: white;
            padding: 8px 12px;
            border-radius: 8px;
            border: 1px solid #E5E7EB;
          }
          
          .days-container {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
            gap: 25px;
            margin-bottom: 40px;
          }
          
          .day-card {
            background: white;
            border-radius: 15px;
            padding: 25px;
            box-shadow: 0 4px 6px rgba(0,0,0,0.07);
            border: 1px solid #F1F5F9;
            transition: transform 0.2s;
          }
          
          .day-card:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 25px rgba(0,0,0,0.1);
          }
          
          .day-title {
            color: #4F46E5;
            font-size: 1.3rem;
            font-weight: 700;
            margin-bottom: 20px;
            padding-bottom: 10px;
            border-bottom: 2px solid #E0E7FF;
            display: flex;
            align-items: center;
          }
          
          .day-title::before {
            content: "📅";
            margin-right: 10px;
            font-size: 1.2rem;
          }
          
          .meal {
            margin-bottom: 15px;
            padding: 12px;
            border-radius: 10px;
            border-left: 4px solid transparent;
          }
          
          .meal.breakfast {
            background: linear-gradient(135deg, #FEF3C7 0%, #FDE68A 100%);
            border-left-color: #F59E0B;
          }
          
          .meal.lunch {
            background: linear-gradient(135deg, #D1FAE5 0%, #A7F3D0 100%);
            border-left-color: #10B981;
          }
          
          .meal.dinner {
            background: linear-gradient(135deg, #E0E7FF 0%, #C7D2FE 100%);
            border-left-color: #6366F1;
          }
          
          .meal.snack {
            background: linear-gradient(135deg, #FCE7F3 0%, #FBCFE8 100%);
            border-left-color: #EC4899;
          }
          
          .meal-type {
            font-weight: 600;
            font-size: 0.9rem;
            display: flex;
            align-items: center;
            margin-bottom: 5px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
          }
          
          .meal-type.breakfast::before { content: "☕"; margin-right: 8px; }
          .meal-type.lunch::before { content: "🍽️"; margin-right: 8px; }
          .meal-type.dinner::before { content: "🌙"; margin-right: 8px; }
          .meal-type.snack::before { content: "🍎"; margin-right: 8px; }
          
          .meal-desc {
            color: #374151;
            font-size: 0.95rem;
            line-height: 1.5;
          }
          
          .shopping-section {
            background: linear-gradient(135deg, #F0FDF4 0%, #DCFCE7 100%);
            border-radius: 15px;
            padding: 30px;
            border: 1px solid #BBF7D0;
          }
          
          .shopping-title {
            color: #16A34A;
            font-size: 1.5rem;
            font-weight: 700;
            margin-bottom: 20px;
            display: flex;
            align-items: center;
          }
          
          .shopping-title::before {
            content: "🛒";
            margin-right: 12px;
            font-size: 1.4rem;
          }
          
          .shopping-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 10px;
          }
          
          .shopping-item {
            background: white;
            padding: 12px 16px;
            border-radius: 10px;
            border-left: 4px solid #16A34A;
            box-shadow: 0 2px 4px rgba(0,0,0,0.05);
            display: flex;
            align-items: center;
          }
          
          .shopping-item::before {
            content: "✓";
            color: #16A34A;
            font-weight: bold;
            margin-right: 10px;
            width: 20px;
            height: 20px;
            display: flex;
            align-items: center;
            justify-content: center;
            background: #DCFCE7;
            border-radius: 50%;
            font-size: 0.8rem;
          }
          
          .footer {
            text-align: center;
            padding: 30px;
            background: #F8FAFC;
            color: #64748B;
            border-top: 1px solid #E2E8F0;
          }
          
          .footer p {
            margin: 5px 0;
          }
          
          .watermark {
            font-size: 0.8rem;
            opacity: 0.7;
          }
          
          @media print {
            body {
              background: white;
              padding: 0;
            }
            
            .container {
              box-shadow: none;
              border-radius: 0;
            }
            
            .day-card:hover {
              transform: none;
            }
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🍽️ My Personalized Diet Plan</h1>
            <p class="subtitle">AI-Generated 7-Day Meal Plan • ${new Date().toLocaleDateString('en-US', { 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}</p>
          </div>

          <div class="content">
            <div class="preferences">
              <h3>Your Dietary Preferences</h3>
              <div class="preference-grid">
                <div class="preference-item">
                  <span class="preference-label">Diet Type</span>
                  <span class="preference-value">${formData.diet || 'Not specified'}</span>
                </div>
                <div class="preference-item">
                  <span class="preference-label">Daily Calories</span>
                  <span class="preference-value">${formData.calories || 'Not specified'}</span>
                </div>
                <div class="preference-item">
                  <span class="preference-label">Food Allergies</span>
                  <span class="preference-value">${formData.allergies || 'None specified'}</span>
                </div>
                <div class="preference-item">
                  <span class="preference-label">Health Goals</span>
                  <span class="preference-value">${formData.goals || 'Not specified'}</span>
                </div>
              </div>
            </div>

            <div class="days-container">
              ${plan.days?.map(day => `
                <div class="day-card">
                  <div class="day-title">${day.day}</div>
                  
                  <div class="meal breakfast">
                    <div class="meal-type breakfast">Breakfast</div>
                    <div class="meal-desc">${day.breakfast}</div>
                  </div>
                  
                  <div class="meal lunch">
                    <div class="meal-type lunch">Lunch</div>
                    <div class="meal-desc">${day.lunch}</div>
                  </div>
                  
                  <div class="meal dinner">
                    <div class="meal-type dinner">Dinner</div>
                    <div class="meal-desc">${day.dinner}</div>
                  </div>
                  
                  <div class="meal snack">
                    <div class="meal-type snack">Snack</div>
                    <div class="meal-desc">${day.snack}</div>
                  </div>
                </div>
              `).join('') || ''}
            </div>

            ${plan.shopping_list ? `
              <div class="shopping-section">
                <div class="shopping-title">Shopping List</div>
                <div class="shopping-grid">
                  ${plan.shopping_list.map(item => `
                    <div class="shopping-item">${item}</div>
                  `).join('')}
                </div>
              </div>
            ` : ''}
          </div>

          <div class="footer">
            <p><strong>Healthcare Dashboard</strong> - AI-Powered Nutrition Planning</p>
            <p class="watermark">Generated with ❤️ by your personal AI nutritionist</p>
          </div>
        </div>
      </body>
      </html>
    `
    const blob = new Blob([htmlContent], { type: 'text/html' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `AI-Diet-Plan-${new Date().toISOString().split('T')[0]}.html`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)

    addNotification({
      type: 'success',
      message: 'Beautiful Diet Plan Downloaded!',
      description: 'Your personalized meal plan has been downloaded with beautiful styling.'
    })
  }

  return (
    <Layout items={nav}>
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="space-y-6"
      >
        <motion.div variants={itemVariants} className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white flex items-center">
              <ChefHat className="w-8 h-8 mr-3 text-primary" />
              AI Diet Plan
            </h1>
            <p className="text-slate-600 dark:text-slate-400 mt-1">
              Generate your personalized 7-day meal plan with AI assistance
            </p>
          </div>
          
          <div className="mt-4 sm:mt-0">
            <Button
              onClick={() => {
                setShowSaved(!showSaved)
                if (!showSaved) fetchSavedPlans()
              }}
              className="bg-slate-600 hover:bg-slate-700 text-white flex items-center"
            >
              <FileText className="w-4 h-4 mr-2" />
              {showSaved ? 'Hide' : 'View'} Saved Plans
            </Button>
          </div>
        </motion.div>

        <AnimatePresence>
          {showSaved && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
            >
              <Card className="p-6">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
                  Your Saved Diet Plans
                </h3>
                {savedPlans.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {savedPlans.map((savedPlan, index) => (
                      <Card key={savedPlan._id || index} className="p-4 bg-slate-50 dark:bg-slate-800">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                            {new Date(savedPlan.createdAt).toLocaleDateString()}
                          </span>
                          <Button
                            onClick={() => setPlan(savedPlan.plan)}
                            className="text-xs bg-primary hover:bg-primary/90 text-white px-3 py-1"
                          >
                            View Plan
                          </Button>
                        </div>
                        <div className="text-xs text-slate-600 dark:text-slate-400 space-y-1">
                          <p><strong>Diet:</strong> {savedPlan.preferences?.diet || 'Not specified'}</p>
                          <p><strong>Calories:</strong> {savedPlan.preferences?.calories || 'Not specified'}</p>
                        </div>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <p className="text-slate-600 dark:text-slate-400 text-center py-8">
                    No saved diet plans yet. Generate and save your first plan!
                  </p>
                )}
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.div variants={itemVariants}>
          <Card className="p-6">
            <div className="flex items-center mb-6">
              <Target className="w-6 h-6 text-primary mr-3" />
              <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
                Tell us about your dietary preferences
              </h2>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Diet Type"
                  name="diet"
                  placeholder="e.g., vegetarian, keto, mediterranean"
                  value={formData.diet}
                  onChange={handleChange}
                  required
                />
                
                <Input
                  label="Daily Calorie Goal"
                  name="calories"
                  type="number"
                  placeholder="e.g., 2000"
                  value={formData.calories}
                  onChange={handleChange}
                />
              </div>

              <Input
                label="Food Allergies"
                name="allergies"
                placeholder="e.g., nuts, dairy, gluten (comma separated)"
                value={formData.allergies}
                onChange={handleChange}
              />

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Health Goals
                </label>
                <textarea
                  name="goals"
                  placeholder="e.g., weight loss, muscle gain, better energy levels"
                  value={formData.goals}
                  onChange={handleChange}
                  rows={3}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-primary hover:bg-primary/90 text-white flex items-center justify-center"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Generating Your Meal Plan...
                  </>
                ) : (
                  <>
                    <ChefHat className="w-5 h-5 mr-2" />
                    Generate AI Meal Plan
                  </>
                )}
              </Button>
            </form>
          </Card>
        </motion.div>

        <AnimatePresence>
          {plan && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              <Card className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center">
                    <Calendar className="w-6 h-6 text-primary mr-3" />
                    <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
                      Your 7-Day Meal Plan
                    </h2>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <Button
                      onClick={saveDietPlan}
                      className="bg-green-600 hover:bg-green-700 text-white flex items-center px-4 py-2"
                    >
                      <Save className="w-4 h-4 mr-2" />
                      Save Plan
                    </Button>
                    
                    <Button
                      onClick={downloadPDF}
                      className="bg-blue-600 hover:bg-blue-700 text-white flex items-center px-4 py-2"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Download
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {plan.days?.map((day, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <Card className="p-4 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-900">
                        <h3 className="text-lg font-bold text-primary mb-4 flex items-center">
                          <CheckCircle2 className="w-5 h-5 mr-2" />
                          {day.day}
                        </h3>
                        
                        <div className="space-y-3">
                          <div className="flex items-start space-x-3">
                            {getMealIcon('breakfast')}
                            <div>
                              <span className="font-semibold text-slate-700 dark:text-slate-300">Breakfast:</span>
                              <p className="text-slate-600 dark:text-slate-400 text-sm">{day.breakfast}</p>
                            </div>
                          </div>
                          
                          <div className="flex items-start space-x-3">
                            {getMealIcon('lunch')}
                            <div>
                              <span className="font-semibold text-slate-700 dark:text-slate-300">Lunch:</span>
                              <p className="text-slate-600 dark:text-slate-400 text-sm">{day.lunch}</p>
                            </div>
                          </div>
                          
                          <div className="flex items-start space-x-3">
                            {getMealIcon('dinner')}
                            <div>
                              <span className="font-semibold text-slate-700 dark:text-slate-300">Dinner:</span>
                              <p className="text-slate-600 dark:text-slate-400 text-sm">{day.dinner}</p>
                            </div>
                          </div>
                          
                          <div className="flex items-start space-x-3">
                            {getMealIcon('snack')}
                            <div>
                              <span className="font-semibold text-slate-700 dark:text-slate-300">Snack:</span>
                              <p className="text-slate-600 dark:text-slate-400 text-sm">{day.snack}</p>
                            </div>
                          </div>
                        </div>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              </Card>

              {plan.shopping_list && (
                <Card className="p-6">
                  <div className="flex items-center mb-6">
                    <ShoppingCart className="w-6 h-6 text-primary mr-3" />
                    <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
                      Shopping List
                    </h2>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                    {plan.shopping_list.map((item, idx) => (
                      <motion.div
                        key={idx}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        className="flex items-center space-x-2 p-3 bg-slate-50 dark:bg-slate-800 rounded-lg"
                      >
                        <CheckCircle2 className="w-4 h-4 text-green-500" />
                        <span className="text-slate-700 dark:text-slate-300">{item}</span>
                      </motion.div>
                    ))}
                  </div>
                </Card>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </Layout>
  )
}