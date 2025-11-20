// src/routes/authRoutes.ts
import express from "express";
import {  signupUser, loginUser, logout, refreshAccessToken } from "../controllers/authController";

const router = express.Router();

router.post("/register",  signupUser);
router.post("/login", loginUser);
router.post("/logout", logout);

router.post("/refresh", refreshAccessToken);

export default router;
