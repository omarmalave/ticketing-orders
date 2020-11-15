import { MongoMemoryServer } from 'mongodb-memory-server';
import { connect, connection } from 'mongoose';

jest.mock('../nats-wrapper.ts');

let mongo: MongoMemoryServer;

beforeAll(async () => {
  process.env.JWT_KEY = 'orion';

  mongo = new MongoMemoryServer();
  const mongoUri = await mongo.getUri();
  await connect(mongoUri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
});

beforeEach(async () => {
  jest.clearAllMocks();
  const collections = await connection.db.collections();

  collections.forEach((collection) => {
    collection.deleteMany({});
  });
});

afterAll(async () => {
  await mongo.stop();
  await connection.close();
});
