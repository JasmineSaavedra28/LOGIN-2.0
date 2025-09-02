const mysql = require('mysql2/promise');

const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '', // Contraseña vacía para UniServer
    database: process.env.DB_NAME || 'musicalendaria',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
};

// Crear pool de conexiones para mejor rendimiento
const pool = mysql.createPool(dbConfig);

module.exports = pool; 