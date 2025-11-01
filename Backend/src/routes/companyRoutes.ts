import express from "express";

import {updateCompanyProfile} from "../controllers/companyController";
const router = express.Router();
router.put('/:userId/profile/company', updateCompanyProfile);

export default router;