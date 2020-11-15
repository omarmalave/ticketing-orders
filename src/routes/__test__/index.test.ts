import request from 'supertest';
import { buildCookie, createTicket } from '../../test/util';
import app from '../../app';

it('fetches orders for a particular user', async () => {
  const ticketOne = await createTicket();
  const ticketTwo = await createTicket();
  const ticketThree = await createTicket();

  const cookieOne = buildCookie(); // each represent a different user
  const cookieTwo = buildCookie();

  await request(app)
    .post('/api/orders')
    .set('Cookie', cookieOne)
    .send({ ticketId: ticketOne.id })
    .expect(201);

  const { body: orderOne } = await request(app)
    .post('/api/orders')
    .set('Cookie', cookieTwo)
    .send({ ticketId: ticketTwo.id })
    .expect(201);
  const { body: orderTwo } = await request(app)
    .post('/api/orders')
    .set('Cookie', cookieTwo)
    .send({ ticketId: ticketThree.id })
    .expect(201);

  const response = await request(app)
    .get('/api/orders')
    .set('Cookie', cookieTwo)
    .expect(200);

  expect(response.body.length).toEqual(2);
  expect(response.body[0].id).toEqual(orderOne.id);
  expect(response.body[1].id).toEqual(orderTwo.id);
  expect(response.body[0].ticket.id).toEqual(ticketTwo.id);
  expect(response.body[1].ticket.id).toEqual(ticketThree.id);
});
