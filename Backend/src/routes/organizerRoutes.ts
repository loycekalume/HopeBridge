import express from "express";

import {getDeliveryLogs, getPendingVerifications, getVolunteerOverview, getVolunteerProfile, updateOrganizerProfile, updateVerificationStatus} from "../controllers/organizerController";
const router = express.Router();
router.get("/overview", getVolunteerOverview);
router.get("/pending-verifications", getPendingVerifications);
router.get("/delivery-logs", getDeliveryLogs);
router.put("/verify/:userId",updateVerificationStatus)
router.get("/:userId/profile", getVolunteerProfile);
router.put('/:userId/profile/organizer', updateOrganizerProfile);


export default router;