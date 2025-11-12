import { Router } from "express";
import {
  getAllCampaigns,
  getCampaignById,
  createCampaign,
  updateCampaign,
  deleteCampaign,
  getCompanyImpacts,
} from "../controllers/campaigns";

const router = Router();

// =============================
// Company Campaign Routes
// Base path: /api/company/campaigns
// =============================

// Get all campaigns
router.get("/", getAllCampaigns);
// Create a new campaign
router.post("/", createCampaign);
// Get a single campaign by ID
router.get("/:campaignId", getCampaignById);

router.get("/impacts",  getCompanyImpacts);

// Update a campaign (partial update with COALESCE)
router.put("/:campaignId", updateCampaign);

// Delete a campaign
router.delete("/:campaignId", deleteCampaign);

export default router;
