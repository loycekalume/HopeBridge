import express from "express";

import {updateBeneficiaryProfile} from "../controllers/beneficiaryController";
const router = express.Router();
router.put('/:userId/profile/beneficiary', updateBeneficiaryProfile);

export default router;