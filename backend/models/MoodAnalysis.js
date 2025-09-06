import { Schema, model } from "mongoose";

const MoodAnalysisSchema = new Schema({
  journalId: {
    type: Schema.Types.ObjectId,
    ref: "Journal",
    required: true,
  },
  userId: { type: String, required: true },

  sentiment: {
    type: String,
    enum: ["positive", "neutral", "negative"],
    required: true,
  },

  score: { type: Number },
  magnitude: { type: Number },

  emotions: [{ type: String }],

  triggers: [
    {
      name: { type: String },
      type: { type: String },
    },
  ],

  createdAt: { type: Date, default: Date.now },
});

export const MoodAnalysis = model(
  "MoodAnalysis",
  MoodAnalysisSchema,
  "moodanalyses"
);
