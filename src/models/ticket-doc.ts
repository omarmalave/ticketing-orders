import { Document } from 'mongoose';

// todo: move interfaces to a different folder (types)
export interface TicketDoc extends Document {
  title: string;
  price: number;
  version: number;

  isReserved(): Promise<boolean>;
}
