import { Schema, model } from "mongoose";

const JournalSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  text: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
  analysisDone: { type: Boolean, default: false },
});

export const Journal = model("Journal", JournalSchema, "journals");
