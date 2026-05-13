const express = require("express");
const router = express.Router();
const upload = require("../config/multerConfig");
const {
    getUsers,
    createUser,
    updateUser,
    deleteUser,
    getRoles,
    getUnidades
} = require("../modules/user.controller");

router.get("/", getUsers);
router.post("/create", upload.single("foto_url"), createUser);
router.put("/update/:id", upload.single("foto_url"), updateUser);
router.delete("/delete/:id", deleteUser);

router.get("/roles", getRoles);
router.get("/unidades", getUnidades);

module.exports = router;
