import { subMinutes } from "date-fns";
import { Op } from "sequelize";
import { Mutex } from "async-mutex";
import Contact from "../../models/Contact";
import Ticket from "../../models/Ticket";
import ShowTicketService from "./ShowTicketService";
import FindOrCreateATicketTrakingService from "./FindOrCreateATicketTrakingService";
import { GetCompanySetting } from "../../helpers/CheckSettings";
import sequelize from "../../database";
import Whatsapp from "../../models/Whatsapp";
import Queue from "../../models/Queue";
import { incrementCounter } from "../CounterServices/IncrementCounter";
import { logger } from "../../utils/logger";

const createTicketMutex = new Mutex();

type FindOrCreateTicketOptions = {
  groupContact?: Contact;
  incrementUnread?: boolean;
  doNotReopen?: boolean;
  findOnly?: boolean;
  queue?: Queue;
};

const resolveValidContactId = async (
  candidate: Contact,
  companyId: number
): Promise<number> => {
  if (!candidate) return null;

  if (candidate.id) {
    const byId = await Contact.findOne({
      where: { id: candidate.id, companyId },
      attributes: ["id"]
    });
    if (byId) return byId.id;
  }

  if (candidate.number) {
    const byNumber = await Contact.findOne({
      where: { number: candidate.number, companyId },
      attributes: ["id"],
      order: [["id", "DESC"]]
    });
    if (byNumber) return byNumber.id;
  }

  return null;
};

const internalFindOrCreateTicketService = async (
  contact: Contact,
  whatsappId: number,
  companyId: number,
  {
    groupContact,
    incrementUnread,
    doNotReopen,
    findOnly,
    queue
  }: FindOrCreateTicketOptions = {}
): Promise<{ ticket: Ticket | null; justCreated: boolean }> => {
  let justCreated = false;
  const baseContactId = await resolveValidContactId(contact, companyId);
  const baseGroupContactId = groupContact
    ? await resolveValidContactId(groupContact, companyId)
    : null;
  const effectiveContactId = baseGroupContactId || baseContactId;

  if (!effectiveContactId) {
    logger.warn(
      {
        event: "ticket.contact_not_found",
        companyId,
        whatsappId,
        contactId: contact?.id,
        contactNumber: contact?.number,
        groupContactId: groupContact?.id,
        groupContactNumber: groupContact?.number
      },
      "FindOrCreateTicketService skipped because contact reference is invalid"
    );
    return { ticket: null, justCreated: false };
  }

  const result = await sequelize.transaction(async () => {
    let ticket = await Ticket.findOne({
      where: {
        status: {
          [Op.or]: ["open", "pending"]
        },
        contactId: effectiveContactId,
        whatsappId
      },
      order: [["id", "DESC"]]
    });

    if (ticket && incrementUnread) {
      await ticket.increment("unreadMessages");
      ticket = await ticket.reload();
    }

    if (!ticket && baseGroupContactId) {
      ticket = await Ticket.findOne({
        where: {
          contactId: baseGroupContactId,
          whatsappId
        },
        order: [["updatedAt", "DESC"]]
      });

      if (ticket) {
        await ticket.update({
          status: "pending",
          userId: null,
          unreadMessages: incrementUnread
            ? ticket.unreadMessages + 1
            : ticket.unreadMessages,
          companyId
        });
        await FindOrCreateATicketTrakingService({
          ticketId: ticket.id,
          companyId,
          whatsappId: ticket.whatsappId,
          userId: ticket.userId
        });
      }
    }

    if (!doNotReopen && !ticket && !baseGroupContactId) {
      const reopenTimeout = parseInt(
        await GetCompanySetting(companyId, "autoReopenTimeout", "0"),
        10
      );
      ticket =
        reopenTimeout &&
        (await Ticket.findOne({
          where: {
            updatedAt: {
              [Op.between]: [
                +subMinutes(new Date(), reopenTimeout),
                +new Date()
              ]
            },
            contactId: baseContactId,
            whatsappId
          },
          order: [["updatedAt", "DESC"]]
        }));

      if (ticket) {
        await ticket.update({
          status: "pending",
          userId: null,
          unreadMessages: incrementUnread
            ? ticket.unreadMessages + 1
            : ticket.unreadMessages,
          companyId
        });
        await FindOrCreateATicketTrakingService({
          ticketId: ticket.id,
          companyId,
          whatsappId: ticket.whatsappId,
          userId: ticket.userId
        });
      }
    }

    let queueId = queue?.id || null;

    if (baseGroupContactId) {
      const whatsapp = await Whatsapp.findByPk(whatsappId, {
        include: ["queues"]
      });

      if (whatsapp?.queues.length === 1) {
        queueId = whatsapp.queues[0].id;
      }
    }

    if (findOnly && !ticket) {
      return { ticket: null, justCreated: false };
    }

    if (!ticket) {
      try {
        ticket = await Ticket.create({
          contactId: effectiveContactId,
          status: "pending",
          isGroup: !!baseGroupContactId,
          unreadMessages: incrementUnread ? 1 : 0,
          whatsappId,
          queueId,
          companyId
        });
      } catch (err) {
        const isFkError =
          (err as any)?.name === "SequelizeForeignKeyConstraintError";
        if (!isFkError) {
          throw err;
        }

        logger.warn(
          {
            event: "ticket.create_fk_contact_missing",
            companyId,
            whatsappId,
            contactId: effectiveContactId,
            fallbackContactId: baseContactId,
            fallbackGroupContactId: baseGroupContactId
          },
          "Ticket creation blocked by contact FK; skipping this message cycle"
        );
        return { ticket: null, justCreated: false };
      }

      justCreated = true;

      await FindOrCreateATicketTrakingService({
        ticketId: ticket.id,
        companyId,
        whatsappId,
        userId: ticket.userId
      });
    }

    ticket = await ShowTicketService(ticket.id, companyId);

    return { ticket, justCreated };
  });

  if (result.justCreated) {
    incrementCounter(companyId, "ticket-create");
  }

  return result;
};

const FindOrCreateTicketService = async (
  contact: Contact,
  whatsappId: number,
  companyId: number,
  options: FindOrCreateTicketOptions = {}
): Promise<{ ticket: Ticket | null; justCreated: boolean }> => {
  const release = await createTicketMutex.acquire();

  try {
    return await internalFindOrCreateTicketService(
      contact,
      whatsappId,
      companyId,
      options
    );
  } finally {
    release();
  }
};

export default FindOrCreateTicketService;
