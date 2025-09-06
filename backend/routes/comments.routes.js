import express, { Router } from "express";
import validator, { check } from "express-validator";

import {
  getAllComments,
  createComment,
  getPostCommentsByPostId,
  getUserComments,
} from "../controllers/comments.controller.js";
import { fileUpload } from "../middleware/file-upload.middleware.js";
import { verifyJwt } from "../middleware/check-auth.middleware.js";

const router = Router();

router.get("/", getAllComments);

// router.use(verifyJwt);

router.post(
  "/post/:postId",
  fileUpload.single("image"), // req.file
  [
    // req.body
    check("content").not().isEmpty(),
  ],
  createComment
);

router.get("/post/:postId", getPostCommentsByPostId);

router.get("/user", getUserComments);

export default router;
