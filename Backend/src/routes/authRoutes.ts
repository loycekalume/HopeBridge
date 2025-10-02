// src/routes/authRoutes.ts
import express from "express";
import {  signupUser, loginUser, logout } from "../controllers/authController";

const router = express.Router();

router.post("/register",  signupUser);
router.post("/login", loginUser);
router.post("/logout", logout);

export default router;
