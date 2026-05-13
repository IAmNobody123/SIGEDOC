const pool = require("../config/dbConfig");
const jwt = require("jsonwebtoken");

const createExternalDocument = async (req, res) => {
    const { nombre, descripcion_origen_externo, id_tipo, unidad_destino, observaciones } = req.body;
    const authHeader = req.headers.authorization;
    console.log(req.body)
    if (!authHeader) return res.status(401).json({ error: "No autorizado" });

    const token = authHeader.split(" ")[1];
    let decoded;
    try {
        decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (e) {
        return res.status(401).json({ error: "Token inválido" });
    }

    const creado_por = decoded.id;
    const unidad_origen = decoded.id_unidad; // Unidad actual (Mesa de partes)

    try {
        await pool.query('BEGIN');

        // Insertar documento
        const docQuery = `
            INSERT INTO documentos (nombre, fecha_creacion, creado_por, unidad_actual, estado_actual, externo, descripcion_origen_externo, id_tipo)
            VALUES ($1, NOW(), $2, $3, $4, $5, $6, $7) RETURNING id_documento
        `;
        const docResult = await pool.query(docQuery, [
            nombre,
            creado_por,
            unidad_destino,
            'Derivado',
            true,
            descripcion_origen_externo,
            id_tipo
        ]);

        const id_documento = docResult.rows[0].id_documento;

        // Insertar movimiento
        const movQuery = `
            INSERT INTO movimientos_documento (id_documento, unidad_origen, unidad_destino, fecha_movimiento, enviado_por, estado, observaciones)
            VALUES ($1, $2, $3, NOW(), $4, $5, $6)
        `;
        await pool.query(movQuery, [
            id_documento,
            unidad_origen,
            unidad_destino,
            creado_por,
            'ENVIADO',
            observaciones
        ]);

        await pool.query('COMMIT');

        if (req.io) {
            req.io.emit('documento_creado', {
                id_documento: id_documento,
                nombre: nombre,
                descripcion_origen_externo: descripcion_origen_externo,
                unidad_destino: unidad_destino,
                creado_por: creado_por,
                fecha: new Date().toISOString()
            });
        }

        res.status(201).json({ success: true, message: "Documento insertado y derivado correctamente", id_documento });
    } catch (error) {
        await pool.query('ROLLBACK');
        console.error("Error al crear documento externo:", error);
        res.status(500).json({ error: "Error al crear el documento" });
    }
};

const getTiposDocumento = async (req, res) => {
    try {
        const query = "SELECT id_tipo, nombre FROM tipos_documento ORDER BY id_tipo ASC";
        const result = await pool.query(query);
        res.json(result.rows);
    } catch (error) {
        res.status(500).json({ error: "Error al obtener tipos de documento" });
    }
};

const getAllDocuments = async (req, res) => {
    try {
        const query = `
            SELECT d.id_documento, d.nombre, d.fecha_creacion, d.estado_actual, d.externo, d.descripcion_origen_externo,
                   t.nombre as tipo_documento, u.nombre as unidad_actual_nombre, us.nombre as creador_nombre, us.apellido as creador_apellido
            FROM documentos d
            LEFT JOIN tipos_documento t ON d.id_tipo = t.id_tipo
            LEFT JOIN unidades u ON d.unidad_actual = u.id_unidad
            LEFT JOIN usuarios us ON d.creado_por = us.id_usuario
            ORDER BY d.fecha_creacion DESC
        `;
        const result = await pool.query(query);
        res.json(result.rows);
    } catch (error) {
        console.error("Error fetching documents:", error);
        res.status(500).json({ error: "Error al obtener documentos" });
    }
};

const getPendingDocumentsByUnidad = async (req, res) => {
    const { id } = req.params;
    try {
        const query = `
            SELECT d.id_documento, d.nombre, d.fecha_creacion, d.estado_actual, d.externo, d.descripcion_origen_externo,
                   t.nombre as tipo_documento, u.nombre as unidad_actual_nombre, d.unidad_actual,
                   us.nombre as creador_nombre, us.apellido as creador_apellido
            FROM documentos d
            LEFT JOIN tipos_documento t ON d.id_tipo = t.id_tipo
            LEFT JOIN unidades u ON d.unidad_actual = u.id_unidad
            LEFT JOIN usuarios us ON d.creado_por = us.id_usuario
            WHERE d.unidad_actual = $1 AND LOWER(d.estado_actual) <> 'finalizado'
            ORDER BY d.fecha_creacion DESC
        `;
        const result = await pool.query(query, [id]);
        res.json(result.rows);
    } catch (error) {
        console.error("Error fetching pending documents for unidad:", error);
        res.status(500).json({ error: "Error al obtener trámites pendientes" });
    }
};

const designarDocumento = async (req, res) => {
    const { id } = req.params;
    const { unidad_destino, observaciones } = req.body;
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ error: "No autorizado" });

    const token = authHeader.split(" ")[1];
    let decoded;
    try {
        decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (e) {
        return res.status(401).json({ error: "Token inválido" });
    }

    const unidad_origen = decoded.id_unidad;
    const enviado_por = decoded.id;

    try {
        await pool.query('BEGIN');

        const updateQuery = `
            UPDATE documentos
            SET unidad_actual = $1, estado_actual = 'Derivado'
            WHERE id_documento = $2
        `;
        await pool.query(updateQuery, [unidad_destino, id]);

        const movQuery = `
            INSERT INTO movimientos_documento (id_documento, unidad_origen, unidad_destino, fecha_movimiento, enviado_por, estado, observaciones)
            VALUES ($1, $2, $3, NOW(), $4, $5, $6)
        `;
        await pool.query(movQuery, [
            id,
            unidad_origen,
            unidad_destino,
            enviado_por,
            'ENVIADO',
            observaciones || ''
        ]);

        await pool.query('COMMIT');
        res.json({ success: true, message: 'Documento designado correctamente' });
    } catch (error) {
        await pool.query('ROLLBACK');
        console.error('Error al designar documento:', error);
        res.status(500).json({ error: 'Error al designar el documento' });
    }
};

const finalizarDocumento = async (req, res) => {
    const { id } = req.params;
    const { observaciones } = req.body;
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ error: "No autorizado" });

    const token = authHeader.split(" ")[1];
    let decoded;
    try {
        decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (e) {
        return res.status(401).json({ error: "Token inválido" });
    }

    const enviado_por = decoded.id;

    try {
        await pool.query('BEGIN');

        const currentDoc = await pool.query('SELECT unidad_actual FROM documentos WHERE id_documento = $1', [id]);
        if (currentDoc.rows.length === 0) {
            await pool.query('ROLLBACK');
            return res.status(404).json({ error: 'Documento no encontrado' });
        }

        const unidadActual = currentDoc.rows[0].unidad_actual;

        const movQuery = `
            INSERT INTO movimientos_documento (id_documento, unidad_origen, unidad_destino, fecha_movimiento, enviado_por, estado, observaciones)
            VALUES ($1, $2, $3, NOW(), $4, $5, $6)
        `;
        await pool.query(movQuery, [
            id,
            unidadActual,
            unidadActual,
            enviado_por,
            'ATENDIDO',
            observaciones || ''
        ]);

        const updateQuery = `
            UPDATE documentos
            SET estado_actual = 'Finalizado'
            WHERE id_documento = $1
        `;
        await pool.query(updateQuery, [id]);

        await pool.query('COMMIT');
        res.json({ success: true, message: 'Documento finalizado correctamente' });
    } catch (error) {
        await pool.query('ROLLBACK');
        console.error('Error al finalizar documento:', error);
        res.status(500).json({ error: 'Error al finalizar el documento' });
    }
};

const getDocumentMovements = async (req, res) => {
    const { id } = req.params;
    try {
        const query = `
            SELECT m.id_movimiento, m.fecha_movimiento, m.estado, m.observaciones,
                   uo.nombre as unidad_origen_nombre, ud.nombre as unidad_destino_nombre,
                   ue.nombre as enviado_por_nombre, ue.apellido as enviado_por_apellido,
                   ur.nombre as recibido_por_nombre, ur.apellido as recibido_por_apellido
            FROM movimientos_documento m
            LEFT JOIN unidades uo ON m.unidad_origen = uo.id_unidad
            LEFT JOIN unidades ud ON m.unidad_destino = ud.id_unidad
            LEFT JOIN usuarios ue ON m.enviado_por = ue.id_usuario
            LEFT JOIN usuarios ur ON m.recibido_por = ur.id_usuario
            WHERE m.id_documento = $1
            ORDER BY m.fecha_movimiento ASC
        `;
        const result = await pool.query(query, [id]);
        res.json(result.rows);
    } catch (error) {
        console.error("Error fetching document movements:", error);
        res.status(500).json({ error: "Error al obtener movimientos del documento" });
    }
};

module.exports = {
    createExternalDocument,
    getTiposDocumento,
    getAllDocuments,
    getDocumentMovements,
    getPendingDocumentsByUnidad,
    designarDocumento,
    finalizarDocumento
};
