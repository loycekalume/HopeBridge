import express, { RequestHandler } from "express";
import { getBeneficiaries, getDonorDashboard, getMyDonations, postNewDonation } from "../controllers/donationsController";
import { protect } from "../middlewares/auth/protect";
import { upload } from "../middlewares/upload";
console.log("🔥 donationRoutes loaded");



const router = express.Router();

// 👇 Cast to RequestHandler to avoid type conflict
router.post("/", protect, upload.array("photos", 5), postNewDonation as RequestHandler);
router.get("/donors/beneficiaries", protect, getBeneficiaries as RequestHandler);
router.get("/dashboard", protect, getDonorDashboard as RequestHandler);
router.get("/mydonations", protect, getMyDonations as RequestHandler);

export default router;
