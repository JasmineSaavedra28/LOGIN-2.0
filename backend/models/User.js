const pool = require('../config/database');
const bcrypt = require('bcryptjs');

class User {
    static async findByEmail(email) {
        try {
            const connection = await pool.getConnection();
            const [rows] = await connection.execute(
                'SELECT * FROM usuarios WHERE email = ?',
                [email]
            );
            connection.release();
            return rows[0] || null;
        } catch (error) {
            throw new Error('Error al buscar usuario por email');
        }
    }

    static async findById(id) {
        try {
            const connection = await pool.getConnection();
            const [rows] = await connection.execute(
                'SELECT id, name, email, role, created_at FROM usuarios WHERE id = ?',
                [id]
            );
            connection.release();
            return rows[0] || null;
        } catch (error) {
            throw new Error('Error al buscar usuario por ID');
        }
    }

    static async create(userData) {
        try {
            const { name, email, password, role = 'artista' } = userData;
            
            // VALIDACIÓN DE NOMBRES PROHIBIDOS - Requerimiento específico del proyecto
            const forbiddenNames = ['Eminem', 'Dua Lipa', 'Catriel', 'Paco Amoroso'];
            const normalizedName = name.trim().toLowerCase();
            const forbiddenNormalized = forbiddenNames.map(n => n.toLowerCase());
            
            if (forbiddenNormalized.includes(normalizedName)) {
                throw new Error('Este nombre de artista no está permitido');
            }

            // Verificar si el usuario ya existe
            const existingUser = await this.findByEmail(email);
            if (existingUser) {
                throw new Error('El usuario ya está registrado');
            }

            // Encriptar contraseña
            const hashedPassword = await bcrypt.hash(password, 12);

            const connection = await pool.getConnection();
            const [result] = await connection.execute(
                'INSERT INTO usuarios (name, email, password, role) VALUES (?, ?, ?, ?)',
                [name, email, hashedPassword, role]
            );
            connection.release();

            return {
                id: result.insertId,
                name,
                email,
                role
            };
        } catch (error) {
            throw error;
        }
    }

    static async verifyPassword(user, password) {
        return await bcrypt.compare(password, user.password);
    }

    static async updateLastLogin(userId) {
        try {
            const connection = await pool.getConnection();
            await connection.execute(
                'UPDATE usuarios SET last_login = NOW() WHERE id = ?',
                [userId]
            );
            connection.release();
        } catch (error) {
            console.error('Error actualizando último login:', error);
        }
    }
}

module.exports = User; 