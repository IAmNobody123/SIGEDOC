const { Pool } = require("pg");

const pool = new Pool({
    user: "postgres",
    host: "localhost",
    database: "SIGEDOC",
    password: "12345",
    port: 5434
});

module.exports = pool;