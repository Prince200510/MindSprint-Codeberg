import validator, { validationResult } from "express-validator";
import mongoose, { startSession } from "mongoose";

import { HttpError } from "../utils/HttpError.js";
import { Comment } from "../models/comment.model.js";
// import { User } from "../models/user.model.js";
import { User } from "../models/User.js";
import { Post } from "../models/post.model.js";
import {
  uploadOnCloudinary,
  deleteFromCloudinary,
} from "../utils/cloudinary.js";

const getAllComments = async (req, res, next) => {
  console.log("log> GET req in `/comments`");

  let allComments;
  try {
    allComments = await Comment.find().exec();
    console.log("log> allComments :-");
    console.log(allComments);
  } catch (err) {
    const error = new HttpError(
      `Something went wrong! could not get comments. Error: ${err}`,
      422
    );
    console.log(
      `log> Something went wrong! could not get comments.\nlog> Error: ${err}`
    );
    return next(error);
  }

  if (!allComments) {
    const error = new HttpError("Could not get comments", 404);
    console.log("log> Error: Could not get comments");
    return next(error);
  }

  // res
  //   // .send('<h1>GET req in Comments</h1>')
  //   .json(allComments);

  res.json({
    comments: allComments.map((post) => post.toObject({ getters: true })),
  });
};

const createComment = async (req, res, next) => {
  console.log("log> POST req in `/comments/post/:postId`");

  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    // OR  if (errors.not().isEmpty())
    console.log("log> Errors:-");
    console.log(errors);
    return next(
      new HttpError("Inavlid inputs passed, please ckeck your data.", 422)
    );
  }

  const { content, userId } = req.body;
  // const userId = req.userData.userId;
  const postId = req.params.postId;

  const newComment = new Comment({
    content,
    commenter: userId,
    post: postId,
  });

  let user;
  try {
    user = await User.findById(userId);
    // console.log("log> user:-"); console.log(user);
  } catch (err) {
    const error = new HttpError(
      `Something went wrong while 'User.findById(userId)' Error: ${err} - comments.controller.js - createComment()`,
      500
    );
    console.log(
      `log> Something went wrong while 'User.findById(userId)'\nlog>Error: ${err} - comments.controller.js - createComment()`
    );
    return next(error);
  }

  if (!user) {
    const error = new HttpError(
      `User with id: ${userId} does not exist in \`users\` collection of db - comments.controller.js - createComment()`,
      401
    );
    console.log(`log> Error: ${error.message}`);

    return next(error);
  }

  let post;
  try {
    post = await Post.findById(postId);
    // console.log("log> post:-"); console.log(post);
  } catch (err) {
    const error = new HttpError(
      `Something went wrong while 'Post.findById(postId)' Error: ${err} - comments.controller.js - createComment()`,
      500
    );
    console.log(
      `log> Something went wrong while 'Post.findById(postId)'\nlog>Error: ${err} - comments.controller.js - createComment()`
    );
    return next(error);
  }

  if (!post) {
    const error = new HttpError(
      `post with id: ${postId} does not exist in \`posts\` collection of db - comments.controller.js - createComment()`,
      401
    );
    console.log(`log> Error: ${error.message}`);

    return next(error);
  }

  let result;
  try {
    const session = await startSession();
    session.startTransaction();
    result = await newComment.save({ session });
    // console.log("log> result:-"); console.log(result);
    user.comments.push(newComment);
    post.comments.push(newComment);
    result = await user.save({ session });
    result = await post.save({ session });
    result = await session.commitTransaction();
  } catch (err) {
    const error = new HttpError(
      `Could not create a comment! Error: ${err}`,
      500
    );
    console.log(`log> Could not create a comment!\nlog> Error: ${err}`);
    return next(error);
  }

  res.status(201).json({
    creation: { comment: newComment.toObject({ getters: true }), result },
  });
};

const getPostCommentsByPostId = async (req, res, next) => {
  console.log("log> GET req in `/comments/post/:postId`");

  // const userId = req.userData.userId;
  const postId = req.params.postId;

  let postComments;
  try {
    postComments = await Comment.find({ post: postId });
    console.log("log> postComments:-");
    console.log(postComments);
  } catch (err) {
    const error = new HttpError(
      `Something went wrong! could not get post comments. Error: ${err}`,
      422
    );
    console.log(
      `log> Something went wrong! could not get post comments.\nlog> Error: ${err}`
    );
    return next(error);
  }

  if (!postComments) {
    const error = new HttpError(
      "Could not find post comments for the provided post id.",
      404
    );
    return next(error);
  }

  res.json({
    postId,
    postComments: postComments.map((post) => post.toObject({ getters: true })),
  });
};

const getUserComments = async (req, res, next) => {
  console.log("log> GET req in `/comments/user`");

  //   const userId = req.userData.userId;
  const { userId } = req.body;

  let userComments;
  try {
    userComments = await Comment.find({ commenter: userId });
    console.log("log> userComments:-");
    console.log(userComments);
  } catch (err) {
    const error = new HttpError(
      `Something went wrong! could not get user comments. Error: ${err}`,
      422
    );
    console.log(
      `log> Something went wrong! could not get user comments.\nlog> Error: ${err}`
    );
    return next(error);
  }

  if (!userComments) {
    const error = new HttpError(
      "Could not find user comments for the provided post id.",
      404
    );
    return next(error);
  }

  res.json({
    userId,
    userComments: userComments.map((comment) =>
      comment.toObject({ getters: true })
    ),
  });
};

export {
  getAllComments,
  createComment,
  getPostCommentsByPostId,
  getUserComments,
};
