import request from 'supertest';
import { buildCookie, createTicket } from '../../test/util';
import app from '../../app';

it('fetches the order', async () => {
  const ticket = await createTicket();

  const cookie = buildCookie();

  const { body: order } = await request(app) // TODO: change to createOrder
    .post('/api/orders')
    .set('Cookie', cookie)
    .send({ ticketId: ticket.id })
    .expect(201);

  const { body: fetchedOrder } = await request(app)
    .get(`/api/orders/${order.id}`)
    .set('Cookie', cookie)
    .send()
    .expect(200);

  expect(fetchedOrder.id).toEqual(order.id);
});

it('Returns 401 when using a different user to fetch the order', async () => {
  const ticket = await createTicket();

  const { body: order } = await request(app) // TODO: change to createOrder
    .post('/api/orders')
    .set('Cookie', buildCookie())
    .send({ ticketId: ticket.id })
    .expect(201);

  await request(app)
    .get(`/api/orders/${order.id}`)
    .set('Cookie', buildCookie())
    .send()
    .expect(401);
});

it.todo('returns 404 when order doesnt exist');
