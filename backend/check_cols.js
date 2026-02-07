import pool from './src/db/pool.js';

pool.query("SELECT * FROM products LIMIT 0").then(res => {
    console.log('COLUMNS:', res.fields.map(f => f.name));
    process.exit(0);
}).catch(e => {
    console.error(e);
    process.exit(1);
});
