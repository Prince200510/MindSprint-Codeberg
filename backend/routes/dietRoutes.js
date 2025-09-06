import { Router } from 'express'
import { auth } from '../middleware/auth.js'
import { DietPlan } from '../models/DietPlan.js'

const router = Router()
router.use(auth)
router.post('/save', async (req, res) => {
  try {
    const { preferences, plan, createdAt } = req.body
    const userId = req.user._id
    
    const savedPlan = await DietPlan.create({
      userId,
      preferences,
      plan,
      createdAt: createdAt || new Date()
    })
    
    res.json({
      success: true,
      message: 'Diet plan saved successfully',
      data: savedPlan
    })
  } catch (error) {
    console.error('Error saving diet plan:', error)
    res.status(500).json({ 
      error: error.message || 'Failed to save diet plan'
    })
  }
})

router.get('/saved', async (req, res) => {
  try {
    const userId = req.user._id
    const savedPlans = await DietPlan.find({ userId, isActive: true })
      .sort({ createdAt: -1 })
      .limit(10)
    
    res.json({
      success: true,
      data: savedPlans
    })
  } catch (error) {
    console.error('Error fetching saved diet plans:', error)
    res.status(500).json({ 
      error: error.message || 'Failed to fetch saved diet plans'
    })
  }
})

router.post('/mealplan', async (req, res) => {
  try {
    const { GoogleGenerativeAI } = await import('@google/generative-ai')
    const userProfile = req.body
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" })
    const prompt = `
You are a meal planning assistant.
Generate a 7-day meal plan with breakfast, lunch, dinner, and one snack per day.
Respect these constraints: ${JSON.stringify(userProfile)}.
Return ONLY valid JSON. Do not include explanations or markdown fences.
Schema:
{
  "days": [
    {
      "day": "Monday",
      "breakfast": "meal description",
      "lunch": "meal description", 
      "dinner": "meal description",
      "snack": "snack description"
    }
  ],
  "shopping_list": ["ingredient 1", "ingredient 2", ...]
}
`

    const result = await model.generateContent(prompt)
    let text = result.response.text()
    text = text
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim()
    const firstCurly = text.indexOf("{")
    const lastCurly = text.lastIndexOf("}")
    if (firstCurly === -1 || lastCurly === -1) {
      throw new Error("No JSON object found in response")
    }

    const jsonString = text.substring(firstCurly, lastCurly + 1)
    const json = JSON.parse(jsonString)

    res.json({ 
      success: true,
      plan: json 
    })
  } catch (error) {
    console.error('Diet plan generation error:', error)
    res.status(500).json({ 
      error: error.message || 'Failed to generate meal plan'
    })
  }
})

export default router
