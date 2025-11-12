import express from "express";
import { createReport, getAllReports, getReportsStats, updateReportStatus } from "../controllers/reportsController";


const router = express.Router();

router.post("/",  createReport);
router.get("/",  getAllReports);
router.get("/stats",  getReportsStats);
router.put("/:id",  updateReportStatus);

export default router;
