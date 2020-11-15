import express, { Request, Response } from 'express';
import { NotAuthorizedError, NotFoundError, RequireAuth } from '@om_tickets/common';
import Order from '../models/order';

const showOrderRouter = express.Router();

// TODO: validate id
showOrderRouter.get(
  '/api/orders/:id',
  RequireAuth,
  async (req: Request, res: Response) => {
    const order = await Order.findById(req.params.id).populate('ticket');

    if (!order) {
      throw new NotFoundError();
    }

    if (order.userId !== req.currentUser!.id) {
      throw new NotAuthorizedError();
    }

    res.status(200).send(order);
  },
);

export default showOrderRouter;
