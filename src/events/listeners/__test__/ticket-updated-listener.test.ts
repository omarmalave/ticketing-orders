import { TicketUpdatedEvent } from '@om_tickets/common';
import { Message } from 'node-nats-streaming';
import TicketUpdatedListener from '../ticket-updated-listener';
import natsWrapper from '../../../nats-wrapper';
import { createTicket, mongoId } from '../../../test/util';
import Ticket from '../../../models/ticket';

const setup = async () => {
  const listener = new TicketUpdatedListener(natsWrapper.client);

  const ticket = await createTicket();

  const data: TicketUpdatedEvent['data'] = {
    version: ticket.version + 1,
    id: ticket.id,
    price: 63541,
    title: 'Different title',
    userId: mongoId(),
  };

  // @ts-ignore
  const msg: Message = {
    ack: jest.fn(),
  };

  return { msg, data, ticket, listener };
};

it('finds, updates, an saves a ticket', async () => {
  const { msg, data, ticket, listener } = await setup();

  await listener.onMessage(data, msg);

  const updatedTicket = await Ticket.findById(ticket.id);

  expect(updatedTicket!.title).toEqual(data.title);
  expect(updatedTicket!.price).toEqual(data.price);
  expect(updatedTicket!.version).toEqual(data.version);
});

it('acks the message', async () => {
  const { data, listener, msg } = await setup();

  await listener.onMessage(data, msg);

  expect(msg.ack).toHaveBeenCalled();
});

it('does not call ack if the event has an skipped version number', async () => {
  const { msg, data, listener } = await setup();
  data.version = 10;

  try {
    await listener.onMessage(data, msg);
    // eslint-disable-next-line no-empty
  } catch (e) {}

  expect(msg.ack).not.toHaveBeenCalled();
});
