import { OrderCancelledEvent, Publisher, Subjects } from '@om_tickets/common';

export default class OrderCancelledPublisher extends Publisher<OrderCancelledEvent> {
  readonly subject = Subjects.OrderCancelled;
}
