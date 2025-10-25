/**
 * MongoDB Database Connection
 * Implements connection pooling for serverless environments
 * Lazy connection - only connects when needed
 */

import { MongoClient, Db, MongoClientOptions } from 'mongodb';

const uri = process.env.MONGODB_URI || '';
const options: MongoClientOptions = {
  maxPoolSize: 10,
  minPoolSize: 5,
  maxIdleTimeMS: 60000,
  serverSelectionTimeoutMS: 10000,
};

// Global variables for connection caching in serverless environment
let client: MongoClient | null = null;
let clientPromise: Promise<MongoClient> | null = null;

/**
 * Get cached MongoDB client or create new connection
 * This pattern ensures connection reuse across serverless function invocations
 */
export async function getMongoClient(): Promise<MongoClient> {
  if (!uri) {
    throw new Error('Please add your MongoDB URI to .env.local');
  }
  
  // In development, use global to preserve connection across hot reloads
  if (process.env.NODE_ENV === 'development') {
    const globalWithMongo = global as typeof globalThis & {
      _mongoClientPromise?: Promise<MongoClient>;
    };

    if (!globalWithMongo._mongoClientPromise) {
      client = new MongoClient(uri, options);
      globalWithMongo._mongoClientPromise = client.connect();
    }
    return globalWithMongo._mongoClientPromise;
  }

  // In production, use module-level cache
  if (!clientPromise) {
    client = new MongoClient(uri, options);
    clientPromise = client.connect();
  }

  return clientPromise;
}

/**
 * Get database instance
 * Database name is extracted from connection string or defaults to 'lacque-latte'
 */
export async function getDatabase(): Promise<Db> {
  const client = await getMongoClient();
  
  // Extract database name from URI or use default
  const dbName = process.env.MONGODB_DB_NAME || 'lacque-latte';
  
  return client.db(dbName);
}

/**
 * Test database connection
 * Useful for health checks and debugging
 */
export async function testConnection(): Promise<boolean> {
  try {
    const client = await getMongoClient();
    await client.db('admin').command({ ping: 1 });
    console.log('✅ MongoDB connection successful');
    return true;
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error);
    return false;
  }
}

/**
 * Close database connection
 * Should only be used when shutting down the application
 */
export async function closeConnection(): Promise<void> {
  if (client) {
    await client.close();
    client = null;
    clientPromise = null;
    console.log('MongoDB connection closed');
  }
}

