const mysql = require('mysql2/promise');
require('dotenv').config();

async function addFacilitiesField() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'beauty_clinic_db'
  });

  try {
    console.log('🔄 Adding facilities field to treatments table...');
    
    // Check if column already exists
    const [columns] = await connection.query(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'treatments' AND COLUMN_NAME = 'facilities'
    `, [process.env.DB_NAME || 'beauty_clinic_db']);

    if (columns.length > 0) {
      console.log('⚠️  facilities column already exists!');
      return;
    }

    // Add facilities column
    await connection.query(`
      ALTER TABLE treatments 
      ADD COLUMN facilities TEXT DEFAULT NULL COMMENT 'JSON array of treatment facilities'
    `);

    console.log('✅ facilities column added successfully!');

    // Update existing records with empty array
    await connection.query(`
      UPDATE treatments 
      SET facilities = '[]'
      WHERE facilities IS NULL
    `);

    console.log('✅ Existing records updated with empty facilities array!');

  } catch (error) {
    console.error('❌ Error adding facilities field:', error.message);
    throw error;
  } finally {
    await connection.end();
  }
}

addFacilitiesField()
  .then(() => {
    console.log('✅ Migration completed successfully!');
    process.exit(0);
  })
  .catch((err) => {
    console.error('❌ Migration failed:', err);
    process.exit(1);
  });
