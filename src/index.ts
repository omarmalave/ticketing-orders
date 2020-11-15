import mongoose from 'mongoose';
import pino from 'pino';
import app from './app';
import natsWrapper from './nats-wrapper';
import TicketCreatedListener from './events/listeners/ticket-created-listener';
import TicketUpdatedListener from './events/listeners/ticket-updated-listener';

const log = pino();

const start = async () => {
  const { NATS_CLUSTER_ID, NATS_URL, NATS_CLIENT_ID, MONGO_URI, JWT_KEY } = process.env;

  if (!JWT_KEY) {
    throw new Error('JWT_KEY must be defined');
  }
  if (!MONGO_URI) {
    throw new Error('MONGO_URI must be defined');
  }
  if (!NATS_CLIENT_ID) {
    throw new Error('NATS_CLIENT_ID must be defined');
  }
  if (!NATS_CLUSTER_ID) {
    throw new Error('NATS_CLUSTER_ID must be defined');
  }
  if (!NATS_URL) {
    throw new Error('NATS_URL must be defined');
  }
  try {
    await natsWrapper.connect(NATS_CLUSTER_ID, NATS_CLIENT_ID, NATS_URL);
    natsWrapper.client.on('close', () => {
      log.info('nats connection closed');
      process.exit();
    });
    process.on('SIGINT', () => natsWrapper.client.close());
    process.on('SIGTERM', () => natsWrapper.client.close());
    log.info('Connected to NATS');

    new TicketCreatedListener(natsWrapper.client).listen();
    new TicketUpdatedListener(natsWrapper.client).listen();

    await mongoose.connect(MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useCreateIndex: true,
    });
    log.info('Connected to MongoDB');
  } catch (err) {
    log.error(err);
  }

  app.listen(3000, () => {
    log.info('Listening on port: 3000');
  });
};

start();
