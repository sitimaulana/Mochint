const { promisePool } = require('./config/database');

async function testInsert() {
  try {
    console.log('🧪 Testing INSERT into treatments table...');
    
    const testData = {
      name: 'Test Treatment',
      category: JSON.stringify(['Test']),
      duration: '60 min',
      price: 100000,
      description: 'Test description',
      image: '',
      facilities: JSON.stringify([]),
      discount_percentage: 0,
      promo_start_date: null,
      promo_end_date: null
    };

    console.log('\n📦 Test data:', testData);

    const [result] = await promisePool.query(
      `INSERT INTO treatments 
       (name, category, duration, price, description, image, facilities, discount_percentage, promo_start_date, promo_end_date)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [testData.name, testData.category, testData.duration, testData.price, testData.description, testData.image, testData.facilities, testData.discount_percentage, testData.promo_start_date, testData.promo_end_date]
    );

    console.log('\n✅ INSERT successful! ID:', result.insertId);

    // Delete test record
    await promisePool.query('DELETE FROM treatments WHERE id = ?', [result.insertId]);
    console.log('✅ Test record deleted');

    process.exit(0);
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    console.error('Full error:', error);
    process.exit(1);
  }
}

testInsert();
