import { Schema, model } from 'mongoose'

const dietPlanSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  preferences: {
    diet: String,
    allergies: String,
    calories: String,
    goals: String
  },
  plan: {
    days: [{
      day: String,
      breakfast: String,
      lunch: String,
      dinner: String,
      snack: String
    }],
    shopping_list: [String]
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
})

export const DietPlan = model('DietPlan', dietPlanSchema)
