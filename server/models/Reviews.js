const { promisePool } = require('../config/database');

class Reviews {
    // Get all reviews
    static async list() {
        const [rows] = await promisePool.query(`
            SELECT 
        'Sari' as customer_name,
        5 as rating,
        'Pelayanan sangat memuaskan!' as comment,
        'Facial Treatment' as treatment
      UNION ALL
      SELECT 
        'Rina' as customer_name,
        4 as rating,
        'Terapisnya ramah dan profesional' as comment,
        'Body Massage' as treatment
        `);
        return rows;
    }
}

module.exports = Reviews;