import { Router } from "express";
import { SupportType } from "@prisma/client";
import { supportSchema } from "@quickconvert/shared";
import { prisma } from "../../lib/prisma.js";
import { asyncHandler } from "../../lib/http.js";

export const supportRouter = Router();

supportRouter.post(
  "/",
  asyncHandler(async (req, res) => {
    const input = supportSchema.parse(req.body);

    const ticket = await prisma.supportTicket.create({
      data: {
        userId: req.user?.id,
        type: input.type === "bug" ? SupportType.BUG : SupportType.SUPPORT,
        email: input.email,
        message: input.message,
        toolSlug: input.toolSlug
      }
    });

    res.status(201).json({
      ticketId: ticket.id,
      message: "Support request received. We'll follow up by email."
    });
  }),
);
