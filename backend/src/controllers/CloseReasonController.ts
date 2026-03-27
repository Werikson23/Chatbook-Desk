import { Request, Response } from "express";
import Queue from "../models/Queue";
import CloseReason from "../models/CloseReason";

export const index = async (req: Request, res: Response): Promise<Response> => {
  const { companyId, profile, isSuper } = req.user;
  const queueId = Number(req.query.queueId || 0);
  const listAll = String(req.query.all || "") === "true";
  const canManage =
    profile === "admin" || profile === "supervisor" || isSuper === true;

  const reasons = await CloseReason.findAll({
    where: {
      companyId,
      ...(listAll && canManage ? {} : { isActive: true })
    },
    include: [
      {
        model: Queue,
        as: "queues",
        attributes: ["id", "name"],
        through: { attributes: [] }
      }
    ],
    order: [["name", "ASC"]]
  });

  const filteredReasons =
    queueId > 0
      ? reasons.filter(reason => {
          if (!reason.queues?.length) {
            return true;
          }
          return reason.queues.some(queue => queue.id === queueId);
        })
      : reasons;

  return res.json(filteredReasons);
};

export const store = async (req: Request, res: Response): Promise<Response> => {
  const { companyId } = req.user;
  const { name, color, queueIds = [], isActive = true } = req.body;

  const reason = await CloseReason.create({ name, color, isActive, companyId });
  if (Array.isArray(queueIds) && queueIds.length) {
    await reason.$set("queues", queueIds);
  }
  await reason.reload({
    include: [
      {
        model: Queue,
        as: "queues",
        attributes: ["id"],
        through: { attributes: [] }
      }
    ]
  });
  return res.status(201).json(reason);
};

export const update = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { id } = req.params;
  const { companyId } = req.user;
  const { name, color, queueIds, isActive } = req.body;

  const reason = await CloseReason.findOne({ where: { id, companyId } });
  if (!reason) {
    return res.status(404).json({ error: "Close reason not found" });
  }

  await reason.update({ name, color, isActive });
  if (Array.isArray(queueIds)) {
    await reason.$set("queues", queueIds);
  }
  await reason.reload({
    include: [
      {
        model: Queue,
        as: "queues",
        attributes: ["id"],
        through: { attributes: [] }
      }
    ]
  });
  return res.json(reason);
};

export const remove = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { id } = req.params;
  const { companyId } = req.user;

  const reason = await CloseReason.findOne({ where: { id, companyId } });
  if (!reason) {
    return res.status(404).json({ error: "Close reason not found" });
  }
  await reason.update({ isActive: false });
  return res.status(204).send();
};
