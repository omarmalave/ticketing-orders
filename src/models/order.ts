import { Document, model, Model, Schema } from 'mongoose';
import { OrderStatus } from '@om_tickets/common';
import { updateIfCurrentPlugin } from 'mongoose-update-if-current';
import { TicketDoc } from './ticket-doc';

export { OrderStatus };

interface OrderAttrs {
  userId: string;
  status: OrderStatus;
  expiresAt: Date;
  ticket: TicketDoc;
}

interface OrderDoc extends Document {
  userId: string;
  status: OrderStatus;
  expiresAt: Date;
  ticket: TicketDoc;
  version: number;
}

interface OrderModel extends Model<OrderDoc> {
  build(attrs: OrderAttrs): OrderDoc;
}

const orderSchema = new Schema(
  {
    userId: { type: String, required: true },
    status: {
      type: String,
      required: true,
      enum: Object.values(OrderStatus),
      default: OrderStatus.Created,
    },
    expiresAt: { type: Schema.Types.Date },
    ticket: { type: Schema.Types.ObjectId, ref: 'Ticket' },
  },
  {
    toJSON: {
      transform: (doc, ret) => {
        return {
          id: ret._id,
          userId: ret.userId,
          status: ret.status,
          expiresAt: ret.expiresAt,
          ticket: ret.ticket,
        };
      },
    },
  },
);

orderSchema.set('versionKey', 'version');
orderSchema.plugin(updateIfCurrentPlugin);

orderSchema.statics.build = function build(attrs: OrderAttrs) {
  return new this(attrs);
};

const Order = model<OrderDoc, OrderModel>('Order', orderSchema);

export default Order;
