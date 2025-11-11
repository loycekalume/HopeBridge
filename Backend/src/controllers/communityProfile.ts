import { Request, Response } from "express";
import pool from "../db/db.config";
import asyncHandler from "../middlewares/asyncHandler";



// @desc    Update Community Profile (Completes Registration)
// @route   PUT /api/users/:userId/profile/community
// @access  Private 
export const updateCommunityProfile = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.params.userId; 
    const { org_focus, street_address, city, state_region, about_organization, gov_id_url, group_reg_cert_url } = req.body;
    
    // Enforcement: Check for all required fields
    if (!org_focus || !street_address || !city || !state_region || !gov_id_url || !group_reg_cert_url) {
        res.status(400).json({ message: "Missing required profile fields: Focus, Location, Representative ID, or Group Registration." });
        return;
    }
    
    const client = await pool.connect();
    
    try {
        await client.query('BEGIN');

        // 1. Insert/Update data into the new community_profiles table
        const profileQuery = `
            INSERT INTO community_profiles (user_id, org_focus, street_address, city, state_region, about_organization, gov_id_url, group_reg_cert_url)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
            ON CONFLICT (user_id) DO UPDATE
            SET org_focus = $2, street_address = $3, city = $4, state_region = $5, about_organization = $6, gov_id_url = $7, group_reg_cert_url = $8, updated_at = NOW()
            RETURNING user_id;
        `;
        await client.query(profileQuery, [userId, org_focus, street_address, city, state_region, about_organization, gov_id_url, group_reg_cert_url]);

        // 2. Flip the is_profile_complete flag in the users table
        const updatedUserResult = await client.query(
            `UPDATE users SET is_profile_complete = TRUE WHERE user_id = $1 RETURNING user_id, full_name, role, is_profile_complete;`, 
            [userId]
        );
        const updatedUser = updatedUserResult.rows[0];

        await client.query('COMMIT');
        
        res.status(200).json({
            message: "Community profile saved and marked as complete.",
            user: updatedUser,
        });

    } catch (error) {
        await client.query('ROLLBACK');
        console.error("Transaction Error updating community profile:", error);
        res.status(500).json({ message: "Failed to complete profile due to a server error." });
    } finally {
        client.release();
    }
});

// @desc Get Community Profile
// @route GET /api/users/:userId/profile/community
// @access Private
export const getCommunityProfile = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.params.userId;

  try {
    const result = await pool.query(
      `SELECT u.user_id, u.full_name, u.email, u.phone, 
       c.org_focus, c.street_address, c.city, c.state_region, 
       c.about_organization, c.verification_status 
FROM users u 
JOIN community_profiles c ON u.user_id = c.user_id 
WHERE u.user_id = $1;
`,
      [userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Community profile not found." });
    }

    res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error("Error fetching community profile:", error);
    res.status(500).json({ message: "Server error while fetching profile." });
  }
});

export const getAllCommunities = asyncHandler(async (req: Request, res: Response) => {
  try {
    const result = await pool.query(`
      SELECT 
        u.user_id, 
        u.full_name, 
        u.email, 
        u.phone, 
        u.created_at,
        c.org_focus, 
        c.street_address, 
        c.city, 
        c.state_region, 
        c.about_organization, 
        c.verification_status,
        c.fundraising_goal,
        c.total_raised,
        c.impact_description
      FROM users u
      JOIN community_profiles c ON u.user_id = c.user_id
      ORDER BY u.created_at DESC
    `);

    res.status(200).json({
      count: result.rows.length,
      communities: result.rows,
    });
  } catch (error) {
    console.error("Error fetching all community profiles:", error);
    res.status(500).json({ message: "Server error while fetching communities." });
  }
});

// @desc Update Community Profile
// @route PUT /api/users/:userId/profile/community
// @access Private
export const editCommunityProfile = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.params.userId;
  const { full_name, email, phone, org_focus, street_address, city, state_region, about_organization } = req.body;

  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // 1️⃣ Update users table safely with COALESCE
    const updateUser = `
      UPDATE users
      SET 
        full_name = COALESCE($1, full_name),
        email = COALESCE($2, email),
        phone = COALESCE($3, phone),
        updated_at = NOW()
      WHERE user_id = $4
      RETURNING user_id, full_name, email, phone, role;
    `;
    const updatedUserResult = await client.query(updateUser, [full_name, email, phone, userId]);
    const updatedUser = updatedUserResult.rows[0];

    // 2️⃣ Update community_profiles table safely with COALESCE
    const updateProfile = `
      UPDATE community_profiles
      SET 
        org_focus = COALESCE($1, org_focus),
        street_address = COALESCE($2, street_address),
        city = COALESCE($3, city),
        state_region = COALESCE($4, state_region),
        about_organization = COALESCE($5, about_organization),
        updated_at = NOW()
      WHERE user_id = $6
      RETURNING *;
    `;
    const updatedProfileResult = await client.query(updateProfile, [org_focus, street_address, city, state_region, about_organization, userId]);
    const updatedProfile = updatedProfileResult.rows[0];

    await client.query('COMMIT');

    res.status(200).json({
      message: "Community profile updated successfully",
      user: updatedUser,
      profile: updatedProfile
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error("Error updating community profile:", error);
    res.status(500).json({ message: "Server error while updating profile" });
  } finally {
    client.release();
  }
});