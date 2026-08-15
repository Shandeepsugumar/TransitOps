const { Client } = require('pg');
const client = new Client({
  connectionString: 'postgresql://neondb_owner:npg_jwkmB7sJ8hVD@ep-sparkling-feather-ay9r8yac-pooler.c-5.us-east-2.aws.neon.tech/neondb?sslmode=require'
});

async function run() {
  await client.connect();
  try {
    const res = await client.query('SELECT * FROM trips');
    console.log('Total trips:', res.rows.length);
    if (res.rows.length > 0) {
      console.log('Most recent trip:', res.rows[res.rows.length - 1]);
    }
  } catch (err) {
    console.error('Error:', err);
  } finally {
    await client.end();
  }
}
run();
