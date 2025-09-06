import validator, { validationResult } from "express-validator";
import mongoose, { startSession } from "mongoose";

import { HttpError } from "../utils/HttpError.js";
import { Group } from "../models/group.model.js";
// import { User } from "../models/user.model.js";
import { User } from "../models/User.js";
import {
  uploadOnCloudinary,
  deleteFromCloudinary,
} from "../utils/cloudinary.js";

const getAllGroups = async (req, res, next) => {
  console.log("log> GET req in `/groups`");

  let allGroups;
  try {
    allGroups = await Group.find().populate('posts').exec();
    console.log("log> allGroups :-");
    console.log(allGroups);
  } catch (err) {
    const error = new HttpError(
      `Something went wrong! could not get groups. Error: ${err}`,
      422
    );
    console.log(
      `log> Something went wrong! could not get groups.\nlog> Error: ${err}`
    );
    return next(error);
  }

  if (!allGroups) {
    const error = new HttpError("Could not get groups", 404);
    console.log("log> Error: Could not get groups");
    return next(error);
  }

  // res
  //   // .send('<h1>GET req in Groups</h1>')
  //   .json(allGroups);

  res.json({
    groups: allGroups.map((group) => group.toObject({ getters: true })),
  });
};

const createGroup = async (req, res, next) => {
  console.log("log> POST req in `/groups`");

  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    // OR  if (errors.not().isEmpty())
    console.log("log> Errors:-");
    console.log(errors);
    return next(
      new HttpError("Inavlid inputs passed, please ckeck your data.", 422)
    );
  }

  const { title, description, coverImage, userId } = req.body;
  // const userId = req.userData.userId;

  // uploading cover image on cloudinary to get image url before saving it in db ->
  {
    // const coverImageLocalPath = req?.file?.path;
    // if (!coverImageLocalPath) {
    //   // throw new ApiError(400, "log> Avatar file is missing!");
    //   console.log(
    //     "log> Error: cover image file is missing locally! - places.controller.js - createPlace()"
    //   );
    //   throw new Error(
    //     "cover image file is missing locally! - places.controller.js - createPlace()",
    //     400
    //   );
    // }
    // let coverImage;
    // try {
    //   coverImage = await uploadOnCloudinary(coverImageLocalPath);
    //   console.log("log> coverImage:-");
    //   console.log(coverImage);
    // } catch (err) {
    //   const error = new HttpError(
    //     `Something went wrong! could not upload coverImage to cloudinary\nError: ${err} - groups.controller.js - createGroups()`,
    //     400
    //   );
    //   console.log(`log> Error: ${error.message}`);
    //   return next(error);
    // }
    // if (!coverImage || !coverImage.url) {
    //   const error = new HttpError(
    //     "`coverImage` or `coverImage.url` is not present on cloudinary - groups.controller.js - createGroups()",
    //     400
    //   );
    //   console.log(`log> Error: ${error.message}`);
    //   return next(error);
    // }
    // if (coverImage?.url && coverImage.url.startsWith("http://")) {
    //   coverImage.url = coverImage.url.replace(/^http:\/\//i, "https://");
    // }
  }

  const newGroup = new Group({
    title,
    description,
    // coverImage:
    //   coverImage?.url || "https://i.ibb.co/nqyC2z7B/default-image-placeholder.webp",
    coverImage: coverImage || "",
    // creator: req.userData.userId,
    creator: userId,
  });

  let user;
  try {
    user = await User.findById(userId);
    // console.log("log> user:-"); console.log(user);
  } catch (err) {
    const error = new HttpError(
      `Something went wrong while 'User.findById(creator)' Error: ${err} - groups.controller.js - createGroup()`,
      500
    );
    console.log(
      `log> Something went wrong while 'User.findById(creator)'\nlog>Error: ${err} - groups.controller.js - createPlace()`
    );
    return next(error);
  }

  if (!user) {
    const error = new HttpError(
      `User with id: ${creator} does not exist in \`users\` collection of db - groups.controller.js - createGroup()`,
      401
    );
    console.log(`log> Error: ${error.message}`);

    return next(error);
  }

  let result;
  try {
    const session = await startSession();
    session.startTransaction();
    result = await newGroup.save({ session });
    // console.log("log> result:-"); console.log(result);
    
    // Initialize createdGroups array if it doesn't exist
    if (!user.createdGroups) {
      user.createdGroups = [];
    }
    user.createdGroups.push(newGroup);
    
    result = await user.save({ session });
    // console.log("log> result:-"); console.log(result);
    result = await session.commitTransaction();
    // console.log("log> result:-"); console.log(result);
  } catch (err) {
    const error = new HttpError(`Could not create a group! Error: ${err}`, 500);
    console.log(`log> Could not create a group!\nlog> Error: ${err}`);
    return next(error);
  }

  res.status(201).json({
    creation: { group: newGroup.toObject({ getters: true }), result },
  });
};

const getUserCreatedGroups = async (req, res, next) => {
  console.log("log> GET req in `/groups/user`");

  // const userId = req.userData.userId;
  const { userId } = req.body;

  let userGroups;
  try {
    userGroups = await Group.find({ creator: userId });
    console.log("log> userGroups:-");
    console.log(userGroups);
  } catch (err) {
    const error = new HttpError(
      `Something went wrong! could not get user groups. Error: ${err}`,
      422
    );
    console.log(
      `log> Something went wrong! could not get user groups.\nlog> Error: ${err}`
    );
    return next(error);
  }

  if (!userGroups) {
    const error = new HttpError(
      "Could not find user groups for the provided user id.",
      404
    );
    return next(error);
  }

  res.json({
    userId,
    userGroups: userGroups.map((group) => group.toObject({ getters: true })),
  });
};

export { getAllGroups, createGroup, getUserCreatedGroups };
