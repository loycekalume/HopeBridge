import { Request } from "express";

export interface User {
  user_id: number;
  email: string;
  first_name: string;
  last_name: string;
  phone_number: string;
  role: string;
}

export interface UserRequest extends Request {
  user?: User;
}
