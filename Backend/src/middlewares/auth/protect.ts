import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import asyncHandler from "../asyncHandler";
import pool from "../../db/db.config";
import { UserRequest } from "../../utils/types/userTypes";

dotenv.config();

interface JwtPayload {
  userId: number;
  role: string;
}

export const protect = asyncHandler(async (req: UserRequest, res: Response, next: NextFunction) => {

  let token = null;

  if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
    token = req.headers.authorization.split(" ")[1];
  }


  // console.log("Incoming token:", token);
  // console.log("Cookies:", req.cookies);
  // console.log("Auth Header:", req.headers.authorization);

  if (!token) {
    console.log("No token found in request");
    res.status(401).json({ message: "Not authorized, no token" });
    return;
  }

  try {
    // ✅ Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;

    // ✅ Query user from DB
    const userQuery = await pool.query(
      "SELECT user_id, email, full_name, phone, role FROM users WHERE user_id = $1",
      [decoded.userId]
    );

    if (userQuery.rows.length === 0) {
      res.status(401).json({ message: "Not authorized, user not found" });
      return;
    }

    // ✅ Attach user info to the request
    req.user = userQuery.rows[0];
    next();
  } catch (error) {
    console.log("Token verification failed:", error);
    res.status(401).json({ message: "Token failed or expired" });
  }
});

// ✅ Middleware to allow only specific roles
export const requireRole = (allowedRoles: string | string[]) => {
  return (req: UserRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      res.status(401).json({ message: "Not authorized" });
      return;
    }

    const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];

    if (!roles.includes(req.user.role)) {
      res.status(403).json({ message: "Access denied: insufficient permissions" });
      return;
    }

    next();
  };
};
