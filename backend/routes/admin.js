const express = require('express');
const router = express.Router();
const AdminController = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/auth');
const { auditMiddleware } = require('../middleware/logger');

// Todas las rutas de administración requieren autenticación y rol de admin
router.use(protect);
router.use(authorize('admin'));

// Obtener logs de auditoría
router.get('/audit-logs', 
    auditMiddleware('GET_AUDIT_LOGS'),
    AdminController.getAuditLogs
);

// Obtener log específico por ID
router.get('/audit-logs/:id', 
    auditMiddleware('GET_AUDIT_LOG_BY_ID'),
    AdminController.getAuditLogById
);

// Buscar logs de auditoría
router.get('/audit-logs/search', 
    auditMiddleware('SEARCH_AUDIT_LOGS'),
    AdminController.searchAuditLogs
);

// Exportar logs de auditoría
router.get('/audit-logs/export', 
    auditMiddleware('EXPORT_AUDIT_LOGS'),
    AdminController.exportAuditLogs
);

// Obtener estadísticas del sistema
router.get('/statistics', 
    auditMiddleware('GET_STATISTICS'),
    AdminController.getStatistics
);

module.exports = router; 