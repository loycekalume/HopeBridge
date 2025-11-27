import { Router } from "express";
import { protect, requireRole } from "../middlewares/auth/protect";
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



router.get("/", protect, requireRole(["company","admin"]), getAllCampaigns);
router.post("/", protect, requireRole("company"), createCampaign);
router.get("/:campaignId", protect, requireRole("company"), getCampaignById);
router.put("/:campaignId", protect, requireRole("company"), updateCampaign);
router.delete("/:campaignId", protect, requireRole("company"), deleteCampaign);
router.get("/impacts", protect, requireRole("company"), getCompanyImpacts);

export default router;
