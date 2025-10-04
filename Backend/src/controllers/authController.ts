import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import pool from "../db/db.config";
import asyncHandler from "../middlewares/asyncHandler";
import { generateToken } from "../utils/helpers/generateToken";
import { UserRequest } from "../utils/types/userTypes";

// @desc    Register new user
// @route   POST /api/auth/signup
// @access  Public
export const signupUser = asyncHandler(async (req: Request, res: Response) => {
  const { full_name, email, phone, password_hash, role } = req.body;

  if (!full_name || !email || !password_hash || !role) {
    res.status(400).json({ message: "Please provide all required fields" });
    return;
  }

  // Check if user exists
  const userExists = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
  if (userExists.rows.length > 0) {
    res.status(400).json({ message: "User already exists" });
    return;
  }

  // Hash password correctly
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password_hash, salt);

  // Insert user with hashed password
  const newUser = await pool.query(
    `INSERT INTO users (full_name, email, phone, password_hash, role)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING user_id, full_name, email, phone, role`,
    [full_name, email, phone, hashedPassword, role] // ✅ now storing hashedPassword
  );

  // Generate JWTs
  const { accessToken, refreshToken } = generateToken(
    res,
    newUser.rows[0].user_id,
    role
  );

  res.status(201).json({
    message: "User registered successfully",
    user: newUser.rows[0],
    accessToken,
    refreshToken,
  });
});

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
export const loginUser = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400).json({ message: "Please provide email and password" });
    return;
  }

  // Check user
  const userQuery = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
  const user = userQuery.rows[0];

  if (!user) {
    res.status(401).json({ message: "Invalid email or password" });
    return;
  }

  // Compare with password_hash in DB
  const isMatch = await bcrypt.compare(password, user.password_hash);
  if (!isMatch) {
    res.status(401).json({ message: "Invalid email or password" });
    return;
  }

  // Generate JWTs
  const { accessToken, refreshToken } = generateToken(res, user.user_id, user.role);

  res.json({
    message: "Login successful",
    user: {
      user_id: user.user_id,
      full_name: user.full_name,
      email: user.email,
      phone: user.phone,
      role: user.role,
    },
    accessToken,
    refreshToken,
  });
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