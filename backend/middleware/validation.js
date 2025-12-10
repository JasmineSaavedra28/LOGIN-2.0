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
        .custom((value) => {
            // VALIDACIÓN DE NOMBRES PROHIBIDOS
            const forbiddenNames = ['Eminem', 'Dua Lipa', 'Catriel', 'Paco Amoroso'];
            const normalizedName = value.trim().toLowerCase();
            const forbiddenNormalized = forbiddenNames.map(n => n.toLowerCase());
            
            if (forbiddenNormalized.includes(normalizedName)) {
                throw new Error('Este nombre de artista no está permitido');
            }
            return value;
        })
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
        .customSanitizer(sanitizeInput),
    body('entry_type')
        .optional()
        .isIn(['gorra', 'gratuito', 'beneficio', 'arancelado'])
        .withMessage('Tipo de entrada inválido'),
    body('price')
        .optional()
        .isFloat({ min: 0 })
        .withMessage('El precio debe ser un número positivo'),
    body('ticket_url')
        .optional()
        .isURL()
        .withMessage('URL de entradas inválida'),
    body('flyer_url')
        .optional()
        .isURL()
        .withMessage('URL de flyer inválida'),
    body('status')
        .optional()
        .isIn(['activo', 'cancelado', 'postponed'])
        .withMessage('Estado de evento inválido')
];

// Validaciones para perfiles de artistas
const validateProfile = [
    body('photo_url')
        .optional()
        .isURL()
        .withMessage('URL de foto inválida'),
    body('phone')
        .optional()
        .trim()
        .isLength({ max: 20 })
        .withMessage('El teléfono no puede superar 20 caracteres')
        .customSanitizer(sanitizeInput),
    body('website')
        .optional()
        .isURL()
        .withMessage('URL de sitio web inválida'),
    body('portfolio_url')
        .optional()
        .isURL()
        .withMessage('URL de portfolio inválida'),
    body('spotify_url')
        .optional()
        .custom((value) => {
            if (value && !value.includes('spotify.com')) {
                throw new Error('URL de Spotify inválida');
            }
            return true;
        }),
    body('apple_music_url')
        .optional()
        .custom((value) => {
            if (value && !value.includes('music.apple.com')) {
                throw new Error('URL de Apple Music inválida');
            }
            return true;
        }),
    body('tidal_url')
        .optional()
        .custom((value) => {
            if (value && !value.includes('tidal.com')) {
                throw new Error('URL de Tidal inválida');
            }
            return true;
        }),
    body('youtube_music_url')
        .optional()
        .custom((value) => {
            if (value && !value.includes('music.youtube.com')) {
                throw new Error('URL de YouTube Music inválida');
            }
            return true;
        }),
    body('youtube_channel_url')
        .optional()
        .custom((value) => {
            if (value && !value.includes('youtube.com') && !value.includes('youtu.be')) {
                throw new Error('URL de canal de YouTube inválida');
            }
            return true;
        }),
    body('instagram_url')
        .optional()
        .custom((value) => {
            if (value && !value.includes('instagram.com')) {
                throw new Error('URL de Instagram inválida');
            }
            return true;
        }),
    body('bio')
        .optional()
        .trim()
        .isLength({ max: 1000 })
        .withMessage('La biografía no puede superar los 1000 caracteres')
        .customSanitizer(sanitizeInput),
    body('genre')
        .optional()
        .trim()
        .isLength({ max: 100 })
        .withMessage('El género no puede superar los 100 caracteres')
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
    validateEvent,
    validateProfile,
    handleValidationErrors,
    sanitizeInput
};  