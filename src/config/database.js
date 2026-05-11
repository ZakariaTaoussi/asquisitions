import 'dotenv/config';
import { neon } from '@neondatabase/serverless';
import { drizzle as drizzleHttp } from 'drizzle-orm/neon-http';
import { drizzle as drizzlePg } from 'drizzle-orm/node-postgres';
import pkg from 'pg';
const { Pool } = pkg;

let db;

if (process.env.NODE_ENV === 'development') {
  console.log('🛠️  Dev mode — connecting via neon-local Docker proxy');

  const pool = new Pool({
    host: 'neon-local',
    port: 5432,
    user: 'neon',
    password: 'npg',
    database: 'neondb',
    ssl: { rejectUnauthorized: false },
  });

  db = drizzlePg(pool);
} else {
  console.log('🚀 Production mode — connecting via Neon Cloud');
  const sql = neon(process.env.DATABASE_URL);
  db = drizzleHttp(sql);
}

export { db };
