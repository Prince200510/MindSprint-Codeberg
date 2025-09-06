import validator, { validationResult } from "express-validator";
import mongoose, { startSession } from "mongoose";

import { HttpError } from "../utils/HttpError.js";
import { Post } from "../models/post.model.js";
// import { User } from "../models/user.model.js";
import { User } from "../models/User.js";
import { Group } from "../models/group.model.js";
import {
  uploadOnCloudinary,
  deleteFromCloudinary,
} from "../utils/cloudinary.js";

const getAllPosts = async (req, res, next) => {
  console.log("log> GET req in `/posts`");

  let allPosts;
  try {
    allPosts = await Post.find().exec();
    console.log("log> allPosts :-");
    console.log(allPosts);
  } catch (err) {
    const error = new HttpError(
      `Something went wrong! could not get posts. Error: ${err}`,
      422
    );
    console.log(
      `log> Something went wrong! could not get posts.\nlog> Error: ${err}`
    );
    return next(error);
  }

  if (!allPosts) {
    const error = new HttpError("Could not get posts", 404);
    console.log("log> Error: Could not get posts");
    return next(error);
  }

  // res
  //   // .send('<h1>GET req in Groups</h1>')
  //   .json(allPosts);

  res.json({
    posts: allPosts.map((post) => post.toObject({ getters: true })),
  });
};

const createPost = async (req, res, next) => {
  console.log("log> POST req in `/posts/group/:groupId`");

  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    // OR  if (errors.not().isEmpty())
    console.log("log> Errors:-");
    console.log(errors);
    return next(
      new HttpError("Inavlid inputs passed, please ckeck your data.", 422)
    );
  }

  // const userId = req.userData.userId;
  // const { title, content, userId } = req.body;
  const { title, content, image, userId } = req.body;
  const groupId = req.params.groupId;

  // uploading image on cloudinary to get image url before saving it in db ->
  {
    // const imageLocalPath = req?.file?.path;
    // if (!imageLocalPath) {
    //   // throw new ApiError(400, "log> Avatar file is missing!");
    //   console.log(
    //     "log> Error: image file is missing locally! - posts.controller.js - createPost()"
    //   );
    //   throw new Error(
    //     "cover image file is missing locally! - posts.controller.js - createPost()",
    //     400
    //   );
    // }
    // let image;
    // try {
    //   image = await uploadOnCloudinary(imageLocalPath);
    //   console.log("log> image:-");
    //   console.log(image);
    // } catch (err) {
    //   const error = new HttpError(
    //     `Something went wrong! could not upload image to cloudinary\nError: ${err} - posts.controller.js - createPost()`,
    //     400
    //   );
    //   console.log(`log> Error: ${error.message}`);
    //   return next(error);
    // }
    // if (!image || !image.url) {
    //   const error = new HttpError(
    //     "`image` or `image.url` is not present on cloudinary - posts.controller.js - createPost()",
    //     400
    //   );
    //   console.log(`log> Error: ${error.message}`);
    //   return next(error);
    // }
    // if (image?.url && image.url.startsWith("http://")) {
    //   image.url = image.url.replace(/^http:\/\//i, "https://");
    // }
  }

  const newPost = new Post({
    title,
    content,
    // image: image?.url, // not required field
    image,
    // group,
    group: groupId,
    // creator: req.userData.userId,
    creator: userId,
  });

  let user;
  try {
    user = await User.findById(userId);
    // console.log("log> user:-"); console.log(user);
  } catch (err) {
    const error = new HttpError(
      `Something went wrong while 'User.findById(creator)' Error: ${err} - posts.controller.js - createPost()`,
      500
    );
    console.log(
      `log> Something went wrong while 'User.findById(creator)'\nlog>Error: ${err} - posts.controller.js - createPost()`
    );
    return next(error);
  }

  if (!user) {
    const error = new HttpError(
      `User with id: ${creator} does not exist in \`users\` collection of db - posts.controller.js - createPost()`,
      401
    );
    console.log(`log> Error: ${error.message}`);

    return next(error);
  }

  let group;
  try {
    group = await Group.findById(groupId);
    // console.log("log> group:-"); console.log(group);
  } catch (err) {
    const error = new HttpError(
      `Something went wrong while 'group.findById(groupId)' Error: ${err} - posts.controller.js - createPost()`,
      500
    );
    console.log(
      `log> Something went wrong while 'group.findById(groupId)'\nlog>Error: ${err} - posts.controller.js - createPost()`
    );
    return next(error);
  }

  if (!group) {
    const error = new HttpError(
      `group with id: ${groupId} does not exist in \`groups\` collection of db - posts.controller.js - createPost()`,
      401
    );
    console.log(`log> Error: ${error.message}`);

    return next(error);
  }

  let result;
  try {
    const session = await startSession();
    session.startTransaction();
    result = await newPost.save({ session });
    // console.log("log> result:-"); console.log(result);
    user.createdPosts.push(newPost);
    group.posts.push(newPost);
    result = await user.save({ session });
    result = await group.save({ session });
    result = await session.commitTransaction();
  } catch (err) {
    const error = new HttpError(`Could not create a post! Error: ${err}`, 500);
    console.log(`log> Could not create a post!\nlog> Error: ${err}`);
    return next(error);
  }

  res.status(201).json({
    creation: { post: newPost.toObject({ getters: true }), result },
  });
};

const getGroupPostsByGroupId = async (req, res, next) => {
  console.log("log> GET req in `/posts/group/:groupId`");

  // const userId = req.userData.userId;
  const groupId = req.params.groupId;

  let groupPosts;
  try {
    groupPosts = await Post.find({ group: groupId });
    console.log("log> groupPosts:-");
    console.log(groupPosts);
  } catch (err) {
    const error = new HttpError(
      `Something went wrong! could not get group posts. Error: ${err}`,
      422
    );
    console.log(
      `log> Something went wrong! could not get group posts.\nlog> Error: ${err}`
    );
    return next(error);
  }

  if (!groupPosts) {
    const error = new HttpError(
      "Could not find group posts for the provided group id.",
      404
    );
    return next(error);
  }

  res.json({
    groupId,
    groupPosts: groupPosts.map((post) => post.toObject({ getters: true })),
  });
};

const getUserCreatedPosts = async (req, res, next) => {
  console.log("log> GET req in `/posts/user`");

  // const userId = req.userData.userId;
  const { userId } = req.body;

  let userPosts;
  try {
    userPosts = await Post.find({ creator: userId });
    console.log("log> userPosts:-");
    console.log(userPosts);
  } catch (err) {
    const error = new HttpError(
      `Something went wrong! could not get user posts. Error: ${err}`,
      422
    );
    console.log(
      `log> Something went wrong! could not get user posts.\nlog> Error: ${err}`
    );
    return next(error);
  }

  if (!userPosts) {
    const error = new HttpError(
      "Could not find user posts for the provided group id.",
      404
    );
    return next(error);
  }

  res.json({
    userId,
    userPosts: userPosts.map((post) => post.toObject({ getters: true })),
  });
};

export { getAllPosts, createPost, getGroupPostsByGroupId, getUserCreatedPosts };
