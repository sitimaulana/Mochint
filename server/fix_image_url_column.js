const { promisePool } = require('./config/database');

async function fixImageUrlColumn() {
  try {
    console.log('🔧 Starting to fix image_url column...');
    
    // Alter the column to LONGTEXT
    await promisePool.query(`
      ALTER TABLE page_information 
      MODIFY COLUMN image_url LONGTEXT COLLATE utf8mb4_unicode_ci DEFAULT NULL
    `);
    
    console.log('✅ Successfully changed image_url column to LONGTEXT');
    
    // Verify the change
    const [result] = await promisePool.query(`
      SELECT COLUMN_NAME, DATA_TYPE, CHARACTER_MAXIMUM_LENGTH 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = 'beauty_clinic' 
      AND TABLE_NAME = 'page_information' 
      AND COLUMN_NAME = 'image_url'
    `);
    
    console.log('📊 Column info:', result[0]);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error fixing image_url column:', error);
    process.exit(1);
  }
}

fixImageUrlColumn();
