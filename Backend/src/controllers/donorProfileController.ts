

import { Request, Response } from "express";
import pool from "../db/db.config"; 
import asyncHandler from "../middlewares/asyncHandler"; 

// @desc    Update Donor Profile (Completes Registration)
// @route   PUT /api/users/:userId/profile/donor
// @access  Private (Assumes authentication middleware validates req.user.user_id matches :userId)
export const updateDonorProfile = asyncHandler(async (req: Request, res: Response) => {
    // Note: In a real app, middleware must ensure req.user.user_id matches req.params.userId
    const userId = req.params.userId; 
    const { street_address, city, state_region, about_you, gov_id_url } = req.body;

    if (!street_address || !city || !state_region || !gov_id_url) {
        res.status(400).json({ message: "Missing required profile fields." });
        return;
    }
    
    // Start a transaction to ensure both updates happen or neither does
    const client = await pool.connect();
    
    try {
        await client.query('BEGIN');

        // 1. Insert/Update data into the new donor_profiles table
        const profileQuery = `
            INSERT INTO donor_profiles (user_id, street_address, city, state_region, about_you, gov_id_url)
            VALUES ($1, $2, $3, $4, $5, $6)
            ON CONFLICT (user_id) DO UPDATE
            SET street_address = $2, city = $3, state_region = $4, about_you = $5, gov_id_url = $6, updated_at = NOW()
            RETURNING user_id;
        `;
        await client.query(profileQuery, [userId, street_address, city, state_region, about_you, gov_id_url]);

        // 2. Flip the is_profile_complete flag in the users table
        const userUpdateQuery = `
            UPDATE users SET is_profile_complete = TRUE 
            WHERE user_id = $1
            RETURNING user_id, full_name, role, is_profile_complete;
        `;
        const updatedUserResult = await client.query(userUpdateQuery, [userId]);
        const updatedUser = updatedUserResult.rows[0];

        await client.query('COMMIT');
        
        // Success: Return the updated user status to the frontend for context update
        res.status(200).json({
            message: "Donor profile saved and marked as complete.",
            user: updatedUser,
            // NOTE: In a real app, you would also refresh/regenerate the JWT token here
        });

    } catch (error) {
        await client.query('ROLLBACK');
        console.error("Transaction Error updating donor profile:", error);
        res.status(500).json({ message: "Failed to complete profile due to a server error." });
    } finally {
        client.release();
    }
});