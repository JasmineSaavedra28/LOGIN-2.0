const mysql = require('mysql2/promise');

const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    // Para UniServer, el usuario por defecto es 'root' y la contraseña suele estar vacía.
    // Usamos estos valores como respaldo si no se especifican en el archivo .env.
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '', // Si has puesto una contraseña en MySQL, cámbiala aquí o en .env
    database: process.env.DB_NAME || 'musicalendaria',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
};

// Crear pool de conexiones para mejor rendimiento
const pool = mysql.createPool(dbConfig);

module.exports = pool; 