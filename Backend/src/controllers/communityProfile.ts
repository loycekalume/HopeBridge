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