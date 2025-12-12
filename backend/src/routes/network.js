import express from 'express';
import { driver } from '../config/neo4j.js';

const router = express.Router();

router.get('/path', async (req, res) => {
  const { from, to } = req.query;

  const session = driver.session();
  try {
    const result = await session.run(`
      MATCH (u1:User {id: $from})
      MATCH (u2:User {id: $to})
      MATCH path = shortestPath((u1)-[:FRIEND*]-(u2))
      RETURN [node in nodes(path) | {
        id: node.id,
        name: node.name,
        email: node.email
      }] as path,
      length(path) as distance
    `, { from, to });

    if (result.records.length === 0) {
      return res.status(404).json({
        error: 'Użytkownicy nie są połączeni',
      });
    }

    const path = result.records[0].get('path');
    const distance = result.records[0].get('distance').toNumber();

    res.json({
      path,
      distance,
      message: `Znaleziono ścieżkę o długości ${distance} połączeń`
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Błąd' });
  } finally {
    await session.close();
  }
});

router.get('/network', async (req, res) => {
  const session = driver.session();
  try {
    const result = await session.run(`
      MATCH (u:User)
      OPTIONAL MATCH (u)-[:FRIEND]->(friend)
      WITH u, count(friend) as friendCount
      WITH count(u) as totalUsers,
      avg(friendCount) as avgFriends,
      max(friendCount) as maxFriends,
      min(friendCount) as minFriends
      OPTIONAL MATCH (u1:User)-[:FRIEND]->(u2:User)
      WHERE u1.id < u2.id
      RETURN collect({
               source: u1.id,
               target: u2.id,
               sourceName: u1.name,
               targetName: u2.name
             }) as edges,
             totalUsers,
             avgFriends,
             maxFriends,
             minFriends
    `);

    const record = result.records[0];
    const edges = record.get('edges');

    res.json({
      edges,
      stats: {
        totalUsers: record.get('totalUsers').toNumber(),
        friendshipCount: edges.length,
        avgFriends: record.get('avgFriends'),
        maxFriends: record.get('maxFriends').toNumber(),
        minFriends: record.get('minFriends').toNumber()
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Błąd' });
  } finally {
    await session.close();
  }
});

export default router;
