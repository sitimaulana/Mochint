const { promisePool } = require('./config/database');

async function checkData() {
  try {
    const [rows] = await promisePool.query('SELECT id, page_type, section_key, title, is_active FROM page_information ORDER BY page_type, display_order');
    
    console.log('\n📊 Data di tabel page_information:\n');
    console.log('Total records:', rows.length);
    console.log('\n');
    
    rows.forEach(row => {
      console.log(`ID: ${row.id} | Type: ${row.page_type.padEnd(6)} | Section: ${(row.section_key || '').padEnd(12)} | Title: ${row.title} | Active: ${row.is_active ? '✅' : '❌'}`);
    });
    
    console.log('\n');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

checkData();
