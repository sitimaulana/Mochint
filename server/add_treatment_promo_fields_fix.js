const { promisePool } = require('./config/database');

async function addTreatmentPromoFields() {
    try {
        console.log('🔍 Checking treatments table structure...');
        
        // Check if promo fields exist
        const [columns] = await promisePool.query(`
            SHOW COLUMNS FROM treatments 
            WHERE Field IN ('discount_percentage', 'promo_start_date', 'promo_end_date')
        `);
        
        const existingFields = columns.map(col => col.Field);
        console.log('Existing promo fields:', existingFields);
        
        if (existingFields.length === 3) {
            console.log('✅ All promo fields already exist!');
            process.exit(0);
        }
        
        console.log('⚠️  Missing promo fields. Adding them now...');
        
        // Add missing fields
        if (!existingFields.includes('discount_percentage')) {
            await promisePool.query(`
                ALTER TABLE treatments 
                ADD COLUMN discount_percentage INT DEFAULT 0 COMMENT 'Persentase diskon (0-100)'
            `);
            console.log('✅ Added discount_percentage column');
        }
        
        if (!existingFields.includes('promo_start_date')) {
            await promisePool.query(`
                ALTER TABLE treatments 
                ADD COLUMN promo_start_date DATE DEFAULT NULL COMMENT 'Tanggal mulai promo'
            `);
            console.log('✅ Added promo_start_date column');
        }
        
        if (!existingFields.includes('promo_end_date')) {
            await promisePool.query(`
                ALTER TABLE treatments 
                ADD COLUMN promo_end_date DATE DEFAULT NULL COMMENT 'Tanggal akhir promo'
            `);
            console.log('✅ Added promo_end_date column');
        }
        
        // Update existing treatments with default values
        await promisePool.query(`
            UPDATE treatments 
            SET discount_percentage = COALESCE(discount_percentage, 0),
                promo_start_date = COALESCE(promo_start_date, NULL),
                promo_end_date = COALESCE(promo_end_date, NULL)
        `);
        console.log('✅ Updated existing treatments with default values');
        
        console.log('✅ All promo fields added successfully!');
        process.exit(0);
        
    } catch (error) {
        console.error('❌ Error adding promo fields:', error);
        process.exit(1);
    }
}

addTreatmentPromoFields();
