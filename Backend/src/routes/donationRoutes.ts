import express, { RequestHandler } from "express";
import { getDonorDashboard, getMyDonations, postNewDonation } from "../controllers/donationsController";
import { protect } from "../middlewares/auth/protect";
import { upload } from "../middlewares/upload";

const router = express.Router();

// 👇 Cast to RequestHandler to avoid type conflict
router.post("/", protect, upload.array("photos", 5), postNewDonation as RequestHandler);
router.get("/dashboard", protect, getDonorDashboard as RequestHandler);
router.get("/mydonations", protect, getMyDonations as RequestHandler);

export default router;
