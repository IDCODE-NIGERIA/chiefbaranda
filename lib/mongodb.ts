import { MongoClient, Db } from 'mongodb';

let cached = global as any;

if (!cached.mongo) {
  cached.mongo = { conn: null, db: null };
}

export async function connectToDatabase(): Promise<{ client: MongoClient; db: Db }> {
  const MONGODB_URI = process.env.MONGODB_URI;
  
  if (!MONGODB_URI) {
    throw new Error('Please define the MONGODB_URI environment variable');
  }

  if (cached.mongo.conn) {
    return cached.mongo;
  }

  const client = new MongoClient(MONGODB_URI, {
    maxPoolSize: 10,
    minPoolSize: 2,
  });

  await client.connect();
  const db = client.db('chiefbaranda');

  cached.mongo.conn = client;
  cached.mongo.db = db;

  return cached.mongo;
}

export async function getDatabase(): Promise<Db> {
  const { db } = await connectToDatabase();
  return db;
}
