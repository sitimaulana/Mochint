const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

async function addTreatmentPromoFields() {
  let connection;
  
  try {
    // Create connection
    connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: '', // Ganti dengan password MySQL Anda jika ada
      database: 'beauty_clinic'
    });

    console.log('Connected to database...');

    // Check if columns already exist
    const [columns] = await connection.query(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = 'beauty_clinic' 
      AND TABLE_NAME = 'treatments' 
      AND COLUMN_NAME IN ('discount_percentage', 'promo_start_date', 'promo_end_date')
    `);

    if (columns.length === 3) {
      console.log('✓ Promo fields already exist in treatments table.');
      return;
    }

    console.log('Adding promo fields to treatments table...');

    // Read and execute SQL file
    const sqlFile = path.join(__dirname, 'add_treatment_promo_fields.sql');
    const sql = fs.readFileSync(sqlFile, 'utf8');

    // Split by semicolon and execute each statement
    const statements = sql.split(';').filter(stmt => stmt.trim() !== '');
    
    for (const statement of statements) {
      if (statement.trim()) {
        await connection.query(statement);
      }
    }

    console.log('✓ Successfully added promo fields to treatments table!');
    console.log('✓ Added columns:');
    console.log('  - discount_percentage (INT)');
    console.log('  - promo_start_date (DATE)');
    console.log('  - promo_end_date (DATE)');

    // Verify the changes
    const [newColumns] = await connection.query(`
      SELECT COLUMN_NAME, COLUMN_TYPE, COLUMN_DEFAULT, COLUMN_COMMENT
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = 'beauty_clinic' 
      AND TABLE_NAME = 'treatments' 
      AND COLUMN_NAME IN ('discount_percentage', 'promo_start_date', 'promo_end_date')
    `);

    console.log('\n✓ Verification:');
    newColumns.forEach(col => {
      console.log(`  ${col.COLUMN_NAME}: ${col.COLUMN_TYPE} (Default: ${col.COLUMN_DEFAULT || 'NULL'})`);
    });

  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
      console.log('\nDatabase connection closed.');
    }
  }
}

// Run the migration
addTreatmentPromoFields();
