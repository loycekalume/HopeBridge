import express from "express";

import {updateCommunityProfile} from "../controllers/communityProfile";
const router = express.Router();
router.put('/:userId/profile/community', updateCommunityProfile);

export default router;