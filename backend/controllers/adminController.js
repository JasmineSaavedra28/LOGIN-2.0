const pool = require('../config/database');

class AdminController {
    static async getAuditLogs(req, res) {
        try {
            const connection = await pool.getConnection();
            
            // Parámetros de paginación y filtros
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 50;
            const offset = (page - 1) * limit;
            
            let query = `
                SELECT al.*, u.name as user_name, u.email as user_email
                FROM audit_log al
                LEFT JOIN usuarios u ON al.user_id = u.id
                ORDER BY al.timestamp DESC
                LIMIT ? OFFSET ?
            `;
            
            const [logs] = await connection.execute(query, [limit, offset]);
            
            // Obtener total de registros
            const [countResult] = await connection.execute('SELECT COUNT(*) as total FROM audit_log');
            const total = countResult[0].total;
            
            connection.release();
            
            res.status(200).json({
                logs,
                pagination: {
                    page,
                    limit,
                    total,
                    pages: Math.ceil(total / limit)
                }
            });
        } catch (error) {
            console.error('Error obteniendo logs de auditoría:', error);
            res.status(500).json({
                message: 'Error obteniendo logs de auditoría'
            });
        }
    }

    static async getAuditLogById(req, res) {
        try {
            const { id } = req.params;
            const connection = await pool.getConnection();
            
            const [logs] = await connection.execute(
                `SELECT al.*, u.name as user_name, u.email as user_email
                 FROM audit_log al
                 LEFT JOIN usuarios u ON al.user_id = u.id
                 WHERE al.id = ?`,
                [id]
            );
            
            connection.release();
            
            if (logs.length === 0) {
                return res.status(404).json({
                    message: 'Log no encontrado'
                });
            }
            
            res.status(200).json(logs[0]);
        } catch (error) {
            console.error('Error obteniendo log específico:', error);
            res.status(500).json({
                message: 'Error obteniendo log'
            });
        }
    }

    static async getStatistics(req, res) {
        try {
            const connection = await pool.getConnection();
            
            // Estadísticas de usuarios
            const [userStats] = await connection.execute('SELECT COUNT(*) as total FROM usuarios');
            
            // Logins de hoy
            const [loginStats] = await connection.execute(`
                SELECT COUNT(*) as logins_today 
                FROM audit_log 
                WHERE action = 'USER_LOGIN' 
                AND DATE(timestamp) = CURDATE()
            `);
            
            // Registros de hoy
            const [registerStats] = await connection.execute(`
                SELECT COUNT(*) as registrations_today 
                FROM audit_log 
                WHERE action = 'USER_REGISTER' 
                AND DATE(timestamp) = CURDATE()
            `);
            
            // Total de acciones
            const [actionStats] = await connection.execute('SELECT COUNT(*) as total_actions FROM audit_log');
            
            // Acciones por tipo
            const [actionTypes] = await connection.execute(`
                SELECT action, COUNT(*) as count 
                FROM audit_log 
                GROUP BY action 
                ORDER BY count DESC
            `);
            
            connection.release();
            
            res.status(200).json({
                totalUsers: userStats[0].total,
                loginsToday: loginStats[0].logins_today,
                registrationsToday: registerStats[0].registrations_today,
                totalActions: actionStats[0].total_actions,
                actionTypes
            });
        } catch (error) {
            console.error('Error obteniendo estadísticas:', error);
            res.status(500).json({
                message: 'Error obteniendo estadísticas'
            });
        }
    }

    static async exportAuditLogs(req, res) {
        try {
            const connection = await pool.getConnection();
            
            const [logs] = await connection.execute(`
                SELECT al.*, u.name as user_name, u.email as user_email
                FROM audit_log al
                LEFT JOIN usuarios u ON al.user_id = u.id
                ORDER BY al.timestamp DESC
            `);
            
            connection.release();
            
            // Configurar headers para descarga de CSV
            res.setHeader('Content-Type', 'text/csv');
            res.setHeader('Content-Disposition', `attachment; filename=audit-logs-${new Date().toISOString().split('T')[0]}.csv`);
            
            // Crear CSV
            const csvHeaders = 'ID,Fecha,Usuario,Email,Acción,IP,Detalles\n';
            const csvRows = logs.map(log => {
                const details = log.details ? JSON.stringify(log.details).replace(/"/g, '""') : '';
                return `${log.id},"${new Date(log.timestamp).toISOString()}","${log.user_name || 'N/A'}","${log.user_email || 'N/A'}","${log.action}","${log.ip_address}","${details}"`;
            }).join('\n');
            
            res.send(csvHeaders + csvRows);
        } catch (error) {
            console.error('Error exportando logs:', error);
            res.status(500).json({
                message: 'Error exportando logs'
            });
        }
    }

    static async searchAuditLogs(req, res) {
        try {
            const { q, action, date } = req.query;
            const connection = await pool.getConnection();
            
            let query = `
                SELECT al.*, u.name as user_name, u.email as user_email
                FROM audit_log al
                LEFT JOIN usuarios u ON al.user_id = u.id
                WHERE 1=1
            `;
            const params = [];
            
            // Filtro de búsqueda
            if (q) {
                query += ` AND (u.name LIKE ? OR u.email LIKE ? OR al.action LIKE ? OR al.ip_address LIKE ?)`;
                const searchTerm = `%${q}%`;
                params.push(searchTerm, searchTerm, searchTerm, searchTerm);
            }
            
            // Filtro por acción
            if (action) {
                query += ` AND al.action = ?`;
                params.push(action);
            }
            
            // Filtro por fecha
            if (date) {
                query += ` AND DATE(al.timestamp) = ?`;
                params.push(date);
            }
            
            query += ` ORDER BY al.timestamp DESC LIMIT 100`;
            
            const [logs] = await connection.execute(query, params);
            connection.release();
            
            res.status(200).json({ logs });
        } catch (error) {
            console.error('Error buscando logs:', error);
            res.status(500).json({
                message: 'Error buscando logs'
            });
        }
    }
}

module.exports = AdminController; 