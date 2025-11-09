import { Request, Response } from "express";
import pool from "../db/db.config";
import asyncHandler from "../middlewares/asyncHandler";


// CREATE /api/events
export const createEvent = asyncHandler(async (req: Request, res: Response) => {
    const { title, date, category, description, created_by } = req.body;

    // Validate required fields
    if (!title || !date || !category || !created_by) {
        res.status(400).json({ message: "Missing required fields: title, date, category, or created_by." });
        return;
    }

    const client = await pool.connect();
    try {
        await client.query("BEGIN");

        const insertQuery = `
            INSERT INTO events (title, date, category, description, created_by)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING *;
        `;

        const result = await client.query(insertQuery, [title, date, category, description, created_by]);

        await client.query("COMMIT");

        res.status(201).json({
            message: "Event created successfully.",
            event: result.rows[0],
        });
    } catch (error) {
        await client.query("ROLLBACK");
        console.error("Error creating event:", error);
        res.status(500).json({ message: "Server error while creating event." });
    } finally {
        client.release();
    }
});

// UPDATE /api/events/:eventId
export const updateEvent = asyncHandler(async (req: Request, res: Response) => {
    const eventId = req.params.eventId;
    const { title, date, category, description } = req.body;

    const client = await pool.connect();
    try {
        await client.query("BEGIN");

        const updateQuery = `
            UPDATE events
            SET 
                title = COALESCE($1, title),
                date = COALESCE($2, date),
                category = COALESCE($3, category),
                description = COALESCE($4, description),
                updated_at = NOW()
            WHERE event_id = $5
            RETURNING *;
        `;

        const result = await client.query(updateQuery, [title, date, category, description, eventId]);

        if (result.rows.length === 0) {
            await client.query("ROLLBACK");
            res.status(404).json({ message: "Event not found." });
            return;
        }

        await client.query("COMMIT");

        res.status(200).json({
            message: "Event updated successfully.",
            event: result.rows[0],
        });
    } catch (error) {
        await client.query("ROLLBACK");
        console.error("Error updating event:", error);
        res.status(500).json({ message: "Server error while updating event." });
    } finally {
        client.release();
    }
});

// DELETE /api/events/:eventId
export const deleteEvent = asyncHandler(async (req: Request, res: Response) => {
    const eventId = req.params.eventId;
    const client = await pool.connect();
    try {
        await client.query("BEGIN");

        const deleteQuery = `DELETE FROM events WHERE event_id = $1 RETURNING *;`;
        const result = await client.query(deleteQuery, [eventId]);

        if (result.rows.length === 0) {
            await client.query("ROLLBACK");
            res.status(404).json({ message: "Event not found." });
            return;
        }

        await client.query("COMMIT");

        res.status(200).json({ message: "Event deleted successfully." });
    } catch (error) {
        await client.query("ROLLBACK");
        console.error("Error deleting event:", error);
        res.status(500).json({ message: "Server error while deleting event." });
    } finally {
        client.release();
    }
});

// GET /api/events/:eventId
export const getEventById = asyncHandler(async (req: Request, res: Response) => {
    const eventId = req.params.eventId;
    const client = await pool.connect();
    try {
        const result = await client.query(`SELECT * FROM events WHERE event_id = $1;`, [eventId]);
        if (result.rows.length === 0) {
            res.status(404).json({ message: "Event not found." });
            return;
        }
        res.status(200).json(result.rows[0]);
    } catch (error) {
        console.error("Error fetching event:", error);
        res.status(500).json({ message: "Server error while fetching event." });
    } finally {
        client.release();
    }
});

// GET /api/events - list all
export const getAllEvents = asyncHandler(async (req: Request, res: Response) => {
    const client = await pool.connect();
    try {
        const result = await client.query(`SELECT * FROM events ORDER BY date ASC;`);
        res.status(200).json(result.rows);
    } catch (error) {
        console.error("Error fetching events:", error);
        res.status(500).json({ message: "Server error while fetching events." });
    } finally {
        client.release();
    }
});