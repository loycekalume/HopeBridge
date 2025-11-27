import { User } from "../../utils/types/userTypes";

declare global {
  namespace Express {
    interface Request {
      user?: User;
    }
  }
}
