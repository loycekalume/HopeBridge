import { Response } from "express";
import pool from "../db/db.config";
import asyncHandler from "../middlewares/asyncHandler";
import { UserRequest } from "../utils/types/userTypes";

// =============================
// @desc    Create a new campaign
// @route   POST /api/company/campaigns
// @access  Private (Company only)
// =============================
export const createCampaign = asyncHandler(async (req: UserRequest, res: Response) => {
  const { title, description, goal_amount, start_date, end_date } = req.body;
  const companyId = req.user!.user_id;

  if (!title || !description || !goal_amount || !start_date || !end_date) {
    return res.status(400).json({ message: "Missing required fields." });
  }

  const client = await pool.connect();
  try {
    const result = await client.query(
      `
      INSERT INTO campaigns (title, description, goal_amount, start_date, end_date, status, company_id)
      VALUES ($1, $2, $3, $4, $5, 'Pending', $6)
      RETURNING *;
      `,
      [title, description, goal_amount, start_date, end_date, companyId]
    );

    res.status(201).json({
      message: "Campaign created successfully.",
      campaign: result.rows[0],
    });
  } finally {
    client.release();
  }
});

// =============================
// @desc    Get all campaigns for the logged-in company
// @route   GET /api/company/campaigns
// @access  Private (Company only)
// =============================
export const getAllCampaigns = asyncHandler(async (req: UserRequest, res: Response) => {
  const companyId = req.user!.user_id;
  const client = await pool.connect();

  try {
    const result = await client.query(
      `
      SELECT *
      FROM campaigns
      WHERE company_id = $1
      ORDER BY created_at DESC;
      `,
      [companyId]
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
// @desc    Get a single campaign by ID (only if owned by company)
// @route   GET /api/company/campaigns/:campaignId
// @access  Private (Company only)
// =============================
export const getCampaignById = asyncHandler(async (req: UserRequest, res: Response) => {
  const { campaignId } = req.params;
  const companyId = req.user!.user_id;
  const client = await pool.connect();

  try {
    const result = await client.query(
      `
      SELECT *
      FROM campaigns
      WHERE campaign_id = $1 AND company_id = $2;
      `,
      [campaignId, companyId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Campaign not found or access denied." });
    }

    res.status(200).json(result.rows[0]);
  } finally {
    client.release();
  }
});

// =============================
// @desc    Update a campaign (only if owned by company)
// @route   PUT /api/company/campaigns/:campaignId
// @access  Private (Company only)
// =============================
export const updateCampaign = asyncHandler(async (req: UserRequest, res: Response) => {
  const { campaignId } = req.params;
  const companyId = req.user!.user_id;
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
      WHERE campaign_id = $8 AND company_id = $9
      RETURNING *;
      `,
      [title, description, goal_amount, total_raised, start_date, end_date, status, campaignId, companyId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Campaign not found or access denied." });
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
// @desc    Delete a campaign (only if owned by company)
// @route   DELETE /api/company/campaigns/:campaignId
// @access  Private (Company only)
// =============================
export const deleteCampaign = asyncHandler(async (req: UserRequest, res: Response) => {
  const { campaignId } = req.params;
  const companyId = req.user!.user_id;
  const client = await pool.connect();

  try {
    const result = await client.query(
      `
      DELETE FROM campaigns
      WHERE campaign_id = $1 AND company_id = $2
      RETURNING *;
      `,
      [campaignId, companyId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Campaign not found or access denied." });
    }

    res.status(200).json({
      message: "Campaign deleted successfully.",
      campaign: result.rows[0],
    });
  } finally {
    client.release();
  }
});



export const getCompanyImpacts = asyncHandler(async (req: UserRequest, res: Response) => {
  const companyId = req.user!.user_id; // get company ID from logged-in user
  const client = await pool.connect();

  try {
    // Total donations + beneficiaries per campaign
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

    // Monthly donations for line chart
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