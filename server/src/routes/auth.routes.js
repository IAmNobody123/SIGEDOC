const express = require("express");
const router = express.Router();
module.exports = router;
const { login, validateToken, register } = require("../modules/auth.controlle");


router.post('/login', login);
router.post('/register', register);
router.post('/validate-token', validateToken);