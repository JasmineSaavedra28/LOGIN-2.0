const pool = require('../config/database');

const logAction = async (userId, action, details, ipAddress) => {
    try {
        const connection = await pool.getConnection();
        await connection.execute(
            'INSERT INTO audit_log (user_id, action, details, ip_address, timestamp) VALUES (?, ?, ?, ?, NOW())',
            [userId, action, JSON.stringify(details), ipAddress]
        );
        connection.release();
    } catch (error) {
        console.error('Error logging action:', error);
    }
};

const auditMiddleware = (action) => {
    return async (req, res, next) => {
        const originalSend = res.send;
        
        res.send = function(data) {
            // Log después de que se complete la acción
            if (res.statusCode >= 200 && res.statusCode < 300) {
                const userId = req.user ? req.user.userId : null;
                const ipAddress = req.ip || req.connection.remoteAddress;
                const details = {
                    method: req.method,
                    path: req.path,
                    body: req.body,
                    response: data
                };
                
                logAction(userId, action, details, ipAddress);
            }
            
            originalSend.call(this, data);
        };
        
        next();
    };
};

module.exports = {
    logAction,
    auditMiddleware
}; 