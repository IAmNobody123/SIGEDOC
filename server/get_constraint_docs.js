const pool = require('./src/config/dbConfig');

async function getCheckConstraint() {
    try {
        const query = `
            SELECT c.conname, pg_get_constraintdef(c.oid) AS constraint_def
            FROM pg_constraint c
            JOIN pg_class t ON c.conrelid = t.oid
            WHERE t.relname = 'documentos';
        `;
        const { rows } = await pool.query(query);
        rows.forEach(row => {
            console.log(row.conname, ":", row.constraint_def);
        });
    } catch (e) {
        console.error(e);
    } finally {
        pool.end();
    }
}

getCheckConstraint();
