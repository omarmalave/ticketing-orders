import express, { Request, Response } from 'express';
import { BadRequestError, NotFoundError, RequireAuth } from '@om_tickets/common';
import { body } from 'express-validator';
import { Types } from 'mongoose';
import OrderStatus from '@om_tickets/common/build/messaging/types/order-status';
import Ticket from '../models/ticket';
import Order from '../models/order';
import OrderCreatedPublisher from '../events/publishers/order-created-publisher';
import natsWrapper from '../nats-wrapper';

const newOrderRouter = express.Router();

const EXPIRATION_WINDOW_SECONDS = 1 * 60;

const validations = [
  body('ticketId')
    .notEmpty()
    .custom((input: string) => Types.ObjectId.isValid(input))
    .withMessage('Ticket id must be provided'),
];

newOrderRouter.post(
  '/api/orders',
  RequireAuth,
  validations,
  async (req: Request, res: Response) => {
    const { ticketId } = req.body;

    const ticket = await Ticket.findById(ticketId);
    if (!ticket) {
      throw new NotFoundError();
    }

    const isReserved = await ticket.isReserved();
    if (isReserved) {
      throw new BadRequestError('Ticket is already reserved');
    }

    const expiration = new Date();
    expiration.setSeconds(expiration.getSeconds() + EXPIRATION_WINDOW_SECONDS);

    const order = Order.build({
      userId: req.currentUser!.id,
      status: OrderStatus.Created,
      expiresAt: expiration,
      ticket,
    });
    await order.save();

    new OrderCreatedPublisher(natsWrapper.client).publish({
      id: order.id,
      status: order.status,
      userId: order.userId,
      expiresAt: order.expiresAt.toISOString(),
      version: order.version,
      ticket: {
        id: ticket.id,
        price: ticket.price,
      },
    });

    res.status(201).send(order);
  },
);

export default newOrderRouter;
