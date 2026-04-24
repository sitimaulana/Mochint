const { promisePool } = require('./config/database');

async function checkFacilitiesColumn() {
  try {
    console.log('🔍 Checking treatments table structure...');
    
    const [columns] = await promisePool.query(`
      SHOW COLUMNS FROM treatments
    `);

    console.log('\n📋 Treatments table columns:');
    columns.forEach(col => {
      console.log(`  - ${col.Field} (${col.Type})`);
    });

    const hasFacilities = columns.some(col => col.Field === 'facilities');
    
    if (hasFacilities) {
      console.log('\n✅ facilities column EXISTS');
    } else {
      console.log('\n❌ facilities column DOES NOT exist');
      console.log('\nRun this SQL to add it:');
      console.log('ALTER TABLE treatments ADD COLUMN facilities TEXT DEFAULT NULL;');
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

checkFacilitiesColumn();
