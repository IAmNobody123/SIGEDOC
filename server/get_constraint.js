const pool = require('./src/config/dbConfig');

async function getCheckConstraint() {
    try {
        const query = `
            SELECT pg_get_constraintdef(c.oid) AS constraint_def
            FROM pg_constraint c
            JOIN pg_class t ON c.conrelid = t.oid
            WHERE c.conname = 'movimientos_documento_estado_check';
        `;
        const { rows } = await pool.query(query);
        console.log("Check constraint definition:", rows[0].constraint_def);
    } catch (e) {
        console.error(e);
    } finally {
        pool.end();
    }
}

getCheckConstraint();
