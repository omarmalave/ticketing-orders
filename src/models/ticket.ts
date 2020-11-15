import { model, Model, Schema } from 'mongoose';
import { updateIfCurrentPlugin } from 'mongoose-update-if-current';
import Order, { OrderStatus } from './order';
import { TicketDoc } from './ticket-doc';

interface TicketAttrs {
  id: string;
  title: string;
  price: number;
}

interface TicketModel extends Model<TicketDoc> {
  build(attrs: TicketAttrs): TicketDoc;

  findByEvent(event: { id: string; version: number }): Promise<TicketDoc | null>;
}

const ticketSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  {
    toJSON: {
      transform: (doc, ret) => {
        return {
          id: ret._id,
          title: ret.title,
          price: ret.price,
        };
      },
    },
  },
);

ticketSchema.set('versionKey', 'version');
ticketSchema.plugin(updateIfCurrentPlugin);

ticketSchema.statics.build = function build(attrs: TicketAttrs) {
  return new this({ _id: attrs.id, title: attrs.title, price: attrs.price });
};

ticketSchema.methods.isReserved = async function isReserved() {
  const existingOrder = await Order.findOne({
    ticket: this,
    status: {
      $in: [OrderStatus.Created, OrderStatus.AwaitingPayment, OrderStatus.Complete],
    },
  });

  return !!existingOrder;
};
ticketSchema.statics.findByEvent = function findByEvent(event: {
  id: string;
  version: number;
}) {
  return this.findOne({
    _id: event.id,
    version: event.version - 1,
  });
};

const Ticket = model<TicketDoc, TicketModel>('Ticket', ticketSchema);

export default Ticket;
