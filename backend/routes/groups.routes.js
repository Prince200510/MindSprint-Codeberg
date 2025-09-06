import express, { Router } from "express";
import validator, { check } from "express-validator";

import {
  getAllGroups,
  createGroup,
  getUserCreatedGroups,
} from "../controllers/groups.controller.js";
import { fileUpload } from "../middleware/file-upload.middleware.js";
import { verifyJwt } from "../middleware/check-auth.middleware.js";

const router = Router();

router.get("/", getAllGroups);

// router.use(verifyJwt);


router.post(
  "/",
  fileUpload.single("image"), // req.file
  [
    // req.body
    check("title").not().isEmpty(),
    check("description").isLength({ min: 5 }),
  ],
  createGroup
);

router.get("/user", getUserCreatedGroups);

export default router;
