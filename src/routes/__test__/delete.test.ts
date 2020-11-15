import request from 'supertest';
import { buildCookie, createOrder, createTicket, mongoId } from '../../test/util';
import app from '../../app';
import Order, { OrderStatus } from '../../models/order';
import natsWrapper from '../../nats-wrapper';

it('marks an order as cancelled', async () => {
  const ticket = await createTicket();

  const userId = mongoId();

  const order = await createOrder(ticket, userId);

  const cookie = buildCookie(userId);

  await request(app)
    .delete(`/api/orders/${order.id}`)
    .set('Cookie', cookie)
    .send()
    .expect(204);

  const updatedOrder = await Order.findById(order.id);

  expect(updatedOrder!.status).toEqual(OrderStatus.Cancelled);
  expect(natsWrapper.client.publish).toHaveBeenCalled();
});
