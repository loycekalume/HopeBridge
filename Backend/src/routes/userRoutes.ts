import express from "express";
import {
  getAllUsers,
  getUserById,
  getUsersByRole,
} from "../controllers/userController";

const router = express.Router();

router.get("/", getAllUsers);           
router.get("/:id", getUserById);        
router.get("/role/:role", getUsersByRole); 

export default router;
