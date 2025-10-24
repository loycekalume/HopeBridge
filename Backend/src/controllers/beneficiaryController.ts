
import { Request, Response } from "express";
import pool from "../db/db.config"; 
import asyncHandler from "../middlewares/asyncHandler"; 

// @desc    Update Beneficiary Profile (Completes Registration)
// @route   PUT /api/users/:userId/profile/beneficiary
// @access  Private 
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