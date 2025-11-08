import { Request, Response } from "express";
import pool from "../db/db.config"; 
import asyncHandler from "../middlewares/asyncHandler"; 

// @desc    Update Organizer Profile (Completes Registration)
// @route   PUT /api/users/:userId/profile/organizer
// @access  Private 
export const updateOrganizerProfile = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.params.userId; 
    const { organizer_type, street_address, city, state_region, about_me, gov_id_url, professional_cert_url } = req.body;
    
    // Enforcement: Check for all required fields
    if (!organizer_type || !street_address || !city || !state_region || !gov_id_url || !professional_cert_url) {
        res.status(400).json({ message: "Missing required profile fields: Type, Location, ID, or Professional Certificate." });
        return;
    }
    
    const client = await pool.connect();
    
    try {
        await client.query('BEGIN');

        // 1. Insert/Update data into the new organizer_profiles table
        const profileQuery = `
            INSERT INTO organizer_profiles (user_id, organizer_type, street_address, city, state_region, about_me, gov_id_url, professional_cert_url)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
            ON CONFLICT (user_id) DO UPDATE
            SET organizer_type = $2, street_address = $3, city = $4, state_region = $5, about_me = $6, gov_id_url = $7, professional_cert_url = $8, updated_at = NOW()
            RETURNING user_id;
        `;
        await client.query(profileQuery, [userId, organizer_type, street_address, city, state_region, about_me, gov_id_url, professional_cert_url]);

        // 2. Flip the is_profile_complete flag in the users table
        const updatedUserResult = await client.query(
            `UPDATE users SET is_profile_complete = TRUE WHERE user_id = $1 RETURNING user_id, full_name, role, is_profile_complete;`, 
            [userId]
        );
        const updatedUser = updatedUserResult.rows[0];

        await client.query('COMMIT');
        
        res.status(200).json({
            message: "Organizer profile saved and marked as complete.",
            user: updatedUser,
        });

    } catch (error) {
        await client.query('ROLLBACK');
        console.error("Transaction Error updating organizer profile:", error);
        res.status(500).json({ message: "Failed to complete profile due to a server error." });
    } finally {
        client.release();
    }
});

export const getVolunteerOverview = asyncHandler(async (req: Request, res: Response) => {
  const client = await pool.connect();

  try {
    const query = `
      SELECT 
        -- Count of verified donors
        (SELECT COUNT(*) FROM donor_profiles WHERE verification_status = 'Verified') AS verified_donors,

        -- Count of verified beneficiaries
        (SELECT COUNT(*) FROM beneficiary_profiles WHERE verification_status = 'Verified') AS verified_beneficiaries,

        -- Count of all pending verifications (across all profile tables)
        (
          (SELECT COUNT(*) FROM donor_profiles WHERE verification_status = 'Pending Review') +
          (SELECT COUNT(*) FROM beneficiary_profiles WHERE verification_status = 'Pending Review') +
          (SELECT COUNT(*) FROM organizer_profiles WHERE verification_status = 'Pending Review') +
          (SELECT COUNT(*) FROM community_profiles WHERE verification_status = 'Pending Review')
        ) AS pending_verifications,

        -- Count of matched donations
        (SELECT COUNT(*) FROM donations WHERE status = 'Matched') AS matched_donations
    `;

    const result = await client.query(query);
    const stats = result.rows[0];

    res.status(200).json({
      message: "Volunteer dashboard overview fetched successfully.",
      data: {
        verifiedDonors: parseInt(stats.verified_donors, 10),
        verifiedBeneficiaries: parseInt(stats.verified_beneficiaries, 10),
        pendingVerifications: parseInt(stats.pending_verifications, 10),
        matchedDonations: parseInt(stats.matched_donations, 10),
      },
    });
  } catch (error) {
    console.error("Error fetching volunteer overview:", error);
    res.status(500).json({ message: "Failed to fetch dashboard overview." });
  } finally {
    client.release();
  }
});


// =============================
// @desc    Get all pending verifications (Donors, Beneficiaries, Organizers, Communities)
// @route   GET /api/volunteer/pending
// @access  Private
// =============================
export const getPendingVerifications = asyncHandler(async (req: Request, res: Response) => {
  const client = await pool.connect();

  try {
    const query = `
      SELECT 
        u.user_id,
        u.full_name,
        u.role,
        dp.gov_id_url,
        NULL AS recommendation_letter_url,
        NULL AS proof_of_need_url,
        dp.verification_status
      FROM users u
      JOIN donor_profiles dp ON u.user_id = dp.user_id
      WHERE dp.verification_status = 'Pending Review'

      UNION ALL

      SELECT 
        u.user_id,
        u.full_name,
        u.role,
        bp.gov_id_url,
        bp.recommendation_letter_url,
        bp.proof_of_need_url,
        bp.verification_status
      FROM users u
      JOIN beneficiary_profiles bp ON u.user_id = bp.user_id
      WHERE bp.verification_status = 'Pending Review'

      UNION ALL

      SELECT 
        u.user_id,
        u.full_name,
        u.role,
        op.gov_id_url,
        op.professional_cert_url AS recommendation_letter_url,
        NULL AS proof_of_need_url,
        op.verification_status
      FROM users u
      JOIN organizer_profiles op ON u.user_id = op.user_id
      WHERE op.verification_status = 'Pending Review'

      UNION ALL

      SELECT 
        u.user_id,
        u.full_name,
        u.role,
        cp.gov_id_url,
        cp.group_reg_cert_url AS recommendation_letter_url,
        NULL AS proof_of_need_url,
        cp.verification_status
      FROM users u
      JOIN community_profiles cp ON u.user_id = cp.user_id
      WHERE cp.verification_status = 'Pending Review'
      ORDER BY full_name ASC;
    `;

    const result = await client.query(query);

    res.status(200).json(result.rows);
  } catch (error) {
    console.error("Error fetching pending verifications:", error);
    res.status(500).json({ message: "Error fetching pending verifications." });
  } finally {
    client.release();
  }
});


// =============================
// @desc    Get Delivery Logs
// @route   GET /api/volunteer/deliveries
// @access  Private
// =============================
export const getDeliveryLogs = asyncHandler(async (req: Request, res: Response) => {
  try {
    const client = await pool.connect();

    const result = await client.query(`
      SELECT 
        d.donation_id,
        d.item_name AS donation,
        u.full_name AS beneficiary,
        d.status
      FROM donations d
      JOIN users u ON d.matched_beneficiary_id = u.user_id
      ORDER BY d.updated_at DESC;
    `);

    client.release();

    res.status(200).json(result.rows);
  } catch (error) {
    console.error("Error fetching delivery logs:", error);
    res.status(500).json({ message: "Server error fetching delivery logs" });
  }
});

// =============================
// @desc    Approve or Reject Verification
// @route   PUT /api/volunteer/verify/:userId
// @access  Private
// =============================
export const updateVerificationStatus = asyncHandler(async (req: Request, res: Response) => {
  const { userId } = req.params;
  const { action } = req.body; // "approve" or "reject"

  if (!["approve", "reject"].includes(action)) {
    return res.status(400).json({ message: "Invalid action" });
  }

  const newStatus = action === "approve" ? "Verified" : "Rejected";
  const client = await pool.connect();

  try {
    // Determine the user's role
    const userResult = await client.query(
      "SELECT role FROM users WHERE user_id = $1",
      [userId]
    );

    if (userResult.rowCount === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    const role = userResult.rows[0].role;
    let tableName = "";

    switch (role) {
      case "donor":
        tableName = "donor_profiles";
        break;
      case "beneficiary":
        tableName = "beneficiary_profiles";
        break;
      case "organizer":
        tableName = "organizer_profiles";
        break;
      case "community":
        tableName = "community_profiles";
        break;
      default:
        return res.status(400).json({ message: "Role not verifiable" });
    }

    // Update the correct table
    await client.query(
      `UPDATE ${tableName} SET verification_status = $1, updated_at = NOW() WHERE user_id = $2`,
      [newStatus, userId]
    );

    res.status(200).json({ message: `${role} verification ${newStatus.toLowerCase()}` });
  } catch (error) {
    console.error("Error updating verification status:", error);
    res.status(500).json({ message: "Error updating verification status" });
  } finally {
    client.release();
  }
});

export const getVolunteerProfile = asyncHandler(async (req: Request, res: Response) => {
  const { userId } = req.params;
  const client = await pool.connect();

  try {
    const result = await client.query(
      `
      SELECT 
        u.user_id, 
        u.full_name, 
        u.phone, 
        u.email,
        op.organizer_type, 
        op.city, 
        op.state_region
      FROM users u
      LEFT JOIN organizer_profiles op ON u.user_id = op.user_id
      WHERE u.user_id = $1;
      `,
      [userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Volunteer not found" });
    }

    res.json(result.rows[0]);
  } finally {
    client.release();
  }
});


export const getApprovedProfiles = asyncHandler(async (req: Request, res: Response) => {
  const client = await pool.connect();

  try {
    const query = `
      SELECT 
        u.user_id,
        u.full_name,
        u.email,
        u.role,
        COALESCE(dp.city, bp.city, op.city, cp.city, 'N/A') AS city,
        CASE 
          WHEN dp.verification_status = 'Verified' THEN 'Donor'
          WHEN bp.verification_status = 'Verified' THEN 'Beneficiary'
          WHEN op.verification_status = 'Verified' THEN 'Organizer'
          WHEN cp.verification_status = 'Verified' THEN 'Community'
        END AS verified_role
      FROM users u
      LEFT JOIN donor_profiles dp ON u.user_id = dp.user_id
      LEFT JOIN beneficiary_profiles bp ON u.user_id = bp.user_id
      LEFT JOIN organizer_profiles op ON u.user_id = op.user_id
      LEFT JOIN community_profiles cp ON u.user_id = cp.user_id
      WHERE 
        dp.verification_status = 'Verified'
        OR bp.verification_status = 'Verified'
        OR op.verification_status = 'Verified'
        OR cp.verification_status = 'Verified'
      ORDER BY u.full_name ASC;
    `;

    const result = await client.query(query);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "No approved profiles found" });
    }

    res.json(result.rows);
  } catch (error) {
    console.error("Error fetching approved profiles:", error);
    res.status(500).json({ message: "Failed to fetch approved profiles" });
  } finally {
    client.release();
  }
});


export const revokeVerifiedProfile = asyncHandler(async (req: Request, res: Response) => {
  const { userId } = req.params;
  const client = await pool.connect();

  try {
    // 1️⃣ Determine user role
    const roleResult = await client.query(
      `SELECT role FROM users WHERE user_id = $1`,
      [userId]
    );

    if (roleResult.rows.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    const role = roleResult.rows[0].role;
    let tableName;

    switch (role) {
      case "donor":
        tableName = "donor_profiles";
        break;
      case "beneficiary":
        tableName = "beneficiary_profiles";
        break;
      case "organizer":
        tableName = "organizer_profiles";
        break;
      case "community":
        tableName = "community_profiles";
        break;
      default:
        return res.status(400).json({ message: "This role cannot be revoked" });
    }

    // 2️⃣ Update verification status to "Pending Review"
    const updateQuery = `
      UPDATE ${tableName}
      SET verification_status = 'Pending Review', updated_at = NOW()
      WHERE user_id = $1
      RETURNING user_id, verification_status;
    `;

    const updateResult = await client.query(updateQuery, [userId]);

    if (updateResult.rows.length === 0) {
      return res.status(404).json({ message: "Profile not found" });
    }

    res.json({
      message: "Verification revoked successfully",
      user: updateResult.rows[0],
    });
  } catch (error) {
    console.error("Error revoking verification:", error);
    res.status(500).json({ message: "Failed to revoke verification" });
  } finally {
    client.release();
  }
});

export const updateOrganizer = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.params.userId;
  const { phone, city, state_region, about_me } = req.body;

  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    // 🟢 Update users table (only phone can change)
    await client.query(
      `
      UPDATE users
      SET phone = COALESCE($1, phone), updated_at = NOW()
      WHERE user_id = $2;
      `,
      [phone, userId]
    );

    // 🟢 Update organizer_profiles table (use COALESCE)
    const updateProfileQuery = `
      UPDATE organizer_profiles
      SET city = COALESCE($1, city),
          state_region = COALESCE($2, state_region),
          about_me = COALESCE($3, about_me),
          updated_at = NOW()
      WHERE user_id = $4
      RETURNING *;
    `;
    const updatedProfileResult = await client.query(updateProfileQuery, [
      city,
      state_region,
      about_me,
      userId,
    ]);

    // 🟢 Fetch the updated phone from users table to include in response
    const userResult = await client.query(
      `SELECT full_name, email, phone FROM users WHERE user_id = $1;`,
      [userId]
    );
    const user = userResult.rows[0];

    await client.query("COMMIT");

    // Combine organizer_profiles + phone from users
    const updatedProfile = {
      ...updatedProfileResult.rows[0],
      phone: user.phone,
      full_name: user.full_name,
      email: user.email,
    };

    res.status(200).json({
      message: "Profile updated successfully.",
      profile: updatedProfile,
    });
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Error updating organizer profile:", error);
    res.status(500).json({ message: "Server error while updating profile." });
  } finally {
    client.release();
  }
});

