import { Request, Response } from "express";
import pool from "../db/db.config";
import asyncHandler from "../middlewares/asyncHandler";

// @desc    Get all users
// @route   GET /api/users
// @access  Private/Admin 
export const getAllUsers = asyncHandler(async (req: Request, res: Response) => {
  const result = await pool.query(
    "SELECT user_id, full_name, email, phone, role, created_at FROM users ORDER BY created_at DESC"
  );

  res.json({
    count: result.rows.length,
    users: result.rows,
  });
});

// @desc    Get a single user by ID
// @route   GET /api/users/:id
// @access  Private/Admin (or owner)
export const getUserById = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  const result = await pool.query(
    "SELECT user_id, full_name, email, phone, role, created_at FROM users WHERE user_id = $1",
    [id]
  );

  if (result.rows.length === 0) {
    res.status(404).json({ message: "User not found" });
    return;
  }

  res.json(result.rows[0]);
});

// @desc    Get users by role (donor, company, beneficiary, etc.)
// @route   GET /api/users/role/:role
// @access  Private/Admin
// Get users by role (case-insensitive)
export const getUsersByRole = asyncHandler(async (req: Request, res: Response) => {
  const { role } = req.params;

  if (!role) {
    res.status(400).json({ message: "Role parameter is required" });
    return;
  }

  const users = await pool.query(
    "SELECT user_id, full_name, email, phone, role, created_at FROM users WHERE LOWER(role) = LOWER($1)",
    [role]
  );

  if (users.rows.length === 0) {
    res.status(404).json({ message: `No users found for role '${role}'` });
    return;
  }

  res.status(200).json({
    count: users.rows.length,
    users: users.rows,
  });
});

export const flagUser = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  await pool.query("UPDATE users SET flagged = TRUE WHERE user_id = $1", [id]);
  res.json({ message: "User flagged successfully" });
});
// @desc    Update user details
// @route   PUT /api/users/:id
// @access  Private/Admin
export const updateUser = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { full_name, email, role } = req.body;

  const result = await pool.query(
    `
    UPDATE users 
    SET 
      full_name = COALESCE($1, full_name),
      email = COALESCE($2, email),
      role = COALESCE($3, role),
      updated_at = NOW()
    WHERE user_id = $4
    RETURNING *
    `,
    [full_name, email, role, id]
  );

  if (result.rowCount === 0) {
    return res.status(404).json({ message: "User not found" });
  }

  res.json({ message: "User updated successfully", user: result.rows[0] });
});



export const deleteUser = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await pool.query("DELETE FROM users WHERE user_id = $1 RETURNING *", [id]);
  if (result.rowCount === 0) return res.status(404).json({ message: "User not found" });
  res.json({ message: "User deleted successfully" });
});