import express from "express";

import {updateOrganizerProfile} from "../controllers/organizerController";
const router = express.Router();
router.put('/:userId/profile/organizer', updateOrganizerProfile);

export default router;