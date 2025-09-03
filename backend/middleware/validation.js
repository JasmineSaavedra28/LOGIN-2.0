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

// Validaciones para eventos
const validateEvent = [
    body('title')
        .trim()
        .isLength({ min: 3, max: 100 })
        .withMessage('El título debe tener entre 3 y 100 caracteres')
        .customSanitizer(sanitizeInput),
    body('description')
        .optional()
        .trim()
        .isLength({ max: 500 })
        .withMessage('La descripción no puede superar los 500 caracteres')
        .customSanitizer(sanitizeInput),
    body('event_date')
        .isISO8601()
        .toDate()
        .withMessage('La fecha del evento debe ser una fecha válida'),
    body('venue')
        .trim()
        .isLength({ min: 3, max: 100 })
        .withMessage('El lugar debe tener entre 3 y 100 caracteres')
        .customSanitizer(sanitizeInput),
    body('city')
        .trim()
        .isLength({ min: 3, max: 50 })
        .withMessage('La ciudad debe tener entre 3 y 50 caracteres')
        .customSanitizer(sanitizeInput)
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
    validateEvent, // <-- AÑADIDO
    handleValidationErrors,
    sanitizeInput
};  