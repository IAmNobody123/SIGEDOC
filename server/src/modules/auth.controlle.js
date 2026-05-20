const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const pool = require("../config/dbConfig");

const login = async (req, res) => {
    const SECRET_KEY = process.env.JWT_SECRET;
    const backendUrl = process.env.BACKEND_URL;
    const { dni, password } = req.body;
    if (!dni || !/^[0-9]{8}$/.test(dni)) {
        return res.status(400).json({ error: "DNI inválido. Debe contener exactamente 8 dígitos." });
    }
    try {
        const query = `
            SELECT u.*, r.nombre as rol_nombre 
            FROM usuarios u 
            LEFT JOIN roles r ON u.id_rol = r.id_rol 
            WHERE u.email = $1
        `;
        const result = await pool.query(query, [dni]);

        if (result.rows.length === 0) {
            return res.status(401).json({ error: "Usuario no encontrado" });
        }
        const user = result.rows[0];

        const match = await bcrypt.compare(password, user.password);

        if (!match) {
            return res.status(401).json({ error: "Contraseña incorrecta" });
        }

        const payload = {
            id: user.id_usuario,
            nombre: user.nombre,
            apellido: user.apellido,
            dni: user.email,
            email: user.email,
            rol: user.rol_nombre,
            id_unidad: user.id_unidad,
            imagen: user.foto_url ? `${backendUrl}/uploads/img/perfil/${user.foto_url}` : null,
        };


        const token = jwt.sign(payload, SECRET_KEY, {
            expiresIn: "1h",
        });
        console.log(payload);
        res.json({
            success: true,
            message: "Login exitoso",
            token: token,
            user: payload,
        });
    } catch (error) {
        console.error("Error en login:", error);
        res.status(500).json({ error: "Error en el servidor" });
    }
};

const validateToken = (req, res) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(401).json({ error: "Token no proporcionado" });
    }

    const token = authHeader.split(" ")[1];
    const SECRET_KEY = process.env.JWT_SECRET;

    try {
        const decoded = jwt.verify(token, SECRET_KEY);
        console.log(decoded);
        res.json({
            valid: true,
            user: decoded
        });
    } catch (error) {
        res.status(401).json({ error: "Token inválido" });
    }
};

const register = async (req, res) => {
    const { nombre, apellido, dni, password, id_unidad, foto_url, id_rol } = req.body;
    if (!dni || !/^[0-9]{8}$/.test(dni)) {
        return res.status(400).json({ error: "DNI inválido. Debe contener exactamente 8 dígitos." });
    }
    try {
        const hashedPassword = await bcrypt.hash(password, 8);
        const query =
            `INSERT INTO usuarios 
            (nombre, apellido, email, password, id_unidad, foto_url, id_rol) 
            VALUES ($1, $2, $3, $4, $5,$6,$7) RETURNING *`;
        const result = await pool.query(query, [
            nombre,
            apellido,
            dni,
            hashedPassword,
            id_unidad,
            foto_url,
            id_rol,
        ]);
        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error("Error en registro:", error);
        res.status(500).json({ error: "Error en el servidor" });
    }
};

module.exports = {
    login,
    validateToken,
    register,
};
