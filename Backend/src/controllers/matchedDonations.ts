import { Request, Response } from "express";
import pool from "../db/db.config"; 
import asyncHandler from "../middlewares/asyncHandler"; 


export const getMatchedDonations = asyncHandler(async (req: Request, res: Response) => {
  const client = await pool.connect();

  try {
    const result = await client.query(`
      SELECT 
        d.donation_id,
        d.item_name,
        d.location,
        d.status,
        d.updated_at,
        donor.full_name AS donor_name,
        beneficiary.full_name AS beneficiary_name
      FROM donations d
      JOIN users donor ON d.donor_user_id = donor.user_id
      JOIN users beneficiary ON d.matched_beneficiary_id = beneficiary.user_id
      WHERE d.status IN ('Matched', 'In Transit', 'Delivered')
      ORDER BY d.updated_at DESC;
    `);

    res.status(200).json(result.rows);
  } catch (err) {
    console.error("Error fetching matched donations:", err);
    res.status(500).json({ message: "Failed to fetch matched donations" });
  } finally {
    client.release();
  }
});


export const updateMatchedDonationStatus = asyncHandler(async (req: Request, res: Response) => {
  const { donationId } = req.params;
  const { status } = req.body;

  const validStatuses = ["Matched", "In Transit", "Delivered", "Cancelled"];
  if (!validStatuses.includes(status)) {
    return res.status(400).json({ message: "Invalid status value" });
  }

  const client = await pool.connect();
  try {
    const result = await client.query(
      `
      UPDATE donations
      SET status = $1, updated_at = CURRENT_TIMESTAMP
      WHERE donation_id = $2
      RETURNING donation_id, item_name, status, updated_at;
      `,
      [status, donationId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Donation not found" });
    }

    res.status(200).json({
      message: "Donation status updated successfully",
      donation: result.rows[0],
    });
  } catch (err) {
    console.error("Error updating donation status:", err);
    res.status(500).json({ message: "Failed to update donation status" });
  } finally {
    client.release();
  }
});

export const markDonationAsDelivered = asyncHandler(async (req: Request, res: Response) => {
  const { donationId } = req.params;
  const client = await pool.connect();

  try {
    const result = await client.query(
      `
      UPDATE donations
      SET status = 'Delivered', updated_at = CURRENT_TIMESTAMP
      WHERE donation_id = $1
      RETURNING donation_id, item_name, status, updated_at;
      `,
      [donationId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Donation not found" });
    }

    res.status(200).json({
      message: "Donation marked as delivered successfully",
      donation: result.rows[0],
    });
  } catch (err) {
    console.error("Error marking donation as delivered:", err);
    res.status(500).json({ message: "Failed to mark donation as delivered" });
  } finally {
    client.release();
  }
});


export const deleteMatchedDonation = asyncHandler(async (req: Request, res: Response) => {
  const { donationId } = req.params;
  const client = await pool.connect();

  try {
    const result = await client.query(
      `DELETE FROM donations WHERE donation_id = $1 RETURNING donation_id, item_name;`,
      [donationId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Donation not found" });
    }

    res.status(200).json({
      message: "Donation deleted successfully",
      deleted: result.rows[0],
    });
  } catch (err) {
    console.error("Error deleting donation:", err);
    res.status(500).json({ message: "Failed to delete donation" });
  } finally {
    client.release();
  }
});

