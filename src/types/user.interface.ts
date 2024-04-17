import { User } from "../entities";
import { Request } from "express";

export interface RequestWithCurrentUser extends Request {
  currentUser?: User | null
}
