import { Request, Response } from "express";
import pool from "../db/db.config";
import asyncHandler from "../middlewares/asyncHandler";

// ✅ GET all members of a community
export const getCommunityMembers = asyncHandler(async (req: Request, res: Response) => {
  const { communityId } = req.params;
  const client = await pool.connect();

  try {
    const query = `
      SELECT 
        cm.id,
        cm.user_id,
        u.full_name,
        u.email,
        u.role AS user_role,
        cm.role AS community_role,
        cm.joined_at
      FROM community_members cm
      JOIN users u ON u.user_id = cm.user_id
      WHERE cm.community_id = $1
      ORDER BY cm.joined_at DESC;
    `;
    const result = await client.query(query, [communityId]);
    res.status(200).json({ members: result.rows });
  } catch (error) {
    console.error("Error fetching community members:", error);
    res.status(500).json({ message: "Failed to fetch community members." });
  } finally {
    client.release();
  }
});


// ✅ ADD a member to a community (by email)
export const addCommunityMember = asyncHandler(async (req: Request, res: Response) => {
  const { communityId } = req.params;
  const { email, role } = req.body;

  if (!email || !role) {
    res.status(400).json({ message: "Email and role are required." });
    return;
  }

  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    // 1️⃣ Find user by email
    const userResult = await client.query(
      `SELECT user_id, full_name, email FROM users WHERE email = $1;`,
      [email]
    );

    if (userResult.rows.length === 0) {
      await client.query("ROLLBACK");
      res.status(404).json({ message: "No user found with that email." });
      return;
    }

    const userId = userResult.rows[0].user_id;

    // 2️⃣ Check if already a member
    const checkExisting = await client.query(
      `SELECT * FROM community_members WHERE community_id = $1 AND user_id = $2;`,
      [communityId, userId]
    );

    if (checkExisting.rows.length > 0) {
      await client.query("ROLLBACK");
      res.status(400).json({ message: "User is already a member of this community." });
      return;
    }

    // 3️⃣ Insert into community_members
    const insertQuery = `
      INSERT INTO community_members (community_id, user_id, role)
      VALUES ($1, $2, $3)
      RETURNING id, user_id, role, joined_at;
    `;
    const result = await client.query(insertQuery, [communityId, userId, role]);

    await client.query("COMMIT");

    res.status(201).json({
      message: "Member added successfully.",
      member: {
        ...result.rows[0],
        email: userResult.rows[0].email,
        full_name: userResult.rows[0].full_name,
      },
    });
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Error adding community member:", error);
    res.status(500).json({ message: "Server error while adding community member." });
  } finally {
    client.release();
  }
});


// ✅ DELETE a member (by user_id)
export const removeCommunityMember = asyncHandler(async (req: Request, res: Response) => {
  const { communityId, userId } = req.params;

  const client = await pool.connect();
  try {
    const result = await client.query(
      `DELETE FROM community_members WHERE community_id = $1 AND user_id = $2 RETURNING *;`,
      [communityId, userId]
    );

    if (result.rows.length === 0) {
      res.status(404).json({ message: "Member not found in this community." });
      return;
    }

    res.status(200).json({ message: "Member removed successfully." });
  } catch (error) {
    console.error("Error removing community member:", error);
    res.status(500).json({ message: "Server error while removing member." });
  } finally {
    client.release();
  }
});


export const getCommunityImpact = asyncHandler(async (req: Request, res: Response) => {
  const { communityId } = req.params;
  const client = await pool.connect();

  try {
    const eventsQuery = `SELECT COUNT(*) AS total_events FROM events WHERE created_by = $1;`;
    const eventsRes = await client.query(eventsQuery, [communityId]);

    const membersQuery = `SELECT COUNT(*) AS total_members FROM community_members WHERE community_id = $1;`;
    const membersRes = await client.query(membersQuery, [communityId]);

    const volunteersQuery = `SELECT COUNT(*) AS total_volunteers FROM community_members WHERE community_id = $1 AND role = 'volunteer';`;
    const volunteersRes = await client.query(volunteersQuery, [communityId]);

    const impactData = {
      totalEvents: parseInt(eventsRes.rows[0].total_events),
      totalMembers: parseInt(membersRes.rows[0].total_members),
      totalVolunteers: parseInt(volunteersRes.rows[0].total_volunteers),
      // totalDonations: future field if donations are tracked
    };

    res.status(200).json(impactData);
  } catch (error) {
    console.error("Error fetching community impact:", error);
    res.status(500).json({ message: "Failed to fetch community impact." });
  } finally {
    client.release();
  }
});