// MongoDB Connection Test
// This is a temporary test file to verify MongoDB Atlas connection
// DO NOT commit this file with the actual connection string!

const { MongoClient } = require('mongodb');

// Replace this with your actual connection string from MongoDB Atlas
// NOTE: Must include a database name (e.g., /lacque-latte) in the connection string
const uri = "mongodb+srv://Andrew:Zeus20230607@lacquelatte.7cwderu.mongodb.net/lacque-latte?retryWrites=true&w=majority&appName=LacqueLatte";

// Add SSL/TLS options to work with LibreSSL on macOS
const client = new MongoClient(uri, {
  tls: true,
  tlsAllowInvalidCertificates: false,
  serverSelectionTimeoutMS: 30000,
});

async function testConnection() {
  try {
    console.log('Attempting to connect to MongoDB Atlas...');
    
    // Connect to MongoDB
    await client.connect();
    
    console.log('✅ Successfully connected to MongoDB Atlas!');
    
    // Test database operations
    const database = client.db('lacque-latte');
    const collection = database.collection('test');
    
    // Insert a test document
    const testDoc = { 
      name: 'Connection Test', 
      timestamp: new Date(),
      status: 'success'
    };
    
    const result = await collection.insertOne(testDoc);
    console.log('✅ Test document inserted with ID:', result.insertedId);
    
    // Retrieve the test document
    const doc = await collection.findOne({ _id: result.insertedId });
    console.log('✅ Retrieved document:', doc);
    
    // Clean up - delete the test document
    await collection.deleteOne({ _id: result.insertedId });
    console.log('✅ Test document cleaned up');
    
    console.log('\n🎉 MongoDB connection test completed successfully!');
    
  } catch (error) {
    console.error('❌ Connection error:', error);
  } finally {
    // Close the connection
    await client.close();
    console.log('Connection closed.');
  }
}

// Run the test
testConnection();

