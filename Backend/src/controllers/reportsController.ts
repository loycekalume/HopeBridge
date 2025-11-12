import { Request, Response } from "express";
import pool from "../db/db.config"; 
import asyncHandler from "../middlewares/asyncHandler"; 

// Create a new report
export const createReport = asyncHandler(async (req: Request, res: Response) => {
  try {
    const { reported_user_id, category, description } = req.body;
    const reported_by = (req as any).user?.user_id; // assuming verifyToken middleware sets req.user

    if (!reported_user_id || !category || !description) {
      return res.status(400).json({ message: "All fields are required." });
    }

    const result = await pool.query(
      `
      INSERT INTO reports (reported_by, reported_user_id, category, description)
      VALUES ($1, $2, $3, $4)
      RETURNING *
      `,
      [reported_by, reported_user_id, category, description]
    );

    res.status(201).json({
      message: "Report created successfully.",
      report: result.rows[0],
    });
  } catch (error) {
    console.error("Error creating report:", error);
    res.status(500).json({ message: "Error creating report." });
  }
});


// Get all reports
export const getAllReports = asyncHandler(async (req: Request, res: Response) => {
  try {
    const result = await pool.query(`
      SELECT r.report_id, 
             r.category, 
             r.description, 
             r.status, 
             r.created_at,
             u.full_name AS reporter_name,
             ru.full_name AS reported_name
      FROM reports r
      LEFT JOIN users u ON r.reported_by = u.user_id
      LEFT JOIN users ru ON r.reported_user_id = ru.user_id
      ORDER BY r.created_at DESC
    `);

    res.status(200).json({ count: result.rows.length, reports: result.rows });
  } catch (error) {
    console.error("Error fetching reports:", error);
    res.status(500).json({ message: "Server error while fetching reports." });
  }
});

// Get report stats for AdminReports page
export const getReportsStats = asyncHandler(async (req: Request, res: Response) => {
  try {
    // Count summaries
    const summaryResult = await pool.query(`
      SELECT 
        COUNT(*) AS total_reports,
        COUNT(*) FILTER (WHERE status = 'Pending') AS pending,
        COUNT(*) FILTER (WHERE status = 'Reviewed') AS reviewed,
        COUNT(*) FILTER (WHERE status = 'Resolved') AS resolved
      FROM reports
    `);

    const summary = summaryResult.rows[0];

    // By category
    const categoryResult = await pool.query(`
      SELECT category, COUNT(*) AS count 
      FROM reports 
      GROUP BY category
    `);

    // Trend: last 6 months
    const trendResult = await pool.query(`
      SELECT TO_CHAR(DATE_TRUNC('month', created_at), 'Mon YYYY') AS month, 
             COUNT(*) AS reports
      FROM reports
      WHERE created_at >= NOW() - INTERVAL '6 months'
      GROUP BY month
      ORDER BY MIN(created_at)
    `);

    res.json({
      summary: {
        totalReports: Number(summary.total_reports) || 0,
        pending: Number(summary.pending) || 0,
        reviewed: Number(summary.reviewed) || 0,
        resolved: Number(summary.resolved) || 0,
      },
      byCategory: categoryResult.rows,
      trend: trendResult.rows,
    });
  } catch (error) {
    console.error("Error fetching report stats:", error);
    res.status(500).json({ message: "Error fetching report statistics." });
  }
});

// Update report status
export const updateReportStatus = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { status } = req.body;

  try {
    const result = await pool.query(
      `UPDATE reports SET status = $1, created_at = NOW() WHERE report_id = $2 RETURNING *`,
      [status, id]
    );

    if (result.rowCount === 0)
      return res.status(404).json({ message: "Report not found" });

    res.status(200).json({
      message: "Report status updated successfully",
      report: result.rows[0],
    });
  } catch (error) {
    console.error("Error updating report status:", error);
    res.status(500).json({ message: "Error updating report status." });
  }
});
