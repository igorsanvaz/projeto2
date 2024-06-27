const db = require('../utils/dp');

module.exports = {
  create: async (userId, shape, dimensions, area) => {
    const result = await db.query(
      'INSERT INTO results (user_id, shape, dimensions, area) VALUES ($1, $2, $3, $4) RETURNING *',
      [userId, shape, dimensions, area]
    );
    return result.rows[0];
  },
  findByUserId: async (userId) => {
    const result = await db.query('SELECT * FROM results WHERE user_id = $1', [userId]);
    return result.rows;
  },
};
