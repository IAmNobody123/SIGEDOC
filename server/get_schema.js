const pool = require('./src/config/dbConfig');

async function getSchema() {
    try {
        const tablesQuery = `
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public'
        `;
        const { rows: tables } = await pool.query(tablesQuery);
        
        for (let table of tables) {
            console.log(`\nTable: ${table.table_name}`);
            const columnsQuery = `
                SELECT column_name, data_type 
                FROM information_schema.columns 
                WHERE table_name = $1
            `;
            const { rows: columns } = await pool.query(columnsQuery, [table.table_name]);
            columns.forEach(col => {
                console.log(`  ${col.column_name}: ${col.data_type}`);
            });
        }
    } catch (e) {
        console.error(e);
    } finally {
        pool.end();
    }
}

getSchema();
