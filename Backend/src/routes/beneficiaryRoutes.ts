import express from "express";

import {createBeneficiaryRequest, getAvailableDonations, getBeneficiaryStats, getMyBeneficiaryRequests, updateBeneficiaryProfile} from "../controllers/beneficiaryController";
import { protect } from "../middlewares/auth/protect";
const router = express.Router();
router.post("/requests", protect, createBeneficiaryRequest);
router.get("/requests", protect, getMyBeneficiaryRequests);
router.get("/donations", protect, getAvailableDonations);
router.get("/stats/:userId", protect, getBeneficiaryStats);
router.put('/:userId/profile/beneficiary', updateBeneficiaryProfile);


export default router;