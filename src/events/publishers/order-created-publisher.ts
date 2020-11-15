import { OrderCreatedEvent, Publisher, Subjects } from '@om_tickets/common';

export default class OrderCreatedPublisher extends Publisher<OrderCreatedEvent> {
  readonly subject = Subjects.OrderCreated;
}
