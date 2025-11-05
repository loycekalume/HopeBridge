
import { Request, Response } from "express";
import pool from "../db/db.config"; 
import asyncHandler from "../middlewares/asyncHandler"; 

// @desc    Update Beneficiary Profile (Completes Registration)
// @route   PUT /api/users/:userId/profile/beneficiary
// @access  Private 
export const createBeneficiaryRequest = asyncHandler(async (req: Request, res: Response) => {
  const beneficiaryId = (req as any).user?.user_id; // assuming auth middleware sets req.user
  const {
    category,
    title,
    description,
    urgency_level,
    quantity,
    location,
    household_size,
    can_pickup,
    needs_delivery,
    flexible_condition,
  } = req.body;

  if (!beneficiaryId || !category || !title || !description || !location) {
    res.status(400).json({
      message: "Missing required fields: category, title, description, or location.",
    });
    return;
  }

  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const insertQuery = `
      INSERT INTO beneficiary_requests 
        (beneficiary_id, category, title, description, urgency_level, quantity, location, household_size, can_pickup, needs_delivery, flexible_condition)
      VALUES 
        ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING request_id, beneficiary_id, title, category, status, created_at;
    `;

    const result = await client.query(insertQuery, [
      beneficiaryId,
      category,
      title,
      description,
      urgency_level || null,
      quantity || 1,
      location,
      household_size || null,
      can_pickup || false,
      needs_delivery || false,
      flexible_condition || false,
    ]);

    await client.query("COMMIT");

    res.status(201).json({
      message: "Help request submitted successfully.",
      request: result.rows[0],
    });
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Transaction Error submitting beneficiary request:", error);
    res.status(500).json({
      message: "Failed to submit request due to a server error.",
    });
  } finally {
    client.release();
  }
});

// @desc    Get all requests by the logged-in beneficiary
// @route   GET /api/beneficiary/requests
// @access  Private
export const getMyBeneficiaryRequests = asyncHandler(async (req: Request, res: Response) => {
  const beneficiaryId = (req as any).user?.user_id;

  if (!beneficiaryId) {
    res.status(401).json({ message: "User not authenticated." });
    return;
  }

  try {
    const result = await pool.query(
      `
      SELECT request_id, category, title, description, urgency_level, quantity,
             location, household_size, status, created_at
      FROM beneficiary_requests
      WHERE beneficiary_id = $1
      ORDER BY created_at DESC;
      `,
      [beneficiaryId]
    );

    res.status(200).json({
      count: result.rowCount,
      requests: result.rows,
    });
  } catch (error) {
    console.error("Error fetching beneficiary requests:", error);
    res.status(500).json({
      message: "Failed to retrieve beneficiary requests.",
    });
  }
});


export const updateBeneficiaryProfile = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.params.userId; 
    const { street_address, city, state_region, about_you_needs, gov_id_url, recommendation_letter_url, proof_of_need_url } = req.body;

    if (!street_address || !city || !gov_id_url || !proof_of_need_url) {
        res.status(400).json({ message: "Missing required profile fields (Location, ID, Proof of Need)." });
        return;
    }
    
    const client = await pool.connect();
    
    try {
        await client.query('BEGIN');

        // 1. Insert/Update data into the new beneficiary_profiles table
        const profileQuery = `
            INSERT INTO beneficiary_profiles (user_id, street_address, city, state_region, about_you_needs, gov_id_url, recommendation_letter_url, proof_of_need_url)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
            ON CONFLICT (user_id) DO UPDATE
            SET street_address = $2, city = $3, state_region = $4, about_you_needs = $5, gov_id_url = $6, recommendation_letter_url = $7, proof_of_need_url = $8, updated_at = NOW()
            RETURNING user_id;
        `;
        await client.query(profileQuery, [userId, street_address, city, state_region, about_you_needs, gov_id_url, recommendation_letter_url, proof_of_need_url]);

        // 2. Flip the is_profile_complete flag in the users table
        const updatedUserResult = await client.query(
            `UPDATE users SET is_profile_complete = TRUE WHERE user_id = $1 RETURNING user_id, full_name, role, is_profile_complete;`, 
            [userId]
        );
        const updatedUser = updatedUserResult.rows[0];

        await client.query('COMMIT');
        
        res.status(200).json({
            message: "Beneficiary profile saved and marked as complete.",
            user: updatedUser,
        });

    } catch (error) {
        await client.query('ROLLBACK');
        console.error("Transaction Error updating beneficiary profile:", error);
        res.status(500).json({ message: "Failed to complete profile due to a server error." });
    } finally {
        client.release();
    }
});



// @desc    Get Beneficiary Stats
// @route   GET /api/beneficiary/stats/:userId
// @access  Private
export const getBeneficiaryStats = asyncHandler(async (req: Request, res: Response) => {
  const { userId } = req.params;

  const client = await pool.connect();
  try {
    const [activeRes, matchedRes, completedRes] = await Promise.all([
      client.query(`SELECT COUNT(*) FROM beneficiary_requests WHERE beneficiary_id = $1 AND status = 'Pending'`, [userId]),
      client.query(`SELECT COUNT(*) FROM beneficiary_requests WHERE beneficiary_id = $1 AND status = 'Matched'`, [userId]),
      client.query(`SELECT COUNT(*) FROM beneficiary_requests WHERE beneficiary_id = $1 AND status = 'Completed'`, [userId]),
    ]);

    res.status(200).json({
      active_requests: parseInt(activeRes.rows[0].count),
      matched_donations: parseInt(matchedRes.rows[0].count),
      items_received: parseInt(completedRes.rows[0].count),
    });
  } catch (err) {
    console.error("Error fetching beneficiary stats:", err);
    res.status(500).json({ message: "Failed to fetch stats" });
  } finally {
    client.release();
  }
});
