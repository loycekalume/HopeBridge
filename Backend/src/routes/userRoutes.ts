import express from "express";
import {
  deleteUser,
  getAllUsers,
  getUserById,
  getUsersByRole,
  updateUser,
} from "../controllers/userController";

const router = express.Router();

router.get("/", getAllUsers);           
router.get("/:id", getUserById);  
router.put("/:id", updateUser);    
router.delete("/:id", deleteUser);    
router.get("/role/:role", getUsersByRole); 

export default router;
