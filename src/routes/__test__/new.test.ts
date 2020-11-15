import request from 'supertest';
import app from '../../app';
import { buildCookie, createTicket, mongoId } from '../../test/util';
import Order, { OrderStatus } from '../../models/order';
import natsWrapper from '../../nats-wrapper';

it('returns an error if the ticket does not exist', async () => {
  const ticketId = mongoId();

  await request(app)
    .post('/api/orders')
    .set('Cookie', buildCookie())
    .send({ ticketId })
    .expect(404);
});

it('returns an error if the ticket is already reserved', async () => {
  const ticket = await createTicket();
  const order = Order.build({
    ticket,
    userId: mongoId(),
    status: OrderStatus.Created,
    expiresAt: new Date(),
  });
  await order.save();

  await request(app)
    .post('/api/orders')
    .set('Cookie', buildCookie())
    .send({ ticketId: ticket.id })
    .expect(400);
});

it('reserved a ticket', async () => {
  const ticket = await createTicket();

  await request(app)
    .post('/api/orders')
    .set('Cookie', buildCookie())
    .send({ ticketId: ticket.id })
    .expect(201);

  // TODO: check the order actually exist
});

it('emits an order created event', async () => {
  const ticket = await createTicket();

  await request(app)
    .post('/api/orders')
    .set('Cookie', buildCookie())
    .send({ ticketId: ticket.id })
    .expect(201);

  expect(natsWrapper.client.publish).toHaveBeenCalled();
});
it.todo('basic tests (Authentication, valid inputs)');
