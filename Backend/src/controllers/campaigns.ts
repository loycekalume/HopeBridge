import { Request, Response } from "express";
import pool from "../db/db.config";
import asyncHandler from "../middlewares/asyncHandler";

// =============================
// @desc    Create a new campaign
// @route   POST /api/company/campaigns
// @access  Private
// =============================
export const createCampaign = asyncHandler(async (req: Request, res: Response) => {
  const { title, description, goal_amount, start_date, end_date } = req.body;

  if (!title || !description || !goal_amount || !start_date || !end_date) {
    return res.status(400).json({ message: "Missing required fields." });
  }

  const client = await pool.connect();
  try {
    const result = await client.query(
      `
      INSERT INTO campaigns (title, description, goal_amount, start_date, end_date, status)
      VALUES ($1, $2, $3, $4, $5, 'Pending')
      RETURNING *;
      `,
      [title, description, goal_amount, start_date, end_date]
    );

    res.status(201).json({
      message: "Campaign created successfully.",
      campaign: result.rows[0],
    });
  } finally {
    client.release();
  }
});


export const getAllCampaigns = asyncHandler(async (req: Request, res: Response) => {
  const client = await pool.connect();

  try {
    const result = await client.query(
      `
      SELECT *
      FROM campaigns
      ORDER BY created_at DESC;
      `
    );

    res.status(200).json({
      count: result.rows.length,
      campaigns: result.rows,
    });
  } finally {
    client.release();
  }
});

// =============================
// @desc    Get a single campaign by ID
// @route   GET /api/company/campaigns/:campaignId
// @access  Private
// =============================
export const getCampaignById = asyncHandler(async (req: Request, res: Response) => {
  const { campaignId } = req.params;
  const client = await pool.connect();

  try {
    const result = await client.query(
      `
      SELECT *
      FROM campaigns
      WHERE campaign_id = $1;
      `,
      [campaignId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Campaign not found." });
    }

    res.status(200).json(result.rows[0]);
  } finally {
    client.release();
  }
});
// =============================
// @desc    Update a campaign
// @route   PUT /api/company/campaigns/:campaignId
// @access  Private
// =============================
export const updateCampaign = asyncHandler(async (req: Request, res: Response) => {
  const { campaignId } = req.params;
  const { title, description, goal_amount, total_raised, start_date, end_date, status } = req.body;

  const client = await pool.connect();
  try {
    const result = await client.query(
      `
      UPDATE campaigns
      SET
        title = COALESCE($1, title),
        description = COALESCE($2, description),
        goal_amount = COALESCE($3, goal_amount),
        total_raised = COALESCE($4, total_raised),
        start_date = COALESCE($5, start_date),
        end_date = COALESCE($6, end_date),
        status = COALESCE($7, status),
        updated_at = NOW()
      WHERE campaign_id = $8
      RETURNING *;
      `,
      [title, description, goal_amount, total_raised, start_date, end_date, status, campaignId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Campaign not found." });
    }

    res.status(200).json({
      message: "Campaign updated successfully.",
      campaign: result.rows[0],
    });
  } finally {
    client.release();
  }
});



// =============================
// @desc    Delete a campaign
// @route   DELETE /api/company/campaigns/:campaignId
// @access  Private
// =============================
export const deleteCampaign = asyncHandler(async (req: Request, res: Response) => {
  const { campaignId } = req.params;
  const client = await pool.connect();

  try {
    const result = await client.query(
      `
      DELETE FROM campaigns
      WHERE campaign_id = $1
      RETURNING *;
      `,
      [campaignId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Campaign not found." });
    }

    res.status(200).json({
      message: "Campaign deleted successfully.",
      campaign: result.rows[0],
    });
  } finally {
    client.release();
  }
});

export const getCompanyImpacts = asyncHandler(async (req: Request, res: Response) => {
  const { companyId } = req.query; // pass companyId via query, e.g. /api/company/impacts?companyId=1

  if (!companyId) {
    return res.status(400).json({ message: "Missing companyId in request." });
  }

  const client = await pool.connect();
  try {
    // 1️⃣ Total donations + beneficiaries per campaign
    const campaignRes = await client.query(
      `
      SELECT 
        c.title AS campaign_name,
        COALESCE(SUM(d.amount), 0) AS total_donations,
        COALESCE(SUM(i.beneficiaries_count), 0) AS total_beneficiaries
      FROM campaigns c
      LEFT JOIN donations d ON c.campaign_id = d.campaign_id
      LEFT JOIN impacts i ON c.campaign_id = i.campaign_id
      WHERE c.company_id = $1
      GROUP BY c.title
      ORDER BY total_donations DESC;
      `,
      [companyId]
    );

    // 2️⃣ Monthly donations (for line chart)
    const monthlyRes = await client.query(
      `
      SELECT 
        TO_CHAR(d.created_at, 'Mon') AS month,
        COALESCE(SUM(d.amount), 0) AS donations
      FROM donations d
      INNER JOIN campaigns c ON c.campaign_id = d.campaign_id
      WHERE c.company_id = $1
      GROUP BY month, DATE_PART('month', d.created_at)
      ORDER BY DATE_PART('month', d.created_at);
      `,
      [companyId]
    );

    res.status(200).json({
      campaignImpacts: campaignRes.rows,
      monthlyImpact: monthlyRes.rows,
    });
  } finally {
    client.release();
  }
});
