const { promisePool } = require('../config/database');

class TreatmentOptions {
  // Get all options by type (category or facility)
  static async getByType(type) {
    const [rows] = await promisePool.query(
      'SELECT * FROM treatment_options WHERE option_type = ? AND is_active = TRUE ORDER BY option_value ASC',
      [type]
    );
    return rows;
  }

  // Get all categories
  static async getCategories() {
    return this.getByType('category');
  }

  // Get all facilities
  static async getFacilities() {
    return this.getByType('facility');
  }

  // Add new option
  static async create(optionType, optionValue) {
    const [result] = await promisePool.query(
      'INSERT INTO treatment_options (option_type, option_value) VALUES (?, ?)',
      [optionType, optionValue]
    );
    return {
      id: result.insertId,
      option_type: optionType,
      option_value: optionValue,
      is_active: true
    };
  }

  // Soft delete option (set is_active to FALSE)
  static async softDelete(id) {
    const [result] = await promisePool.query(
      'UPDATE treatment_options SET is_active = FALSE WHERE id = ?',
      [id]
    );
    return result.affectedRows > 0;
  }

  // Soft delete by value and type
  static async softDeleteByValue(optionType, optionValue) {
    const [result] = await promisePool.query(
      'UPDATE treatment_options SET is_active = FALSE WHERE option_type = ? AND option_value = ?',
      [optionType, optionValue]
    );
    return result.affectedRows > 0;
  }

  // Restore deleted option
  static async restore(id) {
    const [result] = await promisePool.query(
      'UPDATE treatment_options SET is_active = TRUE WHERE id = ?',
      [id]
    );
    return result.affectedRows > 0;
  }

  // Hard delete option (permanent)
  static async hardDelete(id) {
    const [result] = await promisePool.query(
      'DELETE FROM treatment_options WHERE id = ?',
      [id]
    );
    return result.affectedRows > 0;
  }

  // Check if option exists
  static async exists(optionType, optionValue) {
    const [rows] = await promisePool.query(
      'SELECT * FROM treatment_options WHERE option_type = ? AND option_value = ?',
      [optionType, optionValue]
    );
    return rows.length > 0 ? rows[0] : null;
  }
}

module.exports = TreatmentOptions;
