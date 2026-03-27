import { Request, Response, NextFunction } from "express";
import AppError from "../errors/AppError";
import User from "../models/User";

const isAdmin = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<any> => {
  const { profile, super: isSuperUser } = await User.findByPk(req.user.id);
  // Superadmin (SaaS) também precisa acessar rotas "admin" como /settings.
  if (profile !== "admin" && !isSuperUser) {
    throw new AppError("Acesso não permitido", 403);
  }

  return next();
};

export default isAdmin;
