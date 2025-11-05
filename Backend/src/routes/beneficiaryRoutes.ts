import express from "express";

import {createBeneficiaryRequest, getMyBeneficiaryRequests, updateBeneficiaryProfile} from "../controllers/beneficiaryController";
import { protect } from "../middlewares/auth/protect";
const router = express.Router();
router.post("/requests", protect, createBeneficiaryRequest);
router.get("/requests", protect, getMyBeneficiaryRequests);
router.put('/:userId/profile/beneficiary', updateBeneficiaryProfile);


export default router;