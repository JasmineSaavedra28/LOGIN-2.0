// Script para el panel de administración
class AdminPanel {
    constructor() {
        this.apiService = apiService;
        this.init();
    }

    async init() {
        // Verificar autenticación y autorización
        if (!this.apiService.isAuthenticated()) {
            window.location.href = 'index.html';
            return;
        }

        const role = sessionStorage.getItem('role');
        if (role !== 'admin') {
            alert('Acceso denegado. Solo administradores pueden acceder a este panel.');
            window.location.href = 'panel_artista.html';
            return;
        }

        // Cargar datos del panel
        await this.loadDashboard();
        this.setupEventListeners();
    }

    async loadDashboard() {
        try {
            // Cargar logs de auditoría
            await this.loadAuditLogs();
            
            // Cargar estadísticas
            await this.loadStatistics();
            
        } catch (error) {
            console.error('Error cargando dashboard:', error);
            this.showMessage('Error cargando datos del panel', 'error');
        }
    }

    async loadAuditLogs() {
        try {
            const logs = await this.apiService.makeRequest('/admin/audit-logs');
            this.displayAuditLogs(logs);
        } catch (error) {
            console.error('Error cargando logs:', error);
        }
    }

    async loadStatistics() {
        try {
            const stats = await this.apiService.makeRequest('/admin/statistics');
            this.displayStatistics(stats);
        } catch (error) {
            console.error('Error cargando estadísticas:', error);
        }
    }

    displayAuditLogs(logs) {
        const container = document.getElementById('auditLogs');
        if (!container) return;

        // Limpiar contenedor
        container.innerHTML = '';

        if (!logs || logs.length === 0) {
            container.innerHTML = '<p>No hay logs de auditoría disponibles</p>';
            return;
        }

        // Crear tabla de logs
        const table = document.createElement('table');
        table.className = 'audit-table';
        
        // Encabezados
        const thead = document.createElement('thead');
        thead.innerHTML = `
            <tr>
                <th>Fecha</th>
                <th>Usuario</th>
                <th>Acción</th>
                <th>IP</th>
                <th>Detalles</th>
            </tr>
        `;
        table.appendChild(thead);

        // Cuerpo de la tabla
        const tbody = document.createElement('tbody');
        logs.forEach(log => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${new Date(log.timestamp).toLocaleString()}</td>
                <td>${log.user_id || 'N/A'}</td>
                <td>${this.sanitizeText(log.action)}</td>
                <td>${this.sanitizeText(log.ip_address)}</td>
                <td>
                    <button onclick="adminPanel.showLogDetails('${log.id}')" class="btn-details">
                        Ver detalles
                    </button>
                </td>
            `;
            tbody.appendChild(row);
        });
        table.appendChild(tbody);
        container.appendChild(table);
    }

    displayStatistics(stats) {
        const container = document.getElementById('statistics');
        if (!container) return;

        container.innerHTML = `
            <div class="stats-grid">
                <div class="stat-card">
                    <h3>Usuarios Totales</h3>
                    <p class="stat-number">${stats.totalUsers || 0}</p>
                </div>
                <div class="stat-card">
                    <h3>Logins Hoy</h3>
                    <p class="stat-number">${stats.loginsToday || 0}</p>
                </div>
                <div class="stat-card">
                    <h3>Registros Hoy</h3>
                    <p class="stat-number">${stats.registrationsToday || 0}</p>
                </div>
                <div class="stat-card">
                    <h3>Acciones Registradas</h3>
                    <p class="stat-number">${stats.totalActions || 0}</p>
                </div>
            </div>
        `;
    }

    async showLogDetails(logId) {
        try {
            const log = await this.apiService.makeRequest(`/admin/audit-logs/${logId}`);
            
            const details = log.details ? JSON.parse(log.details) : {};
            const detailsHtml = Object.entries(details)
                .map(([key, value]) => `<strong>${this.sanitizeText(key)}:</strong> ${this.sanitizeText(JSON.stringify(value))}`)
                .join('<br>');

            const modal = document.createElement('div');
            modal.className = 'modal';
            modal.innerHTML = `
                <div class="modal-content">
                    <span class="close">&times;</span>
                    <h2>Detalles del Log</h2>
                    <p><strong>ID:</strong> ${log.id}</p>
                    <p><strong>Fecha:</strong> ${new Date(log.timestamp).toLocaleString()}</p>
                    <p><strong>Usuario:</strong> ${log.user_id || 'N/A'}</p>
                    <p><strong>Acción:</strong> ${this.sanitizeText(log.action)}</p>
                    <p><strong>IP:</strong> ${this.sanitizeText(log.ip_address)}</p>
                    <div class="log-details">
                        <h3>Detalles:</h3>
                        <div>${detailsHtml}</div>
                    </div>
                </div>
            `;

            document.body.appendChild(modal);

            // Cerrar modal
            const closeBtn = modal.querySelector('.close');
            closeBtn.onclick = () => modal.remove();
            modal.onclick = (e) => {
                if (e.target === modal) modal.remove();
            };
        } catch (error) {
            console.error('Error mostrando detalles:', error);
            alert('Error cargando detalles del log');
        }
    }

    sanitizeText(text) {
        if (!text) return '';
        return text.toString()
            .replace(/[<>]/g, '')
            .replace(/javascript:/gi, '')
            .replace(/on\w+=/gi, '');
    }

    showMessage(message, type = 'info') {
        const messageDiv = document.getElementById('message');
        if (messageDiv) {
            messageDiv.textContent = message;
            messageDiv.className = `message ${type}`;
            messageDiv.style.display = 'block';
        }
    }

    setupEventListeners() {
        // Botón de cerrar sesión
        const logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => {
                this.apiService.logout();
            });
        }

        // Botón de refrescar logs
        const refreshBtn = document.getElementById('refreshLogs');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', () => {
                this.loadAuditLogs();
            });
        }

        // Botón de exportar logs
        const exportBtn = document.getElementById('exportLogs');
        if (exportBtn) {
            exportBtn.addEventListener('click', () => {
                this.exportLogs();
            });
        }
    }

    async exportLogs() {
        try {
            const logs = await this.apiService.makeRequest('/admin/audit-logs/export');
            
            // Crear archivo CSV
            const csvContent = this.convertToCSV(logs);
            const blob = new Blob([csvContent], { type: 'text/csv' });
            const url = window.URL.createObjectURL(blob);
            
            const a = document.createElement('a');
            a.href = url;
            a.download = `audit-logs-${new Date().toISOString().split('T')[0]}.csv`;
            a.click();
            
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Error exportando logs:', error);
            alert('Error exportando logs');
        }
    }

    convertToCSV(logs) {
        const headers = ['ID', 'Fecha', 'Usuario', 'Acción', 'IP', 'Detalles'];
        const csvRows = [headers.join(',')];
        
        logs.forEach(log => {
            const details = log.details ? JSON.stringify(log.details).replace(/"/g, '""') : '';
            const row = [
                log.id,
                new Date(log.timestamp).toISOString(),
                log.user_id || 'N/A',
                log.action,
                log.ip_address,
                `"${details}"`
            ];
            csvRows.push(row.join(','));
        });
        
        return csvRows.join('\n');
    }
}

// Inicializar panel de administración
const adminPanel = new AdminPanel(); 