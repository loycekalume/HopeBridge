import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import pool from "../db/db.config";
import jwt from "jsonwebtoken";
import asyncHandler from "../middlewares/asyncHandler";
import { generateAccessTokenOnly, generateToken } from "../utils/helpers/generateToken";
import { UserRequest } from "../utils/types/userTypes";

// @desc    Register new user
// @route   POST /api/auth/signup
// @access  Public
// authController.ts - REVISED signupUser
export const signupUser = asyncHandler(async (req: Request, res: Response) => {
  const { full_name, email, phone, password_hash, role } = req.body;

  // 1. Input Validation
  if (!full_name || !email || !password_hash || !role) {
    res.status(400).json({ message: "Please provide all required fields" });
    return;
  }

  // 2. Role validation (Ensure frontend is sending correct role string)
  const allowedRoles = ['donor', 'beneficiary', 'organizer', 'company', 'community', 'admin'];
  if (!allowedRoles.includes(role)) {
    res.status(400).json({ message: "Invalid user role provided" });
    return;
  }

  // 3. Check if user exists
  const userExists = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
  if (userExists.rows.length > 0) {
    res.status(400).json({ message: "User already exists" });
    return;
  }

  // 4. Hash password
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password_hash, salt);

  // 5. Insert user with new field set to FALSE
  const newUser = await pool.query(
    `INSERT INTO users (full_name, email, phone, password_hash, role, is_profile_complete)
     VALUES ($1, $2, $3, $4, $5, FALSE)
     RETURNING user_id, full_name, email, phone, role, is_profile_complete`,
    [full_name, email, phone, hashedPassword, role]
  );

  const user = newUser.rows[0];

  // 6. Generate JWTs
  const { accessToken, refreshToken } = generateToken(
    res,
    user.user_id,
    user.role
  );

  res.status(201).json({
    message: "User registered successfully",
    user: {
      user_id: user.user_id,
      full_name: user.full_name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      is_profile_complete: user.is_profile_complete, // <-- SENT TO FRONTEND
    },
    accessToken,
    refreshToken,
  });
});

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
// authController.ts - REVISED loginUser
export const loginUser = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400).json({ message: "Please provide email and password" });
    return;
  }

  // 1. Check user (Select ALL fields needed for login/redirection)
  const userQuery = await pool.query(
    `SELECT user_id, full_name, email, phone, role, password_hash, is_profile_complete 
     FROM users 
     WHERE email = $1`,
    [email]
  );
  const user = userQuery.rows[0];

  if (!user) {
    res.status(401).json({ message: "Invalid email or password" });
    return;
  }

  // 2. Compare password
  const isMatch = await bcrypt.compare(password, user.password_hash);
  if (!isMatch) {
    res.status(401).json({ message: "Invalid email or password" });
    return;
  }

  // 3. Generate JWTs
  const { accessToken, refreshToken } = generateToken(res, user.user_id, user.role);

  // 4. Return user data including profile status
  res.json({
    message: "Login successful",
    user: {
      user_id: user.user_id,
      full_name: user.full_name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      is_profile_complete: user.is_profile_complete, // <-- SENT TO FRONTEND
    },
    accessToken,
    refreshToken,
  });
});

export const refreshAccessToken = asyncHandler(async (req, res) => {
  const refreshToken = req.cookies.refresh_token;

  if (!refreshToken) {
    return res.status(401).json({ message: "No refresh token provided" });
  }

  try {
    const decoded = jwt.verify(
      refreshToken,
      process.env.REFRESH_TOKEN_SECRET!
    ) as jwt.JwtPayload;

    const userId = decoded.userId;

    const result = await pool.query(
      "SELECT user_id, role FROM users WHERE user_id = $1",
      [userId]
    );

    if (result.rowCount === 0) {
      return res.status(401).json({ message: "User not found" });
    }

    const user = result.rows[0];

    const newAccessToken = generateAccessTokenOnly(
      user.user_id.toString(),
      user.role
    );

    // Send back the new access token
    return res.json({ accessToken: newAccessToken });
  } catch (err) {
    return res.status(401).json({ message: "Invalid or expired refresh token" });
  }
});
// @desc    Get logged in user profile
// @route   GET /api/auth/profile
// @access  Private
export const getUserProfile = asyncHandler(async (req: UserRequest, res: Response) => {
  if (!req.user) {
    res.status(401).json({ message: "Not authorized" });
    return;
  }

  res.json({
    user: req.user,
  });
});

//logout
export const logout = async (req: Request, res: Response) => {
  try {
    // If using cookies:
    res.clearCookie("token");


    res.status(200).json({ message: "Logged out successfully" });
  } catch (err) {
    res.status(500).json({ error: "Logout failed" });
  }
};