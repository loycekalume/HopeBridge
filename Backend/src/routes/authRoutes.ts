// src/routes/authRoutes.ts
import express from "express";
import {  signupUser, loginUser, refreshAccessToken, logoutUser } from "../controllers/authController";

const router = express.Router();

router.post("/register",  signupUser);
router.post("/login", loginUser);
router.post("/logout", logoutUser);

router.post("/refresh", refreshAccessToken);

export default router;
