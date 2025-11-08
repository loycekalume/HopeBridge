import express from "express";

import {getApprovedProfiles, getDeliveryLogs, getPendingVerifications, getVolunteerOverview, getVolunteerProfile, revokeVerifiedProfile, updateOrganizer, updateOrganizerProfile, updateVerificationStatus} from "../controllers/organizerController";
const router = express.Router();
router.get("/overview", getVolunteerOverview);
router.get("/pending-verifications", getPendingVerifications);
router.get("/delivery-logs", getDeliveryLogs);
router.get("/approved", getApprovedProfiles);
router.put("/revoke/:userId", revokeVerifiedProfile);
router.put("/:userId/profile", updateOrganizer);
router.put("/verify/:userId",updateVerificationStatus)
router.get("/:userId/profile", getVolunteerProfile);
router.put('/:userId/profile/organizer', updateOrganizerProfile);


export default router;