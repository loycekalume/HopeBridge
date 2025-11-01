
import { Request, Response } from "express";
import pool from "../db/db.config"; 
import asyncHandler from "../middlewares/asyncHandler"; 

// @desc    Update Company Profile (Completes Registration)
// @route   PUT /api/users/:userId/profile/company
// @access  Private 
export const updateCompanyProfile = asyncHandler(async (req: Request, res: Response) => {
    // In a real app, middleware must ensure req.user.user_id matches req.params.userId
    const userId = req.params.userId; 
    const { street_address, city, state_region, about_you, gov_id_url, registration_cert_url } = req.body;
    
    // Enforcement: Check for all required corporate fields
    if (!street_address || !city || !state_region || !gov_id_url || !registration_cert_url) {
        res.status(400).json({ message: "Missing required profile fields: Location, Representative ID, or Registration Certificate." });
        return;
    }
    
    const client = await pool.connect();
    
    try {
        await client.query('BEGIN');

        // 1. Insert/Update data into the new company_profiles table
        const profileQuery = `
            INSERT INTO company_profiles (user_id, street_address, city, state_region, about_company, gov_id_url, registration_cert_url)
            VALUES ($1, $2, $3, $4, $5, $6, $7)
            ON CONFLICT (user_id) DO UPDATE
            SET street_address = $2, city = $3, state_region = $4, about_company = $5, gov_id_url = $6, registration_cert_url = $7, updated_at = NOW()
            RETURNING user_id;
        `;
        // Note: The frontend sends 'about_you', which we map to the 'about_company' column here
        await client.query(profileQuery, [userId, street_address, city, state_region, about_you, gov_id_url, registration_cert_url]);

        // 2. Flip the is_profile_complete flag in the users table
        const updatedUserResult = await client.query(
            `UPDATE users SET is_profile_complete = TRUE WHERE user_id = $1 RETURNING user_id, full_name, role, is_profile_complete;`, 
            [userId]
        );
        const updatedUser = updatedUserResult.rows[0];

        await client.query('COMMIT');
        
        res.status(200).json({
            message: "Company profile saved and marked as complete.",
            user: updatedUser,
        });

    } catch (error) {
        await client.query('ROLLBACK');
        console.error("Transaction Error updating company profile:", error);
        res.status(500).json({ message: "Failed to complete profile due to a server error." });
    } finally {
        client.release();
    }
});