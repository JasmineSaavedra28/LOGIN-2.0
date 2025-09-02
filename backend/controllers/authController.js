const User = require('../models/User');
const { generateToken } = require('../config/auth');
const { logAction } = require('../middleware/logger');

class AuthController {
    static async register(req, res) {
        try {
            const { name, email, password, role } = req.body;
            
            const user = await User.create({ name, email, password, role });
            
            // Log de la acción
            await logAction(null, 'USER_REGISTER', {
                email: user.email,
                role: user.role
            }, req.ip);

            res.status(201).json({
                message: 'Usuario registrado exitosamente',
                user: {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    role: user.role
                }
            });
        } catch (error) {
            console.error('Error en registro:', error);
            res.status(400).json({
                message: error.message || 'Error en el registro'
            });
        }
    }

    static async login(req, res) {
        try {
            const { email, password } = req.body;
            
            // Buscar usuario
            const user = await User.findByEmail(email);
            if (!user) {
                return res.status(400).json({
                    message: 'Credenciales inválidas'
                });
            }

            // Verificar contraseña
            const isValidPassword = await User.verifyPassword(user, password);
            if (!isValidPassword) {
                return res.status(400).json({
                    message: 'Credenciales inválidas'
                });
            }

            // Actualizar último login
            await User.updateLastLogin(user.id);

            // Generar token
            const token = generateToken({
                userId: user.id,
                role: user.role
            });

            // Log de la acción
            await logAction(user.id, 'USER_LOGIN', {
                email: user.email,
                role: user.role
            }, req.ip);

            res.status(200).json({
                message: 'Inicio de sesión exitoso',
                token,
                user: {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    role: user.role
                }
            });
        } catch (error) {
            console.error('Error en login:', error);
            res.status(500).json({
                message: 'Error en el servidor'
            });
        }
    }

    static async getProfile(req, res) {
        try {
            const user = await User.findById(req.user.userId);
            if (!user) {
                return res.status(404).json({
                    message: 'Usuario no encontrado'
                });
            }

            res.status(200).json({
                user: {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                    createdAt: user.created_at
                }
            });
        } catch (error) {
            console.error('Error obteniendo perfil:', error);
            res.status(500).json({
                message: 'Error en el servidor'
            });
        }
    }
}

module.exports = AuthController; 