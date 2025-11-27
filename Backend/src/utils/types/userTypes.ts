import { Request } from "express";

export interface User {
  user_id: number;
  email: string;
  full_name: string;
  phone: string;
  role: string;
}

export interface UserRequest extends Request {
  user?: User;
}
