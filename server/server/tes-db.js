const mysql = require('mysql2/promise');

async function testDatabase() {
  try {
    const connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: '',
      database: 'beauty_clinic'
    });
    
    console.log('✅ Database connected');
    
    // Cek tabel appointments
    const [tables] = await connection.execute('SHOW TABLES');
    console.log('Tables:', tables);
    
    // Cek struktur appointments
    const [columns] = await connection.execute('DESCRIBE appointments');
    console.log('Appointments columns:');
    columns.forEach(col => {
      console.log(`  ${col.Field} - ${col.Type} ${col.Null === 'YES' ? 'NULL' : 'NOT NULL'}`);
    });
    
    // Cek data
    const [rows] = await connection.execute('SELECT * FROM appointments LIMIT 5');
    console.log('Sample data:', rows);
    
    await connection.end();
    console.log('✅ Test completed');
  } catch (error) {
    console.error('❌ Database error:', error.message);
    console.error('SQL:', error.sqlMessage);
  }
}

testDatabase();