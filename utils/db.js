const { Pool } = require('pg');

var conString = process.env.DATABASE_URL;
const pool = new Pool(conString);

pool.on('error', (err, client) => {
  console.error('Unexpected error on idle client', err);
  process.exit(-1);
});

module.exports = {
  query: (text, params) => pool.query(text, params),
};
