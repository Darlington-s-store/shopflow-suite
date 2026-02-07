import initializeDatabase from './schema.js';

/**
 * Database Migration Script
 * 
 * Runs database schema initialization/migration
 * Creates all tables if they don't exist
 */

async function runMigrations() {
  try {
    console.log('🔄 Running database migrations...');
    
    await initializeDatabase();
    
    console.log('✅ Database migrations completed successfully!');
    console.log('📊 All tables are ready to use');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    process.exit(1);
  }
}

runMigrations();
