const pool = require("../config/dbConfig");
const bcrypt = require("bcrypt");

const getUsers = async (req, res) => {
    try {
        const query = `
            SELECT u.id_usuario, u.nombre, u.apellido, u.email as dni, u.foto_url, u.id_rol, u.id_unidad,
                   r.nombre as rol_nombre, un.nombre as unidad_nombre 
            FROM usuarios u
            LEFT JOIN roles r ON u.id_rol = r.id_rol
            LEFT JOIN unidades un ON u.id_unidad = un.id_unidad
            ORDER BY u.id_usuario ASC
        `;
        const result = await pool.query(query);
        res.json(result.rows);
    } catch (error) {
        console.error("Error al obtener usuarios:", error);
        res.status(500).json({ error: "Error en el servidor al obtener usuarios" });
    }
};

const createUser = async (req, res) => {
    const { nombre, apellido, dni, password, id_unidad, id_rol } = req.body;
    if (!dni || !/^[0-9]{8}$/.test(dni)) {
        return res.status(400).json({ error: "DNI inválido. Debe contener exactamente 8 dígitos." });
    }
    let foto_url = null;
    if (req.file) {
        foto_url = req.file.filename;
    }

    try {
        const hashedPassword = await bcrypt.hash(password, 8);
        const query = `
            INSERT INTO usuarios (nombre, apellido, email, password, id_unidad, id_rol, foto_url) 
            VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id_usuario, nombre, email
        `;
        const result = await pool.query(query, [
            nombre,
            apellido,
            dni,
            hashedPassword,
            id_unidad || null,
            id_rol || null,
            foto_url
        ]);
        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error("Error al crear usuario:", error);
        res.status(500).json({ error: "Error al crear usuario" });
    }
};

const updateUser = async (req, res) => {
    const { id } = req.params;
    const { nombre, apellido, dni, password, id_unidad, id_rol } = req.body;
    
    try {
        let query;
        let params;
        let paramCount = 1;

        let setClauses = [];
        let values = [];

        if (nombre) { setClauses.push(`nombre = $${paramCount++}`); values.push(nombre); }
        if (apellido) { setClauses.push(`apellido = $${paramCount++}`); values.push(apellido); }
        if (dni) {
            if (!/^[0-9]{8}$/.test(dni)) {
                return res.status(400).json({ error: "DNI inválido. Debe contener exactamente 8 dígitos." });
            }
            setClauses.push(`email = $${paramCount++}`); values.push(dni);
        }
        if (id_unidad) { setClauses.push(`id_unidad = $${paramCount++}`); values.push(id_unidad); }
        if (id_rol) { setClauses.push(`id_rol = $${paramCount++}`); values.push(id_rol); }
        
        if (password) {
            const hashedPassword = await bcrypt.hash(password, 8);
            setClauses.push(`password = $${paramCount++}`);
            values.push(hashedPassword);
        }
        
        if (req.file) {
            setClauses.push(`foto_url = $${paramCount++}`);
            values.push(req.file.filename);
        }

        if (setClauses.length === 0) {
            return res.status(400).json({ error: "No hay datos para actualizar" });
        }

        query = `UPDATE usuarios SET ${setClauses.join(", ")} WHERE id_usuario = $${paramCount} RETURNING id_usuario`;
        values.push(id);

        const result = await pool.query(query, values);
        if (result.rowCount === 0) {
            return res.status(404).json({ error: "Usuario no encontrado" });
        }
        
        res.json({ message: "Usuario actualizado correctamente" });
    } catch (error) {
        console.error("Error al actualizar usuario:", error);
        res.status(500).json({ error: "Error al actualizar usuario" });
    }
};

const deleteUser = async (req, res) => {
    const { id } = req.params;
    try {
        const query = "DELETE FROM usuarios WHERE id_usuario = $1 RETURNING id_usuario";
        const result = await pool.query(query, [id]);
        if (result.rowCount === 0) {
            return res.status(404).json({ error: "Usuario no encontrado" });
        }
        res.json({ message: "Usuario eliminado correctamente" });
    } catch (error) {
        console.error("Error al eliminar usuario:", error);
        res.status(500).json({ error: "Error al eliminar usuario" });
    }
};

const getRoles = async (req, res) => {
    try {
        const query = "SELECT id_rol, nombre FROM roles ORDER BY id_rol ASC";
        const result = await pool.query(query);
        res.json(result.rows);
    } catch (error) {
        console.error("Error al obtener roles:", error);
        res.status(500).json({ error: "Error al obtener roles" });
    }
};

const getUnidades = async (req, res) => {
    try {
        const query = "SELECT id_unidad, nombre, tipo FROM unidades ORDER BY id_unidad ASC";
        const result = await pool.query(query);
        res.json(result.rows);
    } catch (error) {
        console.error("Error al obtener unidades:", error);
        res.status(500).json({ error: "Error al obtener unidades" });
    }
};

const getUserStats = async (req, res) => {
    try {
        const query = "SELECT COUNT(*) as total FROM usuarios";
        const result = await pool.query(query);
        res.json({ total_usuarios: parseInt(result.rows[0].total) });
    } catch (error) {
        console.error("Error al obtener estadísticas de usuarios:", error);
        res.status(500).json({ error: "Error al obtener estadísticas de usuarios" });
    }
};

module.exports = {
    getUsers,
    createUser,
    updateUser,
    deleteUser,
    getRoles,
    getUnidades,
    getUserStats
};
