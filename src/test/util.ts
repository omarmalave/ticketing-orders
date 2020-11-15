import { Types } from 'mongoose';
import jwt from 'jsonwebtoken';
import Ticket from '../models/ticket';
import Order, { OrderStatus } from '../models/order';
import { TicketDoc } from '../models/ticket-doc';

const mongoId = () => new Types.ObjectId().toHexString();

const buildCookie = (userId?: string) => {
  const id = userId || mongoId();
  const payload = { id, email: 'test@test.com' };
  const token = jwt.sign(payload, process.env.JWT_KEY!);
  const session = { jwt: token };
  const sessionJson = JSON.stringify(session);
  const base64 = Buffer.from(sessionJson).toString('base64');

  return [`express:sess=${base64}`];
};

const createTicket = async (opt?: { title?: string; price?: number; id: string }) => {
  const title = opt?.title || 'title';
  const price = opt?.price || 20;
  const id = opt?.id || mongoId();
  const ticket = Ticket.build({ id, title, price });
  await ticket.save();

  return ticket;
};

const createOrder = async (ticket: TicketDoc, userId?: string) => {
  const order = Order.build({
    ticket,
    userId: userId || mongoId(),
    status: OrderStatus.Created,
    expiresAt: new Date(),
  });
  await order.save();

  return order;
};

export { buildCookie, createTicket, mongoId, createOrder };
