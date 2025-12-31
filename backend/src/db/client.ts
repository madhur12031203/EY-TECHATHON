import { Pool } from 'pg';
import { config } from '../config';
import { logger } from '../config/logger';

export const pool = new Pool({
  connectionString: config.databaseUrl,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

pool.on('error', (err) => {
  logger.error('Unexpected error on idle client', err);
  process.exit(-1);
});

// Test connection
pool.query('SELECT NOW()')
  .then(() => {
    logger.info('Database connection established');
  })
  .catch((err) => {
    logger.error('Database connection failed:', err);
  });

export default pool;

