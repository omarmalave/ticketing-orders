import { Listener, Subjects, TicketCreatedEvent } from '@om_tickets/common';
import { Message } from 'node-nats-streaming';
import queueGroupName from './queue-group-name';
import Ticket from '../../models/ticket';

export default class TicketCreatedListener extends Listener<TicketCreatedEvent> {
  readonly subject = Subjects.TicketCreated;

  queueGroupName = queueGroupName;

  async onMessage(data: TicketCreatedEvent['data'], msg: Message) {
    const { title, price, id } = data;
    const ticket = Ticket.build({ id, title, price });
    await ticket.save();

    msg.ack();
  }
}
