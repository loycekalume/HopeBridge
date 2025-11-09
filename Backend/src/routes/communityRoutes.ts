import express from "express";

import {editCommunityProfile, getCommunityProfile, updateCommunityProfile} from "../controllers/communityProfile";
const router = express.Router();
router.put('/:userId/profile/community', updateCommunityProfile);
router.put('/:userId/profile', editCommunityProfile);
router.get('/:userId/profile/community', getCommunityProfile);

export default router;