import express from "express";
import {
  deleteUser,
  getAllUsers,
  getUserById,
  getUsersByRole,
  updateUser,
} from "../controllers/userController";
import { requireRole,protect } from "../middlewares/auth/protect";

const router = express.Router();

router.get("/",protect,requireRole("admin" ), getAllUsers);           
router.get("/:id",protect,requireRole("admin" ), getUserById);  
router.put("/:id",protect,requireRole("admin" ), updateUser);    
router.delete("/:id",protect,requireRole("admin" ), deleteUser);    
router.get("/role/:role",protect,requireRole("admin" ), getUsersByRole); 

export default router;
