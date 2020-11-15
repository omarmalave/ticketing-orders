import express, { Request, Response } from 'express';
import { RequireAuth } from '@om_tickets/common';
import Order from '../models/order';

const indexOrderRouter = express.Router();

indexOrderRouter.get('/api/orders', RequireAuth, async (req: Request, res: Response) => {
  const orders = await Order.find({
    userId: req.currentUser!.id,
  }).populate('ticket');

  res.send(orders);
});

export default indexOrderRouter;
