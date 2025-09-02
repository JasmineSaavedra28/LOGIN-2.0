const jwt = require('jsonwebtoken');
const User = require('../models/User'); // Asegúrate que la ruta a tu modelo User sea correcta

/**
 * Middleware para proteger rutas.
 * Verifica el token JWT y adjunta el usuario a la petición (req.user).
 */
exports.protect = async (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            // Obtener token del header "Bearer <token>"
            token = req.headers.authorization.split(' ')[1];

            // Verificar el token con la clave secreta
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            // Buscar el usuario por el ID del token y adjuntarlo a la request
            // Esto es crucial para que el siguiente middleware (authorize) funcione
            req.user = await User.findById(decoded.id);

            if (!req.user) {
                return res.status(401).json({ message: 'No autorizado, usuario no encontrado' });
            }

            next(); // Continuar a la siguiente función
        } catch (error) {
            console.error('Error de autenticación:', error.message);
            return res.status(401).json({ message: 'No autorizado, token inválido' });
        }
    }

    if (!token) {
        return res.status(401).json({ message: 'No autorizado, no se proporcionó un token' });
    }
};

/**
 * Middleware para autorizar por rol.
 * Debe usarse DESPUÉS del middleware 'protect'.
 * @param  {...string} roles - Lista de roles permitidos (ej. 'admin', 'artista')
 */
exports.authorize = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({ message: `Acceso denegado. El rol '${req.user.role}' no tiene permiso.` });
        }
        next();
    };
};