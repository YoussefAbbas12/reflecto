require('dotenv').config();
const mysql = require('mysql2/promise');

async function testDB(host, port) {
  return new Promise((resolve) => {
    const timeout = setTimeout(() => {
      console.log(`❌ ${host}:${port} - Timeout (unreachable)`);
      resolve();
    }, 5000);

    mysql.createConnection({
      host: host,
      port: port,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME
    }).then(conn => {
      clearTimeout(timeout);
      console.log(`✅ ${host}:${port} - Connected successfully!`);
      conn.end();
      resolve();
    }).catch(err => {
      clearTimeout(timeout);
      console.log(`❌ ${host}:${port} - ${err.code || err.message}`);
      resolve();
    });
  });
}

async function run() {
  console.log('Testing MySQL connection combinations:\n');
  
  // Test localhost first (most likely to work on shared hosting)
  await testDB('localhost', 3306);
  await testDB('127.0.0.1', 3306);
  await testDB('localhost', 3306);
}

run();
