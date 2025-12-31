import { readFileSync } from 'fs';
import { join } from 'path';
import { pool } from './client';
import { logger } from '../config/logger';

async function migrate() {
  try {
    // Use project root schema so it works in both ts-node and built dist
    const schemaPath = join(process.cwd(), 'src', 'db', 'schema.sql');
    const schema = readFileSync(schemaPath, 'utf-8');
    
    logger.info('Running database migrations...');
    await pool.query(schema);
    logger.info('Database migrations completed successfully');
    
    process.exit(0);
  } catch (error) {
    logger.error('Migration failed:', error);
    process.exit(1);
  }
}

migrate();

