const { promisePool } = require('./config/database');
const fs = require('fs');
const path = require('path');

async function createTreatmentOptionsTable() {
  try {
    console.log('📦 Creating treatment_options table...');
    
    // Read SQL file
    const sqlFile = fs.readFileSync(
      path.join(__dirname, 'create_treatment_options_table.sql'),
      'utf-8'
    );
    
    // Split by semicolon and execute each statement
    const statements = sqlFile
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0);
    
    for (const statement of statements) {
      await promisePool.query(statement);
    }
    
    console.log('✅ treatment_options table created successfully!');
    console.log('✅ Default categories and facilities inserted!');
    
    // Verify data
    const [categories] = await promisePool.query(
      "SELECT COUNT(*) as count FROM treatment_options WHERE option_type = 'category'"
    );
    const [facilities] = await promisePool.query(
      "SELECT COUNT(*) as count FROM treatment_options WHERE option_type = 'facility'"
    );
    
    console.log(`📊 Categories: ${categories[0].count}`);
    console.log(`📊 Facilities: ${facilities[0].count}`);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating treatment_options table:', error);
    process.exit(1);
  }
}

createTreatmentOptionsTable();
