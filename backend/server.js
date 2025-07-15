// Importamos las bibliotecas necesarias
const express = require('express');
const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');

// Inicializamos la aplicación de Express
const app = express();

// Middlewares para manejar JSON y permitir CORS (para conectar frontend y backend)
app.use(express.json());
app.use(cors());

// Configuración de la conexión a MySQL
const dbConfig = {
    host: 'localhost',
    user: 'root',
    password: '2869', // Contraseña proporcionada por el usuario
    database: 'musicalendaria'
};

// Ruta de registro (POST): aquí los usuarios se registran
app.post('/register', async (req, res) => {
    const { name, email, password, role } = req.body;
    try {
        const connection = await mysql.createConnection(dbConfig);
        // Validamos si el usuario ya está registrado
        const [rows] = await connection.execute('SELECT * FROM usuarios WHERE email = ?', [email]);
        if (rows.length > 0) {
            await connection.end();
            return res.status(400).json({ message: 'El usuario ya está registrado' });
        }
        // Encriptamos la contraseña
        const hashedPassword = await bcrypt.hash(password, 10);
        // Insertamos el nuevo usuario
        await connection.execute(
            'INSERT INTO usuarios (name, email, password, role) VALUES (?, ?, ?, ?)',
            [name, email, hashedPassword, role || 'artista']
        );
        await connection.end();
        res.status(201).json({ message: 'Usuario registrado exitosamente' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error en el servidor' });
    }
});

// Ruta de login (POST): aquí los usuarios inician sesión
app.post('/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const connection = await mysql.createConnection(dbConfig);
        // Verificamos si el usuario existe
        const [rows] = await connection.execute('SELECT * FROM usuarios WHERE email = ?', [email]);
        if (rows.length === 0) {
            await connection.end();
            return res.status(400).json({ message: 'Usuario no encontrado' });
        }
        const user = rows[0];
        // Comparamos la contraseña encriptada
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            await connection.end();
            return res.status(400).json({ message: 'Contraseña incorrecta' });
        }
        // Generamos un token JWT
        const token = jwt.sign({ userId: user.id, role: user.role }, 'mi_secreto', { expiresIn: '1h' });
        await connection.end();
        res.status(200).json({ token, message: 'Inicio de sesión exitoso', role: user.role });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error en el servidor' });
    }
});

// Inicializamos el servidor en el puerto 5000
app.listen(5000, () => console.log('Servidor escuchando en el puerto 5000'));
