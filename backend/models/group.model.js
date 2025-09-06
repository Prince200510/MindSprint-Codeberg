import mongoose, { Schema, model } from "mongoose";

const groupSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
      // index: true,
    },
    coverImage: {
      type: String, // cloudinary url
      //   required: true,
      trim: true,
    },
    creator: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    posts: [
      {
        type: Schema.Types.ObjectId,
        ref: "Post",
      },
    ],
    timestamp: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

export const Group = model("Group", groupSchema);
// Note: above code line will create `groups` collection in `groups` database
