import { Request, Response } from "express";
import FarewellTemplate from "../models/FarewellTemplate";

export const index = async (req: Request, res: Response): Promise<Response> => {
  const { companyId } = req.user;

  const templates = await FarewellTemplate.findAll({
    where: { companyId, isActive: true },
    order: [
      ["sortOrder", "ASC"],
      ["name", "ASC"]
    ]
  });

  return res.json(templates);
};

export const store = async (req: Request, res: Response): Promise<Response> => {
  const { companyId } = req.user;
  const { name, content, sortOrder = 0, isActive = true } = req.body;

  const template = await FarewellTemplate.create({
    companyId,
    name,
    content,
    sortOrder,
    isActive
  });
  return res.status(201).json(template);
};

export const update = async (req: Request, res: Response): Promise<Response> => {
  const { id } = req.params;
  const { companyId } = req.user;
  const { name, content, sortOrder, isActive } = req.body;

  const template = await FarewellTemplate.findOne({ where: { id, companyId } });
  if (!template) {
    return res.status(404).json({ error: "Farewell template not found" });
  }

  await template.update({ name, content, sortOrder, isActive });
  return res.json(template);
};

export const remove = async (req: Request, res: Response): Promise<Response> => {
  const { id } = req.params;
  const { companyId } = req.user;

  const template = await FarewellTemplate.findOne({ where: { id, companyId } });
  if (!template) {
    return res.status(404).json({ error: "Farewell template not found" });
  }

  await template.update({ isActive: false });
  return res.status(204).send();
};
