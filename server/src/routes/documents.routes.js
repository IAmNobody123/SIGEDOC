const express = require("express");
const router = express.Router();
const {
    createExternalDocument,
    getTiposDocumento,
    getAllDocuments,
    getPendingDocumentsByUnidad,
    getUserDocumentHistory,
    getUserDocumentStats,
    designarDocumento,
    finalizarDocumento,
    getDocumentMovements,
    getDocumentStats,
    getNotifications,
    aprobarDerivacion,
    rechazarDerivacion,
    getDerivacionesPendientes,
    getMovimientosRecientes
} = require("../modules/documents.controller");

router.post("/external", createExternalDocument);
router.get("/tipos", getTiposDocumento);
router.get("/stats/documentos", getDocumentStats);
router.get("/notificaciones", getNotifications);
router.get("/movimientos/recientes", getMovimientosRecientes);
router.get("/derivaciones/pendientes", getDerivacionesPendientes);
router.get("/usuario/:id/estadisticas", getUserDocumentStats);
router.get("/usuario/:id/historico", getUserDocumentHistory);
router.get("/", getAllDocuments);
router.get("/unidad/:id/pending", getPendingDocumentsByUnidad);
router.post("/:id/designar", designarDocumento);
router.put("/:id/finalizar", finalizarDocumento);
router.get("/:id/movimientos", getDocumentMovements);
router.post("/:id/aprobar-derivacion", aprobarDerivacion);
router.post("/:id/rechazar-derivacion", rechazarDerivacion);

module.exports = router;
