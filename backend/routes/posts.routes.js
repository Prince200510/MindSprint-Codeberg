import express, { Router } from "express";
import validator, { check } from "express-validator";

import {
  getAllPosts,
  createPost,
  getGroupPostsByGroupId,
  getUserCreatedPosts,
} from "../controllers/posts.controller.js";
import { fileUpload } from "../middleware/file-upload.middleware.js";
import { verifyJwt } from "../middleware/check-auth.middleware.js";

const router = Router();

router.get("/", getAllPosts);

// router.use(verifyJwt);

router.post(
  "/group/:groupId",
  fileUpload.single("image"), // req.file
  [
    // req.body
    check("title").not().isEmpty(),
    // check("content").isLength({ min: 5 }),
  ],
  createPost
);

router.get("/group/:groupId", getGroupPostsByGroupId);

router.get("/user", getUserCreatedPosts);

export default router;
