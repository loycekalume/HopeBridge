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

//  POST a new donation with image upload
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

export const getMyDonations = asyncHandler(async (req: UserRequest, res: Response) => {
  if (!req.user || !req.user.user_id) {
    return res.status(401).json({ message: "Not authorized." });
  }

  const donorId = req.user.user_id;

  const donations = await pool.query(
    `
      SELECT 
        donation_id,
        item_name,
        category,
        created_at,
        status,
        photo_urls,
        quantity,
        location
      FROM donations
      WHERE donor_user_id = $1
      ORDER BY created_at DESC
    `,
    [donorId]
  );

  res.status(200).json({
    count: donations.rowCount,
    donations: donations.rows,
  });
});


export const updateDonation = asyncHandler(async (req: UserRequest, res: Response) => {
  if (!req.user || !req.user.user_id) {
    return res.status(401).json({ message: "Not authorized." });
  }

  const donorUserId = req.user.user_id;
  const { donationId } = req.params;
  const { title, category, description, condition, quantity, location, availability } = req.body;

  // Validate required fields
  if (!title && !category && !description && !condition && !quantity && !location && !availability && !req.files) {
    return res.status(400).json({ message: "No update data provided." });
  }

  // Check donation ownership
  const donationCheck = await pool.query(
    "SELECT * FROM donations WHERE donation_id = $1 AND donor_user_id = $2",
    [donationId, donorUserId]
  );

  if (donationCheck.rows.length === 0) {
    return res.status(404).json({ message: "Donation not found or not authorized to update." });
  }

  // Handle image updates
  let photoUrls: string[] = donationCheck.rows[0].photo_urls || [];

  if (req.files && (req.files as Express.Multer.File[]).length > 0) {
    const uploadedPhotos = (req.files as Express.Multer.File[]).map(
      (file) => `/uploads/${file.filename}`
    );
    // Append new images to existing ones (you can replace instead if you prefer)
    photoUrls = [...photoUrls, ...uploadedPhotos];
  }

  // Build dynamic update query
  const fields: string[] = [];
  const values: any[] = [];
  let index = 1;

  if (title) {
    fields.push(`item_name = $${index++}`);
    values.push(title);
  }
  if (category) {
    fields.push(`category = $${index++}`);
    values.push(category);
  }
  if (description) {
    fields.push(`description = $${index++}`);
    values.push(description);
  }
  if (condition) {
    fields.push(`item_condition = $${index++}`);
    values.push(condition);
  }
  if (quantity) {
    const qty = parseInt(quantity);
    if (isNaN(qty) || qty <= 0) {
      return res.status(400).json({ message: "Quantity must be a positive number." });
    }
    fields.push(`quantity = $${index++}`);
    values.push(qty);
  }
  if (location) {
    fields.push(`location = $${index++}`);
    values.push(location);
  }
  if (availability) {
    fields.push(`availability = $${index++}`);
    values.push(availability);
  }
  if (photoUrls.length > 0) {
    fields.push(`photo_urls = $${index++}`);
    values.push(photoUrls);
  }

  values.push(donationId, donorUserId);

  const updateQuery = `
    UPDATE donations
    SET ${fields.join(", ")}
    WHERE donation_id = $${index++} AND donor_user_id = $${index}
    RETURNING *;
  `;

  const result = await pool.query(updateQuery, values);

  res.status(200).json({
    message: "Donation updated successfully.",
    donation: result.rows[0],
  });
});

export const getBeneficiaries = asyncHandler(async (req: UserRequest, res: Response) => {
  const query = `
    SELECT 
      u.user_id,
      u.full_name,
      u.email,
      bp.primary_need,
      bp.street_address,
      bp.city,
      bp.state_region
    FROM users u
    JOIN beneficiary_profiles bp ON u.user_id = bp.user_id
    WHERE u.role = 'beneficiary'
    ORDER BY u.created_at DESC;
  `;

  const result = await pool.query(query);

  const beneficiaries = result.rows.map(b => ({
    user_id: b.user_id,
    full_name: b.full_name,
    email: b.email,
    primary_need: b.primary_need,
    location: `${b.street_address}, ${b.city}, ${b.state_region}`
  }));

  res.status(200).json({ count: beneficiaries.length, beneficiaries });
});
