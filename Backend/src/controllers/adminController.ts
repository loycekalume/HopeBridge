import { Request, Response } from "express";
import pool from "../db/db.config";
import asyncHandler from "../middlewares/asyncHandler";

// @desc    Get admin overview stats
// @route   GET /api/admin/stats
// @access  Private/Admin
export const getAdminStats = asyncHandler(async (req: Request, res: Response) => {
  const totalUsers = await pool.query("SELECT COUNT(*) AS count FROM users");
  const totalCommunities = await pool.query(
    "SELECT COUNT(*) AS count FROM users WHERE role = 'community'"
  );
  const totalEvents = await pool.query("SELECT COUNT(*) AS count FROM events");
  const totalDonations = await pool.query("SELECT COUNT(*) AS count FROM donations");

  res.status(200).json({
    totalUsers: parseInt(totalUsers.rows[0].count, 10),
    totalCommunities: parseInt(totalCommunities.rows[0].count, 10),
    totalEvents: parseInt(totalEvents.rows[0].count, 10),
    totalDonations: parseInt(totalDonations.rows[0].count, 10),
  });
});
