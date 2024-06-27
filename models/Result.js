const db = require('../utils/db');

module.exports = {
  create: async (userId, shape, dimensions, area) => {
    try {
      const result = await db.query(
        'INSERT INTO results (user_id, shape, dimensions, area) VALUES ($1, $2, $3, $4) RETURNING *',
        [userId, shape, dimensions, area]
      );
      return result.rows[0];
    } catch (error) {
      console.error('Error creating result:', error);
      throw error;
    }
  },
  findByUserId: async (userId) => {
    try {
      const result = await db.query('SELECT * FROM results WHERE user_id = $1', [userId]);
      return result.rows;
    } catch (error) {
      console.error('Error fetching results:', error);
      throw error;
    }
  },
};
