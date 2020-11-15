import { TicketCreatedEvent } from '@om_tickets/common';
import { Message } from 'node-nats-streaming';
import TicketCreatedListener from '../ticket-created-listener';
import natsWrapper from '../../../nats-wrapper';
import { mongoId } from '../../../test/util';
import Ticket from '../../../models/ticket';

const setup = async () => {
  const listener = new TicketCreatedListener(natsWrapper.client);
  const data: TicketCreatedEvent['data'] = {
    version: 0,
    id: mongoId(),
    price: 10,
    title: 'Concert',
    userId: mongoId(),
  };

  // @ts-ignore
  const msg: Message = {
    ack: jest.fn(),
  };

  return { listener, data, msg };
};

it('creates an saves a ticket', async () => {
  const { listener, data, msg } = await setup();

  await listener.onMessage(data, msg);
  const ticket = await Ticket.findById(data.id);

  expect(ticket).toBeDefined();
  expect(ticket!.price).toEqual(data.price);
  expect(ticket!.title).toEqual(data.title);
});

it('acks the message', async () => {
  const { data, listener, msg } = await setup();

  await listener.onMessage(data, msg);

  expect(msg.ack).toHaveBeenCalled();
});
