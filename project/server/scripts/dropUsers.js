import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/emergency-blood';

async function dropUsersCollection() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    const collections = await mongoose.connection.db.collections();
    const usersCollection = collections.find(c => c.collectionName === 'users');

    if (usersCollection) {
      await usersCollection.drop();
      console.log('Users collection dropped successfully');
    } else {
      console.log('Users collection not found');
    }

    await mongoose.connection.close();
    console.log('MongoDB connection closed');
  } catch (error) {
    console.error('Error:', error);
  }
}

dropUsersCollection(); 