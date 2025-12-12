import express from 'express';
import { driver } from '../config/neo4j.js';

const router = express.Router();

router.post('/', async (req, res) => {
  const { userId1, userId2 } = req.body;

  if (!userId1 || !userId2) {
    return res.status(400).json({ error: 'Błąd' });
  }

  if (userId1 === userId2) {
    return res.status(400).json({ error: 'Błąd' });
  }

  const session = driver.session();
  try {
    const checkUsers = await session.run(`
      MATCH (u1:User {id: $userId1})
      MATCH (u2:User {id: $userId2})
      RETURN u1, u2
    `, { userId1, userId2 });

    if (checkUsers.records.length === 0) {
      return res.status(404).json({ error: 'Błąd' });
    }

    const checkFriendship = await session.run(`
      MATCH (u1:User {id: $userId1})-[:FRIEND]->(u2:User {id: $userId2})
      RETURN u1
    `, { userId1, userId2 });

    if (checkFriendship.records.length > 0) {
      return res.status(409).json({ error: 'Błąd' });
    }

    await session.run(`
      MATCH (u1:User {id: $userId1})
      MATCH (u2:User {id: $userId2})
      CREATE (u1)-[:FRIEND {}]->(u2)
      CREATE (u2)-[:FRIEND {}]->(u1)
    `, { userId1, userId2 });

    res.status(201).json({
      message: 'Relacja znajomości została utworzona',
      userId1,
      userId2
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Błąd' });
  } finally {
    await session.close();
  }
});

router.delete('/', async (req, res) => {
  const { userId1, userId2 } = req.body;

  if (!userId1 || !userId2) {
    return res.status(400).json({ error: 'Błąd' });
  }

  const session = driver.session();
  try {
    const result = await session.run(`
      MATCH (u1:User {id: $userId1})-[f1:FRIEND]->(u2:User {id: $userId2})
      MATCH (u2)-[f2:FRIEND]->(u1)
      DELETE f1, f2
      RETURN count(f1) as deletedCount
    `, { userId1, userId2 });

    const deletedCount = result.records[0].get('deletedCount').toNumber();

    if (deletedCount === 0) {
      return res.status(404).json({ error: 'Błąd' });
    }

    res.json({ message: 'Relacja znajomości została usunięta' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Błąd' });
  } finally {
    await session.close();
  }
});

export default router;
