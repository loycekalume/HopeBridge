import express from "express";
import {
  createEvent,
  updateEvent,
  deleteEvent,
  getEventById,
  getAllEvents,
} from "../controllers/communityEvents"; // adjust path

const router = express.Router();

// POST create new event
router.post("/", createEvent);

// GET all events
router.get("/", getAllEvents);

// GET single event by ID
router.get("/:eventId", getEventById);



// PUT update an event by ID
router.put("/:eventId", updateEvent);

// DELETE an event by ID
router.delete("/:eventId", deleteEvent);

export default router;
