const express = require("express");
const router = express.Router();
const {
    createExternalDocument,
    getTiposDocumento,
    getAllDocuments,
    getPendingDocumentsByUnidad,
    designarDocumento,
    finalizarDocumento,
    getDocumentMovements
} = require("../modules/documents.controller");

router.post("/external", createExternalDocument);
router.get("/tipos", getTiposDocumento);
router.get("/", getAllDocuments);
router.get("/unidad/:id/pending", getPendingDocumentsByUnidad);
router.post("/:id/designar", designarDocumento);
router.put("/:id/finalizar", finalizarDocumento);
router.get("/:id/movimientos", getDocumentMovements);

module.exports = router;
