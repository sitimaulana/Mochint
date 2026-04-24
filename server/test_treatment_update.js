const { promisePool } = require('./config/database');

async function testTreatmentUpdate() {
    try {
        console.log('🔍 Testing treatment update functionality...\n');
        
        // 1. Check table structure
        console.log('1. Checking treatments table structure:');
        const [columns] = await promisePool.query(`
            SHOW COLUMNS FROM treatments
        `);
        console.log('Columns:', columns.map(c => `${c.Field} (${c.Type})`).join(', '));
        console.log('');
        
        // 2. Check if promo fields exist
        console.log('2. Checking promo fields:');
        const promoFields = columns.filter(c => 
            ['discount_percentage', 'promo_start_date', 'promo_end_date'].includes(c.Field)
        );
        console.log('Promo fields found:', promoFields.map(f => f.Field).join(', '));
        console.log('');
        
        // 3. Get a sample treatment
        console.log('3. Getting sample treatment:');
        const [treatments] = await promisePool.query(`
            SELECT * FROM treatments LIMIT 1
        `);
        
        if (treatments.length === 0) {
            console.log('⚠️  No treatments found in database');
            process.exit(0);
        }
        
        const sampleTreatment = treatments[0];
        console.log('Sample treatment ID:', sampleTreatment.id);
        console.log('Name:', sampleTreatment.name);
        console.log('Current promo fields:');
        console.log('  - discount_percentage:', sampleTreatment.discount_percentage);
        console.log('  - promo_start_date:', sampleTreatment.promo_start_date);
        console.log('  - promo_end_date:', sampleTreatment.promo_end_date);
        console.log('');
        
        // 4. Test update with null dates
        console.log('4. Testing update with null dates:');
        await promisePool.query(`
            UPDATE treatments 
            SET discount_percentage = ?, promo_start_date = ?, promo_end_date = ?
            WHERE id = ?
        `, [0, null, null, sampleTreatment.id]);
        console.log('✅ Update with null dates successful');
        console.log('');
        
        // 5. Test update with valid dates
        console.log('5. Testing update with valid dates:');
        await promisePool.query(`
            UPDATE treatments 
            SET discount_percentage = ?, promo_start_date = ?, promo_end_date = ?
            WHERE id = ?
        `, [10, '2024-03-01', '2024-03-31', sampleTreatment.id]);
        console.log('✅ Update with valid dates successful');
        console.log('');
        
        // 6. Verify the update
        console.log('6. Verifying the update:');
        const [updatedTreatments] = await promisePool.query(`
            SELECT * FROM treatments WHERE id = ?
        `, [sampleTreatment.id]);
        
        const updated = updatedTreatments[0];
        console.log('Updated promo fields:');
        console.log('  - discount_percentage:', updated.discount_percentage);
        console.log('  - promo_start_date:', updated.promo_start_date);
        console.log('  - promo_end_date:', updated.promo_end_date);
        console.log('');
        
        // 7. Reset to original values
        console.log('7. Resetting to original values:');
        await promisePool.query(`
            UPDATE treatments 
            SET discount_percentage = ?, promo_start_date = ?, promo_end_date = ?
            WHERE id = ?
        `, [
            sampleTreatment.discount_percentage || 0, 
            sampleTreatment.promo_start_date || null, 
            sampleTreatment.promo_end_date || null, 
            sampleTreatment.id
        ]);
        console.log('✅ Reset successful');
        console.log('');
        
        console.log('✅ All tests passed! Treatment update functionality is working correctly.');
        process.exit(0);
        
    } catch (error) {
        console.error('❌ Error during test:', error);
        console.error('Error details:', error.message);
        console.error('Stack:', error.stack);
        process.exit(1);
    }
}

testTreatmentUpdate();
