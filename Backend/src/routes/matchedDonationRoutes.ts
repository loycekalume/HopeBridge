import express from "express";
import {
  getMatchedDonations,
  updateMatchedDonationStatus,
  markDonationAsDelivered,
  deleteMatchedDonation,
} from "../controllers/matchedDonations";
import { protect } from "../middlewares/auth/protect";

const router = express.Router();

// GET all matched donations
router.get("/matched-donations",  getMatchedDonations);

// PUT update donation status
router.put("/matched-donations/:donationId", updateMatchedDonationStatus);

// PUT mark as delivered
router.put("/matched-donations/:donationId/deliver",  markDonationAsDelivered);

// DELETE a donation
router.delete("/matched-donations/:donationId",  deleteMatchedDonation);

export default router;
