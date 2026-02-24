import 'dotenv/config';
import mysql from 'mysql2/promise';
import bcrypt from 'bcrypt';

const pool = mysql.createPool({
  host: process.env.MYSQL_HOST || 'localhost',
  user: process.env.MYSQL_USER || 'root',
  password: process.env.MYSQL_PASSWORD || '',
  database: process.env.MYSQL_DATABASE || 'aa2000',
});

async function seed() {
  const passwordHash = await bcrypt.hash('admin', 10);
  try {
    await pool.query(
      'INSERT INTO admin_users (username, password_hash) VALUES (?, ?)',
      ['admin', passwordHash]
    );
    console.log('Default admin user created: username=admin, password=admin');
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      console.log('Admin user "admin" already exists. Skip seed.');
    } else {
      throw err;
    }
  } finally {
    await pool.end();
  }
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
