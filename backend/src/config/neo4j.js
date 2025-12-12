import neo4j from 'neo4j-driver';
import dotenv from 'dotenv';

dotenv.config();

const driver = neo4j.driver(
  process.env.NEO4J_URI,
  neo4j.auth.basic(process.env.NEO4J_USERNAME, process.env.NEO4J_PASSWORD)
);

async function verifyConnection() {
  const session = driver.session();
  try {
    await session.run('RETURN "success" as message');
  } catch (error) {
    console.error('connection failed:', error.message);
    throw error;
  } finally {
    await session.close();
  }
}

async function initializeDatabase() {
  const session = driver.session();
  try {
    await session.run(`
      CREATE CONSTRAINT user_id_unique IF NOT EXISTS
      FOR (u:User) REQUIRE u.id IS UNIQUE
    `);

    await session.run(`
      CREATE INDEX user_email_index IF NOT EXISTS
      FOR (u:User) ON (u.email)
    `);

    console.log('✓ Database initialized');
  } catch (error) {
    console.error('error', error.message);
  } finally {
    await session.close();
  }
}

export { driver, verifyConnection, initializeDatabase };
