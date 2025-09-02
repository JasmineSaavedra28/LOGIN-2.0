const express = require('express');
const router = express.Router();
const AuthController = require('../controllers/authController');
const { validateRegister, validateLogin, handleValidationErrors } = require('../middleware/validation');
const { authenticateToken } = require('../middleware/auth');
const { auditMiddleware } = require('../middleware/logger');

// Ruta de registro
router.post('/register', 
    validateRegister, 
    handleValidationErrors,
    auditMiddleware('USER_REGISTER'),
    AuthController.register
);

// Ruta de login
router.post('/login', 
    validateLogin, 
    handleValidationErrors,
    auditMiddleware('USER_LOGIN'),
    AuthController.login
);

// Ruta para obtener perfil del usuario (requiere autenticación)
router.get('/profile', 
    authenticateToken,
    auditMiddleware('GET_PROFILE'),
    AuthController.getProfile
);

module.exports = router; 