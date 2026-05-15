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

const getUserDocumentHistory = async (req, res) => {
    const { id } = req.params;
    try {
        const query = `
            SELECT DISTINCT d.id_documento, d.nombre, d.fecha_creacion, d.estado_actual, d.externo,
                   d.descripcion_origen_externo, t.nombre AS tipo_documento,
                   u.nombre AS unidad_actual_nombre, us.nombre AS creador_nombre, us.apellido AS creador_apellido
            FROM documentos d
            INNER JOIN movimientos_documento m ON d.id_documento = m.id_documento
            LEFT JOIN tipos_documento t ON d.id_tipo = t.id_tipo
            LEFT JOIN unidades u ON d.unidad_actual = u.id_unidad
            LEFT JOIN usuarios us ON d.creado_por = us.id_usuario
            WHERE m.enviado_por = $1 OR m.recibido_por = $1
            ORDER BY d.fecha_creacion DESC
        `;
        const result = await pool.query(query, [id]);
        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching user document history:', error);
        res.status(500).json({ error: 'Error al obtener histórico de documentos' });
    }
};

const getUserDocumentStats = async (req, res) => {
    const { id } = req.params;
    try {
        const query = `
            SELECT 
                COUNT(DISTINCT d.id_documento) AS total_documentos,
                COUNT(DISTINCT CASE WHEN LOWER(d.estado_actual) = 'finalizado' THEN d.id_documento END) AS documentos_finalizados,
                COUNT(DISTINCT CASE WHEN LOWER(d.estado_actual) <> 'finalizado' THEN d.id_documento END) AS documentos_pendientes
            FROM documentos d
            INNER JOIN movimientos_documento m ON d.id_documento = m.id_documento
            WHERE m.enviado_por = $1 OR m.recibido_por = $1
        `;
        const result = await pool.query(query, [id]);
        res.json({
            total_documentos: parseInt(result.rows[0].total_documentos, 10),
            documentos_finalizados: parseInt(result.rows[0].documentos_finalizados, 10),
            documentos_pendientes: parseInt(result.rows[0].documentos_pendientes, 10),
        });
    } catch (error) {
        console.error('Error fetching user document statistics:', error);
        res.status(500).json({ error: 'Error al obtener estadísticas de usuario' });
    }
};

const getNotifications = async (req, res) => {
    try {
        const query = `
            SELECT n.id_notificacion, n.id_usuario, n.mensaje, n.fecha, n.id_documento,
                   d.nombre as documento_nombre
            FROM notificaciones n
            LEFT JOIN documentos d ON n.id_documento = d.id_documento
            ORDER BY n.fecha DESC
            LIMIT 20
        `;
        const result = await pool.query(query);
        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching notifications:', error);
        res.status(500).json({ error: 'Error al obtener notificaciones' });
    }
};

const designarDocumento = async (req, res) => {
    const { id } = req.params;
    const { unidad_destino, observaciones, id_usuario } = req.body;
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

        const docInfo = await pool.query('SELECT nombre FROM documentos WHERE id_documento = $1', [id]);
        const nombreDocumento = docInfo.rows.length > 0 ? docInfo.rows[0].nombre : `Documento ${id}`;

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

        const movQuery2 = `
            INSERT INTO notificaciones (id_usuario, mensaje, fecha, id_documento)
            VALUES ($1, $2, NOW(), $3)
        `;
        await pool.query(movQuery2, [
            id_usuario,
            'El documento ' + nombreDocumento + ' ha sido designado a la unidad ' + unidad_destino,
            id,
        ]);

        await pool.query('COMMIT');

        if (req.io) {
            req.io.emit('documento_designado', {
                id_documento: id,
                nombre: nombreDocumento,
                unidad_destino,
                enviado_por,
                fecha: new Date().toISOString(),
                mensaje: 'Documento designado a otra unidad'
            });
        }

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

const getDocumentStats = async (req, res) => {
    try {
        const totalQuery = "SELECT COUNT(*) as total FROM documentos";
        const finalizedQuery = "SELECT COUNT(*) as total FROM documentos WHERE LOWER(estado_actual) = 'finalizado'";

        const totalResult = await pool.query(totalQuery);
        const finalizedResult = await pool.query(finalizedQuery);

        res.json({
            total_documentos: parseInt(totalResult.rows[0].total),
            documentos_finalizados: parseInt(finalizedResult.rows[0].total)
        });
    } catch (error) {
        console.error("Error al obtener estadísticas de documentos:", error);
        res.status(500).json({ error: "Error al obtener estadísticas de documentos" });
    }
};

module.exports = {
    createExternalDocument,
    getTiposDocumento,
    getAllDocuments,
    getDocumentMovements,
    getPendingDocumentsByUnidad,
    getUserDocumentHistory,
    getUserDocumentStats,
    designarDocumento,
    finalizarDocumento,
    getDocumentStats,
    getNotifications
};
