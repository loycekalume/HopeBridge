import express from "express";
import {
  getCommunityMembers,
  addCommunityMember,
  removeCommunityMember,
  getCommunityImpact,
} from "../controllers/communityMembers";

const router = express.Router();

router.get("/:communityId/members", getCommunityMembers);
router.post("/:communityId/members", addCommunityMember);
router.get("/:communityId/impact", getCommunityImpact);
router.delete("/:communityId/members/:userId", removeCommunityMember);

export default router;
