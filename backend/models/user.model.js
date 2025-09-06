// import mongoose, { Schema, model } from "mongoose";
// // npm install --save mongoose-unique-validator --legacy-peer-deps
// // import uniqueValidator from "mongoose-unique-validator";

// const userSchema = new Schema(
//   {
//     username: {
//       type: String,
//       required: true,
//       unique: true,
//       trim: true,
//       index: true,
//     },
//     email: {
//       type: String,
//       required: true,
//       unique: true,
//       lowercase: true,
//       trim: true,
//     },
//     password: {
//       type: String,
//       required: [true, "Password is required"],
//       minlength: 8,
//       trim: true,
//     },
//     pfp: {
//       type: String, // cloudinary url
//       // required: true,
//       trim: true,
//     },
//     comments: [
//       {
//         type: Schema.Types.ObjectId,
//         ref: "Comment",
//       },
//     ],
//     createdPosts: [
//       {
//         type: Schema.Types.ObjectId,
//         ref: "Post",
//       },
//     ],
//     createdGroups: [
//       {
//         type: Schema.Types.ObjectId,
//         ref: "Group",
//       },
//     ],
//     // refreshToken: {
//     //   type: String,
//     // },
//   },
//   {
//     timestamps: true,
//   }
// );

// // userSchema.plugin(uniqueValidator);

// export const User = model("User", userSchema);
