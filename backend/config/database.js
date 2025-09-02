const mysql = require('mysql2/promise');

const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER, // Es mejor que las credenciales no tengan un valor por defecto
    password: process.env.DB_PASSWORD, // La contraseña debe venir siempre del archivo .env
    database: process.env.DB_NAME || 'musicalendaria',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
};

// Crear pool de conexiones para mejor rendimiento
const pool = mysql.createPool(dbConfig);

module.exports = pool; 