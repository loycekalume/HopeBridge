import { Request, Response } from "express";
import pool from "../db/db.config";
import asyncHandler from "../middlewares/asyncHandler";

interface UserRequest extends Request {
  user?: {
    user_id: number;
    role: string;
  };
  files?: Express.Multer.File[];
}

// ✅ POST a new donation with image upload
export const postNewDonation = asyncHandler(async (req: UserRequest, res: Response) => {
  if (!req.user || !req.user.user_id) {
    res.status(401).json({ message: "Not authorized or user ID missing." });
    return;
  }

  const donorUserId = req.user.user_id;

  // Extract fields from form-data
  const { category, title, description, condition, quantity, location, availability } = req.body;

  // Validate input
  if (!category || !title || !condition || !quantity || !location) {
    res.status(400).json({ message: "Missing required donation fields." });
    return;
  }

  const finalQuantity = parseInt(quantity);
  if (isNaN(finalQuantity) || finalQuantity <= 0) {
    res.status(400).json({ message: "Quantity must be a positive number." });
    return;
  }

  // ✅ Handle uploaded files
  let photoUrls: string[] = [];
  if (req.files && req.files.length > 0) {
    photoUrls = (req.files as Express.Multer.File[]).map(
      (file) => `/uploads/${file.filename}`
    );
  }

  // Insert donation into DB
  const newDonation = await pool.query(
    `
      INSERT INTO donations (
        donor_user_id, item_name, category, description, item_condition, 
        quantity, location, availability, photo_urls, status
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 'Pending')
      RETURNING donation_id, item_name, created_at, status
    `,
    [
      donorUserId,
      title,
      category,
      description,
      condition,
      finalQuantity,
      location,
      availability,
      photoUrls,
    ]
  );

  res.status(201).json({
    message: "Donation posted successfully with images!",
    donation: newDonation.rows[0],
  });
});

export const getDonorDashboard = asyncHandler(async (req: UserRequest, res: Response) => {
    
    // Check for authenticated user presence
    if (!req.user || !req.user.user_id) {
        res.status(401).json({ message: "Not authorized or user ID missing." });
        return;
    }

    const userId = req.user.user_id; 

    // 1. Fetch Summary Statistics
    const statsQuery = `
        SELECT
            COUNT(d.donation_id) AS total_donations,
            COALESCE(SUM(CASE WHEN d.status = 'Delivered' THEN 1 ELSE 0 END), 0) AS beneficiaries_helped,
            COALESCE(SUM(CASE WHEN d.status = 'Matched' THEN 1 ELSE 0 END), 0) AS matched_donations_count
        FROM donations d
        WHERE d.donor_user_id = $1;
    `;
    const statsResult = await pool.query(statsQuery, [userId]);
    const stats = statsResult.rows[0];

    // 2. Fetch Recent Donations
    // 2. Fetch Recent Donations
const donationsQuery = `
    SELECT
        d.donation_id,
        d.item_name,
        d.category,
        d.created_at,
        d.status,
        d.photo_urls, 
        u.full_name AS matched_to
    FROM donations d
    LEFT JOIN users u ON d.matched_beneficiary_id = u.user_id
    WHERE d.donor_user_id = $1
    ORDER BY d.created_at DESC
   
`;

    const donationsResult = await pool.query(donationsQuery, [userId]);
    const recentDonations = donationsResult.rows;

    res.status(200).json({
        stats: {
            totalDonations: parseInt(stats.total_donations) || 0,
            // Assuming 'beneficiariesHelped' is the count of Delivered items for simplicity
            beneficiariesHelped: parseInt(stats.beneficiaries_helped) || 0, 
            matchedDonations: parseInt(stats.matched_donations_count) || 0,
            impactScore: '98%', // Placeholder score
        },
        recentDonations: recentDonations.map(d => ({
            ...d,
            matched_to: d.matched_to || 'Awaiting match'
        })),
    });
});