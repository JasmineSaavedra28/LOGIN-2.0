const { body, validationResult } = require('express-validator');

// Función para sanitizar y validar datos de entrada
const sanitizeInput = (input) => {
    if (typeof input !== 'string') return input;
    
    // Remover caracteres peligrosos para XSS
    return input
        .replace(/[<>]/g, '') // Remover < y >
        .replace(/javascript:/gi, '') // Remover javascript:
        .replace(/on\w+=/gi, '') // Remover event handlers
        .trim();
};

// Validaciones para registro
const validateRegister = [
    body('name')
        .trim()
        .isLength({ min: 2, max: 50 })
        .withMessage('El nombre debe tener entre 2 y 50 caracteres')
        .customSanitizer(sanitizeInput),
    
    body('email')
        .isEmail()
        .normalizeEmail()
        .withMessage('Email inválido'),
    
    body('password')
        .isLength({ min: 6 })
        .withMessage('La contraseña debe tener al menos 6 caracteres')
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
        .withMessage('La contraseña debe contener al menos una mayúscula, una minúscula y un número'),
    
    body('role')
        .optional()
        .isIn(['admin', 'artista'])
        .withMessage('Rol inválido')
];

// Validaciones para login
const validateLogin = [
    body('email')
        .isEmail()
        .normalizeEmail()
        .withMessage('Email inválido'),
    
    body('password')
        .notEmpty()
        .withMessage('La contraseña es requerida')
];

// Middleware para manejar errores de validación
const handleValidationErrors = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            message: 'Datos de entrada inválidos',
            errors: errors.array()
        });
    }
    next();
};

module.exports = {
    validateRegister,
    validateLogin,
    handleValidationErrors,
    sanitizeInput
}; 