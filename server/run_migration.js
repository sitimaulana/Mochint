const { pool } = require('./config/database');
const fs = require('fs');
const path = require('path');

async function runMigration() {
  try {
    console.log('🔄 Running page_information table migration...');
    
    // Read SQL file
    const sqlFile = path.join(__dirname, 'create_page_information_table.sql');
    const sql = fs.readFileSync(sqlFile, 'utf8');
    
    // Use connection instead of pool to execute multiple statements
    pool.getConnection((err, connection) => {
      if (err) {
        console.error('❌ Failed to get connection:', err);
        process.exit(1);
      }
      
      // Enable multiple statements
      connection.query({ sql, multipleStatements: true }, (error, results) => {
        connection.release();
        
        if (error) {
          console.error('❌ Migration failed:', error.message);
          process.exit(1);
        }
        
        console.log('✅ Migration completed successfully!');
        
        // Verify table exists
        pool.query('SELECT COUNT(*) as count FROM page_information', (err, rows) => {
          if (err) {
            console.error('❌ Error verifying table:', err.message);
          } else {
            console.log(`\n📊 Total records in page_information: ${rows[0].count}`);
          }
          process.exit(0);
        });
      });
    });
    
  } catch (error) {
    console.error('❌ Error reading SQL file:', error);
    process.exit(1);
  }
}

runMigration();
