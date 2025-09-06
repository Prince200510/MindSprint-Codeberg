import express, { Router } from "express";
import validator, { check } from "express-validator";

import {
  getAllUsers,
  getUserByUserId,
  loginUser,
  signupUser,
  updateUsersUsername,
  updateUsersPfp,
} from "../controllers/users.controller.js";
import { fileUpload } from "../middleware/file-upload.middleware.js";
import { verifyJwt } from "../middleware/check-auth.middleware.js";

const router = Router();

// router.get("/", getAllUsers);
// router.get("/:uid", getUserByUserId);

router.get("/", getAllUsers);

router.post(
  "/signup",
  fileUpload.single("image"), // `image` is taken from request coming from FE (`Auth.jsx - authSubmitHandler() - else(signup-mode)`)
  [
    check("username").not().isEmpty(),
    check("email").normalizeEmail().isEmail(),
    check("password").isLength({ min: 8 }),
  ],
  signupUser
);

router.post("/login", loginUser);

// router.use(verifyJwt);

router.patch(
  "/update/username",
  [check("username").not().isEmpty()],
  updateUsersUsername
);

// router.patch("/update/pfp", fileUpload.single("image"), updateUsersPfp);
router.patch("/update/pfp", updateUsersPfp);

export default router;
