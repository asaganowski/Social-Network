import express from 'express';
import { driver } from '../config/neo4j.js';
import { randomUUID } from 'crypto';

const router = express.Router();

router.get('/', async (req, res) => {
  const session = driver.session();
  try {
    const result = await session.run(`
      MATCH (u:User)
      RETURN u
    `);

    const users = result.records.map(record => ({
      id: record.get('u').properties.id,
      name: record.get('u').properties.name,
      email: record.get('u').properties.email,
    }));

    res.json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Błąd' });
  } finally {
    await session.close();
  }
});

router.post('/', async (req, res) => {
  const { name, email } = req.body;
  console.log(name, email);

  const session = driver.session();
  try {
    const userId = randomUUID();

    const result = await session.run(`
      CREATE (u:User {
        id: $id,
        name: $name,
        email: $email
      })
      RETURN u
    `, { id: userId, name, email });

    const user = {
      id: result.records[0].get('u').properties.id,
      name: result.records[0].get('u').properties.name,
      email: result.records[0].get('u').properties.email
    };

    res.status(201).json(user);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: 'Błąd' });
  } finally {
    await session.close();
  }
});

router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  const session = driver.session();

  try {
    await session.run(`
      MATCH (u:User {id: $id})
      DETACH DELETE u
    `, { id });

    res.json({ message: 'Usunięto użytkownika' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Błąd' });
  } finally {
    await session.close();
  }
});

router.get('/:id/friends', async (req, res) => {
  const { id } = req.params;
  const session = driver.session();

  try {
    const result = await session.run(`
      MATCH (u:User {id: $id})-[:FRIEND]->(friend:User)
      RETURN friend
      ORDER BY friend.name
    `, { id });

    const friends = result.records.map(record => ({
      id: record.get('friend').properties.id,
      name: record.get('friend').properties.name,
      email: record.get('friend').properties.email
    }));

    res.json(friends);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Błąd' });
  } finally {
    await session.close();
  }
});

router.get('/:id/recommendations', async (req, res) => {
  const { id } = req.params;
  const session = driver.session();

  try {
    const result = await session.run(`
      MATCH (u:User {id: $id})-[:FRIEND]->(friend)-[:FRIEND]->(recommendation)
      WHERE NOT (u)-[:FRIEND]->(recommendation) AND u <> recommendation
      RETURN DISTINCT recommendation, count(*) as mutualFriends
      ORDER BY mutualFriends DESC
      LIMIT 10
    `, { id });

    const recommendations = result.records.map(record => ({
      id: record.get('recommendation').properties.id,
      name: record.get('recommendation').properties.name,
      email: record.get('recommendation').properties.email,
      mutualFriends: record.get('mutualFriends').toNumber()
    }));

    res.json(recommendations);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Błąd' });
  } finally {
    await session.close();
  }
});

export default router;
