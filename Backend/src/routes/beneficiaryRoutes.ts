import express from "express";

import {createBeneficiaryRequest, getAvailableDonations, getBeneficiaryStats, getMyBeneficiaryRequests, updateBeneficiaryProfile, updateProfile} from "../controllers/beneficiaryController";
import { protect, requireRole } from "../middlewares/auth/protect";
const router = express.Router();
router.post("/requests", protect,requireRole(["beneficiary"]) ,createBeneficiaryRequest);
router.get("/requests", protect,requireRole(["beneficiary","admin","donor"]), getMyBeneficiaryRequests);
router.get("/donations", protect,requireRole(["beneficiary","admin","donor"]), getAvailableDonations);
router.put("/profile", protect,requireRole(["beneficiary","admin"]), updateProfile);
router.get("/stats/:userId", protect,requireRole(["beneficiary","admin"]), getBeneficiaryStats);
router.put('/:userId/profile/beneficiary',requireRole(["beneficiary","admin"]), updateBeneficiaryProfile);


export default router;