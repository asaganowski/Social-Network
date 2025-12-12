import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { driver, verifyConnection, initializeDatabase } from './config/neo4j.js';
import usersRouter from './routes/users.js';
import friendshipsRouter from './routes/friendships.js';
import networkRouter from './routes/network.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.use('/api/users', usersRouter);
app.use('/api/friendships', friendshipsRouter);
app.use('/api', networkRouter);

process.on('SIGINT', async () => {
  await driver.close();
  process.exit(0);
});

async function startServer() {
  try {
    console.log('Starting.\n');

    await verifyConnection();
    await initializeDatabase();

    app.listen(PORT, () => {
      console.log(`\nServer running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('Failed:', error);
    process.exit(1);
  }
}

startServer();
